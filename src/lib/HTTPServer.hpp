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

#ifndef __PION_HTTPSERVER_HEADER__
#define __PION_HTTPSERVER_HEADER__

#include "PionLogger.hpp"
#include "HTTPModule.hpp"
#include "TCPServer.hpp"
#include "TCPConnection.hpp"
#include <boost/shared_ptr.hpp>
#include <boost/thread/mutex.hpp>
#include <string>
#include <map>


namespace pion {	// begin namespace pion

///
/// HTTPServer: a server that handles HTTP connections
///
class HTTPServer : public TCPServer {

public:

	/// default destructor
	virtual ~HTTPServer() {}

	/**
	 * constructs a new HTTP server
     * 
     * @param tcp_port port number used to listen for new connections
	 */
	explicit HTTPServer(const unsigned int tcp_port)
		: TCPServer(tcp_port), m_bad_request_module(new BadRequestModule),
		m_not_found_module(new NotFoundModule)
	{ 
		setLogger(log4cxx::Logger::getLogger("Pion.HTTPServer"));
	}

	/// adds a new module to the HTTP server
	void addModule(HTTPModulePtr m);
	
	/// clears all the modules that are currently configured
	void clearModules(void);
	
	/// sets the module that handles bad HTTP requests
	inline void setBadRequestModule(HTTPModulePtr m) { m_bad_request_module = m; }
	
	/// sets the module that handles requests which match no other module
	inline void setNotFoundModule(HTTPModulePtr m) { m_not_found_module = m; }
	
	/// sets the logger to be used
	inline void setLogger(log4cxx::LoggerPtr log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline log4cxx::LoggerPtr getLogger(void) { return m_logger; }

	
protected:
	
	/**
	 * handles a new TCP connection
	 * 
	 * @param tcp_conn the new TCP connection to handle
	 */
	virtual void handleConnection(TCPConnectionPtr& tcp_conn);
	
	/**
	 * handles a new HTTP request
	 *
	 * @param http_request the HTTP request to handle
	 * @param tcp_conn TCP connection containing a new request
	 */
	void handleRequest(HTTPRequestPtr& http_request, TCPConnectionPtr& tcp_conn);
		
	
private:

	/// used to send responses when a bad HTTP request is made
	class BadRequestModule : public HTTPModule {
	protected:
		static const std::string	BAD_REQUEST_HTML;
	public:
		virtual ~BadRequestModule() {}
		BadRequestModule(void) : HTTPModule("") {}
		virtual bool handleRequest(HTTPRequestPtr& request,
								   TCPConnectionPtr& tcp_conn,
								   TCPConnection::ConnectionHandler& keepalive_handler);
	};
	
	/// used to send responses when a no modules can handle the request
	class NotFoundModule : public HTTPModule {
	protected:
		static const std::string	NOT_FOUND_HTML;
	public:
		virtual ~NotFoundModule() {}
		NotFoundModule(void) : HTTPModule("") {}
		virtual bool handleRequest(HTTPRequestPtr& request,
								   TCPConnectionPtr& tcp_conn,
								   TCPConnection::ConnectionHandler& keepalive_handler);
	};
	
	/// data type for a collection of HTTP modules
	typedef std::multimap<std::string, HTTPModulePtr>	ModuleMap;
	
	/// primary logging interface used by this class
	log4cxx::LoggerPtr		m_logger;

	/// HTTP modules associated with this server
	ModuleMap				m_modules;

	/// mutex to make class thread-safe
	boost::mutex			m_mutex;

	/// points to the module that handles bad HTTP requests
	HTTPModulePtr			m_bad_request_module;
	
	/// points to the module that handles requests which match no other module
	HTTPModulePtr			m_not_found_module;
};


/// data type for a HTTP protocol handler pointer
typedef boost::shared_ptr<HTTPServer>		HTTPServerPtr;


}	// end namespace pion

#endif
