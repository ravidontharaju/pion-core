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
#include <boost/bind.hpp>
#include <boost/function.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/PlatformPlugin.hpp>
#include <pion/platform/ReactionScheduler.hpp>

typedef std::vector<std::string>        PathBranches;

namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

///
/// Reactor: used to process Events, and to deliver the same or new Events to other Reactors
///
class PION_PLATFORM_API Reactor
	: public PlatformPlugin
{
public:

    /// data type for a collection of query path branches
    typedef std::vector<std::string>    QueryBranches;

    /// data type for a dictionary of strings (used for HTTP headers)
    typedef PION_HASH_MULTIMAP<std::string, std::string, PION_HASH_STRING > QueryParams;

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
	
	/// data type used to describe the type of Reactor
	enum ReactorType {
		TYPE_COLLECTION, TYPE_PROCESSING, TYPE_STORAGE
	};
	
	
	/// constructs a new Reactor object
	Reactor(const ReactorType type)
		: m_is_running(false), m_type(type), m_scheduler_ptr(NULL), 
		m_x_coordinate(0), m_y_coordinate(0), m_events_in(0), m_events_out(0)
	{}

	/// virtual destructor: this class is meant to be extended
	virtual ~Reactor() {}
	
	
	/// called by the ReactorEngine to start Event processing
	virtual void start(void) { m_is_running = true; }
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void) { m_is_running = false; }
	
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
	 */
	virtual void updateCodecs(void) {}
	
	/**
	 * this updates the Databases that are used by this Reactor; it should
	 * be called whenever any Database's configuration is updated
	 */
	virtual void updateDatabases(void) {}
	
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
	 *
	 * handle a query (from QueryService)
	 *
	 * @param q query string
	 *
	 * @return std::string of XML response
	 */
	virtual std::string query(const PathBranches& branches, const QueryParams& q)
	{
		return "";
	}
	
	/**
	 * connects another Reactor to the output of this Reactor
	 *
	 * @param connection_id unique identifier associated with the output connection
	 * @param output_reactor the Reactor to which output Events will be sent
	 */
	void addConnection(Reactor& output_reactor);
	
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
	inline void setScheduler(ReactionScheduler& scheduler) { m_scheduler_ptr = & scheduler; }

	/// sets the value of the "multithreaded branches" setting
	inline void setMultithreadBranches(bool b) { m_multithread_branches = b; }

	/// returns the total number of Events received by this Reactor
	inline boost::uint64_t getEventsIn(void) const { return m_events_in; }
		
	/// returns the total number of Events delivered by this Reactor
	inline boost::uint64_t getEventsOut(void) const { return m_events_out; }

	/// returns true if the Reactor is running
	inline bool isRunning(void) const { return m_is_running; }
	
	/// returns the type of Reactor (collection, processing, storage)
	inline ReactorType getType(void) const { return m_type; }
	
		
