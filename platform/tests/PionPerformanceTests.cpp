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

#include <iostream>
#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <boost/cstdint.hpp>
#include <boost/thread/thread.hpp>
#include <boost/pool/pool.hpp>
#include <boost/pool/pool_alloc.hpp>
#include <boost/date_time/posix_time/posix_time_duration.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/PionLockedQueue.hpp>
#include <pion/platform/Event.hpp>

#ifdef __GNUC__
	// for tests that use the GNU "multithread" allocator included with GCC
	#include <ext/mt_allocator.h>
	/// data type for an Event allocator that uses the GCC "multithread" allocator
	typedef __gnu_cxx::__mt_alloc<pion::platform::Event,
		__gnu_cxx::__per_type_pool_policy<pion::platform::Event,
		__gnu_cxx::__pool, true> >	EventGCCPoolAlloc;
#endif

/// data type for a shared Event pool allocator using boost::fast_pool_allocator
typedef boost::fast_pool_allocator<pion::platform::Event>	EventBoostPoolAlloc;


using namespace std;
using namespace pion;
using namespace pion::platform;


///
/// PerformanceTest: interface class for Pion performance tests
///
class PerformanceTest {
public:

	/// the number of samples to take (one per second)
	enum { NUM_SAMPLES = 10 };


	/**
	 * constructs a new PerformanceTest
	 *
	 * @param test_description used to describe the performance test
	 */
	PerformanceTest(void)
		: m_counter(0), m_is_running(true), m_last_count(0),
		m_sample_sum(0), m_total_samples(0), m_samples_remaining(NUM_SAMPLES),
		m_count_description("counter"), m_service(), m_timer(m_service)
	{
		scheduleSample();
	}
	
	/// virtual destructor -> this class should be extended
	virtual ~PerformanceTest() { stop(); }

	/// starts the performance test
	virtual void start(void) = 0;
	
	/// stops the performance test
	virtual void stop(void) { if (m_is_running) stopTest(); }

	/// runs the performance test
	virtual void run(void) {
		std::cout << "Running test: " << m_test_description << std::endl;
		start();
		m_service.run();
	}
	
	/// returns true if the test is running
	inline bool isRunning(void) const { return m_is_running; }

	
protected:

	/// stops the performance test
	virtual void stopTest(void) { m_is_running=false; }

	/// sets a description for the performance test
	inline void setTestDescription(const std::string& d) { m_test_description=d; }

	/// sets a description for the counter
	inline void setCountDescription(const std::string& d) { m_count_description=d; }

	/// sets the number of counter samples remaining
	inline void setSamplesRemaining(const boost::uint32_t n) { m_samples_remaining=n; }

	
	/// the current value of the counter
	volatile boost::uint64_t			m_counter;

	/// true if the performance test is running
	volatile bool						m_is_running;


private:

	/// returns the current counter value
	virtual boost::uint64_t getCurrentCount(void) { return m_counter; }

	/// schedules a timer to print out the value of the counter
	inline void scheduleSample(void) {
		m_timer.expires_from_now(boost::posix_time::seconds(1));
		m_timer.async_wait(boost::bind(&PerformanceTest::getSample, this));
	}

	/// gets a sample and prints out the value of the counter
	inline void getSample(void) {
		// get and print the value of the counter
		const boost::uint64_t current_count(getCurrentCount());
		cout << m_count_description << ": " << (current_count-m_last_count) << endl;

		// increase the counter sum and update last count
		m_sample_sum += (current_count-m_last_count);
		m_last_count = current_count;

		// update sample numbers and schedule another sample if necessary
		++m_total_samples;
		if (--m_samples_remaining > 0) {
			scheduleSample();
		} else {
			cout << m_count_description << " (avg): " << (m_sample_sum/m_total_samples)
				<< endl << endl;
			stop();
		}
	}

	/// the value of the counter when the last sample was taken
	boost::uint64_t					m_last_count;
	
	/// the sum of all of sample values
	boost::uint64_t					m_sample_sum;
	
	/// the total number of samples that have been taken
	boost::uint32_t					m_total_samples;
	
