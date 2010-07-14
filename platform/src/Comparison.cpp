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
#include <boost/static_assert.hpp>
#include <pion/platform/Comparison.hpp>
#include <unicode/coll.h>
#include <unicode/ustring.h>
#include <unicode/stsearch.h>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


struct comparison_info {
	Comparison::ComparisonType	type;		// must equal the index, i.e. comparison_table[i].type == i
	const char*					name;		// Comparison term in UI
	boost::uint8_t				arity;		// how many arguments
	bool						is_generic;					// is the comparison applicable to any type of Term
	bool						applies_to_numeric_terms;	// is the comparison applicable to Terms of category numeric
	bool						applies_to_string_terms;	// is the comparison applicable to Terms of category string
	bool						applies_to_date_time_terms;	// is the comparison applicable to Terms of category date_time
	bool						applies_to_date_terms;		// is the comparison applicable to Terms of category date
	bool						applies_to_time_terms;		// is the comparison applicable to Terms of category time
};

const comparison_info comparison_table[] = {
	{ Comparison::TYPE_FALSE,                     "false",                     1, true, true, true, true, true, true },
	{ Comparison::TYPE_TRUE,                      "true",                      1, true, true, true, true, true, true },
	{ Comparison::TYPE_IS_DEFINED,                "is-defined",                1, true, true, true, true, true, true },
	{ Comparison::TYPE_IS_NOT_DEFINED,            "is-not-defined",            1, true, true, true, true, true, true },

	{ Comparison::TYPE_EQUALS,                    "equals",                    2, false, true, false, false, false, false },
	{ Comparison::TYPE_NOT_EQUALS,                "not-equals",                2, false, true, false, false, false, false },
	{ Comparison::TYPE_GREATER_THAN,              "greater-than",              2, false, true, false, false, false, false },
	{ Comparison::TYPE_LESS_THAN,                 "less-than",                 2, false, true, false, false, false, false },
	{ Comparison::TYPE_GREATER_OR_EQUAL,          "greater-or-equal",          2, false, true, false, false, false, false },
	{ Comparison::TYPE_LESS_OR_EQUAL,             "less-or-equal",             2, false, true, false, false, false, false },

	{ Comparison::TYPE_EXACT_MATCH,               "exact-match",               2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_EXACT_MATCH,           "not-exact-match",           2, false, false, true, false, false, false },
	{ Comparison::TYPE_CONTAINS,                  "contains",                  2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_CONTAINS,              "not-contains",              2, false, false, true, false, false, false },
	{ Comparison::TYPE_STARTS_WITH,               "starts-with",               2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_STARTS_WITH,           "not-starts-with",           2, false, false, true, false, false, false },
	{ Comparison::TYPE_ENDS_WITH,                 "ends-with",                 2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_ENDS_WITH,             "not-ends-with",             2, false, false, true, false, false, false },
	{ Comparison::TYPE_ORDERED_BEFORE,            "ordered-before",            2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_ORDERED_BEFORE,        "not-ordered-before",        2, false, false, true, false, false, false },
	{ Comparison::TYPE_ORDERED_AFTER,             "ordered-after",             2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_ORDERED_AFTER,         "not-ordered-after",         2, false, false, true, false, false, false },
	{ Comparison::TYPE_REGEX,                     "regex",                     2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_REGEX,                 "not-regex",                 2, false, false, true, false, false, false },

	{ Comparison::TYPE_EXACT_MATCH_PRIMARY,       "exact-match-primary",       2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_EXACT_MATCH_PRIMARY,   "not-exact-match-primary",   2, false, false, true, false, false, false },
	{ Comparison::TYPE_CONTAINS_PRIMARY,          "contains-primary",          2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_CONTAINS_PRIMARY,      "not-contains-primary",      2, false, false, true, false, false, false },
	{ Comparison::TYPE_STARTS_WITH_PRIMARY,       "starts-with-primary",       2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_STARTS_WITH_PRIMARY,   "not-starts-with-primary",   2, false, false, true, false, false, false },
	{ Comparison::TYPE_ENDS_WITH_PRIMARY,         "ends-with-primary",         2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_ENDS_WITH_PRIMARY,     "not-ends-with-primary",     2, false, false, true, false, false, false },
	{ Comparison::TYPE_ORDERED_BEFORE_PRIMARY,    "ordered-before-primary",    2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_ORDERED_BEFORE_PRIMARY,"not-ordered-before-primary",2, false, false, true, false, false, false },
	{ Comparison::TYPE_ORDERED_AFTER_PRIMARY,     "ordered-after-primary",     2, false, false, true, false, false, false },
	{ Comparison::TYPE_NOT_ORDERED_AFTER_PRIMARY, "not-ordered-after-primary", 2, false, false, true, false, false, false },

	{ Comparison::TYPE_SAME_DATE_TIME,            "same-date-time",            2, false, false, false, true, false, false },
	{ Comparison::TYPE_NOT_SAME_DATE_TIME,        "not-same-date-time",        2, false, false, false, true, false, false },
	{ Comparison::TYPE_EARLIER_DATE_TIME,         "earlier-date-time",         2, false, false, false, true, false, false },
	{ Comparison::TYPE_LATER_DATE_TIME,           "later-date-time",           2, false, false, false, true, false, false },
	{ Comparison::TYPE_SAME_OR_EARLIER_DATE_TIME, "same-or-earlier-date-time", 2, false, false, false, true, false, false },
	{ Comparison::TYPE_SAME_OR_LATER_DATE_TIME,   "same-or-later-date-time",   2, false, false, false, true, false, false },

	{ Comparison::TYPE_SAME_DATE,                 "same-date",                 2, false, false, false, true, true, false },
	{ Comparison::TYPE_NOT_SAME_DATE,             "not-same-date",             2, false, false, false, true, true, false },
	{ Comparison::TYPE_EARLIER_DATE,              "earlier-date",              2, false, false, false, true, true, false },
	{ Comparison::TYPE_LATER_DATE,                "later-date",                2, false, false, false, true, true, false },
	{ Comparison::TYPE_SAME_OR_EARLIER_DATE,      "same-or-earlier-date",      2, false, false, false, true, true, false },
	{ Comparison::TYPE_SAME_OR_LATER_DATE,        "same-or-later-date",        2, false, false, false, true, true, false },

	{ Comparison::TYPE_SAME_TIME,                 "same-time",                 2, false, false, false, true, false, true },
	{ Comparison::TYPE_NOT_SAME_TIME,             "not-same-time",             2, false, false, false, true, false, true },
	{ Comparison::TYPE_EARLIER_TIME,              "earlier-time",              2, false, false, false, true, false, true },
	{ Comparison::TYPE_LATER_TIME,                "later-time",                2, false, false, false, true, false, true },
	{ Comparison::TYPE_SAME_OR_EARLIER_TIME,      "same-or-earlier-time",      2, false, false, false, true, false, true },
	{ Comparison::TYPE_SAME_OR_LATER_TIME,        "same-or-later-time",        2, false, false, false, true, false, true }
};

