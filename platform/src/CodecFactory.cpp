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

#include <pion/platform/CodecFactory.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of CodecFactory
const std::string			CodecFactory::DEFAULT_CONFIG_FILE = "codecs.xml";
const std::string			CodecFactory::CODEC_ELEMENT_NAME = "codec";
const std::string			CodecFactory::PLUGIN_ELEMENT_NAME = "plugin";
const std::string			CodecFactory::ID_ATTRIBUTE_NAME = "id";


// CodecFactory member functions

void CodecFactory::createConfigFile(void)
{
	boost::mutex::scoped_lock factory_lock(m_mutex);

	// just return if it's already open
	if (configIsOpen())
		return;
	
	// create the file with "config" root element
	ConfigManager::createConfigFile();
	
	PION_LOG_INFO(m_logger, "Initializing new codec configuration file: " << m_config_file);
}

void CodecFactory::openConfigFile(void)
{
	boost::mutex::scoped_lock factory_lock(m_mutex);

	// just return if it's already open
	if (configIsOpen())
		return;
	
	// open the file and find the "config" root element
	ConfigManager::openConfigFile();

	xmlNodePtr codec_node = m_config_node_ptr->children;
	while ( (codec_node = findConfigNodeByName(CODEC_ELEMENT_NAME, codec_node)) != NULL)
	{
		// parse new codec definition
		xmlChar *xml_char_ptr = xmlGetProp(codec_node, reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyCodecIdException(getConfigFile());
		}
		const std::string new_codec_id(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);
		
		// find plug-in type
		std::string new_codec_plugin;
		if (! getConfigOption(PLUGIN_ELEMENT_NAME, new_codec_plugin, codec_node->children))
			throw EmptyPluginException(new_codec_id);
		
		// add the codec and set the codec's configuration
		Codec *new_codec_ptr = m_codecs.load(new_codec_id, new_codec_plugin);
		new_codec_ptr->setId(new_codec_id);
		new_codec_ptr->setConfig(m_vocabulary, codec_node->children);

		PION_LOG_DEBUG(m_logger, "Loaded codec (" << new_codec_plugin << "): " << new_codec_id);
		codec_node = codec_node->next;
	}
				   
	PION_LOG_INFO(m_logger, "Loaded codec configuration file: " << getConfigFile());
}

void CodecFactory::removeCodec(const std::string& codec_id)
{
	// make sure that the Codecs configuration file is open
	if (! configIsOpen())
		throw CodecConfigNotOpenException(getConfigFile());

	// convert "plugin not found" exceptions into "codec not found"
	boost::mutex::scoped_lock factory_lock(m_mutex);
	try { m_codecs.remove(codec_id); }
	catch (PluginManager<Codec>::PluginNotFoundException& /* e */) {
		throw CodecNotFoundException(codec_id);
	}
	
	// remove it from the Codec config file
	xmlNodePtr codec_node = findConfigNodeByAttr(CODEC_ELEMENT_NAME,
												 ID_ATTRIBUTE_NAME,
												 codec_id,
												 m_config_node_ptr->children);
	if (codec_node == NULL)
		throw RemoveCodecConfigException(codec_id);
	xmlUnlinkNode(codec_node);
	xmlFreeNode(codec_node);
	
	// save the new XML config file
	saveConfigFile();
	
	m_signal_codec_updated();
	PION_LOG_DEBUG(m_logger, "Removed codec: " << codec_id);
}
	
