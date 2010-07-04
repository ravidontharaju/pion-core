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

#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/RuleChain.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of RuleChain

const std::string			RuleChain::COMPARISON_ELEMENT_NAME = "Comparison";
const std::string			RuleChain::TERM_ELEMENT_NAME = "Term";
const std::string			RuleChain::TYPE_ELEMENT_NAME = "Type";
const std::string			RuleChain::VALUE_ELEMENT_NAME = "Value";
const std::string			RuleChain::MATCH_ALL_VALUES_ELEMENT_NAME = "MatchAllValues";
const std::string			RuleChain::MATCH_ALL_COMPARISONS_ELEMENT_NAME = "MatchAllComparisons";

	
// SessionFilterReactor member functions

void RuleChain::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// clear the current configuration
	m_comparisons.clear();
	
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
			throw EmptyTermException();
		
		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(term_id);

		// get the Comparison type & make sure that it is valid
		std::string type_str;
		if (! ConfigManager::getConfigOption(TYPE_ELEMENT_NAME, type_str,
											 comparison_node->children))
			throw EmptyTypeException();
		// note: parseComparisonType will throw if it is invalid
		const Comparison::ComparisonType comparison_type = Comparison::parseComparisonType(type_str);

		// get the value parameter (only if type has arity > 1)
		std::string value_str;
		if (Comparison::requiresValue(comparison_type)) {
			if (! ConfigManager::getConfigOptionEmptyOk(VALUE_ELEMENT_NAME, value_str,
												 comparison_node->children))
				throw EmptyValueException();
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
		m_comparisons.push_back(new_comparison);
		
		// step to the next Comparison rule
		comparison_node = comparison_node->next;
	}
}
	
void RuleChain::updateVocabulary(const Vocabulary& v)
{
	// update Vocabulary for each of the Comparisons
	for (ComparisonVector::iterator i = m_comparisons.begin(); i != m_comparisons.end(); ++i) {
		i->updateVocabulary(v);
	}
}


}	// end namespace platform
}	// end namespace pion
