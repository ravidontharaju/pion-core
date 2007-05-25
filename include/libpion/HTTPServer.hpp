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

#include <libpion/PionConfig.hpp>
#include <libpion/PionException.hpp>
#include <libpion/PionPlugin.hpp>
#include <libpion/TCPServer.hpp>
#include <libpion/TCPConnection.hpp>
#include <libpion/HTTPModule.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/thread/mutex.hpp>
#include <string>
#include <map>


namespace pion {	// begin namespace pion

///
/// HTTPServer: a server that handles HTTP connections
///
class HTTPServer :
	public TCPServer
{

public:

	/// exception thrown if a module cannot be found
	class ModuleNotFoundException : public PionException {
	public:
		ModuleNotFoundException(const std::string& resource)
			: PionException("No modules are identified by the resource: ", resource) {}
	};

	/**
	 * creates new HTTPServer objects
	 *
	 * @param tcp_port port number used to listen for new connections
	 */
	static inline boost::shared_ptr<HTTPServer> create(const unsigned int tcp_port)
	{
		return boost::shared_ptr<HTTPServer>(new HTTPServer(tcp_port));
	}

	/// default destructor
	virtual ~HTTPServer() {}
	
	/**
	 * adds a new module to the HTTP server
	 *
	 * @param resource the resource name or uri-stem to bind to the module
	 * @param module_ptr a pointer to the module
	 */
	void addModule(const std::string& resource, HTTPModule *module_ptr);
	
	/**
	 * loads a module from a shared object file
	 *
	 * @param resource the resource name or uri-stem to bind to the module
	 * @param module_name the name of the module to load (searches plug-in
	 *        directories and appends extensions)
	 */
	void loadModule(const std::string& resource, const std::string& module_name);
	
	/**
	 * sets a configuration options for the module associated with resource
	 *
	 * @param resource the resource name or uri-stem that identifies the module
	 * @param name the name of the configuration option
	 * @param value the value to set the option to
	 */
	void setModuleOption(const std::string& resource,
						 const std::string& name, const std::string& value);

	/// clears all the modules that are currently configured
	void clearModules(void);
	
	/// sets the module that handles bad HTTP requests
	inline void setBadRequestModule(HTTPModule *m) { m_bad_request_module.reset(m); }
	
	/// sets the module that handles requests which match no other module
	inline void setNotFoundModule(HTTPModule *m) { m_not_found_module.reset(m); }
	
	/// sets the module that handles requests which match no other module
	inline void setServerErrorModule(HTTPModule *m) { m_server_error_module.reset(m); }
	
protected:
	
	/**
	 * protected constructor restricts creation of objects (use create())
	 * 
	 * @param tcp_port port number used to listen for new connections
	 */
	explicit HTTPServer(const unsigned int tcp_port)
		: TCPServer(tcp_port), m_bad_request_module(new BadRequestModule),
		m_not_found_module(new NotFoundModule),
		m_server_error_module(new ServerErrorModule)
	{ 
		setLogger(PION_GET_LOGGER("Pion.HTTPServer"));
	}
	
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
	public:
		virtual ~BadRequestModule() {}
		BadRequestModule(void) {}
		virtual bool handleRequest(HTTPRequestPtr& request,
								   TCPConnectionPtr& tcp_conn);
	};
	
	/// used to send responses when a no modules can handle the request
	class NotFoundModule : public HTTPModule {
	public:
		virtual ~NotFoundModule() {}
		NotFoundModule(void) {}
		virtual bool handleRequest(HTTPRequestPtr& request,
								   TCPConnectionPtr& tcp_conn);
	};
	
	/// used to send responses when a server error occurs
	class ServerErrorModule : public HTTPModule {
	public:
		virtual ~ServerErrorModule() {}
		ServerErrorModule(void) {}
		virtual bool handleRequest(HTTPRequestPtr& request,
								   TCPConnectionPtr& tcp_conn);
	};

	/// used by ModuleMap to associated moudle objects with plugin libraries
	typedef std::pair<HTTPModule *, PionPluginPtr<HTTPModule> *>	PluginPair;
	
	/// data type for a collection of HTTP modules
	class ModuleMap
		: public std::multimap<std::string, PluginPair>
	{
	public:
		void clear(void) {
			for (iterator i = begin(); i != end(); ++i) {
				if (i->second.second != NULL) {
					i->second.second->destroy(i->second.first);
					delete i->second.second;
				} else {
					delete i->second.first;
				}
			}
		}
		virtual ~ModuleMap() { clear(); }
		ModuleMap(void) {}
	};
	
	/// HTTP modules associated with this server
	ModuleMap						m_modules;

	/// mutex to make class thread-safe
	boost::mutex					m_mutex;

	/// points to the module that handles bad HTTP requests
	boost::shared_ptr<HTTPModule>	m_bad_request_module;
	
	/// points to the module that handles requests which match no other module
	boost::shared_ptr<HTTPModule>	m_not_found_module;

	/// points to the module that handles server errors
	boost::shared_ptr<HTTPModule>	m_server_error_module;
};


/// data type for a HTTP protocol handler pointer
typedef boost::shared_ptr<HTTPServer>		HTTPServerPtr;


}	// end namespace pion

#endif
