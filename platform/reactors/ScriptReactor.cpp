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

#include <iostream>
#ifndef _MSC_VER
	#include <sys/select.h>
#endif
#include <pion/platform/CodecFactory.hpp>
#include "ScriptReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of ScriptReactor

const std::string		ScriptReactor::INPUT_CODEC_ELEMENT_NAME = "InputCodec";
const std::string		ScriptReactor::OUTPUT_CODEC_ELEMENT_NAME = "OutputCodec";
const std::string		ScriptReactor::COMMAND_ELEMENT_NAME = "Command";


// ScriptReactor member functions

void ScriptReactor::start(void)
{
	ConfigWriteLock cfg_lock(*this);
	if (! m_is_running) {
		// open pipe to script
		openPipe();
		
		m_is_running = true;

		// spawn a new thread that will be used to read events from the script
		PION_LOG_DEBUG(m_logger, "Starting reader thread: " << getId());
		m_thread_ptr.reset(new boost::thread(boost::bind(&ScriptReactor::readEvents, this)));
	}
}
	
void ScriptReactor::stop(void)
{
	ConfigWriteLock cfg_lock(*this);
	if (m_is_running) {
		closePipe();
		m_is_running = false;
		m_thread_ptr->join();
	}
}

void ScriptReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	ConfigWriteLock cfg_lock(*this);
	Reactor::setConfig(v, config_ptr);
	
	// get the Input Codec that the Reactor should use
	if (! ConfigManager::getConfigOption(INPUT_CODEC_ELEMENT_NAME, m_input_codec_id, config_ptr))
		throw EmptyInputCodecException(getId());
	m_input_codec_ptr = getCodecFactory().getCodec(m_input_codec_id);
	PION_ASSERT(m_input_codec_ptr);

	// get the Output Codec that the Reactor should use
	if (! ConfigManager::getConfigOption(OUTPUT_CODEC_ELEMENT_NAME, m_output_codec_id, config_ptr))
		throw EmptyOutputCodecException(getId());
	m_output_codec_ptr = getCodecFactory().getCodec(m_output_codec_id);
	PION_ASSERT(m_output_codec_ptr);
	
	// get the script or program command to execute
	if (! ConfigManager::getConfigOption(COMMAND_ELEMENT_NAME, m_command, config_ptr))
		throw EmptyCommandException(getId());
}
	
void ScriptReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	ConfigWriteLock cfg_lock(*this);
	Reactor::updateVocabulary(v);

	if (m_input_codec_ptr)
		m_input_codec_ptr->updateVocabulary(v);

	if (m_output_codec_ptr)
		m_output_codec_ptr->updateVocabulary(v);
}
	
void ScriptReactor::updateCodecs(void)
{
	// check if a codec was deleted (if so, stop now!)
	if (! getCodecFactory().hasPlugin(m_input_codec_id)
		|| ! getCodecFactory().hasPlugin(m_output_codec_id))
	{
		stop();
	} else {
		// update the codec pointer
		ConfigWriteLock cfg_lock(*this);
		m_input_codec_ptr = getCodecFactory().getCodec(m_input_codec_id);
		m_output_codec_ptr = getCodecFactory().getCodec(m_output_codec_id);
	}
}
	
void ScriptReactor::process(const EventPtr& e)
{
	PION_ASSERT(m_input_stream_ptr);
	PION_ASSERT(m_input_stream_ptr->is_open());
	PION_ASSERT(m_input_codec_ptr);

	// lock mutex to ensure that only one Event may be written at a time
	boost::mutex::scoped_lock write_lock(m_write_mutex);
	
	// write the Event to the pipe
	m_input_codec_ptr->write(*m_input_stream_ptr, *e);
	if (! *m_input_stream_ptr)
		throw WriteToPipeException(getId());
		
	// unlock mutex after writing to pipe
	write_lock.unlock();

	// note: delivery to other reactors is handled by readEvents()
}

