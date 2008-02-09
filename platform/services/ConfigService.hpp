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

#ifndef __PION_CONFIGSERVICE_HEADER__
#define __PION_CONFIGSERVICE_HEADER__

#include <pion/PionConfig.hpp>
#include "PlatformService.hpp"


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)

	
///
/// ConfigService: Platform WebService used to manage configuration
///
class ConfigService
	: public PlatformService
{
public:
	
	/// constructs a new ConfigService object
	ConfigService(void) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~ConfigService() {}
	
	/**
	 * attempts to handle a new HTTP request
	 *
	 * @param request the new HTTP request to handle
	 * @param tcp_conn the TCP connection that has the new request
	 */
	virtual void operator()(pion::net::HTTPRequestPtr& request,
							pion::net::TCPConnectionPtr& tcp_conn);
};

	
}	// end namespace server
}	// end namespace pion

#endif
