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

#include <queue>
#include <iostream>
#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <boost/cstdint.hpp>
#include <boost/thread/mutex.hpp>
#include <boost/thread/thread.hpp>
#include <boost/thread/condition.hpp>
#include <boost/date_time/posix_time/posix_time_duration.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/PionLockedQueue.hpp>
#include <pion/platform/Event.hpp>

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
	PerformanceTest(const std::string& test_description)
		: m_counter(0), m_last_count(0),
		m_sample_sum(0), m_total_samples(0), m_samples_remaining(30),
		m_count_description("counter"), m_test_description(test_description),
		m_service(), m_timer(m_service), m_is_running(true)
	{
		scheduleSample();
	}
	
	/// virtual destructor -> this class should be extended
	virtual ~PerformanceTest() {}

	/// starts the performance test
	virtual void start(void) = 0;
	
	/// stops the performance test
	virtual void stop(void) { m_is_running = false; }

	/// runs the performance test
	virtual void run(void) {
		std::cout << "Running test: " << m_test_description << std::endl;
		start();
		m_service.run();
	}
	
	/// returns true if the test is running
	inline bool isRunning(void) const { return m_is_running; }

	
protected:

	/// sets a description for the counter
	inline void setCountDescription(const std::string& d) { m_count_description=d; }

	/// sets the number of counter samples remaining
	inline void setSamplesRemaining(const boost::uint32_t n) { m_samples_remaining=n; }

	
	/// the current value of the counter
	boost::uint64_t					m_counter;


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
	const std::string				m_test_description;
	
	/// a service used to schedule counter samples
	boost::asio::io_service			m_service;
	
	/// a timer used to schedule counter samples
	boost::asio::deadline_timer		m_timer;
	
	/// true if the performance test is running
	bool							m_is_running;
};


///
/// EventAllocTest: tests the performance of allocating and freeing EventPtr's
///
class EventAllocTest :
	public PerformanceTest
{
public:

	/// default constructor
	EventAllocTest(void)
		: PerformanceTest("EventAllocTest")
	{
		setCountDescription("allocs");
	}

	/// virtual destructor
	virtual ~EventAllocTest() {
		if (m_count_thread) m_count_thread->join();
	}

	/// starts the performance test
	virtual void start(void) {
		m_count_thread.reset(new boost::thread(boost::bind(&EventAllocTest::countAllocs, this)));
	}

	
private:

	/// counts the creation and deletion of EventPtr objects
	inline void countAllocs(void) {
		while (isRunning()) {
			EventPtr e(new Event(0));
			++m_counter;
		}
	}
	

	/// thread used to create and delete EventPtr objects
	boost::scoped_ptr<boost::thread>	m_count_thread;
};



///
/// EventAllocTwoThreadTest: tests the performance of creating EventPtr objects in one
///                          thread and deleting them in another thread
///
class EventAllocTwoThreadTest :
	public PerformanceTest
{
public:

	/// default constructor
	EventAllocTwoThreadTest(void)
		: PerformanceTest("EventAllocTwoThreadTest")
	{
		setCountDescription("events");
		// block if the queue exceeds 100,000 items
		m_queue.max_size(100000);
	}

	/// virtual destructor
	virtual ~EventAllocTwoThreadTest() {
		if (m_generate_thread) m_generate_thread->join();
		if (m_consumer_thread) m_consumer_thread->join();
	}

	/// starts the performance test
	virtual void start(void) {
		m_generate_thread.reset(new boost::thread(boost::bind(&EventAllocTwoThreadTest::generate, this)));
		m_consumer_thread.reset(new boost::thread(boost::bind(&EventAllocTwoThreadTest::consume, this)));
	}


protected:

	/// creates EventPtr objects and pushes them into a shared queue
	inline void generate(void) {
		while (isRunning()) {
			EventPtr e(new Event(0));
			m_queue.push(e);
		}
	}

	/// frees EventPtr objects in the shared queue
	inline void consume(void) {
		EventPtr event_ptr;
		while (isRunning()) {
			// sleep 1/8 second if the queue is empty
			while (isRunning() && !m_queue.pop(event_ptr)) {
				PionScheduler::sleep(0, 125000000);
			}
			if (! isRunning()) break;
			++m_counter;
		}
	}
	
	
private:

	/// a shared queue of EventPtr objects
	PionLockedQueue<EventPtr>			m_queue;
	
	/// thread used to generate EventPtr objects
	boost::scoped_ptr<boost::thread>	m_generate_thread;

	/// thread used to consume EventPtr objects
	boost::scoped_ptr<boost::thread>	m_consumer_thread;
};


///
/// main control function for Pion performance tests
///
int main(void) {
	boost::scoped_ptr<PerformanceTest> test_ptr;

	// run the EventAllocTest
	test_ptr.reset(new EventAllocTest);
	test_ptr->run();
	
	// run the EventAllocTwoThreadTest
	test_ptr.reset(new EventAllocTwoThreadTest);
	test_ptr->run();
	
	return 0;
}
