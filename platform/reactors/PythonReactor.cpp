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
#include "structmember.h"
#include "datetime.h"
#include <sstream>
#include <fstream>
#include <boost/filesystem/operations.hpp>
#include <pion/platform/ConfigManager.hpp>
#include "PythonReactor.hpp"


using namespace std;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// Define the Reactor and Event classes and callback functions for the pion Python module
// see http://docs.python.org/extending/newtypes.html

typedef struct {
	PyObject_HEAD
	PyObject *		id;
	PyObject *		name;
	PythonReactor *	__this;
} PythonReactorObject;

static void
Reactor_dealloc(PythonReactorObject* self)
{
	Py_XDECREF(self->id);
	Py_XDECREF(self->name);
	self->ob_type->tp_free((PyObject*)self);
}

static PyObject *
Reactor_new(PyTypeObject *type, PyObject *args, PyObject *kwds)
{
    PythonReactorObject *self;
	self = (PythonReactorObject *)type->tp_alloc(type, 0);
	if (self != NULL) {
		self->id = PyString_FromString("");
		if (self->id == NULL) {
			Py_DECREF(self);
			return NULL;
		}

		self->name = PyString_FromString("");
		if (self->name == NULL) {
			Py_DECREF(self);
			return NULL;
		}

		self->__this = NULL;
	}
	return (PyObject *)self;
}

static int
Reactor_init(PythonReactorObject *self, PyObject *args, PyObject *kwds)
{
	PyObject *id=NULL, *name=NULL, *tmp;

	static char *kwlist[] = {(char*)"id", (char*)"name", NULL};

	if (! PyArg_ParseTupleAndKeywords(args, kwds, "|OO", kwlist, &id, &name))
		return -1; 

	if (id) {
		tmp = self->id;
		Py_INCREF(id);
		self->id = id;
		Py_XDECREF(tmp);
	}

	if (name) {
		tmp = self->name;
		Py_INCREF(name);
		self->name = name;
		Py_XDECREF(tmp);
	}

	return 0;
}

static PyMemberDef Reactor_members[] = {
    {(char*)"id", T_OBJECT_EX, offsetof(PythonReactorObject, id), 0,
     (char*)"unique identifier of the PythonReactor"},
    {(char*)"name", T_OBJECT_EX, offsetof(PythonReactorObject, name), 0,
     (char*)"name assigned to the PythonReactor"},
    {NULL}  /* Sentinel */
};

static PyObject* Reactor_deliver(PythonReactorObject *self, PyObject *args)
{
	// check that callback parameter is a dictionary
	PyObject *event_ptr;
	if (! PyArg_ParseTuple(args, "O:event_object", &event_ptr)) {
		PyErr_SetString(PyExc_TypeError, "missing required parameter");
		return NULL;
	}
	if (! PyDict_Check(event_ptr)) {
		PyErr_SetString(PyExc_TypeError, "parameter must be a dictionary");
		return NULL;
	}

	// deliver the event to other reactors
	PythonReactor *ptr = self->__this;
	ptr->deliverToConnections(event_ptr);

	// return "none" (OK)
	Py_INCREF(Py_None);
	return Py_None;
}

static PyMethodDef Reactor_methods[] = {
	{(char*)"deliver", (PyCFunction)Reactor_deliver, METH_VARARGS,
	(char*)"Delivers an event to the reactor's output connections."},
    {NULL}  /* Sentinel */
};

