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

#include <boost/algorithm/string/classification.hpp>
#include <boost/algorithm/string/split.hpp>
#include "PlatformConfig.hpp"
#include "PlatformService.hpp"

using namespace pion::net;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)

// static members of PlatformService
const std::string			PlatformService::SERVER_ELEMENT_NAME = "Server";
const std::string			PlatformService::RESOURCE_ELEMENT_NAME = "Resource";

// PlatformService member functions

void PlatformService::setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr)
{
	PlatformPlugin::setConfig(v, config_ptr);

	// find the HTTP resource
	std::string http_resource;
	if (! ConfigManager::getConfigOption(RESOURCE_ELEMENT_NAME, http_resource, config_ptr))
		throw EmptyServiceResourceException(getId());

	// remove the trailing slash (if any) from the HTTP resource
	http_resource = HTTPServer::stripTrailingSlash(http_resource);

	setResource(http_resource);

	// m_server_id will already be assigned if the Service config is nested in a Server config.
	if (m_server_id.empty()) {
		// Find the ID of the Server this Service belongs to.
		if (! ConfigManager::getConfigOption(SERVER_ELEMENT_NAME, m_server_id, config_ptr))
			throw ServerIdOfServiceUnspecifiedException(getId());
	}
}

void PlatformService::splitPathBranches(PathBranches& branches,
										const std::string& resource)
{
	// determine the relative path based on the resource bound to this service
	const std::string relative_path(getRelativeResource(resource));
	
	// split out the path branches into a vector
	boost::algorithm::split(branches, relative_path, boost::algorithm::is_any_of("/"));

	// remove the last element if it is empty
	if (!branches.empty() && branches.back().empty())
		branches.pop_back();
}


}	// end namespace server
}	// end namespace pion
