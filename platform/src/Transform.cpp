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
#include <boost/algorithm/string.hpp>
// #include <pion/platform/Comparison.hpp>
#include <pion/platform/Transform.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

bool Transform::checkForValidSetType(const Vocabulary::DataType type) const
{
	bool result = false;

	// This could be done with a simple if... but I like to make sure all cases are covered
	// by letting the compiler warn about unhandled cases
	switch (type) {
		case Vocabulary::TYPE_OBJECT:
		case Vocabulary::TYPE_NULL:
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
		case Vocabulary::TYPE_SHORT_STRING:
		case Vocabulary::TYPE_STRING:
		case Vocabulary::TYPE_LONG_STRING:
		case Vocabulary::TYPE_CHAR:
		case Vocabulary::TYPE_DATE_TIME:
		case Vocabulary::TYPE_DATE:
		case Vocabulary::TYPE_TIME:
		case Vocabulary::TYPE_REGEX:
			result = true;
			break;
	}
	return result;
}

void Transform::setSetValue(const std::string& test_value_str, const std::string& value_str)
{
	if (! checkForValidSetType(m_tr_set_term.term_type))
		throw InvalidTypeForTermException();

	try {
		// convert string to be the same type as the term
		switch (m_tr_set_term.term_type) {
			case Vocabulary::TYPE_NULL:
			case Vocabulary::TYPE_OBJECT:
				// do nothing
				break;
			case Vocabulary::TYPE_INT8:
			case Vocabulary::TYPE_INT16:
			case Vocabulary::TYPE_INT32:
				m_tr_set_value = boost::lexical_cast<boost::int32_t>(value_str);
				break;
			case Vocabulary::TYPE_INT64:
				m_tr_set_value = boost::lexical_cast<boost::int64_t>(value_str);
				break;
			case Vocabulary::TYPE_UINT8:
			case Vocabulary::TYPE_UINT16:
			case Vocabulary::TYPE_UINT32:
				m_tr_set_value = boost::lexical_cast<boost::uint32_t>(value_str);
				break;
			case Vocabulary::TYPE_UINT64:
				m_tr_set_value = boost::lexical_cast<boost::uint64_t>(value_str);
				break;
			case Vocabulary::TYPE_FLOAT:
				m_tr_set_value = boost::lexical_cast<float>(value_str);
				break;
			case Vocabulary::TYPE_DOUBLE:
				m_tr_set_value = boost::lexical_cast<double>(value_str);
				break;
			case Vocabulary::TYPE_LONG_DOUBLE:
				m_tr_set_value = boost::lexical_cast<long double>(value_str);
				break;
			case Vocabulary::TYPE_SHORT_STRING:
			case Vocabulary::TYPE_STRING:
			case Vocabulary::TYPE_LONG_STRING:
			case Vocabulary::TYPE_CHAR:
				m_tr_regex_pattern = test_value_str;
				m_tr_set_str_value = value_str;
PION_LOG_DEBUG(m_logger, "m_tr_regex_pattern#1 = " << test_value_str);
PION_LOG_DEBUG(m_logger, "m_tr_set_str_value#1 = " << value_str);
				break;
			case Vocabulary::TYPE_DATE_TIME:
			case Vocabulary::TYPE_DATE:
			case Vocabulary::TYPE_TIME:
				// m_tr_set_value = boost::lexical_cast<PionDateTime>(value_str);
				{
					PionTimeFacet f(m_tr_set_term.term_format);
					m_tr_set_value = f.fromString(value_str);
				}
				break;
			case Vocabulary::TYPE_REGEX:
				{
					m_tr_regex_pattern = test_value_str;
					m_tr_set_str_value = value_str;
PION_LOG_DEBUG(m_logger, "m_tr_regex_pattern#2 = " << test_value_str);
PION_LOG_DEBUG(m_logger, "m_tr_set_str_value#2 = " << value_str);
/*
					std::string::size_type i;
					// Is there an un-escaped / (slash) separating the match and output parameters?
	   				if ((i = value_str.find('/')) != std::string::npos &&
						(i > 0 || value_str[i-1] != '\\')) {
						// Yes -> Split the parameter
						m_tr_set_regex_out = boost::replace_all_copy(value_str.substr(i + 1), "\\/", "/");
						m_tr_set_regex = boost::replace_all_copy(value_str.substr(0, i - 1), "\\/", "/");
					} else {
						// No -> clear the output pattern, use the parameter for match
						m_tr_set_regex_out.clear();
						m_tr_set_regex = boost::replace_all_copy(value_str, "\\/", "/");
					}
*/
				}
				break;
		}
	} catch (...) {
		throw InvalidValueForTypeException();
	}
}

}
}
