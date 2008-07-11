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
namespace plugins {		// begin namespace plugins


///
/// ConfigService: Platform WebService used to manage configuration
///
class ConfigService
	: public pion::server::PlatformService
{
public:
	
	/// exception thrown if the ConfigService configuration does not define a UI directory
	class MissingUIDirectoryException : public PionException {
	public:
		MissingUIDirectoryException()
			: PionException("The ConfigService configuration is missing a UIDirectory parameter") {}
	};


	/// constructs a new ConfigService object
	ConfigService(void) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~ConfigService() {}

	/**
	 * sets configuration parameters for this ConfigService
	 *
	 * @param platform_cfg reference to the platform configuration manager
	 * @param config_ptr pointer to a list of XML nodes containing ConfigService
	 *                   configuration parameters
	 */
	virtual void setConfig(pion::server::PlatformConfig& platform_cfg,
						   const xmlNodePtr config_ptr);

	/**
	 * attempts to handle a new HTTP request
	 *
	 * @param request the new HTTP request to handle
	 * @param tcp_conn the TCP connection that has the new request
	 */
	virtual void operator()(pion::net::HTTPRequestPtr& request,
							pion::net::TCPConnectionPtr& tcp_conn);

private:

	/// name of the UI directory element for Pion XML config files
	static const std::string		UI_DIRECTORY_ELEMENT_NAME;

	/// directory containing the UI files
	std::string						m_ui_directory;
};

	
}	// end namespace plugins
}	// end namespace pion

#endif
