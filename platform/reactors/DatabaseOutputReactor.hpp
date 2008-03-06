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
#include <boost/scoped_ptr.hpp>
#include <boost/thread/thread.hpp>
#include <boost/thread/condition.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionLogger.hpp>
#include <pion/platform/Event.hpp>
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
	
	/// exception thrown if there are no database field mappings in the configuration
	class NoFieldsException : public PionException {
	public:
		NoFieldsException(const std::string& reactor_id)
			: PionException("DatabaseOutputReactor configuration must contain at least one field mapping: ", reactor_id) {}
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
	DatabaseOutputReactor(void)
		: pion::platform::Reactor(),
		m_logger(PION_GET_LOGGER("pion.DatabaseOutputReactor")),
		m_queue_max(DEFAULT_QUEUE_SIZE), m_num_queued(0)
	{}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~DatabaseOutputReactor() { stop(); }
	
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
		
	/// called by the ReactorEngine to start Event processing
	virtual void start(void);
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void);
	
	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }

	
private:
	
	/// function used by the writer thread to store events to the database
	void insertEvents(void);
	
	
	/// data type for a collection of queued Events
	typedef std::vector<pion::platform::EventPtr>	EventQueue;

	
	/// default maximum number of events that may be queued for insertion
	static const boost::uint32_t			DEFAULT_QUEUE_SIZE;
	
	/// name of the database element for Pion XML config files
	static const std::string				DATABASE_ELEMENT_NAME;

	/// name of the table element for Pion XML config files
	static const std::string				TABLE_ELEMENT_NAME;

	/// name of the field element for Pion XML config files
	static const std::string				FIELD_ELEMENT_NAME;
	
	/// name of the queue size element for Pion XML config files
	static const std::string				QUEUE_SIZE_ELEMENT_NAME;
	
	/// name of the Term ID attribute for Pion XML config files
	static const std::string				TERM_ATTRIBUTE_NAME;	

	
	/// primary logging interface used by this class
	PionLogger								m_logger;

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

	/// pointer to an prepared statement used to begin transactions
	pion::platform::QueryPtr				m_begin_transaction_ptr;

	/// pointer to an prepared statement used to end & commit transactions
	pion::platform::QueryPtr				m_commit_transaction_ptr;
	
	/// collection of events queued for storage to the database
	EventQueue								m_event_queue;
	
	/// maximum number of events that may be queued for insertion
	boost::uint32_t							m_queue_max;
	
	/// number of events that are currently queued for storage to the database
	boost::uint32_t							m_num_queued;
	
	/// condition triggered to notify the writer thread to save events to the database
	boost::condition						m_wakeup_writer;
	
	/// condition triggered to notify all threads that the the queue was flushed
	boost::condition						m_flushed_queue;

	/// thread used to store events to the database
	boost::scoped_ptr<boost::thread>		m_thread;
};


}	// end namespace plugins
}	// end namespace pion

#endif
