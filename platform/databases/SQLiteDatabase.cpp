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

#include <boost/filesystem/operations.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include "SQLiteDatabase.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of SQLiteDatabase

const std::string			SQLiteDatabase::BACKUP_FILE_EXTENSION = ".bak";
const std::string			SQLiteDatabase::FILENAME_ELEMENT_NAME = "Filename";

	
// SQLiteDatabase member functions

void SQLiteDatabase::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	Database::setConfig(v, config_ptr);
	
	// get the Filename of the database
	if (! ConfigManager::getConfigOption(FILENAME_ELEMENT_NAME, m_database_name, config_ptr))
		throw EmptyFilenameException(getId());
	
	// resolve paths relative to the DatabaseManager's config file location
	m_database_name = getDatabaseManager().resolveRelativePath(m_database_name);
}

DatabasePtr SQLiteDatabase::clone(void) const
{
	SQLiteDatabase *db_ptr(new SQLiteDatabase());
	db_ptr->copyDatabase(*this);
	db_ptr->m_database_name = m_database_name;
	return DatabasePtr(db_ptr);
}
	
void SQLiteDatabase::open(bool create_backup)
{
	// create a backup copy of the database before opening it
	const bool is_new_database = ! boost::filesystem::exists(m_database_name);
	if (! is_new_database && create_backup) {
		const std::string backup_filename(m_database_name + BACKUP_FILE_EXTENSION);
		if (boost::filesystem::exists(backup_filename))
			boost::filesystem::remove(backup_filename);
		boost::filesystem::copy_file(m_database_name, backup_filename);
	}
	
	// open up the database
	if (sqlite3_open(m_database_name.c_str(), &m_sqlite_db) != SQLITE_OK) {
		// prevent memory leak (sqlite3 assigns handle even if error)
		if (m_sqlite_db != NULL) {
			sqlite3_close(m_sqlite_db);
			m_sqlite_db = NULL;
		}
		throw OpenDatabaseException(m_database_name);
	}
}

void SQLiteDatabase::close(void)
{
	if (m_sqlite_db != NULL)
		sqlite3_close(m_sqlite_db);
	m_sqlite_db = NULL;
}

void SQLiteDatabase::runQuery(const std::string& sql_query)
{
	// sanity checks
	PION_ASSERT(is_open());
	PION_ASSERT(! sql_query.empty());
	
	// execute the query
	if (sqlite3_exec(m_sqlite_db, sql_query.c_str(), NULL, NULL, &m_error_ptr) != SQLITE_OK)
		throw SQLiteAPIException(getSQLiteError());
}

QueryPtr SQLiteDatabase::addQuery(QueryID query_id,
								  const std::string& sql_query)
{
	// sanity checks
	PION_ASSERT(is_open());
	PION_ASSERT(! query_id.empty());
	PION_ASSERT(! sql_query.empty());

	// generate a new database query object
	QueryPtr query_ptr(new SQLiteQuery(sql_query, m_sqlite_db));
	
	// add the query to our query map
	m_query_map.insert(std::make_pair(query_id, query_ptr));

	// return the new database query object
	return query_ptr;
}

void SQLiteDatabase::createTable(const Query::FieldMap& field_map,
								 const std::string& table_name)
{
	PION_ASSERT(is_open());

	// build a SQL query to create the output table if it doesn't yet exist
	std::string create_table_sql = "CREATE TABLE IF NOT EXISTS ";
	create_table_sql += table_name;
	create_table_sql += " ( ";
	
	// add an auto-incrementing primary key (transactional table)
	create_table_sql += table_name;
	create_table_sql += "_key INTEGER PRIMARY KEY AUTOINCREMENT, ";
	
	// add database fields for each mapping configured
	Query::FieldMap::const_iterator field_it = field_map.begin();
	while (field_it != field_map.end()) {
		create_table_sql += field_it->second.first;
		create_table_sql += ' ';
		create_table_sql += SQLiteDatabase::getSQLiteAffinity(field_it->second.second.term_type);
		if (++field_it != field_map.end())
			create_table_sql += ", ";
	}	
	create_table_sql += " );";
	
	// run the SQL query to create the table
	runQuery(create_table_sql);
}

