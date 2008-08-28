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

#ifndef __PION_COMPARISON_HEADER__
#define __PION_COMPARISON_HEADER__

#include <boost/regex.hpp>
#include <boost/logic/tribool.hpp>
#include <boost/algorithm/string/compare.hpp>
#include <boost/algorithm/string/predicate.hpp>
#include <boost/tuple/tuple.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/Event.hpp>

namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

/// Typedef to return back both success/failure as well as last compared node
typedef boost::tuple<bool, Event::ConstIterator> CompMatch;

///
/// Comparison: used to perform a comparison on the value of a Term
///
class PION_PLATFORM_API Comparison
{
public:

	/// data type representing the type of comparison operation to perform
	enum ComparisonType {
		TYPE_FALSE = 0,						// always false
		TYPE_TRUE,							// always true
		TYPE_IS_DEFINED,					// true if at least one value is defined
		TYPE_IS_NOT_DEFINED,				// true if no values are defined
		// numeric operations
		TYPE_EQUALS,
		TYPE_NOT_EQUALS,
		TYPE_GREATER_THAN,
		TYPE_LESS_THAN,
		TYPE_GREATER_OR_EQUAL,
		TYPE_LESS_OR_EQUAL,
		// string operations
		TYPE_EXACT_MATCH,
		TYPE_NOT_EXACT_MATCH,
		TYPE_CONTAINS,
		TYPE_NOT_CONTAINS,
		TYPE_STARTS_WITH,
		TYPE_NOT_STARTS_WITH,
		TYPE_ENDS_WITH,
		TYPE_NOT_ENDS_WITH,
		TYPE_ORDERED_BEFORE,
		TYPE_NOT_ORDERED_BEFORE,
		TYPE_ORDERED_AFTER,
		TYPE_NOT_ORDERED_AFTER,
		TYPE_REGEX,
		TYPE_NOT_REGEX,
		// date_time operations
		TYPE_SAME_DATE_TIME,
		TYPE_NOT_SAME_DATE_TIME,
		TYPE_EARLIER_DATE_TIME,
		TYPE_LATER_DATE_TIME,
		TYPE_SAME_OR_EARLIER_DATE_TIME,
		TYPE_SAME_OR_LATER_DATE_TIME,
		// date operations
		TYPE_SAME_DATE,
		TYPE_NOT_SAME_DATE,
		TYPE_EARLIER_DATE,
		TYPE_LATER_DATE,
		TYPE_SAME_OR_EARLIER_DATE,
		TYPE_SAME_OR_LATER_DATE,
		// time of day operations
		TYPE_SAME_TIME,
		TYPE_NOT_SAME_TIME,
		TYPE_EARLIER_TIME,
		TYPE_LATER_TIME,
		TYPE_SAME_OR_EARLIER_TIME,
		TYPE_SAME_OR_LATER_TIME,
	};
	
	/// exception thrown if the Comparison type is not recognized
	class UnknownComparisonTypeException : public PionException {
	public:
		UnknownComparisonTypeException(const std::string& comparison_type)
			: PionException("Could not parse unknown comparison type: ", comparison_type) {}
	};

