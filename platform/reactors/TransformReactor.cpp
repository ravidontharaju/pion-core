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

#include <boost/thread/mutex.hpp>
#include <pion/platform/ConfigManager.hpp>
#include "TransformReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of TransformReactor

const std::string			TransformReactor::COMPARISON_ELEMENT_NAME = "Comparison";
const std::string			TransformReactor::TERM_ELEMENT_NAME = "Term";
const std::string			TransformReactor::TYPE_ELEMENT_NAME = "Type";
const std::string			TransformReactor::VALUE_ELEMENT_NAME = "Value";
const std::string			TransformReactor::MATCH_ALL_VALUES_ELEMENT_NAME = "MatchAllValues";

const std::string			TransformReactor::ALL_CONDITIONS_ELEMENT_NAME = "AllConditions";
const std::string			TransformReactor::DELIVER_ORIGINAL_NAME = "DeliverOriginal";
const std::string			TransformReactor::EVENT_TYPE_NAME = "EventType";

const std::string			TransformReactor::TRANSFORMATION_ELEMENT_NAME = "Transformation";
const std::string			TransformReactor::TRANSFORMATION_SET_VALUE_NAME = "SetValue";
const std::string			TransformReactor::TRANSFORMATION_INPLACE_NAME = "InPlace";
const std::string			TransformReactor::TRANSFORMATION_SET_TERM_NAME = "SetTerm";

// TransformReactor member functions

void TransformReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);

	// clear the current configuration
	m_rules.clear();
	m_transforms.clear();
	m_all_conditions = false;
	m_deliver_original = DO_NEVER;

	// check if all the Comparisons should match before starting Transformations
	std::string all_conditions_str;
	if (ConfigManager::getConfigOption(ALL_CONDITIONS_ELEMENT_NAME, all_conditions_str, config_ptr))
	{
		if (all_conditions_str == "true")
			m_all_conditions = true;
	}

	m_event_type = Vocabulary::UNDEFINED_TERM_REF;
	std::string event_type_str;
	if (ConfigManager::getConfigOption(EVENT_TYPE_NAME, event_type_str, config_ptr))
	{
		if (!event_type_str.empty())
			m_event_type = v.findTerm(event_type_str);
	}

	std::string deliver_original_str;
	if (ConfigManager::getConfigOption(DELIVER_ORIGINAL_NAME, deliver_original_str, config_ptr))
	{
		if (deliver_original_str == "true" || deliver_original_str == "always")
			m_deliver_original = DO_ALWAYS;
		else if (deliver_original_str == "if-not-changed")
			m_deliver_original = DO_SOMETIMES;
	}

	// next, parse each comparison rule
	xmlNodePtr comparison_node = config_ptr;
	while ( (comparison_node = ConfigManager::findConfigNodeByName(COMPARISON_ELEMENT_NAME, comparison_node)) != NULL)
	{
		// parse new Comparison rule

		// get the Term used for the Comparison rule
		std::string term_id;
		if (! ConfigManager::getConfigOption(TERM_ELEMENT_NAME, term_id,
											 comparison_node->children))
			throw EmptyTermException(getId());

		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(getId());

		// get the Comparison type & make sure that it is valid
		std::string type_str;
		if (! ConfigManager::getConfigOption(TYPE_ELEMENT_NAME, type_str,
											 comparison_node->children))
			throw EmptyTypeException(getId());
		// note: parseComparisonType will throw if it is invalid
		const Comparison::ComparisonType comparison_type = Comparison::parseComparisonType(type_str);

		// get the value parameter (only if type is not generic)
		std::string value_str;
		if (! Comparison::isGenericType(comparison_type)) {
			if (! ConfigManager::getConfigOption(VALUE_ELEMENT_NAME, value_str,
												 comparison_node->children))
				throw EmptyValueException(getId());
		}

		// check if the Comparison should match all values for the given Term
		bool match_all_values = false;
		std::string match_all_values_str;
		if (ConfigManager::getConfigOption(MATCH_ALL_VALUES_ELEMENT_NAME, match_all_values_str,
										   comparison_node->children))
		{
			if (match_all_values_str == "true")
				match_all_values = true;
		}

		// add the Comparison
		Comparison new_comparison(v[term_ref]);
		new_comparison.configure(comparison_type, value_str, match_all_values);
		m_rules.push_back(new_comparison);

		// step to the next Comparison rule
		comparison_node = comparison_node->next;
	}

	// now, parse transformation rules
	xmlNodePtr transformation_node = config_ptr;
	while ( (transformation_node = ConfigManager::findConfigNodeByName(TRANSFORMATION_ELEMENT_NAME, transformation_node)) != NULL)
	{
		// parse new Transformation rule

		// get the Term used for the Transformation rule
		std::string term_id;
		if (! ConfigManager::getConfigOption(TERM_ELEMENT_NAME, term_id,
											 transformation_node->children))
			throw EmptyTermException(getId());

		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(getId());

		// get the Comparison type & make sure that it is valid
		std::string type_str;
		if (! ConfigManager::getConfigOption(TYPE_ELEMENT_NAME, type_str,
											 transformation_node->children))
			throw EmptyTypeException(getId());
		// note: parseComparisonType will throw if it is invalid
		const Comparison::ComparisonType comparison_type = Comparison::parseComparisonType(type_str);

		// get the value parameter (only if type is not generic)
		std::string value_str;
		if (! Comparison::isGenericType(comparison_type)) {
			if (! ConfigManager::getConfigOption(VALUE_ELEMENT_NAME, value_str,
												 transformation_node->children))
				throw EmptyValueException(getId());
		}

		// check if the Comparison should match all values for the given Term
		bool match_all_values = false;
		std::string match_all_values_str;
		if (ConfigManager::getConfigOption(MATCH_ALL_VALUES_ELEMENT_NAME, match_all_values_str,
										   transformation_node->children))
		{
			if (match_all_values_str == "true")
				match_all_values = true;
		}

		std::string set_value_str;
		if (! ConfigManager::getConfigOption(TRANSFORMATION_SET_VALUE_NAME, set_value_str,
											transformation_node->children))
			throw EmptyTransformationException(getId());

		bool transformation_inplace = false;
		std::string transformation_inplace_str;
		if (ConfigManager::getConfigOption(TRANSFORMATION_INPLACE_NAME, transformation_inplace_str,
											transformation_node->children))
		{
			if (transformation_inplace_str == "true")
				transformation_inplace = true;
		}

		std::string transformation_set_term;
		if (! transformation_inplace) {
			if (! ConfigManager::getConfigOption(TRANSFORMATION_SET_TERM_NAME, transformation_set_term,
											transformation_node->children))
				throw EmptySetTermException(getId());
		}

		Vocabulary::TermRef set_term_ref = term_ref;
		if (! transformation_set_term.empty()) {
			set_term_ref = v.findTerm(transformation_set_term);
			if (set_term_ref == Vocabulary::UNDEFINED_TERM_REF)
				throw UnknownTermException(getId());
		}

		// add the Transformation
		Transform new_transform(v[term_ref], v[set_term_ref]);
		new_transform.configure(comparison_type, value_str, match_all_values);
		new_transform.configure_transform(transformation_inplace, set_value_str);
		m_transforms.push_back(new_transform);

		// step to the next Comparison rule
		transformation_node = transformation_node->next;
	}
}

void TransformReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::updateVocabulary(v);

	// update Vocabulary for each of the rules
	for (RuleChain::iterator i = m_rules.begin(); i != m_rules.end(); ++i) {
		i->updateVocabulary(v);
	}
	for (TransformChain::iterator i = m_transforms.begin(); i != m_transforms.end(); ++i) {
		i->updateVocabulary(v);
	}
}

void TransformReactor::operator()(const EventPtr& e)
{
	if (isRunning()) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		incrementEventsIn();

		// For EventFilter: all comparisons in the rule chain must pass for the Event to be delivered

		// For TransformReactor: if all comparisons pass, then transform, otherwise just deliver

		// If m_all_conditions
		//	all conditions must match before transformations take place
		//	-> any condition failure = don't do transformation
		// If !m_all_conditions
		//	any condition is ok for transformations
		//	-> first successful condition = do transformation
		// If no conditions, then transformations immediately take place

		// The efficacy of separately testing for m_rules.empty() is questionable, depends on default case...

		bool do_transformations = true;
		for (RuleChain::const_iterator i = m_rules.begin(); i != m_rules.end(); ++i) {
			if (! i->evaluateBool(*e) ) {
				if (m_all_conditions) {
					do_transformations = false;
					break;
				}
			} else {
				if (!m_all_conditions)
					break;
			}
		}
		if (do_transformations) {
			EventPtr new_e;
			m_event_factory.create(new_e, m_event_type == Vocabulary::UNDEFINED_TERM_REF ? e->getType() : m_event_type);

			*new_e += *e;					// Populate all terms from original event
			for (TransformChain::iterator i = m_transforms.begin(); i != m_transforms.end(); i++)
				i->transform(new_e);
			deliverEvent(new_e);			// Deliver the modified event
		}

		// Transformation is done, deliver original event
		// Should this only be done, if filter rules applied (m_all_conditions)
		if (m_deliver_original == DO_ALWAYS ||
			(m_deliver_original == DO_SOMETIMES && do_transformations))
			deliverEvent(e);
	}
}


}	// end namespace plugins
}	// end namespace pion


/// creates new TransformReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_TransformReactor(void) {
	return new pion::plugins::TransformReactor();
}

/// destroys TransformReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_TransformReactor(pion::plugins::TransformReactor *reactor_ptr) {
	delete reactor_ptr;
}
