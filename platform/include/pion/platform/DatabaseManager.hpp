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

#ifndef __PION_DATABASEMANAGER_HEADER__
#define __PION_DATABASEMANAGER_HEADER__

#include <string>
#include <libxml/tree.h>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Database.hpp>
#include <pion/platform/PluginConfig.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

///
/// DatabaseManager: manages the creation of Databases
///
class PION_PLATFORM_API DatabaseManager :
	public PluginConfig<Database>
{
public:

	/// exception thrown if a Database cannot be found
	class DatabaseNotFoundException : public PionException {
	public:
		DatabaseNotFoundException(const std::string& database_id)
			: PionException("No databases found for identifier: ", database_id) {}
	};
	

	/// virtual destructor
	virtual ~DatabaseManager() {}
	
	/**
	 * constructs a new DatabaseManager object
	 *
	 * @param vocab_mgr the global manager of Vocabularies
	 */
	explicit DatabaseManager(const VocabularyManager& vocab_mgr);

	/**
	 * gets a unique instance of a Database
	 *
	 * @param database_id unique identifier associated with the Database
	 * @return DatabasePtr smart pointer to the Database object (destructs it when finished)
	 */
	DatabasePtr getDatabase(const std::string& database_id);
		
	/**
	 * sets configuration parameters for a managed Database
	 *
	 * @param database_id unique identifier associated with the Database
	 * @param config_ptr pointer to a list of XML nodes containing Database
	 *                   configuration parameters
	 */
	void setDatabaseConfig(const std::string& database_id,
						   const xmlNodePtr config_ptr);
	
	/**
	 * adds a new managed Database
	 *
	 * @param config_ptr pointer to a list of XML nodes containing Database
	 *                   configuration parameters (must include a Plugin type)
	 *
	 * @return std::string the new Database's unique identifier
	 */
	std::string addDatabase(const xmlNodePtr config_ptr);
	
	/**
	 * removes a managed Database
	 *
	 * @param database_id unique identifier associated with the Database
	 */
	void removeDatabase(const std::string& database_id);

	/**
	 * uses a memory buffer to generate XML configuration data for a Database
	 *
	 * @param buf pointer to a memory buffer containing configuration data
	 * @param len number of bytes available in the memory buffer
	 *
	 * @return xmlNodePtr XML configuration list for the Database
	 */
	static xmlNodePtr createDatabaseConfig(const char *buf, std::size_t len) {
		return ConfigManager::createResourceConfig(DATABASE_ELEMENT_NAME, buf, len);
	}

	/**
	 * writes the entire database engines configuration tree to an output stream (as XML)
	 *
	 * @param out the ostream to write the configuration tree into
	 */
	void writeDatabaseEnginesXML(std::ostream& out);

	/**
	 * gets the configuration for the specified database engine
	 *
	 * @param database_engine the name of the database engine
	 * @param config_detail_ptr XML configuration for the database engine
	 */
	xmlDocPtr getDatabaseEngineConfig(const std::string& database_engine, xmlNodePtr& config_detail_ptr);

	/// returns the type attribute used for an XML Permission node pertaining to Databases
	std::string getPermissionType(void) const { return DATABASES_PERMISSION_TYPE; }


protected:
	
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
								 const xmlNodePtr config_ptr)
	{
		try {
			Database *new_plugin_ptr = m_plugins.load(plugin_id, plugin_name);
			new_plugin_ptr->setId(plugin_id);
			new_plugin_ptr->setDatabaseManager(*this);
			if (config_ptr != NULL) {
				VocabularyPtr vocab_ptr(m_vocab_mgr.getVocabulary());
				new_plugin_ptr->setConfig(*vocab_ptr, config_ptr);
			}
		} catch (PionPlugin::PluginNotFoundException&) {
			throw;
		} catch (std::exception& e) {
			throw PluginException(e.what());
		}
	}
	
	
private:
	
	/// default name of the database config file
	static const std::string		DEFAULT_CONFIG_FILE;

	/// name of the database element for Pion XML config files
	static const std::string		DATABASE_ELEMENT_NAME;

	/// type identifier for Databases permission type
	static const std::string		DATABASES_PERMISSION_TYPE;

	/// name of the database engines config file
	static const std::string		TEMPLATE_FILE;

	/// element names used in database engines config file
	static const std::string		DBENGINES_ROOT_ELEMENT_NAME;
	static const std::string		TEMPLATE_ELEMENT_NAME;
	static const std::string		ENGINE_ELEMENT_NAME;

	/// the default type of database to use if one is not otherwise specified
	static const std::string		DEFAULT_DATABASE_TYPE;
};


}	// end namespace platform
}	// end namespace pion

#endif
