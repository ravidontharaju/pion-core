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
#include <boost/intrusive_ptr.hpp>
#include <boost/thread/once.hpp>
#include <boost/detail/atomic_count.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionHashMap.hpp>
#include <pion/PionDateTime.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// Event: an item of structured data that represents something of interest
///
class PION_PLATFORM_API Event
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
		: m_event_type(e.m_event_type), m_parms(e.m_parms), m_references(0)
	{}
	
	/**
	 * constructs a new Event object
	 *
	 * @param type the type of Event that is being created
	 */
	Event(const EventType t)
		: m_event_type(t), m_references(0)
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
		PION_ASSERT(operator[](term_ref).type()==typeid(std::string))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(std::string))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(boost::int32_t))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(boost::int32_t))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(boost::uint32_t))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(boost::uint32_t))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(boost::int64_t))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(boost::int64_t))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(boost::uint64_t))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(boost::uint64_t))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(float))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(float))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(double))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(double))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(long double))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(long double))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(PionDateTime))
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
		PION_ASSERT(operator[](term_ref).type()==typeid(PionDateTime))
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
	inline const ParameterMap& getParameterMap(void) const { return m_parms; }
	
	/// returns the type of Event that this is
	inline EventType getType(void) const { return m_event_type; }

	/// increments the reference count for this Event (for intrusive_ptr only!)
	inline void addReference(void) { ++m_references; }

	/// decrements the reference count for this Event (for intrusive_ptr only!)
	inline boost::uint32_t removeReference(void) { return --m_references; }

	/// clear all data contained within the Event
	inline void clear(void) { m_parms.clear(); }


private:
	
	/// assignment is not permitted
	const Event& operator=(const Event& e);

	
	/// returned if a value for a Term has not been defined
	static const boost::any			NULL_PARAMETER_VALUE;

	/// used to identify what type of Event this is (using Terms of type OBJECT)
	const EventType					m_event_type;
	
	/// event parameters: maps numeric term identifiers to values
	ParameterMap					m_parms;
	
	/// the number of intrusive_ptr references to this Event
	boost::detail::atomic_count		m_references;
};


///
/// EventPtr: data type used for dynamic Event smart pointers
///
class EventPtr :
	public boost::intrusive_ptr<Event>
{
public:
	/// default constructor (public is OK)
	EventPtr(void) {}
	/// copy constructor (public is OK)
	EventPtr(const EventPtr& ptr) : boost::intrusive_ptr<Event>(ptr) {}
	/// reset the pointer to be undefined
	inline void reset(void) { EventPtr temp; swap(temp); }
protected:
	/// protected constructor: only allow EventFactory to create EventPtr objects
	EventPtr(Event *ptr) : boost::intrusive_ptr<Event>(ptr) {}
	/// protect assignment of pointers
	inline EventPtr& operator=(Event *ptr) { boost::intrusive_ptr<Event>::operator=(ptr); return *this; }
	/// only EventFactory can construct new pointers that are not null
	friend class EventFactory;
};

/// data type for a collections of Events
typedef std::list<EventPtr>				EventPtrCollection;
	
	
///
/// EventFactory: used to create and destroy dynamic EventPtr objects
///
class PION_PLATFORM_API EventFactory :
	private boost::noncopyable
{
public:
	
	/// default destructor
	~EventFactory() {}
	
	/**
	 * creates and returns a new EventPtr, a reference-counting smart pointer
	 * that automatically deletes the Event when there are no more references
	 *
	 * @param type the type of Event that is being created
	 */
	static inline EventPtr create(const Event::EventType t) {
		return new Event(t);
	}

	/// destroys an EventPtr; this should only be called by intrusive_ptr_release()
	static inline void destroy(Event *ptr) {
		delete ptr;
	}
	
	
private:
	
	/// private constructor for singleton pattern
	EventFactory(void) {}

	/// creates the singleton instance, protected by boost::call_once
	static void createInstance(void);

	/**
     * return an instance of the EventFactory singleton
	 * 
     * @return EventFactory& instance of EventFactory
	 */
	inline static EventFactory& getInstance(void) {
		boost::call_once(EventFactory::createInstance, m_instance_flag);
		return *m_instance_ptr;
	}


	/// points to the singleton instance after creation
	static EventFactory *			m_instance_ptr;
	
	/// used for thread-safe singleton pattern
	static boost::once_flag			m_instance_flag;
};


/// increments the reference count for an Event (for intrusive_ptr only!)
inline void intrusive_ptr_add_ref(Event *e)
{
	e->addReference();
}

/// decrements the reference count for an Event (for intrusive_ptr only!)
inline void intrusive_ptr_release(Event *e)
{
	if (e->removeReference() == 0)
		EventFactory::destroy(e);
}


}	// end namespace platform
}	// end namespace pion

#endif
