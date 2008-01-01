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
#include <boost/any.hpp>
#include <boost/noncopyable.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionCounter.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// Reactor: used to process Events, and to deliver the same or new Events to other Reactors
///
class Reactor
	: private boost::noncopyable
{
public:

	/// exception thrown if the reactor does not recognize a configuration option
	class UnknownOptionException : public PionException {
	public:
		UnknownOptionException(const std::string& option_name)
			: PionException("Option not recognized by reactor: ", option_name) {}
	};
	

	/// constructs a new Reactor object
	Reactor(void) {}

	/// virtual destructor: this class is meant to be extended
	virtual ~Reactor() {}
	
	/**
	 * send a new Event to this reactor
	 *
	 * @param e pointer to the new Event
	 */
	inline void send(const EventPtr& e) { ++m_events_in; process(e); }
	
	/**
	 * this updates the Vocabulary information used by this Reactor; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v) = 0;

	/**
	 * sets a configuration option
	 *
	 * @param option_name the name of the option to change
	 * @param option_value the value of the option
	 */
	virtual void setOption(const std::string& option_name, const std::string& option_value) {
		throw UnknownOptionException(option_name);
	}
	
	/// called by the ReactorEngine to start Event processing
	virtual void start(void) {}
	
	/// called by the ReactorEngine to stop Event processing
	virtual void stop(void) {}

	/// clears statistic counters for the Reactor
	virtual void clearStats(void) { m_events_in = m_events_out = 0; }
	
	/// resets the Reactor to its initial state
	virtual void reset(void) { clearStats(); }

	/// sets the unique identifier for this Reactor
	inline void setId(const std::string& reactor_id) { m_reactor_id = reactor_id; }

	/// returns the unique identifier for this Reactor
	inline const std::string& getId(void) const { return m_reactor_id; }
	
	/// returns the total number of Events received by this Reactor
	inline unsigned long long getEventsIn(void) const { return m_events_in.getValue(); }
		
	/// returns the total number of Events delivered by this Reactor
	inline unsigned long long getEventsOut(void) const { return m_events_out.getValue(); }

		
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
		boost::mutex::scoped_lock counter_lock(m_mutex);
		for (ReactorList::iterator i = m_output.begin(); i != m_output.end(); ++i) {
			(*i)->send(e);
		}
	}

	
private:

	/// a list of Reactors to which Events may be delivered
	typedef std::list<Reactor*>		ReactorList;
	
	
	/// used to provide thread safety for the Reactor's data structures
	boost::mutex					m_mutex;

	/// a list of other Reactors to which this one delivers Events
	ReactorList						m_output;

	/// uniquely identifies this particular Reactor
	std::string						m_reactor_id;
	
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
