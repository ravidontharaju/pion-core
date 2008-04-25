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

#include "UserManager.hpp"

namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)


// static members of UserManager

const std::string			UserManager::DEFAULT_CONFIG_FILE = "users.xml";
const std::string			UserManager::USER_ELEMENT_NAME = "User";
const std::string			UserManager::PASSWORD_ELEMENT_NAME = "Password";


// UserManager member functions

UserManager::UserManager(void)
	: ConfigManager(DEFAULT_CONFIG_FILE)
{
	setLogger(PION_GET_LOGGER("pion.server.UserManager"));
}

bool UserManager::updateUserManager(const std::string& user_id,
	xmlNodePtr config_ptr, bool password_encrypted, bool new_user)
{
	bool ret=false;
	std::string password;

	// try to find the user's password in the XML config
	xmlNodePtr password_node = findConfigNodeByName(PASSWORD_ELEMENT_NAME, config_ptr);
	if (password_node == NULL) 
		throw NoPasswordException(getConfigFile());	// not found

	// get password value
	xmlChar *xml_char_ptr = xmlNodeGetContent(password_node);
	if (xml_char_ptr == NULL)
		throw NoPasswordException(getConfigFile());	// no password content
	password = reinterpret_cast<char*>(xml_char_ptr);
	xmlFree(xml_char_ptr);
	if (password.empty())
		throw NoPasswordException(getConfigFile());	// no password content

	if (password_encrypted) {
		// password is already encrypted
		if (new_user) {
			// add new user
			ret = PionUserManager::addUserHash(user_id, password);
		} else {
			// update existing user
			ret = PionUserManager::updateUserHash(user_id, password);
		}
	} else {
		// password is not encrypted
		if (new_user) {
			// add new user
			ret = PionUserManager::addUser(user_id, password);
		} else {
			// update existing user
			ret = PionUserManager::updateUser(user_id, password);
		}
		
		// update password in config tree so that it is saved in secure format
		password = PionUserManager::getUser(user_id)->getPassword();
		xmlNodeSetContent(password_node,  reinterpret_cast<const xmlChar*>(password.c_str()));
	}

	return ret;
}

void UserManager::openConfigFile(void)
{
	boost::mutex::scoped_lock users_lock(m_mutex);

	// just return if it's already open
	if (configIsOpen())
		return;

	// open the file and find the "config" root element
	ConfigManager::openConfigFile();

	// some strings that get re-used a bunch
	std::string user_id;

	// step through user configurations
	xmlNodePtr user_node = m_config_node_ptr->children;
	while ( (user_node = ConfigManager::findConfigNodeByName(USER_ELEMENT_NAME, user_node)) != NULL)
	{
		// get the unique identifier for the User (username)
		if (! getNodeId(user_node, user_id))
			throw NoUserIdException(getConfigFile());

		// add user to authentication manager
		updateUserManager(user_id, user_node->children, true, true);

		// step to the next user definition
		user_node = user_node->next;
	}

	PION_LOG_INFO(m_logger, "Loaded Users configuration file: " << m_config_file);
}

void UserManager::writeConfigXML(std::ostream& out) const 
{
	boost::mutex::scoped_lock users_lock(m_mutex);
	ConfigManager::writeBeginPionConfigXML(out);
	ConfigManager::writeConfigXML(out, m_config_node_ptr, true);
	ConfigManager::writeEndPionConfigXML(out);
}

bool UserManager::writeConfigXML(std::ostream& out,
									const std::string& user_id) const
{
	// find the plug-in element in the XML config document
	boost::mutex::scoped_lock users_lock(m_mutex);
	xmlNodePtr user_node = findConfigNodeByAttr(USER_ELEMENT_NAME,
		ID_ATTRIBUTE_NAME,
		user_id,
		m_config_node_ptr->children);

	if (user_node == NULL)
		return false;	// not found

	// found it
	ConfigManager::writeBeginPionConfigXML(out);
	ConfigManager::writeConfigXML(out, user_node, false);
	ConfigManager::writeEndPionConfigXML(out);

	return true;
}

