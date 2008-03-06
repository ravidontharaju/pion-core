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

#ifndef __PION_DATABASE_HEADER__
#define __PION_DATABASE_HEADER__

#include <map>
#include <string>
#include <pion/PionConfig.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/PlatformPlugin.hpp>
#include <pion/platform/Query.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

	
///
/// Database: abstract class for storing and retrieving Events
///
class PION_PLATFORM_API Database
	: public PlatformPlugin
{
public:
	
	/// exception thrown if the database is busy & the query should be tried again later
	class DatabaseBusyException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "Database is busy.  Try again later";
		}
	};

	/// exception thrown if a Query cannot be found
	class QueryNotFoundException : public PionException {
	public:
		QueryNotFoundException(const std::string& query_id)
			: PionException("Unable find database query identified by: ", query_id) {}
	};

	/// exception thrown if there is an error opening a Database
	class OpenDatabaseException : public PionException {
	public:
		OpenDatabaseException(const std::string& db_name)
			: PionException("Unable to open database: ", db_name) {}
	};
	
	
	/// constructs a new Database object
	Database(void) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~Database() {}
	
	/**
	 * retrieves a pre-compiled query for the database
	 * 
	 * @param query_id string used to uniquely identify the type of query
	 * @return QueryPtr pointer to the compiled query
	 */
	inline QueryPtr getQuery(QueryID query_id) const {
		QueryMap::const_iterator i = m_query_map.find(query_id);
		if (i == m_query_map.end())
			throw QueryNotFoundException(query_id);
		return i->second;
	}
	
	/**
	 * clones the Database, returning a pointer to the cloned copy
	 *
	 * @return DatabasePtr pointer to the cloned copy of the Database
	 */
	virtual boost::shared_ptr<Database> clone(void) const = 0;
	
	/**
	 * opens the database connection
	 *
	 * @param create_backup if true, create a backup of the old database before opening
	 */
	virtual void open(bool create_backup = false) = 0;
	
	/// closes the database connection
	virtual void close(void) = 0;

	/// returns true if the database connection is open
	virtual bool is_open(void) const = 0;

	/**
	 * runs a simple query, ignoring any results returned
	 *
	 * @param sql_query SQL query to execute
	 */
	virtual void runQuery(const std::string& sql_query) = 0;
	
	/**
	 * adds a compiled SQL query to the database
	 *
	 * @param query_id string used to uniquely identify the type of query
	 * @param sql_query SQL query to compile and cache for later use
	 */
	virtual QueryPtr addQuery(QueryID query_id, const std::string& sql_query) = 0;
	
	/**
	 * creates a database table for output, if it does not already exist
	 *
	 * @param field_map mapping of Vocabulary Terms to Database fields
	 * @param table_name name of the table to create
	 */
	virtual void createTable(const Query::FieldMap& field_map,
							 const std::string& table_name) = 0;
	
	/**
	 * prepares the query that is used to insert events
	 *
	 * @param field_map mapping of Vocabulary Terms to Database fields
	 * @param table_name name of the table to insert events into
	 *
	 * @return QueryPtr smart pointer to the new query for inserting events
	 */
	virtual QueryPtr prepareInsertQuery(const Query::FieldMap& field_map,
										const std::string& table_name) = 0;
	
	/**
	 * sets configuration parameters for this Database
	 *
	 * @param v the Vocabulary that this Database will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Database
	 *                   configuration parameters
	 */
	virtual void setConfig(const Vocabulary& v, const xmlNodePtr config_ptr);
	
	
protected:

	/// protected copy function (use clone() instead)
	inline void copyDatabase(const Database& d) {
		PlatformPlugin::copyPlugin(d);
	}
	
	
	/// data type that maps query identifiers to pointers of compiled queries
	typedef std::map<QueryID, QueryPtr>		QueryMap;
	
	
	/// unique identifier used to represent the "insert event" query
	static const std::string				INSERT_QUERY_ID;	
	
	
	/// used to keep track of all the database's pre-compiled queries
	QueryMap								m_query_map;
};	

	
/// data type used for Database smart pointers
typedef boost::shared_ptr<Database>			DatabasePtr;

	
//
// The following symbols must be defined for any Databases that you would
// like to be able to load dynamically using the DatabaseManager::load()
// function.  These are not required for any Databases that you only want
// to link directly into your programs.
//
// Make sure that you replace "DATABASE" with the name of your derived class.
// This name must also match the name of the object file (excluding the
// extension).  These symbols must be linked into your Database's object
// file, not included in any headers that it may use (declarations are OK in
// headers but not the definitions).
//
// The "pion_create" function is used to create new instances of your Database.
// The "pion_destroy" function is used to destroy instances of your Database.
//
// extern "C" PION_PLUGIN_API Database *pion_create_DATABASE(void) {
//		return new DATABASE;
// }
//
// extern "C" PION_PLUGIN_API void pion_destroy_DATABASE(DATABASE *database_ptr) {
//		delete database_ptr;
// }
//
	

}	// end namespace platform
}	// end namespace pion

#endif
