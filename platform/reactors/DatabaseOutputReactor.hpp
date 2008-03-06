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

#ifndef __PION_DATABASEOUTPUTREACTOR_HEADER__
#define __PION_DATABASEOUTPUTREACTOR_HEADER__

#include <vector>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/Database.hpp>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// DatabaseOutputReactor: stores Events into database transaction tables
/// (Work in progress...)
///
class DatabaseOutputReactor :
	public pion::platform::Reactor
{
public:

	/// exception thrown if the DatabaseOutputReactor configuration does not define a Database
	class EmptyDatabaseException : public PionException {
	public:
		EmptyDatabaseException(const std::string& reactor_id)
			: PionException("DatabaseOutputReactor configuration is missing a required Database parameter: ", reactor_id) {}
	};
		
	/// exception thrown if the DatabaseOutputReactor configuration does not define a Table
	class EmptyTableException : public PionException {
	public:
		EmptyTableException(const std::string& reactor_id)
			: PionException("DatabaseOutputReactor configuration is missing a required Table parameter: ", reactor_id) {}
	};
	
	/// exception thrown if the DatabaseOutputReactor configuration includes an empty field name
	class EmptyFieldException : public PionException {
	public:
		EmptyFieldException(const std::string& reactor_id)
			: PionException("DatabaseOutputReactor configuration includes an empty field name: ", reactor_id) {}
	};
	
	/// exception thrown if the DatabaseOutputReactor configuration does not define a term in a field mapping
	class EmptyTermException : public PionException {
	public:
		EmptyTermException(const std::string& reactor_id)
			: PionException("DatabaseOutputReactor configuration is missing a term identifier: ", reactor_id) {}
	};
	
	/// exception thrown if the DatabaseOutputReactor configuration uses an unknown term in a field mapping
	class UnknownTermException : public PionException {
	public:
		UnknownTermException(const std::string& reactor_id)
			: PionException("DatabaseOutputReactor configuration maps field to an unknown term: ", reactor_id) {}
	};

	
	/// constructs a new DatabaseOutputReactor object
	DatabaseOutputReactor(void) : pion::platform::Reactor() { start(); }
	
	/// virtual destructor: this class is meant to be extended
	virtual ~DatabaseOutputReactor() {}
	
	/**
	 * sets configuration parameters for this Reactor
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Reactor
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this Reactor; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 */
	virtual void updateVocabulary(const pion::platform::Vocabulary& v);
	
	/**
	 * processes an Event by comparing its data to the configured RuleChain.
	 * Only Events which pass all Comparisons in the RuleChain will be
	 * delivered to the output connections.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void operator()(const pion::platform::EventPtr& e);
		
	
private:
	
	/// name of the database element for Pion XML config files
	static const std::string				DATABASE_ELEMENT_NAME;

	/// name of the table element for Pion XML config files
	static const std::string				TABLE_ELEMENT_NAME;

	/// name of the field element for Pion XML config files
	static const std::string				FIELD_ELEMENT_NAME;
	
	/// name of the Term ID attribute for Pion XML config files
	static const std::string				TERM_ATTRIBUTE_NAME;	

	
	/// unique identifier for the database that is used to store events
	std::string								m_database_id;

	/// name of the table into which events will be stored
	std::string								m_table_name;
	
	/// maps Term references to database field names
	pion::platform::Query::FieldMap			m_field_map;

	/// pointer to the database that is used to store events
	pion::platform::DatabasePtr				m_database_ptr;
	
	/// pointer to an prepared statement used to insert events
	pion::platform::QueryPtr				m_insert_query_ptr;
};


}	// end namespace plugins
}	// end namespace pion

#endif
