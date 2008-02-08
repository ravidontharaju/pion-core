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

#include <boost/any.hpp>
#include <boost/regex.hpp>
#include <boost/logic/tribool.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/Event.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


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
		m_match_all_values(c.m_match_all_values)
	{}

	
	/**
	 * evaluates the result of the Comparison
	 *
	 * @param e the Event to evaluate
	 *
	 * @return true if the Comparison succeeded; false if it did not
	 */
	inline bool evaluate(const Event& e) const;

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
	inline const boost::any& getValue(void) const { return m_value; }

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
		CompareEquals(const boost::any& value) : m_value(boost::any_cast<const T&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const T&>(event_value) == m_value;
		}
	private:
		const T&	m_value;
	};
	
	/// helper class used to determine if one number is greater than another
	template <typename T>
	class CompareGreaterThan {
	public:
		CompareGreaterThan(const boost::any& value) : m_value(boost::any_cast<const T&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const T&>(event_value) > m_value;
		}
	private:
		const T&	m_value;
	};

	/// helper class used to determine if one number is less than another
	template <typename T>
	class CompareLessThan {
	public:
		CompareLessThan(const boost::any& value) : m_value(boost::any_cast<const T&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const T&>(event_value) < m_value;
		}
	private:
		const T&	m_value;
	};

	/// helper class used to determine if one number is greater than or equal to another
	template <typename T>
	class CompareGreaterOrEqual {
	public:
		CompareGreaterOrEqual(const boost::any& value) : m_value(boost::any_cast<const T&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const T&>(event_value) >= m_value;
		}
	private:
		const T&	m_value;
	};
	
	/// helper class used to determine if one number is less than or equal to another
	template <typename T>
	class CompareLessOrEqual {
	public:
		CompareLessOrEqual(const boost::any& value) : m_value(boost::any_cast<const T&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const T&>(event_value) <= m_value;
		}
	private:
		const T&	m_value;
	};

	/// helper class used to determine if one string contains another
	class CompareStringContains {
	public:
		CompareStringContains(const boost::any& value) : m_value(boost::any_cast<const std::string&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const std::string&>(event_value).find(m_value) != std::string::npos;
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if one string starts with another
	class CompareStringStartsWith {
	public:
		CompareStringStartsWith(const boost::any& value) : m_value(boost::any_cast<const std::string&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return (boost::any_cast<const std::string&>(event_value).size() >= m_value.size()
					&& boost::any_cast<const std::string&>(event_value).substr(0, m_value.size()) == m_value);
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if one string ends with another
	class CompareStringEndsWith {
	public:
		CompareStringEndsWith(const boost::any& value) : m_value(boost::any_cast<const std::string&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return (boost::any_cast<const std::string&>(event_value).size() >= m_value.size()
					&& boost::any_cast<const std::string&>(event_value).substr((boost::any_cast<const std::string&>(event_value).size() - m_value.size()),
																			   m_value.size()) == m_value);
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if one string is ordered before another
	class CompareStringOrderedBefore {
	public:
		CompareStringOrderedBefore(const boost::any& value) : m_value(boost::any_cast<const std::string&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const std::string&>(event_value).compare(m_value) < 0;
		}
	private:
		const std::string&	m_value;
	};
	
	/// helper class used to determine if one string is ordered after another
	class CompareStringOrderedAfter {
	public:
		CompareStringOrderedAfter(const boost::any& value) : m_value(boost::any_cast<const std::string&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const std::string&>(event_value).compare(m_value) > 0;
		}
	private:
		const std::string&	m_value;
	};

	/// helper class used to determine if a string matches a regular expression
	class CompareStringRegex {
	public:
		CompareStringRegex(const boost::any& value) : m_regex(boost::any_cast<const boost::regex&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::regex_match(boost::any_cast<const std::string&>(event_value), m_regex);
		}
	private:
		const boost::regex&	m_regex;
	};

	/// helper class used to determine if two date_time values are equivalent
	class CompareSameDateTime {
	public:
		CompareSameDateTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value) == m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date_time value is earlier than another
	class CompareEarlierDateTime {
	public:
		CompareEarlierDateTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value) < m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date_time value is later than another
	class CompareLaterDateTime {
	public:
		CompareLaterDateTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value) > m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date_time value is the same as or earlier than another
	class CompareSameOrEarlierDateTime {
	public:
		CompareSameOrEarlierDateTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value) <= m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date_time value is the same as or later than another
	class CompareSameOrLaterDateTime {
	public:
		CompareSameOrLaterDateTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value) >= m_value;
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if two dates are equivalent
	class CompareSameDate {
	public:
		CompareSameDate(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).date() == m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date is earlier than another
	class CompareEarlierDate {
	public:
		CompareEarlierDate(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).date() < m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date is later than another
	class CompareLaterDate {
	public:
		CompareLaterDate(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).date() > m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date is the same as or earlier than another
	class CompareSameOrEarlierDate {
	public:
		CompareSameOrEarlierDate(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).date() <= m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one date is the same as or later than another
	class CompareSameOrLaterDate {
	public:
		CompareSameOrLaterDate(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).date() >= m_value.date();
		}
	private:
		const PionDateTime&	m_value;
	};

	/// helper class used to determine if two times of day are equivalent
	class CompareSameTime {
	public:
		CompareSameTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).time_of_day() == m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one time of day is earlier than another
	class CompareEarlierTime {
	public:
		CompareEarlierTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).time_of_day() < m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one time of day is later than another
	class CompareLaterTime {
	public:
		CompareLaterTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).time_of_day() > m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one time of day is the same as or earlier than another
	class CompareSameOrEarlierTime {
	public:
		CompareSameOrEarlierTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).time_of_day() <= m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// helper class used to determine if one time of day is the same as or later than another
	class CompareSameOrLaterTime {
	public:
		CompareSameOrLaterTime(const boost::any& value) : m_value(boost::any_cast<const PionDateTime&>(value)) {}
		inline bool operator()(const boost::any& event_value) const {
			return boost::any_cast<const PionDateTime&>(event_value).time_of_day() >= m_value.time_of_day();
		}
	private:
		const PionDateTime&	m_value;
	};
	
	/// data type for a range of values assigned to a Vocabulary Term
	typedef std::pair<Event::ParameterMap::const_iterator, Event::ParameterMap::const_iterator>		ValuesRange;
	

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
	 * @return true if the comparisons are successful; false if they are not
	 */
	template <typename ComparisonFunction>
	inline bool checkComparison(const ComparisonFunction& comparison_func,
								const ValuesRange& values_range) const;
		
	
	/// identifies the Vocabulary Term to examine
	Vocabulary::Term			m_term;
	
	/// identifies what type of Comparison this is
	ComparisonType				m_type;
	
	/// the value that the Vocabulary Term is compared to
	boost::any					m_value;

	/// true if all values for the Vocabulary Term must match
	bool						m_match_all_values;
};

	
// inline member functions for Comparison
	
template <typename ComparisonFunction>
inline bool Comparison::checkComparison(const ComparisonFunction& comparison_func,
										const ValuesRange& values_range) const
{
	boost::tribool result = boost::indeterminate;

	for (Event::ParameterMap::const_iterator i = values_range.first;
		 i != values_range.second; ++i)
	{
		if (comparison_func(i->second)) {
			if (! m_match_all_values) {
				result = true;
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
	
	return result;
}

inline bool Comparison::evaluate(const Event& e) const
{
	/// get a range of iterators representing all the values for the Term
	std::pair<Event::ParameterMap::const_iterator, Event::ParameterMap::const_iterator>
		values_range = e.getParameterMap().equal_range(m_term.term_ref);
	
	bool result = false;
	
	switch (m_type) {
		case TYPE_FALSE:
			result = false;
			break;
		case TYPE_TRUE:
			result = true;
			break;
		case TYPE_IS_DEFINED:
			result = (values_range.first != e.getParameterMap().end());
			break;
		case TYPE_IS_NOT_DEFINED:
			result = (values_range.first == e.getParameterMap().end());
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
				result = ! result;
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
					CompareEquals<std::string> comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_EXACT_MATCH)
				result = ! result;
			break;
			
		case TYPE_CONTAINS:
		case TYPE_NOT_CONTAINS:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringContains comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_CONTAINS)
				result = ! result;
			break;

		case TYPE_STARTS_WITH:
		case TYPE_NOT_STARTS_WITH:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringStartsWith comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_STARTS_WITH)
				result = ! result;
			break;

		case TYPE_ENDS_WITH:
		case TYPE_NOT_ENDS_WITH:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringEndsWith comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_ENDS_WITH)
				result = ! result;
			break;

		case TYPE_ORDERED_BEFORE:
		case TYPE_NOT_ORDERED_BEFORE:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringOrderedBefore comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_ORDERED_BEFORE)
				result = ! result;
			break;

		case TYPE_ORDERED_AFTER:
		case TYPE_NOT_ORDERED_AFTER:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringOrderedAfter comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_ORDERED_AFTER)
				result = ! result;
			break;

		case TYPE_REGEX:
		case TYPE_NOT_REGEX:
			switch (m_term.term_type) {
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				{
					CompareStringRegex comparison_func(m_value);
					result = checkComparison(comparison_func, values_range);
					break;
				}
				default:
					throw InvalidComparisonException();
			}
			if (m_type == TYPE_NOT_REGEX)
				result = ! result;
			break;
			
		case TYPE_SAME_DATE_TIME:
		case TYPE_NOT_SAME_DATE_TIME:
		{
			PION_ASSERT(m_term.term_type == Vocabulary::TYPE_DATE_TIME)
			CompareSameDateTime comparison_func(m_value);
			result = checkComparison(comparison_func, values_range);
			if (m_type == TYPE_NOT_SAME_DATE_TIME)
				result = ! result;
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
				result = ! result;
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
				result = ! result;
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
			if (boost::any_cast<boost::int32_t>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_UINT8:
		case Vocabulary::TYPE_UINT16:
		case Vocabulary::TYPE_UINT32:
			if (boost::any_cast<boost::uint32_t>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_INT64:
			if (boost::any_cast<boost::int64_t>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_UINT64:
			if (boost::any_cast<boost::uint64_t>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_FLOAT:
			if (boost::any_cast<float>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_DOUBLE:
			if (boost::any_cast<double>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_LONG_DOUBLE:
			if (boost::any_cast<long double>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
		case Vocabulary::TYPE_SHORT_STRING:
		case Vocabulary::TYPE_STRING:
		case Vocabulary::TYPE_LONG_STRING:
		case Vocabulary::TYPE_CHAR:
			if (type == TYPE_REGEX || type == TYPE_NOT_REGEX) {
				if (boost::any_cast<boost::regex>(&m_value) == NULL)
					throw InvalidValueForTypeException();
			} else {
				if (boost::any_cast<std::string>(&m_value) == NULL)
					throw InvalidValueForTypeException();
			}
			break;
		case Vocabulary::TYPE_DATE_TIME:
		case Vocabulary::TYPE_DATE:
		case Vocabulary::TYPE_TIME:
			if (boost::any_cast<PionDateTime>(&m_value) == NULL)
				throw InvalidValueForTypeException();
			break;
	}
}


}	// end namespace platform
}	// end namespace pion

#endif
