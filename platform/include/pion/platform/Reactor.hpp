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

#ifndef __PION_REACTOR_HEADER__
#define __PION_REACTOR_HEADER__

#include <string>
#include <list>
#include <libxml/tree.h>
#include <boost/function.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/platform/PlatformPlugin.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// Reactor: used to process Events, and to deliver the same or new Events to other Reactors
///
class Reactor
	: public PlatformPlugin
{
public:

	/// data type for a function that receives Events
	typedef boost::function1<void, EventPtr>	EventHandler;
	
	/// exception thrown if you try to add a duplicate connection
	class AlreadyConnectedException : public PionException {
	public:
		AlreadyConnectedException(const std::string& reactor_id)
			: PionException("Reactor is already connected: ", reactor_id) {}
	};
	
	/// exception thrown if you try to remove a connection that does not exist
	class ConnectionNotFoundException : public PionException {
	public:
		ConnectionNotFoundException(const std::string& reactor_id)
			: PionException("Tried removing an unknown connection: ", reactor_id) {}
	};
	
	
	/// constructs a new Reactor object
	Reactor(void)
		: m_scheduler_ptr(NULL), m_x_coordinate(0), m_y_coordinate(0),
		m_events_in(0), m_events_out(0)
	{}

	/// virtual destructor: this class is meant to be extended
	virtual ~Reactor() {}
	
	
	/// called by the ReactorEngine to start Event processing
	virtual void start(void) {}
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void) {}
	
	/// resets the Reactor to its initial state
	virtual void reset(void) { clearStats(); }
	
	/// clears statistic counters for the Reactor
	virtual void clearStats(void) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		m_events_in = m_events_out = 0;
	}
	
	/**
	 * sets configuration parameters for this Reactor
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Reactor
	 *                   configuration parameters
	 */
	virtual void setConfig(const Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this Reactor;
	 * it should be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);

	/**
	 * this updates the Codecs that are used by this Reactor; it should
	 * be called whenever any Codec's configuration is updated
	 *
	 * @param codec_factory the global factory that manages Codecs
	 */
	virtual void updateCodecs(const CodecFactory& codec_factory) {}
	
	/**
	 * this updates the Databases that are used by this Reactor; it should
	 * be called whenever any Database's configuration is updated
	 *
	 * @param database_mgr the global manager of Databases
	 */
	virtual void updateDatabases(const DatabaseManager& database_mgr) {}
	
	/**
	 * processes a new Event.  All derived Reactors should:
	 *
	 * a) call incrementEventsIn() or safeIncrementEventsIn() for every Event received
	 * b) call deliverEvent() or safeDeliverEvent() to send Events to output connections
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void operator()(const EventPtr& e) = 0;
	
	/**
	 * connects a handler to the output of this Reactor
	 *
	 * @param connection_id unique identifier associated with the output connection
	 * @param connection_handler function handler to which Events will be sent
	 */
	void addConnection(const std::string& connection_id, EventHandler connection_handler);
	
	/**
	 * removes an existing output connection
	 *
	 * @param connection_id unique identifier associated with the output connection
	 */
	void removeConnection(const std::string& connection_id);

	/// sets the scheduler that will be used to deliver Events to other Reactors
	inline void setScheduler(PionScheduler& scheduler) { m_scheduler_ptr = & scheduler; }
	
	/// returns the total number of Events received by this Reactor
	inline boost::uint64_t getEventsIn(void) const { return m_events_in; }
		
	/// returns the total number of Events delivered by this Reactor
	inline boost::uint64_t getEventsOut(void) const { return m_events_out; }

		
protected:

	/**
	 * increments the incoming Events counter.  This is not thread-safe and
	 * should be called only when the Reactor's mutex is locked.
	 */
	inline void incrementEventsIn(void) { ++m_events_in; }
	
	/**
	 * delivers an Event to the output connections.  This is not thread-safe
	 * and should be called only when the Reactor's mutex is locked.
	 *
	 * @param e pointer to the Event to deliver
	 */
	inline void deliverEvent(const EventPtr& e) {
		++m_events_out;
		if (! m_connections.empty()) {
			OutputConnections::iterator i = m_connections.begin();
			// iterate through each Reactor after the first one and send the Event
			// using the scheduler.  This way, the entire thread pool will be used
			// for processing pipelines
			while (++i != m_connections.end()) {
				if (m_scheduler_ptr != NULL)
					m_scheduler_ptr->getIOService().post(boost::bind(i->second, e));
				else
					i->second(e);
			}
			// send to the first Reactor using the same thread
			// this helps to reduce context switching by ensuring
			// that the longer processing chains remain unbroken
			m_connections.begin()->second(e);
		}
	}
	
	/// safely increments the incoming Events counter (locks the Reactor's mutex)
	inline void safeIncrementEventsIn(void) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		incrementEventsIn();
	}
	
	/// safely delivers an Event to the output connections (locks the Reactor's mutex)
	inline void safeDeliverEvent(const EventPtr& e) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		deliverEvent(e);
	}

	
	/// used to provide thread safety for the Reactor's data structures
	boost::mutex					m_mutex;
	
	
private:

	/// data type for a collection of connections to which Events may be sent
	typedef std::map<std::string,EventHandler>	OutputConnections;
	
	
	/// name of the workspace element for Pion XML config files
	static const std::string		WORKSPACE_ELEMENT_NAME;
	
	/// name of the "x coordinate" element for Pion XML config files
	static const std::string		X_COORDINATE_ELEMENT_NAME;
	
	/// name of the "y coordinate" element for Pion XML config files
	static const std::string		Y_COORDINATE_ELEMENT_NAME;

	
	/// used to schedule the delivery of events to Reactors for processing
	PionScheduler *					m_scheduler_ptr;
	
	/// a collection of connections to which Events may be sent
	OutputConnections				m_connections;
	
	/// workspace that this Reactor is displayed on (for UI only)
	std::string						m_workspace;

	/// X coordinate where the Reactor is positioned (for UI only)
	unsigned int					m_x_coordinate;

	/// Y coordinate where the Reactor is positioned (for UI only)
	unsigned int					m_y_coordinate;

	/// the total number of Events received by this Reactor
	boost::uint64_t					m_events_in;

	/// the total number of Events delivered by this Reactor
	boost::uint64_t					m_events_out;
};


//
// The following symbols must be defined for any reactor that you would
// like to be able to load dynamically using the ReactionEngine::load()
// function.  These are not required for any reactors that you only want to link
// directly into your programs.
//
// Make sure that you replace "REACTOR" with the name of your derived class.
// This name must also match the name of the object file (excluding the
// extension).  These symbols must be linked into your reactor's object file,
// not included in any headers that it may use (declarations are OK in headers
// but not the definitions).
//
// The "pion_create" function is used to create new instances of your reactor.
// The "pion_destroy" function is used to destroy instances of your reactor.
//
// extern "C" Reactor *pion_create_REACTOR(void) {
//		return new REACTOR;
// }
//
// extern "C" void pion_destroy_REACTOR(REACTOR *reactor_ptr) {
//		delete reactor_ptr;
// }
//


}	// end namespace platform
}	// end namespace pion

#endif
