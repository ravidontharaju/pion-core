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
#include <pion/platform/Comparison.hpp>
#include <pion/PionLogger.hpp>
#include <pion/platform/ConfigManager.hpp>

namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

class PION_PLATFORM_API Transform
{
public:
	/// identifies the Vocabulary Term that is being tested (for regex)
	Vocabulary::Term			m_term;

	/// a copy to Vocabulary pointer, for parsing TransformXXX entries
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

	void removeTerm(EventPtr& e)
	{
		e->clear(m_term.term_ref);
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
			e->setInt(term.term_ref, boost::lexical_cast<boost::int32_t>(value));
			break;
		case Vocabulary::TYPE_INT64:
			e->setBigInt(term.term_ref, boost::lexical_cast<boost::int64_t>(value));
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
			// FIXME: This needs a time_facet...
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
		// if ec == values_range.second ... source term was not found...
		bool AnyCopied = false;
		while (ec != values_range.second) {
			// TODO: Optimize the intermediary variable s out by folding the function
			std::string s = boost::get<const Event::SimpleString&>(ec->value).get();
			AnyCopied |= AssignValue(e, m_term, s);
			ec++;			// repeat for all matching source terms
		}
		return AnyCopied;	// true, if any were copied...
	}
};

/// TransformLookup -- Transformation based on doing lookups
class PION_PLATFORM_API TransformLookup
	: public Transform
{
	/// Define HashMapped, key-value pair array KVP
	typedef PION_HASH_MAP<std::string, std::string, PION_HASH_STRING>	KVP;

	/// Term to pull out of the source event
	Vocabulary::TermRef			m_lookup_term_ref;
	/// [optional] regular expression to apply to Lookup Term
	boost::regex				m_match;
	/// [optional] format to apply to regular expression, default: $&
	std::string					m_format;
	/// Treatment for default value, if lookup fails
	enum { DEF_UNDEF, DEF_SRCTERM, DEF_OUTPUT, DEF_FIXED }
								m_default;
	/// [optional] fixed string to use as default value with DEF_FIXED
	std::string					m_fixed;
	/// Keys & Values, hashmap for keys
	KVP							m_lookup;

public:
	TransformLookup(const Vocabulary& v, const Vocabulary::Term& term, const xmlNodePtr config_ptr)
		: Transform(v, term)
	{
		//	<LookupTerm>src-term</LookupTerm>
		std::string term_id;
		if (! ConfigManager::getConfigOption("LookupTerm", term_id, config_ptr))
			throw MissingTransformField("Missing LookupTerm in TransformationAssingLookup");
		m_lookup_term_ref = v.findTerm(term_id);
		if (m_lookup_term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw MissingTransformField("Invalid LookupTerm in TransformationAssignLookup");
		//[opt]		<Match>escape(regexp)</Match>
		std::string val;
		if (ConfigManager::getConfigOption("Match", val, config_ptr)) {
			try {
				m_match = val;
			} catch (...) {
				throw MissingTransformField("Invalid regular expression in TransformationAssignLookup");
			}
		}
		//	[opt]		<Format>escape(format)</Format>
		m_format.clear();
		if (ConfigManager::getConfigOption("Format", val, config_ptr))
			m_format = val;

		// If regex has been found & is valid, but format is empty... set to default $&
		if (!m_match.empty() && m_format.empty())
			m_format = "$&";

		//	[opt]		<DefaultAction>undefined|src-term|output|fixedvalue</DefaultAction>
		m_default = DEF_UNDEF;
		if (ConfigManager::getConfigOption("DefaultAction", val, config_ptr)) {
			if (val == "src-term")
				m_default = DEF_SRCTERM;
			else if (val == "output")
				m_default = DEF_OUTPUT;
			else if (val == "fixedvalue")
				m_default = DEF_FIXED;
		}
		//	[opt]		<DefaultValue>escape(text)</DefaultValue>
		m_fixed.clear();
		if (m_default == DEF_FIXED && ConfigManager::getConfigOption("DefaultValue", val, config_ptr))
			m_fixed = val;
		//	[rpt/]		<Lookup key="escape(key)">escape(value)</Lookup>
		xmlNodePtr LookupNode = config_ptr;
		std::string key_str;
		while ( (LookupNode = ConfigManager::findConfigNodeByAttr("Lookup", "key", key_str, LookupNode)) != NULL) {
			if (ConfigManager::getConfigOption("Lookup", val, LookupNode))
				m_lookup[key_str] = val;
			LookupNode = LookupNode->next;
		}
	}

	virtual ~TransformLookup() {
		m_lookup.clear();
	}

	// Note, that the transformation will iterate based on lookup_term
	// - No terms (not found); no iterations, not even default actions
	// - 1..n: iterate full functionality for each found term
	virtual bool transform(EventPtr& e)
	{
		Event::ValuesRange values_range = e->equal_range(m_lookup_term_ref);
		Event::ConstIterator ec = values_range.first;
		// if ec == values_range.second ... source term was not found...
		bool AnyCopied = false;
		while (ec != values_range.second) {
			// Get the source term
			std::string s = boost::get<const Event::SimpleString&>(ec->value).get();
			// If regex defined, do the regular expression, replacing the key value
			if (! m_match.empty())
				s = boost::regex_replace(s, m_match, m_format, boost::format_all | boost::format_no_copy);
			// Find the value, using the key
			KVP::const_iterator i = m_lookup.find(s);
			if (i != m_lookup.end())	// Found: assign the lookup value
				AnyCopied |= AssignValue(e, m_term, i->second);
			else						// Not found: perform default action
				switch (m_default) {
					case DEF_UNDEF:		// Leave undefined, i.e. do nothing
						break;
					case DEF_SRCTERM:	// Re-get the original value, assign it
						AnyCopied |= AssignValue(e, m_term, boost::get<const Event::SimpleString&>(ec->value).get());
						break;
					case DEF_OUTPUT:	// Assign the regex output value
						AnyCopied |= AssignValue(e, m_term, s);
						break;
					case DEF_FIXED:		// Assign the fixed value
						AnyCopied |= AssignValue(e, m_term, m_fixed);
						break;
				}
			ec++;			// repeat for all matching source terms
		}
		return AnyCopied;	// true, if any were copied...
	}
};

/// TransformRules -- Transformation based on a full set of rules
class PION_PLATFORM_API TransformRules
	: public Transform
{
	/// Should TransformRules stop at first successfull transformation for this dest-term
	bool										m_short_circuit;

	/// vector of term_ref's (so we can iterate through the values_range)
	std::vector<Vocabulary::TermRef>			m_src_term;
	/// comparison, so we can pick out TYPE_REGEX's for special handling
	std::vector<Comparison::ComparisonType>		m_test;
	/// set value, for assignment, or for use as format for TYPE_REGEX
	std::vector<std::string>					m_set_value;
	/// pointer to instantiated & configured Comparison
	std::vector<Comparison *>					m_comparison;
public:
	TransformRules(const Vocabulary& v, const Vocabulary::Term& term, const xmlNodePtr config_ptr)
		: Transform(v, term)
	{
		// <StopOnFirstMatch>true|false</StopOnFirstMatch>			-> DEFAULT: true
		m_short_circuit = true;
		std::string short_circuit_str;
		if (! ConfigManager::getConfigOption("StopOnFirstMatch", short_circuit_str, config_ptr))
			throw MissingTransformField("Missing StopOnFirstMatch in TransformationAssignRules");
		if (short_circuit_str == "true")
			m_short_circuit = true;

		//	[rpt]		<Rule>
		xmlNodePtr RuleNode = config_ptr;
		while ( (RuleNode = ConfigManager::findConfigNodeByName("Rule", RuleNode)) != NULL)
		{
			//	<Term>src-term</Term>
			std::string term_id;
			if (! ConfigManager::getConfigOption("Term", term_id, RuleNode->children))
				throw MissingTransformField("Missing Source-Term in TransformationAssignRules");
			Vocabulary::TermRef term_ref = v.findTerm(term_id);
			if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
				throw MissingTransformField("Invalid Term in TransformationAssignRules");
			m_src_term.push_back(term_ref);

			//	<Type>test-type</Type>
			std::string val;
			if (! ConfigManager::getConfigOption("Type", val, RuleNode->children))
				throw MissingTransformField("Missing Value in TransformationAssignRules");
			Comparison::ComparisonType ctype = Comparison::parseComparisonType(val);
			m_test.push_back(ctype);

			//	<Value>escape(test-value)</Value>
			std::string value_str;
			if (!Comparison::isGenericType(ctype))
				if (! ConfigManager::getConfigOption("Value", value_str, RuleNode->children))
					throw MissingTransformField("Missing Value in TransformationAssignRules");

			Comparison *comp = new Comparison(v[term_ref]);
			comp->configure(ctype, value_str);
			m_comparison.push_back(comp);

			//	<SetValue>escape(set-value)</SetValue>
			val.clear();
			if (! ConfigManager::getConfigOption("SetValue", val, RuleNode->children))
				throw MissingTransformField("Missing SetValue in TransformationAssignRules");
			m_set_value.push_back(val);

			RuleNode = RuleNode->next;
		}
	}

	virtual ~TransformRules() {
		m_src_term.clear();
		m_test.clear();
		m_set_value.clear();
		for (unsigned int i = 0; i < m_comparison.size(); i++)
			delete m_comparison[i];
	}

	virtual bool transform(EventPtr& e)
	{
		bool AnyAssigned = false;
		// Loop through all TESTs, break out if any term successfull on any test and short_circuit
		for (unsigned int i = 0; i < m_src_term.size(); i++) {
			Event::ValuesRange values_range = e->equal_range(m_src_term[i]);
			Event::ConstIterator ec = values_range.first;
			while (ec != values_range.second) {
				if (m_comparison[i]->evaluateRange(std::make_pair(ec, values_range.second))) {
					if (m_test[i] == Comparison::TYPE_REGEX) {		// Only for POSITIVE regex...
						// Get the original value
						std::string s = boost::get<const Event::SimpleString&>(ec->value).get();
						// For Regex... get the precompiled from Comparison
						// For Format... use the set_value
						s = boost::regex_replace(s, m_comparison[i]->getRegex(), m_set_value[i],
													boost::format_all | boost::format_no_copy);
						// Assign the result
						AnyAssigned |= AssignValue(e, m_term, s);
					} else
						AnyAssigned |= AssignValue(e, m_term, m_set_value[i]);
				}
			}
			ec++;			// repeat for all matching source terms
			// If short_circuit AND any values were assigned -> don't go further in the chain
			if (m_short_circuit && AnyAssigned)
				break;
		}
		return AnyAssigned;
	}
};


}
}


#endif