static PyTypeObject PythonReactorType = {
	PyObject_HEAD_INIT(NULL)
	0,                         /*ob_size*/
	"pion.Reactor",            /*tp_name*/
	sizeof(PythonReactorObject),     /*tp_basicsize*/
	0,                         /*tp_itemsize*/
	(destructor)Reactor_dealloc, /*tp_dealloc*/
	0,                         /*tp_print*/
	0,                         /*tp_getattr*/
	0,                         /*tp_setattr*/
	0,                         /*tp_compare*/
	0,                         /*tp_repr*/
	0,                         /*tp_as_number*/
	0,                         /*tp_as_sequence*/
	0,                         /*tp_as_mapping*/
	0,                         /*tp_hash */
	0,                         /*tp_call*/
	0,                         /*tp_str*/
	0,                         /*tp_getattro*/
	0,                         /*tp_setattro*/
	0,                         /*tp_as_buffer*/
	Py_TPFLAGS_DEFAULT | Py_TPFLAGS_BASETYPE, /*tp_flags*/
	"pion Reactor objects",    /* tp_doc */
	0,		                   /* tp_traverse */
	0,		                   /* tp_clear */
	0,		                   /* tp_richcompare */
	0,		                   /* tp_weaklistoffset */
	0,		                   /* tp_iter */
	0,		                   /* tp_iternext */
	Reactor_methods,           /* tp_methods */
	Reactor_members,           /* tp_members */
	0,                         /* tp_getset */
	0,                         /* tp_base */
	0,                         /* tp_dict */
	0,                         /* tp_descr_get */
	0,                         /* tp_descr_set */
	0,                         /* tp_dictoffset */
	(initproc)Reactor_init,    /* tp_init */
	0,                         /* tp_alloc */
	Reactor_new,               /* tp_new */
};

static PythonReactorObject *
Reactor_create(const char *id, const char *name, PythonReactor *this_ptr)
{
	PythonReactorObject *self;
	self = (PythonReactorObject *) PythonReactorType.tp_alloc(&PythonReactorType, 0);
	if (self != NULL) {
		self->id = PyString_FromString(id);
		if (self->id == NULL) {
			Py_DECREF(self);
			return NULL;
		}

		self->name = PyString_FromString(id);
		if (self->name == NULL) {
			Py_DECREF(self);
			return NULL;
		}
		self->__this = this_ptr;
	}
	return self;
}


// Python Event class

typedef struct {
	PyDictObject	d;
	PyObject *		type;
} PythonEventObject;

static void
Event_dealloc(PythonEventObject* self)
{
	Py_XDECREF(self->type);
	PyObject *obj = (PyObject*) self;
	obj->ob_type->tp_free(obj);
}

static PyObject *
Event_new(PyTypeObject *type, PyObject *args, PyObject *kwds)
{
    PythonEventObject *self;
	self = (PythonEventObject *) type->tp_base->tp_new(type, args, kwds);
	if (self != NULL) {
		self->type = PyString_FromString("");
		if (self->type == NULL) {
			Py_DECREF((PyObject*) self);
			return NULL;
		}
	}
	return (PyObject *)self;
}

static int
Event_init(PythonEventObject *self, PyObject *args, PyObject *kwds)
{
	PyObject *type=NULL, *tmp;

	static char *kwlist[] = {(char*)"type", NULL};

	if (PyDict_Type.tp_init((PyObject *)self, args, kwds) < 0)
		return -1;

	if (! PyArg_ParseTupleAndKeywords(args, kwds, "O:event_type", kwlist, &type))
		return -1; 

	tmp = self->type;
	Py_INCREF(type);
	self->type = type;
	Py_XDECREF(tmp);

	return 0;
}

static PyMemberDef Event_members[] = {
    {(char*)"type", T_OBJECT_EX, offsetof(PythonEventObject, type), 0,
     (char*)"type of Event"},
    {NULL}  /* Sentinel */
};

static PyTypeObject PythonEventType = {
	PyObject_HEAD_INIT(NULL)
	0,                         /*ob_size*/
	"pion.Event",              /*tp_name*/
	sizeof(PythonEventObject), /*tp_basicsize*/
	0,                         /*tp_itemsize*/
	(destructor)Event_dealloc, /*tp_dealloc*/
	0,                         /*tp_print*/
	0,                         /*tp_getattr*/
	0,                         /*tp_setattr*/
	0,                         /*tp_compare*/
	0,                         /*tp_repr*/
	0,                         /*tp_as_number*/
	0,                         /*tp_as_sequence*/
	0,                         /*tp_as_mapping*/
	0,                         /*tp_hash */
	0,                         /*tp_call*/
	0,                         /*tp_str*/
	0,                         /*tp_getattro*/
	0,                         /*tp_setattro*/
	0,                         /*tp_as_buffer*/
	Py_TPFLAGS_DEFAULT | Py_TPFLAGS_BASETYPE, /*tp_flags*/
	"pion Event objects",      /* tp_doc */
	0,		                   /* tp_traverse */
	0,		                   /* tp_clear */
	0,		                   /* tp_richcompare */
	0,		                   /* tp_weaklistoffset */
	0,		                   /* tp_iter */
	0,		                   /* tp_iternext */
	0,                         /* tp_methods */
	Event_members,             /* tp_members */
	0,                         /* tp_getset */
	0,                         /* tp_base */
	0,                         /* tp_dict */
	0,                         /* tp_descr_get */
	0,                         /* tp_descr_set */
	0,                         /* tp_dictoffset */
	(initproc)Event_init,      /* tp_init */
	0,                         /* tp_alloc */
	Event_new,                 /* tp_new */
};

