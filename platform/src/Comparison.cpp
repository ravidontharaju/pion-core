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

#include <boost/lexical_cast.hpp>
#include <pion/platform/Comparison.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// Comparison member functions

bool Comparison::checkForValidType(const ComparisonType type) const
{
	bool result = false;
	
	if (isGenericType(type)) {
		// generic comparisons are always valid
		result = true;
	} else {
		switch (m_term.term_type) {
			case Vocabulary::TYPE_NULL:
			case Vocabulary::TYPE_OBJECT:
				result = false;
				break;
			case Vocabulary::TYPE_INT8:
			case Vocabulary::TYPE_UINT8:
			case Vocabulary::TYPE_INT16:
			case Vocabulary::TYPE_UINT16:
			case Vocabulary::TYPE_INT32:
			case Vocabulary::TYPE_UINT32:
			case Vocabulary::TYPE_INT64:
			case Vocabulary::TYPE_UINT64:
			case Vocabulary::TYPE_FLOAT:
			case Vocabulary::TYPE_DOUBLE:
			case Vocabulary::TYPE_LONG_DOUBLE:
				result = isNumericType(type);
				break;
			case Vocabulary::TYPE_SHORT_STRING:
			case Vocabulary::TYPE_STRING:
			case Vocabulary::TYPE_LONG_STRING:
			case Vocabulary::TYPE_CHAR:
			case Vocabulary::TYPE_REGEX:
			case Vocabulary::TYPE_BLOB:
				result = isStringType(type);
				break;
			case Vocabulary::TYPE_DATE_TIME:
				result = isDateTimeType(type);
				break;
			case Vocabulary::TYPE_DATE:
				result = isDateType(type);
				break;
			case Vocabulary::TYPE_TIME:
				result = isTimeType(type);
				break;
		}
	}
	
	return result;
}

void Comparison::configure(const ComparisonType type,
						   const std::string & value,
						   const bool match_all_values)
{
	if (! checkForValidType(type))
		throw InvalidTypeForTermException();
	
	if (type == TYPE_REGEX || type == TYPE_NOT_REGEX) {
		m_regex = value;
	} else if (isStringType(type)) {
		m_str_value = value;
	} else if (! isGenericType(type)) {		// note: generic type just ignores the value
		try {
			// convert string to be the same type as the term
			switch(m_term.term_type) {
				case Vocabulary::TYPE_NULL:
				case Vocabulary::TYPE_OBJECT:
					break;
				case Vocabulary::TYPE_INT8:
				case Vocabulary::TYPE_INT16:
				case Vocabulary::TYPE_INT32:
					m_value = boost::lexical_cast<boost::int32_t>(value);
					break;
				case Vocabulary::TYPE_INT64:
					m_value = boost::lexical_cast<boost::int64_t>(value);
					break;
				case Vocabulary::TYPE_UINT8:
				case Vocabulary::TYPE_UINT16:
				case Vocabulary::TYPE_UINT32:
					m_value = boost::lexical_cast<boost::uint32_t>(value);
					break;
				case Vocabulary::TYPE_UINT64:
					m_value = boost::lexical_cast<boost::uint64_t>(value);
					break;
				case Vocabulary::TYPE_FLOAT:
					m_value = boost::lexical_cast<float>(value);
					break;
				case Vocabulary::TYPE_DOUBLE:
					m_value = boost::lexical_cast<double>(value);
					break;
				case Vocabulary::TYPE_LONG_DOUBLE:
					m_value = boost::lexical_cast<long double>(value);
					break;
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
				case Vocabulary::TYPE_REGEX:
				case Vocabulary::TYPE_BLOB:
					m_str_value = value;	// this should actually be handled above
					break;
				case Vocabulary::TYPE_DATE_TIME:
				case Vocabulary::TYPE_DATE:
				case Vocabulary::TYPE_TIME:
					//m_value = boost::lexical_cast<PionDateTime>(value);
					PionTimeFacet f(m_term.term_format);
					m_value = f.fromString(value);
					break;
			}
		} catch (...) {
			throw InvalidValueForTypeException();
		}
	}
	
	m_type = type;
	m_match_all_values = match_all_values;
}

