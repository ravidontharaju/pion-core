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

#include <uuid.h>
#include <pion/platform/ConfigManager.hpp>
#include <boost/filesystem/operations.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of ConfigManager
const std::string		ConfigManager::BACKUP_FILE_EXTENSION = ".bak";
const std::string		ConfigManager::CONFIG_NAMESPACE_URL = "http://purl.org/pion/config";
const std::string		ConfigManager::ROOT_ELEMENT_NAME = "config";
const std::string		ConfigManager::PLUGIN_ELEMENT_NAME = "plugin";
const std::string		ConfigManager::PLUGIN_ID_ATTRIBUTE_NAME = "id";
const std::string		ConfigManager::URN_UUID_PREFIX = "urn:uuid:";

		
// ConfigManager member functions

void ConfigManager::createConfigFile(void)
{
	// make sure the config file is not already open
	if (m_config_doc_ptr != NULL)
		throw ConfigAlreadyOpenException(m_config_file);

	// make sure the config file does not already exist
	if (boost::filesystem::exists(m_config_file))
		throw ConfigFileExistsException(m_config_file);

	// create a new (empty) XML config tree
	if ((m_config_doc_ptr = xmlNewDoc(reinterpret_cast<const xmlChar*>("1.0"))) == NULL)
		throw InitializeRootConfigException(m_config_file);
	
	// add the root Pion "config" element
	if ((m_config_node_ptr = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(ROOT_ELEMENT_NAME.c_str()))) == NULL)
		throw InitializeRootConfigException(m_config_file);
	xmlDocSetRootElement(m_config_doc_ptr, m_config_node_ptr);

	// add the namespace for the "config" element
	if (xmlNewProp(m_config_node_ptr,
				   reinterpret_cast<const xmlChar*>("xmlns"),
				   reinterpret_cast<const xmlChar*>(CONFIG_NAMESPACE_URL.c_str())) == NULL)
		throw InitializeRootConfigException(m_config_file);

	// save the new config file
	saveConfigFile();
}

void ConfigManager::openConfigFile(void)
{
	// make sure the config file is not already open
	if (m_config_doc_ptr != NULL)
		throw ConfigAlreadyOpenException(m_config_file);

	// make sure the config file exists
	if (! boost::filesystem::exists(m_config_file))
		throw MissingConfigFileException(m_config_file);

	// read the existing config file
	if ((m_config_doc_ptr = xmlReadFile(m_config_file.c_str(), NULL, XML_PARSE_NOBLANKS)) == NULL)
		throw ReadConfigException(m_config_file);

	// make sure that the root element is what it should be
	if ( (m_config_node_ptr = xmlDocGetRootElement(m_config_doc_ptr)) == NULL
		|| xmlStrcmp(m_config_node_ptr->name,
					 reinterpret_cast<const xmlChar*>(ROOT_ELEMENT_NAME.c_str())) )
	{
		// config file is missing the root Pion "config" element
		throw MissingRootElementException(m_config_file);
	}
}

void ConfigManager::closeConfigFile(void)
{
	xmlFreeDoc(m_config_doc_ptr);
	m_config_doc_ptr = NULL;
	m_config_node_ptr = NULL;
}

void ConfigManager::saveConfigFile(void)
{
	// check if the config file is new
	if (boost::filesystem::exists(m_config_file)) {
		// create a backup copy of the config file before opening it
		const std::string backup_filename(m_config_file + BACKUP_FILE_EXTENSION);
		if (boost::filesystem::exists(backup_filename))
			boost::filesystem::remove(backup_filename);
		boost::filesystem::copy_file(m_config_file, backup_filename);
	}
	
	// save the latest XML config document to the file
	xmlSaveFormatFileEnc(m_config_file.c_str(),
						 m_config_doc_ptr, "UTF-8", 1);
}

std::string ConfigManager::createUUID(void)
{
	uuid_t *u;
	char *str = NULL;
	uuid_create(&u);
	uuid_make(u, UUID_MAKE_V1);
	uuid_export(u, UUID_FMT_STR, &str, NULL);
	std::string result(str);
	uuid_destroy(u);
	free(str);
	return result;
}
	
std::string ConfigManager::createUniqueObjectId(void)
{
	std::string result(URN_UUID_PREFIX);
	result += createUUID();
	return result;
}	
	
xmlNodePtr ConfigManager::findConfigNodeByName(const std::string& element_name,
											   xmlNodePtr starting_node)
{
	xmlNodePtr matching_node = NULL;
	
	// find the element node in the XML config document
	for (xmlNodePtr cur_node = starting_node;
		 cur_node != NULL; cur_node = cur_node->next)
	{
		if (cur_node->type == XML_ELEMENT_NODE
			&& xmlStrcmp(cur_node->name, reinterpret_cast<const xmlChar*>(element_name.c_str()))==0)
		{
			// found it!
			matching_node = cur_node;
			break;
		}
	}
	
	return matching_node;
}
	
