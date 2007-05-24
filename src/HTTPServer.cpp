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

#include <libpion/HTTPServer.hpp>
#include <libpion/HTTPRequest.hpp>
#include <libpion/HTTPResponse.hpp>
#include <libpion/HTTPRequestParser.hpp>
#include <boost/bind.hpp>
#include <boost/asio.hpp>

#ifndef WIN32
#include <dlfcn.h>
#endif


namespace pion {	// begin namespace pion

// HTTPServer member functions

void HTTPServer::handleConnection(TCPConnectionPtr& tcp_conn)
{
	tcp_conn->setKeepAlive(false);	// default to closing the connection
	HTTPRequestParserPtr request_parser(HTTPRequestParser::create(boost::bind(&HTTPServer::handleRequest,
																			  this, _1, _2), tcp_conn));
	request_parser->readRequest();
}

void HTTPServer::handleRequest(HTTPRequestPtr& http_request,
							   TCPConnectionPtr& tcp_conn)
{
	if (! http_request->isValid()) {
		// the request is invalid or an error occured
		PION_LOG_INFO(m_logger, "Received an invalid HTTP request");

		// lock mutex for thread safety (this should probably use ref counters)
		boost::mutex::scoped_lock modules_lock(m_mutex);

		if (! m_bad_request_module->handleRequest(http_request, tcp_conn)) {
			// this shouldn't ever happen, but just in case
			tcp_conn->finish();
		}
		
		return;
	}
		
	PION_LOG_DEBUG(m_logger, "Received a valid HTTP request");
	
	// set the connection's keep_alive flag
	tcp_conn->setKeepAlive(http_request->checkKeepAlive());

	// strip off trailing slash if the request has one
	std::string resource(http_request->getResource());
	if (! resource.empty() && resource[resource.size() - 1] == '/')
		resource.resize( resource.size() - 1 );

	// true if a module successfully handled the request
	bool request_was_handled = false;
	
	// lock mutex for thread safety (this should probably use ref counters)
	boost::mutex::scoped_lock modules_lock(m_mutex);

	if (m_modules.empty()) {
		
		// no modules configured
		PION_LOG_WARN(m_logger, "No modules configured");
		
	} else {

		// iterate through each module that may be able to handle the request
		ModuleMap::iterator i = m_modules.upper_bound(resource);
		while (i != m_modules.begin()) {
			--i;
			
			// keep checking while the first part of the strings match
			if (resource.compare(0, i->first.size(), i->first) != 0) {
				// we've gone to far; the first part no longer matches
				break;
			}
				
			// only try the module if the request matches the module name or
			// if module name is followed first with a '/' character
			if (resource.size() == i->first.size() || resource[i->first.size()]=='/') {
				
				// try to handle the request with the module
				try {
					request_was_handled = i->second.first->handleRequest(http_request, tcp_conn);
				} catch (std::bad_alloc&) {
					// propagate memory errors (FATAL)
					throw;
				} catch (std::exception& e) {
					// recover gracefully from other exceptions thrown by modules
					PION_LOG_ERROR(m_logger, "HTTP module threw exception (" << resource << "): " << e.what());
					if (! m_server_error_module->handleRequest(http_request, tcp_conn)) {
						// this shouldn't ever happen, but just in case
						tcp_conn->finish();
					}
					request_was_handled = true;
					break;
				}

				if (request_was_handled) {
					// the module successfully handled the request
					PION_LOG_DEBUG(m_logger, "HTTP request handled by module: "
								   << i->first);
					break;
				}
			}
		}
	}
	
	if (! request_was_handled) {
		// no modules found that could handle the request
		PION_LOG_INFO(m_logger, "No modules found to handle HTTP request: " << resource);

		if (! m_not_found_module->handleRequest(http_request, tcp_conn)) {
			// this shouldn't ever happen, but just in case
			tcp_conn->finish();
		}
	}
}

void HTTPServer::addModule(const std::string& resource, HTTPModule *module_ptr)
{
	PionPlugin<HTTPModule> *plugin_ptr(NULL);
	module_ptr->setResource(resource);	// strips any trailing '/' from the name
	boost::mutex::scoped_lock modules_lock(m_mutex);
	m_modules.insert(std::make_pair(module_ptr->getResource(),
									std::make_pair(module_ptr, plugin_ptr)));
}

void HTTPServer::loadModule(const std::string& resource, const std::string& module_file)
{
	PionPlugin<HTTPModule> *plugin_ptr(new PionPlugin<HTTPModule>(module_file));
	HTTPModule *module_ptr(plugin_ptr->create());
	module_ptr->setResource(resource);	// strips any trailing '/' from the name
	boost::mutex::scoped_lock modules_lock(m_mutex);
	m_modules.insert(std::make_pair(module_ptr->getResource(),
									std::make_pair(module_ptr, plugin_ptr)));
}

void HTTPServer::setModuleOption(const std::string& resource,
								 const std::string& name, const std::string& value)
{
	boost::mutex::scoped_lock modules_lock(m_mutex);
	ModuleMap::iterator i = m_modules.find(resource);
	if (i == m_modules.end()) throw ModuleNotFoundException(resource);
	i->second.first->setOption(name, value);
}

void HTTPServer::clearModules(void)
{
	boost::mutex::scoped_lock modules_lock(m_mutex);
	m_modules.clear();
}


// HTTPServer::BadRequestModule member functions

bool HTTPServer::BadRequestModule::handleRequest(HTTPRequestPtr& request,
												 TCPConnectionPtr& tcp_conn)
{
	static const std::string BAD_REQUEST_HTML =
		"<html><head>\n"
		"<title>400 Bad Request</title>\n"
		"</head><body>\n"
		"<h1>Bad Request</h1>\n"
		"<p>Your browser sent a request that this server could not understand.</p>\n"
		"</body></html>\n";
	HTTPResponsePtr response(HTTPResponse::create());
	response->setResponseCode(HTTPTypes::RESPONSE_CODE_BAD_REQUEST);
	response->setResponseMessage(HTTPTypes::RESPONSE_MESSAGE_BAD_REQUEST);
	response->writeNoCopy(BAD_REQUEST_HTML);
	response->send(tcp_conn);
	return true;
}


// HTTPServer::NotFoundModule member functions

bool HTTPServer::NotFoundModule::handleRequest(HTTPRequestPtr& request,
											   TCPConnectionPtr& tcp_conn)
{
	static const std::string NOT_FOUND_HTML =
		"<html><head>\n"
		"<title>404 Not Found</title>\n"
		"</head><body>\n"
		"<h1>Not Found</h1>\n"
		"<p>The requested URL was not found on this server.</p>\n"
		"</body></html>\n";
	HTTPResponsePtr response(HTTPResponse::create());
	response->setResponseCode(HTTPTypes::RESPONSE_CODE_NOT_FOUND);
	response->setResponseMessage(HTTPTypes::RESPONSE_MESSAGE_NOT_FOUND);
	response->writeNoCopy(NOT_FOUND_HTML);
	response->send(tcp_conn);
	return true;
}

// HTTPServer::ServerErrorModule member functions

bool HTTPServer::ServerErrorModule::handleRequest(HTTPRequestPtr& request,
												  TCPConnectionPtr& tcp_conn)
{
	static const std::string SERVER_ERROR_HTML =
		"<html><head>\n"
		"<title>500 Server Error</title>\n"
		"</head><body>\n"
		"<h1>Internal Server Error</h1>\n"
		"<p>The server encountered an internal error.</p>\n"
		"</body></html>\n";
	HTTPResponsePtr response(HTTPResponse::create());
	response->setResponseCode(HTTPTypes::RESPONSE_CODE_SERVER_ERROR);
	response->setResponseMessage(HTTPTypes::RESPONSE_MESSAGE_SERVER_ERROR);
	response->writeNoCopy(SERVER_ERROR_HTML);
	response->send(tcp_conn);
	return true;
}

}	// end namespace pion

