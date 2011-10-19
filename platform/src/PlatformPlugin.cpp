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
#include <pion/platform/Codec.hpp>
#include <pion/platform/Database.hpp>
#include <pion/platform/Protocol.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/platform/ProtocolFactory.hpp>
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

bool PlatformPlugin::getCodecPlugin(CodecPtr& plugin_ptr, const std::string& plugin_id) const
{
	if (m_codec_factory_ptr) {
		plugin_ptr = m_codec_factory_ptr->getCodec(plugin_id);
		return bool(plugin_ptr);
	}
	return false;
}

bool PlatformPlugin::getDatabasePlugin(DatabasePtr& plugin_ptr, const std::string& plugin_id) const
{
	if (m_database_mgr_ptr) {
		plugin_ptr = m_database_mgr_ptr->getDatabase(plugin_id);
		return bool(plugin_ptr);
	}
	return false;
}

bool PlatformPlugin::getProtocolPlugin(ProtocolPtr& plugin_ptr, const std::string& plugin_id) const
{
	if (m_protocol_factory_ptr) {
		plugin_ptr = m_protocol_factory_ptr->getProtocol(plugin_id);
		return bool(plugin_ptr);
	}
	return false;
}

bool PlatformPlugin::hasCodecPlugin(const std::string& plugin_id) const
{
	return (m_codec_factory_ptr && m_codec_factory_ptr->hasPlugin(plugin_id));
}

bool PlatformPlugin::hasDatabasePlugin(const std::string& plugin_id) const
{
	return (m_database_mgr_ptr && m_database_mgr_ptr->hasPlugin(plugin_id));
}

bool PlatformPlugin::hasProtocolPlugin(const std::string& plugin_id) const
{
	return (m_protocol_factory_ptr && m_protocol_factory_ptr->hasPlugin(plugin_id));
}

}	// end namespace platform
}	// end namespace pion
