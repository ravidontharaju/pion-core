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

#ifndef __PION_SCRIPTREACTOR_HEADER__
#define __PION_SCRIPTREACTOR_HEADER__

#include <iosfwd>
#include <string>
#include <vector>
#include <boost/scoped_ptr.hpp>
#include <boost/thread/thread.hpp>
#include <boost/iostreams/stream_buffer.hpp>
#include <boost/iostreams/device/file_descriptor.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionLogger.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/Reactor.hpp>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// ScriptReactor: interfaces with an external shell script or program
///
class ScriptReactor :
	public pion::platform::Reactor
{
public:	
	
	/// exception thrown if the Reactor configuration does not define an Input Codec
	class EmptyInputCodecException : public PionException {
	public:
		EmptyInputCodecException(const std::string& reactor_id)
			: PionException("ScriptReactor configuration is missing a required InputCodec parameter: ", reactor_id) {}
	};
	
	/// exception thrown if the Reactor configuration does not define an Output Codec
	class EmptyOutputCodecException : public PionException {
	public:
		EmptyOutputCodecException(const std::string& reactor_id)
			: PionException("ScriptReactor configuration is missing a required OutputCodec parameter: ", reactor_id) {}
	};
	
	/// exception thrown if the Reactor configuration does not define a Command
	class EmptyCommandException : public PionException {
	public:
		EmptyCommandException(const std::string& reactor_id)
			: PionException("ScriptReactor configuration is missing a required Command parameter: ", reactor_id) {}
	};

	/// exception thrown if there is a problem parsing arguments out of the command string
	class CommandParsingException : public PionException {
	public:
		CommandParsingException(const std::string& command)
			: PionException("ScriptReactor was unable to parse arguments out of command string: ", command) {}
	};

	/// exception thrown if opening a pipe to the shell command fails
	class OpenPipeException : public PionException {
	public:
		OpenPipeException(const std::string& command)
			: PionException("ScriptReactor failed to open pipe: ", command) {}
	};

	/// exception thrown if the Reactor has trouble reading events from the pipe
	class ReadFromPipeException : public PionException {
	public:
		ReadFromPipeException(const std::string& reactor_id)
			: PionException("ScriptReactor failed reading event from pipe: ", reactor_id) {}
	};

	/// exception thrown if the Reactor has trouble writing events to the pipe
	class WriteToPipeException : public PionException {
	public:
		WriteToPipeException(const std::string& reactor_id)
			: PionException("ScriptReactor failed writing an event to pipe: ", reactor_id) {}
	};


	/// constructs a new ScriptReactor object
	ScriptReactor(void)
		: Reactor(TYPE_PROCESSING),
		m_logger(PION_GET_LOGGER("pion.ScriptReactor")),
		m_input_pipe(-1), m_output_pipe(-1), m_child_pid(0)
	{}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~ScriptReactor() { stop(); }
	
	/// called by the ReactorEngine to start Event processing
	virtual void start(void);
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void);
	
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
	 * processes an Event by delivering it to the shell script or program
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void process(const pion::platform::EventPtr& e);
	
	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }
	
	
private:

	/// thread function to read events from the script command
	void readEvents(void);
	
	/// opens a pipe to the script command
	void openPipe(void);

	/// closes the pipe to the script command	
	void closePipe(void);
	
	/// parses out individual arguments from a command string
	void parseArguments(void);
	
	
	/// data type for an iostreams streambuf that uses a C-style file descriptor
	typedef boost::iostreams::stream_buffer<boost::iostreams::file_descriptor>	StreamBuffer;
	

	/// name of the InputCodec element for Pion XML config files
	static const std::string			INPUT_CODEC_ELEMENT_NAME;
	
	/// name of the OutputCodec element for Pion XML config files
	static const std::string			OUTPUT_CODEC_ELEMENT_NAME;
	
	/// name of the Command element for Pion XML config files
	static const std::string			COMMAND_ELEMENT_NAME;
	

	/// primary logging interface used by this class
	PionLogger							m_logger;
	
	/// pointer to the Codec that is used for writing Events to the script
	pion::platform::CodecPtr			m_input_codec_ptr;
	
	/// pointer to the Codec that is used for reading Events from the script
	pion::platform::CodecPtr			m_output_codec_ptr;
	
	/// unique identifier of the Codec that is used for writing Events
	std::string							m_input_codec_id;
	
	/// unique identifier of the Codec that is used for reading Events
	std::string							m_output_codec_id;
	
	/// name of the shell script or program to execute (includes all arguments)
	std::string							m_command;
	
	/// vector of command arguments parsed out (the first is the executable or script)
	std::vector<std::string>			m_args;
	
	/// pipe used to write Events to the shell script or program
	int									m_input_pipe;
	
	/// pipe used to read Events from the shell script or program
	int									m_output_pipe;
	
	/// process id for the shell script or program
	pid_t								m_child_pid;
	
	/// pointer to a C++ stream buffer used to write Events to the pipe
	boost::scoped_ptr<StreamBuffer>		m_input_streambuf_ptr;
	
	/// pointer to a C++ stream buffer used to read Events from the pipe
	boost::scoped_ptr<StreamBuffer>		m_output_streambuf_ptr;
	
	/// pointer to a C++ iostream used to write Events to the pipe
	boost::scoped_ptr<std::ostream>		m_input_stream_ptr;
	
	/// pointer to a C++ iostream used to read Events from the pipe
	boost::scoped_ptr<std::istream>		m_output_stream_ptr;
	
	/// thread used to read events generated by the script
	boost::scoped_ptr<boost::thread>	m_thread_ptr;

	/// used to ensure only event may be written at a time
	boost::mutex						m_write_mutex;
};


}	// end namespace plugins
}	// end namespace pion

#endif
