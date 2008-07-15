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

	/// identifies what type of Comparison this is
	ComparisonType				m_tr_set_type;
	
	/// the value that the Vocabulary Term is compared to (if not string or regex type)
	Event::ParameterValue		m_tr_set_value;
	
	/// the string that the Vocabulary Term is compared to (if string comparison type)
	std::string					m_tr_set_str_value;

	/// the regex that the Vocabulary Term is compared to (if regex comparison type)
	boost::regex				m_tr_set_regex;

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
		: Comparison(term), m_tr_set_term(set_term)
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
	void setSetValue(const std::string& transformation_set_value);

	/**
	 * configure the transformation rule
	 *
	 * @param transformation_inplace does the transformation occur on the same parameter that matches
	 * @param transformation_set_term what value does the transformation set the parameter to
	 */
	void configure_transform(bool transformation_inplace, const std::string& transformation_set_value)
	{
		m_tr_set_inplace = transformation_inplace;
		// Set the appropriate m_tr_set value, depending on the data type
		setSetValue(transformation_set_value);
	}

	/**
	 * transforms event terms
	 *
	 * @param e the Event to transform
	 *
	 * @return true if the Transformation occured; false if it did not
	 */
	inline bool transform(EventPtr& e) const
	{
		CompMatch result = evaluate(*e);
		if (result.get<0>()) {
			if (m_tr_set_inplace) {
				// TODO: Rip out the original, matching term
			}
			switch (m_tr_set_term.term_type) {
				case Vocabulary::TYPE_NULL:
				case Vocabulary::TYPE_OBJECT:
					// do nothing
					break;
				case Vocabulary::TYPE_INT8:
				case Vocabulary::TYPE_INT16:
				case Vocabulary::TYPE_INT32:
					e->setInt(m_tr_set_term.term_type, boost::get<const boost::uint32_t&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_INT64:
					e->setBigInt(m_tr_set_term.term_type, boost::get<const boost::uint64_t&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_UINT8:
				case Vocabulary::TYPE_UINT16:
				case Vocabulary::TYPE_UINT32:
					e->setUInt(m_tr_set_term.term_type, boost::get<const boost::uint32_t&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_UINT64:
					e->setUInt(m_tr_set_term.term_type, boost::get<const boost::uint64_t&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_FLOAT:
					e->setFloat(m_tr_set_term.term_type, boost::get<const float&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_DOUBLE:
					e->setDouble(m_tr_set_term.term_type, boost::get<const double&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_LONG_DOUBLE:
					e->setLongDouble(m_tr_set_term.term_type, boost::get<const long double&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_SHORT_STRING:
				case Vocabulary::TYPE_STRING:
				case Vocabulary::TYPE_LONG_STRING:
				case Vocabulary::TYPE_CHAR:
					e->setString(m_tr_set_term.term_type, m_tr_set_str_value);
					break;
				case Vocabulary::TYPE_DATE_TIME:
				case Vocabulary::TYPE_DATE:
				case Vocabulary::TYPE_TIME:
					e->setDateTime(m_tr_set_term.term_type, boost::get<const PionDateTime&>(m_tr_set_value));
					break;
				case Vocabulary::TYPE_REGEX:
					{
						boost::match_results<std::string::const_iterator> match;
						Event::ConstIterator ec = result.get<1>();
						std::string s = boost::get<const Event::SimpleString&>(ec->value).get();
						if (boost::regex_search(s, match, m_tr_set_regex)) {
							s = "";
							for (unsigned int i = 0; i < match.size(); i++)
								s += match[i].str();
							e->setString(m_tr_set_term.term_type, s);
						}
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
