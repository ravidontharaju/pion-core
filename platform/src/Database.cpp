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

#include <pion/platform/Database.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <boost/filesystem/operations.hpp>

namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of Database

const std::string			Database::INSERT_QUERY_ID = "urn:sql:insert-event";
const std::string			Database::BEGIN_QUERY_ID = "urn:sql:begin-transaction";
const std::string			Database::COMMIT_QUERY_ID = "urn:sql:commit-transaction";

const std::string			Database::TEMPLATE_FILE = "dbengines.xml";
const std::string			Database::ROOT_ELEMENT_NAME = "DatabaseTemplates";
const std::string			Database::TEMPLATE_ELEMENT_NAME = "Template";
const std::string			Database::MAP_ELEMENT_NAME = "TypeMap";
const std::string			Database::PAIR_ELEMENT_NAME = "Pair";
const std::string			Database::ENGINE_ELEMENT_NAME = "Engine";

const std::string			Database::CLIENT_ELEMENT_NAME = "Client";
const std::string			Database::BEGIN_ELEMENT_NAME = "BeginInsert";
const std::string			Database::COMMIT_ELEMENT_NAME = "CommitInsert";
const std::string			Database::CREATE_LOG_ELEMENT_NAME = "CreateLog";
const std::string			Database::INSERT_LOG_ELEMENT_NAME = "InsertLog";
const std::string			Database::ISOLATION_ELEMENT_NAME = "IsolationLevel";

const std::string			Database::CREATE_STAT_ELEMENT_NAME = "CreateStat";
const std::string			Database::UPDATE_STAT_ELEMENT_NAME = "UpdateStat";
const std::string			Database::SELECT_STAT_ELEMENT_NAME = "SelectStat";

// Database member functions

void Database::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	PlatformPlugin::setConfig(v, config_ptr);
}

void Database::readConfigDetails(const xmlNodePtr config_ptr)
{
	if (! ConfigManager::getConfigOption(CLIENT_ELEMENT_NAME, m_database_client, config_ptr))
		throw DatabaseClientException(getId());

	m_begin_insert.clear();
	m_commit_insert.clear();
	ConfigManager::getConfigOption(BEGIN_ELEMENT_NAME, m_begin_insert, config_ptr);

	ConfigManager::getConfigOption(COMMIT_ELEMENT_NAME, m_commit_insert, config_ptr);

	if (! ConfigManager::getConfigOption(CREATE_LOG_ELEMENT_NAME, m_create_log, config_ptr))
		throw DatabaseConfigMissing(CREATE_LOG_ELEMENT_NAME);

	if (! ConfigManager::getConfigOption(INSERT_LOG_ELEMENT_NAME, m_insert_log, config_ptr))
		throw DatabaseConfigMissing(INSERT_LOG_ELEMENT_NAME);

	if (! ConfigManager::getConfigOption(CREATE_STAT_ELEMENT_NAME, m_create_stat, config_ptr))
		throw DatabaseConfigMissing(CREATE_STAT_ELEMENT_NAME);

	if (! ConfigManager::getConfigOption(UPDATE_STAT_ELEMENT_NAME, m_update_stat, config_ptr))
		throw DatabaseConfigMissing(UPDATE_STAT_ELEMENT_NAME);

	if (! ConfigManager::getConfigOption(SELECT_STAT_ELEMENT_NAME, m_select_stat, config_ptr))
		throw DatabaseConfigMissing(SELECT_STAT_ELEMENT_NAME);

	// If IsolationLevel is not defined, assume ReadUncommitted
	// If IsolationLevel is defined, make sure it matches, otherwise throw exception
	std::string isolation_level_str;
	if (ConfigManager::getConfigOption(ISOLATION_ELEMENT_NAME, isolation_level_str, config_ptr)) {
		if (isolation_level_str == "ReadUncommitted")
			m_isolation_level = IL_ReadUncommitted;
		else if (isolation_level_str == "ReadCommitted")
			m_isolation_level = IL_ReadCommitted;
		else if (isolation_level_str == "RepeatableRead")
			m_isolation_level = IL_RepeatableRead;
		else if (isolation_level_str == "Serializable")
			m_isolation_level = IL_Serializable;
		else
			throw InvalidIsolationLevel(isolation_level_str);
	} else
		m_isolation_level = IL_LevelUnknown;

	m_sql_affinity.clear();
	m_sql_affinity.resize(Vocabulary::TYPE_OBJECT + 1);  // TODO: this depends on TYPE_OBJECT being last; should do something better here.
	xmlNodePtr mapping_node;
	if ((mapping_node = ConfigManager::findConfigNodeByName(MAP_ELEMENT_NAME, config_ptr)) != NULL) {
		xmlNodePtr map_pair_node = mapping_node->children;
		std::string map_pair_str;
		while (ConfigManager::getConfigOption(PAIR_ELEMENT_NAME, map_pair_str, map_pair_node)) {
			// Pairs are: VocabTerm,SQLtype
			std::string::size_type loc = map_pair_str.find(',');
			if (loc != std::string::npos) {
				pion::platform::Vocabulary::DataType i = Vocabulary::parseDataType(map_pair_str.substr(0, loc));
				m_sql_affinity[i] = map_pair_str.substr(loc + 1);
			} else
				throw BadTypePair(map_pair_str);
			map_pair_node = map_pair_node->next;
		}
	} else
		throw MissingTypeMap(getId());
}