	/// the number of samples remaining
	boost::uint32_t					m_samples_remaining;
	
	/// a description of what the counter represents
	std::string						m_count_description;
	
	/// a description of the performance test
	std::string						m_test_description;
	
	/// a service used to schedule counter samples
	boost::asio::io_service			m_service;
	
	/// a timer used to schedule counter samples
	boost::asio::deadline_timer		m_timer;
};


///
/// AllocTest: tests the performance of simultaneously generating objects
///            using 1 or more threads
///
template <unsigned int NumThreads = 1>
class AllocTest :
	public PerformanceTest
{
public:

	/// default constructor
	AllocTest(void) {
		for (unsigned int n = 0; n < NumThreads; ++n)
			m_counters[n] = 0;
		PerformanceTest::setTestDescription("AllocTest");
		PerformanceTest::setCountDescription("events");
	}

	/// virtual destructor
	virtual ~AllocTest() { PerformanceTest::stop(); }

	/// starts the performance test
	virtual void start(void) {
		for (unsigned int n = 0; n < NumThreads; ++n) {
			m_threads[n].reset(new boost::thread(boost::bind(&AllocTest::generate,
															 this, boost::ref(m_counters[n]))));
		}
	}
	
	/// sets the test description, including the number of threads used
	inline void setTestDescriptionWithThreads(const std::string& description) {
		std::string d(description);
		d += " (";
		d += boost::lexical_cast<std::string>(NumThreads);
		d += " threads)";
		PerformanceTest::setTestDescription(d);
	}


protected:

	/// returns the current counter value
	virtual boost::uint64_t getCurrentCount(void) {
		boost::uint64_t result = 0;
		for (unsigned int n = 0; n < NumThreads; ++n)
			result += m_counters[n];
		return result;
	}

	/// stops the performance test
	virtual void stopTest(void) {
		m_is_running = false;
		for (unsigned int n = 0; n < NumThreads; ++n) {
			if (m_threads[n]) m_threads[n]->join();
		}
	}

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(boost::uint64_t& thread_counter) = 0;


	/// an array of counters used by the generation threads
	boost::array<boost::uint64_t, NumThreads>					m_counters;

	/// a collection of threads used to perform allocations
	boost::array<boost::scoped_ptr<boost::thread>, NumThreads>	m_threads;
};


///
/// EventAllocTest: tests the performance of simultaneously generating
///                 Event objects in 1 or more threads using new/delete
///
template <unsigned int NumThreads = 1>
class EventAllocTest :
	public AllocTest<NumThreads>
{
public:

	/// default constructor
	EventAllocTest(void) {
		AllocTest<NumThreads>::setTestDescriptionWithThreads("EventAllocTest");
	}

	/// virtual destructor
	virtual ~EventAllocTest() { PerformanceTest::stop(); }


protected:

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(boost::uint64_t& thread_counter) {
		Event *event_ptr(NULL);
		while (PerformanceTest::isRunning()) {
			event_ptr = new Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
			delete event_ptr;
			++thread_counter;
		}
	}
};


///
/// EventSharedBoostPoolAllocTest: tests the performance of simultaneously
///                                generating Event objects in 1 or more threads
///                                using a shared boost::fast_pool_allocator
///
template <unsigned int NumThreads = 1>
class EventSharedBoostPoolAllocTest :
	public AllocTest<NumThreads>
{
public:

	/// default constructor
	EventSharedBoostPoolAllocTest(void) {
		AllocTest<NumThreads>::setTestDescriptionWithThreads("EventSharedBoostPoolAllocTest");
	}

	/// virtual destructor
	virtual ~EventSharedBoostPoolAllocTest() { PerformanceTest::stop(); }


protected:

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(boost::uint64_t& thread_counter) {
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		while (PerformanceTest::isRunning()) {
			mem_ptr = EventBoostPoolAlloc::allocate();
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
			event_ptr->~Event();
			EventBoostPoolAlloc::deallocate(event_ptr);
			++thread_counter;
		}
	}
};