void ScriptReactor::readEvents(void)
{
	PION_LOG_DEBUG(m_logger, "Script reader thread is running: " << getId());

	try {
	
		const Event::EventType event_type(m_output_codec_ptr->getEventType());
		EventFactory event_factory;
		EventPtr event_ptr;
		bool event_read;

		const int pipe_fd = ::fileno(m_pipe);
		struct timeval timeout;
		fd_set read_fds;
		
		while ( isRunning() ) {
		
			PION_ASSERT(m_output_stream_ptr);
			PION_ASSERT(m_output_stream_ptr->is_open());
			PION_ASSERT(m_output_code_ptr);

			// these need to be reset before each select()
			FD_ZERO(&read_fds);
			FD_SET(pipe_fd, &read_fds);
			timeout.tv_sec = 0;
			timeout.tv_usec = 100000;	// microseconds (1/10 second)

			// wait for data to be available
			if ( ::select(pipe_fd+1, &read_fds, NULL, NULL, &timeout) == 1 ) {
				if ( ! isRunning() )	// re-check after sleep
					break;
				ConfigReadLock cfg_lock(*this);
				if ( ! isRunning() )	// re-check after locking
					break;

				// get a new event from the EventFactory
				event_factory.create(event_ptr, event_type);
				
				// read an event using the output codec
				event_read = m_output_codec_ptr->read(*m_output_stream_ptr, *event_ptr);
	
				if (event_read) {
	
					// deliver the Event to other Reactors
					deliverEvent(event_ptr);
	
				} else {
				
					// check for read error
					if ( isRunning() )
						throw ReadFromPipeException(getId());
				}
			}
		}

	} catch (std::exception& e) {
		PION_LOG_FATAL(m_logger, e.what());
		ConfigWriteLock cfg_lock(*this);
		if ( isRunning() ) {
			closePipe();
			m_is_running = false;
		}
	}

	PION_LOG_DEBUG(m_logger, "Script reader thread is exiting: " << getId());
}	
	
void ScriptReactor::openPipe(void)
{
	// close first if already open
	closePipe();
	
	PION_LOG_DEBUG(m_logger, "Opening pipe to command: " << m_command);

	// open pipe to script
#ifdef _MSC_VER
	m_pipe = _popen(m_command.c_str(), "r+");
#else
	m_pipe = ::popen(m_command.c_str(), "r+");
#endif
	if (m_pipe == NULL)
		throw OpenPipeException(m_command);
		
	// disable buffering for the pipe
	::setvbuf(m_pipe, NULL, _IONBF, BUFSIZ);
	
	// prepare c++ streams to use pipe for reading and writing events
	// (yes, it's necessary to use separate ones for input and output..)
	m_input_streambuf_ptr.reset(new StreamBuffer( ::fileno(m_pipe) ));
	m_input_stream_ptr.reset(new std::ostream(m_input_streambuf_ptr.get()));
	m_output_streambuf_ptr.reset(new StreamBuffer( ::fileno(m_pipe) ));
	m_output_stream_ptr.reset(new std::istream(m_output_streambuf_ptr.get()));
}

void ScriptReactor::closePipe(void)
{
	if (m_pipe) {
		PION_LOG_DEBUG(m_logger, "Closing pipe to command: " << m_command);
#ifdef _MSC_VER
		_pclose(m_pipe);
#else
		::pclose(m_pipe);
#endif
		m_input_stream_ptr.reset();
		m_input_streambuf_ptr.reset();
		m_output_stream_ptr.reset();
		m_output_streambuf_ptr.reset();
		m_pipe = NULL;
	}
}

}	// end namespace plugins
}	// end namespace pion


/// creates new ScriptReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_ScriptReactor(void) {
	return new pion::plugins::ScriptReactor();
}

/// destroys ScriptReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_ScriptReactor(pion::plugins::ScriptReactor *reactor_ptr) {
	delete reactor_ptr;
}
