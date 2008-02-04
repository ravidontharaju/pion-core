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

#ifndef __PION_PLATFORMSERVICE_HEADER__
#define __PION_PLATFORMSERVICE_HEADER__

#include <string>
#include <libxml/tree.h>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/net/WebService.hpp>
#include <pion/platform/PlatformPlugin.hpp>


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)

	
// forward declarations to avoid header dependencies
class PlatformConfig;
	
	
///
/// PlatformService: Pion Platform WebService that supports XML configuration
///
class PlatformService
	: public pion::platform::PlatformPlugin,
	public pion::net::WebService
{
public:

	/// constructs a new PlatformService object
	PlatformService(void) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~PlatformService() {}
	
	/**
	 * attempts to handle a new HTTP request
	 *
	 * @param request the new HTTP request to handle
	 * @param tcp_conn the TCP connection that has the new request
	 *
	 * @return true if the request was handled; false if not
	 */
	virtual void operator()(pion::net::HTTPRequestPtr& request,
							pion::net::TCPConnectionPtr& tcp_conn) = 0;

	/**
	 * sets configuration parameters for this plug-in
	 *
	 * @param platform_cfg reference to the platform configuration manager
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 */
	virtual void setConfig(PlatformConfig& platform_cfg,
						   const xmlNodePtr config_ptr);
};

	
}	// end namespace server
}	// end namespace pion

#endif