static PythonEventObject *
Event_create(const char *type)
{
    PyObject *args = PyTuple_New(0);
    if (args == NULL)
    	return NULL;
    
    PyObject *kwds = PyDict_New();
    if (kwds == NULL) {
    	Py_DECREF(args);
    	return NULL;
    }
    
    PythonEventObject *self = (PythonEventObject*) Event_new(&PythonEventType, args, kwds);
	Py_DECREF(args);
	Py_DECREF(kwds);
	if (self != NULL) {
		self->type = PyString_FromString(type);
	}

	return self;
}

static PyMethodDef PionPythonCallbackMethods[] = {
	{NULL, NULL, 0, NULL}
};


// static members of PythonReactor
	
const string			PythonReactor::PYTHON_MODULE_NAME = "pion";
const string			PythonReactor::START_FUNCTION_NAME = "start";
const string			PythonReactor::STOP_FUNCTION_NAME = "stop";
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
	m_byte_code(NULL), m_module(NULL),
	m_start_func(NULL), m_stop_func(NULL), m_process_func(NULL),
	m_reactor_ptr(NULL), m_vocab_ptr(NULL)
{
	boost::mutex::scoped_lock init_lock(m_init_mutex);
	if (++m_init_num == 1) {
		PION_LOG_DEBUG(m_logger, "Initializing Python interpreter");
		// initialize the thread specific state pointers
		m_state_ptr = new boost::thread_specific_ptr<PyThreadState>(&PythonReactor::releaseThreadState);
		// initialize python interpreter
		Py_Initialize();
		// setup pion module: Reactor data types and callback functions
		PyObject *m = Py_InitModule("pion", PionPythonCallbackMethods);
		if (PyType_Ready(&PythonReactorType) < 0) {
			PION_LOG_ERROR(m_logger, "Error initializing Reactor data type");
		} else {
			Py_INCREF(&PythonReactorType);
			PyModule_AddObject(m, "Reactor", (PyObject*) &PythonReactorType);
		}
		// setup Event data type
		PythonEventType.tp_base = &PyDict_Type;
		if (PyType_Ready(&PythonEventType) < 0) {
			PION_LOG_ERROR(m_logger, "Error initializing Event data type");
		} else {
			Py_INCREF(&PythonEventType);
			PyModule_AddObject(m, "Event", (PyObject*) &PythonEventType);
		}
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

	// get the current thread state, acquire GIL and make it "active"
	PyThreadState *thr_state_ptr = PythonReactor::initThreadState();
	PyEval_AcquireThread(thr_state_ptr);

	try {
		// free the compiled byte code (if any)
		resetPythonSymbols();
		Py_XDECREF(m_reactor_ptr);

		boost::mutex::scoped_lock init_lock(m_init_mutex);
		if (--m_init_num == 0) {
			// there are no more PythonReactor instances left
			PION_LOG_DEBUG(m_logger, "Releasing Python thread states");

			// remove the current thread to make sure it does not get "released"
			m_state_ptr->release();

			// release data for all other registered threads
			delete m_state_ptr;
			m_state_ptr = NULL;
			m_interp_ptr = NULL;

			PION_LOG_DEBUG(m_logger, "Shutting down Python interpreter");
			Py_Finalize();	// note: this releases data for the current thread
		} else {
			PyEval_ReleaseThread(thr_state_ptr);
		}
	} catch (...) {
		PyEval_ReleaseThread(thr_state_ptr);
		throw;
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
	
	// get copy of vocabulary used to map terms to python and back
	m_vocab_ptr = &v;

	// make sure the thread has been initialized and acquire the GIL lock
	PythonLock py_lock;

	// create Reactor object to be passed to Python functions
	Py_XDECREF(m_reactor_ptr);
	m_reactor_ptr = (PyObject*) Reactor_create(getId().c_str(), getName().c_str(), this);
	if (m_reactor_ptr == NULL)
		throw InitReactorObjectException(getPythonError());

	// pre-compile the python source code to check for errors early
	compilePythonSource();
	
	// if running, re-initialize the Python module
	if (isRunning())
		initPythonModule();
}

void PythonReactor::updateVocabulary(const Vocabulary& v)
{
	ConfigWriteLock cfg_lock(*this);
	Reactor::updateVocabulary(v);
	m_vocab_ptr = &v;
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
				m_source = src_code;
				compilePythonSource();
			}
		}

		// initialize Python module code and start the reactor
		initPythonModule();
		m_is_running = true;

		if (m_start_func) {
			// execute the Python module's start() function
			PION_LOG_DEBUG(m_logger, "Calling Python start() function");
			PyObject *python_args = PyTuple_New(1);
			if (! python_args)
				throw InternalPythonException(getId());
			Py_INCREF(m_reactor_ptr);
			PyTuple_SetItem(python_args, 0, m_reactor_ptr);
			PyObject *retval = PyObject_CallObject(m_start_func, python_args);
			Py_DECREF(python_args);
		
			// check for uncaught runtime exceptions
			if (retval == NULL && PyErr_Occurred()) {
				throw PythonRuntimeException(getPythonError());
			}
		
			Py_XDECREF(retval);
		}
	}
}

