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

#include <pion/PionPlugin.hpp>
#include "PlatformConfig.hpp"

using namespace pion::net;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)

	
// static members of PlatformConfig
	
const std::string			PlatformConfig::DEFAULT_CONFIG_FILE = "platform.xml";
const std::string			PlatformConfig::VOCABULARY_CONFIG_ELEMENT_NAME = "VocabularyConfig";
const std::string			PlatformConfig::CODEC_CONFIG_ELEMENT_NAME = "CodecConfig";
const std::string			PlatformConfig::DATABASE_CONFIG_ELEMENT_NAME = "DatabaseConfig";
const std::string			PlatformConfig::REACTOR_CONFIG_ELEMENT_NAME = "ReactorConfig";
const std::string			PlatformConfig::SERVICE_CONFIG_ELEMENT_NAME = "ServiceConfig";
const std::string			PlatformConfig::PLUGIN_PATH_ELEMENT_NAME = "PluginPath";
	
		
// PlatformConfig member functions

PlatformConfig::PlatformConfig(void)
	: ConfigManager(DEFAULT_CONFIG_FILE),
	m_vocab_mgr(), m_codec_factory(m_vocab_mgr), m_database_mgr(m_vocab_mgr),
	m_reaction_engine(m_vocab_mgr, m_codec_factory, m_database_mgr),
	m_service_mgr(*this)
{
	setLogger(PION_GET_LOGGER("pion.server.PlatformConfig"));
}

void PlatformConfig::openConfigFile(void)
{
	// just return if it's already open
	if (configIsOpen())
		return;
	
	// open the file and find the "config" root element
	ConfigManager::openConfigFile();

	// Step through plugin path definitions
	std::string plugin_path;
	xmlNodePtr path_node = m_config_node_ptr->children;
	while ( (path_node = ConfigManager::findConfigNodeByName(PLUGIN_PATH_ELEMENT_NAME, path_node)) != NULL)
	{
		// get the plug-in path value
		xmlChar *xml_char_ptr = xmlNodeGetContent(path_node);
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyPluginPathException(getConfigFile());
		}
		plugin_path = reinterpret_cast<char*>(xml_char_ptr);
		xmlFree(xml_char_ptr);
		
		// add the plug-in path (only warn if directory not found)
		try {
			PionPlugin::addPluginDirectory(ConfigManager::resolveRelativePath(plugin_path));
		} catch (PionPlugin::DirectoryNotFoundException& e) {
			PION_LOG_WARN(m_logger, e.what());
		}
		
		// step to the next plug-in path
		path_node = path_node->next;
	}
	
	// get the VocabularyManager config file
	std::string config_file;
	if (! ConfigManager::getConfigOption(VOCABULARY_CONFIG_ELEMENT_NAME, config_file,
										 m_config_node_ptr->children))
		throw MissingVocabularyConfigException(getConfigFile());
	
	// open the VocabularyManager configuration
	m_vocab_mgr.setConfigFile(ConfigManager::resolveRelativePath(config_file));
	m_vocab_mgr.openConfigFile();
	
	// get the CodecFactory config file
	if (! ConfigManager::getConfigOption(CODEC_CONFIG_ELEMENT_NAME, config_file,
										 m_config_node_ptr->children))
		throw MissingCodecConfigException(getConfigFile());
	
	// open the CodecFactory configuration
	m_codec_factory.setConfigFile(ConfigManager::resolveRelativePath(config_file));
	m_codec_factory.openConfigFile();
	
	// get the DatabaseManager config file
	if (! ConfigManager::getConfigOption(DATABASE_CONFIG_ELEMENT_NAME, config_file,
										 m_config_node_ptr->children))
		throw MissingDatabaseConfigException(getConfigFile());
	
	// open the DatabaseManager configuration
	m_database_mgr.setConfigFile(ConfigManager::resolveRelativePath(config_file));
	m_database_mgr.openConfigFile();
	
	// get the ReactionEngine config file
	if (! ConfigManager::getConfigOption(REACTOR_CONFIG_ELEMENT_NAME, config_file,
										 m_config_node_ptr->children))
		throw MissingReactorConfigException(getConfigFile());
	
	// open the ReactionEngine configuration
	m_reaction_engine.setConfigFile(ConfigManager::resolveRelativePath(config_file));
	m_reaction_engine.openConfigFile();
	
	// get the ServiceManager config file
	if (! ConfigManager::getConfigOption(SERVICE_CONFIG_ELEMENT_NAME, config_file,
										 m_config_node_ptr->children))
		throw MissingServiceConfigException(getConfigFile());
	
	// open the ServiceManager configuration
	m_service_mgr.setConfigFile(ConfigManager::resolveRelativePath(config_file));
	m_service_mgr.openConfigFile();
	
	PION_LOG_INFO(m_logger, "Loaded platform configuration file: " << m_config_file);
}

	
}	// end namespace server
}	// end namespace pion
