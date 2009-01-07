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
//#include <boost/logic/tribool.hpp>
#include <boost/algorithm/string/compare.hpp>
#include <boost/algorithm/string/predicate.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/Event.hpp>
//#include <pion/platform/Comparison.hpp>
#include <pion/PionLogger.hpp>
#include <pion/platform/ConfigManager.hpp>

namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

class PION_PLATFORM_API Transform
{
public:
	/// identifies the Vocabulary Term that is being tested (for regex)
	Vocabulary::Term			m_term;

	const Vocabulary&			m_v;

	class MissingTransformField : public PionException {
	public:
		MissingTransformField(const std::string& str)
			: PionException("Invalid type of transformation: ", str) {}
	};

//	mutable PionLogger			m_logger;

	/// virtual destructor: you may extend this class
	virtual ~Transform() {}

	/**
	 * constructs a new Transform rule
	 *
	 * @param term the term that will be examined
	 * @param set_term the term that will be set (if not InPlace)
	 */
	Transform(const Vocabulary& v, const Vocabulary::Term& term)
		: 	m_term(term), m_v(v) //, m_logger(PION_GET_LOGGER("pion.Transform"))
	{
	}

	void updateVocabulary(const Vocabulary& v)
	{
		// assume that Term references never change
		m_term = v[m_term.term_ref];
	}

//	bool checkForValidSetType(const Vocabulary::DataType type) const;

	/**
	 * transforms event terms
	 *
	 * @param e the Event to transform
	 *
	 * @return true if the Transformation occured; false if it did not
	 */
	virtual bool transform(EventPtr& e) = 0;
#if 0
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

//			if (m_tr_set_inplace)
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
#endif

};

inline bool AssignValue(EventPtr& e, const Vocabulary::Term& term, const std::string& value)
{
	switch (term.term_type) {
		case Vocabulary::TYPE_NULL:
		case Vocabulary::TYPE_OBJECT:
		case Vocabulary::TYPE_REGEX:
			return false;				// No assignment -- not assignable type...
			break;
		case Vocabulary::TYPE_INT8:
		case Vocabulary::TYPE_INT16:
		case Vocabulary::TYPE_INT32:
			e->setInt(term.term_ref, boost::lexical_cast<boost::uint32_t>(value));
			break;
		case Vocabulary::TYPE_INT64:
			e->setBigInt(term.term_ref, boost::lexical_cast<boost::uint64_t>(value));
			break;
		case Vocabulary::TYPE_UINT8:
		case Vocabulary::TYPE_UINT16:
		case Vocabulary::TYPE_UINT32:
			e->setUInt(term.term_ref, boost::lexical_cast<boost::uint32_t>(value));
			break;
		case Vocabulary::TYPE_UINT64:
			e->setUInt(term.term_ref, boost::lexical_cast<boost::uint64_t>(value));
			break;
		case Vocabulary::TYPE_FLOAT:
			e->setFloat(term.term_ref, boost::lexical_cast<float>(value));
			break;
		case Vocabulary::TYPE_DOUBLE:
			e->setDouble(term.term_ref, boost::lexical_cast<double>(value));
			break;
		case Vocabulary::TYPE_LONG_DOUBLE:
			e->setLongDouble(term.term_ref, boost::lexical_cast<long double>(value));
			break;
		case Vocabulary::TYPE_SHORT_STRING:
		case Vocabulary::TYPE_STRING:
		case Vocabulary::TYPE_LONG_STRING:
		case Vocabulary::TYPE_CHAR:
			e->setString(term.term_ref, value);
			break;
		case Vocabulary::TYPE_DATE_TIME:
		case Vocabulary::TYPE_DATE:
		case Vocabulary::TYPE_TIME:
			// TODO: This needs a time_facet...
			e->setDateTime(term.term_ref, boost::lexical_cast<PionDateTime>(value));
			break;
	}
	return true;
}



/// TransformAssignValue -- Transformation based on assigning a value to a Term
// Current implementation takes the std::string value of the "SetValue", and does
// a lexical cast upon assignment -- theoretically an implementation that did a lexical
// cast to start with, and then used an assignment might be faster... (once vs. many times)
// Also, this implementation will throw a every assignment (if not possible to lexically cast)
// while, a pre-cast version would throw once -- at configuration time...
class PION_PLATFORM_API TransformAssignValue
	: public Transform
{
	std::string					m_tr_set_value;

public:
	TransformAssignValue(const Vocabulary& v, const Vocabulary::Term& term, const xmlNodePtr config_ptr)
		: Transform(v, term)
	{
		// <Value>escape(value)</Value>
		std::string val;
		// TODO: Move "Value" into external define
		if (! ConfigManager::getConfigOption("Value", val, config_ptr))
			throw MissingTransformField("Missing Value in TransformationAssignValue");
		m_tr_set_value = val;
	}

	virtual bool transform(EventPtr& e)
	{
		return AssignValue(e, m_term, m_tr_set_value);
	}
};


/// TransformAssignTerm -- Transformation based on copying Terms from the source event
// Should the type be re-cast, if non-matching?
class PION_PLATFORM_API TransformAssignTerm
	: public Transform
{
	/// identifies the Vocabulary Term that is being copied from
	Vocabulary::TermRef			m_src_term_ref;

public:
	TransformAssignTerm(const Vocabulary& v, const Vocabulary::Term& term, const xmlNodePtr config_ptr)
		: Transform(v, term), m_src_term_ref(Vocabulary::UNDEFINED_TERM_REF)
	{
		// <Term>src-term</Term>
		std::string term_id;
		// TODO: Move "Term" into external define
		if (! ConfigManager::getConfigOption("Term", term_id, config_ptr))
			throw MissingTransformField("Missing Source-Term in TransformationAssignTerm");
		m_src_term_ref = v.findTerm(term_id);
		if (m_src_term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw MissingTransformField("Invalid Source-Term in TransformationAssignTerm");
	}

	virtual bool transform(EventPtr& e)
	{
		Event::ValuesRange values_range = e->equal_range(m_src_term_ref);
		Event::ConstIterator ec = values_range.first;
		if (ec == values_range.second) {
//			PION_LOG_DEBUG(m_logger, "values range does not exist, i.e. term not found");
			return false;
		} else {
			// TODO: Optimize the intermediary variable s out by folding the function
			// Get the value, cast as a string
			std::string s = boost::get<const Event::SimpleString&>(ec->value).get();
			// Assign the string, with appropriate lexical re-casting
			return AssignValue(e, m_term, s);
		}
	}
};

/// TransformLookup -- Transformation based on doing lookups
class PION_PLATFORM_API TransformLookup
	: public Transform
{
public:
	TransformLookup(const Vocabulary& v, const Vocabulary::Term& term, const xmlNodePtr config_ptr)
		: Transform(v, term)
	{
		// FIXME: Get the whole lookup chain
	}

	virtual bool transform(EventPtr& e)
	{
		// FIXME: Assign the lookup value
		return true;	// FIXME: Return true if lookup value assigned
	}
};

/// TransformRules -- Transformation based on a full set of rules
class PION_PLATFORM_API TransformRules
	: public Transform
{
public:
	TransformRules(const Vocabulary& v, const Vocabulary::Term& term, const xmlNodePtr config_ptr)
		: Transform(v, term)
	{
		// FIXME: Get the whole rule chain
	}

	virtual bool transform(EventPtr& e)
	{
		// FIXME: Assign the rule value
		return true;	// FIXME: Return true if Rule yielded value & assigned
	}
};


}
}


#endif
