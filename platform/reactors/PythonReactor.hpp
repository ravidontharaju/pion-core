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

	/// exception thrown if there is an error initialize the Reactor Python class object
	class InitReactorObjectException : public PionException {
	public:
		InitReactorObjectException(const std::string& error_msg)
			: PionException("PythonReactor unable to initialize Reactor object: ", error_msg) {}
	};

	/// exception thrown if there is an error converting between Pion and Python events
	class EventConversionException : public PionException {
	public:
		EventConversionException(const std::string& error_msg)
			: PionException("PythonReactor event conversion error: ", error_msg) {}
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
	 * this updates the Vocabulary information used by this Reactor; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 */
	virtual void updateVocabulary(const pion::platform::Vocabulary& v);
	
	/**
	 * Processes an Event using a Python function.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void process(const pion::platform::EventPtr& e);
	
	/// called by the ReactorEngine to start Event processing
	virtual void start(void);
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void);
	
	/// delivers a Python event to the reactor's connections (used by Python callbacks)
	void deliverToConnections(PyObject *event_ptr);

	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }

	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }

	
protected:

	/**
	 * converts a Pion Event into a Python event object
	 *
	 * @param e the pion event to convert from
	 * @param obj pointer will be assigned to the resulting Python event object
	 */
	void toPythonEvent(const pion::platform::Event& e, PyObject *& obj) const;

	/**
	 * converts a Python event object into a Pion Event
	 *
	 * @param obj pointer to a PythonEventObject to convert from
	 * @param e pointer will be assigned to the resulting Pion Event object
	 */
	void fromPythonEvent(PyObject *obj, pion::platform::EventPtr& e) const;

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

	/**
	 * finds a python function within the compiled byte code for a module
	 *
	 * @param module_ptr pointer to the compiled byte code for the module
	 * @param func_name name of the Python function to find
	 *
	 * @return pointer to the function object, or NULL if not found
	 */	
	PyObject *findPythonFunction(PyObject *module_ptr, const std::string& func_name);

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

	/// convert microseconds into boost fractional seconds
	static inline boost::uint64_t boost_msec_to_fsec(boost::uint64_t n);

	/// convert boost fractional seconds into microseconds
	static inline boost::uint64_t boost_fsec_to_msec(boost::uint64_t n);

	
	/// simple object used to manage the Python GIL lock & thread-safety
	class PythonLock {
	public:

		/// initializes the current thread's state, acquires the GIL and makes the thread active
		PythonLock(bool inverse = false)
			: m_inversed(inverse), m_thr_state_ptr(NULL)
		{
			m_thr_state_ptr = PythonReactor::initThreadState();
			if (m_inversed) {
				PyEval_ReleaseThread(m_thr_state_ptr);
			} else {
				PyEval_AcquireThread(m_thr_state_ptr);
			}
		}
		
		/// releases the GIL and releases the current thread state
		~PythonLock() {
			if (m_inversed) {
				PyEval_AcquireThread(m_thr_state_ptr);
			} else {
				PyEval_ReleaseThread(m_thr_state_ptr);
			}
		}

	private:
	
		/// true if behaviour should be inversed
		bool			m_inversed;

		/// pointer to the state of the current thread
		PyThreadState *	m_thr_state_ptr;
	};

	
private:
	
	/// name of the start function in Python source code
	static const std::string		START_FUNCTION_NAME;

	/// name of the stop function in Python source code
	static const std::string		STOP_FUNCTION_NAME;

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
	
	/// pointer to the start function defined within the compiled module
	PyObject *						m_start_func;
	
	/// pointer to the stop function defined within the compiled module
	PyObject *						m_stop_func;
	
	/// pointer to the process function defined within the compiled module
	PyObject *						m_process_func;
	
	/// pointer to a Python Reactor class object that represents this reactor
	PyObject *						m_reactor_ptr;
	
	/// copy of system vocabulary used for mapping terms to python and back
	const pion::platform::Vocabulary *	m_vocab_ptr;

	/// pointer to the global Python interpreter object
	static PyInterpreterState *		m_interp_ptr;

	/// thread-specific pointer to Python thread states
	static boost::thread_specific_ptr<PyThreadState> *	m_state_ptr;
};


// inline functions for PythonReactor

inline boost::uint64_t PythonReactor::boost_msec_to_fsec(boost::uint64_t n) {
	switch (boost::posix_time::time_duration::resolution()) {
	case boost::date_time::sec:
		n /= 1000000;
		break;
	case boost::date_time::tenth:
		n /= 100000;
		break;
	case boost::date_time::hundreth:
		n /= 10000;
		break;
	case boost::date_time::milli:
		n /= 1000;
		break;
	case boost::date_time::ten_thousandth:
		n /= 100;
		break;
	case boost::date_time::micro:
		// good to go
		break;
	case boost::date_time::nano:
		n *= 1000;
		break;
	case boost::date_time::NumResolutions:
		// shouldn't happen
		break;
	}
	return n;
}

inline boost::uint64_t PythonReactor::boost_fsec_to_msec(boost::uint64_t n) {
	switch (boost::posix_time::time_duration::resolution()) {
	case boost::date_time::sec:
		n *= 1000000;
		break;
	case boost::date_time::tenth:
		n *= 100000;
		break;
	case boost::date_time::hundreth:
		n *= 10000;
		break;
	case boost::date_time::milli:
		n *= 1000;
		break;
	case boost::date_time::ten_thousandth:
		n *= 100;
		break;
	case boost::date_time::micro:
		// good to go
		break;
	case boost::date_time::nano:
		n /= 1000;
		break;
	case boost::date_time::NumResolutions:
		// shouldn't happen
		break;
	}
	return n;
}


}	// end namespace plugins
}	// end namespace pion

#endif
