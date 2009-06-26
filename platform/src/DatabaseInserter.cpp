// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2009 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/DatabaseInserter.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of DatabaseInserter

const boost::uint32_t		DatabaseInserter::DEFAULT_QUEUE_SIZE = 10000;
const boost::uint32_t		DatabaseInserter::DEFAULT_QUEUE_TIMEOUT = 5;
const std::string			DatabaseInserter::DATABASE_ELEMENT_NAME = "Database";
const std::string			DatabaseInserter::TABLE_ELEMENT_NAME = "Table";
const std::string			DatabaseInserter::FIELD_ELEMENT_NAME = "Field";
const std::string			DatabaseInserter::QUEUE_SIZE_ELEMENT_NAME = "QueueSize";
const std::string			DatabaseInserter::QUEUE_TIMEOUT_ELEMENT_NAME = "QueueTimeout";
const std::string			DatabaseInserter::TERM_ATTRIBUTE_NAME = "term";
const std::string			DatabaseInserter::INDEX_ATTRIBUTE_NAME = "index";
const std::string			DatabaseInserter::SQL_ATTRIBUTE_NAME = "sql";
const char *				DatabaseInserter::CHARSET_FOR_TABLES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";


// DatabaseInserter member functions

void DatabaseInserter::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// stop for config changes, but cache running status
	// so that it can be restarted when finished
	const bool was_running = m_is_running;
	stop();

	boost::mutex::scoped_lock queue_lock(m_queue_mutex);

	// get the maximum number of events that may be queued for insertion
	ConfigManager::getConfigOption(QUEUE_SIZE_ELEMENT_NAME, m_queue_max, DEFAULT_QUEUE_SIZE, config_ptr);

	// get the queue timeout parameter
	ConfigManager::getConfigOption(QUEUE_TIMEOUT_ELEMENT_NAME, m_queue_timeout, DEFAULT_QUEUE_TIMEOUT, config_ptr);

	// prepare the event queue
	m_event_queue_ptr->reserve(m_queue_max);

	// get the database to use
	if (! ConfigManager::getConfigOption(DATABASE_ELEMENT_NAME, m_database_id, config_ptr))
		throw EmptyDatabaseException();
	if (! getDatabaseManager().hasPlugin(m_database_id))
		throw DatabaseManager::DatabaseNotFoundException(m_database_id);

	// get the name of the table to store events in
	if (! ConfigManager::getConfigOption(TABLE_ELEMENT_NAME, m_table_name, config_ptr))
		throw EmptyTableException();

	// next, map the database fields to Terms
	m_field_map.clear();
	m_index_map.clear();
	xmlNodePtr field_node = config_ptr;
	while ( (field_node = ConfigManager::findConfigNodeByName(FIELD_ELEMENT_NAME, field_node)) != NULL)
	{
		// parse new field mapping

		// start with the name of the field (element content)
		xmlChar *xml_char_ptr = xmlNodeGetContent(field_node);
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyFieldException();
		}
		const std::string field_name(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);

		if (strspn(field_name.c_str(), CHARSET_FOR_TABLES) != field_name.length())
			throw IllegalCharactersException(field_name);

		// next get the Term we want to map to
		const std::string term_id = ConfigManager::getAttribute(TERM_ATTRIBUTE_NAME, field_node);
		if (term_id.empty())
			throw EmptyTermException();

		const std::string index_str = ConfigManager::getAttribute(INDEX_ATTRIBUTE_NAME, field_node);

		const std::string sql_str = ConfigManager::getAttribute(SQL_ATTRIBUTE_NAME, field_node);

		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(term_id);

		// add the field mapping
		m_field_map.push_back(std::make_pair(field_name, v[term_ref]));
		m_index_map.push_back(index_str);

		// step to the next field mapping
		field_node = field_node->next;
	}
	if (m_field_map.empty())
		throw NoFieldsException();

	// if config changed while running, then restart
	queue_lock.unlock();
	if (was_running)
		start();
}

void DatabaseInserter::updateVocabulary(const Vocabulary& v)
{
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);
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

void DatabaseInserter::updateDatabases(void)
{
	// just check to see if the database was deleted (if so, stop now!)
	if (! getDatabaseManager().hasPlugin(m_database_id)) {
		stop();
	}
}

