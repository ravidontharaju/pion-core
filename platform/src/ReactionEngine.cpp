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

#include <boost/asio.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/platform/ReactionEngine.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of ReactionEngine
const std::string		ReactionEngine::DEFAULT_CONFIG_FILE = "reactors.xml";
const std::string		ReactionEngine::REACTOR_ELEMENT_NAME = "reactor";
	

// ReactionEngine member functions
	
ReactionEngine::ReactionEngine(const VocabularyManager& vocab_mgr,
							   const CodecFactory& codec_factory,
							   const DatabaseManager& database_mgr)
	: PluginConfig<Reactor>(vocab_mgr, DEFAULT_CONFIG_FILE, REACTOR_ELEMENT_NAME),
	m_scheduler(PionScheduler::getInstance()),
	m_codec_factory(codec_factory),
	m_database_mgr(database_mgr),
	m_is_running(false)
{
	setLogger(PION_GET_LOGGER("pion.platform.ReactionEngine"));
	m_codec_factory.registerForUpdates(boost::bind(&ReactionEngine::updateCodecs, this));
	m_database_mgr.registerForUpdates(boost::bind(&ReactionEngine::updateDatabases, this));
}

void ReactionEngine::clearReactorStats(const std::string& reactor_id)
{
	// convert "plugin not found" exceptions into "reactor not found"
	try {
		m_plugins.run(reactor_id, boost::bind(&Reactor::clearStats, _1));
	} catch (PluginManager<Reactor>::PluginNotFoundException& /* e */) {
		throw ReactorNotFoundException(reactor_id);
	}
	PION_LOG_DEBUG(m_logger, "Cleared reactor statistics: " << reactor_id);
}

void ReactionEngine::start(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	if (! m_is_running) {
		PION_LOG_INFO(m_logger, "Starting all reactors");
		m_plugins.run(boost::bind(&Reactor::start, _1));
		m_is_running = true;
	}
}

void ReactionEngine::stop(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	stopNoLock();
}

void ReactionEngine::clearStats(void)
{
	m_plugins.run(boost::bind(&Reactor::clearStats, _1));
	PION_LOG_DEBUG(m_logger, "Cleared all reactor statistics");
}
	
void ReactionEngine::updateCodecs(void)
{
	m_plugins.run(boost::bind(&Reactor::updateCodecs, _1,
							  boost::cref(m_codec_factory)));
}

void ReactionEngine::updateDatabases(void)
{
	m_plugins.run(boost::bind(&Reactor::updateDatabases, _1,
							  boost::cref(m_database_mgr)));
}

void ReactionEngine::stopNoLock(void)
{
	if (m_is_running) {
		PION_LOG_INFO(m_logger, "Stopping all reactors");
		m_plugins.run(boost::bind(&Reactor::stop, _1));
		m_is_running = false;
	}
}

	
}	// end namespace platform
}	// end namespace pion
