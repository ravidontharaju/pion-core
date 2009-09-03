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

#ifndef __PION_PYTHONREACTOR_HEADER__
#define __PION_PYTHONREACTOR_HEADER__

// NOTE: According to API docs, Python.h must be #include'd FIRST
#include <Python.h>
#include <string>
#include <boost/thread/tss.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionLogger.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/ReactionEngine.hpp>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// PythonReactor: used embed Python code within Pion
///
class PythonReactor :
	public pion::platform::Reactor
{
public:	
	
	/// exception thrown if there is an internal error encountered with the Python API
	class InternalPythonException : public PionException {
	public:
		InternalPythonException(const std::string& reactor_id)
			: PionException("PythonReactor internal API error: ", reactor_id) {}
	};

	/// exception thrown if the source code file configured is not found
	class SourceFileNotFoundException : public PionException {
	public:
		SourceFileNotFoundException(const std::string& filename)
			: PionException("PythonReactor source code file not found: ", filename) {}
	};

	/// exception thrown if the source code file cannot be read
	class ReadSourceFileException : public PionException {
	public:
		ReadSourceFileException(const std::string& filename)
			: PionException("PythonReactor unable to read source code from file: ", filename) {}
	};

	/// exception thrown if the source code fails to compile
	class FailedToCompileException : public PionException {
	public:
		FailedToCompileException(const std::string& filename)
			: PionException("PythonReactor compile failure: ", filename) {}
	};

	/// exception thrown if a Python source function is defined but it is not callable
	class NotCallableException : public PionException {
	public:
		NotCallableException(const std::string& name)
			: PionException("PythonReactor attribute defined is not callable: ", name) {}
	};

	/// exception thrown if there is an exception thrown while executing the byte code
	class PythonRuntimeException : public PionException {
	public:
		PythonRuntimeException(const std::string& error_msg)
			: PionException("PythonReactor runtime exception: ", error_msg) {}
	};


	/// constructs a new PythonReactorReactor object
	PythonReactor(void);
	
	/// virtual destructor: this class is meant to be extended
	virtual ~PythonReactor();
	
	/**
	 * sets configuration parameters for this Reactor
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Reactor
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * processes an Event by comparing its data to the configured RuleChain.
	 * Only Events which pass all Comparisons in the RuleChain will be
	 * delivered to the output connections.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void process(const pion::platform::EventPtr& e);
	
	/// called by the ReactorEngine to start Event processing
	virtual void start(void);
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void);

	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }

	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }

	
protected:

	/**
	 * initialize the Python state for the current thread, if not done already
	 *
	 * @return PyThreadState* pointer to the current thread's state
	 */
	static PyThreadState * initThreadState(void);

	/**
	 * callback function used to release Python state for each thread when it exits
	 * 
	 * @param ptr pointer to the Python thread state to be released
	 */
	static void releaseThreadState(PyThreadState *ptr);
	
	/// releases and resets all Python byte code symbols held by the Reactor
	void resetPythonSymbols(void);
	
	/// compiles the Python source code into executable byte code and initializes the module
	void compilePythonSource(void);
	
	/// initialize the Python module using the compiled byte code
	void initPythonModule(void);
	
	/// reads the Python source code from the file pointed to by m_source_file
	std::string getSourceCodeFromFile(void);

	/// if the Python error indicator is set, clear it and return a corresponding message
	std::string getPythonError(void);

	
	/// simple object used to manage the Python GIL lock & thread-safety
	class PythonLock {
	public:

		/// initializes the current thread's state, acquires the GIL and makes the thread active
		PythonLock(void)
			: m_thr_state_ptr(NULL)
		{
			m_thr_state_ptr = PythonReactor::initThreadState();
			PyEval_AcquireThread(m_thr_state_ptr);
		}
		
		/// releases the GIL and releases the current thread state
		~PythonLock() { PyEval_ReleaseThread(m_thr_state_ptr); }

	private:

		/// pointer to the state of the current thread
		PyThreadState *	m_thr_state_ptr;
	};

	
private:
	
	/// name of the "virtual" module that Python source code is imported into
	static const std::string		PYTHON_MODULE_NAME;

	/// name of the process function in Python source code
	static const std::string		PROCESS_FUNCTION_NAME;

	/// name of the Filename element for Pion XML config files
	static const std::string		FILENAME_ELEMENT_NAME;

	/// name of the PythonSource element for Pion XML config files
	static const std::string		PYTHON_SOURCE_ELEMENT_NAME;

	/// mutex used to protect the initialization counter
	static boost::mutex				m_init_mutex;
	
	/// total number of PythonReactor instances
	static boost::uint32_t			m_init_num;

	/// primary logging interface used by this class
	PionLogger						m_logger;

	/// string containing python source code to execute
	std::string						m_source;

	/// path to a file containing the Python source code to execute
	std::string						m_source_file;

	/// pointer to a PythonObject containing the compiled bytecode to execute
	PyObject *						m_byte_code;
	
	/// pointer to a PythonObject containing the compiled module (derived from byte code)
	PyObject *						m_module;
	
	/// pointer to the process function defined within the compiled module
	PyObject *						m_process_func;
	
	/// pointer to the global Python interpreter object
	static PyInterpreterState *		m_interp_ptr;

	/// thread-specific pointer to Python thread states
	static boost::thread_specific_ptr<PyThreadState> *	m_state_ptr;
};


}	// end namespace plugins
}	// end namespace pion

#endif