BOOST_STATIC_ASSERT(sizeof(comparison_table) / sizeof(comparison_table[0]) - 1 == Comparison::LAST_COMPARISON_TYPE);


// Comparison member functions

bool Comparison::checkForValidType(const ComparisonType type) const
{
	bool result = false;
	
	if (comparison_table[type].is_generic) {
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
				result = comparison_table[type].applies_to_numeric_terms;
				break;
			case Vocabulary::TYPE_SHORT_STRING:
			case Vocabulary::TYPE_STRING:
			case Vocabulary::TYPE_LONG_STRING:
			case Vocabulary::TYPE_CHAR:
			case Vocabulary::TYPE_BLOB:
			case Vocabulary::TYPE_ZBLOB:
				result = comparison_table[type].applies_to_string_terms;
				break;
			case Vocabulary::TYPE_DATE_TIME:
				result = comparison_table[type].applies_to_date_time_terms;
				break;
			case Vocabulary::TYPE_DATE:
				result = comparison_table[type].applies_to_date_terms;
				break;
			case Vocabulary::TYPE_TIME:
				result = comparison_table[type].applies_to_time_terms;
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

	if (! value.empty()) {
		// Test value to make sure it's a valid UTF-8 string.
		UErrorCode errorCode = U_ZERO_ERROR;
		u_strFromUTF8(NULL, 0, NULL, value.c_str(), -1, &errorCode);
		if (errorCode == U_INVALID_CHAR_FOUND)
			throw InvalidComparisonException();
		if (errorCode != U_BUFFER_OVERFLOW_ERROR) // U_BUFFER_OVERFLOW_ERROR is expected since destCapacity = 0
			throw InvalidComparisonException();

		// TODO: Make more specific exceptions, e.g. InvalidCharInUtf8StringException & Utf8StringException.
	}

	if (type == TYPE_REGEX || type == TYPE_NOT_REGEX) {
		m_regex = boost::make_u32regex(value);
		m_regex_str = value;
	} else if (comparison_table[type].applies_to_string_terms) {
		m_str_value = value;

		switch (type) {
			case TYPE_EXACT_MATCH:
			case TYPE_NOT_EXACT_MATCH:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringExactMatch(m_str_value));
				break;
			case TYPE_EXACT_MATCH_PRIMARY:
			case TYPE_NOT_EXACT_MATCH_PRIMARY:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringExactMatch(m_str_value, UCOL_PRIMARY));
				break;
			case TYPE_CONTAINS:
			case TYPE_NOT_CONTAINS:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringContains(m_str_value));
				break;
			case TYPE_CONTAINS_PRIMARY:
			case TYPE_NOT_CONTAINS_PRIMARY:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringContains(m_str_value, UCOL_PRIMARY));
				break;
			case TYPE_STARTS_WITH:
			case TYPE_NOT_STARTS_WITH:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringStartsWith(m_str_value));
				break;
			case TYPE_STARTS_WITH_PRIMARY:
			case TYPE_NOT_STARTS_WITH_PRIMARY:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringStartsWith(m_str_value, UCOL_PRIMARY));
				break;
			case TYPE_ENDS_WITH:
			case TYPE_NOT_ENDS_WITH:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringEndsWith(m_str_value));
				break;
			case TYPE_ENDS_WITH_PRIMARY:
			case TYPE_NOT_ENDS_WITH_PRIMARY:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringEndsWith(m_str_value, UCOL_PRIMARY));
				break;
			case TYPE_ORDERED_BEFORE:
			case TYPE_NOT_ORDERED_BEFORE:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringOrderedBefore(m_str_value));
				break;
			case TYPE_ORDERED_BEFORE_PRIMARY:
			case TYPE_NOT_ORDERED_BEFORE_PRIMARY:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringOrderedBefore(m_str_value, UCOL_PRIMARY));
				break;
			case TYPE_ORDERED_AFTER:
			case TYPE_NOT_ORDERED_AFTER:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringOrderedAfter(m_str_value));
				break;
			case TYPE_ORDERED_AFTER_PRIMARY:
			case TYPE_NOT_ORDERED_AFTER_PRIMARY:
				m_comparison_func = boost::shared_ptr<ComparisonFunctor>(new CompareStringOrderedAfter(m_str_value, UCOL_PRIMARY));
				break;
		}
	} else if (requiresValue(type)) {		// note: comparisons of arity 1 just ignore the value
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
				case Vocabulary::TYPE_BLOB:
				case Vocabulary::TYPE_ZBLOB:
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
	if (requiresValue(type))
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

	// Search for a matching entry in comparison_table and return the corresponding type.
	for (int j = 0; j < sizeof(comparison_table) / sizeof(comparison_table[0]); ++j)
		if (str == comparison_table[j].name)
			return comparison_table[j].type;

	throw UnknownComparisonTypeException(str);
}