void PythonReactor::stop(void)
{
	ConfigWriteLock cfg_lock(*this);
	if (m_is_running) {
		PION_LOG_DEBUG(m_logger, "Stopping reactor: " << getId());

		// make sure the thread has been initialized and acquire the GIL lock
		PythonLock py_lock;

		if (m_stop_func) {
			// execute the Python module's stop() function
			PION_LOG_DEBUG(m_logger, "Calling Python stop() function");
			PyObject *python_args = PyTuple_New(1);
			if (! python_args)
				throw InternalPythonException(getId());
			Py_INCREF(m_reactor_ptr);
			PyTuple_SetItem(python_args, 0, m_reactor_ptr);
			PyObject *retval = PyObject_CallObject(m_stop_func, python_args);
			Py_DECREF(python_args);
		
			// check for uncaught runtime exceptions
			if (retval == NULL && PyErr_Occurred()) {
				throw PythonRuntimeException(getPythonError());
			}
		
			Py_XDECREF(retval);
		}

		// release function pointers and imported source code module
		Py_XDECREF(m_start_func);
		Py_XDECREF(m_stop_func);
		Py_XDECREF(m_process_func);
		Py_XDECREF(m_module);
		//Py_XDECREF(m_byte_code);	// leave this alone so that re-start() works without source change
		m_start_func = m_stop_func = m_process_func = m_module = NULL;

		m_is_running = false;
	}
}