/// Find Queries, Isolation level and Mapping Pairs from reactors.xml OR dbengines.xml
void Database::readConfig(const xmlNodePtr config_ptr, std::string engine_str)
{
	// Assume embedded configuration...
	xmlNodePtr config_detail_ptr = config_ptr;

	// Get ptr to ConfigManager, in order to extract base path to XML
	DatabaseManager& dbm = getDatabaseManager();
	std::string templateFile = dbm.resolveRelativePath(TEMPLATE_FILE);
//	templateFile = TEMPLATE_FILE;

	// If client name is not supplied, use engine name as client name
	// compatibility for SQLite == SQLite
	if (m_database_engine.empty())
		m_database_engine = engine_str;
	if (m_database_client.empty())
		m_database_client = engine_str;

	xmlDocPtr template_doc_ptr = NULL;
	if (! ConfigManager::getConfigOption(CLIENT_ELEMENT_NAME, m_database_client, config_ptr)) {
		// Nope... let's hunt the template file...
		if (! boost::filesystem::exists(templateFile))
			throw MissingTemplateException(templateFile);

		if ((template_doc_ptr = xmlReadFile(templateFile.c_str(), NULL, XML_PARSE_NOBLANKS)) == NULL)
			throw ReadConfigException(templateFile);

		xmlNodePtr template_ptr;
		if ( (template_ptr = xmlDocGetRootElement(template_doc_ptr)) == NULL
			|| xmlStrcmp(template_ptr->name,
					 reinterpret_cast<const xmlChar*>(ROOT_ELEMENT_NAME.c_str())) ) {
			throw MissingRootElementException(ROOT_ELEMENT_NAME);
		}

		template_ptr = template_ptr->children;
		std::string		engine_name_str;
		while (template_ptr) {
			if ((config_detail_ptr = ConfigManager::findConfigNodeByName(TEMPLATE_ELEMENT_NAME,
				template_ptr)) != NULL)
				if (ConfigManager::getConfigOption(ENGINE_ELEMENT_NAME, engine_name_str, config_detail_ptr->children) &&
					engine_name_str == m_database_engine) {
					config_detail_ptr = config_detail_ptr->children;
					break;
				}
			template_ptr = template_ptr->next;
		}
	}
	readConfigDetails(config_detail_ptr);

	if (template_doc_ptr != NULL)
		xmlFreeDoc(template_doc_ptr);
}

/// Only used by stringSubstitutes, so non-inlined is fine for performance
void Database::stringReplace(std::string& src, const char* search, const std::string& substitute)
{
	std::string::size_type i = 0;
	while ((i = src.find(search, i)) != std::string::npos)
		src.replace(i, strlen(search), substitute);
}

/// Since stringSubstitutes is only used at setup, its speed is not critical...
std::string& Database::stringSubstitutes(std::string& query, const pion::platform::Query::FieldMap& field_map, const std::string& table_name)
{
	// Substitute any table name instances in query
	stringReplace(query, ":TABLE", table_name);

	std::string fields, columns, questions, params;
	for (unsigned int p = 0; p < field_map.size(); p++) {
		fields += field_map[p].first + ' ' +
					m_sql_affinity[field_map[p].second.term_type];
// Now using m_sql_affinity[] table instead of a lookup function
//					getSQLAPIAffinity(field_it->second.second.term_type);
		columns += field_map[p].first;
		questions += '?';
		params += ':' + boost::lexical_cast<std::string>(p+1);	// Params are 1-based
		if (p+1 < field_map.size()) {			// Add commas, but not after last
			fields += ',';
			columns += ',';
			questions += ',';
			params += ',';
		}
	}
	stringReplace(query, ":FIELDS", fields);		// Sub any field name sequences
	stringReplace(query, ":COLUMNS", columns);		// Sub column instances
	stringReplace(query, ":QUESTIONS", questions);	// Sub question mark sequences
	stringReplace(query, ":PARAMS", params);		// :1,:2,:3, etc...
	return query;
}

}	// end namespace platform
}	// end namespace pion
