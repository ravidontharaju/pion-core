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

#ifndef __PION_USERMANAGER_HEADER__
#define __PION_USERMANAGER_HEADER__

#include <string>
#include <libxml/tree.h>
#include <boost/bind.hpp>
#include <boost/signal.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/net/PionUser.hpp>
#include <pion/platform/ConfigManager.hpp>


namespace pion {		// begin namespace pion
namespace server {	// begin namespace server (Pion Server)


/**
 * UserManager : Manages a collection of platform users
 */
class PION_SERVER_API UserManager :
	public pion::platform::ConfigManager,
	public pion::net::PionUserManager
{
public:

	/// exception thrown if the config file contains a Server with an empty or missing identifier
	class NoUserIdException : public PionException {
	public:
		NoUserIdException(const std::string& config_file)
			: PionException("Service configuration file includes a User without a unique identifier: ", config_file) {}
	};

	/// exception thrown if the config file contains a Server with an empty or missing password
	class NoPasswordException : public PionException {
	public:
		NoPasswordException(const std::string& config_file)
			: PionException("Service configuration file includes a User without a password: ", config_file) {}
	};

	/// exception thrown if a duplicate User is found in the configuration file
	class DuplicateUserException : public PionException {
	public:
		DuplicateUserException(const std::string& user_id)
			: PionException("Service configuration file includes a duplicate User: ", user_id) {}
	};

	/// exception thrown if a User cannot be found
	class UserNotFoundException : public PionException {
	public:
		UserNotFoundException(const std::string& user_id)
			: PionException("No user found for identifier: ", user_id) {}
	};

	/// exception thrown if there is an error adding a user to the config file
	class AddUserConfigException : public PionException {
	public:
		AddUserConfigException(const std::string& config_file)
			: PionException("Unable to add a user to the configuration file: ", config_file) {}
	};
	
	/// exception thrown if there is an error updating a user in the config file
	class UpdateUserConfigException : public PionException {
	public:
		UpdateUserConfigException(const std::string& config_file)
			: PionException("Unable to update a user in the configuration file: ", config_file) {}
	};


public:

	/// construct a new UserManager Instance
	UserManager();

	/// virtual destructor
	virtual ~UserManager() {}

	/// opens an existing User config file and loads the data it contains
	virtual void openConfigFile(void);

	/**
	 * writes the entire configuration tree to an output stream (as XML)
	 *
	 * @param out the ostream to write the configuration tree into
	 */
	virtual void writeConfigXML(std::ostream& out) const;

	/**
	 * writes the configuration data for a particular user (as XML)
	 *
	 * @param out the ostream to write the configuration tree into
	 * @param user_id unique identifier associated with the User
	 */
	bool writeConfigXML(std::ostream& out, const std::string& user_id) const;

	/**
	 * uses a memory buffer to generate XML configuration data for a User
	 *
	 * @param buf pointer to a memory buffer containing configuration data
	 * @param len number of bytes available in the memory buffer
	 *
	 * @return xmlNodePtr XML configuration list for the User
	 */
	static xmlNodePtr createUserConfig(std::string& user_id, const char *buf, std::size_t len);

	/**
	 * adds a new managed User
	 *
	 * @param user_id unique identifier associated with the User
	 * @param config_ptr pointer to a list of XML nodes containing User
	 *                   configuration parameters 
	 *
	 * @return std::string the new User's unique identifier
	 */
	std::string addUser(const std::string& user_id, xmlNodePtr config_ptr);

	/**
	 * sets (updates) configuration parameters for a managed User
	 *
	 * @param user_id unique identifier associated with the User
	 * @param config_ptr pointer to a list of XML nodes containing User
	 *                   configuration parameters
	 */
	void setUserConfig(const std::string& user_id, xmlNodePtr config_ptr);

	/**
	 * removes a managed User
	 *
	 * @param user_id unique identifier associated with the User (username)
	 */
	virtual bool removeUser(const std::string& user_id);


private:

	/**
	 * parses user configuration info from a XML config tree
	 * and uses it to update the user authentication manager
	 *
	 * @param user_id unique identifier associated with the User
	 * @param config_ptr pointer to a list of XML nodes containing User
	 *                   configuration parameters
	 * @param password_encrypted true if the password is encrypted; if not,
	 *                           the XML nodes will be updated with encrypted format
	 * @param new_user true if a new user is being created
	 *
	 * @return true if successful
	 */
	bool updateUserManager(const std::string& user_id, xmlNodePtr config_ptr,
		bool password_encrypted, bool new_user);

	/**
	 * sets configuration parameters for a user in the configuration file
	 *
	 * @param user_node_ptr pointer to the existing user element node
	 * @param config_ptr pointer to the new configuration parameters
	 *
	 * @return true if successful, false if there was an error
	 */
	bool setUserConfig(xmlNodePtr user_node_ptr, xmlNodePtr config_ptr);

	
private:

	/// default name of the user config file
	static const std::string			DEFAULT_CONFIG_FILE;

	/// name of the USER element for Pion XML config files
	static const std::string			USER_ELEMENT_NAME;

	/// name of the PASSWORD element for Pion XML config files
	static const std::string			PASSWORD_ELEMENT_NAME;

	/// mutex to make class thread-safe
	mutable boost::mutex				m_mutex;	
};

/// data type for a UserManager pointer
typedef boost::shared_ptr<UserManager>	UserManagerPtr;


}	// end namespace server
}	// end namespace pion

#endif //__PION_USERMANAGER_HEADER__
