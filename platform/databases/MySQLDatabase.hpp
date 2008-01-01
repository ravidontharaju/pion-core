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

#ifndef __PION_MYSQLDATABASE_HEADER__
#define __PION_MYSQLDATABASE_HEADER__

#include <pion/PionConfig.hpp>
#include <pion/platform/Database.hpp>
#include <mysql.h>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// MySQLDatabase: class for storing and retrieving Events using a MySQL database
///
class MySQLDatabase :
	public Database
{
public:
	
	/**
	 * constructs a new MySQLDatabase object
	 *
	 * @param v the Vocabulary that this Database will use to describe Terms
	 */
	MySQLDatabase(const Vocabulary& v) : Database(v) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~MySQLDatabase() {}
	
	/**
	 * saves an Event in the Database
	 *
	 * @param e the Event to save
	 */
	virtual void save(const Event& e) = 0;
	
	/**
	 * saves a collection of Events in the Database
	 *
	 * @param c the collection of Events to save
	 */
	virtual void save(const EventCollection& c) = 0;
	
	/**
	 * saves a collection of Events in the Database
	 *
	 * @param c the collection of Events to save
	 */
	virtual void save(const EventPtrCollection& c) = 0;
	
	/**
	 * retrieves an Event from the Database
	 *
	 * @param query describes which Event to retrieve
	 * @param e the Event data retrieved, if any
	 * @return true if the query was successful, false if no matches found
	 */
	virtual bool load(const std::string& query, Event& e) const = 0;
	
	/**
	 * retrieves an Event from the Database
	 *
	 * @param query describes which Event to retrieve
	 * @return pointer to the Event retrieved, if any; null if no match found
	 */
	virtual EventPtr load(const std::string& query) const = 0;
	
	/**
	 * queries retrieval of one or more Events from the Database
	 *
	 * @param query describes which even to retrieve
	 * @param c a collection of pointers to Events retrieved
	 * @return true if the query was successful, false if no matches found
	 */
	virtual bool query(const std::string& query, EventPtrCollection& c) const = 0;

	/**
	 * this updates the Vocabulary information used by this Database; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Database will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);
	
	
protected:
	
	/// opens the database connection
	virtual void open(void) = 0;
	
	/// closes the database connection
	virtual void close(void) = 0;
};

	
}	// end namespace platform
}	// end namespace pion

#endif