void Comparison::configure(const ComparisonType type)
{
	if (! checkForValidType(type))
		throw InvalidTypeForTermException();
	if (! isGenericType(type))
		throw InvalidValueForTypeException();
	
	m_type = type;
	m_value = Event::ParameterValue();
	m_match_all_values = false;
}
	
void Comparison::updateVocabulary(const Vocabulary& v)
{
	// assume that Term references never change
	m_term = v[m_term.term_ref];
}

Comparison::ComparisonType Comparison::parseComparisonType(std::string str)
{
	// convert to lowercase
	for (std::string::iterator i=str.begin(); i!=str.end(); ++i)
		if (isupper(*i)) *i = tolower(*i);
	
	// parse str
	
	if (str == "false")
		return TYPE_FALSE;
	else if (str == "true")
		return TYPE_TRUE;
	else if (str == "is-defined")
		return TYPE_IS_DEFINED;
	else if (str == "is-not-defined")
		return TYPE_IS_NOT_DEFINED;
	else if (str == "equals")
		return TYPE_EQUALS;
	else if (str == "not-equals")
		return TYPE_NOT_EQUALS;
	else if (str == "greater-than")
		return TYPE_GREATER_THAN;
	else if (str == "less-than")
		return TYPE_LESS_THAN;
	else if (str == "greater-or-equal")
		return TYPE_GREATER_OR_EQUAL;
	else if (str == "less-or-equal")
		return TYPE_LESS_OR_EQUAL;
	else if (str == "exact-match")
		return TYPE_EXACT_MATCH;
	else if (str == "not-exact-match")
		return TYPE_NOT_EXACT_MATCH;
	else if (str == "contains")
		return TYPE_CONTAINS;
	else if (str == "not-contains")
		return TYPE_NOT_CONTAINS;
	else if (str == "starts-with")
		return TYPE_STARTS_WITH;
	else if (str == "not-starts-with")
		return TYPE_NOT_STARTS_WITH;
	else if (str == "ends-with")
		return TYPE_ENDS_WITH;
	else if (str == "not-ends-with")
		return TYPE_NOT_ENDS_WITH;
	else if (str == "ordered-before")
		return TYPE_ORDERED_BEFORE;
	else if (str == "not-ordered-before")
		return TYPE_NOT_ORDERED_BEFORE;
	else if (str == "ordered-after")
		return TYPE_ORDERED_AFTER;
	else if (str == "not-ordered-after")
		return TYPE_NOT_ORDERED_AFTER;
	else if (str == "regex")
		return TYPE_REGEX;
	else if (str == "not-regex")
		return TYPE_NOT_REGEX;
	else if (str == "same-date-time")
		return TYPE_SAME_DATE_TIME;
	else if (str == "not-same-date-time")
		return TYPE_NOT_SAME_DATE_TIME;
	else if (str == "earlier-date-time")
		return TYPE_EARLIER_DATE_TIME;
	else if (str == "later-date-time")
		return TYPE_LATER_DATE_TIME;
	if (str == "same-or-earlier-date-time")
		return TYPE_SAME_OR_EARLIER_DATE_TIME;
	if (str == "same-or-later-date-time")
		return TYPE_SAME_OR_LATER_DATE_TIME;
	if (str == "same-date")
		return TYPE_SAME_DATE;
	if (str == "not-same-date")
		return TYPE_NOT_SAME_DATE;
	if (str == "earlier-date")
		return TYPE_EARLIER_DATE;
	if (str == "later-date")
		return TYPE_LATER_DATE;
	if (str == "same-or-earlier-date")
		return TYPE_SAME_OR_EARLIER_DATE;
	if (str == "same-or-later-date")
		return TYPE_SAME_OR_LATER_DATE;
	if (str == "same-time")
		return TYPE_SAME_TIME;
	if (str == "not-same-time")
		return TYPE_NOT_SAME_TIME;
	if (str == "earlier-time")
		return TYPE_EARLIER_TIME;
	if (str == "later-time")
		return TYPE_LATER_TIME;
	if (str == "same-or-earlier-time")
		return TYPE_SAME_OR_EARLIER_TIME;
	if (str == "same-or-later-time")
		return TYPE_SAME_OR_LATER_TIME;
	
	throw UnknownComparisonTypeException(str);
}
	
