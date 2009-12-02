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

#ifndef __PION_REACTIONSCHEDULER_HEADER__
#define __PION_REACTIONSCHEDULER_HEADER__

#include <vector>
#include <boost/shared_ptr.hpp>
#include <boost/function/function0.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/PionException.hpp>
#include <pion/PionLockedQueue.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

///
/// ReactionScheduler: scheduler used to route Events for the ReactionEngine
/// 
class ReactionScheduler :
	public PionSingleServiceScheduler
{
public:
	
	/// exception thrown if getIOService() is called
	class NoServiceException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "ReactionScheduler has no io_service available";
		}
	};

	
	/// constructs a new ReactionScheduler
	ReactionScheduler(void) {}
	
	/// virtual destructor
	virtual ~ReactionScheduler() { shutdown(); }
	
	/// Starts the thread scheduler (this is called automatically when necessary)
	virtual void startup(void) {
		// lock mutex for thread safety
		boost::mutex::scoped_lock scheduler_lock(m_mutex);
		
		if (! m_is_running) {
			PION_LOG_INFO(m_logger, "Starting thread scheduler");
			m_is_running = true;
			
			// schedule a work item to make sure that the service doesn't complete
			m_service.reset();
			keepRunning(m_service, m_timer);

			// start a thread that will be used to handle io_service requests
			m_service_thread.reset(new boost::thread( boost::bind(&PionScheduler::processServiceWork,
																  this, boost::ref(m_service)) ));
			
			// start multiple threads to handle async tasks
			for (boost::uint32_t n = 0; n < m_num_threads; ++n) {
				boost::shared_ptr<boost::thread> new_thread(new boost::thread(
					boost::bind(&ReactionScheduler::processReactionQueue, this) ));
				m_thread_pool.push_back(new_thread);
			}
		}
	}		
	
	/// stops all threads used to perform work
	virtual void stopThreads(void) {
		stopThreadInfo();
		PionSingleServiceScheduler::stopThreads();
		if (m_service_thread)
			m_service_thread->join();
		boost::mutex::scoped_lock thread_info_lock(m_thread_info_mutex);
		m_thread_info.clear();
	}

	/// finishes all threads used to perform work
	virtual void finishThreads(void) {
		PionSingleServiceScheduler::finishThreads();
		m_thread_pool.clear();
		m_service_thread.reset();
	}

	/**
	 * schedules work to be performed by one of the pooled threads
	 *
	 * @param work_func work function to be executed
	 */
	virtual void post(boost::function0<void> work_func) {
		m_reaction_queue.push(work_func);
	}
	
	/// returns the number of events queued in ReactionScheduler
	inline std::size_t getQueueSize(void) const { return m_reaction_queue.size(); }

	
protected:
	
	/// data type for a Reaction (when an Event is delivered to a Reactor)
	typedef boost::function0<void>		Reaction;

	/// data type for a thread-safe queue of Reactions
	typedef PionLockedQueue<Reaction>	ReactionQueue;

	/// typedef for a collection of consumer thread info objects
	typedef boost::shared_ptr<ReactionQueue::ConsumerThread>	ThreadInfoPtr;

	/// typedef for a collection of consumer thread info objects
	typedef std::vector<ThreadInfoPtr>	ThreadInfoVector;
	
	
	/// creates and returns a new queue info object for Reaction consumer threads
	ThreadInfoPtr getThreadInfo(void) {
		ThreadInfoPtr info_ptr(new ReactionQueue::ConsumerThread);
		boost::mutex::scoped_lock thread_info_lock(m_thread_info_mutex);
		m_thread_info.push_back(info_ptr);
		return info_ptr;
	}

	/// sets all thread info objects to stop (forces return for pop())
	void stopThreadInfo(void) {
		boost::mutex::scoped_lock thread_info_lock(m_thread_info_mutex);
		for (ThreadInfoVector::iterator i = m_thread_info.begin();
			i != m_thread_info.end(); ++i)
		{
			(*i)->stop();
		}
	}

	/// processes work in the reaction queue while running
	void processReactionQueue(void) {
		Reaction r;
		ThreadInfoPtr info_ptr(getThreadInfo());
		while (m_is_running) {
			try {
				while (m_is_running) {
					if (m_reaction_queue.pop(r, *info_ptr) && m_is_running)
						r();
				}
			} catch (std::exception& e) {
				PION_LOG_ERROR(m_logger, e.what());
			} catch (...) {
				PION_LOG_ERROR(m_logger, "caught unrecognized exception");
			}
		}
	}		
	
	
	/// a queue of Events that are scheduled to be delivered to Reactors
	ReactionQueue						m_reaction_queue;

	/// thread that is used to handle io_service requests
	boost::shared_ptr<boost::thread>	m_service_thread;

	/// info objects for consumer threads used to manage signaling
	ThreadInfoVector					m_thread_info;

	/// used to provide thread safety for the thread info vector
	boost::mutex						m_thread_info_mutex;
};
	
	
}	// end namespace platform
}	// end namespace pion

#endif
