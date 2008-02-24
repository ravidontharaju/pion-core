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

#ifndef __PION_SQLITEDATABASE_HEADER__
#define __PION_SQLITEDATABASE_HEADER__

#include <pion/PionConfig.hpp>
#include <pion/platform/Database.hpp>
#include <sqlite3.h>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// SQLiteDatabase: class for storing and retrieving Events using a SQLite database
/// (Work in progress...)
///
class SQLiteDatabase :
	public Database
{
public:
	
	/**
	 * constructs a new SQLiteDatabase object
	 */
	SQLiteDatabase(void) : Database(), m_sqlite_db(NULL) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~SQLiteDatabase() { close(); }
	
	/**
	 * clones the Database, returning a pointer to the cloned copy
	 *
	 * @return DatabasePtr pointer to the cloned copy of the Database
	 */
	virtual DatabasePtr clone(void) const;

	/**
	 * opens the database connection
	 *
	 * @param create_backup if true, create a backup of the old database before opening
	 */
	virtual void open(bool create_backup = false);
	
	/// closes the database connection
	virtual void close(void);

	/**
	 * adds a compiled SQL query to the database
	 *
	 * @param query_id string used to uniquely identify the type of query
	 * @param sql_query SQL query to compile and cache for later use
	 */
	virtual QueryPtr addQuery(QueryID query_id, const std::string& sql_query);
	
	/**
	 * runs a simple query, ignoring any results returned
	 *
	 * @param sql_query SQL query to execute
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(const std::string& sql_query) const;
	
	/**
	 * runs a compiled parameterless query, ignoring any results returned
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr) const;
	
	/**
	 * runs a compiled query, ignoring any results returned
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @param query_params an Event containing parameters to bind to the query
	 *
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr, Event& query_params) const;
	
	/**
	 * runs a compiled query, ignoring any results returned
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @param query_params a collection of Event pointers containing
	 *                     parameters to bind to the query
	 *
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr, EventPtrCollection& query_params) const;
	
	/**
	 * runs a compiled query, retrieving zero or more results from the Database
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @param query_params an Event containing parameters to bind to the query
	 * @param query_results a collection of Event pointers containing the results
	 *
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr, Event& query_params,
						  EventPtrCollection& query_results) const;
	
	/**
	 * runs a compiled query, retrieving zero or more results from the Database
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @param query_params a collection of Event pointers containing
	 *                     parameters to bind to the query
	 * @param query_results a collection of Event pointers containing the results
	 *
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr, EventPtrCollection& query_params,
						  EventPtrCollection& query_results) const;
	
	/**
	 * this updates the Vocabulary information used by this Database; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Database will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);

	
private:
	
	/// extension added to the name of backup files
	static const std::string		BACKUP_FILE_EXTENSION;
	
	/// filename of the SQLite database
	std::string						m_database_name;
	
	/// SQLite v3 database handle
	sqlite3	*						m_sqlite_db;
};

	
}	// end namespace platform
}	// end namespace pion

#endif