std::string Comparison::getComparisonTypeAsString(const ComparisonType comparison_type)
{
	std::string str;
	switch(comparison_type) {
		case TYPE_FALSE:
			str = "false";
			break;
		case TYPE_TRUE:
			str = "true";
			break;
		case TYPE_IS_DEFINED:
			str = "is-defined";
			break;
		case TYPE_IS_NOT_DEFINED:
			str = "is-not-defined";
			break;
		case TYPE_EQUALS:
			str = "equals";
			break;
		case TYPE_NOT_EQUALS:
			str = "not-equals";
			break;
		case TYPE_GREATER_THAN:
			str = "greater-than";
			break;
		case TYPE_LESS_THAN:
			str = "less-than";
			break;
		case TYPE_GREATER_OR_EQUAL:
			str = "greater-or-equal";
			break;
		case TYPE_LESS_OR_EQUAL:
			str = "less-or-equal";
			break;
		case TYPE_EXACT_MATCH:
			str = "exact-match";
			break;
		case TYPE_NOT_EXACT_MATCH:
			str = "not-exact-match";
			break;
		case TYPE_CONTAINS:
			str = "contains";
			break;
		case TYPE_NOT_CONTAINS:
			str = "not-contains";
			break;
		case TYPE_STARTS_WITH:
			str = "starts-with";
			break;
		case TYPE_NOT_STARTS_WITH:
			str = "not-starts-with";
			break;
		case TYPE_ENDS_WITH:
			str = "ends-with";
			break;
		case TYPE_NOT_ENDS_WITH:
			str = "not-ends-with";
			break;
		case TYPE_ORDERED_BEFORE:
			str = "ordered-before";
			break;
		case TYPE_NOT_ORDERED_BEFORE:
			str = "not-ordered-before";
			break;
		case TYPE_ORDERED_AFTER:
			str = "ordered-after";
			break;
		case TYPE_NOT_ORDERED_AFTER:
			str = "not-ordered-after";
			break;
		case TYPE_REGEX:
			str = "regex";
			break;
		case TYPE_NOT_REGEX:
			str = "not-regex";
			break;
		case TYPE_SAME_DATE_TIME:
			str = "same-date-time";
			break;
		case TYPE_NOT_SAME_DATE_TIME:
			str = "not-same-date-time";
			break;
		case TYPE_EARLIER_DATE_TIME:
			str = "earlier-date-time";
			break;
		case TYPE_LATER_DATE_TIME:
			str = "later-date-time";
			break;
		case TYPE_SAME_OR_EARLIER_DATE_TIME:
			str = "same-or-earlier-date-time";
			break;
		case TYPE_SAME_OR_LATER_DATE_TIME:
			str = "same-or-later-date-time";
			break;
		case TYPE_SAME_DATE:
			str = "same-date";
			break;
		case TYPE_NOT_SAME_DATE:
			str = "not-same-date";
			break;
		case TYPE_EARLIER_DATE:
			str = "earlier-date";
			break;
		case TYPE_LATER_DATE:
			str = "later-date";
			break;
		case TYPE_SAME_OR_EARLIER_DATE:
			str = "same-or-earlier-date";
			break;
		case TYPE_SAME_OR_LATER_DATE:
			str = "same-or-later-date";
			break;
		case TYPE_SAME_TIME:
			str = "same-time";
			break;
		case TYPE_NOT_SAME_TIME:
			str = "not-same-time";
			break;
		case TYPE_EARLIER_TIME:
			str = "earlier-time";
			break;
		case TYPE_LATER_TIME:
			str = "later-time";
			break;
		case TYPE_SAME_OR_EARLIER_TIME:
			str = "same-or-earlier-time";
			break;
		case TYPE_SAME_OR_LATER_TIME:
			str = "same-or-later-time";
			break;
	}
	return str;
}
	
	
}	// end namespace platform
}	// end namespace pion