xmlNodePtr ConfigManager::findConfigNodeByContent(const std::string& element_name,
												  const std::string& content_value,
												  xmlNodePtr starting_node)
{
	xmlNodePtr matching_node = NULL;

	// find the element node in the XML config document
	for (xmlNodePtr cur_node = starting_node;
		 cur_node != NULL; cur_node = cur_node->next)
	{
		if (cur_node->type == XML_ELEMENT_NODE
			&& xmlStrcmp(cur_node->name, reinterpret_cast<const xmlChar*>(element_name.c_str()))==0)
		{
			// found an element with matching name
			xmlChar *xml_char_ptr = xmlNodeGetContent(cur_node);
			if (xml_char_ptr != NULL) {
				if (content_value == reinterpret_cast<char*>(xml_char_ptr)) {
					// found it!
					matching_node = cur_node;
					break;
				}
				xmlFree(xml_char_ptr);
			}
		}
	}
		
	return matching_node;
}
	
xmlNodePtr ConfigManager::findConfigNodeByAttr(const std::string& element_name,
											   const std::string& attr_name,
											   const std::string& attr_value,
											   xmlNodePtr starting_node)
{
	xmlNodePtr matching_node = NULL;
	
	// find the element node in the XML config document
	for (xmlNodePtr cur_node = starting_node;
		 cur_node != NULL; cur_node = cur_node->next)
	{
		if (cur_node->type == XML_ELEMENT_NODE
			&& xmlStrcmp(cur_node->name, reinterpret_cast<const xmlChar*>(element_name.c_str()))==0)
		{
			// found an element with matching name
			xmlChar *xml_char_ptr = xmlGetProp(cur_node, reinterpret_cast<const xmlChar*>(attr_name.c_str()));
			if (xml_char_ptr != NULL) {
				if (attr_value == reinterpret_cast<char*>(xml_char_ptr)) {
					// found it!
					matching_node = cur_node;
					break;
				}
				xmlFree(xml_char_ptr);
			}
		}
	}
	
	return matching_node;
}
	
bool ConfigManager::getConfigOption(const std::string& option_name,
									std::string& option_value,
									const xmlNodePtr starting_node)
{
	// find the option's element
	xmlNodePtr option_node = findConfigNodeByName(option_name, starting_node);
	if (option_node != NULL) {
		xmlChar *xml_char_ptr = xmlNodeGetContent(option_node);
		if (xml_char_ptr != NULL) {
			// found it
			if (xml_char_ptr[0] != '\0') {
				// it is not empty
				option_value = reinterpret_cast<char*>(xml_char_ptr);
				xmlFree(xml_char_ptr);
				return true;
			}
			xmlFree(xml_char_ptr);
		}
	}

	// option was not found or it had an empty value
	option_value.clear();
	return false;
}

bool ConfigManager::updateConfigOption(const std::string& option_name,
									   const std::string& option_value,
									   xmlNodePtr parent_node)
{
	// find the option's element
	xmlNodePtr option_node = findConfigNodeByName(option_name, parent_node->children);
	if (option_node != NULL) {
		// an existing value is assigned to the option
		if (option_value.empty()) {
			// changing to an empty value -> remove the element node
			xmlUnlinkNode(option_node);
			xmlFreeNodeList(option_node);
		} else {
			// change the value of an existing element
			xmlNodeSetContent(option_node, reinterpret_cast<const xmlChar*>(option_value.c_str()));
		}
	} else {
		// no value is currently set for the option
		// only add an element if the new value is not empty
		if (! option_value.empty()) {
			if (xmlNewTextChild(parent_node, NULL,
								reinterpret_cast<const xmlChar*>(option_name.c_str()),
								reinterpret_cast<const xmlChar*>(option_value.c_str())) == NULL)
				return false;
		}
	}
	
	return true;
}

