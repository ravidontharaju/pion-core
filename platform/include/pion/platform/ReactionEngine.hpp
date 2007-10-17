// ------------------------------------------------------------------
// pion-platform: a collection of libraries used by the Pion Platform
// ------------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// pion-platform is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pion-platform is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pion-platform.  If not, see <http://www.gnu.org/licenses/>.
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
#include <boost/thread/once.hpp>
#include <boost/thread/thread.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/reactor/Event.hpp>
#include <pion/reactor/Reactor.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace reactor (Pion Platform Library)


///
/// ReactionEngine: singleton used to manage all of the registered Reactors,
///                 and to route Events between them
///
class ReactionEngine :
	private boost::noncopyable
{
public:

	/// exception thrown if we are unable to find a Reactor with the same identifier
	class UnknownReactorException : public PionException {
	public:
		UnknownReactorException(const std::string& reactor_id)
			: PionException("Unable to find Reactor identified by: ", reactor_id) {}
	};

	
	/// public destructor: not virtual, should not be extended
	~ReactionEngine() {}
	
	/**
	 * return an instance of the ReactionEngine singleton
	 * 
     * @return ReactionEngine& instance of ReactionEngine
	 */
	inline static ReactionEngine& getInstance(void) {
		boost::call_once(ReactionEngine::createInstance, m_instance_flag);
		return *m_instance_ptr;
	}
	
	/// starts all Event processing
	void start(void);
	
	/// stops all Event processing
	void stop(void);
	
	/// resets all Reactors to their initial state
	void reset(void);

	/// stops all Event processing and removes all registered Reactors
	void clear(void);

	/// clears statistic counters for all Reactors
	void clearStats(void);

	/**
	 * registers a new Reactor for Event processing
	 *
	 * @param r pointer to the Reactor to register
	 */
	void add(pion::reactor::ReactorPtr& r);

	/**
	 * removes a registered Reactor
	 *
	 * @param reactor_id the identifier for the Reactor to be removed
	 */
	void remove(const std::string& reactor_id);

	/**
	 * resets a Reactor to its initial state
	 *
	 * @param reactor_id the identifier for the Reactor to be reset
	 */
	void reset(const std::string& reactor_id);

	/**
	 * clears the statistic counters for a Reactor
	 *
	 * @param reactor_id the identifier for the Reactor to be cleared
	 */
	void clearStats(const std::string& reactor_id);

	/**
	 * sets configuration settings for a Reactor
	 *
	 * @param reactor_id the identifier for the Reactor to be configured
	 * @param config contains configuration settings for the Reactor.  This may contain
	 *               settings for just one or for many different  parameters.
	 */
	void configure(const std::string& reactor_id,
				   const pion::reactor::EventPtr& config);

	/**
	 * schedules an Event to be processed by a Reactor
	 *
	 * @param r pointer to the Reactor that will process the Event
	 * @param e pointer to the Event that will be processed
	 */
	inline void schedule(pion::reactor::ReactorPtr& r,
						 pion::reactor::EventPtr& e)
	{
		m_io_service.post(boost::bind(&pion::reactor::Reactor::send, r, e));
	}


private:

	/// private constructor for singleton pattern
	ReactionEngine(void) : m_num_threads(0), m_is_running(false) {}
	
	/// creates the singleton instance, protected by boost::call_once
	static void createInstance(void);
	
	/// stops all Event processing without locking the class's mutex
	void stopNoLock(void);
	
	
	/// data type used to map identifiers to Reactor objects
	typedef std::map<std::string, pion::reactor::ReactorPtr>	ReactorMap;

	/// data type for a pool of processing threads
	typedef std::list<boost::shared_ptr<boost::thread> >		ThreadPool;

	
	/// mutex to make class thread-safe
	mutable boost::mutex			m_mutex;
	
	/// used to schedule the delivery of events to Reactors for processing
	boost::asio::io_service			m_io_service;
	
	/// used to hold all of the registered Reactor objects
	ReactorMap						m_reactors;

	/// pool of threads used to process Events using Reactors
	ThreadPool						m_threads;	
	
	/// number of threads in the available pool for processing Events
	unsigned int					m_num_threads;

	/// true if the reaction engine is running
	bool							m_is_running;
	
	/// points to the singleton instance after creation
	static ReactionEngine *			m_instance_ptr;
	
	/// used for thread-safe singleton pattern
	static boost::once_flag			m_instance_flag;
};



}	// end namespace pion
}	// end namespace platform

#endif
