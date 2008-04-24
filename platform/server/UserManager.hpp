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
* UserManager : Manages collection of platform users
*/
class PION_SERVER_API UserManager :
	public pion::platform::ConfigManager,
	public pion::net::PionUserManager
{
public:
	// exception thrown at config file parsing

	/// exception thrown if the config file contains a Server with an empty or missing identifier
	class NoUsernameException : public PionException {
	public:
		NoUsernameException(const std::string& config_file)
			: PionException("Service configuration file includes a User without a unique username: ", config_file) {}
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
	* Note: if PION_HAVE_SSL defined,  Password parameter replaced by PasswordHash
	*
	* @param out the ostream to write the configuration tree into
	*/
	virtual void writeConfigXML(std::ostream& out) const;

	/**
	* writes the configuration data for a particular user (as XML)
	*
	* @param out the ostream to write the configuration tree into
	* @param user_name unique name associated with the user
	*/
	bool writeConfigXML(std::ostream& out, const std::string& user_name) const;

	/**
	* writes the entire configuration tree to an output stream (as XML)
	* without Password element
	*
	* @param out the ostream to write the configuration tree into
	*/
	//void writeConfigXMLnoPassword(std::ostream& out) const;

	/**
	* writes the configuration data for a particular user (as XML)
	* without Password element
	*
	* @param out the ostream to write the configuration tree into
	*/
	//bool writeConfigXMLnoPassword(std::ostream& out, const std::string& user_name) const;

private:

	/// default name of the user config file
	static const std::string			DEFAULT_CONFIG_FILE;

	/// name of the USER element for Pion XML config files
	static const std::string			USER_ELEMENT_NAME;

	/// name of the USERNAME element for Pion XML config files
	static const std::string			USERNAME_ELEMENT_NAME;

	/// name of the PASSWORD element for Pion XML config files
	static const std::string			PASSWORD_ELEMENT_NAME;

	/// name of the PasswordHash element for Pion XML config files
	static const std::string			PASSWORD_HASH_ELEMENT_NAME;

	/// mutex to make class thread-safe
	mutable boost::mutex				m_mutex;	
};

/// data type for a UserManager pointer
typedef boost::shared_ptr<UserManager>	UserManagerPtr;


}	// end namespace server
}	// end namespace pion

#endif //__PION_USERMANAGER_HEADER__