protected:

	/// returns the task scheduler used by the ReactionEngine
	inline ReactionScheduler& getScheduler(void) {
		PION_ASSERT(m_scheduler_ptr != NULL);
		return *m_scheduler_ptr;
	}
		
	/**
	 * increments the incoming Events counter.  This is not thread-safe and
	 * should be called only when the Reactor's mutex is locked.
	 */
	inline void incrementEventsIn(void) { ++m_events_in; }
	
	/// safely increments the incoming Events counter (locks the Reactor's mutex)
	inline void safeIncrementEventsIn(void) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		incrementEventsIn();
	}
	
	/**
	 * delivers an Event to the output connections.  This is not thread-safe
	 * and should be called only when the Reactor's mutex is locked.
	 *
	 * @param e pointer to the Event to deliver
	 * @param return_immediately if true, all delivery will use other threads
	 */
	inline void deliverEvent(const EventPtr& e, bool return_immediately = false) {
		++m_events_out;
		if (! m_connections.empty()) {
			if (m_multithread_branches) {
				// iterate through each Reactor after the first one and send the Event
				// using the scheduler.  This way, the entire thread pool will be used
				// for processing pipelines
				ConnectionMap::iterator i = m_connections.begin();
				
				// skip Reactors that are not running to avoid queueing work
				// to another thread when it is unnecessary.  Otherwise, if the
				// first Reactor is not running, all work will get queued rather
				// than the "longest path" being executed by the current thread
				while (i != m_connections.end() && ! i->second.isRunning())
					++i;

				if (i != m_connections.end()) {
					// the first running reactor will be handled by the current thread
					ConnectionMap::iterator cur_thread_reactor = i;
					
					// queue all other branches to be handled by other threads
					while (++i != m_connections.end()) {
						if (i->second.isRunning())
							i->second.post(getScheduler(), e);
					}
				
					// send to the first Reactor using the same thread
					// this helps to reduce context switching by ensuring
					// that the longer processing chains remain unbroken
					if (return_immediately)
						cur_thread_reactor->second.post(getScheduler(), e);
					else
						cur_thread_reactor->second(e);
				}
			} else {
				// simple scheduling just iterates through connections and use the
				// same thread to carry the event through all the reaction chains
				for (ConnectionMap::iterator i = m_connections.begin();
					 i != m_connections.end(); ++i)
				{
					if (i->second.isRunning()) {
						if (return_immediately)
							i->second.post(getScheduler(), e);
						else
							i->second(e);
					}
				}
			}
		}
	}
	
	/**
	 * safely delivers an Event to the output connections (locks the Reactor's mutex)
	 *
	 * @param e pointer to the Event to deliver
	 * @param return_immediately if true, all delivery will use other threads
	 */
	inline void safeDeliverEvent(const EventPtr& e, bool return_immediately = false) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		deliverEvent(e, return_immediately);
	}

	/**
	 * delivers a container of Events to the output connections.  This is not 
	 * thread-safe and should be called only when the Reactor's mutex is locked.
	 *
	 * @param events a container of Events to deliver
	 * @param return_immediately if true, all delivery will use other threads
	 */
	inline void deliverEvents(const EventContainer& events, bool return_immediately = false)
	{
		for (EventContainer::const_iterator event_it = events.begin();
				event_it != events.end(); ++event_it)
		{
			deliverEvent(*event_it, return_immediately);
		}
	}

	/**
	 * safely delivers a container of Events to the output connections
	 * (locks the Reactor's mutex)
	 *
	 * @param events a container of Events to deliver
	 * @param return_immediately if true, all delivery will use other threads
	 */
	inline void safeDeliverEvents(const EventContainer& events, bool return_immediately = false)
	{
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		deliverEvents(events, return_immediately);
	}

	
	/// used to provide thread safety for the Reactor's data structures
	boost::mutex					m_mutex;
	
	/// will be true if the Reactor is "running"
	bool							m_is_running;

	
private:

	/// data type used to represent Reactor output connections
	class OutputConnection {
	public:
		/// default destructor
		~OutputConnection() {}
		
		/// constructs a new OutputConnection to a Reactor
		explicit OutputConnection(Reactor* reactor)
			: m_reactor_ptr(reactor), m_event_handler(boost::ref(*reactor))
		{}

		/// constructs a new OutputConnection to an EventHandler
		explicit OutputConnection(EventHandler handler)
			: m_reactor_ptr(NULL), m_event_handler(handler)
		{}

		/// standard copy constructor
		OutputConnection(const OutputConnection& c)
			: m_reactor_ptr(c.m_reactor_ptr), m_event_handler(c.m_event_handler)
		{}

		/// returns true if the output connection is running
		inline bool isRunning(void) {
			return (m_reactor_ptr == NULL || m_reactor_ptr->isRunning());
		}
		
		/// sends an Event over the OutputConnection
		inline void operator()(const EventPtr& event_ptr) {
			m_event_handler(event_ptr);
		}
		
		/// schedules an Event to be sent over the OutputConnection
		inline void post(ReactionScheduler& scheduler, const EventPtr& event_ptr) {
			scheduler.post(boost::bind<void>(m_event_handler, event_ptr));
		}

	private:
		
		/// points to a Reactor where events should be sent (if not NULL)
		Reactor *			m_reactor_ptr;
		
		/// function object that sends Events over the OutputConnection
		EventHandler		m_event_handler;
	};
	
	/// data type for a collection of connections to which Events may be sent
	typedef std::map<std::string, OutputConnection>	ConnectionMap;
	
	
	/// name of the workspace element for Pion XML config files
	static const std::string		WORKSPACE_ELEMENT_NAME;
	
	/// name of the "x coordinate" element for Pion XML config files
	static const std::string		X_COORDINATE_ELEMENT_NAME;
	
	/// name of the "y coordinate" element for Pion XML config files
	static const std::string		Y_COORDINATE_ELEMENT_NAME;

	
	/// the type of Reactor (collection, processing or storage)
	const ReactorType				m_type;
	
	/// used to schedule the delivery of events to Reactors for processing
	ReactionScheduler *				m_scheduler_ptr;
	
	/// a collection of connections to which Events may be sent
	ConnectionMap					m_connections;
	
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
	
	/// if true, use multiple threads for Event delivery when a Reactor has
	/// more than one output connection (CACHED VALUE FROM REACTIONENGINE)
	bool							m_multithread_branches;
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
