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

#ifndef __PION_CONFIGMANAGER_HEADER__
#define __PION_CONFIGMANAGER_HEADER__

#include <string>
#include <libxml/tree.h>
#include <boost/function.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// ConfigManager: interface that manages XML configuration files
///
class PION_PLATFORM_API ConfigManager
{
public:

	/// exception thrown if you try to open a config file when it is already open
	class ConfigAlreadyOpenException : public PionException {
	public:
		ConfigAlreadyOpenException(const std::string& file_name)
			: PionException("Configuration file is already open: ", file_name) {}
	};

	/// exception thrown if you try to create a config file that already exists
	class ConfigFileExistsException : public PionException {
	public:
		ConfigFileExistsException(const std::string& file_name)
			: PionException("Configuration file already exists: ", file_name) {}
	};
	
	/// exception thrown if you try to open a config file that does not exist
	class MissingConfigFileException : public PionException {
	public:
		MissingConfigFileException(const std::string& file_name)
			: PionException("Unable to find configuration file: ", file_name) {}
	};

	/// exception thrown if the root configuration element is not found
	class MissingRootElementException : public PionException {
	public:
		MissingRootElementException(const std::string& config_file)
		: PionException("Configuration file is missing the root config element: ", config_file) {}
	};

	/// exception thrown if there is an error initializing a new config file's root element
	class InitializeRootConfigException : public PionException {
	public:
		InitializeRootConfigException(const std::string& file_name)
			: PionException("Unable to initialize configuration file: ", file_name) {}
	};
	
	/// exception thrown if there is an error reading a config file
	class ReadConfigException : public PionException {
	public:
		ReadConfigException(const std::string& config_file)
		: PionException("Unable to read config file: ", config_file) {}
	};

	/// exception thrown if there is an error adding a plug-in to the config file
	class AddPluginConfigException : public PionException {
	public:
		AddPluginConfigException(const std::string& plugin_type)
			: PionException("Unable to add a plug-in to the configuration file: ", plugin_type) {}
	};
	
	/// exception thrown if there is an error updating a plug-in in the config file
	class UpdatePluginConfigException : public PionException {
	public:
		UpdatePluginConfigException(const std::string& plugin_id)
			: PionException("Unable to update a plug-in in the configuration file: ", plugin_id) {}
	};
	
	/// exception thrown if there is an error removing a plug-in from the config file
	class RemovePluginConfigException : public PionException {
	public:
		RemovePluginConfigException(const std::string& plugin_id)
			: PionException("Unable to remove a plug-in from the configuration file: ", plugin_id) {}
	};
	
	/// exception thrown if you try modifying plug-ins before opening the config file
	class PluginConfigNotOpenException : public PionException {
	public:
		PluginConfigNotOpenException(const std::string& config_file)
			: PionException("Plug-ins configuration file must be opened before making changes: ", config_file) {}
	};
	
	/// exception thrown if the config file contains a plug-in with a missing identifier
	class EmptyPluginIdException : public PionException {
	public:
		EmptyPluginIdException(const std::string& config_file)
		: PionException("Configuration file includes a plug-in with an empty identifier: ", config_file) {}
	};
	
	/// exception thrown if the plug-in config does not include a plug-in element
	class EmptyPluginElementException : public PionException {
	public:
		EmptyPluginElementException(const std::string& plugin_id)
			: PionException("Plug-in configuration does not contain a \"plugin\" element: ", plugin_id) {}
	};
	
	
	/// virtual destructor
	virtual ~ConfigManager() { closeConfigFile(); }
	
	/// creates a new config file and adds a root Pion "config" element
	virtual void createConfigFile(void);
	
	/// opens an existing config file and finds the root Pion "config" element
	virtual void openConfigFile(void);
	
	/// sets the name of the config file to use
	inline void setConfigFile(const std::string& config_file) { m_config_file = config_file; }
	
	/// returns the name of the config file being used
	inline const std::string& getConfigFile(void) const { return m_config_file; }
	
	/// returns true if the config file is open and being used
	inline bool configIsOpen(void) const { return m_config_doc_ptr != NULL; }

	/// returns a string containing a new UUID value
	static std::string createUUID(void);

	/// returns a unique object identifier (UUID expressed as a URN)
	static std::string createUniqueObjectId(void);

	/**
	 * searches for an element node within the XML document tree
	 *
	 * @param element_name the name of the element node to search for
	 * @param starting_node pointer to the node to start searching with; both it
	 *                      and any following sibling nodes will be checked
	 *
	 * @return xmlNodePtr pointer to an XML document node if found, otherwise NULL
	 */
	static xmlNodePtr findConfigNodeByName(const std::string& element_name,
										   xmlNodePtr starting_node);
	
	/**
	 * searches for an element node within the XML document tree that has a
	 * particular content value defined
	 *
	 * @param element_name the name of the element node to search for
	 * @param content_value the value that should match the element's content
	 * @param starting_node pointer to the node to start searching with; both it
	 *                      and any following sibling nodes will be checked
	 *
	 * @return xmlNodePtr pointer to an XML document node if found, otherwise NULL
	 */
	static xmlNodePtr findConfigNodeByContent(const std::string& element_name,
											  const std::string& content_value,
											  xmlNodePtr starting_node);
	
