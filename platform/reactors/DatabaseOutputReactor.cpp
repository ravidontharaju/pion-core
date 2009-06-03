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
// WARRANTY; withouDatabaseOutputt even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
// more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Pion.  If not, see <http://www.gnu.org/licenses/>.
//

#include <pion/platform/Reactor.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include "DatabaseOutputReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of DatabaseOutputReactor

const boost::uint32_t		DatabaseOutputReactor::DEFAULT_QUEUE_SIZE = 10000;
const boost::uint32_t		DatabaseOutputReactor::DEFAULT_QUEUE_TIMEOUT = 5;
const std::string			DatabaseOutputReactor::DATABASE_ELEMENT_NAME = "Database";
const std::string			DatabaseOutputReactor::TABLE_ELEMENT_NAME = "Table";
const std::string			DatabaseOutputReactor::FIELD_ELEMENT_NAME = "Field";
const std::string			DatabaseOutputReactor::QUEUE_SIZE_ELEMENT_NAME = "QueueSize";
const std::string			DatabaseOutputReactor::QUEUE_TIMEOUT_ELEMENT_NAME = "QueueTimeout";
const std::string			DatabaseOutputReactor::EVENTS_QUEUED_ELEMENT_NAME = "EventsQueued";
const std::string			DatabaseOutputReactor::TERM_ATTRIBUTE_NAME = "term";
const char *				DatabaseOutputReactor::CHARSET_FOR_TABLES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";


// DatabaseOutputReactor member functions

void DatabaseOutputReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// stop reactor for config changes, but cache running status
	// so that it can be restarted later if necessary
	const bool was_running = isRunning();
	stop();

	// first set config options for the Reactor base class
	ConfigWriteLock cfg_lock(*this);
	Reactor::setConfig(v, config_ptr);

	// get the maximum number of events that may be queued for insertion
	ConfigManager::getConfigOption(QUEUE_SIZE_ELEMENT_NAME, m_queue_max, DEFAULT_QUEUE_SIZE, config_ptr);

	// get the queue timeout parameter
	ConfigManager::getConfigOption(QUEUE_TIMEOUT_ELEMENT_NAME, m_queue_timeout, DEFAULT_QUEUE_TIMEOUT, config_ptr);

	// prepare the event queue
	m_event_queue_ptr->reserve(m_queue_max);

	// get the database to use
	if (! ConfigManager::getConfigOption(DATABASE_ELEMENT_NAME, m_database_id, config_ptr))
		throw EmptyDatabaseException(getId());
	if (! getDatabaseManager().hasPlugin(m_database_id))
		throw DatabaseManager::DatabaseNotFoundException(m_database_id);

	// get the name of the table to store events in
	if (! ConfigManager::getConfigOption(TABLE_ELEMENT_NAME, m_table_name, config_ptr))
		throw EmptyTableException(getId());

	// next, map the database fields to Terms
	m_field_map.clear();
	xmlNodePtr field_node = config_ptr;
	while ( (field_node = ConfigManager::findConfigNodeByName(FIELD_ELEMENT_NAME, field_node)) != NULL)
	{
		// parse new field mapping

		// start with the name of the field (element content)
		xmlChar *xml_char_ptr = xmlNodeGetContent(field_node);
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyFieldException(getId());
		}
		const std::string field_name(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);

		if (strspn(field_name.c_str(), CHARSET_FOR_TABLES) != field_name.length())
			throw IllegalCharactersException(getId());

		// next get the Term we want to map to
		xml_char_ptr = xmlGetProp(field_node, reinterpret_cast<const xmlChar*>(TERM_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyTermException(getId());
		}
		const std::string term_id(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);

		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(term_id);

		// add the field mapping
		m_field_map.push_back(std::make_pair(field_name, v[term_ref]));

		// step to the next field mapping
		field_node = field_node->next;
	}
	if (m_field_map.empty())
		throw NoFieldsException(getId());

	// if config changed while running, restart reactor
	if (was_running)
		startNoLock();
}

void DatabaseOutputReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	ConfigWriteLock cfg_lock(*this);
	Reactor::updateVocabulary(v);
	if (m_database_ptr)
		m_database_ptr->updateVocabulary(v);

	// update Term mappings (note: references never change for a given id)
	// TaO090319: field_map no longer contains termref, can't be updated without
	//			stop/start of database, i.e. reconstruct the whole field_map
