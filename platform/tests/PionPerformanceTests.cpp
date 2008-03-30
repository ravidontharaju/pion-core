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
#include <boost/pool/pool_alloc.hpp>
#include <boost/date_time/posix_time/posix_time_duration.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/PionLockedQueue.hpp>
#include <pion/platform/Event.hpp>

#ifdef __GNUC__
	// for tests that use the GNU "multithread" allocator included with GCC
	#include <ext/mt_allocator.h>
	/// data type for an Event allocator that uses the GCC "multithread" allocator
	typedef __gnu_cxx::__mt_alloc<pion::platform::Event>	EventGCCPoolAlloc;
#endif

using namespace std;
using namespace pion;
using namespace pion::platform;


///
/// PerformanceTest: interface class for Pion performance tests
///
class PerformanceTest {
public:

	/**
	 * constructs a new PerformanceTest
	 *
	 * @param test_description used to describe the performance test
	 */
	PerformanceTest(void)
		: m_counter(0), m_is_running(true), m_last_count(0),
		m_sample_sum(0), m_total_samples(0), m_samples_remaining(10),
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

	/// schedules a timer to print out the value of the counter
	inline void scheduleSample(void) {
		m_timer.expires_from_now(boost::posix_time::seconds(1));
		m_timer.async_wait(boost::bind(&PerformanceTest::getSample, this));
	}

	/// gets a sample and prints out the value of the counter
	inline void getSample(void) {
		// get and print the value of the counter
		const boost::uint64_t current_count(m_counter);
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
/// AllocTest: base class to test the performance of allocating and freeing objects
///
class AllocTest :
	public PerformanceTest
{
public:

	/// default constructor
	AllocTest(void) {
		setTestDescription("AllocTest");
		setCountDescription("allocs");
	}

	/// virtual destructor
	virtual ~AllocTest() { stop(); }

	/// starts the performance test
	virtual void start(void) {
		m_count_thread.reset(new boost::thread(boost::bind(&AllocTest::countAllocs, this)));
	}

protected:

	/// stops the performance test
	virtual void stopTest(void) {
		m_is_running = false;
		if (m_count_thread) m_count_thread->join();
	}

	/// counts the creation and deletion of EventPtr objects
	virtual void countAllocs(void) = 0;
	

	/// thread used to create and delete EventPtr objects
	boost::scoped_ptr<boost::thread>	m_count_thread;
};



///
/// EventAllocTest: tests the performance of allocating and freeing Event's
///
class EventAllocTest :
	public AllocTest
{
public:

	/// default constructor
	EventAllocTest(void) {
		setTestDescription("EventAllocTest");
	}

	/// virtual destructor
	virtual ~EventAllocTest() { stop(); }

private:

	/// counts the creation and deletion of EventPtr objects
	virtual void countAllocs(void) {
		while (isRunning()) {
			Event *event_ptr = new Event(Vocabulary::UNDEFINED_TERM_REF);
			delete event_ptr;
			++m_counter;
		}
	}
};


/// data type for an Event pool allocator
typedef boost::fast_pool_allocator<Event, boost::default_user_allocator_new_delete,
	boost::details::pool::default_mutex, 10240 >	EventBoostPoolAlloc;


///
/// EventBoostPoolAllocTest: tests the performance of allocating and freeing Event's
///                          using boost::fast_pool_allocator
///
class EventBoostPoolAllocTest :
	public AllocTest
{
public:

	/// default constructor
	EventBoostPoolAllocTest(void) {
		setTestDescription("EventBoostPoolAllocTest");
	}

	/// virtual destructor
	virtual ~EventBoostPoolAllocTest() { stop(); }

private:	

	/// counts the creation and deletion of EventPtr objects
	virtual void countAllocs(void) {
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		while (isRunning()) {
			mem_ptr = EventBoostPoolAlloc::allocate();
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF);
			event_ptr->~Event();
			EventBoostPoolAlloc::deallocate(event_ptr);
			++m_counter;
		}
	}
};


#ifdef __GNUC__
///
/// EventGCCPoolAllocTest: tests the performance of allocating and freeing Event's
///                        using the GCC "multithread" allocator
///
class EventGCCPoolAllocTest :
	public AllocTest
{
public:

	/// default constructor
	EventGCCPoolAllocTest(void) {
		setTestDescription("EventGCCPoolAllocTest");
	}

	/// virtual destructor
	virtual ~EventGCCPoolAllocTest() { stop(); }

private:	

	/// counts the creation and deletion of EventPtr objects
	virtual void countAllocs(void) {
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		while (isRunning()) {
			mem_ptr = m_pool_alloc.allocate(1);
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF);
			event_ptr->~Event();
			m_pool_alloc.deallocate(event_ptr, 1);
			++m_counter;
		}
	}


