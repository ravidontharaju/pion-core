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

	readConfig(config_ptr, "SQLite");

	// get the Filename of the database
	if (! ConfigManager::getConfigOption(FILENAME_ELEMENT_NAME, m_database_name, config_ptr))
		throw EmptyFilenameException(getId());

	// resolve paths relative to the platform DataDirectory
	boost::filesystem::path path_to_file(boost::filesystem::system_complete(getDatabaseManager().getDataDirectory()));
	path_to_file /= m_database_name;
	path_to_file.normalize();
	m_database_name = path_to_file.file_string();
}

DatabasePtr SQLiteDatabase::clone(void) const
{
	SQLiteDatabase *db_ptr(new SQLiteDatabase());
	db_ptr->copyDatabase(*this);
	db_ptr->m_database_name = m_database_name;
	return DatabasePtr(db_ptr);
}

std::string dbPartition(std::string name, unsigned partition)
{
	if (partition) {
		char buff[10];
		sprintf(buff, "_%03u.db", partition);
		std::string::size_type i = 0;
		if ((i = name.find(".db", i)) != std::string::npos)
			name.replace(i, strlen(".db"), buff);
		else
			name += buff;
	}
	return name;
}

void SQLiteDatabase::open(unsigned partition)
{
	// create a backup copy of the database before opening it
/* "no backups no more" since it's not supported by Enterprise database either...
	const bool is_new_database = ! boost::filesystem::exists(m_database_name);
	if (! is_new_database && create_backup) {
		const std::string backup_filename(m_database_name + BACKUP_FILE_EXTENSION);
		if (boost::filesystem::exists(backup_filename))
			boost::filesystem::remove(backup_filename);
		boost::filesystem::copy_file(m_database_name, backup_filename);
	}
*/
	// If Partitioning: Change "name.db" into "name_001.db" or, "name" into "name_001.db"
	std::string dbname = dbPartition(m_database_name, partition);

	// open up the database
//	if (sqlite3_open_v2(m_database_name.c_str(), &m_sqlite_db, SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX, NULL) != SQLITE_OK) {
	if (sqlite3_open_v2(dbname.c_str(), &m_sqlite_db, SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_NOMUTEX, NULL) != SQLITE_OK) {
		// prevent memory leak (sqlite3 assigns handle even if error)
		if (m_sqlite_db != NULL) {
			sqlite3_close(m_sqlite_db);
			m_sqlite_db = NULL;
		}
		throw OpenDatabaseException(dbname);
	}

	// set a 10s busy timeout to deal with db locking
	sqlite3_busy_timeout(m_sqlite_db, 10000);

	// execute all PreSQL (if any)
	for (unsigned i = 0; i < m_pre_sql.size(); i++)
		if (sqlite3_exec(m_sqlite_db, m_pre_sql[i].c_str(), NULL, NULL, &m_error_ptr) != SQLITE_OK)
			throw SQLiteAPIException(getSQLiteError());
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
								std::string& table_name,
								const Query::IndexMap& index_map,
								unsigned partition)
{
	PION_ASSERT(is_open());

	// If partition is defined, change table_name
	if (partition) {
		char buff[10];
		sprintf(buff, "_%03u", partition);
		table_name += buff;
	}

	// build a SQL query to create the output table if it doesn't yet exist
	std::string create_table_sql = m_create_log;
	stringSubstitutes(create_table_sql, field_map, table_name);

	// run the SQL query to create the table
	runQuery(create_table_sql);

	// CREATE [UNIQUE] INDEX [IF NOT EXISTS] [dbname.] indexname ON tablename ( indexcolumn [, indexcolumn] )
	//		indexcolumn:  indexcolumn [COLLATE collatename] [ ASC | DESC]
	// DROP INDEX [IF EXISTS] [dbname.] indexname
	for (unsigned i = 0; i < index_map.size(); i++) {
		std::string Sql;
		const std::string idxname = table_name + "_" + field_map[i].first + "_idx";
		if (index_map[i] == "false" || index_map[i].empty())
			Sql = "DROP INDEX IF EXISTS " + idxname;
		else if (index_map[i] == "true")
			Sql = "CREATE INDEX IF NOT EXISTS " + idxname + " ON " + table_name + " ( " + field_map[i].first + " )";
		else if (index_map[i] == "unique")
			Sql = "CREATE UNIQUE INDEX IF NOT EXISTS " + idxname + " ON " + table_name + " ( " + field_map[i].first + " )";
		else
			Sql = "CREATE INDEX IF NOT EXISTS " + idxname + " ON " + table_name + " ( " + index_map[i] + " )";

		if (sqlite3_exec(m_sqlite_db, Sql.c_str(), NULL, NULL, &m_error_ptr) != SQLITE_OK)
			throw SQLiteAPIException(getSQLiteError());
	}
}