std::string Comparison::getComparisonTypeAsString(const ComparisonType comparison_type)
{
	return comparison_table[comparison_type].name;
}

bool Comparison::requiresValue(ComparisonType t) {
	return comparison_table[t].arity > 1;
}

void Comparison::writeComparisonsXML(std::ostream& out) {
	for (int i = 0; i < sizeof(comparison_table) / sizeof(comparison_table[0]); ++i) {
		out << "<Comparison id=\"" << comparison_table[i].name << "\"><Arity>"
			<< (unsigned)comparison_table[i].arity << "</Arity>";
		if (comparison_table[i].is_generic)
			out << "<Category>generic</Category>";
		if (comparison_table[i].applies_to_numeric_terms)
			out << "<Category>numeric</Category>";
		if (comparison_table[i].applies_to_string_terms)
			out << "<Category>string</Category>";
		if (comparison_table[i].applies_to_date_time_terms)
			out << "<Category>date_time</Category>";
		if (comparison_table[i].applies_to_date_terms)
			out << "<Category>date</Category>";
		if (comparison_table[i].applies_to_time_terms)
			out << "<Category>time</Category>";
		out << "</Comparison>" << std::endl;
	}
}

Comparison::ComparisonFunctor::ComparisonFunctor(const std::string& value, UColAttributeValue attr) : m_pattern_buf(NULL) {
	UErrorCode errorCode = U_ZERO_ERROR;
	m_collator = ucol_open(NULL, &errorCode);
	// TODO: check errorCode.
	////if (U_FAILURE(errorCode))
	////	do something

	if (attr != UCOL_DEFAULT)
		ucol_setAttribute(m_collator, UCOL_STRENGTH, attr, &errorCode);
		// TODO: check errorCode.

	u_strFromUTF8(NULL, 0, &m_pattern_buf_len, value.c_str(), -1, &errorCode);
	errorCode = U_ZERO_ERROR; // Need to reset, because u_strFromUTF8 returns U_BUFFER_OVERFLOW_ERROR when destCapacity = 0.
	m_pattern_buf = new UChar[m_pattern_buf_len];
	u_strFromUTF8(m_pattern_buf, m_pattern_buf_len, NULL, value.c_str(), -1, &errorCode);
}