	/**
	 * searches for an element node within the XML document tree that has a
	 * particular attribute value defined
	 *
	 * @param element_name the name of the element node to search for
	 * @param attr_name the name of the attribute to search for
	 * @param attr_value the value that should be assigned to the attribute
	 * @param starting_node pointer to the node to start searching with; both it
	 *                      and any following sibling nodes will be checked
	 *
	 * @return xmlNodePtr pointer to an XML document node if found, otherwise NULL
	 */
	static xmlNodePtr findConfigNodeByAttr(const std::string& element_name,
										   const std::string& attr_name,
										   const std::string& attr_value,
										   xmlNodePtr starting_node);
	
	/**
	 * retrieves the value for a simple configuration option that is contained
	 * within an XML element node.
	 *
	 * @param option_name the name of the option's element node
	 * @param option_value the value (text content) of the option's element node
	 * @param starting_node pointer to the node to start searching with; both it
	 *                      and any following sibling nodes will be checked
	 *
	 * @return true if the option has a value; false if it is undefined or empty
	 */
	static bool getConfigOption(const std::string& option_name,
								std::string& option_value,
								const xmlNodePtr starting_node);
	
	/**
	 * updates a simple configuration option that is contained within an XML
	 * element node.  If the option value is empty, the node is removed.  Adds
	 * a new element node if necessary.
	 *
	 * @param option_name the name of the option's element node
	 * @param option_value the value that should be assigned to the option
	 * @param parent_node pointer to the option's parent node
	 *
	 * @return true if the option was updated; false if there was an error
	 */
	static bool updateConfigOption(const std::string& option_name,
								   const std::string& option_value,
								   xmlNodePtr parent_node);

	
protected:
	
	/**
	 * protected constructor: this should only be used by derived classes
	 *
	 * @param default_config_file the default configuration file to use
	 */
	ConfigManager(const std::string& default_config_file)
		: m_config_file(default_config_file),
		m_config_doc_ptr(NULL), m_config_node_ptr(NULL)
	{}
	
	/// closes the config file	
	void closeConfigFile(void);
	
	/// saves the config file	
	void saveConfigFile(void);

	/**
	 * opens a plug-in configuration file and loads all of the plug-ins
	 * that it contains by calling addPluginNoLock()
	 *
	 * @param plugin_name the name of the plug-in element node
	 */
	void openPluginConfig(const std::string& plugin_name);
	
	/**
	 * add configuration parameters for a plug-in to the configuration file
	 *
	 * @param plugin_node_ptr pointer to the existing plugin element node
	 * @param config_ptr pointer to the new configuration parameters
	 *
	 * @return true if successful, false if there was an error
	 */
	bool setPluginConfig(xmlNodePtr plugin_node_ptr, xmlNodePtr config_ptr);
	
	/**
	 * updates the configuration parameters for a plug-in
	 *
	 * @param plugin_name the name of the plug-in element node
	 * @param plugin_id unique identifier associated with the plug-in
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                           configuration parameters
	 */
	void setPluginConfig(const std::string& plugin_name,
						 const std::string& plugin_id,
						 const xmlNodePtr config_ptr);
	
	/**
	 * adds a new plug-in object to the configuration file
	 *
	 * @param plugin_name the name of the plug-in element node
	 * @param plugin_id unique identifier associated with the plug-in
	 * @param plugin_type the type of plug-in to load (searches plug-in
	 *                    directories and appends extensions)
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 */
	void addPluginConfig(const std::string& plugin_name,
						 const std::string& plugin_id,
						 const std::string& plugin_type,
						 const xmlNodePtr config_ptr = NULL);
		
	/**
	 * removes a plug-in object from the configuration file
	 *
	 * @param plugin_name the name of the plug-in element node
	 * @param plugin_id unique identifier associated with the plug-in
	 */
	void removePluginConfig(const std::string& plugin_name,
							const std::string& plugin_id);

	/**
	 * adds a new plug-in object (without locking or config file updates).  This
	 * function must be defined properly for any derived classes that wish to
	 * use openPluginConfig().
	 *
	 * @param plugin_id unique identifier associated with the plug-in
	 * @param plugin_name the name of the plug-in to load (searches
	 *                    plug-in directories and appends extensions)
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 */
	virtual void addPluginNoLock(const std::string& plugin_id,
								 const std::string& plugin_name,
								 const xmlNodePtr config_ptr) {}

	
	/// extension added to the name of backup files
	static const std::string		BACKUP_FILE_EXTENSION;
	
	/// URL associated with the Pion "config" namespace
	static const std::string		CONFIG_NAMESPACE_URL;

	/// name of the root element for Pion XML config files
	static const std::string		ROOT_ELEMENT_NAME;
	
	/// name of the plug-in type element for Pion XML config files
	static const std::string		PLUGIN_ELEMENT_NAME;
	
	/// name of the plug-in ID attribute for Pion XML config files
	static const std::string		PLUGIN_ID_ATTRIBUTE_NAME;

	/// prefix for a UUID type URN
	static const std::string		URN_UUID_PREFIX;

	
	/// name of the XML config file being used
	std::string						m_config_file;
	
	/// pointer to the root of the XML document tree (if libxml support is enabled)
	xmlDocPtr 						m_config_doc_ptr;
	
	/// pointer to the root configuration node ("config") in the XML document tree
	xmlNodePtr 						m_config_node_ptr;
};


}	// end namespace platform
}	// end namespace pion

#endif