///
/// EventUniqueBoostPoolAllocTest: tests the performance of simultaneously
///                                generating Event objects in 1 or more threads
///                                using unique instances of boost::fast_pool_allocator
///
template <unsigned int NumThreads = 1>
class EventUniqueBoostPoolAllocTest :
	public AllocTest<NumThreads>
{
public:
	
	/**
	 * default constructor
	 *
	 * @param lock_pool if true, a lock will be acquired each time the memory pool is accessed
	 */
	explicit EventUniqueBoostPoolAllocTest(bool lock_pool = true)
		: m_lock_pool_access(lock_pool)
	{
		if (lock_pool)
			AllocTest<NumThreads>::setTestDescriptionWithThreads("EventUniqueBoostPoolAllocTest (with locks)");
		else
			AllocTest<NumThreads>::setTestDescriptionWithThreads("EventUniqueBoostPoolAllocTest (no locks)");
	}
	
	/// virtual destructor
	virtual ~EventUniqueBoostPoolAllocTest() { PerformanceTest::stop(); }
	
	
protected:
	
	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(boost::uint64_t& thread_counter) {
		boost::pool<> local_pool_alloc(sizeof(Event));
		boost::mutex pool_mutex;
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		
		if (m_lock_pool_access) {
			while (PerformanceTest::isRunning()) {
				boost::mutex::scoped_lock pool_malloc_lock(pool_mutex);
				mem_ptr = local_pool_alloc.malloc();
				pool_malloc_lock.unlock();
				
				event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
				event_ptr->~Event();
				
				boost::mutex::scoped_lock pool_free_lock(pool_mutex);
				local_pool_alloc.free(event_ptr);
				pool_free_lock.unlock();
				
				++thread_counter;
			}
		} else {
			while (PerformanceTest::isRunning()) {
				mem_ptr = local_pool_alloc.malloc();
				event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
				event_ptr->~Event();
				local_pool_alloc.free(event_ptr);
				++thread_counter;
			}
		}
	}
	
	/// true if a lock will be acquired each time the memory pool is accessed
	bool	m_lock_pool_access;
};


#ifdef __GNUC__
///
/// EventSharedGCCPoolAllocTest: tests the performance of simultaneously 
///                              generating Event objects in 1 or more threads
///                              using a shared GCC "multithread" allocator
///
template <unsigned int NumThreads = 1>
class EventSharedGCCPoolAllocTest :
	public AllocTest<NumThreads>
{
public:
	
	/// default constructor
	explicit EventSharedGCCPoolAllocTest(void) {
		AllocTest<NumThreads>::setTestDescriptionWithThreads("EventSharedGCCPoolAllocTest");
		// tune the allocator
		__gnu_cxx::__pool_base::_Tune mt_tune(8, 5120, 8, 4096 - 4 * sizeof(void*), 128, 10, false);
		m_pool_alloc._M_set_options(mt_tune);
	}
	
	/// virtual destructor
	virtual ~EventSharedGCCPoolAllocTest() { PerformanceTest::stop(); }
	
protected:
	
	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(boost::uint64_t& thread_counter) {
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		while (PerformanceTest::isRunning()) {
			mem_ptr = m_pool_alloc.allocate(1);
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
			event_ptr->~Event();
			m_pool_alloc.deallocate(event_ptr, 1);
			++thread_counter;
		}
	}
	
private:
	
	/// memory pool allocator
	EventGCCPoolAlloc	m_pool_alloc;
};


///
/// EventUniqueGCCPoolAllocTest: tests the performance of simultaneously generating
///                              Event objects in 1 or more threads using unique 
///                              instances of the GCC "multithread" allocator
///
template <unsigned int NumThreads = 1>
class EventUniqueGCCPoolAllocTest :
	public AllocTest<NumThreads>
{
public:

	/// default constructor
	EventUniqueGCCPoolAllocTest(void) {
		AllocTest<NumThreads>::setTestDescriptionWithThreads("EventUniqueGCCPoolAllocTest");
	}

	/// virtual destructor
	virtual ~EventUniqueGCCPoolAllocTest() { PerformanceTest::stop(); }

protected:

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(boost::uint64_t& thread_counter) {
		EventGCCPoolAlloc	local_pool_alloc;
		__gnu_cxx::__pool_base::_Tune mt_tune(8, 5120, 8, 4096 - 4 * sizeof(void*), 128, 10, false);
		local_pool_alloc._M_set_options(mt_tune);

		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		
		while (PerformanceTest::isRunning()) {
			mem_ptr = local_pool_alloc.allocate(1);
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
			event_ptr->~Event();
			local_pool_alloc.deallocate(event_ptr, 1);
			++thread_counter;
		}
	}
};
#endif