Comparison::ComparisonFunctor::~ComparisonFunctor() {
	delete [] m_pattern_buf;
	ucol_close(m_collator);
}

Comparison::CompareStringExactMatch::CompareStringExactMatch(const std::string& value, UColAttributeValue attr) : ComparisonFunctor(value, attr) {
}

Comparison::CompareStringContains::CompareStringContains(const std::string& value, UColAttributeValue attr) : ComparisonFunctor(value, attr) {
}

Comparison::CompareStringStartsWith::CompareStringStartsWith(const std::string& value, UColAttributeValue attr) : ComparisonFunctor(value, attr) {
	m_text_prefix_buf = new UChar[m_pattern_buf_len];
}

Comparison::CompareStringStartsWith::~CompareStringStartsWith() {
	delete [] m_text_prefix_buf;
}

Comparison::CompareStringEndsWith::CompareStringEndsWith(const std::string& value, UColAttributeValue attr) : ComparisonFunctor(value, attr) {
}

Comparison::CompareStringOrderedBefore::CompareStringOrderedBefore(const std::string& value, UColAttributeValue attr) : ComparisonFunctor(value, attr) {
}

Comparison::CompareStringOrderedAfter::CompareStringOrderedAfter(const std::string& value, UColAttributeValue attr) : ComparisonFunctor(value, attr) {
}

	
}	// end namespace platform
}	// end namespace pion