/*
	for (Query::FieldMap::iterator i = m_field_map.begin(); i != m_field_map.end(); ++i)
		i->second.second = v[i->first];
*/
}

void DatabaseOutputReactor::updateDatabases(void)
{
	// just check to see if the database was deleted (if so, stop now!)
	if (! getDatabaseManager().hasPlugin(m_database_id)) {
		stop();
		ConfigWriteLock cfg_lock(*this);
		m_database_ptr.reset();
	}
}

void DatabaseOutputReactor::query(std::ostream& out, const QueryBranches& branches,
	const QueryParams& qp)
{
	ConfigManager::writeBeginPionStatsXML(out);
	writeBeginReactorXML(out);
	writeStatsOnlyXML(out);

	boost::mutex::scoped_lock queue_lock(m_queue_mutex);

	out << '<' << EVENTS_QUEUED_ELEMENT_NAME << '>' << m_event_queue_ptr->size()
	    << "</" << EVENTS_QUEUED_ELEMENT_NAME << '>' << std::endl;

	// In addition; if full status is requested, get Database/Table/Fields
	if (branches.size() > 2 && branches[2] == "full") {
		out << '<' << DATABASE_ELEMENT_NAME << '>' << m_database_id << "</" << DATABASE_ELEMENT_NAME << '>' << std::endl
			<< '<' << TABLE_ELEMENT_NAME << '>' << m_table_name << "</" << TABLE_ELEMENT_NAME << '>' << std::endl;
		for (unsigned int i = 0; i < m_field_map.size(); i++) {
			// <Field id="0" col="dbcol">vocab:uri</Field>
			out << '<' << FIELD_ELEMENT_NAME << " id=\"" << i << "\" col=\""
				<< m_field_map[i].first << "\">" << m_field_map[i].second.term_id
				<< "</" << FIELD_ELEMENT_NAME << '>' << std::endl;
		}
	}

	queue_lock.unlock();

	writeEndReactorXML(out);
	ConfigManager::writeEndPionStatsXML(out);
}

void DatabaseOutputReactor::start(void)
{
	ConfigWriteLock cfg_lock(*this);
	startNoLock();
}

void DatabaseOutputReactor::startNoLock(void)
{
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);
	if (! m_is_running) {
		m_is_running = true;

		// open a new database connection
		m_database_ptr = getDatabaseManager().getDatabase(m_database_id);
		PION_ASSERT(m_database_ptr);

		// spawn a new thread that will be used to save events to the database
		PION_LOG_DEBUG(m_logger, "Starting database output thread: " << getId());
		m_thread.reset(new boost::thread(boost::bind(&DatabaseOutputReactor::insertEvents, this)));

		// wait for the writer thread to startup
		m_swapped_queue.wait(queue_lock);
	}
}

void DatabaseOutputReactor::stop(void)
{
	ConfigWriteLock cfg_lock(*this);
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);
	if (m_is_running) {
		// set flag to notify output thread to shutdown
		PION_LOG_DEBUG(m_logger, "Stopping database output thread: " << getId());
		m_is_running = false;
		m_wakeup_writer.notify_one();
		queue_lock.unlock();

		// wait for output thread to shutdown
		m_thread->join();

		// close the database connection (ensure that data is flushed)
		boost::mutex::scoped_lock queue_lock_two(m_queue_mutex);
		m_database_ptr.reset();
		
		// clear the event queue
		m_event_queue_ptr->clear();
	}
}

void DatabaseOutputReactor::process(const EventPtr& e)
{
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);

	// signal the writer thread if the queue is full (wait for swap)
	while (m_event_queue_ptr->size() >= m_queue_max) {

		// wakeup the writer thread to swap queues & insert events
		m_wakeup_writer.notify_one();

		// wait until the writer thread has swapped the queues
		m_swapped_queue.wait(queue_lock);
		
		// exit immediately if no longer running
		if (! isRunning())
			return;
	}

	// add the event to the insert queue
	m_event_queue_ptr->push_back(e);

	// release lock -> no longer necessary
	queue_lock.unlock();

	// deliver the event to other Reactors (if any are connected)
	deliverEvent(e);
}

