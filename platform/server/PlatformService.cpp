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

		
// PlatformService member functions

void PlatformService::setConfig(PlatformConfig& platform_cfg, const xmlNodePtr config_ptr)
{
	m_config_ptr = &platform_cfg;
	PlatformPlugin::setConfig(platform_cfg.getVocabularyManager().getVocabulary(), config_ptr);
}

void PlatformService::splitPathBranches(PathBranches& branches,
										const std::string& resource)
{
	const std::string relative_path(getRelativeResource(resource));
	boost::algorithm::split(branches, relative_path, boost::algorithm::is_any_of("/"));
}
	
	
}	// end namespace server
}	// end namespace pion