///
/// EventPtrAllocTest: tests the performance of creating empty EventPtr objects
///                    using 1 or more threads
///
template <unsigned int NumThreads = 1>
class EventPtrAllocTest :
	public AllocTest<NumThreads>
{
public:

	/// default constructor
	EventPtrAllocTest(void) {
		AllocTest<NumThreads>::setTestDescriptionWithThreads("EventPtrAllocTest");
	}

	/// virtual destructor
	virtual ~EventPtrAllocTest() { PerformanceTest::stop(); }


protected:

	/// updates the contents of new events created
	virtual void updateEvent(EventPtr& e) {}

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(boost::uint64_t& thread_counter) {
		EventPtr e;
		EventFactory f;
		while (PerformanceTest::isRunning()) {
			e = f.create(Vocabulary::UNDEFINED_TERM_REF);
			updateEvent(e);
			++thread_counter;
		}
	}
};


///
/// CLFEventPtrAllocTest: tests the performance of creating EventPtr objects that
///                       contain common log format data using 1 or more threads
///
template <unsigned int NumThreads = 1>
class CLFEventPtrAllocTest :
	public EventPtrAllocTest<NumThreads>
{
public:

	/// default constructor
	CLFEventPtrAllocTest(void) {
		AllocTest<NumThreads>::setTestDescriptionWithThreads("CLFEventPtrAllocTest");
	}

	/// virtual destructor
	virtual ~CLFEventPtrAllocTest() { PerformanceTest::stop(); }

protected:

	/// updates the contents of new events created
	virtual void updateEvent(EventPtr& e) {
		e->setString(1, "10.0.19.111");
		e->setString(2, "05/Apr/2007:05:37:11 -0600");
		e->setString(3, "GET /robots.txt HTTP/1.0");
		e->setUInt(4, 404);
		e->setUInt(5, 208);
	}
};


///
/// AllocTwoThreadQueueTest: tests the performance of creating empty objects
///                          in one thread and deleting them in another thread
///
class AllocTwoThreadQueueTest :
	public PerformanceTest
{
public:

	/// default constructor
	AllocTwoThreadQueueTest(void) {
		setTestDescription("AllocTwoThreadQueueTest");
		setCountDescription("events");
	}

	/// virtual destructor
	virtual ~AllocTwoThreadQueueTest() { stop(); }

	/// starts the performance test
	virtual void start(void) {
		m_generate_thread.reset(new boost::thread(boost::bind(&AllocTwoThreadQueueTest::generate, this)));
		m_consumer_thread.reset(new boost::thread(boost::bind(&AllocTwoThreadQueueTest::consume, this)));
	}


protected:

	/// stops the performance test
	virtual void stopTest(void) {
		m_is_running = false;
		if (m_generate_thread) m_generate_thread->join();
		if (m_consumer_thread) m_consumer_thread->join();
	}

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(void) = 0;

	/// frees EventPtr objects in the shared queue
	virtual void consume(void) = 0;


	/// thread used to generate EventPtr objects
	boost::scoped_ptr<boost::thread>	m_generate_thread;

	/// thread used to consume EventPtr objects
	boost::scoped_ptr<boost::thread>	m_consumer_thread;
};


