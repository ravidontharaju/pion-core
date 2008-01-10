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
#include <pion/PionDateTime.hpp>
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
	Event(const Event& e) : m_event_type(e.m_event_type), m_parms(e.m_parms) {}
	
	/**
	 * constructs a new Event object
	 *
	 * @param type the type of Event that is being created
	 */
	Event(const EventType t) : m_event_type(t) {}
	
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
	 * returns a reference to the value for a particular term, and adds the term
	 * if it does not already exist
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return boost::any& value currently assigned to the term (may be null)
	 */
	inline boost::any& operator[](const Vocabulary::TermRef& term_ref) {
		ParameterMap::iterator i = m_parms.find(term_ref);
		if (i == m_parms.end())
			i = m_parms.insert(std::make_pair(term_ref, NULL_PARAMETER_VALUE));
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
	 * returns the value for a particular term, or null if it does not exist
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const boost::any* pointer to the value currently assigned to
	 *                           the term (null if not found)
	 */
	inline const boost::any *getPointer(const Vocabulary::TermRef& term_ref) const {
		ParameterMap::const_iterator i = m_parms.find(term_ref);
		return (i==m_parms.end() ? NULL : &(i->second));
	}
	
	/**
	 * shorthand for retrieving the (const) value of a string field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const std::string& the value of the field
	 */
	inline const std::string& getString(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const std::string&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the value of a string field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return std::string& the value of the field
	 */
	inline std::string& getString(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<std::string&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the (const) value of an integer field;
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const std::string& the value of the field
	 */
	inline const boost::int32_t& getInt(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const boost::int32_t&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the value of an integer field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return std::string& the value of the field
	 */
	inline boost::int32_t& getInt(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<boost::int32_t&>(operator[](term_ref));
	}

	/**
	 * shorthand for retrieving the (const) value of an unsigned integer field;
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const std::string& the value of the field
	 */
	inline const boost::uint32_t& getUInt(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const boost::uint32_t&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the value of an unsigned integer field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return std::string& the value of the field
	 */
	inline boost::uint32_t& getUInt(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<boost::uint32_t&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the (const) value of a big integer field;
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const std::string& the value of the field
	 */
	inline const boost::int64_t& getBigInt(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const boost::int64_t&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the value of a big integer field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return std::string& the value of the field
	 */
	inline boost::int64_t& getBigInt(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<boost::int64_t&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the (const) value of an unsigned big integer field;
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const std::string& the value of the field
	 */
	inline const boost::uint64_t& getUBigInt(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const boost::uint64_t&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the value of an unsigned big integer field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return std::string& the value of the field
	 */
	inline boost::uint64_t& getUBigInt(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<boost::uint64_t&>(operator[](term_ref));
	}

	/**
	 * shorthand for retrieving the (const) value of a floating point number field;
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const float& the value of the field
	 */
	inline const float& getFloat(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const float&>(operator[](term_ref));
	}

	/**
	 * shorthand for retrieving the value of a floating point number field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return float& the value of the field
	 */
	inline float& getFloat(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<float&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the (const) value of a double floating point number field;
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const double& the value of the field
	 */
	inline const double& getDouble(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const double&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the value of a double floating point number field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return double& the value of the field
	 */
	inline double& getDouble(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<double&>(operator[](term_ref));
	}

	/**
	 * shorthand for retrieving the (const) value of a long double floating point number field;
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const long double& the value of the field
	 */
	inline const long double& getLongDouble(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const long double&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the value of a long double floating point number field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return double& the value of the field
	 */
	inline long double& getLongDouble(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<long double&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the (const) value date_time field;
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return const PionDateTime& the value of the field
	 */
	inline const PionDateTime& getDateTime(const Vocabulary::TermRef& term_ref) const {
		return boost::any_cast<const PionDateTime&>(operator[](term_ref));
	}
	
	/**
	 * shorthand for retrieving the value of a date_time field; 
	 * will throw a bad_any_cast exception if the term is not defined
	 * 
	 * @param term_ref numeric identifier for the term
	 * @return PionDateTime& the value of the field
	 */
	inline PionDateTime& getDateTime(const Vocabulary::TermRef& term_ref) {
		return boost::any_cast<PionDateTime&>(operator[](term_ref));
	}

	/**
	 * sets the value for a particular term to a string using a character array
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	inline void setString(const Vocabulary::TermRef& term_ref, const char *value) {
		std::string str(value);
		m_parms.insert(std::make_pair(term_ref, boost::any(str)));
	}
	
	/**
	 * sets the value for a particular term to a string using a character array
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	inline void setString(const Vocabulary::TermRef& term_ref, const std::string& value) {
		m_parms.insert(std::make_pair(term_ref, value));
	}
	
	/**
	 * sets the value for a particular term to an integer
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	template <typename T>
	inline void setInt(const Vocabulary::TermRef& term_ref, T value) {
		m_parms.insert(std::make_pair(term_ref, boost::int32_t(value)));
	}

	/**
	 * sets the value for a particular term to an unsigned integer
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	template <typename T>
	inline void setUInt(const Vocabulary::TermRef& term_ref, T value) {
		m_parms.insert(std::make_pair(term_ref, boost::uint32_t(value)));
	}
	
	/**
	 * sets the value for a particular term to a big integer
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	template <typename T>
	inline void setBigInt(const Vocabulary::TermRef& term_ref, T value) {
		m_parms.insert(std::make_pair(term_ref, boost::int64_t(value)));
	}
	
	/**
	 * sets the value for a particular term to an unsigned big integer
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	template <typename T>
	inline void setUBigInt(const Vocabulary::TermRef& term_ref, T value) {
		m_parms.insert(std::make_pair(term_ref, boost::uint64_t(value)));
	}
	
	/**
	 * sets the value for a particular term to a floating point number
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	inline void setFloat(const Vocabulary::TermRef& term_ref, const float value) {
		m_parms.insert(std::make_pair(term_ref, value));
	}
	
	/**
	 * sets the value for a particular term to a double floating point number
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	inline void setDouble(const Vocabulary::TermRef& term_ref, const double value) {
		m_parms.insert(std::make_pair(term_ref, value));
	}

	/**
	 * sets the value for a particular term to a long double floating point number
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	inline void setLongDouble(const Vocabulary::TermRef& term_ref, const long double value) {
		m_parms.insert(std::make_pair(term_ref, value));
	}
	
	/**
	 * sets the value for a particular term to a date_time value
	 *
	 * @param term_ref numeric identifier for the term
	 * @param value new value assigned to the term
	 */
	inline void setDateTime(const Vocabulary::TermRef& term_ref, const PionDateTime& value) {
		m_parms.insert(std::make_pair(term_ref, value));
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
	
	/// clear all data contained within the Event
	inline void clear(void) { m_parms.clear(); }


private:
	
	/// assignment is not permitted
	const Event& operator=(const Event& e);

	
	/// returned if a value for a Term has not been defined
	static const boost::any		NULL_PARAMETER_VALUE;

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