std::string UserManager::addUser(const std::string& user_id, xmlNodePtr config_ptr)
{
	boost::mutex::scoped_lock users_lock(m_mutex);

	// Sanity check
	if (user_id.empty())
		throw NoUserIdException(getConfigFile());

	// process new user configuration
	if (updateUserManager(user_id, config_ptr, false, true)) {
		// add it to the XML scheme

		// create a new node for the User and add it to the XML config document
		xmlNodePtr new_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(USER_ELEMENT_NAME.c_str()));
		if (new_node == NULL)
			throw AddUserConfigException(getConfigFile());
		if ((new_node=xmlAddChild(m_config_node_ptr, new_node)) == NULL) {
			xmlFreeNode(new_node);
			throw AddUserConfigException(getConfigFile());
		}

		// set the id attribute for the User element
		if (xmlNewProp(new_node, reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
			reinterpret_cast<const xmlChar*>(user_id.c_str())) == NULL)
			throw AddUserConfigException(getConfigFile());

		// update the configuration parameters (if any)
		if (config_ptr != NULL) {
			if (! setPluginConfig(new_node, config_ptr))
				throw AddUserConfigException(getConfigFile());
		}
	} else {
		throw BadXMLBufferException();
	}

	// save the new XML config file
	saveConfigFile();

	return user_id;
}

void UserManager::setUserConfig(const std::string& user_id, xmlNodePtr config_ptr)
{
	// Sanity check
	if (user_id.empty())
		throw NoUserIdException(getConfigFile());

	// Find existing user configuration
	boost::mutex::scoped_lock users_lock(m_mutex);
	xmlNodePtr user_node = findConfigNodeByAttr(USER_ELEMENT_NAME,
		ID_ATTRIBUTE_NAME,
		user_id,
		m_config_node_ptr->children);
		
	if (user_node == NULL)
		throw UserNotFoundException(user_id);	// not found

	// update the user authentication configuration
	updateUserManager(user_id, config_ptr, false, false);

	// update the configuration in the XML tree
	if (! setPluginConfig(user_node, config_ptr))
		throw UpdateUserConfigException(getConfigFile());
		
	// save the new XML config file
	saveConfigFile();
}

bool UserManager::removeUser(const std::string& user_id)
{
	bool ret;

	boost::mutex::scoped_lock users_lock(m_mutex);
	ret = PionUserManager::removeUser(user_id);
	if (ret) {
		removePluginConfig(USER_ELEMENT_NAME, user_id);
		// save the new XML config file
		saveConfigFile();
	}

	return ret;
}

xmlNodePtr UserManager::createUserConfig(std::string& user_id,
	const char *buf, std::size_t len) 
{
	// sanity check
	if (buf == NULL || len == 0)
		throw BadXMLBufferException();

	// parse request payload content as XML
	xmlNodePtr node_ptr = NULL;
	xmlDocPtr doc_ptr = xmlParseMemory(buf, len);
	if (doc_ptr == NULL)
		throw XMLBufferParsingException(buf);

	// find the ROOT element
	if ( (node_ptr = xmlDocGetRootElement(doc_ptr)) == NULL
		|| xmlStrcmp(node_ptr->name,
		reinterpret_cast<const xmlChar*>(ROOT_ELEMENT_NAME.c_str())) )
	{
		xmlFreeDoc(doc_ptr);
		// buf is missing the root "PionConfig" element 
		throw MissingRootElementException(buf);
	}
	// find the resource element
	node_ptr = findConfigNodeByName(USER_ELEMENT_NAME, node_ptr->children);
	if (node_ptr == NULL) {
		xmlFreeDoc(doc_ptr);
		throw MissingResourceElementException(USER_ELEMENT_NAME);
	}

	// get user_id (username) 
	getNodeId(node_ptr, user_id);

	// found the resource config -> make a copy of it
	node_ptr = xmlCopyNodeList(node_ptr->children);

	// free the temporary document
	xmlFreeDoc(doc_ptr);

	// return the copied configuration info
	return node_ptr;
}

}	// end namespace server
}	// end namespace pion

