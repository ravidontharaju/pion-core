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

const boost::uint32_t		DatabaseOutputReactor::DEFAULT_QUEUE_SIZE = 1000;
const std::string			DatabaseOutputReactor::DATABASE_ELEMENT_NAME = "Database";
const std::string			DatabaseOutputReactor::TABLE_ELEMENT_NAME = "Table";
const std::string			DatabaseOutputReactor::FIELD_ELEMENT_NAME = "Field";
const std::string			DatabaseOutputReactor::QUEUE_SIZE_ELEMENT_NAME = "QueueSize";
const std::string			DatabaseOutputReactor::TERM_ATTRIBUTE_NAME = "term";

	
// DatabaseOutputReactor member functions

void DatabaseOutputReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);
	
	// get the maximum number of events that may be queued for insertion
	std::string queue_size_str;
	if (ConfigManager::getConfigOption(QUEUE_SIZE_ELEMENT_NAME, queue_size_str, config_ptr)) {
		m_queue_max = boost::lexical_cast<boost::uint32_t>(queue_size_str);
		if (m_queue_max < 1) m_queue_max = 1;
	} else m_queue_max = DEFAULT_QUEUE_SIZE;

	// prepare the event queue
	while (m_event_queue.size() < m_queue_max)
		m_event_queue.push_back( EventPtr() );

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
		m_field_map.insert(std::make_pair(term_ref, std::make_pair(field_name, v[term_ref])));
		
		// step to the next field mapping
		field_node = field_node->next;
	}
	if (m_field_map.empty())
		throw NoFieldsException(getId());
}
	
void DatabaseOutputReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::updateVocabulary(v);
	if (m_database_ptr)
		m_database_ptr->updateVocabulary(v);
	
	// update Term mappings (note: references never change for a given id)
	for (Query::FieldMap::iterator i = m_field_map.begin(); i != m_field_map.end(); ++i)
		i->second.second = v[i->first];
}
	
void DatabaseOutputReactor::updateDatabases(void)
{
	// just check to see if the database was deleted (if so, stop now!)
	if (! getDatabaseManager().hasPlugin(m_database_id)) {
		stop();
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		m_database_ptr.reset();
	}
}	
	
void DatabaseOutputReactor::operator()(const EventPtr& e)
{
	if (isRunning()) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		incrementEventsIn();

		// if the event queue is full, we need to wait for the writer..
		while (m_num_queued >= m_queue_max) {
			m_wakeup_writer.notify_one();
			m_flushed_queue.wait(reactor_lock);
			if (! isRunning())
				return;
		}
			
		// add the event to the insert queue
		m_event_queue[m_num_queued] = e;
		
		// signal the writer thread if the queue is full
		if (++m_num_queued == m_queue_max)
			m_wakeup_writer.notify_one();

		// deliver the event to other Reactors (if any are connected)
		deliverEvent(e);
	}
}

void DatabaseOutputReactor::start(void)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	if (! m_is_running) {
		m_is_running = true;

		// open a new database connection
		m_database_ptr = getDatabaseManager().getDatabase(m_database_id);
		PION_ASSERT(m_database_ptr);

		// spawn a new thread that will be used to save events to the database
		PION_LOG_DEBUG(m_logger, "Starting database output thread: " << getId());
		m_thread.reset(new boost::thread(boost::bind(&DatabaseOutputReactor::insertEvents, this)));
		
		// wait for the writer thread to startup
		m_flushed_queue.wait(reactor_lock);
	}
}

void DatabaseOutputReactor::stop(void)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	if (m_is_running) {
		// set flag to notify reader thread to shutdown
		PION_LOG_DEBUG(m_logger, "Stopping database output thread: " << getId());
		m_is_running = false;
		m_wakeup_writer.notify_one();
		reactor_lock.unlock();

		// wait for reader thread to shutdown
		m_thread->join();

		// close the database connection
		boost::mutex::scoped_lock reactor_lock_two(m_mutex);
		m_database_ptr.reset();
	}
}

void DatabaseOutputReactor::insertEvents(void)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	
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

		// notify all threads that we have started up
		m_flushed_queue.notify_all();

		while (m_is_running) {
			// wait until it is time to go!
			m_wakeup_writer.wait(reactor_lock);
			
			// check for spurious wake-ups
			if (m_num_queued != 0) {
				PION_ASSERT(m_database_ptr);
				PION_ASSERT(m_database_ptr->is_open());
				PION_ASSERT(insert_query_ptr);
				PION_ASSERT(begin_transaction_ptr);
				PION_ASSERT(commit_transaction_ptr);
				
				// begin a new transaction
				begin_transaction_ptr->run();
				begin_transaction_ptr->reset();

				// step through the event queue, inserting each event individually
				for (unsigned int n = 0; n < m_num_queued; ++n) {
					// bind the event to the insert query
					insert_query_ptr->bindEvent(m_field_map, *m_event_queue[n], false);
					// execute the query to insert the record
					insert_query_ptr->run();
					insert_query_ptr->reset();
				}
				
				// end & commit the transaction
				commit_transaction_ptr->run();
				commit_transaction_ptr->reset();

				// done flushing the queue! notify all pending inserters
				m_num_queued = 0;
				m_flushed_queue.notify_all();
			}
		}
	} catch (std::exception& e) {
		PION_LOG_FATAL(m_logger, e.what());
		m_is_running = false;
		m_flushed_queue.notify_all();
	}
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
