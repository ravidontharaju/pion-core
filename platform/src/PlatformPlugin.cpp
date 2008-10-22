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

#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/PlatformPlugin.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of PlatformPlugin
const std::string			PlatformPlugin::NAME_ELEMENT_NAME = "Name";
const std::string			PlatformPlugin::COMMENT_ELEMENT_NAME = "Comment";
	
		
// PlatformPlugin member functions

void PlatformPlugin::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// get the descriptive name for the plugin (if any)
	ConfigManager::getConfigOption(NAME_ELEMENT_NAME, m_plugin_name,
								   config_ptr);

	// get the descriptive comments for the plugin (if any)
	ConfigManager::getConfigOption(COMMENT_ELEMENT_NAME, m_plugin_comment,
								   config_ptr);
}
	
void PlatformPlugin::updateVocabulary(const Vocabulary& v)
{
	// nothing is currently necessary
}

}	// end namespace platform
}	// end namespace pion