void PythonReactor::process(const EventPtr& e)
{
	if (m_process_func) {

		// make sure the thread has been initialized and acquire the GIL lock
		PythonLock py_lock;

		// generate a python Event object to use as a parameter for the process() function
		PyObject *py_event = NULL;
		try {
			toPythonEvent(*e, py_event);
		} catch (...) {
			if (PyErr_Occurred())
				PION_LOG_ERROR(m_logger, getPythonError());
			throw;
		}

		// build argument list to process() function
		// it takes two arguments:
		// the first is the Reactor class object
		// the second is a dict type representing the Event to process
		PyObject *python_args = PyTuple_New(2);
		if (! python_args) {
			Py_DECREF(py_event);
			throw InternalPythonException(getId());
		}
		Py_INCREF(m_reactor_ptr);
		PyTuple_SetItem(python_args, 0, m_reactor_ptr);
		PyTuple_SetItem(python_args, 1, py_event);	// note: py_event reference is stolen here

		// call the process() function, passing the dict as an argument
		PION_LOG_DEBUG(m_logger, "Calling Python process() function");
		PyObject *retval = PyObject_CallObject(m_process_func, python_args);
		
		// check for uncaught runtime exceptions
		if (retval == NULL && PyErr_Occurred()) {
			Py_DECREF(python_args);
			throw PythonRuntimeException(getPythonError());
		}
		Py_DECREF(python_args);
		Py_XDECREF(retval);

	} else {
		// no process() python function defined, just pass events through
		PION_LOG_DEBUG(m_logger, "Delivering pion event to connections");
		deliverEvent(e);
	}
}

void PythonReactor::deliverToConnections(PyObject *event_ptr)
{
	// we must acquire read lock to be safe, since python code may call this
	// from it's own independent threads
	ConfigReadLock cfg_lock(*this);
	PION_LOG_DEBUG(m_logger, "Delivering python event to connections");
	// don't let exceptions thrown downstream propogate up
	try {
		EventPtr e;
		fromPythonEvent(event_ptr, e);
		deliverEvent(e);
	} catch (std::exception& e) {
		std::string error_msg(e.what());
		if (PyErr_Occurred()) {
			error_msg += " (";
			error_msg += getPythonError();
			error_msg += ')';
		}
		PION_LOG_ERROR(m_logger, error_msg);
	} catch (...) {
		if (PyErr_Occurred())
			PION_LOG_ERROR(m_logger, getPythonError());
		else
			PION_LOG_ERROR(m_logger, "caught unrecognized exception");
	}
}