///
/// IntAllocTwoThreadQueueTest: tests the raw basline performance of the PionLockedQueue
///
class IntAllocTwoThreadQueueTest :
	public AllocTwoThreadQueueTest
{
public:

	/// default constructor
	IntAllocTwoThreadQueueTest(void) {
		setTestDescription("IntAllocTwoThreadQueueTest");
	}

	/// virtual destructor
	virtual ~IntAllocTwoThreadQueueTest() { stop(); }


protected:

	/// pushes ints into a shared queue
	virtual void generate(void) {
		int n = 0;
		while (isRunning())
			m_queue.push(n);
	}

	/// removes ints from the shared queue
	virtual void consume(void) {
		int n = 0;
		while (isRunning()) {
			// sleep 1/8 second if the queue is empty
			while (isRunning() && !m_queue.pop(n))
				PionScheduler::sleep(0, 125000000);
			if (! isRunning()) break;
			++m_counter;
		}
		// consume the rest of the queue to make sure generate() doesn't hang
		while (m_queue.pop(n)) ;
	}
	
	
private:

	/// a shared queue of integers
	PionLockedQueue<int>			m_queue;
};


///
/// EventBoostPoolAllocTwoThreadQueueTest: tests the performance of creating empty EventPtr objects
///                                        in one thread and deleting them in another thread using
///                                        boost::fast_pool_allocator
///
class EventBoostPoolAllocTwoThreadQueueTest :
	public AllocTwoThreadQueueTest
{
public:

	/// default constructor
	EventBoostPoolAllocTwoThreadQueueTest(void) {
		setTestDescription("EventBoostPoolAllocTwoThreadQueueTest");
	}

	/// virtual destructor
	virtual ~EventBoostPoolAllocTwoThreadQueueTest() { stop(); }


protected:

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(void) {
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		while (isRunning()) {
			mem_ptr = EventBoostPoolAlloc::allocate();
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
			m_queue.push(event_ptr);
		}
	}

	/// frees EventPtr objects in the shared queue
	virtual void consume(void) {
		Event *event_ptr(NULL);
		while (isRunning()) {
			// sleep 1/8 second if the queue is empty
			while (isRunning() && !m_queue.pop(event_ptr))
				PionScheduler::sleep(0, 125000000);
			event_ptr->~Event();
			EventBoostPoolAlloc::deallocate(event_ptr);
			if (! isRunning()) break;
			++m_counter;
		}
		// consume the rest of the queue to make sure generate() doesn't hang
		while (m_queue.pop(event_ptr)) {
			event_ptr->~Event();
			EventBoostPoolAlloc::deallocate(event_ptr);
		}
	}
	
	
private:

	/// a shared queue of EventPtr objects
	PionLockedQueue<Event*>				m_queue;
};


///
/// EventAllocTwoThreadQueueTest: tests the performance of creating empty Event objects
///                               in one thread and deleting them in another thread
///
class EventAllocTwoThreadQueueTest :
	public AllocTwoThreadQueueTest
{
public:

	/// default constructor
	EventAllocTwoThreadQueueTest(void) {
		setTestDescription("EventAllocTwoThreadQueueTest");
	}

	/// virtual destructor
	virtual ~EventAllocTwoThreadQueueTest() { stop(); }


protected:

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(void) {
		Event *event_ptr(NULL);
		while (isRunning()) {
			event_ptr = new Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
			m_queue.push(event_ptr);
		}
	}

	/// frees EventPtr objects in the shared queue
	virtual void consume(void) {
		Event *event_ptr(NULL);
		while (isRunning()) {
			// sleep 1/8 second if the queue is empty
			while (isRunning() && !m_queue.pop(event_ptr))
				PionScheduler::sleep(0, 125000000);
			delete event_ptr;
			if (! isRunning()) break;
			++m_counter;
		}
		// consume the rest of the queue to make sure generate() doesn't hang
		while (m_queue.pop(event_ptr)) {
			delete event_ptr;
		}
	}
	
	
private:

	/// a shared queue of EventPtr objects
	PionLockedQueue<Event*>				m_queue;
};