	/// exception thrown if an invalid comparison was evaluated
	class InvalidComparisonException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "An invalid comparison was attempted";
		}
	};

	/// exception thrown if an invalid comparison type is given for a Vocabulary Term
	class InvalidTypeForTermException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "Invalid comparison type given for Vocabulary Term";
		}
	};

	/// exception thrown if an invalid value is given for the type of comparison
	class InvalidValueForTypeException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "Invalid value given for comparison type";
		}
	};
	
	
	/// virtual destructor: you may extend this class
	virtual ~Comparison() {}

	/**
	 * constructs a new Comparison
	 *
	 * @param term the term that will be examined
	 */
	explicit Comparison(const Vocabulary::Term& term)
		: m_term(term), m_type(TYPE_FALSE), m_match_all_values(false)
	{}
	
	/// standard copy constructor
	Comparison(const Comparison& c)
		: m_term(c.m_term), m_type(c.m_type), m_value(c.m_value),
		m_str_value(c.m_str_value), m_regex(c.m_regex),
		m_match_all_values(c.m_match_all_values)
	{}

	
	/**
	 * evaluates the result of the Comparison
	 *
	 * @param e the Event to evaluate
	 *
	 * @return tuple with bool & Event:iterator
	 *			true if the Comparison succeeded; false if it did not
	 *			Iterator points to last compared node
	 */
	inline CompMatch evaluate(const Event& e) const;

	/// Same as evaluate, except returns just the bool for success
	inline bool evaluateBool(const Event& e) const
	{
		return evaluate(e).get<0>();
	}

	/**
	 * configures the Comparison information
	 *
	 * @param the type of Comparison to perform
	 * @param value the value that the Vocabulary Term is compared to
	 * @param match_all_values if true, all values of the Vocabulary Term must match
	 */
	template <typename T>
	inline void configure(const ComparisonType type,
						  const T& value,
						  const bool match_all_values = false);

	/**
	 * configures the Comparison information (alternate form for string comparisons)
	 *
	 * @param the type of Comparison to perform
	 * @param value the value that the Vocabulary Term is compared to
	 * @param match_all_values if true, all values of the Vocabulary Term must match
	 */
	inline void configure(const ComparisonType type, const char *value,
						  const bool match_all_values = false)
	{
		std::string value_str(value);
		configure(type, value_str, match_all_values);
	}
	
	/**
	 * configures the Comparison information (alternate form for string comparisons)
	 *
	 * @param the type of Comparison to perform
	 * @param value the value that the Vocabulary Term is compared to
	 * @param match_all_values if true, all values of the Vocabulary Term must match
	 */
	void configure(const ComparisonType type, const std::string &value,
				   const bool match_all_values = false);

	/**
	 * configures the Comparison information (alternate form comparisons that have not value)
	 *
	 * @param the type of Comparison to perform
	 */
	void configure(const ComparisonType type);
	
	/**
	 * this updates the Vocabulary information used by this Comparison;
	 * it should be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Comparison will use to describe Terms
	 */
	void updateVocabulary(const Vocabulary& v);
	
	
	/// returns the Vocabulary Term to examine
	inline const Vocabulary::Term& getTerm(void) const { return m_term; }
	
	/// returns the type of Comparison that this is
	inline ComparisonType getType(void) const { return m_type; }
	
	/// returns the value that the Vocabulary Term is compared to
	inline const Event::ParameterValue& getValue(void) const { return m_value; }

	/// returns true if all Vocabulary Term values must match
	inline bool getMatchAllValues(void) const { return m_match_all_values; }
	
	
	/**
	 * parses Comparison type from a string
	 *
	 * @param str the string to parse
	 * @return ComparisonType the type matching the parsed string
	 */
	static ComparisonType parseComparisonType(std::string str);
	
	/**
	 * returns a string that represents a particular Comparison type
	 *
	 * @param comparison_type the Comparison type to get a string for
	 * @return std::string a temporary string object that represents the Comparison type
	 */
	static std::string getComparisonTypeAsString(const ComparisonType comparison_type);	

	/// returns true for generic comparison types
	static inline bool isGenericType(ComparisonType t) {
		return (t >= TYPE_FALSE && t <= TYPE_IS_NOT_DEFINED);
	}

	/// returns true for numeric comparison types
	static inline bool isNumericType(ComparisonType t) {
		return (t >= TYPE_EQUALS && t <= TYPE_LESS_OR_EQUAL);
	}

	/// returns true for string comparison types
	static inline bool isStringType(ComparisonType t) {
		return (t >= TYPE_EXACT_MATCH && t <= TYPE_NOT_REGEX);
	}

	/// returns true for date_time comparison types
	static inline bool isDateTimeType(ComparisonType t) {
		// includes date (only) and time (only) comparisons
		return (t >= TYPE_SAME_DATE_TIME && t <= TYPE_SAME_OR_LATER_TIME);
	}

	/// returns true for date comparison types
	static inline bool isDateType(ComparisonType t) {
		return (t >= TYPE_SAME_DATE && t <= TYPE_SAME_OR_LATER_DATE);
	}

	/// returns true for time comparison types
	static inline bool isTimeType(ComparisonType t) {
		return (t >= TYPE_SAME_TIME && t <= TYPE_SAME_OR_LATER_TIME);
	}
	
	
