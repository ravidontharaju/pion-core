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
// #include <pion/platform/Comparison.hpp>
#include <pion/platform/Transform.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

bool Transform::checkForValidSetType(const Vocabulary::DataType type) const
{
	bool result = false;
	
	switch (type) {
		case Vocabulary::TYPE_OBJECT:
			result = false;
			break;
		case Vocabulary::TYPE_NULL:
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


void Transform::setSetValue(const std::string& value_str)
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
				m_tr_set_str_value = value_str;
				break;
			case Vocabulary::TYPE_DATE_TIME:
			case Vocabulary::TYPE_DATE:
			case Vocabulary::TYPE_TIME:
				m_tr_set_value = boost::lexical_cast<PionDateTime>(value_str);
				break;
			case Vocabulary::TYPE_REGEX:
				m_tr_set_regex = value_str;
				break;
		}
	} catch (...) {
		throw InvalidValueForTypeException();
	}
}

}
}