void DatabaseInserter::start(void)
{
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);
	if (! m_is_running) {
		m_is_running = true;

		// open a new database connection
		m_database_ptr = getDatabaseManager().getDatabase(m_database_id);
		PION_ASSERT(m_database_ptr);

		// open up the database if it isn't already open
		m_database_ptr->open();
		PION_ASSERT(m_database_ptr->is_open());

		if (m_wipe)
			m_database_ptr->dropTable(m_table_name, m_partition);

		// create the database table if it does not yet exist
		m_database_ptr->createTable(m_field_map, m_table_name, m_index_map, m_partition);

		// prepare the query used to insert new events into the table
		m_insert_query_ptr = m_database_ptr->prepareInsertQuery(m_field_map, m_table_name);
		PION_ASSERT(m_insert_query_ptr);

		// prepare the query used to begin new transactions
		m_begin_transaction_ptr = m_database_ptr->getBeginTransactionQuery();
		PION_ASSERT(m_begin_transaction_ptr);

		// prepare the query used to commit transactions
		m_commit_transaction_ptr = m_database_ptr->getCommitTransactionQuery();
		PION_ASSERT(m_commit_transaction_ptr);

		// spawn a new thread that will be used to save events to the database
		PION_LOG_DEBUG(m_logger, "Starting worker thread: " << m_database_id);
		m_thread.reset(new boost::thread(boost::bind(&DatabaseInserter::insertEvents, this)));

		// wait for the worker thread to startup
		m_swapped_queue.wait(queue_lock);
	}
}

void DatabaseInserter::stop(void)
{
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);
	if (m_is_running) {
		// set flag to notify worker thread to shutdown
		PION_LOG_DEBUG(m_logger, "Stopping worker thread: " << m_database_id);
		m_is_running = false;
		m_wakeup_worker.notify_one();
		queue_lock.unlock();

		// wait for worker thread to shutdown
		m_thread->join();

		// close the database connection (ensure that data is flushed)
		boost::mutex::scoped_lock queue_lock_two(m_queue_mutex);
		m_insert_query_ptr.reset();
		m_begin_transaction_ptr.reset();
		m_commit_transaction_ptr.reset();
		m_database_ptr.reset();
		
		// clear the event queue
		m_event_queue_ptr->clear();
	}
}

std::size_t DatabaseInserter::getEventsQueued(void) const
{
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);
	return m_event_queue_ptr->size();
}

void DatabaseInserter::insert(const EventPtr& e)
{
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);

	// make sure worker thread is running
	if (! m_is_running)
		return;
	
	// signal the worker thread if the queue is full (wait for swap)
	while (m_event_queue_ptr->size() >= m_queue_max) {

		// wakeup the worker thread to swap queues & insert events
		m_wakeup_worker.notify_one();

		// wait until the worker thread has swapped the queues
		m_swapped_queue.wait(queue_lock);
		
		// exit immediately if no longer running
		if (! m_is_running)
			return;
	}

	// add the event to the insert queue
	m_event_queue_ptr->push_back(e);
}

void DatabaseInserter::insertEvents(void)
{
	PION_LOG_DEBUG(m_logger, "Worker thread is running: " << m_database_id);

	try {

		// sanity checks (should all be handled now by start())
		PION_ASSERT(m_database_ptr);
		PION_ASSERT(m_database_ptr->is_open());
		PION_ASSERT(m_insert_query_ptr);
		PION_ASSERT(m_begin_transaction_ptr);
		PION_ASSERT(m_commit_transaction_ptr);

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

				PION_LOG_DEBUG(m_logger, "Worker thread woke with " << insert_queue_ptr->size() << " events available: " << m_database_id);

				// begin a new transaction
				m_begin_transaction_ptr->run();
				m_begin_transaction_ptr->reset();

				// step through the event queue, inserting each event individually
				for (unsigned int n = 0; n < insert_queue_ptr->size(); ++n) {
					// bind the event to the insert query
					m_insert_query_ptr->bindEvent(m_field_map, *((*insert_queue_ptr)[n]), false);
					// execute the query to insert the record
					m_insert_query_ptr->run();
					m_insert_query_ptr->reset();
				}

				// end & commit the transaction
				m_commit_transaction_ptr->run();
				m_commit_transaction_ptr->reset();

				// done flushing the queue
				PION_LOG_DEBUG(m_logger, "Worker thread wrote " << insert_queue_ptr->size() << " events: " << m_database_id);
				insert_queue_ptr->clear();

			} else {
				PION_LOG_DEBUG(m_logger, "Worker thread woke with no new events: " << m_database_id);
			}
		}
		
	} catch (std::exception& e) {
		PION_LOG_FATAL(m_logger, e.what());
		m_is_running = false;
		m_swapped_queue.notify_all();
	}

	PION_LOG_DEBUG(m_logger, "Worker thread is exiting: " << m_database_id);
}

bool DatabaseInserter::checkEventQueue(boost::scoped_ptr<EventQueue>& insert_queue_ptr)
{
	// acquire ownership of queue
	boost::mutex::scoped_lock queue_lock(m_queue_mutex);
	
	// skip waiting if the queue is already full (missed wakeup signal)
	if (m_event_queue_ptr->size() < m_queue_max) {

		// wait until the queue is full or the timeout expires
		m_wakeup_worker.timed_wait(queue_lock,
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

DatabaseManager& DatabaseInserter::getDatabaseManager(void)
{
	if (m_database_mgr_ptr == NULL)
		throw MissingDatabaseManagerException();
	return *m_database_mgr_ptr;
}

}	// end namespace platform
}	// end namespace pion

