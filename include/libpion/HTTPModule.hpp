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

#ifndef __PION_HTTPMODULE_HEADER__
#define __PION_HTTPMODULE_HEADER__

#include <libpion/PionConfig.hpp>
#include <libpion/PionException.hpp>
#include <libpion/HTTPRequest.hpp>
#include <libpion/TCPConnection.hpp>
#include <boost/noncopyable.hpp>
#include <string>


namespace pion {	// begin namespace pion

///
/// HTTPModule: interface class for HTTP modules
/// 
class HTTPModule :
	private boost::noncopyable
{
public:

	/// exception thrown if the module does not recognize a configuration option
	class UnknownOptionException : public PionException {
	public:
		UnknownOptionException(const std::string& name)
			: PionException("Option not recognized by HTTP module: ", name) {}
	};

	/// default constructor
	HTTPModule(void) {}

	/// virtual destructor
	virtual ~HTTPModule() {}

	/**
     * attempts to handle a new HTTP request
	 *
     * @param request the new HTTP request to handle
     * @param tcp_conn the TCP connection that has the new request
	 *
	 * @return true if the request was handled; false if not
	 */
	virtual bool handleRequest(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn) = 0;
	
	/**
	 * sets a configuration option
	 *
	 * @param name the name of the option to change
	 * @param value the value of the option
	 */
	virtual void setOption(const std::string& name, const std::string& value) {
		throw UnknownOptionException(name);
	}
	
	/// sets the URI stem or resource that is bound to the module (strips any trailing slash)	
	inline void setResource(const std::string& str) { m_resource = stripTrailingSlash(str); }

	/// returns the URI stem or resource that is bound to the module	
	inline const std::string& getResource(void) const { return m_resource; }
	
	/// returns the path to the resource requested, relative to the module's location
	inline std::string getRelativeResource(const std::string& resource_requested) const {
		if (resource_requested.size() <= getResource().size()) {
			// either the request matches the module's resource path (a directory)
			// or the request does not match (should never happen)
			return std::string();
		}
		// strip the module's resource path plus the slash after it
		return HTTPTypes::url_decode(resource_requested.substr(getResource().size() + 1));
	}
	
private:
		
	/// strips trailing slash from string, if one exists
	static inline std::string stripTrailingSlash(const std::string& str) {
		std::string result(str);
		if (!result.empty() && result[result.size()-1]=='/')
			result.resize(result.size() - 1);
		return result;
	}
		
	/// the URI stem or resource that is bound to the module	
	std::string	m_resource;
};


/// All modules implementations that derive from HTTPModule must define a
/// "create" function using this prototype and with an extern "C" declaration
/// that is used to create new objects of that type
///
// HTTPModule *create(void);

/// All modules implementations that derive from HTTPModule must define a
/// "destroy" function using this prototype and with an extern "C" declaration
/// that is used to destroy objects of that type
///
// void destroy(HTTPModule*);


}	// end namespace pion

#endif
