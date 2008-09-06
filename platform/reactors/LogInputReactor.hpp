// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#ifndef __PION_LOGINPUTREACTOR_HEADER__
#define __PION_LOGINPUTREACTOR_HEADER__

#include <set>
#include <string>
#include <boost/asio.hpp>
#include <boost/regex.hpp>
#include <boost/scoped_ptr.hpp>
#include <boost/thread/condition.hpp>
#include <boost/iostreams/filtering_stream.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionLogger.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/Reactor.hpp>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// LogInputReactor: consumes log files, converting each entry into an event
///
class LogInputReactor :
	public pion::platform::Reactor
{
public:

	/// exception thrown if the Reactor configuration does not define a Codec
	class EmptyCodecException : public PionException {
	public:
		EmptyCodecException(const std::string& reactor_id)
			: PionException("LogInputReactor configuration is missing a required Codec parameter: ", reactor_id) {}
	};

	/// exception thrown if the Reactor configuration does not define a Filename
	class EmptyFilenameException : public PionException {
	public:
		EmptyFilenameException(const std::string& reactor_id)
			: PionException("LogInputReactor configuration is missing a required Filename parameter: ", reactor_id) {}
	};
	
	/// exception thrown if the Reactor configuration does not define a Directory
	class EmptyDirectoryException : public PionException {
	public:
		EmptyDirectoryException(const std::string& reactor_id)
			: PionException("LogInputReactor configuration is missing a required Directory parameter: ", reactor_id) {}
	};
	
	/// exception thrown if the directory configured is not found
	class DirectoryNotFoundException : public PionException {
	public:
		DirectoryNotFoundException(const std::string& dir)
			: PionException("LogInputReactor directory not found: ", dir) {}
	};
	
	/// exception thrown if the directory configuration option is not a directory
	class NotADirectoryException : public PionException {
	public:
		NotADirectoryException(const std::string& dir)
			: PionException("LogInputReactor Directory parameter is not a directory: ", dir) {}
	};
	
	/// exception thrown if the frequency is not greater than zero
	class BadFrequencyException : public PionException {
	public:
		BadFrequencyException(const std::string& dir)
			: PionException("LogInputReactor frequency must be greater than zero: ", dir) {}
	};
	
	/// exception thrown if the Reactor is unable to open a log file for reading
	class OpenLogException : public PionException {
	public:
		OpenLogException(const std::string& log_filename)
			: PionException("Unable to open log file for reading: ", log_filename) {}
	};

	/// exception thrown if the Reactor tries to consume a log file that is empty
	class EmptyLogException : public PionException {
	public:
		EmptyLogException(const std::string& log_filename)
			: PionException("Log file is empty: ", log_filename) {}
	};
	
	/// exception thrown if the Reactor encounters an error while reading Events
	class ReadEventException : public PionException {
	public:
		ReadEventException(const std::string& log_filename)
			: PionException("Unable to read event from log file: ", log_filename) {}
	};

	
	/// constructs a new LogInputReactor object
	LogInputReactor(void)
		: Reactor(TYPE_COLLECTION),
		m_logger(PION_GET_LOGGER("pion.LogInputReactor")),
		m_just_one(false), m_frequency(DEFAULT_FREQUENCY), m_worker_is_active(false)
	{}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~LogInputReactor() { stop(); }
	
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
	 * this updates the Codecs that are used by this Reactor; it should
	 * be called whenever any Codec's configuration is updated
	 */
	virtual void updateCodecs(void);
	
    /**
     * processes an Event by comparing its data to the configured RuleChain.
     * Only Events which pass all Comparisons in the RuleChain will be
     * delivered to the output connections.
     *
     * @param e pointer to the Event to process
     */
    virtual void operator()(const pion::platform::EventPtr& e);

	/// called by the ReactorEngine to start Event processing
	virtual void start(void);
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void);
	
	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }
	
		
private:
	
	/// data structure used to represent a collection of log files
	typedef std::set<std::string>		LogFileCollection;
	

	/**
	 * schedules a timer to check for new log files
	 *
	 * @param seconds the number of seconds to wait before checking for new logs
	 */
	void scheduleLogFileCheck(boost::uint32_t seconds);
	
	/// checks for new log files
	void checkForLogFiles(void);

	/// Adds the current log file to the list of consumed files and to the history cache.
	void recordLogFileAsDone(void);

	/**
	 * schedules another thread to read an event from the log file
	 *
	 * @param use_one_thread if true, a single thread will be used to consume the entire file
	 */
	inline void scheduleReadFromLog(bool use_one_thread) {
		getScheduler().post(boost::bind(&LogInputReactor::readFromLog,
										this, use_one_thread));
	}
	
	/**
	 * consumes one entry from the log file and converts it into an Event
	 *
	 * @param use_one_thread if true, a single thread will be used to consume the entire file
	 */
	void readFromLog(bool use_one_thread);
	
	/**
	 * retrieves a collection of all the log files in the log directory
	 *
	 * @param files collection that will represent all matching log files
	 */
	void getLogFilesInLogDirectory(LogFileCollection& files);
	
	
	/// default frequency that the Reactor will check for new logs (in seconds)
	static const boost::uint32_t		DEFAULT_FREQUENCY;
	
	/// name of the Codec element for Pion XML config files
	static const std::string			CODEC_ELEMENT_NAME;

	/// name of the Directory element for Pion XML config files
	static const std::string			DIRECTORY_ELEMENT_NAME;

	/// name of the Filename element for Pion XML config files
	static const std::string			FILENAME_ELEMENT_NAME;

	/// name of the JustOne element for Pion XML config files
	static const std::string			JUST_ONE_ELEMENT_NAME;

	/// name of the Frequency element for Pion XML config files
	static const std::string			FREQUENCY_ELEMENT_NAME;

	
	/// primary logging interface used by this class
	PionLogger							m_logger;
	
	/// unique identifier of the Codec that is used for reading Events
	std::string							m_codec_id;
	
	/// pointer to the Codec that is used for reading Events
	pion::platform::CodecPtr			m_codec_ptr;

	/// only reads one Event entry and duplicates it continuously (for testing)
	bool								m_just_one;
	
	/// frequency that the Reactor will check for new logs (in seconds)
	boost::uint32_t						m_frequency;

	/// directory that the Reactor will periodically check for new log files
	std::string							m_log_directory;

	/// regular expression used to find the log files we want to consume
	boost::regex						m_log_regex;
	
	/// contains the names of all log files that have been consumed so far
	LogFileCollection					m_logs_consumed;
	
	/// the filename of the log file currently being consumed (includes full path)
	std::string							m_log_file;
	
	/// input file stream used to read the contents of log files
	boost::iostreams::filtering_istream m_log_stream;

	/// pointer to a timer used to schedule the check for new log files
	boost::scoped_ptr<boost::asio::deadline_timer>	m_timer_ptr;

	/// name of the history cache, used for keeping track of which log files have been consumed
	std::string							m_history_cache_filename;

	/// name of the current log file cache, used for keeping track of the read position in the current log file
	std::string							m_current_log_file_cache_filename;

	/// number of Events that had previously been read from the current log file
	boost::uint64_t						m_num_events_read_previously;

	/// condition triggered after the worker thread has stopped running
	boost::condition					m_worker_stopped;
	
	/// true while the worker thread is active
	volatile bool						m_worker_is_active;
};


}	// end namespace plugins
}	// end namespace pion

#endif