	/// memory pool allocator
	EventGCCPoolAlloc	m_pool_alloc;
};
#endif


///
/// EventPtrAllocTest: tests the performance of allocating and freeing EventPtr's
///
class EventPtrAllocTest :
	public AllocTest
{
public:

	/// default constructor
	EventPtrAllocTest(void) {
		setTestDescription("EventPtrAllocTest");
	}

	/// virtual destructor
	virtual ~EventPtrAllocTest() { stop(); }

private:

	/// updates the contents of new events created
	virtual void updateEvent(EventPtr& e) {}
	
	/// counts the creation and deletion of EventPtr objects
	virtual void countAllocs(void) {
		while (isRunning()) {
			EventPtr e(EventFactory::create(Vocabulary::UNDEFINED_TERM_REF));
			updateEvent(e);
			++m_counter;
		}
	}
};


///
/// CLFEventPtrAllocTest: tests the performance of allocating and freeing EventPtr's
///                    that contain common log format data
///
class CLFEventPtrAllocTest :
	public EventPtrAllocTest
{
public:

	/// default constructor
	CLFEventPtrAllocTest(void) {
		setTestDescription("CLFEventPtrAllocTest");
	}

	/// virtual destructor
	virtual ~CLFEventPtrAllocTest() { stop(); }

private:

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
/// AllocTwoThreadTest: tests the performance of creating empty objects
///                     in one thread and deleting them in another thread
///
class AllocTwoThreadTest :
	public PerformanceTest
{
public:

	/// default constructor
	AllocTwoThreadTest(void) {
		setTestDescription("AllocTwoThreadTest");
		setCountDescription("events");
	}

	/// virtual destructor
	virtual ~AllocTwoThreadTest() { stop(); }

	/// starts the performance test
	virtual void start(void) {
		m_generate_thread.reset(new boost::thread(boost::bind(&AllocTwoThreadTest::generate, this)));
		m_consumer_thread.reset(new boost::thread(boost::bind(&AllocTwoThreadTest::consume, this)));
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
/// EventPtrAllocTwoThreadTest: tests the performance of creating empty EventPtr objects
///                             in one thread and deleting them in another thread
///
class EventPtrAllocTwoThreadTest :
	public AllocTwoThreadTest
{
public:

	/// default constructor
	EventPtrAllocTwoThreadTest(void) {
		setTestDescription("EventPtrAllocTwoThreadTest");
	}

	/// virtual destructor
	virtual ~EventPtrAllocTwoThreadTest() { stop(); }


protected:

	/// updates the contents of new events created
	virtual void updateEvent(EventPtr& e) {}

	/// creates EventPtr objects and pushes them into a shared queue
	virtual void generate(void) {
		while (isRunning()) {
			EventPtr e(EventFactory::create(Vocabulary::UNDEFINED_TERM_REF));
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
/// IntAllocTwoThreadTest: tests the raw basline performance of the PionLockedQueue
///
class IntAllocTwoThreadTest :
	public AllocTwoThreadTest
{
public:

	/// default constructor
	IntAllocTwoThreadTest(void) {
		setTestDescription("IntAllocTwoThreadTest");
	}

	/// virtual destructor
	virtual ~IntAllocTwoThreadTest() { stop(); }


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
/// EventBoostPoolAllocTwoThreadTest: tests the performance of creating empty EventPtr objects
///                                   in one thread and deleting them in another thread using
///                                   boost::fast_pool_allocator
///
class EventBoostPoolAllocTwoThreadTest :
	public AllocTwoThreadTest
{
public:

	/// default constructor
	EventBoostPoolAllocTwoThreadTest(void) {
		setTestDescription("EventBoostPoolAllocTwoThreadTest");
	}

	/// virtual destructor
	virtual ~EventBoostPoolAllocTwoThreadTest() { stop(); }


protected:

	/// creates EventPtr objects and pushes them into a shared queue
	inline void generate(void) {
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		while (isRunning()) {
			mem_ptr = EventBoostPoolAlloc::allocate();
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF);
			m_queue.push(event_ptr);
		}
	}

	/// frees EventPtr objects in the shared queue
	inline void consume(void) {
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


#ifdef __GNUC__
///
/// EventGCCPoolAllocTwoThreadTest: tests the performance of creating empty EventPtr objects
///                                 in one thread and deleting them in another thread using
///                                 the GCC "multithread" allocator
///
class EventGCCPoolAllocTwoThreadTest :
	public AllocTwoThreadTest
{
public:

	/// default constructor
	EventGCCPoolAllocTwoThreadTest(void) {
		setTestDescription("EventGCCPoolAllocTwoThreadTest");
	}

	/// virtual destructor
	virtual ~EventGCCPoolAllocTwoThreadTest() { stop(); }


protected:

	/// creates EventPtr objects and pushes them into a shared queue
	inline void generate(void) {
		void *mem_ptr(NULL);
		Event *event_ptr(NULL);
		while (isRunning()) {
			mem_ptr = m_pool_alloc.allocate(1);
			event_ptr = new (mem_ptr) Event(Vocabulary::UNDEFINED_TERM_REF);
			m_queue.push(event_ptr);
		}
	}

	/// frees EventPtr objects in the shared queue
	inline void consume(void) {
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
/// CLFEventPtrAllocTwoThreadTest: tests the performance of creating EventPtr objects that
///                                that contain common log format data in one thread and
///                                deleting them in another thread
///
class CLFEventPtrAllocTwoThreadTest :
	public EventPtrAllocTwoThreadTest
{
public:

	/// default constructor
	CLFEventPtrAllocTwoThreadTest(void) {
		setTestDescription("CLFEventPtrAllocTwoThreadTest");
	}

	/// virtual destructor
	virtual ~CLFEventPtrAllocTwoThreadTest() { stop(); }

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

	// run the EventAllocTest
	test_ptr.reset(new EventAllocTest);
	test_ptr->run();
	
	// run the EventBoostPoolAllocTest
	test_ptr.reset(new EventBoostPoolAllocTest);
	test_ptr->run();
	
#ifdef __GNUC__
	// run the EventGCCPoolAllocTest
	test_ptr.reset(new EventGCCPoolAllocTest);
	test_ptr->run();
#endif

	// run the EventPtrAllocTest
	test_ptr.reset(new EventPtrAllocTest);
	test_ptr->run();
	
	// run the CLFEventPtrAllocTest
	test_ptr.reset(new CLFEventPtrAllocTest);
	test_ptr->run();

	// run the IntAllocTwoThreadTest
	test_ptr.reset(new IntAllocTwoThreadTest);
	test_ptr->run();

	// run the EventPtrAllocTwoThreadTest
	test_ptr.reset(new EventPtrAllocTwoThreadTest);
	test_ptr->run();

	// run the EventBoostPoolAllocTwoThreadTest
	test_ptr.reset(new EventBoostPoolAllocTwoThreadTest);
	test_ptr->run();

#ifdef __GNUC__
	// run the EventGCCPoolAllocTwoThreadTest
	test_ptr.reset(new EventGCCPoolAllocTwoThreadTest);
	test_ptr->run();
#endif

	// run the CLFEventPtrAllocTwoThreadTest
	test_ptr.reset(new CLFEventPtrAllocTwoThreadTest);
	test_ptr->run();
	
	return 0;
}
