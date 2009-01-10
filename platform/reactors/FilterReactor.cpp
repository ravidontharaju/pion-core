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
#include "FilterReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of FilterReactor

const std::string			FilterReactor::COMPARISON_ELEMENT_NAME = "Comparison";
const std::string			FilterReactor::TERM_ELEMENT_NAME = "Term";
const std::string			FilterReactor::TYPE_ELEMENT_NAME = "Type";
const std::string			FilterReactor::VALUE_ELEMENT_NAME = "Value";
const std::string			FilterReactor::MATCH_ALL_VALUES_ELEMENT_NAME = "MatchAllValues";
const std::string			FilterReactor::MATCH_ALL_COMPARISONS_ELEMENT_NAME = "MatchAllComparisons";


// FilterReactor member functions

void FilterReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);

	// clear the current configuration
	m_rules.clear();

	// check if all Comparison rules must match
	m_match_all_comparisons = false;
	std::string match_all_comparisons_str;
	if (ConfigManager::getConfigOption(MATCH_ALL_COMPARISONS_ELEMENT_NAME, match_all_comparisons_str,
									   config_ptr))
	{
		if (match_all_comparisons_str == "true")
			m_match_all_comparisons = true;
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
}

void FilterReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::updateVocabulary(v);

	// update Vocabulary for each of the rules
	for (RuleChain::iterator i = m_rules.begin(); i != m_rules.end(); ++i) {
		i->updateVocabulary(v);
	}
}

void FilterReactor::operator()(const EventPtr& e)
{
	if (isRunning()) {
		incrementEventsIn();

		RuleChain::const_iterator i = m_rules.begin();
		if (m_match_all_comparisons) {
			// all comparisons in the rule chain must pass for the Event to be delivered
			for (; i != m_rules.end(); ++i) {
				if (! i->evaluate(*e) )
					return;
			}
		} else {
			// any one comparison in the rule chain must pass for the Event to be delivered
			for (; i != m_rules.end(); ++i) {
				if ( i->evaluate(*e) )
					break;
			}
			// return if none matched & at least one rule is defined
			if ( i == m_rules.end() && ! m_rules.empty() )
				return;
		}

		deliverEvent(e);
	}
}


}	// end namespace plugins
}	// end namespace pion


/// creates new FilterReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_FilterReactor(void) {
	return new pion::plugins::FilterReactor();
}

/// destroys FilterReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_FilterReactor(pion::plugins::FilterReactor *reactor_ptr) {
	delete reactor_ptr;
}