QueryPtr SQLiteDatabase::prepareInsertQuery(const Query::FieldMap& field_map,
											const std::string& table_name)
{
	PION_ASSERT(is_open());

	// exit early if it already exists
	QueryMap::const_iterator query_it = m_query_map.find(INSERT_QUERY_ID);
	if (query_it != m_query_map.end())
		return query_it->second;
	
	// build a SQL query that can be used to insert a new record
	std::string insert_sql = "INSERT INTO ";
	insert_sql += table_name;
	insert_sql += " ( ";
	
	// add database fields for each mapping configured
	Query::FieldMap::const_iterator field_it = field_map.begin();
	while (field_it != field_map.end()) {
		insert_sql += field_it->second.first;
		if (++field_it != field_map.end())
			insert_sql += ", ";
	}	
	insert_sql += " ) VALUES ( ";
	
	// use ? character for values, since this will be a prepared statement
	field_it = field_map.begin();
	while (field_it != field_map.end()) {
		insert_sql += '?';
		if (++field_it != field_map.end())
			insert_sql += ", ";
	}	
	insert_sql += " );";
	
	// compile the SQL query into a prepared statement
	return addQuery(Database::INSERT_QUERY_ID, insert_sql);
}

QueryPtr SQLiteDatabase::getBeginTransactionQuery(void)
{
	PION_ASSERT(is_open());
	QueryMap::const_iterator i = m_query_map.find(BEGIN_QUERY_ID);
	if (i == m_query_map.end())
		return addQuery(BEGIN_QUERY_ID, "BEGIN DEFERRED TRANSACTION;");
	return i->second;
}	

QueryPtr SQLiteDatabase::getCommitTransactionQuery(void)
{
	PION_ASSERT(is_open());
	QueryMap::const_iterator i = m_query_map.find(COMMIT_QUERY_ID);
	if (i == m_query_map.end())
		return addQuery(COMMIT_QUERY_ID, "COMMIT TRANSACTION;");
	return i->second;
}	

	
// SQLiteDatabase::SQLiteQuery member functions
	
	
SQLiteDatabase::SQLiteQuery::SQLiteQuery(const std::string& sql_query, sqlite3 *db_ptr)
	: Query(sql_query), m_sqlite_db(db_ptr), m_sqlite_stmt(NULL)
{
	PION_ASSERT(db_ptr != NULL);
	if (sqlite3_prepare(m_sqlite_db, sql_query.c_str(), sql_query.size(),
						&m_sqlite_stmt, NULL) != SQLITE_OK)
		SQLiteDatabase::throwAPIException(m_sqlite_db);
	PION_ASSERT(m_sqlite_stmt != NULL);
}
	
bool SQLiteDatabase::SQLiteQuery::run(void)
{
	// step forward to the next row in the query (if there are any)
	bool row_available = false;
	switch (sqlite3_step(m_sqlite_stmt)) {
		case SQLITE_BUSY:
			throw SQLiteDatabase::DatabaseBusyException();
			break;
		case SQLITE_ROW:
			// a new result row is available
			row_available = true;
			break;
		case SQLITE_DONE:
			// query is finished; no more rows to return
			row_available = false;
			break;
		default:
			SQLiteDatabase::throwAPIException(m_sqlite_db);
			break;
	}
	return row_available;
}

	
}	// end namespace plugins
}	// end namespace pion


/// creates new SQLiteDatabase objects
extern "C" PION_PLUGIN_API pion::platform::Database *pion_create_SQLiteDatabase(void) {
	return new pion::plugins::SQLiteDatabase();
}

/// destroys SQLiteDatabase objects
extern "C" PION_PLUGIN_API void pion_destroy_SQLiteDatabase(pion::plugins::SQLiteDatabase *database_ptr) {
	delete database_ptr;
}
