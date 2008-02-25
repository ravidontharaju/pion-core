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

#include <fstream>
#include <boost/thread/mutex.hpp>
#include <boost/filesystem/operations.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/CodecFactory.hpp>
#include "LogInputReactor.hpp"

namespace bfs = boost::filesystem;


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of LogInputReactor
	
const boost::uint32_t		LogInputReactor::DEFAULT_FREQUENCY = 1;
const std::string			LogInputReactor::CODEC_ELEMENT_NAME = "Codec";
const std::string			LogInputReactor::DIRECTORY_ELEMENT_NAME = "Directory";
const std::string			LogInputReactor::FILENAME_ELEMENT_NAME = "Filename";
const std::string			LogInputReactor::FREQUENCY_ELEMENT_NAME = "Frequency";

	
// LogInputReactor member functions

void LogInputReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);
	
	// get the Codec that the Reactor should use
	if (! ConfigManager::getConfigOption(CODEC_ELEMENT_NAME, m_codec_id, config_ptr))
		throw EmptyCodecException(getId());
	m_codec_ptr = getCodecFactory().getCodec(m_codec_id);
	PION_ASSERT(m_codec_ptr);
	
	// get the directory where the Reactor will look for new log files
	if (! ConfigManager::getConfigOption(DIRECTORY_ELEMENT_NAME, m_log_directory, config_ptr))
		throw EmptyDirectoryException(getId());

	// make sure that the directory exists
	if (! boost::filesystem::exists(m_log_directory) )
		throw DirectoryNotFoundException(getId());
	if (! boost::filesystem::is_directory(m_log_directory) )
		throw NotADirectoryException(getId());
	
	// get the filename regex to use for finding log files
	std::string filename_str;
	if (! ConfigManager::getConfigOption(FILENAME_ELEMENT_NAME, filename_str, config_ptr))
		throw EmptyFilenameException(getId());
	m_log_regex = filename_str;
	
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
}
	
void LogInputReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::updateVocabulary(v);
	if (m_codec_ptr)
		m_codec_ptr->updateVocabulary(v);
}

void LogInputReactor::updateCodecs(void)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	m_codec_ptr = getCodecFactory().getCodec(m_codec_id);
	PION_ASSERT(m_codec_ptr);
}

void LogInputReactor::operator()(const EventPtr& e)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	incrementEventsIn();
	deliverEvent(e);
}
	
void LogInputReactor::start(void)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	if (! m_is_running) {
		// spawn a new thread to consume log files
		PION_LOG_DEBUG(m_logger, "Starting input log thread: " << getId());
		m_thread.reset(new boost::thread(boost::bind(&LogInputReactor::consumeLogs, this)));
		m_is_running = true;
	}
}
	
void LogInputReactor::stop(void)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	if (m_is_running) {
		// set flag to notify reader thread to shutdown
		PION_LOG_DEBUG(m_logger, "Stopping input log thread: " << getId());
		m_is_running = false;
		m_shutdown_thread.notify_one();
		reactor_lock.unlock();
		// wait for reader thread to shutdown
		m_thread->join();
	}
}

void LogInputReactor::consumeLogs(void)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	while (true) {

		PION_LOG_DEBUG(m_logger, "Checking for new log files in " << m_log_directory);

		// get the current logs located in the log directory
		LogFileCollection current_logs;
		getLogFiles(current_logs);

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
			PionScheduler::sleep(m_shutdown_thread, reactor_lock, m_frequency, 0);
			
		} else {
			// found a new log to consume
			
			PION_LOG_DEBUG(m_logger, "Found a new log file to consume: " << *log_itr);
			
			// catch and log any exceptions from consuming the log
			try {
				consumeLog(*log_itr);
			} catch (std::exception& e) {
				PION_LOG_ERROR(m_logger, e.what());
			}
			m_logs_consumed.insert(*log_itr);

			PION_LOG_DEBUG(m_logger, "Finished consuming log file: " << *log_itr);
		}

		// check if we should shutdown
		if (! m_is_running) break;
	}
}

void LogInputReactor::consumeLog(const std::string& log_filename)
{
	// re-calculate the full path to the file
	bfs::path full_path(m_log_directory);
	full_path /= log_filename;

	// open up the log file for reading
	std::ifstream log_stream;
	log_stream.open(full_path.file_string().c_str(), std::ios::in | std::ios::binary);
	if (! log_stream.is_open())
		throw OpenLogException(log_filename);
	
	// convert the log entries into Events using the Codec
	EventPtr event_ptr;
	while (! log_stream.eof()) {
		// read an Event from the log file
		event_ptr.reset(new Event(m_codec_ptr->getEventType()));
		if (! m_codec_ptr->read(log_stream, *event_ptr))
			throw ReadEventException(log_filename);
		// deliver the Event to connected Reactors
		incrementEventsIn();
		deliverEvent(event_ptr);
	}
}

void LogInputReactor::getLogFiles(LogFileCollection& files)
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

	
}	// end namespace platform
}	// end namespace pion


/// creates new LogInputReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_LogInputReactor(void) {
	return new pion::platform::LogInputReactor();
}

/// destroys LogInputReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_LogInputReactor(pion::platform::LogInputReactor *reactor_ptr) {
	delete reactor_ptr;
}
