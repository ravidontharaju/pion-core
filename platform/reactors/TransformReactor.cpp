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

	
// TransformReactor member functions

void TransformReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);
	
	// clear the current configuration
	m_rules.clear();
	
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
	
	// start up the reactor
	reactor_lock.unlock();
	start();
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
}
	
void TransformReactor::operator()(const EventPtr& e)
{
	if (isRunning()) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		incrementEventsIn();

		// all comparisons in the rule chain must pass for the Event to be delivered
		for (RuleChain::const_iterator i = m_rules.begin(); i != m_rules.end(); ++i) {
			if (! i->evaluate(*e))
				return;
		}

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
