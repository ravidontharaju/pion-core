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
#include <boost/regex.hpp>
#include <boost/scoped_ptr.hpp>
#include <boost/thread/thread.hpp>
#include <boost/thread/condition.hpp>
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
		m_just_one(false), m_frequency(DEFAULT_FREQUENCY)
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
	

	/// periodically checks for new log files and consumes any it finds
	void consumeLogs(void);

	/**
	 * consumes the entries in a log file, converting them into Events
	 *
	 * @param log_filename the name of the log file to consume
	 */
	void consumeLog(const std::string& log_filename);
	
	/**
	 * retrieves a collection of all the log files in the log directory
	 *
	 * @param files collection that will represent all matching log files
	 */
	void getLogFiles(LogFileCollection& files);
	
	
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
	bool						m_just_one;
	
	/// frequency that the Reactor will check for new logs (in seconds)
	boost::uint32_t						m_frequency;

	/// directory that the Reactor will periodically check for new log files
	std::string							m_log_directory;

	/// regular expression used to find the log files we want to consume
	boost::regex						m_log_regex;
	
	/// contains the names of all log files that have been consumed so far
	LogFileCollection					m_logs_consumed;

	/// condition triggered to notify the reader thread it is time to shutdown
	boost::condition					m_shutdown_thread;
	
	/// thread used to periodically check for new log files
	boost::scoped_ptr<boost::thread>	m_thread;
};


}	// end namespace plugins
}	// end namespace pion

#endif