void DatabaseOutputReactor::insertEvents(void)
{
	PION_LOG_DEBUG(m_logger, "Database output thread is running: " << getId());

	try {
		// open up the database if it isn't already open
		PION_ASSERT(m_database_ptr);
		m_database_ptr->open();
		PION_ASSERT(m_database_ptr->is_open());

		// create the database table if it does not yet exist
		m_database_ptr->createTable(m_field_map, m_table_name);

		// prepare the query used to insert new events into the table
		QueryPtr insert_query_ptr(m_database_ptr->prepareInsertQuery(m_field_map, m_table_name));
		PION_ASSERT(insert_query_ptr);

		// prepare the query used to begin new transactions
		QueryPtr begin_transaction_ptr(m_database_ptr->getBeginTransactionQuery());
		PION_ASSERT(begin_transaction_ptr);

		// prepare the query used to commit transactions
		QueryPtr commit_transaction_ptr(m_database_ptr->getCommitTransactionQuery());
		PION_ASSERT(commit_transaction_ptr);

		// queue of events pending insertion into the database
		boost::scoped_ptr<EventQueue>	insert_queue_ptr(new EventQueue);
		insert_queue_ptr->reserve(m_queue_max);

		// notify all threads that we have started up
		{
			// lock first to ensure start() thread is waiting when signal is sent
			boost::mutex::scoped_lock queue_lock(m_queue_mutex);
			m_swapped_queue.notify_all();
		}

		while (m_is_running) {
		
			// check if new events are available in the "insert_queue"
			if (checkEventQueue(insert_queue_ptr)) {

				PION_LOG_DEBUG(m_logger, "Database output thread woke with " << insert_queue_ptr->size() << " events available: " << getId());

				// check sanity of shared variables
				PION_ASSERT(m_database_ptr);
				PION_ASSERT(m_database_ptr->is_open());

				// begin a new transaction
//				begin_transaction_ptr->run();
//				begin_transaction_ptr->reset();

				// step through the event queue, inserting each event individually
				for (unsigned int n = 0; n < insert_queue_ptr->size(); ++n) {
					// bind the event to the insert query
					insert_query_ptr->bindEvent(m_field_map, *((*insert_queue_ptr)[n]), false);
					// execute the query to insert the record
					insert_query_ptr->run();
					insert_query_ptr->reset();
				}

				// end & commit the transaction
//				commit_transaction_ptr->run();
//				commit_transaction_ptr->reset();

				// done flushing the queue
				PION_LOG_DEBUG(m_logger, "Database output thread wrote " << insert_queue_ptr->size() << " events: " << getId());
				insert_queue_ptr->clear();

			} else {
				PION_LOG_DEBUG(m_logger, "Database output thread woke with no new events: " << getId());
			}
		}
		
	} catch (std::exception& e) {
		PION_LOG_FATAL(m_logger, e.what());
		m_is_running = false;
		m_swapped_queue.notify_all();
	}

	PION_LOG_DEBUG(m_logger, "Database output thread is exiting: " << getId());
}

bool DatabaseOutputReactor::checkEventQueue(boost::scoped_ptr<EventQueue>& insert_queue_ptr)
{
	// acquire ownership of queue
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);
	
	// skip waiting if the queue is already full (missed wakeup signal)
	if (m_event_queue_ptr->size() < m_queue_max) {

		// wait until the queue is full or the timeout expires
		m_wakeup_writer.timed_wait(queue_lock,
			boost::get_system_time() + boost::posix_time::time_duration(0, 0, m_queue_timeout, 0) );
	
		// check for early & spurious wake-ups
		if (m_event_queue_ptr->size() == 0)
			return false;
	}
	
	// swap the event queues
	insert_queue_ptr.swap(m_event_queue_ptr);

	// notify threads that the event queue has been swapped
	m_swapped_queue.notify_all();

	return true;
}

}	// end namespace plugins
}	// end namespace pion


/// creates new DatabaseOutputReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_DatabaseOutputReactor(void) {
	return new pion::plugins::DatabaseOutputReactor();
}

/// destroys DatabaseOutputReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_DatabaseOutputReactor(pion::plugins::DatabaseOutputReactor *reactor_ptr) {
	delete reactor_ptr;
}