void PythonReactor::toPythonEvent(const Event& e, PyObject *& obj) const
{
	// needed for python date time API functions
	PyDateTime_IMPORT; 

	// create a new Python event using the Pion Event's type
	const Vocabulary& v = *m_vocab_ptr;
	PythonEventObject *self = Event_create(v[e.getType()].term_id.c_str());
	if (! self)
		throw EventConversionException("unable to create python event");
	obj = (PyObject*) self;

	// variables used for Pion Event iteration
	std::string term_id;
	Vocabulary::TermRef term_ref = Vocabulary::UNDEFINED_TERM_REF;
	Vocabulary::DataType term_type = Vocabulary::TYPE_NULL;
	PyObject *key = NULL;
	PyObject *values = NULL;

	// iterate each item defined within the Pion Event
	for (Event::ConstIterator it = e.begin(); it != e.end(); ++it) {
	
		// check if this term is different from the last
		if (it->term_ref != term_ref) {
			// have moved to a new term -> if not the first then add its values
			if (term_ref != Vocabulary::UNDEFINED_TERM_REF) {
				PyDict_SetItem(obj, key, values);
				Py_DECREF(key);
				Py_DECREF(values);
			}
			// set the current term ref, id and type
			term_ref = it->term_ref;
			const Vocabulary::Term& tmp_term(v[term_ref]);
			term_id = tmp_term.term_id;
			term_type = tmp_term.term_type;
			// Python key for this term will match it's uri identifier
			key = PyString_FromString(term_id.c_str());
			// create a new list to hold the values for this term
			values = PyList_New(0);
		}

		// next we need to come up with a "new value" based on the Pion Event item
		// the Pion Event value needs to be type converted into a corresponding Python object
		PyObject *new_value = NULL;
		switch (term_type) {
		case Vocabulary::TYPE_NULL:
		case Vocabulary::TYPE_OBJECT:
			// this shouldn't happen in practice, but if it does this is the most logical conversion
			new_value = PyInt_FromLong(1);
			break;
		case Vocabulary::TYPE_INT8:
		case Vocabulary::TYPE_INT16:
		case Vocabulary::TYPE_INT32:
			new_value = PyInt_FromLong(boost::get<boost::int32_t>(it->value));
			break;
		case Vocabulary::TYPE_UINT8:
		case Vocabulary::TYPE_UINT16:
			new_value = PyInt_FromLong(boost::get<boost::uint32_t>(it->value));
			break;
		case Vocabulary::TYPE_UINT32:
			new_value = PyLong_FromUnsignedLong(boost::get<boost::uint32_t>(it->value));
			break;
		case Vocabulary::TYPE_INT64:
			new_value = PyLong_FromLongLong(boost::get<boost::int64_t>(it->value));
			break;
		case Vocabulary::TYPE_UINT64:
			new_value = PyLong_FromUnsignedLongLong(boost::get<boost::uint64_t>(it->value));
			break;
		case Vocabulary::TYPE_FLOAT:
			new_value = PyFloat_FromDouble(boost::get<float>(it->value));
			break;
		case Vocabulary::TYPE_DOUBLE:
			new_value = PyFloat_FromDouble(boost::get<double>(it->value));
			break;
		case Vocabulary::TYPE_LONG_DOUBLE:
			new_value = PyFloat_FromDouble(boost::get<long double>(it->value));
			break;
		case Vocabulary::TYPE_SHORT_STRING:
		case Vocabulary::TYPE_STRING:
		case Vocabulary::TYPE_LONG_STRING:
		case Vocabulary::TYPE_CHAR:
		case Vocabulary::TYPE_BLOB:
		case Vocabulary::TYPE_ZBLOB:
			{
			const Event::BlobType& b = boost::get<const Event::BlobType&>(it->value);
			new_value = PyString_FromStringAndSize(b.get(), b.size());
			break;
			}
		case Vocabulary::TYPE_DATE_TIME:
			{
			const PionDateTime& d = boost::get<const PionDateTime&>(it->value);
			new_value = PyDateTime_FromDateAndTime(d.date().year(),
				d.date().month(), d.date().day(),
				d.time_of_day().hours(), d.time_of_day().minutes(),
				d.time_of_day().seconds(),
				d.time_of_day().total_microseconds() % 1000000UL);
			break;
			}
		case Vocabulary::TYPE_DATE:
			{
			const PionDateTime& d = boost::get<const PionDateTime&>(it->value);
			new_value = PyDate_FromDate(d.date().year(), d.date().month(),
				d.date().day());
			break;
			}
		case Vocabulary::TYPE_TIME:
			{
			const PionDateTime& d = boost::get<const PionDateTime&>(it->value);
			new_value = PyTime_FromTime(d.time_of_day().hours(),
				d.time_of_day().minutes(), d.time_of_day().seconds(),
				d.time_of_day().total_microseconds() % 1000000UL);
			break;
			}
		}
		
		// make sure conversion was successful
		if (! new_value) {
			Py_DECREF(obj);
			Py_XDECREF(key);
			Py_XDECREF(values);
			throw EventConversionException(term_id);
		}
		
		// append item value to the list of python values
		PyList_Append(values, new_value);
		Py_DECREF(new_value);
	}

	// add the last term to the python event
	if (key) {
		PyDict_SetItem(obj, key, values);
		Py_DECREF(key);
		Py_DECREF(values);
	}
}