#ifdef __GNUC__
///
/// EventGCCPoolAllocTwoThreadQueueTest: tests the performance of creating empty EventPtr objects
///                                      in one thread and deleting them in another thread using
///                                      the GCC "multithread" allocator
///
class EventGCCPoolAllocTwoThreadQueueTest :
	public AllocTwoThreadQueueTest
{
public:

	/// default constructor
	EventGCCPoolAllocTwoThreadQueueTest(void) {
		setTestDescription("EventGCCPoolAllocTwoThreadQueueTest");
	}

	/// virtual destructor
	virtual ~EventGCCPoolAllocTwoThreadQueueTest() { stop(); }


protected:

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(void) {
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		while (isRunning()) {
			mem_ptr = m_pool_alloc.allocate(1);
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF, NULL);
			m_queue.push(event_ptr);
		}
	}

	/// frees EventPtr objects in the shared queue
	virtual void consume(void) {
		Event *event_ptr(NULL);
		while (isRunning()) {
			// sleep 1/8 second if the queue is empty
			while (isRunning() && !m_queue.pop(event_ptr))
				PionScheduler::sleep(0, 125000000);
			event_ptr->~Event();
			m_pool_alloc.deallocate(event_ptr, 1);
			if (! isRunning()) break;
			++m_counter;
		}
		// consume the rest of the queue to make sure generate() doesn't hang
		while (m_queue.pop(event_ptr)) {
			event_ptr->~Event();
			m_pool_alloc.deallocate(event_ptr, 1);
		}
	}
	
	
private:

	/// a shared queue of EventPtr objects
	PionLockedQueue<Event*>			m_queue;

	/// memory pool allocator
	EventGCCPoolAlloc	m_pool_alloc;
};
#endif


///
/// EventPtrAllocTwoThreadQueueTest: tests the performance of creating empty EventPtr objects
///                                  in one thread and deleting them in another thread
///
class EventPtrAllocTwoThreadQueueTest :
	public AllocTwoThreadQueueTest
{
public:

	/// default constructor
	EventPtrAllocTwoThreadQueueTest(void) {
		setTestDescription("EventPtrAllocTwoThreadQueueTest");
	}

	/// virtual destructor
	virtual ~EventPtrAllocTwoThreadQueueTest() { stop(); }


protected:

	/// updates the contents of new events created
	virtual void updateEvent(EventPtr& e) {}

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(void) {
		EventFactory f;
		while (isRunning()) {
			EventPtr e(f.create(Vocabulary::UNDEFINED_TERM_REF));
			updateEvent(e);
			m_queue.push(e);
		}
	}

	/// frees EventPtr objects in the shared queue
	virtual void consume(void) {
		EventPtr event_ptr;
		while (isRunning()) {
			// sleep 1/8 second if the queue is empty
			while (isRunning() && !m_queue.pop(event_ptr))
				PionScheduler::sleep(0, 125000000);
			if (! isRunning()) break;
			++m_counter;
		}
		// consume the rest of the queue to make sure generate() doesn't hang
		while (m_queue.pop(event_ptr)) ;
	}
	
	
private:

	/// a shared queue of EventPtr objects
	PionLockedQueue<EventPtr>			m_queue;
};


///
/// CLFEventPtrAllocTwoThreadQueueTest: tests the performance of creating EventPtr objects that
///                                     that contain common log format data in one thread and
///                                     deleting them in another thread
///
class CLFEventPtrAllocTwoThreadQueueTest :
	public EventPtrAllocTwoThreadQueueTest
{
public:

	/// default constructor
	CLFEventPtrAllocTwoThreadQueueTest(void) {
		setTestDescription("CLFEventPtrAllocTwoThreadQueueTest");
	}

	/// virtual destructor
	virtual ~CLFEventPtrAllocTwoThreadQueueTest() { stop(); }

protected:

	/// updates the contents of new events created
	virtual void updateEvent(EventPtr& e) {
		e->setString(1, "10.0.19.111");
		e->setString(2, "05/Apr/2007:05:37:11 -0600");
		e->setString(3, "GET /robots.txt HTTP/1.0");
		e->setUInt(4, 404);
		e->setUInt(5, 208);
	}
};


