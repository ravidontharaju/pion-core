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
