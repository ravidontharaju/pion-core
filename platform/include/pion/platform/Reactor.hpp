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
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionCounter.hpp>
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
	Reactor(void) : m_x_coordinate(0), m_y_coordinate(0) {}

	/// virtual destructor: this class is meant to be extended
	virtual ~Reactor() {}
	
	
	/// called by the ReactorEngine to start Event processing
	virtual void start(void) {}
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void) {}
	
	/// resets the Reactor to its initial state
	virtual void reset(void) { clearStats(); }
	
	/// clears statistic counters for the Reactor
	virtual void clearStats(void) { m_events_in = m_events_out = 0; }
	
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
	 * connects the output of this Reactor to the input of another Reactor
	 *
	 * @param output_reactor the Reactor that events will be sent to
	 */
	void addConnection(Reactor &output_reactor);
	
	/**
	 * removes an existing connection to another Reactor
	 *
	 * @param reactor_id unique identifier associated with the Reactor to remove
	 */
	void removeConnection(const std::string& reactor_id);

	/**
	 * send a new Event to this reactor
	 *
	 * @param e pointer to the new Event
	 */
	inline void send(const EventPtr& e) { ++m_events_in; process(e); }

	/// returns the total number of Events received by this Reactor
	inline boost::uint64_t getEventsIn(void) const { return m_events_in.getValue(); }
		
	/// returns the total number of Events delivered by this Reactor
	inline boost::uint64_t getEventsOut(void) const { return m_events_out.getValue(); }

		
protected:

	/**
	 * processes an Event.  All derived classes should re-define this function, and should
	 * call deliver() for any new Events and Events that are not filtered.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void process(const EventPtr& e) { deliver(e); }

	/**
	 * delivers an Event to downstream Reactors
	 *
	 * @param e pointer to the Event to deliver
	 */
	inline void deliver(const EventPtr& e) {
		++m_events_out;
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		for (ReactorList::iterator i = m_connections.begin(); i != m_connections.end(); ++i) {
			(*i)->send(e);
		}
	}

	
	/// used to provide thread safety for the Reactor's data structures
	boost::mutex					m_mutex;
	
	
private:

	/// a list of Reactors to which Events may be delivered
	typedef std::list<Reactor*>		ReactorList;
	
	
	/// name of the workspace element for Pion XML config files
	static const std::string		WORKSPACE_ELEMENT_NAME;
	
	/// name of the "x coordinate" element for Pion XML config files
	static const std::string		X_COORDINATE_ELEMENT_NAME;
	
	/// name of the "y coordinate" element for Pion XML config files
	static const std::string		Y_COORDINATE_ELEMENT_NAME;

	
	/// workspace that this Reactor is displayed on (for UI only)
	std::string						m_workspace;

	/// X coordinate where the Reactor is positioned (for UI only)
	unsigned int					m_x_coordinate;

	/// Y coordinate where the Reactor is positioned (for UI only)
	unsigned int					m_y_coordinate;

	/// a list of other Reactors to which this one delivers Events
	ReactorList						m_connections;

	/// the total number of Events received by this Reactor
	PionCounter						m_events_in;

	/// the total number of Events delivered by this Reactor
	PionCounter						m_events_out;
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
