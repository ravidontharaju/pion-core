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

#ifdef _MSC_VER
// This could be any valid .lib file; its only purpose is to prevent the compiler  
// from trying to link to boost_zlib-*.lib (e.g. boost_zip-vc80-mt-1_35.dll).  
// LogInputReactor only uses zlib indirectly, through boost_iostreams-*.dll.
#define BOOST_ZLIB_BINARY "zdll.lib"

// See above comment.
#define BOOST_BZIP2_BINARY "bzip2.lib"
#endif


#include <fstream>
#include <boost/filesystem.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/algorithm/string/predicate.hpp>
#include <boost/date_time/posix_time/posix_time_duration.hpp>
#include <boost/iostreams/device/file.hpp>
#include <boost/iostreams/filtering_stream.hpp>
#include <boost/iostreams/filter/gzip.hpp>
#include <boost/iostreams/filter/bzip2.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include "LogInputReactor.hpp"

using namespace pion::platform;
namespace bfs = boost::filesystem;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of LogInputReactor
	
const boost::uint32_t		LogInputReactor::DEFAULT_FREQUENCY = 1;
const std::string			LogInputReactor::CODEC_ELEMENT_NAME = "Codec";
const std::string			LogInputReactor::DIRECTORY_ELEMENT_NAME = "Directory";
const std::string			LogInputReactor::FILENAME_ELEMENT_NAME = "Filename";
const std::string			LogInputReactor::JUST_ONE_ELEMENT_NAME = "JustOne";
const std::string			LogInputReactor::FREQUENCY_ELEMENT_NAME = "Frequency";


// LogInputReactor member functions

void LogInputReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);
	
	// get the Codec that the Reactor should use
	if (! ConfigManager::getConfigOption(CODEC_ELEMENT_NAME, m_codec_id, config_ptr))
		throw EmptyCodecException(getId());
	
	// get the directory where the Reactor will look for new log files
	if (! ConfigManager::getConfigOption(DIRECTORY_ELEMENT_NAME, m_log_directory, config_ptr))
		throw EmptyDirectoryException(getId());
	
	// resolve paths relative to the ReactionEngine's config file location
	m_log_directory = getReactionEngine().resolveRelativePath(m_log_directory);

	// make sure that the directory exists
	if (! boost::filesystem::exists(m_log_directory) )
		throw DirectoryNotFoundException(m_log_directory);
	if (! boost::filesystem::is_directory(m_log_directory) )
		throw NotADirectoryException(m_log_directory);
	
	// get the filename regex to use for finding log files
	std::string filename_str;
	if (! ConfigManager::getConfigOption(FILENAME_ELEMENT_NAME, filename_str, config_ptr))
		throw EmptyFilenameException(getId());
	m_log_regex = filename_str;
	
	// check if the the Reactor should only read the first Event & duplicate it (for testing)
	m_just_one = false;
	std::string just_one_option;
	if (ConfigManager::getConfigOption(JUST_ONE_ELEMENT_NAME, just_one_option,
									   config_ptr))
	{
		if (just_one_option == "true")
			m_just_one = true;
	}

	// get the frequency to check for new logs (if defined)
	std::string frequency_str;
	if (ConfigManager::getConfigOption(FREQUENCY_ELEMENT_NAME, frequency_str, config_ptr)) {
		const boost::uint32_t frequency_value = boost::lexical_cast<boost::uint32_t>(frequency_str);
		if (frequency_value <= 0)
			throw BadFrequencyException(getId());
		m_frequency = frequency_value;
	} else {
		m_frequency = DEFAULT_FREQUENCY;
	}

	// assign names for the cache files
	bfs::path history_cache_path(m_log_directory);
	history_cache_path /= (getId() + ".cache");
	m_history_cache_filename = history_cache_path.file_string();
	bfs::path current_log_file_cache_path(m_log_directory);
	current_log_file_cache_path /= (getId() + "-cur.cache");
	m_current_log_file_cache_filename = current_log_file_cache_path.file_string();
}
	
void LogInputReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
	Reactor::updateVocabulary(v);
	if (m_codec_ptr)
		m_codec_ptr->updateVocabulary(v);
}

void LogInputReactor::updateCodecs(void)
{
	// check if the codec was deleted (if so, stop now!)
	if (! getCodecFactory().hasPlugin(m_codec_id)) {
		stop();
	    boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
		m_codec_ptr.reset();
	} else {
		// update the codec pointer
    	boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
		m_codec_ptr = getCodecFactory().getCodec(m_codec_id);
	}
}

void LogInputReactor::operator()(const EventPtr& e)
{
	if (isRunning()) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		incrementEventsIn();
		deliverEvent(e);
	}
}

