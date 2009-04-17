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
#include "SMTPProtocol.hpp"

//using namespace pion::net;
using namespace pion::platform;

namespace pion {	// begin namespace pion
namespace plugins {		// begin namespace plugins

class SMTPParser
{
	enum SMTP_Command
	{
		SMTP_CMD_UNKNOWN = -1,
		SMTP_CMD_EHLO = 0,
		SMTP_CMD_HELO,
		SMTP_CMD_MAIL,
		SMTP_CMD_RCPT,
		SMTP_CMD_DATA,
		SMTP_CMD_RSET,
		SMTP_CMD_NOOP,
		SMTP_CMD_QUIT,
		SMTP_CMD_VRFY
	};

public:
	SMTPParser();

private:
	/** parses a SMTP command
	 * @param ptr - input buffer
	 * @param len - buffer length
	 * @param cmd - parsed command's code
	 * @param processed - number of bytes processed
	 * retval true if the command parsed successfully, false if parsing failed, indeterminate 
	 *    if the buffer contains not enough data
	 */
	boost::tribool parseCommand(const char *ptr, size_t len, 
		SMTP_Command& cmd, size_t& processed);

	/** parses a SMTP server response
	 * @param ptr - input buffer
	 * @param len - buffer length
	 * @param cmd - parsed response code
	 * @param processed - number of bytes processed
	 * retval true if the restonse parsed successfully, false if parsing failed, indeterminate 
	 *    if the buffer contains not enough data
	 */
	boost::tribool parseResponse(const char *ptr, size_t len, int& code, size_t& processed);

	/** finds a single <CRLF> separated line
	 * @param ptr - input buffer
	 * @param len - buffer length
	 * @retval line length, in bytes, excluding <CRLF> separator sequence; -1 if no line separator found
	 */
	size_t parseLine(const char *ptr, size_t len)
	{
		for(size_t i = 0; i < len-1; ++i) {
			if(ptr[i] == 0x0d && ptr[i+1] == 0x0a) return i;
		}
		return -1;
	}
};

boost::tribool SMTPParser::parseCommand(const char *ptr, size_t len, SMTP_Command& cmd, size_t& processed)
{
	size_t lineLen = parseLine(ptr, len);
	static char* commands[] = {"EHLO", "HELO", "MAIL", "RCPT", "DATA", "RSET", "NOOP", "QUIT", "VRFY"};
	static const int CMD_NAME_LEN = 4;

	if(lineLen == -1) { return boost::indeterminate; }
	processed = lineLen + 2;

	if(lineLen < CMD_NAME_LEN) { return false; }
	/* lookup a command name */
	for(int i=0;i < sizeof(commands)/sizeof(commands[0]); ++i) {
		if(memcmp(ptr, commands[i], CMD_NAME_LEN) == 0) {
			cmd = static_cast<SMTP_Command>(i);
			return true;
		}
	}

	cmd = SMTP_CMD_UNKNOWN;
	return false;
}


boost::tribool SMTPParser::parseResponse(const char *ptr, size_t len, int& code, size_t& processed)
{
	static const int MIN_RESPONSE_LEN = 3;
	size_t lineLen = parseLine(ptr, len);

	if(lineLen == -1) { return boost::indeterminate; }
	processed = lineLen + 2;

	if(lineLen < MIN_RESPONSE_LEN) { return false; }

	code = atoi(ptr);

	return code != 0;
}

void SMTPProtocol::reset()
{
}

bool SMTPProtocol::close(pion::platform::EventPtr& event_ptr_ref)
{
	return false;
}

boost::shared_ptr<Protocol> SMTPProtocol::clone(void) const
{
	SMTPProtocol* retval = new SMTPProtocol;
	retval->copyProtocol(*this);

	return ProtocolPtr(retval);
}

boost::tribool SMTPProtocol::readNext(bool request, const char *ptr, size_t len, 
									  boost::posix_time::ptime data_timestamp,
									  boost::posix_time::ptime ack_timestamp,
									  EventPtr& event_ptr_ref)
{
	boost::tribool rc;

	if (ptr == NULL) {
		// missing data 
	}

	return rc;
}

}	// end namespace plugins
}	// end namespace pion



/// creates new SMTPProtocol objects
extern "C" PION_PLUGIN_API pion::platform::Protocol *pion_create_SMTPProtocol(void) {
	return new pion::plugins::SMTPProtocol();
}

/// destroys SMTPProtocol objects
extern "C" PION_PLUGIN_API void pion_destroy_SMTPProtocol(pion::plugins::SMTPProtocol *protocol_ptr) {
	delete protocol_ptr;
}
