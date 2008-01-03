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

	/// exception thrown if the root element of the config file is not what it should be
	class BadRootElementException : public PionException {
	public:
		BadRootElementException(const std::string& config_file)
			: PionException("Bad root element for config file: ", config_file) {}
	};

	
	/// virtual destructor
	virtual ~ConfigManager() { closeConfigFile(); }
	
	/// opens the config file -> should be changed by derived classes
	virtual void openConfigFile(void) { openAndParseConfigFile(); }
	
	/// sets the name of the config file to use
	inline void setConfigFile(const std::string& config_file) { m_config_file = config_file; }
	
	/// returns the name of the config file being used
	inline const std::string& getConfigFile(void) const { return m_config_file; }
	
	/// returns true if the config file is open and being used
	inline bool configIsOpen(void) const { return m_config_ptr != NULL; }


protected:
	
	/**
	 * protected constructor: this should only be used by derived classes
	 *
	 * @param default_config_file the default configuration file to use
	 */
	ConfigManager(const std::string& default_config_file)
		: m_config_file(default_config_file),
		m_config_ptr(NULL), m_config_root_ptr(NULL)
	{}
	
	/**
	 * opens and parses the config file
	 *
	 * @return true if an existing file was opened, or false if the file is new
	 */
	bool openAndParseConfigFile(void);
	
	/// closes the config file	
	void closeConfigFile(void);
	
	/// saves the config file	
	void saveConfigFile(void);
	
	/**
	 * searches for an element node within the XML document tree
	 *
	 * @param element_name the name of the element node to search for
	 * @param starting_node pointer to the node to start searching with; both it
	 *                      and any following sibling nodes will be checked
	 *
	 * @return void* pointer to an XML document node if found, otherwise NULL
	 */
	void *findConfigNodeByName(const std::string& element_name, void *starting_node);
	
	/**
	 * searches for an element node within the XML document tree that has a
	 * particular content value defined
	 *
	 * @param element_name the name of the element node to search for
	 * @param content_value the value that should match the element's content
	 * @param starting_node pointer to the node to start searching with; both it
	 *                      and any following sibling nodes will be checked
	 *
	 * @return void* pointer to an XML document node if found, otherwise NULL
	 */
	void *findConfigNodeByContent(const std::string& element_name,
								  const std::string& content_value,
								  void *starting_node);
	
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
	 * @return void* pointer to an XML document node if found, otherwise NULL
	 */
	void *findConfigNodeByAttr(const std::string& element_name,
							   const std::string& attr_name,
							   const std::string& attr_value,
							   void *starting_node);
	
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
	bool updateConfigOption(const std::string& option_name,
							const std::string& option_value,
							void *parent_node);

	
	/// extension added to the name of backup files
	static const std::string		BACKUP_FILE_EXTENSION;
	
	/// URL associated with the Pion "config" namespace
	static const std::string		CONFIG_NAMESPACE_URL;

	/// name of the root element for Pion XML config files
	static const std::string		ROOT_ELEMENT_NAME;
	
	/// name of the XML config file being used
	std::string						m_config_file;
	
	/// pointer to an XML document tree (if libxml support is enabled)
	void *							m_config_ptr;
	
	/// pointer to the root node ("config") in the XML document tree
	void *							m_config_root_ptr;
};


}	// end namespace platform
}	// end namespace pion

#endif