///
/// main control function for Pion performance tests
///
int main(void) {
	boost::scoped_ptr<PerformanceTest> test_ptr;
/*
	// run the EventAllocTest with one thread
	test_ptr.reset(new EventAllocTest<1>());
	test_ptr->run();

	// run the EventAllocTest with two threads
	test_ptr.reset(new EventAllocTest<2>());
	test_ptr->run();

	// run the EventSharedBoostPoolAllocTest with one thread
	test_ptr.reset(new EventSharedBoostPoolAllocTest<1>());
	test_ptr->run();

	// run the EventSharedBoostPoolAllocTest with two threads
	test_ptr.reset(new EventSharedBoostPoolAllocTest<2>());
	test_ptr->run();

	// run the EventUniqueBoostPoolAllocTest with one thread
	test_ptr.reset(new EventUniqueBoostPoolAllocTest<1>(false));
	test_ptr->run();

	// run the EventUniqueBoostPoolAllocTest with two threads
	test_ptr.reset(new EventUniqueBoostPoolAllocTest<2>(false));
	test_ptr->run();

	// run the EventUniqueBoostPoolAllocTest with three threads
	test_ptr.reset(new EventUniqueBoostPoolAllocTest<3>(false));
	test_ptr->run();

	// run the EventUniqueBoostPoolAllocTest with four threads
	test_ptr.reset(new EventUniqueBoostPoolAllocTest<4>(false));
	test_ptr->run();
	
#ifdef __GNUC__
	// run the EventSharedGCCPoolAllocTest with one thread
	test_ptr.reset(new EventSharedGCCPoolAllocTest<1>());
	test_ptr->run();

	// run the EventSharedGCCPoolAllocTest with two threads
	test_ptr.reset(new EventSharedGCCPoolAllocTest<2>());
	test_ptr->run();

	// run the EventUniqueGCCPoolAllocTest with one thread
	test_ptr.reset(new EventUniqueGCCPoolAllocTest<1>());
	test_ptr->run();

	// run the EventUniqueGCCPoolAllocTest with two threads
	test_ptr.reset(new EventUniqueGCCPoolAllocTest<2>());
	test_ptr->run();
#endif

	// run the EventPtrAllocTest with one thread
	test_ptr.reset(new EventPtrAllocTest<1>());
	test_ptr->run();

	// run the EventPtrAllocTest with two threads
	test_ptr.reset(new EventPtrAllocTest<2>());
	test_ptr->run();

	// run the EventPtrAllocTest with three threads
	test_ptr.reset(new EventPtrAllocTest<3>());
	test_ptr->run();

	// run the EventPtrAllocTest with four threads
	test_ptr.reset(new EventPtrAllocTest<4>());
	test_ptr->run();
*/

	// run the CLFEventPtrAllocTest with one thread
	test_ptr.reset(new CLFEventPtrAllocTest<1>());
	test_ptr->run();

	// run the CLFEventPtrAllocTest with two threads
	test_ptr.reset(new CLFEventPtrAllocTest<2>());
	test_ptr->run();

	// run the CLFEventPtrAllocTest with three threads
	test_ptr.reset(new CLFEventPtrAllocTest<3>());
	test_ptr->run();

	// run the CLFEventPtrAllocTest with four threads
	test_ptr.reset(new CLFEventPtrAllocTest<4>());
	test_ptr->run();
/*
	// run the IntAllocTwoThreadQueueTest
	test_ptr.reset(new IntAllocTwoThreadQueueTest);
	test_ptr->run();

	// run the EventAllocTwoThreadQueueTest
	test_ptr.reset(new EventAllocTwoThreadQueueTest);
	test_ptr->run();

	// run the EventBoostPoolAllocTwoThreadQueueTest
	test_ptr.reset(new EventBoostPoolAllocTwoThreadQueueTest);
	test_ptr->run();

#ifdef __GNUC__
	// run the EventGCCPoolAllocTwoThreadQueueTest
	test_ptr.reset(new EventGCCPoolAllocTwoThreadQueueTest);
	test_ptr->run();
#endif

	// run the EventPtrAllocTwoThreadQueueTest
	test_ptr.reset(new EventPtrAllocTwoThreadQueueTest);
	test_ptr->run();

	// run the CLFEventPtrAllocTwoThreadQueueTest
	test_ptr.reset(new CLFEventPtrAllocTwoThreadQueueTest);
	test_ptr->run();
*/
	return 0;
}