void ConfigManager::openPluginConfig(const std::string& plugin_name,
									 AddPluginCallback add_plugin_func)
{
	// open the file and find the "config" root element
	ConfigManager::openConfigFile();
	
	xmlNodePtr plugin_node = m_config_node_ptr->children;
	while ( (plugin_node = findConfigNodeByName(plugin_name, plugin_node)) != NULL)
	{
		// parse new plug-in definition
		xmlChar *xml_char_ptr = xmlGetProp(plugin_node, reinterpret_cast<const xmlChar*>(PLUGIN_ID_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyPluginIdException(getConfigFile());
		}
		const std::string new_plugin_id(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);
		
		// find plug-in type
		std::string new_plugin_type;
		if (! getConfigOption(PLUGIN_ELEMENT_NAME, new_plugin_type, plugin_node->children))
			throw EmptyPluginElementException(new_plugin_id);

		// execute callback to actually add the plug-in
		add_plugin_func(new_plugin_id, new_plugin_type, plugin_node->children);

		// look for more plug-in nodes
		plugin_node = plugin_node->next;
	}
}
	
bool ConfigManager::setPluginConfig(xmlNodePtr plugin_node_ptr, xmlNodePtr config_ptr)
{
	xmlNodePtr plugin_config_copy = xmlCopyNodeList(config_ptr);
	if (plugin_config_copy == NULL)
		return false;
	
	// remove the plugin type element, if it exists in the new config
	xmlNodePtr plugin_type_node = findConfigNodeByName(PLUGIN_ELEMENT_NAME,
													   plugin_config_copy);
	if (plugin_type_node != NULL) {
		xmlUnlinkNode(plugin_type_node);
		xmlFreeNode(plugin_type_node);
	}
	
	// add the plugin config to the config file
	if (xmlAddChild(plugin_node_ptr, plugin_config_copy) == NULL) {
		xmlFreeNodeList(plugin_config_copy);
		return false;
	}
	
	return true;
}
	
void ConfigManager::setPluginConfig(const std::string& plugin_name,
									const std::string& plugin_id,
									const xmlNodePtr config_ptr)
{
	// find the plug-in element in the XML config document
	xmlNodePtr plugin_node = findConfigNodeByAttr(plugin_name,
												  PLUGIN_ID_ATTRIBUTE_NAME,
												  plugin_id,
												  m_config_node_ptr->children);
	if (plugin_node == NULL)
		throw UpdatePluginConfigException(plugin_id);
	
	// remove all children except the plugin type node
	xmlNodePtr cur_node;
	xmlNodePtr next_node = plugin_node->children;
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
	
	// update the plugin configuration parameters (if any)
	if (config_ptr != NULL) {
		if (! setPluginConfig(plugin_node, config_ptr))
			throw UpdatePluginConfigException(plugin_id);
	}
	
	// save the new XML config file
	saveConfigFile();
}

void ConfigManager::addPluginConfig(const std::string& plugin_name,
									const std::string& plugin_id,
									const std::string& plugin_type,
									const xmlNodePtr config_ptr)
{
	// create a new node for the plug-in and add it to the XML config document
	xmlNodePtr new_plugin_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(plugin_name.c_str()));
	if (new_plugin_node == NULL)
		throw AddPluginConfigException(plugin_type);
	if ((new_plugin_node=xmlAddChild(m_config_node_ptr, new_plugin_node)) == NULL) {
		xmlFreeNode(new_plugin_node);
		throw AddPluginConfigException(plugin_type);
	}
	
	// set the id attribute for the plug-in element
	if (xmlNewProp(new_plugin_node, reinterpret_cast<const xmlChar*>(PLUGIN_ID_ATTRIBUTE_NAME.c_str()),
				   reinterpret_cast<const xmlChar*>(plugin_id.c_str())) == NULL)
		throw AddPluginConfigException(plugin_type);
	
	// add a plugin type child element to the plug-in element
	if (xmlNewTextChild(new_plugin_node, NULL,
						reinterpret_cast<const xmlChar*>(PLUGIN_ELEMENT_NAME.c_str()),
						reinterpret_cast<const xmlChar*>(plugin_type.c_str())) == NULL)
		throw AddPluginConfigException(plugin_type);
	
	// update the plug-in configuration parameters (if any)
	if (config_ptr != NULL) {
		if (! setPluginConfig(new_plugin_node, config_ptr))
			throw AddPluginConfigException(plugin_type);
	}
	
	// save the new XML config file
	saveConfigFile();
}
		
void ConfigManager::removePluginConfig(const std::string& plugin_name,
									   const std::string& plugin_id)
{
	// find the plug-in node to remove
	xmlNodePtr plugin_node = findConfigNodeByAttr(plugin_name,
												  PLUGIN_ID_ATTRIBUTE_NAME,
												  plugin_id,
												  m_config_node_ptr->children);
	if (plugin_node == NULL)
		throw RemovePluginConfigException(plugin_id);
	
	// remove the plug-in element (and all of its children)
	xmlUnlinkNode(plugin_node);
	xmlFreeNode(plugin_node);
	
	// save the new XML config file
	saveConfigFile();
}

	
}	// end namespace platform
}	// end namespace pion
