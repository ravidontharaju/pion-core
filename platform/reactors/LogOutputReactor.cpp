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

#include <boost/filesystem/operations.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include "LogOutputReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of LogOutputReactor

const std::string			LogOutputReactor::CODEC_ELEMENT_NAME = "Codec";
const std::string			LogOutputReactor::FILENAME_ELEMENT_NAME = "Filename";
	
	
// LogOutputReactor member functions

LogOutputReactor::~LogOutputReactor()
{
	// close the log file if it is open
	if (m_log_stream.is_open()) {
		m_log_stream.close();
		// remove the log file if no events were written to it
		if (getEventsOut() == 0) {
			boost::filesystem::remove(m_log_filename);
			PION_LOG_INFO(m_logger, "Closing empty output log (removing file): " << m_log_filename);
		} else {
			PION_LOG_INFO(m_logger, "Closing output log file: " << m_log_filename);
		}
	}
}
	
void LogOutputReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);
	
	// get the Codec that the Reactor should use
	if (! ConfigManager::getConfigOption(CODEC_ELEMENT_NAME, m_codec_id, config_ptr))
		throw EmptyCodecException(getId());
	m_codec_ptr = getCodecFactory().getCodec(m_codec_id);
	PION_ASSERT(m_codec_ptr);
	
	// get the filename regex to use for finding log files
	if (! ConfigManager::getConfigOption(FILENAME_ELEMENT_NAME, m_log_filename, config_ptr))
		throw EmptyFilenameException(getId());
	
	// resolve paths relative to the ReactionEngine's config file location
	m_log_filename = getReactionEngine().resolveRelativePath(m_log_filename);
	
	// open up the file for writing
	m_log_stream.open(m_log_filename.c_str(), std::ios::out | std::ios::app | std::ios::binary);
	if (! m_log_stream.is_open())
		throw OpenLogException(m_log_filename);

	PION_LOG_INFO(m_logger, "Opened output log file: " << m_log_filename);
}
	
void LogOutputReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::updateVocabulary(v);
	if (m_codec_ptr)
		m_codec_ptr->updateVocabulary(v);
}

void LogOutputReactor::updateCodecs(void)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	m_codec_ptr = getCodecFactory().getCodec(m_codec_id);
	PION_ASSERT(m_codec_ptr);
}
	
void LogOutputReactor::operator()(const EventPtr& e)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	incrementEventsIn();
	
	// write the Event to the log file
	PION_ASSERT(m_codec_ptr);
	PION_ASSERT(m_log_stream.is_open());
	m_codec_ptr->write(m_log_stream, *e);
	if (! m_log_stream)
		throw WriteToLogException(m_log_filename);
	
	// deliver the Event to other Reactors
	deliverEvent(e);
}
	
	
}	// end namespace plugins
}	// end namespace pion


/// creates new LogOutputReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_LogOutputReactor(void) {
	return new pion::plugins::LogOutputReactor();
}

/// destroys LogOutputReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_LogOutputReactor(pion::plugins::LogOutputReactor *reactor_ptr) {
	delete reactor_ptr;
}