void LogInputReactor::start(void)
{
	boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
	if (! m_is_running) {
		// Process history cache (list of log files that have already been consumed) if present.
		if (bfs::exists(m_history_cache_filename)) {
			std::ifstream history_cache(m_history_cache_filename.c_str());
			if (! history_cache)
				throw PionException("Unable to open history cache file for reading.");
			m_logs_consumed.clear();
			std::string already_consumed_file;
			while (history_cache >> already_consumed_file) {
				m_logs_consumed.insert(already_consumed_file);
			}
		}

		// If the Reactor was in the middle of reading a log file the last time it was stopped,
		// resume reading that log file, else schedule a check for new log files.
		if (bfs::exists(m_current_log_file_cache_filename)) {
			std::ifstream current_log_file_cache(m_current_log_file_cache_filename.c_str());
			if (! current_log_file_cache)
				throw PionException("Unable to open current log file cache file for reading.");
			current_log_file_cache >> m_log_file >> m_num_events_read_previously;
			current_log_file_cache.close();
			bfs::remove(m_current_log_file_cache_filename);
			PION_LOG_DEBUG(m_logger, "Resuming consumption of log file: " << m_log_file);
			scheduleReadFromLog(true);
		} else {
			m_num_events_read_previously = 0;
			scheduleLogFileCheck(0);
		}

		m_is_running = true;
	}
}
	
void LogInputReactor::stop(void)
{
	boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
	if (m_is_running) {
		// set flag to notify reader thread to shutdown
		PION_LOG_DEBUG(m_logger, "Stopping input log thread: " << getId());
		m_is_running = false;
		m_timer_ptr.reset();

		// Write current log file cache file.
		if (m_log_stream.is_complete()) { // is_complete() returns true if a Device, in this case a file, is attached to the stream.
			std::ofstream current_log_file_cache(m_current_log_file_cache_filename.c_str());
			if (! current_log_file_cache)
				throw PionException("Unable to open current log file cache file for writing.");
			current_log_file_cache << m_log_file << " " << getEventsIn();
		} else {
			boost::filesystem::remove(m_current_log_file_cache_filename);
		}
	}
}

void LogInputReactor::scheduleLogFileCheck(boost::uint32_t seconds)
{
	if (seconds == 0) {
		getScheduler().post(boost::bind(&LogInputReactor::checkForLogFiles, this));
	} else {
		if (! m_timer_ptr)
			m_timer_ptr.reset(new boost::asio::deadline_timer(getScheduler().getIOService()));
		m_timer_ptr->expires_from_now(boost::posix_time::seconds(seconds));
		m_timer_ptr->async_wait(boost::bind(&LogInputReactor::checkForLogFiles, this));
	}
}

void LogInputReactor::checkForLogFiles(void)
{
	// make sure that the reactor is still running
	boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
	if (! isRunning())
		return;

	PION_LOG_DEBUG(m_logger, "Checking for new log files in " << m_log_directory);

	// get the current logs located in the log directory
	LogFileCollection current_logs;
	getLogFilesInLogDirectory(current_logs);

	// remove logs from the consumed collection that are no longer there
	LogFileCollection::iterator temp_itr;
	LogFileCollection::iterator log_itr = m_logs_consumed.begin();
	while (log_itr != m_logs_consumed.end()) {
		temp_itr = log_itr++;
		if (current_logs.find(*temp_itr) == current_logs.end())
			m_logs_consumed.erase(temp_itr);
	}
	
	// check for an existing log that has not yet been consumed
	for (log_itr = current_logs.begin(); log_itr != current_logs.end(); ++log_itr) {
		if (m_logs_consumed.find(*log_itr) == m_logs_consumed.end())
			break;
	}
		
	if (log_itr == current_logs.end()) {
		// no new logs to consume

		// sleep until it is time to check again
		PION_LOG_DEBUG(m_logger, "No new logs (sleeping for " << m_frequency
					   << " seconds): " << m_log_directory);
		scheduleLogFileCheck(m_frequency);
		
	} else {
		// found a new log to consume
		
		// re-calculate the full path to the file
		bfs::path full_path(m_log_directory);
		full_path /= *log_itr;
		m_log_file = full_path.file_string();

		PION_LOG_DEBUG(m_logger, "Found a new log file to consume: " << m_log_file);
		scheduleReadFromLog(true);
	}
}

