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
#include <pion/PionException.hpp>
#include <pion/platform/Database.hpp>
#include <sqlite3.h>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// SQLiteDatabase: class for storing and retrieving Events using a SQLite database
///
class SQLiteDatabase :
	public pion::platform::Database
{
public:
	
	/// exception thrown if the SQLiteDatabase configuration does not define a Filename
	class EmptyFilenameException : public PionException {
	public:
		EmptyFilenameException(const std::string& database_id)
			: PionException("SQLiteDatabase configuration is missing a required Filename parameter: ", database_id) {}
	};

	/// exception thrown if the the SQLite API returns an unexpected result
	class SQLiteAPIException : public PionException {
	public:
		SQLiteAPIException(const std::string& sqlite_error_msg)
			: PionException("SQLiteDatabase API error: ", sqlite_error_msg) {}
	};
	
	
	/**
	 * constructs a new SQLiteDatabase object
	 */
	SQLiteDatabase(void)
		: pion::platform::Database(), m_sqlite_db(NULL), m_error_ptr(NULL)
	{}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~SQLiteDatabase() { m_query_map.clear(); close(); }
	
	/**
	 * clones the Database, returning a pointer to the cloned copy
	 *
	 * @return DatabasePtr pointer to the cloned copy of the Database
	 */
	virtual pion::platform::DatabasePtr clone(void) const;

	/**
	 * opens the database connection
	 *
	 * @param create_backup if true, create a backup of the old database before opening
	 */
	virtual void open(bool create_backup = false);
	
	/// closes the database connection
	virtual void close(void);
	
	/// returns true if the database connection is open
	virtual bool is_open(void) const { return m_sqlite_db != NULL; }

	/**
	 * runs a simple query, ignoring any results returned
	 *
	 * @param sql_query SQL query to execute
	 */
	virtual void runQuery(const std::string& sql_query);
	
	/**
	 * adds a compiled SQL query to the database
	 *
	 * @param query_id string used to uniquely identify the type of query
	 * @param sql_query SQL query to compile and cache for later use
	 */
	virtual pion::platform::QueryPtr addQuery(pion::platform::QueryID query_id,
											  const std::string& sql_query);
	
	/**
	 * creates a database table for output, if it does not already exist
	 *
	 * @param field_map mapping of Vocabulary Terms to Database fields
	 * @param table_name name of the table to create
	 */
	virtual void createTable(const pion::platform::Query::FieldMap& field_map,
							 const std::string& table_name);
	
	/**
	 * prepares the query that is used to insert events
	 *
	 * @param field_map mapping of Vocabulary Terms to Database fields
	 * @param table_name name of the table to insert events into
	 *
	 * @return QueryPtr smart pointer to the new query for inserting events
	 */
	virtual pion::platform::QueryPtr prepareInsertQuery(const pion::platform::Query::FieldMap& field_map,
														const std::string& table_name);
	
	/**
	 * sets configuration parameters for this Database
	 *
	 * @param v the Vocabulary that this Database will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Database
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);

	/**
	 * throws an API exception using the most recent log message set for a database
	 *
	 * @param db_ptr pointer to a SQLite database to use
	 */
	static inline void throwAPIException(sqlite3 *db_ptr) {
		PION_ASSERT(db_ptr != NULL);
		std::string error_msg(sqlite3_errmsg(db_ptr));
		throw SQLiteAPIException(error_msg);
	}
	
		
protected:
	
	/**
	 * returns the SQLite data type for a given Pion Vocabulary data type
	 *
	 * @param term_type the Pion Vocabulary data type
	 *
	 * @return int SQLITE_NULL, SQLITE_INTEGER, SQLITE_FLOAT, SQLITE_TEXT or SQLITE_BLOB
	 */
	static inline int getSQLiteType(const pion::platform::Vocabulary::DataType term_type);
	
	/**
	 * returns the SQLite affinity for a given Pion Vocabulary data type
	 *
	 * @param term_type the Pion Vocabulary data type
	 *
	 * @return std::string "NONE", "INTEGER", "REAL", "TEXT" or "NONE"
	 */
	static inline std::string getSQLiteAffinity(const pion::platform::Vocabulary::DataType term_type);

	/// returns a string containing the SQLite API error message
	inline std::string getSQLiteError(void);

	
	///
	/// SQLiteQuery: a compiled query used by SQLite databases
	///
	class SQLiteQuery
		: public pion::platform::Query
	{
	public:
		
		/// virtual destructor releases the prepared statement
		virtual ~SQLiteQuery() { sqlite3_finalize(m_sqlite_stmt); }
		
		/**
		 * constructs a new SQLiteQuery object
		 *
		 * @param database reference to the Database used to perform the query
		 * @param sqlite_db the SQLite database that this query belongs to
		 */
		SQLiteQuery(const std::string& sql_query, sqlite3 *db_ptr);

		/**
		 * binds a NULL value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 */
		virtual void bindNull(unsigned int param) {
			if (sqlite3_bind_null(m_sqlite_stmt, param+1) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}

		/**
		 * binds a std::string value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindString(unsigned int param, const std::string& value) {
			if (sqlite3_bind_text(m_sqlite_stmt, param+1, value.c_str(),
								  value.size(), SQLITE_TRANSIENT) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds a string (const char *) value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindString(unsigned int param, const char *value) {
			if (sqlite3_bind_text(m_sqlite_stmt, param+1, value,
								  -1, SQLITE_TRANSIENT) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds an integer value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindInt(unsigned int param, const boost::int32_t value) {
			if (sqlite3_bind_int(m_sqlite_stmt, param+1, value) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds an unsigned integer value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindUInt(unsigned int param, const boost::uint32_t value) {
			if (sqlite3_bind_int(m_sqlite_stmt, param+1, value) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds a big integer value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindBigInt(unsigned int param, const boost::int64_t value) {
			if (sqlite3_bind_int64(m_sqlite_stmt, param+1, value) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds an unsigned big integer value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindUBigInt(unsigned int param, const boost::uint64_t value) {
			if (sqlite3_bind_int64(m_sqlite_stmt, param+1, value) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds a floating point number value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindFloat(unsigned int param, const float value) {
			if (sqlite3_bind_double(m_sqlite_stmt, param+1, value) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds a double floating point number value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindDouble(unsigned int param, const double value) {
			if (sqlite3_bind_double(m_sqlite_stmt, param+1, value) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds a long double floating point number value to a query parameter
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindLongDouble(unsigned int param, const long double value) {
			if (sqlite3_bind_double(m_sqlite_stmt, param+1, value) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * binds a date_time value to a query parameter (use bindString() instead)
		 * 
		 * @param param the query parameter number to which the value will be bound (starting with 0)
		 * @param value the value to bind to the query parameter
		 */
		virtual void bindDateTime(unsigned int param, const PionDateTime& value) {
			// store it as an iso extended string
			std::string as_string(boost::posix_time::to_iso_extended_string(value));
			if (sqlite3_bind_text(m_sqlite_stmt, param+1, as_string.c_str(),
								  as_string.size(), SQLITE_TRANSIENT) != SQLITE_OK)
				SQLiteDatabase::throwAPIException(m_sqlite_db);
		}
		
		/**
		 * runs the compiled query
		 *
		 * @return true if there is a result row available
		 */
		virtual bool run(void);

		/// resets the compiled query so that it can be run again
		virtual void reset(void) { sqlite3_reset(m_sqlite_stmt); }
		
		
	private:
		
		/// points to the SQLite database that this query belongs to
		sqlite3 *			m_sqlite_db;

		/// points to a SQLite prepared statement used for this Query
		sqlite3_stmt *		m_sqlite_stmt;
	};

	
private:
	
	/// extension added to the name of backup files
	static const std::string		BACKUP_FILE_EXTENSION;
	
	/// name of the Filename element for Pion XML config files
	static const std::string		FILENAME_ELEMENT_NAME;

	
	/// filename of the SQLite database
	std::string						m_database_name;
	
	/// SQLite v3 database handle
	sqlite3	*						m_sqlite_db;
	
	/// points the an error message returned from a SQLite API call
	char *							m_error_ptr;
};

	
// inline member functions for SQLiteDatabase
	
inline int SQLiteDatabase::getSQLiteType(const pion::platform::Vocabulary::DataType term_type)
{
	switch(term_type) {
		case pion::platform::Vocabulary::TYPE_NULL:
		case pion::platform::Vocabulary::TYPE_OBJECT:
			return SQLITE_NULL;
			break;
		case pion::platform::Vocabulary::TYPE_INT8:
		case pion::platform::Vocabulary::TYPE_INT16:
		case pion::platform::Vocabulary::TYPE_INT32:
		case pion::platform::Vocabulary::TYPE_INT64:
		case pion::platform::Vocabulary::TYPE_UINT8:
		case pion::platform::Vocabulary::TYPE_UINT16:
		case pion::platform::Vocabulary::TYPE_UINT32:
		case pion::platform::Vocabulary::TYPE_UINT64:
			return SQLITE_INTEGER;
			break;
		case pion::platform::Vocabulary::TYPE_FLOAT:
		case pion::platform::Vocabulary::TYPE_DOUBLE:
		case pion::platform::Vocabulary::TYPE_LONG_DOUBLE:
			return SQLITE_FLOAT;
			break;
		case pion::platform::Vocabulary::TYPE_SHORT_STRING:
		case pion::platform::Vocabulary::TYPE_STRING:
		case pion::platform::Vocabulary::TYPE_LONG_STRING:
		case pion::platform::Vocabulary::TYPE_CHAR:
		case pion::platform::Vocabulary::TYPE_DATE_TIME:
		case pion::platform::Vocabulary::TYPE_DATE:
		case pion::platform::Vocabulary::TYPE_TIME:
			return SQLITE_TEXT;
			break;
	}
}

inline std::string SQLiteDatabase::getSQLiteAffinity(const pion::platform::Vocabulary::DataType term_type)
{
	std::string affinity;
	switch(term_type) {
		case pion::platform::Vocabulary::TYPE_NULL:
		case pion::platform::Vocabulary::TYPE_OBJECT:
			affinity = "NONE";
			break;
		case pion::platform::Vocabulary::TYPE_INT8:
		case pion::platform::Vocabulary::TYPE_INT16:
		case pion::platform::Vocabulary::TYPE_INT32:
		case pion::platform::Vocabulary::TYPE_INT64:
		case pion::platform::Vocabulary::TYPE_UINT8:
		case pion::platform::Vocabulary::TYPE_UINT16:
		case pion::platform::Vocabulary::TYPE_UINT32:
		case pion::platform::Vocabulary::TYPE_UINT64:
			affinity = "INTEGER";
			break;
		case pion::platform::Vocabulary::TYPE_FLOAT:
		case pion::platform::Vocabulary::TYPE_DOUBLE:
		case pion::platform::Vocabulary::TYPE_LONG_DOUBLE:
			affinity = "REAL";
			break;
		case pion::platform::Vocabulary::TYPE_SHORT_STRING:
		case pion::platform::Vocabulary::TYPE_STRING:
		case pion::platform::Vocabulary::TYPE_LONG_STRING:
		case pion::platform::Vocabulary::TYPE_CHAR:
		case pion::platform::Vocabulary::TYPE_DATE_TIME:
		case pion::platform::Vocabulary::TYPE_DATE:
		case pion::platform::Vocabulary::TYPE_TIME:
			affinity = "TEXT";
			break;
	}
	return affinity;
}

inline std::string SQLiteDatabase::getSQLiteError(void)
{
	std::string error_str;
	if (m_error_ptr != NULL) {
		error_str = m_error_ptr;
		sqlite3_free(m_error_ptr);
		m_error_ptr = NULL;
	}
	return error_str;
}
	
	
}	// end namespace plugins
}	// end namespace pion

#endif