std::string CodecFactory::addCodec(const std::string& codec_plugin,
								   const xmlNodePtr codec_config_ptr)
{
	std::string codec_id(createUniqueObjectId());
	
	// make sure that the Codecs configuration file is open
	if (! configIsOpen())
		throw CodecConfigNotOpenException(getConfigFile());

	// create and set configuration options for the codec
	boost::mutex::scoped_lock factory_lock(m_mutex);
	Codec *new_codec_ptr = m_codecs.load(codec_id, codec_plugin);
	new_codec_ptr->setId(codec_id);
	if (codec_config_ptr != NULL)
		new_codec_ptr->setConfig(m_vocabulary, codec_config_ptr);
	
	// add it to the Codec config file
	
	// create a new node for the codec and add it to the XML config document
	xmlNodePtr new_codec_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(CODEC_ELEMENT_NAME.c_str()));
	if (new_codec_node == NULL)
		throw AddCodecConfigException(codec_id);
	if ((new_codec_node=xmlAddChild(m_config_node_ptr, new_codec_node)) == NULL) {
		xmlFreeNode(new_codec_node);
		throw AddCodecConfigException(codec_id);
	}
	
	// set the id attribute for the codec element
	if (xmlNewProp(new_codec_node, reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
				   reinterpret_cast<const xmlChar*>(codec_id.c_str())) == NULL)
		throw AddCodecConfigException(codec_id);
	
	// add a plugin type child element to the codec
	if (xmlNewTextChild(new_codec_node, NULL,
						reinterpret_cast<const xmlChar*>(PLUGIN_ELEMENT_NAME.c_str()),
						reinterpret_cast<const xmlChar*>(codec_plugin.c_str())) == NULL)
		throw AddCodecConfigException(codec_id);

	// update the codec configuration parameters (if any)
	if (codec_config_ptr != NULL) {
		if (! addCodecConfig(new_codec_node, codec_config_ptr))
			throw AddCodecConfigException(codec_id);
	}
	
	// save the new XML config file
	saveConfigFile();
	
	m_signal_codec_updated();
	PION_LOG_DEBUG(m_logger, "Loaded codec (" << codec_plugin << "): " << codec_id);
	
	return codec_id;
}

void CodecFactory::setCodecConfig(const std::string& codec_id,
								  const xmlNodePtr codec_config_ptr)
{
	// make sure that the Codecs configuration file is open
	if (! configIsOpen())
		throw CodecConfigNotOpenException(getConfigFile());

	// convert "plugin not found" exceptions into "codec not found"
	boost::mutex::scoped_lock factory_lock(m_mutex);
	try {
		m_codecs.run(codec_id, boost::bind(&Codec::setConfig, _1,
										   boost::cref(m_vocabulary), codec_config_ptr));
	} catch (PluginManager<Codec>::PluginNotFoundException& /* e */) {
		throw CodecNotFoundException(codec_id);
	}
	
	// update it within the Codec config file
	
	// find the codec element in the XML config document
	xmlNodePtr codec_node = findConfigNodeByAttr(CODEC_ELEMENT_NAME,
												 ID_ATTRIBUTE_NAME,
												 codec_id,
												 m_config_node_ptr->children);
	if (codec_node == NULL)
		throw UpdateCodecConfigException(codec_id);
	
	// remove all children except the plugin type node
	xmlNodePtr cur_node;
	xmlNodePtr next_node = codec_node->children;
	while (next_node != NULL) {
		cur_node = next_node;
		next_node = next_node->next;
		
		if (cur_node->type != XML_ELEMENT_NODE
			|| xmlStrcmp(cur_node->name, reinterpret_cast<const xmlChar*>(PLUGIN_ELEMENT_NAME.c_str()))!=0)
		{
			xmlUnlinkNode(cur_node);
			xmlFreeNode(cur_node);
		}
	}
		
	// update the codec configuration parameters (if any)
	if (codec_config_ptr != NULL) {
		if (! addCodecConfig(codec_node, codec_config_ptr))
			throw UpdateCodecConfigException(codec_id);
	}
	
	// save the new XML config file
	saveConfigFile();

	m_signal_codec_updated();
	PION_LOG_DEBUG(m_logger, "Updated codec configuration (" << codec_id << ')');
}

bool CodecFactory::addCodecConfig(xmlNodePtr codec_node_ptr, xmlNodePtr codec_config_ptr)
{
	xmlNodePtr codec_config_copy = xmlCopyNodeList(codec_config_ptr);
	if (codec_config_copy == NULL)
		return false;
	
	// remove the plugin type element, if it exists in the new config
	xmlNodePtr codec_plugin_node = findConfigNodeByName(PLUGIN_ELEMENT_NAME,
														codec_config_copy);
	if (codec_plugin_node != NULL) {
		xmlUnlinkNode(codec_plugin_node);
		xmlFreeNode(codec_plugin_node);
	}
	
	// add the codec config to the config file
	if (xmlAddChild(codec_node_ptr, codec_config_copy) == NULL) {
		xmlFreeNodeList(codec_config_copy);
		return false;
	}
	
	return true;
}
	

}	// end namespace platform
}	// end namespace pion
