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

#include <libpion/HTTPModule.hpp>
#include <libpion/HTTPResponse.hpp>
#include <boost/bind.hpp>

using namespace pion;


/// Module that echos the request back (to test request parsing)
class EchoModule :
	public HTTPModule
{
public:
	EchoModule(void) {}
	virtual ~EchoModule() {}
	virtual bool handleRequest(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn);
	
private:
	static inline void writeDictionaryTerm(HTTPResponsePtr& response,
										   const HTTPTypes::Headers::value_type& val,
										   const bool decode);
};


/// handles requests for EchoModule
bool EchoModule::handleRequest(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	// this modules uses static text to test the mixture of "copied" with
	// "static" (no-copy) text
	static const std::string REQUEST_ECHO_TEXT("[Request Echo]");
	static const std::string REQUEST_HEADERS_TEXT("[Request Headers]");
	static const std::string QUERY_PARAMS_TEXT("[Query Parameters]");
	static const std::string COOKIE_PARAMS_TEXT("[Cookie Parameters]");
	static const std::string POST_CONTENT_TEXT("[POST Content]");
	
	// Set Content-type to "text/plain" (plain ascii text)
	HTTPResponsePtr response(HTTPResponse::create());
	response->setContentType("text/plain");
	
	// write request information
	response->writeNoCopy(REQUEST_ECHO_TEXT);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	response
		<< "Request method: "
		<< request->getMethod()
		<< HTTPTypes::STRING_CRLF
		<< "Resource requested: "
		<< request->getResource()
		<< HTTPTypes::STRING_CRLF
		<< "Query string: "
		<< request->getQueryString()
		<< HTTPTypes::STRING_CRLF
		<< "HTTP version: "
		<< request->getVersionMajor() << '.' << request->getVersionMinor()
		<< HTTPTypes::STRING_CRLF
		<< "Content length: "
		<< request->getContentLength()
		<< HTTPTypes::STRING_CRLF
		<< HTTPTypes::STRING_CRLF;
			 
	// write request headers
	response->writeNoCopy(REQUEST_HEADERS_TEXT);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	std::for_each(request->getHeaders().begin(), request->getHeaders().end(),
				  boost::bind(&EchoModule::writeDictionaryTerm, response, _1, false));
	response->writeNoCopy(HTTPTypes::STRING_CRLF);

	// write query parameters
	response->writeNoCopy(QUERY_PARAMS_TEXT);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	std::for_each(request->getQueryParams().begin(), request->getQueryParams().end(),
				  boost::bind(&EchoModule::writeDictionaryTerm, response, _1, true));
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	
	// write cookie parameters
	response->writeNoCopy(COOKIE_PARAMS_TEXT);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	std::for_each(request->getCookieParams().begin(), request->getCookieParams().end(),
				  boost::bind(&EchoModule::writeDictionaryTerm, response, _1, false));
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	
	// write POST content
	response->writeNoCopy(POST_CONTENT_TEXT);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	response->writeNoCopy(HTTPTypes::STRING_CRLF);
	response->write(request->getPostContent(), request->getContentLength());
	
	// send the response
	response->send(tcp_conn);
	return true;
}

inline void EchoModule::writeDictionaryTerm(HTTPResponsePtr& response,
											const HTTPTypes::Headers::value_type& val,
											const bool decode)
{
	// text is copied into response text cache
	response << val.first << HTTPTypes::HEADER_NAME_VALUE_DELIMINATOR
		<< (decode ? HTTPTypes::url_decode(val.second) : val.second)
		<< HTTPTypes::STRING_CRLF;
}


/// creates new EchoModule objects
extern "C" EchoModule *EchoModule_LTX_create(void)
{
	return new EchoModule();
}


/// destroys EchoModule objects
extern "C" void EchoModule_LTX_destroy(EchoModule *module_ptr)
{
	delete module_ptr;
}
