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

#include "SQLiteDatabase.hpp"
#include <boost/filesystem/operations.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of SQLiteDatabase
const std::string		SQLiteDatabase::BACKUP_FILE_EXTENSION = ".bak";

	
// SQLiteDatabase member functions

DatabasePtr SQLiteDatabase::clone(void) const
{
	SQLiteDatabase *db_ptr(new SQLiteDatabase());
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

Database::QueryPtr SQLiteDatabase::addQuery(QueryID query_id,
											const std::string& sql_query)
{
	return NULL;
}

bool SQLiteDatabase::runQuery(const std::string& sql_query) const
{
	return false;
}

bool SQLiteDatabase::runQuery(QueryPtr query_ptr) const
{
	return false;
}

bool SQLiteDatabase::runQuery(QueryPtr query_ptr, Event& query_params) const
{
	return false;
}

bool SQLiteDatabase::runQuery(QueryPtr query_ptr, EventPtrCollection& query_params) const
{
	return false;
}

bool SQLiteDatabase::runQuery(QueryPtr query_ptr, Event& query_params,
							  EventPtrCollection& query_results) const
{
	return false;
}

bool SQLiteDatabase::runQuery(QueryPtr query_ptr, EventPtrCollection& query_params,
							  EventPtrCollection& query_results) const
{
	return false;
}

void SQLiteDatabase::updateVocabulary(const Vocabulary& v)
{
}

}	// end namespace platform
}	// end namespace pion


/// creates new SQLiteDatabase objects
extern "C" pion::platform::Database *pion_create_SQLiteDatabase(void) {
	return new pion::platform::SQLiteDatabase();
}

/// destroys SQLiteDatabase objects
extern "C" void pion_destroy_SQLiteDatabase(pion::platform::SQLiteDatabase *database_ptr) {
	delete database_ptr;
}
