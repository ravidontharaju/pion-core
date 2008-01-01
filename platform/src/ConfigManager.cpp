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

#include <pion/platform/ConfigManager.hpp>
#include <boost/filesystem/operations.hpp>
#include <libxml/tree.h>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of ConfigManager
const std::string		ConfigManager::BACKUP_FILE_EXTENSION = ".bak";
const std::string		ConfigManager::CONFIG_NAMESPACE_URL = "http://purl.org/pion/config";
const std::string		ConfigManager::ROOT_ELEMENT_NAME = "config";

		
// ConfigManager member functions

bool ConfigManager::openAndParseConfigFile(void)
{
	// make sure the config file is not already open
	if (m_config_ptr != NULL)
		return false;

	// check if the config file is new
	bool config_exists = boost::filesystem::exists(m_config_file);
	if (config_exists) {
		// read the existing config file
		if ((m_config_ptr = xmlReadFile(m_config_file.c_str(), NULL, XML_PARSE_NOBLANKS)) == NULL)
			throw ReadConfigException(m_config_file);

		// make sure that the root element is what it should be
		if ((m_config_root_ptr = xmlDocGetRootElement(static_cast<xmlDocPtr>(m_config_ptr))) == NULL)
		{
			// config file is empty -> change flag so that caller knows to ignore contents
			config_exists = false;
			// create a new root element
			m_config_root_ptr = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(ROOT_ELEMENT_NAME.c_str()));
			if (m_config_root_ptr == NULL)
				throw InitializeRootConfigException(m_config_file);
			xmlDocSetRootElement(static_cast<xmlDocPtr>(m_config_ptr),
								 static_cast<xmlNodePtr>(m_config_root_ptr));
			if (xmlNewProp(static_cast<xmlNodePtr>(m_config_root_ptr),
						   reinterpret_cast<const xmlChar*>("xmlns"),
						   reinterpret_cast<const xmlChar*>(CONFIG_NAMESPACE_URL.c_str())) == NULL)
				throw InitializeRootConfigException(m_config_file);
		} else if (xmlStrcmp(static_cast<xmlNodePtr>(m_config_root_ptr)->name,
							 reinterpret_cast<const xmlChar*>(ROOT_ELEMENT_NAME.c_str())))
		{
			// root element of document is not what it should be
			throw BadRootElementException(m_config_file);
		}
		
	} else {
		// create a new (empty) config file
		if ((m_config_ptr = xmlNewDoc(reinterpret_cast<const xmlChar*>("1.0"))) == NULL)
			throw InitializeRootConfigException(m_config_file);
		if ((m_config_root_ptr = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(ROOT_ELEMENT_NAME.c_str()))) == NULL)
			throw InitializeRootConfigException(m_config_file);
		xmlDocSetRootElement(static_cast<xmlDocPtr>(m_config_ptr),
							 static_cast<xmlNodePtr>(m_config_root_ptr));
		if (xmlNewProp(static_cast<xmlNodePtr>(m_config_root_ptr),
					   reinterpret_cast<const xmlChar*>("xmlns"),
					   reinterpret_cast<const xmlChar*>(CONFIG_NAMESPACE_URL.c_str())) == NULL)
			throw InitializeRootConfigException(m_config_file);
		saveConfigFile();
	}
	
	return config_exists;
}

void ConfigManager::closeConfigFile(void)
{
	xmlFreeDoc(static_cast<xmlDocPtr>(m_config_ptr));
	m_config_ptr = NULL;
	m_config_root_ptr = NULL;
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
						 static_cast<xmlDocPtr>(m_config_ptr), "UTF-8", 1);
}

void *ConfigManager::findConfigNodeByName(const std::string& element_name,
										  void *starting_node)
{
	xmlNodePtr matching_node = NULL;
	
	// find the element node in the XML config document
	for (xmlNodePtr cur_node = static_cast<xmlNodePtr>(starting_node);
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
	
void *ConfigManager::findConfigNodeByContent(const std::string& element_name,
											 const std::string& content_value,
											 void *starting_node)
{
	xmlNodePtr matching_node = NULL;

	// find the element node in the XML config document
	for (xmlNodePtr cur_node = static_cast<xmlNodePtr>(starting_node);
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
	
void *ConfigManager::findConfigNodeByAttr(const std::string& element_name,
										  const std::string& attr_name,
										  const std::string& attr_value,
										  void *starting_node)
{
	xmlNodePtr matching_node = NULL;
	
	// find the element node in the XML config document
	for (xmlNodePtr cur_node = static_cast<xmlNodePtr>(starting_node);
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
	
bool ConfigManager::updateConfigOption(const std::string& option_name,
									   const std::string& option_value,
									   void *parent_node)
{
	// find the option's element
	xmlNodePtr option_node = static_cast<xmlNodePtr>(findConfigNodeByName(option_name,
																		  static_cast<xmlNodePtr>(parent_node)->children));
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
			if (xmlNewTextChild(static_cast<xmlNodePtr>(parent_node), NULL,
								reinterpret_cast<const xmlChar*>(option_name.c_str()),
								reinterpret_cast<const xmlChar*>(option_value.c_str())) == NULL)
				return false;
		}
	}
	
	return true;
}
	
}	// end namespace platform
}	// end namespace pion