void LogInputReactor::readFromLog(bool use_one_thread)
{
	// make sure that the reactor is still running
	if (! isRunning())
		return;

	try {
		// open up the log file for reading (if not open already)
		boost::uint64_t num_events_to_skip = 0;
		if (! m_log_stream.is_complete()) { // is_complete() returns true if a Device, in this case a file, is attached to the stream.

			// Insert a decompression filter if the file suffix indicates one is needed.
			if (boost::algorithm::iequals(bfs::extension(bfs::path(m_log_file)), ".gz"))
				m_log_stream.push(boost::iostreams::gzip_decompressor());
			if (boost::algorithm::iequals(bfs::extension(bfs::path(m_log_file)), ".bz2"))
				m_log_stream.push(boost::iostreams::bzip2_decompressor());

			// Open and attach a file.
			m_log_stream.push(boost::iostreams::file_source(m_log_file.c_str(), std::ios::in | std::ios::binary));
			if (! m_log_stream.is_complete())
				throw OpenLogException(m_log_file);

			if (m_log_stream.peek() == EOF) {
				recordLogFileAsDone();

				// TODO: Should this really throw an exception, or would a warning be good enough?
				throw EmptyLogException(m_log_file);
			}

			// If there were any previously read Events, we need to skip over them, because the log file has been reopened since they were read.
			num_events_to_skip = m_num_events_read_previously;

			// Get a new Codec for reading the current log file.
			boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
			m_codec_ptr = getCodecFactory().getCodec(m_codec_id);
			PION_ASSERT(m_codec_ptr);
		}

		const Event::EventType event_type(m_codec_ptr->getEventType());
		EventFactory event_factory;
		EventPtr event_ptr;
		do {
			// get a new event from the EventFactory
			event_factory.create(event_ptr, event_type);

			// read an Event from the log file (convert into an Event using the Codec)
			boost::unique_lock<boost::mutex> reactor_lock(m_mutex);
			if (! isRunning()) break;
			bool event_read = m_codec_ptr->read(m_log_stream, *event_ptr);
			if (! event_read && ! m_log_stream.eof())
				throw ReadEventException(m_log_file);

			// Ignore Events that were previously read.
			if (num_events_to_skip) {
				num_events_to_skip--;
				continue;
			}

			// check if only the first Event should be read
			if (m_just_one) {
				PION_LOG_DEBUG(m_logger, "JustOne: generating lots of event copies for testing");

				// Remove and close all Filters and Devices.
				while (! m_log_stream.empty()) m_log_stream.pop();

				reactor_lock.unlock();

				// just duplicate the event repeatedly until the Reactor is stopped
				EventPtr original_event_ptr(event_ptr);
				while (isRunning()) {
					// duplicate the original event
					event_factory.create(event_ptr, event_type);
					*event_ptr += *original_event_ptr;
					// deliver the Event to connected Reactors
					boost::unique_lock<boost::mutex> delivery_lock(m_mutex);
					incrementEventsIn();
					deliverEvent(event_ptr);
				}
				break;
			}

			// check for end of file
			if (m_log_stream.eof()) {
				// all done with this log file
				PION_LOG_DEBUG(m_logger, "Finished consuming log file: " << m_log_file);

				// Remove and close all Filters and Devices.
				while (! m_log_stream.empty()) m_log_stream.pop();

				recordLogFileAsDone();

				// check for more logs
				scheduleLogFileCheck(0);

				if (event_read) {
					// deliver the Event to connected Reactors
					incrementEventsIn();
					deliverEvent(event_ptr);
				}
				break;
			} else {
				// more available: schedule another read operation?
				if (! use_one_thread) {
					scheduleReadFromLog(false);

					// deliver the Event to connected Reactors
					incrementEventsIn();
					deliverEvent(event_ptr);
					break;
				}

				// deliver the Event to connected Reactors
				incrementEventsIn();
				deliverEvent(event_ptr);
			}

		} while (isRunning()); 

	} catch (std::exception& e) {
		PION_LOG_ERROR(m_logger, e.what());

		// Remove and close all Filters and Devices.
		while (! m_log_stream.empty()) m_log_stream.pop();

		scheduleLogFileCheck(0);
	}
}

void LogInputReactor::getLogFilesInLogDirectory(LogFileCollection& files)
{
	bfs::path dir_path(m_log_directory);
	for (bfs::directory_iterator itr(dir_path); itr!=bfs::directory_iterator(); ++itr) {
		if (bfs::is_regular(itr->status())) {
			const std::string filename(itr->path().leaf());
			if (boost::regex_search(filename, m_log_regex))
				files.insert(filename);
		}
	}
}

void LogInputReactor::recordLogFileAsDone() {
	// No need to record anything if "JustOne" is enabled.
	if (m_just_one) return;

	// Add the current log file to the list of consumed files and the history cache.
	bfs::path log_file_path(m_log_file);
	m_logs_consumed.insert(log_file_path.leaf());
	std::ofstream history_cache(m_history_cache_filename.c_str(), std::ios::out | std::ios::app);
	if (! history_cache)
		throw PionException("Unable to open history cache file for writing.");
	history_cache << log_file_path.leaf() << std::endl;
}
	
}	// end namespace plugins
}	// end namespace pion


/// creates new LogInputReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_LogInputReactor(void) {
	return new pion::plugins::LogInputReactor();
}

/// destroys LogInputReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_LogInputReactor(pion::plugins::LogInputReactor *reactor_ptr) {
	delete reactor_ptr;
}
