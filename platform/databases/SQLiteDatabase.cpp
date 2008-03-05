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
	close();
	
	// get the Filename of the database
	if (! ConfigManager::getConfigOption(FILENAME_ELEMENT_NAME, m_database_name, config_ptr))
		throw EmptyFilenameException(getId());
	
	// resolve paths relative to the DatabaseManager's config file location
	m_database_name = getDatabaseManager().resolveRelativePath(m_database_name);
	
	// open up the database
	open(false);
}

DatabasePtr SQLiteDatabase::clone(void) const
{
	SQLiteDatabase *db_ptr(new SQLiteDatabase());
	db_ptr->copyDatabase(*this);
	db_ptr->m_database_name = m_database_name;
	db_ptr->open(false);
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


// SQLiteDatabase::SQLiteQuery member functions
	
	
SQLiteDatabase::SQLiteQuery::SQLiteQuery(const std::string& sql_query, sqlite3 *db_ptr)
	: Query(sql_query), m_sqlite_db(db_ptr), m_sqlite_stmt(NULL)
{
	PION_ASSERT(db_ptr != NULL);
	if (sqlite3_prepare_v2(m_sqlite_db, sql_query.c_str(), sql_query.size(),
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