private:
	
	/// helper class used to determine if two numbers are equal
	template <typename T>
	class CompareEquals {
	public:
		CompareEquals(const Event::ParameterValue& value) : m_value(boost::get<const T&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const T&>(event_value) == m_value;
		}
	private:
		const T&	m_value;
	};
	
	/// helper class used to determine if one number is greater than another
	template <typename T>
	class CompareGreaterThan {
	public:
		CompareGreaterThan(const Event::ParameterValue& value) : m_value(boost::get<const T&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const T&>(event_value) > m_value;
		}
	private:
		const T&	m_value;
	};

	/// helper class used to determine if one number is less than another
	template <typename T>
	class CompareLessThan {
	public:
		CompareLessThan(const Event::ParameterValue& value) : m_value(boost::get<const T&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const T&>(event_value) < m_value;
		}
	private:
		const T&	m_value;
	};

	/// helper class used to determine if one number is greater than or equal to another
	template <typename T>
	class CompareGreaterOrEqual {
	public:
		CompareGreaterOrEqual(const Event::ParameterValue& value) : m_value(boost::get<const T&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const T&>(event_value) >= m_value;
		}
	private:
		const T&	m_value;
	};
	
	/// helper class used to determine if one number is less than or equal to another
	template <typename T>
	class CompareLessOrEqual {
	public:
		CompareLessOrEqual(const Event::ParameterValue& value) : m_value(boost::get<const T&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const T&>(event_value) <= m_value;
		}
	private:
		const T&	m_value;
	};

	/// helper class used to determine if one string matches another
	class CompareStringExactMatch {
	public:
		CompareStringExactMatch(const std::string& value) : m_value(value) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return m_value == boost::get<const Event::SimpleString&>(event_value).get();
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if one string contains another
	class CompareStringContains {
	public:
		CompareStringContains(const std::string& value) : m_value(value) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::algorithm::contains(
				boost::get<const Event::SimpleString&>(event_value).get(),
				m_value.c_str());
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if one string starts with another
	class CompareStringStartsWith {
	public:
		CompareStringStartsWith(const std::string& value) : m_value(value) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::algorithm::starts_with(
				boost::get<const Event::SimpleString&>(event_value).get(),
				m_value.c_str());
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if one string ends with another
	class CompareStringEndsWith {
	public:
		CompareStringEndsWith(const std::string& value) : m_value(value) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::algorithm::ends_with(
				boost::get<const Event::SimpleString&>(event_value).get(),
				m_value.c_str());
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if one string is ordered before another
	class CompareStringOrderedBefore {
	public:
		CompareStringOrderedBefore(const std::string& value) : m_value(value) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			boost::algorithm::is_less p;
			return boost::algorithm::lexicographical_compare(
				boost::get<const Event::SimpleString&>(event_value).get(),
				m_value.c_str(), p);
		}
	private:
		const std::string&	m_value;
	};
	
	/// helper class used to determine if one string is ordered after another
	class CompareStringOrderedAfter {
	public:
		CompareStringOrderedAfter(const std::string& value) : m_value(value) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			boost::algorithm::is_less p;
			return boost::algorithm::lexicographical_compare(m_value.c_str(),
				boost::get<const Event::SimpleString&>(event_value).get(), p);
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if a string matches a regular expression
	class CompareStringRegex {
	public:
		CompareStringRegex(const boost::regex& value) : m_regex(value) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			// note: regex_match must match the ENTIRE string; use regex_search
			// instead to match any part of the string
			return boost::regex_search(
				boost::get<const Event::SimpleString&>(event_value).get(), m_regex);
		}
	private:
		const boost::regex&	m_regex;
	};

	/// helper class used to determine if two date_time values are equivalent
	class CompareSameDateTime {
	public:
		CompareSameDateTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value) == m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date_time value is earlier than another
	class CompareEarlierDateTime {
	public:
		CompareEarlierDateTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value) < m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date_time value is later than another
	class CompareLaterDateTime {
	public:
		CompareLaterDateTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value) > m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date_time value is the same as or earlier than another
	class CompareSameOrEarlierDateTime {
	public:
		CompareSameOrEarlierDateTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value) <= m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date_time value is the same as or later than another
	class CompareSameOrLaterDateTime {
	public:
		CompareSameOrLaterDateTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value) >= m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if two dates are equivalent
	class CompareSameDate {
	public:
		CompareSameDate(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).date() == m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date is earlier than another
	class CompareEarlierDate {
	public:
		CompareEarlierDate(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).date() < m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date is later than another
	class CompareLaterDate {
	public:
		CompareLaterDate(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).date() > m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date is the same as or earlier than another
	class CompareSameOrEarlierDate {
	public:
		CompareSameOrEarlierDate(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).date() <= m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date is the same as or later than another
	class CompareSameOrLaterDate {
	public:
		CompareSameOrLaterDate(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).date() >= m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};

	/// helper class used to determine if two times of day are equivalent
	class CompareSameTime {
	public:
		CompareSameTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).time_of_day() == m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one time of day is earlier than another
	class CompareEarlierTime {
	public:
		CompareEarlierTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).time_of_day() < m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one time of day is later than another
	class CompareLaterTime {
	public:
		CompareLaterTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).time_of_day() > m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one time of day is the same as or earlier than another
	class CompareSameOrEarlierTime {
	public:
		CompareSameOrEarlierTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).time_of_day() <= m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one time of day is the same as or later than another
	class CompareSameOrLaterTime {
	public:
		CompareSameOrLaterTime(const Event::ParameterValue& value) : m_value(boost::get<const PionDateTime&>(value)) {}
		inline bool operator()(const Event::ParameterValue& event_value) const {
			return boost::get<const PionDateTime&>(event_value).time_of_day() >= m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	

	/**
	 * checks if a given comparison type is valid for the Vocabulary Term
	 *
	 * @param type the comparison type to check
	 *
	 * @return true if the type is valid for the Vocabulary Term
	 */
	bool checkForValidType(const ComparisonType type) const;
	
	/**
	 * helper function that compares a range of values using the provided function
	 *
	 * @param comparison_func a function used to compare values
	 * @param values_range the range of values to compare
	 *
	 * @return tuple, with bool for success, and Event:Iterator
	 *			true if the comparisons are successful; false if they are not
	 *			Iterator points to the last compared value/node
	 */
	template <typename ComparisonFunction>
	inline CompMatch checkComparison(const ComparisonFunction& comparison_func,
									const Event::ValuesRange& values_range) const;

	/// identifies the Vocabulary Term to examine
	Vocabulary::Term			m_term;
	
	/// identifies what type of Comparison this is
	ComparisonType				m_type;
	
	/// the value that the Vocabulary Term is compared to (if not string or regex type)
	Event::ParameterValue		m_value;
	
	/// the string that the Vocabulary Term is compared to (if string comparison type)
	std::string					m_str_value;

	/// the regex that the Vocabulary Term is compared to (if regex comparison type)
	boost::regex				m_regex;

	/// true if all values for the Vocabulary Term must match
	bool						m_match_all_values;
};



template <typename T>
inline void Comparison::configure(const ComparisonType type,
								  const T& value,
								  const bool match_all_values)
{
	if (! checkForValidType(type))
		throw InvalidTypeForTermException();
	
	m_type = type;
	m_value = value;
	m_match_all_values = match_all_values;
	
	// make sure the value matches the comparison type
	switch (m_term.term_type) {
		case Vocabulary::TYPE_NULL:
		case Vocabulary::TYPE_OBJECT:
			throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_INT8:
		case Vocabulary::TYPE_INT16:
		case Vocabulary::TYPE_INT32:
			if (boost::get<boost::int32_t>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_UINT8:
		case Vocabulary::TYPE_UINT16:
		case Vocabulary::TYPE_UINT32:
			if (boost::get<boost::uint32_t>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_INT64:
			if (boost::get<boost::int64_t>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_UINT64:
			if (boost::get<boost::uint64_t>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_FLOAT:
			if (boost::get<float>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_DOUBLE:
			if (boost::get<double>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_LONG_DOUBLE:
			if (boost::get<long double>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_SHORT_STRING:
		case Vocabulary::TYPE_STRING:
		case Vocabulary::TYPE_LONG_STRING:
		case Vocabulary::TYPE_CHAR:
		case Vocabulary::TYPE_REGEX:
			throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_DATE_TIME:
		case Vocabulary::TYPE_DATE:
		case Vocabulary::TYPE_TIME:
			if (boost::get<PionDateTime>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
	}
}

//************************************************************************************************************************************************

// inline member functions for Comparison

template <typename ComparisonFunction>
inline CompMatch Comparison::checkComparison(const ComparisonFunction& comparison_func,
										const Event::ValuesRange& values_range) const
{
	boost::tribool result = boost::indeterminate;
	Event::ConstIterator value = values_range.second;

	for (Event::ConstIterator i = values_range.first;
		 i != values_range.second; ++i)
	{
		if (comparison_func(i->value)) {
			if (! m_match_all_values) {
				result = true;
				value = i;
				break;
			}
		} else {
			if (m_match_all_values) {
				result = false;
				break;
			}
		}
	}
	
	if (boost::indeterminate(result))
		result = m_match_all_values;
	
	return CompMatch(result, value);
}


/// Macro to negate the bool success value alone
#define PION_NEGATE0(x)		x.get<0>() = ! x.get<0>()
/// Macro to access the bool success value alone
#define PION_RESULT0(x)		x.get<0>()

inline CompMatch Comparison::evaluate(const Event& e) const
{
	/// get a range of iterators representing all the values for the Term
	Event::ValuesRange values_range = e.equal_range(m_term.term_ref);
	Event::ConstIterator value = e.end();
	CompMatch result = CompMatch(false, value);

	
	switch (m_type) {
		case TYPE_FALSE:
			PION_RESULT0(result) = false;
			break;
		case TYPE_TRUE:
			PION_RESULT0(result) = true;
			break;
		case TYPE_IS_DEFINED:
			PION_RESULT0(result) = (values_range.first != values_range.second
				|| (e.getType() == m_term.term_ref) );
			break;
		case TYPE_IS_NOT_DEFINED:
			PION_RESULT0(result) = (values_range.first == values_range.second
				&& (e.getType() != m_term.term_ref) );
			break;

		case TYPE_EQUALS:
		case TYPE_NOT_EQUALS:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_INT8:
				case Vocabulary::TYPE_INT16:
				case Vocabulary::TYPE_INT32:
				{
					CompareEquals<boost::int32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_INT64:
				{
					CompareEquals<boost::int64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT8:
				case Vocabulary::TYPE_UINT16:
				case Vocabulary::TYPE_UINT32:
				{
					CompareEquals<boost::uint32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT64:
				{
					CompareEquals<boost::uint64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_FLOAT:
				{
					CompareEquals<float> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_DOUBLE:
				{
					CompareEquals<double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_LONG_DOUBLE:
				{
					CompareEquals<long double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_EQUALS)
				PION_NEGATE0(result);
			break;
			
		case TYPE_GREATER_THAN:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_INT8:
				case Vocabulary::TYPE_INT16:
				case Vocabulary::TYPE_INT32:
				{
					CompareGreaterThan<boost::int32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_INT64:
				{
					CompareGreaterThan<boost::int64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT8:
				case Vocabulary::TYPE_UINT16:
				case Vocabulary::TYPE_UINT32:
				{
					CompareGreaterThan<boost::uint32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT64:
				{
					CompareGreaterThan<boost::uint64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_FLOAT:
				{
					CompareGreaterThan<float> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_DOUBLE:
				{
					CompareGreaterThan<double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_LONG_DOUBLE:
				{
					CompareGreaterThan<long double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			break;
			
		case TYPE_LESS_THAN:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_INT8:
				case Vocabulary::TYPE_INT16:
				case Vocabulary::TYPE_INT32:
				{
					CompareLessThan<boost::int32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_INT64:
				{
					CompareLessThan<boost::int64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT8:
				case Vocabulary::TYPE_UINT16:
				case Vocabulary::TYPE_UINT32:
				{
					CompareLessThan<boost::uint32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT64:
				{
					CompareLessThan<boost::uint64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_FLOAT:
				{
					CompareLessThan<float> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_DOUBLE:
				{
					CompareLessThan<double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_LONG_DOUBLE:
				{
					CompareLessThan<long double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			break;

		case TYPE_GREATER_OR_EQUAL:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_INT8:
				case Vocabulary::TYPE_INT16:
				case Vocabulary::TYPE_INT32:
				{
					CompareGreaterOrEqual<boost::int32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_INT64:
				{
					CompareGreaterOrEqual<boost::int64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT8:
				case Vocabulary::TYPE_UINT16:
				case Vocabulary::TYPE_UINT32:
				{
					CompareGreaterOrEqual<boost::uint32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT64:
				{
					CompareGreaterOrEqual<boost::uint64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_FLOAT:
				{
					CompareGreaterOrEqual<float> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_DOUBLE:
				{
					CompareGreaterOrEqual<double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_LONG_DOUBLE:
				{
					CompareGreaterOrEqual<long double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			break;

		case TYPE_LESS_OR_EQUAL:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_INT8:
				case Vocabulary::TYPE_INT16:
				case Vocabulary::TYPE_INT32:
				{
					CompareLessOrEqual<boost::int32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_INT64:
				{
					CompareLessOrEqual<boost::int64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT8:
				case Vocabulary::TYPE_UINT16:
				case Vocabulary::TYPE_UINT32:
				{
					CompareLessOrEqual<boost::uint32_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_UINT64:
				{
					CompareLessOrEqual<boost::uint64_t> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_FLOAT:
				{
					CompareLessOrEqual<float> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_DOUBLE:
				{
					CompareLessOrEqual<double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				case Vocabulary::TYPE_LONG_DOUBLE:
				{
					CompareLessOrEqual<long double> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			break;

		case TYPE_EXACT_MATCH:
		case TYPE_NOT_EXACT_MATCH:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringExactMatch comparison_func(m_str_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_EXACT_MATCH)
				PION_NEGATE0(result);
			break;
			
		case TYPE_CONTAINS:
		case TYPE_NOT_CONTAINS:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringContains comparison_func(m_str_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_CONTAINS)
				PION_NEGATE0(result);
			break;

		case TYPE_STARTS_WITH:
		case TYPE_NOT_STARTS_WITH:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringStartsWith comparison_func(m_str_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_STARTS_WITH)
				PION_NEGATE0(result);
			break;

		case TYPE_ENDS_WITH:
		case TYPE_NOT_ENDS_WITH:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringEndsWith comparison_func(m_str_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_ENDS_WITH)
				PION_NEGATE0(result);
			break;

		case TYPE_ORDERED_BEFORE:
		case TYPE_NOT_ORDERED_BEFORE:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringOrderedBefore comparison_func(m_str_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_ORDERED_BEFORE)
				PION_NEGATE0(result);
			break;

		case TYPE_ORDERED_AFTER:
		case TYPE_NOT_ORDERED_AFTER:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringOrderedAfter comparison_func(m_str_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_ORDERED_AFTER)
				PION_NEGATE0(result);
			break;

		case TYPE_REGEX:
		case TYPE_NOT_REGEX:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringRegex comparison_func(m_regex);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_REGEX)
				PION_NEGATE0(result);
			break;
			
		case TYPE_SAME_DATE_TIME:
		case TYPE_NOT_SAME_DATE_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME)
			CompareSameDateTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			if (m_type == TYPE_NOT_SAME_DATE_TIME)
				PION_NEGATE0(result);
			break;
		}
			
		case TYPE_EARLIER_DATE_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME)
			CompareEarlierDateTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_LATER_DATE_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME)
			CompareLaterDateTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_SAME_OR_EARLIER_DATE_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME)
			CompareSameOrEarlierDateTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_SAME_OR_LATER_DATE_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME)
			CompareSameOrLaterDateTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_SAME_DATE:
		case TYPE_NOT_SAME_DATE:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_DATE)
			CompareSameDate comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			if (m_type == TYPE_NOT_SAME_DATE)
				PION_NEGATE0(result);
			break;
		}

		case TYPE_EARLIER_DATE:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_DATE)
			CompareEarlierDate comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_LATER_DATE:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_DATE)
			CompareLaterDate comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_SAME_OR_EARLIER_DATE:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_DATE)
			CompareSameOrEarlierDate comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_SAME_OR_LATER_DATE:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_DATE)
			CompareSameOrLaterDate comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_SAME_TIME:
		case TYPE_NOT_SAME_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_TIME)
			CompareSameTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			if (m_type == TYPE_NOT_SAME_TIME)
				PION_NEGATE0(result);
			break;
		}

		case TYPE_EARLIER_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_TIME)
			CompareEarlierTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
			
		case TYPE_LATER_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_TIME)
			CompareLaterTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}

		case TYPE_SAME_OR_EARLIER_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_TIME)
			CompareSameOrEarlierTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}

		case TYPE_SAME_OR_LATER_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME || m_term.term_type == Vocabulary::TYPE_TIME)
			CompareSameOrLaterTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			break;
		}
	}
	
	return result;
}


}	// end namespace platform
}	// end namespace pion

#endif