void PythonReactor::fromPythonEvent(PyObject *obj, EventPtr& e) const
{
	// needed for python date time API functions
	PyDateTime_IMPORT; 

	// find the term corresponding with the event type
	const Vocabulary& v = *m_vocab_ptr;
	char *term_str = PyString_AsString(((PythonEventObject*)obj)->type);
	if (! term_str)
		throw EventConversionException("event type field must be a string");
	Vocabulary::TermRef term_ref = v.findTerm( term_str );
	if (term_ref == Vocabulary::UNDEFINED_TERM_REF) {
		std::string error_msg("unknown event type: ");
		error_msg += term_str;
		throw EventConversionException(error_msg);
	}
			
	// create a new Pion Event object
	EventFactory event_factory;
	event_factory.create(e, term_ref);
	
	// populate new Pion Event object
	Py_ssize_t pos = 0;
	PyObject *key = NULL;
	PyObject *values = NULL;

	// iterate through each item within the python event
	while (PyDict_Next(obj, &pos, &key, &values)) {

		// get the Pion term identifier for the Python key
		term_str = PyString_AsString(key);
		if (! term_str) {
			std::string error_msg("Event key is not a string: ");
			error_msg += term_str;
			throw EventConversionException(error_msg);
		}
		term_ref = v.findTerm( term_str );
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF) {
			std::string error_msg("unknown term: ");
			error_msg += term_str;
			throw EventConversionException(error_msg);
		}
		const Vocabulary::DataType term_type = v[term_ref].term_type;
		
		// make sure that values is a list
		if (! PySequence_Check(values)) {
			std::string error_msg("Event values must be a sequence: ");
			error_msg += term_str;
			throw EventConversionException(error_msg);
		}

		// iterate through each of the values defined
		Py_ssize_t num_values = PySequence_Size(values);
		for (Py_ssize_t n = 0; n < num_values; ++n) {
			PyObject *obj = PySequence_GetItem(values, n);
			PION_ASSERT(obj);
				
			switch (term_type) {
			case Vocabulary::TYPE_NULL:
			case Vocabulary::TYPE_OBJECT:
				// although not really supported, this is the most logical conversion
				e->setInt(term_ref, 1);
				break;
			case Vocabulary::TYPE_INT8:
			case Vocabulary::TYPE_INT16:
			case Vocabulary::TYPE_INT32:
				if (! PyInt_Check(obj)) {
					std::string error_msg("int required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				e->setInt(term_ref, PyInt_AsLong(obj) );
				break;
			case Vocabulary::TYPE_UINT8:
			case Vocabulary::TYPE_UINT16:
				if (! PyInt_Check(obj)) {
					std::string error_msg("int required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				e->setUInt(term_ref, PyInt_AsLong(obj) );
				break;
			case Vocabulary::TYPE_UINT32:
				if (! PyLong_Check(obj)) {
					std::string error_msg("long required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				e->setUInt(term_ref, PyLong_AsUnsignedLong(obj) );
				break;
			case Vocabulary::TYPE_INT64:
				if (! PyLong_Check(obj)) {
					std::string error_msg("long required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				e->setBigInt(term_ref, PyLong_AsLongLong(obj) );
				break;
			case Vocabulary::TYPE_UINT64:
				if (! PyLong_Check(obj)) {
					std::string error_msg("long required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				e->setUBigInt(term_ref, PyLong_AsUnsignedLongLong(obj) );
				break;
			case Vocabulary::TYPE_FLOAT:
				if (! PyFloat_Check(obj)) {
					std::string error_msg("float required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				e->setFloat(term_ref, PyFloat_AsDouble(obj) );
				break;
			case Vocabulary::TYPE_DOUBLE:
				if (! PyFloat_Check(obj)) {
					std::string error_msg("float required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				e->setDouble(term_ref, PyFloat_AsDouble(obj) );
				break;
			case Vocabulary::TYPE_LONG_DOUBLE:
				if (! PyFloat_Check(obj)) {
					std::string error_msg("float required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				e->setLongDouble(term_ref, PyFloat_AsDouble(obj) );
				break;
			case Vocabulary::TYPE_SHORT_STRING:
			case Vocabulary::TYPE_STRING:
			case Vocabulary::TYPE_LONG_STRING:
			case Vocabulary::TYPE_CHAR:
			case Vocabulary::TYPE_BLOB:
			case Vocabulary::TYPE_ZBLOB:
				if (PyString_Check(obj)) {
					char *buf = PyString_AsString(obj);
					Py_ssize_t len = PyString_Size(obj);
					e->setString(term_ref, buf, len);
				} else {
					std::string error_msg("str required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				break;
			case Vocabulary::TYPE_DATE_TIME:
				{
				if (! PyDateTime_Check(obj)) {
					std::string error_msg("datetime required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				boost::gregorian::date date(PyDateTime_GET_YEAR(obj),
					PyDateTime_GET_MONTH(obj), PyDateTime_GET_DAY(obj));
				boost::posix_time::time_duration time(PyDateTime_DATE_GET_HOUR(obj),
					PyDateTime_DATE_GET_MINUTE(obj), PyDateTime_DATE_GET_SECOND(obj),
					boost_msec_to_fsec(PyDateTime_DATE_GET_MICROSECOND(obj)) );
				PionDateTime d(date, time);
				e->setDateTime(term_ref, d);
				break;
				}
			case Vocabulary::TYPE_DATE:
				{
				if (PyDateTime_Check(obj)) {
					boost::gregorian::date date(PyDateTime_GET_YEAR(obj),
						PyDateTime_GET_MONTH(obj), PyDateTime_GET_DAY(obj));
					boost::posix_time::time_duration time(PyDateTime_DATE_GET_HOUR(obj),
						PyDateTime_DATE_GET_MINUTE(obj), PyDateTime_DATE_GET_SECOND(obj),
						boost_msec_to_fsec(PyDateTime_DATE_GET_MICROSECOND(obj)) );
					PionDateTime d(date, time);
					e->setDateTime(term_ref, d);
				} else if (PyDate_Check(obj)) {
					boost::gregorian::date date(PyDateTime_GET_YEAR(obj),
						PyDateTime_GET_MONTH(obj), PyDateTime_GET_DAY(obj));
					PionDateTime d(date);
					e->setDateTime(term_ref, d);
				} else {
					std::string error_msg("date or datetime required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				break;
				}
			case Vocabulary::TYPE_TIME:
				{
				if (PyDateTime_Check(obj)) {
					boost::gregorian::date date(PyDateTime_GET_YEAR(obj),
						PyDateTime_GET_MONTH(obj), PyDateTime_GET_DAY(obj));
					boost::posix_time::time_duration time(PyDateTime_DATE_GET_HOUR(obj),
						PyDateTime_DATE_GET_MINUTE(obj), PyDateTime_DATE_GET_SECOND(obj),
						boost_msec_to_fsec(PyDateTime_DATE_GET_MICROSECOND(obj)) );
					PionDateTime d(date, time);
					e->setDateTime(term_ref, d);
				} else if (PyTime_Check(obj)) {
					boost::gregorian::date date(1970, 1, 1);
					boost::posix_time::time_duration time(PyDateTime_TIME_GET_HOUR(obj),
						PyDateTime_TIME_GET_MINUTE(obj), PyDateTime_TIME_GET_SECOND(obj),
						boost_msec_to_fsec(PyDateTime_TIME_GET_MICROSECOND(obj)) );
					PionDateTime d(date, time);
					e->setDateTime(term_ref, d);
				} else {
					std::string error_msg("time or datetime required: ");
					error_msg += term_str;
					throw EventConversionException(error_msg);
				}
				break;
				}
			}
		}
	}
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
	PyThreadState_Clear(ptr);
	PyThreadState_Delete(ptr);
}

PyObject *PythonReactor::findPythonFunction(PyObject *module_ptr, const std::string& func_name)
{
	PyObject *func_ptr = PyObject_GetAttrString(module_ptr, const_cast<char*>(func_name.c_str()));
	if (func_ptr) {
		if (! PyCallable_Check(func_ptr))
			throw NotCallableException(func_name);
		PION_LOG_DEBUG(m_logger, "Found " << func_name << "() function");
	} else {
		PyErr_Clear();
		PION_LOG_WARN(m_logger, "Unable to find " << func_name << "() function");
	}
	return func_ptr;
}

void PythonReactor::resetPythonSymbols(void)
{
	// assumes ConfigWriteLock and PythonLock
	PION_LOG_DEBUG(m_logger, "Resetting Python symbols");
	Py_XDECREF(m_start_func);
	Py_XDECREF(m_stop_func);
	Py_XDECREF(m_process_func);
	Py_XDECREF(m_module);
	Py_XDECREF(m_byte_code);
	m_start_func = m_stop_func = m_process_func = m_module = m_byte_code = NULL;
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
	
		// find start() function in Python module
		m_start_func = findPythonFunction(m_module, START_FUNCTION_NAME);

		// find stop() function in Python module
		m_stop_func = findPythonFunction(m_module, STOP_FUNCTION_NAME);

		// find process() function in Python module
		m_process_func = findPythonFunction(m_module, PROCESS_FUNCTION_NAME);
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