void SQLiteDatabase::dropTable(std::string& table_name, unsigned partition)
{
	if (m_sqlite_db) {
		close();
//		if (unlink(dbPartition(table_name, partition).c_str()))
		if (unlink(dbPartition(m_database_name, partition).c_str()))
		  throw SQLiteAPIException(strerror(errno) + dbPartition(m_database_name, partition));
//		  throw SQLiteAPIException(strerror(errno) + ":" + dbPartition(table_name, partition));
		open(partition);
	} else {
		unlink(dbPartition(table_name, partition).c_str());
	}
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
	std::string insert_sql = m_insert_log;
	stringSubstitutes(insert_sql, field_map, table_name);

	// compile the SQL query into a prepared statement
	return addQuery(Database::INSERT_QUERY_ID, insert_sql);
}

QueryPtr SQLiteDatabase::prepareInsertIgnoreQuery(const Query::FieldMap& field_map,
											const std::string& table_name)
{
	PION_ASSERT(is_open());

	// exit early if it already exists
	QueryMap::const_iterator query_it = m_query_map.find(INSERT_IGNORE_QUERY_ID);
	if (query_it != m_query_map.end())
		return query_it->second;

	// build a SQL query that can be used to insert a new record
	std::string insert_sql = m_insert_ignore;
	stringSubstitutes(insert_sql, field_map, table_name);

	// compile the SQL query into a prepared statement
	return addQuery(Database::INSERT_IGNORE_QUERY_ID, insert_sql);
}

QueryPtr SQLiteDatabase::getBeginTransactionQuery(void)
{
	PION_ASSERT(is_open());
	QueryMap::const_iterator i = m_query_map.find(BEGIN_QUERY_ID);
	if (i == m_query_map.end())
		return addQuery(BEGIN_QUERY_ID, m_begin_insert);
	return i->second;
}

QueryPtr SQLiteDatabase::getCommitTransactionQuery(void)
{
	PION_ASSERT(is_open());
	QueryMap::const_iterator i = m_query_map.find(COMMIT_QUERY_ID);
	if (i == m_query_map.end())
		return addQuery(COMMIT_QUERY_ID, m_commit_insert);
	return i->second;
}

QueryPtr SQLiteDatabase::prepareFullQuery(const std::string& query)
{
	PION_ASSERT(is_open());

	QueryPtr query_ptr(new SQLiteQuery(query, m_sqlite_db));
	return query_ptr;
}

bool SQLiteDatabase::SQLiteQuery::runFullQuery(const pion::platform::Query::FieldMap& ins, const pion::platform::EventPtr& src,
	const pion::platform::Query::FieldMap& outs, pion::platform::EventPtr& dest, unsigned int limit)
{
	bool changes = false;
	sqlite3_reset(m_sqlite_stmt);
	bindEvent(ins, *src);
	while (sqlite3_step(m_sqlite_stmt) == SQLITE_ROW) {
		fetchEvent(outs, dest);
		changes = true;
		if (!--limit) return changes;
	}
	return changes;
}

bool SQLiteDatabase::SQLiteQuery::runFullGetMore(const pion::platform::Query::FieldMap& outs, pion::platform::EventPtr& dest,
	unsigned int limit)
{
	bool changes = false;
	while (sqlite3_step(m_sqlite_stmt) == SQLITE_ROW) {
		fetchEvent(outs, dest);
		changes = true;
		if (!--limit) return changes;
	}
	return changes;
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
		case SQLITE_LOCKED:
		case SQLITE_BUSY:
			throw Database::DatabaseBusyException();
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


bool SQLiteDatabase::SQLiteQuery::fetchRow(const FieldMap& field_map, EventPtr e)
{
	bool row_available = false;
	switch (sqlite3_step(m_sqlite_stmt)) {
		case SQLITE_BUSY:
			throw SQLiteDatabase::DatabaseBusyException();
			break;
		case SQLITE_ROW:
			// a new result row is available
			fetchEvent(field_map, e);
			row_available = true;
			break;
		case SQLITE_DONE:
			// query is finished; no more rows to return
//			row_available = false;
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
