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

#ifndef __PION_TRANSFORM_HEADER__
#define __PION_TRANSFORM_HEADER__

#include <boost/regex.hpp>
#include <boost/logic/tribool.hpp>
#include <boost/algorithm/string/compare.hpp>
#include <boost/algorithm/string/predicate.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Comparison.hpp>
#include <pion/PionLogger.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

class PION_PLATFORM_API Transform :
	public Comparison
//	public pion::platform::Comparison
{
public:

	/// Substitute in-place, or create new term
	bool						m_tr_set_inplace;

	/// identifies the Vocabulary Term to set
	Vocabulary::Term			m_tr_set_term;

	/// identifies the Vocabulary Term that is being tested (for regex)
	Vocabulary::Term			m_tr_term;

	/// identifies what type of Comparison this is
	ComparisonType				m_tr_set_type;

	/// the value that the Vocabulary Term is compared to (if not string or regex type)
	Event::ParameterValue		m_tr_set_value;

	/// the string that the Vocabulary Term is compared to (if string comparison type)
	std::string					m_tr_set_str_value;

	/// the regex that the Vocabulary Term is compared to (if regex comparison type)
	boost::regex				m_tr_regex_pattern;

	mutable PionLogger			m_logger;

	/// let's use a variant to contain any of the three types of set value
//	boost::variant<std::string,Event::ParameterValue,boost::regex> m_tr_set;

	/// virtual destructor: you may extend this class
	virtual ~Transform() {}

	/**
	 * constructs a new Transform rule
	 *
	 * @param term the term that will be examined
	 * @param set_term the term that will be set (if not InPlace)
	 */
	explicit Transform(const Vocabulary::Term& term, const Vocabulary::Term& set_term)
		: 	Comparison(term), m_tr_set_term(set_term), m_tr_term(term),
			m_logger(PION_GET_LOGGER("pion.Transform"))
	{
	}

/*
	/// standard copy constructor
	Transform(const Comparison& c)
		: m_term(c.m_term), m_type(c.m_type), m_value(c.m_value),
		m_str_value(c.m_str_value), m_regex(c.m_regex),
		m_match_all_values(c.m_match_all_values)
	{}
*/
	bool checkForValidSetType(const Vocabulary::DataType type) const;
	void setSetValue(const std::string& test_value_str, const std::string& transformation_set_value);

	/**
	 * configure the transformation rule
	 *
	 * @param transformation_inplace does the transformation occur on the same parameter that matches
	 * @param transformation_set_term what value does the transformation set the parameter to
	 */
	void configure_transform(ComparisonType comparison_type, bool transformation_inplace,
							const std::string& value_str, const std::string& transformation_set_value)
	{
		m_tr_set_type = comparison_type;
		m_tr_set_inplace = transformation_inplace;
		// Set the appropriate m_tr_set value, depending on the data type
		setSetValue(value_str, transformation_set_value);
	}

	/**
	 * transforms event terms
	 *
	 * @param e the Event to transform
	 *
	 * @return true if the Transformation occured; false if it did not
	 */
	inline bool transform(EventPtr& e)
	{
		CompMatch result = evaluate(*e);
		if (result.get<0>()) {

			std::string s;
			if (m_tr_set_type == TYPE_REGEX || m_tr_set_type == TYPE_NOT_REGEX) {
				Event::ValuesRange values_range = e->equal_range(m_tr_term.term_ref);
				Event::ConstIterator ec = values_range.first;
				if (ec == values_range.second)
					PION_LOG_DEBUG(m_logger, "values range does not exist, i.e. term not found");
				s = boost::get<const Event::SimpleString&>(ec->value).get();
			}

			if (m_tr_set_inplace)
				e->clear(m_tr_set_term.term_ref);

			switch (m_tr_set_term.term_type) {
				case Vocabulary::TYPE_NULL:
				case Vocabulary::TYPE_OBJECT:
					// do nothing
					break;
				case Vocabulary::TYPE_INT8:
				case Vocabulary::TYPE_INT16:
				case Vocabulary::TYPE_INT32:
					e->setInt(m_tr_set_term.term_ref, boost::get<const boost::uint32_t&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_INT64:
					e->setBigInt(m_tr_set_term.term_ref, boost::get<const boost::uint64_t&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_UINT8:
				case Vocabulary::TYPE_UINT16:
				case Vocabulary::TYPE_UINT32:
					e->setUInt(m_tr_set_term.term_ref, boost::get<const boost::uint32_t&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_UINT64:
					e->setUInt(m_tr_set_term.term_ref, boost::get<const boost::uint64_t&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_FLOAT:
					e->setFloat(m_tr_set_term.term_ref, boost::get<const float&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_DOUBLE:
					e->setDouble(m_tr_set_term.term_ref, boost::get<const double&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_LONG_DOUBLE:
					e->setLongDouble(m_tr_set_term.term_ref, boost::get<const long double&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
					if (m_tr_set_type == TYPE_REGEX || m_tr_set_type == TYPE_NOT_REGEX) {
//						Event::ConstIterator ec = result.get<1>();
//						std::string s = boost::get<const Event::SimpleString&>(ec->value).get();
//						PION_LOG_DEBUG(m_logger, "s = " << s);
//						PION_LOG_DEBUG(m_logger, "m_tr_set_str_value = " << m_tr_set_str_value);
//						std::string res = boost::regex_replace(s, m_tr_regex_pattern, m_tr_set_str_value);
						e->setString(m_tr_set_term.term_ref,
									boost::regex_replace(s, m_tr_regex_pattern, m_tr_set_str_value,
														boost::format_all | boost::format_no_copy));
					} else
						e->setString(m_tr_set_term.term_ref, m_tr_set_str_value);
					break;
				case Vocabulary::TYPE_DATE_TIME:
				case Vocabulary::TYPE_DATE:
				case Vocabulary::TYPE_TIME:
					e->setDateTime(m_tr_set_term.term_ref, boost::get<const PionDateTime&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_REGEX:
					{
//						Event::ConstIterator ec = result.get<1>();
//						std::string s = boost::get<const Event::SimpleString&>(ec->value).get();
/*
						if (m_tr_set_regex_out.empty()) {
							boost::match_results<std::string::const_iterator> match;
							if (boost::regex_search(s, match, m_tr_set_regex)) {
								s.clear();
								for (unsigned int i = 0; i < match.size(); i++)
									s += match[i].str();
								e->setString(m_tr_set_term.term_ref, s);
							}
						} else
							e->setString(m_tr_set_term.term_ref,
								boost::regex_replace(s, m_tr_set_regex, m_tr_set_regex_out));
*/
					}
					break;
			}
			return true;
		}
		return false;
	}
};

}
}


#endif
