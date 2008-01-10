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

#include <string>
#include <boost/noncopyable.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionHashMap.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// Database: abstract class for storing and retrieving Events
///
class Database
	: private boost::noncopyable
{
public:
	
	/// exception thrown if the database does not recognize a configuration option
	class UnknownOptionException : public PionException {
	public:
		UnknownOptionException(const std::string& option_name)
			: PionException("Option not recognized by database: ", option_name) {}
	};

	/// exception thrown if there is an error opening a Database
	class OpenDatabaseException : public PionException {
	public:
		OpenDatabaseException(const std::string& db_name)
			: PionException("Unable to open database: ", db_name) {}
	};

	
	/// data type used to uniquely identify a specific type of database query
	typedef std::string		QueryID;
	
	/// data type representing a pre-compiled query
	typedef void *			QueryPtr;

	
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
		QueryPtr query_ptr = NULL;
		boost::mutex::scoped_lock database_lock(m_mutex);
		QueryMap::const_iterator i = m_query_map.find(query_id);
		if (i != m_query_map.end())
			query_ptr = i->second;
		return query_ptr;
	}
	
	/**
	 * opens the database connection
	 *
	 * @param create_backup if true, create a backup of the old database before opening
	 */
	virtual void open(bool create_backup = false) = 0;
	
	/// closes the database connection
	virtual void close(void) = 0;

	/**
	 * adds a compiled SQL query to the database
	 *
	 * @param query_id string used to uniquely identify the type of query
	 * @param sql_query SQL query to compile and cache for later use
	 */
	virtual QueryPtr addQuery(QueryID query_id, const std::string& sql_query) = 0;
	
	/**
	 * runs a simple query, ignoring any results returned
	 *
	 * @param sql_query SQL query to execute
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(const std::string& sql_query) const = 0;
	
	/**
	 * runs a compiled parameterless query, ignoring any results returned
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr) const = 0;
	
	/**
	 * runs a compiled query, ignoring any results returned
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @param query_params an Event containing parameters to bind to the query
	 *
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr, Event& query_params) const = 0;
	
	/**
	 * runs a compiled query, ignoring any results returned
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @param query_params a collection of Event pointers containing parameters to bind to the query
	 *
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr, EventPtrCollection& query_params) const = 0;

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
						  EventPtrCollection& query_results) const = 0;
	
	/**
	 * runs a compiled query, retrieving zero or more results from the Database
	 *
	 * @param query_ptr pointer to a compiled query to execute
	 * @param query_params a collection of Event pointers containing parameters to bind to the query
	 * @param query_results a collection of Event pointers containing the results
	 *
	 * @return true if the query was successful, false otherwise
	 */
	virtual bool runQuery(QueryPtr query_ptr, EventPtrCollection& query_params,
						  EventPtrCollection& query_results) const = 0;
	
	/**
	 * this updates the Vocabulary information used by this Database; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Database will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v) = 0;
	
	/**
	 * sets a configuration option
	 *
	 * @param option_name the name of the option to change
	 * @param option_value the value of the option
	 */
	virtual void setOption(const std::string& option_name, const std::string& option_value) {
		throw UnknownOptionException(option_name);
	}
	
	/// sets the unique identifier for this Database
	inline void setId(const std::string& database_id) { m_database_id = database_id; }
	
	/// returns the unique identifier for this Database
	inline const std::string& getId(void) const { return m_database_id; }
	
	
protected:

	
	/// data type that maps query identifiers to pointers of compiled queries
	typedef PION_HASH_MAP<QueryID, QueryPtr, PION_HASH(QueryID) >		QueryMap;

	
	/// name of the database element for Pion XML config files
	static const std::string		DATABASE_ELEMENT_NAME;
	
	/// name of the table element for Pion XML config files
	static const std::string		TABLE_ELEMENT_NAME;
	
	/// name of the field element for Pion XML config files
	static const std::string		FIELD_ELEMENT_NAME;
	
	/// name of the comment element for Pion XML config files
	static const std::string		COMMENT_ELEMENT_NAME;
	

	/// used to keep track of all the database's pre-compiled queries
	QueryMap						m_query_map;

	/// uniquely identifies this particular Database
	std::string						m_database_id;

	/// mutex to make class thread-safe
	mutable boost::mutex			m_mutex;
};	


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
