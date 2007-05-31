// -----------------------------------------------------------------
// libpion: a C++ framework for building lightweight HTTP interfaces
// -----------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
//

#include <libpion/HTTPTypes.hpp>


namespace pion {		// begin namespace pion


// generic strings used by HTTP
const std::string	HTTPTypes::STRING_EMPTY;
const std::string	HTTPTypes::STRING_CRLF("\r\n");
const std::string	HTTPTypes::STRING_HTTP_VERSION("HTTP/1.1");
const std::string	HTTPTypes::HEADER_NAME_VALUE_DELIMINATOR(": ");

// common HTTP header names
const std::string	HTTPTypes::HEADER_HOST("Host");
const std::string	HTTPTypes::HEADER_COOKIE("Cookie");
const std::string	HTTPTypes::HEADER_SET_COOKIE("Set-Cookie");
const std::string	HTTPTypes::HEADER_CONNECTION("Connection");
const std::string	HTTPTypes::HEADER_CONTENT_TYPE("Content-Type");
const std::string	HTTPTypes::HEADER_CONTENT_LENGTH("Content-Length");

// common HTTP content types
const std::string	HTTPTypes::CONTENT_TYPE_HTML("text/html");
const std::string	HTTPTypes::CONTENT_TYPE_TEXT("text/plain");
const std::string	HTTPTypes::CONTENT_TYPE_XML("text/xml");
const std::string	HTTPTypes::CONTENT_TYPE_URLENCODED("application/x-www-form-urlencoded");

// common HTTP response messages
const std::string	HTTPTypes::RESPONSE_MESSAGE_OK("OK");
const std::string	HTTPTypes::RESPONSE_MESSAGE_NOT_FOUND("Not Found");
const std::string	HTTPTypes::RESPONSE_MESSAGE_BAD_REQUEST("Bad Request");
const std::string	HTTPTypes::RESPONSE_MESSAGE_SERVER_ERROR("Server Error");

// common HTTP response codes
const unsigned int	HTTPTypes::RESPONSE_CODE_OK = 200;
const unsigned int	HTTPTypes::RESPONSE_CODE_NOT_FOUND = 404;
const unsigned int	HTTPTypes::RESPONSE_CODE_BAD_REQUEST = 400;
const unsigned int	HTTPTypes::RESPONSE_CODE_SERVER_ERROR = 500;

std::string HTTPTypes::url_decode(const std::string& str)
{
	char decode_buf[3];
	std::string result;
	result.reserve(str.size());
	
	for (std::string::size_type pos = 0; pos < str.size(); ++pos) {
		switch(str[pos]) {
		case '+':
			// convert to space character
			result += ' ';
			break;
		case '%':
			// decode hexidecimal value
			if (pos + 2 < str.size()) {
				decode_buf[0] = str[++pos];
				decode_buf[1] = str[++pos];
				decode_buf[2] = '\0';
				result += static_cast<char>( strtol(decode_buf, 0, 16) );
			} else {
				// recover from error by not decoding character
				result += '%';
			}
			break;
		default:
			// character does not need to be escaped
			result += str[pos];
		}
	};
	
	return result;
}

}	// end namespace pion

