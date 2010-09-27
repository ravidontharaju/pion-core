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

#include <pion/platform/DatabaseManager.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of DatabaseManager
const std::string		DatabaseManager::DEFAULT_CONFIG_FILE = "databases.xml";
const std::string		DatabaseManager::DATABASE_ELEMENT_NAME = "Database";
const std::string		DatabaseManager::DATABASES_PERMISSION_TYPE = "Databases";
const std::string		DatabaseManager::DEFAULT_DATABASE_TYPE = "sqlite";
const std::string		DatabaseManager::TEMPLATE_FILE = "dbengines.xml";
const std::string		DatabaseManager::DBENGINES_ROOT_ELEMENT_NAME = "DatabaseTemplates";
const std::string		DatabaseManager::TEMPLATE_ELEMENT_NAME = "Template";
const std::string		DatabaseManager::ENGINE_ELEMENT_NAME = "Engine";


// DatabaseManager member functions
	
DatabaseManager::DatabaseManager(const VocabularyManager& vocab_mgr)
	: PluginConfig<Database>(vocab_mgr, DEFAULT_CONFIG_FILE, DATABASE_ELEMENT_NAME)
{
	setLogger(PION_GET_LOGGER("pion.platform.DatabaseManager"));
}
	
DatabasePtr DatabaseManager::getDatabase(const std::string& database_id)
{
	boost::mutex::scoped_lock manager_lock(m_mutex);
	Database *database_ptr = m_plugins.get(database_id);
	// throw an exception if the Database was not found
	if (database_ptr == NULL)
		throw DatabaseNotFoundException(database_id);
	// return a cloned instance of the Database since it may change during use
	return database_ptr->clone();
}

void DatabaseManager::setDatabaseConfig(const std::string& database_id,
										const xmlNodePtr config_ptr)
{
	// convert PluginNotFound exceptions into DatabaseNotFound exceptions
	try {
		PluginConfig<Database>::setPluginConfig(database_id, config_ptr);
	} catch (PluginManager<Database>::PluginNotFoundException&) {
		throw DatabaseNotFoundException(database_id);
	}
}

std::string DatabaseManager::addDatabase(const xmlNodePtr config_ptr)
{
	return PluginConfig<Database>::addPlugin(config_ptr);
}

void DatabaseManager::removeDatabase(const std::string& database_id)
{
	// convert PluginNotFound exceptions into DatabaseNotFound exceptions
	try {
		PluginConfig<Database>::removePlugin(database_id);
	} catch (PluginManager<Database>::PluginNotFoundException&) {
		throw DatabaseNotFoundException(database_id);
	}
}

void DatabaseManager::writeDatabaseEnginesXML(std::ostream& out) {
	std::string templateFile = resolveRelativePath(TEMPLATE_FILE);
	xmlDocPtr template_doc_ptr = NULL;
	xmlNodePtr template_ptr;
	if ((template_doc_ptr = ConfigManager::getConfigFromFile(templateFile, DBENGINES_ROOT_ELEMENT_NAME, template_ptr, m_logger)) == NULL)
		throw ReadConfigException(templateFile);

	ConfigManager::writeConfigXML(out, template_ptr, false);

	if (template_doc_ptr != NULL)
		xmlFreeDoc(template_doc_ptr);
}

xmlDocPtr DatabaseManager::getDatabaseEngineConfig(const std::string& database_engine, xmlNodePtr& config_detail_ptr) {
	std::string templateFile = resolveRelativePath(TEMPLATE_FILE);
	xmlDocPtr template_doc_ptr = NULL;
	xmlNodePtr template_ptr;
	if ((template_doc_ptr = ConfigManager::getConfigFromFile(templateFile, DBENGINES_ROOT_ELEMENT_NAME, template_ptr, m_logger)) == NULL)
		throw ReadConfigException(templateFile);

	template_ptr = template_ptr->children;
	std::string engine_name_str;
	while (template_ptr) {
		if ((config_detail_ptr = ConfigManager::findConfigNodeByName(TEMPLATE_ELEMENT_NAME,
			template_ptr)) != NULL)
			if (ConfigManager::getConfigOption(ENGINE_ELEMENT_NAME, engine_name_str, config_detail_ptr->children) &&
				engine_name_str == database_engine) {
				config_detail_ptr = config_detail_ptr->children;
				break;
			}
		template_ptr = template_ptr->next;
	}
	return template_doc_ptr;
}


}	// end namespace platform
}	// end namespace pion
