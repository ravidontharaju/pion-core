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

#include <pion/platform/ConfigManager.hpp>
#include "DatabaseOutputReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of DatabaseOutputReactor

const std::string			DatabaseOutputReactor::DATABASE_ELEMENT_NAME = "Database";
const std::string			DatabaseOutputReactor::TABLE_ELEMENT_NAME = "Table";
const std::string			DatabaseOutputReactor::FIELD_ELEMENT_NAME = "Field";
const std::string			DatabaseOutputReactor::EVENTS_QUEUED_ELEMENT_NAME = "EventsQueued";
const std::string			DatabaseOutputReactor::KEY_CACHE_SIZE_ELEMENT_NAME = "KeyCacheSize";


// DatabaseOutputReactor member functions

void DatabaseOutputReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	ConfigWriteLock cfg_lock(*this);
	try {
		// stop for config changes, but cache running status
		// so that it can be restarted when finished
		bool was_running = m_is_running;
		if (m_is_running)
		  stop();

		// This will destruct earlier, if it existed
		m_inserter.reset(new pion::platform::DatabaseInserter());
	
		// update reactor base class config
		Reactor::setConfig(v, config_ptr);
	
		// initialize inserter parameters
		m_inserter->setLogger(m_logger);
		m_inserter->setDatabaseManager(getDatabaseManager());
		
		// update inserter config
		m_inserter->setConfig(v, config_ptr);
		
		// restart inserter if it was running
		if (was_running)
			start();
	} catch (...) {
		m_is_running = false;
		throw;
	}
}

void DatabaseOutputReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	ConfigWriteLock cfg_lock(*this);
	Reactor::updateVocabulary(v);
	if (m_inserter)
		m_inserter->updateVocabulary(v);
}

void DatabaseOutputReactor::updateDatabases(void)
{
	ConfigWriteLock cfg_lock(*this);
	if (m_inserter)
		m_inserter->updateDatabases();
}

void DatabaseOutputReactor::query(std::ostream& out, const QueryBranches& branches,
	const QueryParams& qp)
{
	ConfigManager::writeBeginPionStatsXML(out);
	writeBeginReactorXML(out);
	writeStatsOnlyXML(out);

	// write number of events queued for insertion
	out << '<' << EVENTS_QUEUED_ELEMENT_NAME << '>' << m_inserter->getEventsQueued()
	    << "</" << EVENTS_QUEUED_ELEMENT_NAME << '>' << std::endl;

	// write size of the key cache
	out << '<' << KEY_CACHE_SIZE_ELEMENT_NAME << '>' << m_inserter->getKeyCacheSize()
	    << "</" << KEY_CACHE_SIZE_ELEMENT_NAME << '>' << std::endl;

	// In addition; if full status is requested, get Database/Table/Fields
	if (branches.size() > 2 && branches[2] == "full") {
		out << '<' << DATABASE_ELEMENT_NAME << '>' << m_inserter->getDatabaseId() << "</" << DATABASE_ELEMENT_NAME << '>' << std::endl
			<< '<' << TABLE_ELEMENT_NAME << '>' << m_inserter->getTableName() << "</" << TABLE_ELEMENT_NAME << '>' << std::endl;
		Query::FieldMap field_map(m_inserter->getFieldMap());
		Query::IndexMap index_map(m_inserter->getIndexMap());
		for (unsigned int i = 0; i < field_map.size(); i++) {
			// <Field id="0" col="dbcol">vocab:uri</Field>
			// <Field id="0" col="dbcol" index="true">vocab:uri</Field>
			const std::string idx_str = (index_map.size() >= i && index_map[i] != "false") ? "true" : "false";
			out << '<' << FIELD_ELEMENT_NAME << " id=\"" << i << "\" col=\""
				<< field_map[i].first << "\" index=\"" << idx_str << "\">" << field_map[i].second.term_id
				<< "</" << FIELD_ELEMENT_NAME << '>' << std::endl;
		}
	}

	writeEndReactorXML(out);
	ConfigManager::writeEndPionStatsXML(out);
}

void DatabaseOutputReactor::start(void)
{
	ConfigWriteLock cfg_lock(*this);
	if (! m_is_running) {
		m_is_running = true;
		if (m_inserter) {
			try {
				m_inserter->start();
			} catch (...) {
				// failed to start inserter -> update running state to false
				m_is_running = false;
				throw;
			}
		}
	}
}

void DatabaseOutputReactor::stop(void)
{
	ConfigWriteLock cfg_lock(*this);
	if (m_is_running) {
		m_is_running = false;
		if (m_inserter)
			m_inserter->stop();
	}
}

void DatabaseOutputReactor::process(const EventPtr& e)
{
	// add the event to the insert queue
	m_inserter->insert(e);

	// deliver the event to other Reactors (if any are connected)
	deliverEvent(e);
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
