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

const std::string			UserManager::DEFAULT_CONFIG_FILE = "users.xml";
const std::string			UserManager::USER_ELEMENT_NAME = "User";
const std::string			UserManager::USERNAME_ELEMENT_NAME = "Name";
const std::string			UserManager::PASSWORD_ELEMENT_NAME = "Password";
const std::string			UserManager::PASSWORD_HASH_ELEMENT_NAME = "PasswordHash";

UserManager::UserManager(void)
: ConfigManager(DEFAULT_CONFIG_FILE)
{
	setLogger(PION_GET_LOGGER("pion.server.UserManager"));
}

void UserManager::openConfigFile(void)
{
	boost::mutex::scoped_lock services_lock(m_mutex);

	// just return if it's already open
	if (configIsOpen())
		return;

	// open the file and find the "config" root element
	ConfigManager::openConfigFile();

	// some strings that get re-used a bunch
	std::string username;
	std::string password;
	std::string password_hash;;

	// step through user configurations
	xmlNodePtr user_node = m_config_node_ptr->children;
	while ( (user_node = ConfigManager::findConfigNodeByName(USER_ELEMENT_NAME, user_node)) != NULL)
	{
		// get the unique identifier for the Server
		if (! getNodeId(user_node, username))
			throw NoUsernameException(getConfigFile());

		// try to get this user password 
		if (ConfigManager::getConfigOption(PASSWORD_ELEMENT_NAME, password,user_node->children)) {
			if(!addUser(username,password)){
				PION_LOG_WARN(m_logger, "Ignoring user ["+username+"] with dublicate username");
			}
#ifdef PION_HAVE_SSL
			//ToDo remove <Password> node and replace it with <PasswordHash>
#endif
		}
		else if(ConfigManager::getConfigOption(PASSWORD_HASH_ELEMENT_NAME, password_hash,user_node->children)){ // try to get password hash
#ifdef PION_HAVE_SSL
			/*
			if(!addUserHash(username,password_hash)){
				PION_LOG_WARN(m_logger, "Ignoring user ["+username+"] with dublicate username");
			}
			*/
#else
			PION_LOG_WARN(m_logger, "Ignoring user ["+username+"] with password hash parameter  (Pion was not built with SSL support)");
#endif
		}
		else{
			PION_LOG_WARN(m_logger, "Ignoring user ["+username+"] with no password/hash parameter defined");
		}

		// step to the next user definition
		user_node = user_node->next;
	}

	PION_LOG_INFO(m_logger, "Loaded Users configuration file: " << m_config_file);
}


void UserManager::writeConfigXML(std::ostream& out) const {
	boost::mutex::scoped_lock lock(m_mutex);
	ConfigManager::writeConfigXMLHeader(out);
	ConfigManager::writeConfigXML(out, m_config_node_ptr, true);
}

bool UserManager::writeConfigXML(std::ostream& out,
									const std::string& user_name) const
{
	// find the plug-in element in the XML config document
	boost::mutex::scoped_lock services_lock(m_mutex);
	xmlNodePtr user_node = findConfigNodeByAttr(USER_ELEMENT_NAME,
		ID_ATTRIBUTE_NAME,
		user_name,
		m_config_node_ptr->children);
	if (user_node == NULL)
		return false;

	// found it
	ConfigManager::writeConfigXMLHeader(out);
	ConfigManager::writeConfigXML(out, user_node, false);
	return true;
}


}	// end namespace server
}	// end namespace pion

