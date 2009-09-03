// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2009 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Pion is free software: you can redistribute it and/or modify it under the
// terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option)
// any later version.
//
// Pion is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
// more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Pion.  If not, see <http://www.gnu.org/licenses/>.
//

// NOTE: According to API docs, Python.h must be #include'd FIRST
#include <Python.h>
#include <sstream>
#include <fstream>
#include <boost/filesystem/operations.hpp>
#include <pion/platform/ConfigManager.hpp>
#include "PythonReactor.hpp"


// Python callback functions
extern "C" {
	static PyObject* pion_ret10(PyObject *self, PyObject *args)
	{
		return Py_BuildValue("i", 10);
	}
	
	static PyMethodDef PionPythonCallbackMethods[] = {
		{"ret10", pion_ret10, METH_VARARGS,
		"Return the number ten."},
		{NULL, NULL, 0, NULL}
	};
}


using namespace std;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of PythonReactor
	
const string			PythonReactor::PYTHON_MODULE_NAME = "pion";
const string			PythonReactor::PROCESS_FUNCTION_NAME = "process";
const string			PythonReactor::FILENAME_ELEMENT_NAME = "Filename";
const string			PythonReactor::PYTHON_SOURCE_ELEMENT_NAME = "PythonSource";
boost::mutex			PythonReactor::m_init_mutex;
boost::uint32_t			PythonReactor::m_init_num = 0;
PyInterpreterState *	PythonReactor::m_interp_ptr = NULL;
boost::thread_specific_ptr<PyThreadState> *		PythonReactor::m_state_ptr = NULL;


// PythonReactor member functions

PythonReactor::PythonReactor(void)
	: Reactor(TYPE_PROCESSING),
	m_logger(PION_GET_LOGGER("pion.PythonReactor")),
	m_byte_code(NULL), m_module(NULL), m_process_func(NULL)
{
	boost::mutex::scoped_lock init_lock(m_init_mutex);
	if (++m_init_num == 1) {
		PION_LOG_DEBUG(m_logger, "Initializing Python interpreter");
		// initialize the thread specific state pointers
		m_state_ptr = new boost::thread_specific_ptr<PyThreadState>(&PythonReactor::releaseThreadState);
		// initialize python interpreter
		Py_Initialize();
		// setup module callback functions
		Py_InitModule("pion", PionPythonCallbackMethods);
		// initialize thread support
		PyEval_InitThreads();
		// get a pointer to the global Python interpreter
		PyThreadState *thr_state_ptr = PyThreadState_Get();
		m_interp_ptr = thr_state_ptr->interp;
		PION_ASSERT(m_interp_ptr);
		// release the global lock (GIL) since PyEval_InitThreads() acquires it
		PyEval_ReleaseThread(thr_state_ptr);
		// keep track of the thread since it's been initialized inside Python
		m_state_ptr->reset(thr_state_ptr);
	}
}
	
PythonReactor::~PythonReactor()
{
	stop();

	{
		// free the compiled byte code (if any)
		ConfigWriteLock cfg_lock(*this);
		PythonLock py_lock;
		resetPythonSymbols();
	}

	boost::mutex::scoped_lock init_lock(m_init_mutex);
	if (--m_init_num == 0) {
		PION_LOG_DEBUG(m_logger, "Releasing Python thread states");
		delete m_state_ptr;
		m_state_ptr = NULL;
		m_interp_ptr = NULL;

		PION_LOG_DEBUG(m_logger, "Shutting down Python interpreter");
		// TODO: this causes the Python interpreter to crash; WHY???
//		Py_Finalize();
	}
}

void PythonReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	ConfigWriteLock cfg_lock(*this);
	Reactor::setConfig(v, config_ptr);
	
	// get string containing source code to execute (optional)
	m_source.clear();
	ConfigManager::getConfigOption(PYTHON_SOURCE_ELEMENT_NAME, m_source, config_ptr);

	// get string containing name of the source code file to execute (optional)
	m_source_file.clear();
	if (ConfigManager::getConfigOption(FILENAME_ELEMENT_NAME, m_source_file, config_ptr)) {
		PION_LOG_DEBUG(m_logger, "Loading Python source code from: " << m_source_file);
		m_source = getSourceCodeFromFile();
	}

	// make sure the thread has been initialized and acquire the GIL lock
	PythonLock py_lock;

	// pre-compile the python source code to check for errors early
	compilePythonSource();
	
	// if running, re-initialize the Python module
	if (isRunning())
		initPythonModule();
}

void PythonReactor::start(void)
{
	ConfigWriteLock cfg_lock(*this);
	if (! m_is_running) {
		PION_LOG_DEBUG(m_logger, "Starting reactor: " << getId());

		// make sure the thread has been initialized and acquire the GIL lock
		PythonLock py_lock;

		if (! m_source_file.empty()) {
			// make sure that the source code has not changed since last read
			string src_code = getSourceCodeFromFile();
			if (src_code != m_source) {
				PION_LOG_DEBUG(m_logger, "Reloading Python source code from: " << m_source_file);
				compilePythonSource();
			}
		}
		initPythonModule();
		m_is_running = true;
	}
}

void PythonReactor::stop(void)
{
	ConfigWriteLock cfg_lock(*this);
	if (m_is_running) {
		PION_LOG_DEBUG(m_logger, "Stopping reactor: " << getId());

		// make sure the thread has been initialized and acquire the GIL lock
		PythonLock py_lock;

		// release process function pointer and imported source code module
		Py_XDECREF(m_process_func);
		Py_XDECREF(m_module);
		//Py_XDECREF(m_byte_code);	// leave this alone so that re-start() works without source change
		m_process_func = m_module = NULL;

		m_is_running = false;
	}
}

