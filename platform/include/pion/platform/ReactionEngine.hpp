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

#include <string>
#include <libxml/tree.h>
#include <boost/bind.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/PluginConfig.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

// forward declarations
class VocabularyManager;
class CodecFactory;
class DatabaseManager;
	
///
/// ReactionEngine: manages all of the registered Reactors,
///                 and routes Events between them
///
class PION_PLATFORM_API ReactionEngine :
	public PluginConfig<Reactor>
{
public:

	/// exception thrown if we are unable to find a Reactor with the same identifier
	class ReactorNotFoundException : public PionException {
	public:
		ReactorNotFoundException(const std::string& reactor_id)
			: PionException("No reactors found for identifier: ", reactor_id) {}
	};
	
	/// exception thrown if the config file includes a connection with a missing From element
	class EmptyFromException : public PionException {
	public:
		EmptyFromException(const std::string& config_file)
			: PionException("Reactor configuration has a Connection with empty From element: ", config_file) {}
	};
	
	/// exception thrown if the config file includes a connection with a missing To element
	class EmptyToException : public PionException {
	public:
		EmptyToException(const std::string& config_file)
			: PionException("Reactor configuration has a Connection with empty To element: ", config_file) {}
	};
	
	/// exception thrown if there is an error adding a Connection element to the config file
	class AddConnectionConfigException : public PionException {
	public:
		AddConnectionConfigException(const std::string& connection)
			: PionException("Unable to add a Connection to the Reactor configuration file: ", connection) {}
	};
	
	/// exception thrown if there is an error removing a Connection from the config file
	class RemoveConnectionConfigException : public PionException {
	public:
		RemoveConnectionConfigException(const std::string& connection)
			: PionException("Unable to remove a Connection from the Reactor configuration file: ", connection) {}
	};
	
	
	/**
	 * constructs a new ReactionEngine object
	 *
	 * @param vocab_mgr the global manager of Vocabularies
	 * @param codec_factory the global factory that manages Codecs
	 * @param database_mgr the global manager of Databases
	 */
	ReactionEngine(const VocabularyManager& vocab_mgr,
				   const CodecFactory& codec_factory,
				   const DatabaseManager& database_mgr);
	
	/// virtual destructor
	virtual ~ReactionEngine() { stop(); }
	
	/// opens an existing configuration file and loads the plug-ins it contains
	virtual void openConfigFile(void);

	/**
	 * clears the statistic counters for a Reactor
	 *
	 * @param reactor_id the identifier for the Reactor to be cleared
	 */
	void clearReactorStats(const std::string& reactor_id);

	/// starts all Event processing
	void start(void);
	
	/// stops all Event processing
	void stop(void);
	
	/// clears statistic counters for all Reactors
	void clearStats(void);

	/// this updates all of the Codecs used by Reactors
	void updateCodecs(void);

	/// this updates all of the Databases used by Reactors
	void updateDatabases(void);
	
	/**
	 * temporarily connects an Event handler to the output of a Reactor (not saved to config)
	 *
	 * @param reactor_id unique identifier associated with the Reactor events come from
	 * @param connection_id unique identifier associated with the output connection
	 * @param connection_handler function handler to which Events will be sent
	 */
	void addTempConnection(const std::string& reactor_id, 
						   const std::string& connection_id,
						   Reactor::EventHandler connection_handler);
	
	/**
	 * removes a temporary connection between Reactors (does not change config)
	 *
	 * @param reactor_id unique identifier associated with the Reactor events come from
	 * @param connection_id unique identifier associated with the output connection
	 */
	void removeTempConnection(const std::string& reactor_id,
							  const std::string& connection_id);

	/**
	 * connects the output of one Reactor to the input of another Reactor
	 *
	 * @param from_id unique identifier associated with the Reactor events come from
	 * @param to_id unique identifier associated with the Reactor events go to
	 */
	void addConnection(const std::string& from_id, const std::string& to_id);
	
	/**
	 * removes an existing connection between Reactors
	 *
	 * @param from_id unique identifier associated with the Reactor events come from
	 * @param to_id unique identifier associated with the Reactor events go to
	 */
	void removeConnection(const std::string& from_id, const std::string& to_id);
	
	/**
	 * schedules an Event to be processed by a Reactor
	 *
	 * @param reactor_id unique identifier associated with the Reactor
	 * @param e pointer to the Event that will be processed
	 */
	inline void send(const std::string& reactor_id, EventPtr& e) {
		Reactor *reactor_ptr = m_plugins.get(reactor_id);
		if (reactor_ptr == NULL)
			throw ReactorNotFoundException(reactor_id);
		m_scheduler.getIOService().post(boost::bind<void>(boost::ref(*reactor_ptr), e));
	}
	
	/**
	 * returns the total number operations performed by all managed Reactors
	 *
	 * @return boost::uint64_t number of operations performed
	 */
	inline boost::uint64_t getTotalOperations(void) const {
		return m_plugins.getStatistic(boost::bind(&Reactor::getEventsIn, _1));
	}
	
	/**
	 * returns the total number of Events received by a Reactor
	 *
	 * @param reactor_id unique identifier associated with the Reactor
	 * @return boost::uint64_t number of Events received
	 */
	inline boost::uint64_t getEventsIn(const std::string& reactor_id) const {
		return m_plugins.getStatistic(reactor_id, boost::bind(&Reactor::getEventsIn, _1));
	}
	
	/**
	 * returns the total number of Events delivered by a Reactor
	 *
	 * @param reactor_id unique identifier associated with the Reactor
	 * @return boost::uint64_t number of Events delivered
	 */
	inline boost::uint64_t getEventsOut(const std::string& reactor_id) const {
		return m_plugins.getStatistic(reactor_id, boost::bind(&Reactor::getEventsOut, _1));
	}
	
	/**
	 * checks to see if a Reactor is recognized (reactor_id is valid)
	 *
	 * @param reactor_id unique identifier associated with the Reactor
	 */
	inline bool hasReactor(const std::string& reactor_id) const {
		return (m_plugins.get(reactor_id) != NULL);
	}

	/**
	 * schedules work to be performed by one of the pooled threads
	 *
	 * @param work_func work function to be executed
	 */
	template<typename WorkFunction>
	inline void post(WorkFunction work_func) { m_scheduler.getIOService().post(work_func); }
	
	/// returns the number of threads that are currently running
	inline boost::uint32_t getRunningThreads(void) const { return m_scheduler.getRunningThreads(); }
	
	/// returns the number of threads currently in use
	inline boost::uint32_t getNumThreads(void) const { return m_scheduler.getNumThreads(); }
	
	/// sets the number of threads used to route and process Events
	inline void setNumThreads(const boost::uint32_t n) { m_scheduler.setNumThreads(n); }
	
	
private:
	
	/**
	 * adds a new plug-in object (without locking or config file updates).  This
	 * function must be defined properly for any derived classes that wish to
	 * use openPluginConfig().
	 *
	 * @param plugin_id unique identifier associated with the plug-in
	 * @param plugin_name the name of the plug-in to load (searches
	 *                    plug-in directories and appends extensions)
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 */
	virtual void addPluginNoLock(const std::string& plugin_id,
								 const std::string& plugin_name,
								 const xmlNodePtr config_ptr)
	{
		Reactor *reactor_ptr = m_plugins.load(plugin_id, plugin_name);
		reactor_ptr->setId(plugin_id);
		reactor_ptr->setScheduler(m_scheduler);
		if (config_ptr != NULL)
			reactor_ptr->setConfig(m_vocabulary, config_ptr);
	}

	/**
	 * simple helper function to display a connection in a friendly way
	 *
	 * @param from_id unique identifier associated with the Reactor events come from
	 * @param to_id unique identifier associated with the Reactor events go to
	 */
	static inline std::string getConnectionAsText(const std::string& from_id,
												  const std::string& to_id)
	{
		std::string result(from_id);
		result += " -> ";
		result += to_id;
		return result;
	}
	
	/**
	 * connects the output of one Reactor to the input of another Reactor (without locking)
	 *
	 * @param from_id unique identifier associated with the Reactor events come from
	 * @param to_id unique identifier associated with the Reactor events go to
	 */
	void addConnectionNoLock(const std::string& from_id, const std::string& to_id);
	
	/**
	 * removes an existing connection between Reactors (without locking)
	 *
	 * @param reactor_id unique identifier associated with the Reactor events come from
	 * @param connection_id unique identifier associated with the output connection
	 */
	void removeConnectionNoLock(const std::string& reactor_id,
								const std::string& connection_id);

	/// stops all Event processing (without locking)
	void stopNoLock(void);
	
	
	/// default number of worker threads in the thread pool
	static const boost::uint32_t	DEFAULT_NUM_THREADS;
	
	/// default name of the reactor config file
	static const std::string		DEFAULT_CONFIG_FILE;

	/// name of the reactor element for Pion XML config files
	static const std::string		REACTOR_ELEMENT_NAME;
	
	/// name of the connection element for Pion XML config files
	static const std::string		CONNECTION_ELEMENT_NAME;
	
	/// name of the from connection element for Pion XML config files
	static const std::string		FROM_ELEMENT_NAME;
	
	/// name of the to connection element for Pion XML config files
	static const std::string		TO_ELEMENT_NAME;
	
	
	/// used to schedule the delivery of events to Reactors for processing
	PionScheduler					m_scheduler;

	/// references the global factory that manages Codecs
	const CodecFactory&				m_codec_factory;

	/// references the global manager of Databases
	const DatabaseManager&			m_database_mgr;
	
	/// true if the reaction engine is running
	bool							m_is_running;
};


}	// end namespace platform
}	// end namespace pion

#endif
