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
	
	
	/// virtual destructor
	virtual ~ReactionEngine() {}
	
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

	/**
	 * sets configuration parameters for a managed Reactor
	 *
	 * @param reactor_id unique identifier associated with the Reactor
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                           configuration parameters
	 */
	void setReactorConfig(const std::string& reactor_id,
						  const xmlNodePtr config_ptr);
	
	/**
	 * adds a new Reactor object
	 *
	 * @param plugin_type the type of plug-in to load (searches plug-in
	 *                    directories and appends extensions)
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 *
	 * @return std::string string containing the Reactor's auto-generated identifier
	 */
	std::string addReactor(const std::string& plugin_type,
						   const xmlNodePtr config_ptr = NULL);
	
	/**
	 * removes a managed Reactor
	 *
	 * @param reactor_id unique identifier associated with the Reactor
	 */
	void removeReactor(const std::string& reactor_id);
	
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
	
	
private:
	
	/// stops all Event processing (without locking)
	void stopNoLock(void);

	/**
	 * schedules an Event to be processed by a Reactor
	 *
	 * @param reactor_ptr pointer to the Reactor that will process the Event
	 * @param e pointer to the Event that will be processed
	 */
	inline void schedule(Reactor* reactor_ptr, EventPtr& e) {
		m_scheduler.getIOService().post(boost::bind(&Reactor::send, reactor_ptr,
													boost::ref(e)));
	}
	
	
	/// default name of the reactor config file
	static const std::string		DEFAULT_CONFIG_FILE;

	/// name of the reactor element for Pion XML config files
	static const std::string		REACTOR_ELEMENT_NAME;
	
	
	/// used to schedule the delivery of events to Reactors for processing
	PionScheduler &					m_scheduler;

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
