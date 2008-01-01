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

#ifndef __PION_REACTIONENGINE_HEADER__
#define __PION_REACTIONENGINE_HEADER__

#include <map>
#include <list>
#include <string>
#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/noncopyable.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionLogger.hpp>
#include <pion/PionException.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/PluginManager.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// ReactionEngine: manages all of the registered Reactors,
///                 and routes Events between them
///
class ReactionEngine :
	public ConfigManager,
	private boost::noncopyable
{
public:

	/// exception thrown if we are unable to find a Reactor with the same identifier
	class ReactorNotFoundException : public PionException {
	public:
		ReactorNotFoundException(const std::string& reactor_id)
			: PionException("No reactors found for identifier: ", reactor_id) {}
	};

		
	/**
	 * constructs a new ReactionEngine object
	 *
	 * @param v the Vocabulary that this ReactionEngine will use to describe Terms
	 */
	ReactionEngine(const Vocabulary& v)
		: ConfigManager(DEFAULT_CONFIG_FILE),
		m_logger(PION_GET_LOGGER("pion.platform.ReactionEngine")), m_vocabulary(v),
		m_scheduler(PionScheduler::getInstance()), m_is_running(false)
	{}

	/// virtual destructor
	virtual ~ReactionEngine() {}
	
	/// starts all Event processing
	inline void start(void) {
		boost::mutex::scoped_lock engine_lock(m_mutex);
		if (! m_is_running) {
			PION_LOG_INFO(m_logger, "Starting all reactors");
			m_reactors.run(boost::bind(&Reactor::start, _1));
			m_is_running = true;
		}
	}
		
	/// stops all Event processing
	inline void stop(void) {
		boost::mutex::scoped_lock engine_lock(m_mutex);
		stopNoLock();
	}
	
	/// resets all Reactors to their initial state
	inline void reset(void) {
		boost::mutex::scoped_lock engine_lock(m_mutex);
		stopNoLock();
		m_reactors.run(boost::bind(&Reactor::reset, _1));
		PION_LOG_DEBUG(m_logger, "Reset all reactors");
	}

	/// stops all Event processing and removes all registered Reactors
	inline void clear(void) {
		boost::mutex::scoped_lock engine_lock(m_mutex);
		stopNoLock();
		m_reactors.clear();
		PION_LOG_DEBUG(m_logger, "Removed all reactors");
	}
		
	/// clears statistic counters for all Reactors
	inline void clearStats(void) {
		m_reactors.run(boost::bind(&Reactor::clearStats, _1));
		PION_LOG_DEBUG(m_logger, "Cleared all reactor statistics");
	}

	/**
	 * registers a new Reactor for Event processing
	 *
	 * @param reactor_ptr pointer to the Reactor object
	 */
	inline void addReactor(Reactor *reactor_ptr) {
		m_reactors.add(reactor_ptr->getId(), reactor_ptr);
		PION_LOG_DEBUG(m_logger, "Added static reactor: " << reactor_ptr->getId());
	}

	/**
	 * loads a new Reactor plug-in
	 *
	 * @param reactor_id the identifier for the Reactor to be loaded
	 * @param reactor_type the type of the Reactor class to load (searches 
	 *                     plug-in directories and appends extensions)
	 */
	inline void loadReactor(const std::string& reactor_id,
							const std::string& reactor_type)
	{
		m_reactors.load(reactor_id, reactor_type);
		PION_LOG_DEBUG(m_logger, "Loaded reactor (" << reactor_type << "): " << reactor_id);
	}

	/**
	 * removes a registered Reactor
	 *
	 * @param reactor_id the identifier for the Reactor to be removed
	 */
	inline void removeReactor(const std::string& reactor_id) {
		// convert "plugin not found" exceptions into "reactor not found"
		try { m_reactors.remove(reactor_id); }
		catch (PluginManager<Reactor>::PluginNotFoundException& /* e */) {
			throw ReactorNotFoundException(reactor_id);
		}
		PION_LOG_DEBUG(m_logger, "Removed reactor: " << reactor_id);
	}

	/**
	 * sets a configuration option for a registered Reactor
	 *
	 * @param reactor_id the identifier for the Reactor to be configured
	 * @param option_name the name of the configuration option
	 * @param option_value the value to set the option to
	 */
	inline void setReactorOption(const std::string& reactor_id,
								 const std::string& option_name,
								 const std::string& option_value)
	{
		// convert "plugin not found" exceptions into "reactor not found"
		try {
			m_reactors.run(reactor_id, boost::bind(&Reactor::setOption, _1, option_name, option_value));
		} catch (PluginManager<Reactor>::PluginNotFoundException& /* e */) {
			throw ReactorNotFoundException(reactor_id);
		}
		PION_LOG_DEBUG(m_logger, "Set reactor option (" << reactor_id << "): "
					  << option_name << '=' << option_value);
	}
	
	/**
	 * resets a Reactor to its initial state
	 *
	 * @param reactor_id the identifier for the Reactor to be reset
	 */
	inline void resetReactor(const std::string& reactor_id) {
		// convert "plugin not found" exceptions into "reactor not found"
		try {
			m_reactors.run(reactor_id, boost::bind(&Reactor::reset, _1));
		} catch (PluginManager<Reactor>::PluginNotFoundException& /* e */) {
			throw ReactorNotFoundException(reactor_id);
		}
		PION_LOG_DEBUG(m_logger, "Reset reactor: " << reactor_id);
	}

	/**
	 * clears the statistic counters for a Reactor
	 *
	 * @param reactor_id the identifier for the Reactor to be cleared
	 */
	inline void clearReactorStats(const std::string& reactor_id) {
		// convert "plugin not found" exceptions into "reactor not found"
		try {
			m_reactors.run(reactor_id, boost::bind(&Reactor::clearStats, _1));
		} catch (PluginManager<Reactor>::PluginNotFoundException& /* e */) {
			throw ReactorNotFoundException(reactor_id);
		}
		PION_LOG_DEBUG(m_logger, "Cleared reactor statistics: " << reactor_id);
	}

	/**
	 * schedules an Event to be processed by a Reactor
	 *
	 * @param reactor_ptr pointer to the Reactor that will process the Event
	 * @param e pointer to the Event that will be processed
	 */
	inline void schedule(Reactor* reactor_ptr, EventPtr& e) {
		m_scheduler.getIOService().post(boost::bind(&Reactor::send, reactor_ptr, e));
	}

	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }
	
	
private:
	
	/// stops all Event processing without locking the class's mutex
	inline void stopNoLock(void) {
		if (m_is_running) {
			PION_LOG_INFO(m_logger, "Stopping all reactors");
			m_reactors.run(boost::bind(&Reactor::stop, _1));
			m_is_running = false;
		}
	}
	
	
	/// default name of the reactor config file
	static const std::string		DEFAULT_CONFIG_FILE;

	
	/// primary logging interface used by this class
	PionLogger						m_logger;

	/// references the Vocabulary used by this ReactionEngine to describe Terms
	const Vocabulary&				m_vocabulary;

	/// used to schedule the delivery of events to Reactors for processing
	PionScheduler &					m_scheduler;
	
	/// used to hold all of the registered Reactor objects
	PluginManager<Reactor>			m_reactors;

	/// true if the reaction engine is running
	bool							m_is_running;
	
	/// mutex to make class thread-safe
	mutable boost::mutex			m_mutex;
};


}	// end namespace platform
}	// end namespace pion

#endif
