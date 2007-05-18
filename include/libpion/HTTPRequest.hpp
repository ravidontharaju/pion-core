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

#ifndef __PION_HTTPREQUEST_HEADER__
#define __PION_HTTPREQUEST_HEADER__

#include <libpion/PionConfig.hpp>
#include <libpion/HTTPTypes.hpp>
#include <boost/noncopyable.hpp>
#include <boost/shared_ptr.hpp>
#include <string>


namespace pion {	// begin namespace pion

///
/// HTTPRequest: container for HTTP request information
/// 
class HTTPRequest :
	private boost::noncopyable
{
public:

	/// creates new HTTPRequest objects
	static inline boost::shared_ptr<HTTPRequest> create(void) {
		return boost::shared_ptr<HTTPRequest>(new HTTPRequest);
	}

	/// virtual destructor
	virtual ~HTTPRequest() {}

	
	/// returns true if the request is valid
	inline bool isValid(void) const { return m_is_valid; }

	/// returns true if at least one value for the header is defined
	inline bool hasHeader(const std::string& key) const {
		return(m_headers.find(key) != m_headers.end());
	}
	
	/// returns true if at least one value for the query key is defined
	inline bool hasQuery(const std::string& key) const {
		return(m_query_params.find(key) != m_query_params.end());
	}

	/// returns true if at least one value for the cookie is defined
	inline bool hasCookie(const std::string& key) const {
		return(m_cookie_params.find(key) != m_cookie_params.end());
	}

	/// returns the request's major HTTP version number
	inline unsigned int getVersionMajor(void) const { return m_version_major; }

	/// returns the request's minor HTTP version number
	inline unsigned int getVersionMinor(void) const { return m_version_minor; }

	/// returns the resource or uri-stem requested
	inline const std::string& getResource(void) const { return m_resource; }
	
	/// returns the request method (i.e. GET, POST, PUT)
	inline const std::string& getMethod(void) const { return m_method; }
	
	/// returns a value for the header if any are defined; otherwise, an empty string
	inline const std::string& getHeader(const std::string& key) const {
		return getValue(m_headers, key);
	}
	
	/// returns a value for the query key if any are defined; otherwise, an empty string
	inline const std::string& getQuery(const std::string& key) const {
		return getValue(m_query_params, key);
	}

	/// returns a value for the cookie if any are defined; otherwise, an empty string
	inline const std::string& getCookie(const std::string& key) const {
		return getValue(m_cookie_params, key);
	}
	
	/// returns the HTTP request headers
	inline const HTTPTypes::Headers& getHeaders(void) const {
		return m_headers;
	}
	
	/// returns the query parameters
	inline const HTTPTypes::QueryParams& getQueryParams(void) const {
		return m_query_params;
	}
	
	/// returns the cookie parameters
	inline const HTTPTypes::CookieParams& getCookieParams(void) const {
		return m_cookie_params;
	}


	/// sets the resource or uri-stem requested
	inline void setResource(const std::string& str) { m_resource = str; }
	
	/// sets the HTTP request method (i.e. GET, POST, PUT)
	inline void setMethod(const std::string& str) { m_method = str; }
	
	/// sets the request's major HTTP version number
	inline void setVersionMajor(const unsigned int n) { m_version_major = n; }

	/// sets the request's minor HTTP version number
	inline void setVersionMinor(const unsigned int n) { m_version_minor = n; }
	
	/// adds a value for the HTTP request header key
	inline void addHeader(const std::string& key, const std::string& value) {
		m_headers.insert(std::make_pair(key, value));
	}
	
	/// adds a value for the query key
	inline void addQuery(const std::string& key, const std::string& value) {
		m_query_params.insert(std::make_pair(key, value));
	}
	
	/// adds a value for the cookie
	inline void addCookie(const std::string& key, const std::string& value) {
		m_cookie_params.insert(std::make_pair(key, value));
	}

	/// sets whether or not the request is valid
	inline void setIsValid(bool b = true) { m_is_valid = b; }
	
	/// clears all request data
	inline void clear(void) {
		m_resource.erase();
		m_method.erase();
		m_version_major = m_version_minor = 0;
		m_headers.clear();
		m_query_params.clear();
		m_cookie_params.clear();
	}

	/// returns true if the HTTP connection may be kept alive
	inline bool checkKeepAlive(void) const {
		return (getHeader(HTTPTypes::HEADER_CONNECTION) != "close"
				&& (getVersionMajor() > 1
					|| (getVersionMajor() >= 1 && getVersionMinor() >= 1)) );
	}	
	
	
protected:
	
	/// protected constructor restricts creation of objects (use create())
	HTTPRequest(void)
		: m_version_major(0), m_version_minor(0), m_is_valid(false)
	{}

	/**
	 * returns the first value in a dictionary if key is found; or an empty
	 * string if no values are found
	 *
	 * @param dict the dictionary to search for key
	 * @param key the key to search for
	 * @return value if found; empty string if not
	 */
	inline static const std::string& getValue(const HTTPTypes::StringDictionary& dict,
									   const std::string& key)
	{
		HTTPTypes::StringDictionary::const_iterator i = dict.find(key);
		return ( (i==dict.end()) ? HTTPTypes::STRING_EMPTY : i->second );
	}

	
private:

	/// name of the resource being requested, or uri-stem
	std::string					m_resource;

	/// request method (GET, POST, PUT, etc.)
	std::string					m_method;

	/// HTTP major version number for the request
	unsigned int				m_version_major;

	/// HTTP major version number for the request
	unsigned int				m_version_minor;

	/// HTTP request headers
	HTTPTypes::Headers			m_headers;

	/// HTTP query parameters parsed from the request line and post content
	HTTPTypes::QueryParams		m_query_params;

	/// HTTP cookie parameters parsed from the "Cookie" request headers
	HTTPTypes::CookieParams		m_cookie_params;

	/// True if the HTTP request is valid
	bool						m_is_valid;
};


/// data type for a HTTP request pointer
typedef boost::shared_ptr<HTTPRequest>		HTTPRequestPtr;


}	// end namespace pion

#endif