void PythonReactor::process(const EventPtr& e)
{
	if (m_process_func) {
	
		// make sure the thread has been initialized and acquire the GIL lock
		PythonLock py_lock;

		// generate a dict object to use as a parameter for the process() function
		PyObject *python_dict = PyDict_New();
		if (! python_dict)
			throw InternalPythonException(getId());
		// TODO: populate the dict object with data from the source event

		// build argument list to process() function
		// it takes only one argument, which is a dict type
		PyObject *python_args = PyTuple_New(1);
		if (! python_args) {
			Py_DECREF(python_dict);
			throw InternalPythonException(getId());
		}
		PyTuple_SetItem(python_args, 0, python_dict);	// note: python_dict reference is stolen here

		// call the process() function, passing the dict as an argument
		PION_LOG_DEBUG(m_logger, "Calling process() function");
		PyObject *retval = PyObject_CallObject(m_process_func, python_args);
		
		// check for uncaught runtime exceptions
		if (retval == NULL && PyErr_Occurred()) {
			Py_DECREF(python_args);
			throw PythonRuntimeException(getPythonError());
		}
		
		// TODO: use the object returned for delivery to other reactors???

		Py_DECREF(python_args);
		Py_XDECREF(retval);
	}
	
	deliverEvent(e);
}

PyThreadState *PythonReactor::initThreadState(void)
{
	// check if the thread's state has already been initialized with Python
	PyThreadState *thr_state_ptr = m_state_ptr->get();
	if (thr_state_ptr == NULL) {
		// the thread's state has not yet been initialized with Python
		thr_state_ptr = PyThreadState_New(m_interp_ptr);
		m_state_ptr->reset(thr_state_ptr);
	}
	return thr_state_ptr;
}

void PythonReactor::releaseThreadState(PyThreadState *ptr)
{
	// TODO: is having a thread instance created necessary for this call?
	PyThreadState_Clear(ptr);
	PyThreadState_Delete(ptr);
}
	
void PythonReactor::resetPythonSymbols(void)
{
	// assumes ConfigWriteLock and PythonLock
	PION_LOG_DEBUG(m_logger, "Resetting Python symbols");
	Py_XDECREF(m_process_func);
	Py_XDECREF(m_module);
	Py_XDECREF(m_byte_code);
	m_process_func = m_module = m_byte_code = NULL;
}

void PythonReactor::compilePythonSource(void)
{
	// assumes ConfigWriteLock and PythonLock

	// free the compiled byte code (if any)
	resetPythonSymbols();

	if (! m_source.empty()) {
		// compile source code into byte code
		PION_LOG_DEBUG(m_logger, "Compiling Python source code");
		m_byte_code = Py_CompileString(m_source.c_str(), m_source_file.c_str(), Py_file_input);
		if (m_byte_code == NULL)
			throw FailedToCompileException(getPythonError());
	}
}

void PythonReactor::initPythonModule(void)
{
	// assumes ConfigWriteLock and PythonLock

	if (m_byte_code) {
		PION_LOG_DEBUG(m_logger, "Initializing Python module");
		// note: Python API calls for "char*" but never will modify it (API design bug work-around)
		m_module = PyImport_ExecCodeModule(const_cast<char*>(PYTHON_MODULE_NAME.c_str()), m_byte_code);
		if (m_module == NULL) {
			Py_DECREF(m_byte_code);
			m_byte_code = NULL;
			throw FailedToCompileException(getPythonError());
		}
	
		// find process() function in Python module
		m_process_func = PyObject_GetAttrString(m_module, PROCESS_FUNCTION_NAME.c_str());
		if (m_process_func) {
			if (! PyCallable_Check(m_process_func))
				throw NotCallableException(PROCESS_FUNCTION_NAME);
			PION_LOG_DEBUG(m_logger, "Found process() function");
		} else {
			PyErr_Clear();
			PION_LOG_WARN(m_logger, "Unable to find process() function");
		}
	}
}

std::string PythonReactor::getSourceCodeFromFile(void)
{
	// find and confirm existance of source code file
	string src_file = getReactionEngine().resolveRelativePath(m_source_file);
	if (! boost::filesystem::exists(src_file) )
		throw SourceFileNotFoundException(m_source_file);
	
	// open source code file
	ifstream src_stream(src_file.c_str(), ios::in);
	if (! src_stream.is_open())
		throw ReadSourceFileException(m_source_file);

	// read file contents into a buffer
	ostringstream str_stream;
	try {
		str_stream << src_stream.rdbuf();
		src_stream.close();
	} catch (...) {
		throw ReadSourceFileException(m_source_file);
	}

	return str_stream.str();
}

std::string PythonReactor::getPythonError(void)
{
	// assumes PythonLock
	PyObject *ptype = NULL;
	PyObject *pvalue = NULL;
	PyObject *ptraceback = NULL;
	PyErr_Fetch(&ptype, &pvalue, &ptraceback);
	std::string error_str;
	if (pvalue) {
		PyObject *pstr = PyObject_Str(pvalue);
		if (pstr) {
			char *cptr = PyString_AsString(pstr);
			if (cptr)
				error_str = cptr;
			Py_DECREF(pstr);
		}
	}
	Py_XDECREF(ptype);
	Py_XDECREF(pvalue);
	Py_XDECREF(ptraceback);
	return error_str;
}

	
}	// end namespace plugins
}	// end namespace pion


/// creates new PythonReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_PythonReactor(void) {
	return new pion::plugins::PythonReactor();
}

/// destroys PythonReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_PythonReactor(pion::plugins::PythonReactor *reactor_ptr) {
	delete reactor_ptr;
}
