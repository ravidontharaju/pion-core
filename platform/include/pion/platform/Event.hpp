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

#ifndef __PION_EVENT_HEADER__
#define __PION_EVENT_HEADER__

#include <list>
#include <boost/any.hpp>
#include <boost/shared_ptr.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionHashMap.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// Event: an item of structured data that represents something of interest
///
class Event
{
public:

	/// used to identify the type of Event (TermRef maps to Terms of type OBJECT)
	typedef Vocabulary::TermRef		EventType;
	
	/// data type for a map of numeric type identifiers to values
	typedef PION_HASH_MULTIMAP<Vocabulary::TermRef, boost::any>	ParameterMap;

	
	/// virtual destructor: you may extend this class
	virtual ~Event() {}
	
	/// standard copy constructor
	Event(const Event& e)
		: m_vocabulary(e.m_vocabulary), m_event_type(e.m_event_type),
		m_parms(e.m_parms)
	{}
	
	/**
	 * constructs a new Event object
	 *
	 * @param v the Vocabulary that this Event will use to describe Terms
	 * @param type the type of Event that is being created
	 */
	Event(const Vocabulary& v, const EventType t)
		: m_vocabulary(v), m_event_type(t)
	{}
	
	/// adds all the terms from another Event into this one
	inline const Event& operator+=(const Event& e) {
		for (ParameterMap::const_iterator i = e.m_parms.begin();
			 i != e.m_parms.end(); ++i)
		{
			m_parms.insert(*i);
		}
		return *this;
	}
	
	/**
	 * sets the value for a particular term
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	inline void set(const Vocabulary::TermRef& term_ref, const boost::any& value) {
		m_parms.insert(std::make_pair(term_ref, value));
	}

	/**
	 * returns the value for a particular term, or null if it does not exist
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const boost::any* pointer to the value currently assigned to
	 *                           the term (null if not found)
	 */
	inline const boost::any *get(const Vocabulary::TermRef& term_ref) const {
		ParameterMap::const_iterator i = m_parms.find(term_ref);
		return (i==m_parms.end() ? NULL : &(i->second));
	}
	
	/**
	 * returns a reference to the value for a particular term, and adds the term
	 * if it does not already exist
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return boost::any& value currently assigned to the term (may be null)
	 */
	inline boost::any& operator[](const Vocabulary::TermRef& term_ref) {
		ParameterMap::iterator i = m_parms.find(term_ref);
		if (i == m_parms.end())
			i = m_parms.insert(std::make_pair(term_ref, 0));
		return i->second;
	}

	/**
	 * returns a const reference to the value for a particular term
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return boost::any& value currently assigned to the term (may be NULL_PARAMETER_VALUE)
	 */
	inline const boost::any& operator[](const Vocabulary::TermRef& term_ref) const {
		ParameterMap::const_iterator i = m_parms.find(term_ref);
		return((i==m_parms.end()) ? NULL_PARAMETER_VALUE : i->second);
	}
	
	/**
	 * returns true if a Term has at least one definition
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return true if the Term has at least one definition
	 */
	inline bool isDefined(const Vocabulary::TermRef& term_ref) const {
		ParameterMap::const_iterator i = m_parms.find(term_ref);
		return (i != m_parms.end());
	}
	
	/// returns const reference to the parameter map for the Event (for iteration)
	inline const ParameterMap& getParameterMap(void) { return m_parms; }
	
	/// returns the type of Event that this is
	inline EventType getType(void) const { return m_event_type; }


private:
	
	/// assignment is not permitted
	const Event& operator=(const Event& e);

	
	/// returned if a value for a Term has not been defined
	static const boost::any		NULL_PARAMETER_VALUE;

	/// references the Vocabulary used by this Event to describe Terms
	const Vocabulary&			m_vocabulary;
	
	/// used to identify what type of Event this is (using Terms of type OBJECT)
	const EventType				m_event_type;
	
	/// event parameters: maps numeric term identifiers to values
	ParameterMap				m_parms;
};


/// data type used for Event smart pointers
typedef boost::shared_ptr<Event>	EventPtr;

/// data type for a collections of Events
typedef std::list<Event>			EventCollection;

/// data type for a collections of Events
typedef std::list<EventPtr>			EventPtrCollection;
	

}	// end namespace platform
}	// end namespace pion

#endif
