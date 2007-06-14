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

#ifndef __PION_HTTPTYPES_HEADER__
#define __PION_HTTPTYPES_HEADER__

#include <libpion/PionConfig.hpp>
#include <libpion/PionHashMap.hpp>
#include <boost/functional/hash.hpp>
#include <string>


namespace pion {	// begin namespace pion

///
/// HTTPTypes: common data types used by HTTP
/// 
struct HTTPTypes
{
	
	// generic strings used by HTTP
	static const std::string	STRING_EMPTY;
	static const std::string	STRING_CRLF;
	static const std::string	STRING_HTTP_VERSION;
	static const std::string	HEADER_NAME_VALUE_DELIMINATOR;
	
	// common HTTP header names
	static const std::string	HEADER_HOST;
	static const std::string	HEADER_COOKIE;
	static const std::string	HEADER_SET_COOKIE;
	static const std::string	HEADER_CONNECTION;
	static const std::string	HEADER_CONTENT_TYPE;
	static const std::string	HEADER_CONTENT_LENGTH;
	static const std::string	HEADER_LAST_MODIFIED;
	static const std::string	HEADER_IF_MODIFIED_SINCE;

	// common HTTP content types
	static const std::string	CONTENT_TYPE_HTML;
	static const std::string	CONTENT_TYPE_TEXT;
	static const std::string	CONTENT_TYPE_XML;
	static const std::string	CONTENT_TYPE_URLENCODED;
	
	// common HTTP request methods
	static const std::string	REQUEST_METHOD_HEAD;
	static const std::string	REQUEST_METHOD_GET;
	static const std::string	REQUEST_METHOD_PUT;
	static const std::string	REQUEST_METHOD_POST;
	
	// common HTTP response messages
	static const std::string	RESPONSE_MESSAGE_OK;
	static const std::string	RESPONSE_MESSAGE_NOT_FOUND;
	static const std::string	RESPONSE_MESSAGE_NOT_MODIFIED;
	static const std::string	RESPONSE_MESSAGE_BAD_REQUEST;
	static const std::string	RESPONSE_MESSAGE_SERVER_ERROR;

	// common HTTP response codes
	static const unsigned int	RESPONSE_CODE_OK;
	static const unsigned int	RESPONSE_CODE_NOT_FOUND;
	static const unsigned int	RESPONSE_CODE_NOT_MODIFIED;
	static const unsigned int	RESPONSE_CODE_BAD_REQUEST;
	static const unsigned int	RESPONSE_CODE_SERVER_ERROR;
	
	/// data type for a dictionary of strings (used for HTTP headers)
	typedef PION_HASH_MULTIMAP<std::string, std::string, boost::hash<std::string> >	StringDictionary;

	/// data type for HTTP headers
	typedef StringDictionary	Headers;
	
	/// data type for HTTP query parameters
	typedef StringDictionary	QueryParams;
	
	/// data type for HTTP cookie parameters
	typedef StringDictionary	CookieParams;
	
	/// escapes URL-encoded strings (a%20value+with%20spaces)
	static std::string url_decode(const std::string& str);

	/// converts time_t format into an HTTP-date string
	static std::string get_date_string(const time_t t);
};

}	// end namespace pion

#endif
