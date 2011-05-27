// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2011 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#ifndef __PION_RULECHAIN_HEADER__
#define __PION_RULECHAIN_HEADER__

#include <string>
#include <vector>
#include <libxml/tree.h>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/Comparison.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


class PION_PLATFORM_API RuleChain
{
public:

	/// exception thrown if unable to find the configured Vocabulary Term
	class UnknownTermException : public PionException {
	public:
		UnknownTermException(const std::string& term)
			: PionException("Unable to find required Vocabulary term for Comparison rule: ", term) {}
	};

	/// exception thrown if the configuration does not define a Term for a Comparison
	class EmptyTermException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "Comparison rule configuration is missing a term identifier";
		}
	};

	/// exception thrown if the configuration does not define a Comparison type
	class EmptyTypeException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "Comparison rule configuration does not include a comparison type";
		}
	};

	/// exception thrown if the configuration does not define a Term for a Comparison
	class EmptyValueException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "Comparison rule configuration is missing a required comparison value";
		}
	};


	/// default constructor for a RuleChain
	RuleChain(void) {}

	/// virtual destructor: this class is meant to be extended
	virtual ~RuleChain() {}

	/**
	 * sets configuration parameters for this RuleChain
	 *
	 * @param v the Vocabulary that this RuleChain will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing RuleChain
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this RuleChain; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this RuleChain will use to describe Terms
	 */
	virtual void updateVocabulary(const pion::platform::Vocabulary& v);

	/**
	 * Checks to see if an Event passes the RuleChain configuration
	 *
	 * @param e pointer to the Event to process
	 * @return true if the Event passes the RuleChain, false if not
	 */
	inline bool operator()(const pion::platform::EventPtr& e);


private:

	/// data type for a chain of Comparison rules
	typedef std::vector<pion::platform::Comparison>		ComparisonVector;


	/// name of the term element for Pion XML config files
	static const std::string		COMPARISON_ELEMENT_NAME;
	
	/// name of the term element for Pion XML config files
	static const std::string		TERM_ELEMENT_NAME;

	/// name of the type element for Pion XML config files
	static const std::string		TYPE_ELEMENT_NAME;
	
	/// name of the value element for Pion XML config files
	static const std::string		VALUE_ELEMENT_NAME;

	/// name of the 'match all values' element for Pion XML config files
	static const std::string		MATCH_ALL_VALUES_ELEMENT_NAME;
	
	/// name of the 'match all values' element for Pion XML config files
	static const std::string		MATCH_ALL_COMPARISONS_ELEMENT_NAME;


	/// a chain of Comparison rules used to filter out unwanted Events
	ComparisonVector				m_comparisons;

	/// if true, all comparison rules must match for the filter test to pass
	/// if false, only one comparison rule must match
	bool							m_match_all_comparisons;
};


// inline members for RuleChain

inline bool RuleChain::operator()(const pion::platform::EventPtr& e)
{
	ComparisonVector::iterator i = m_comparisons.begin();

	// Note: it's not necessarily logically consistent to return true when there are no comparisons when 
	// m_match_all_comparisons is false, since we interpret the latter to mean "at least one comparison passed".
	// Unfortunately, there is the expectation that a FilterReactor with an empty configuration lets all
	// events through, and the default value of m_match_all_comparisons is false.
	if (m_comparisons.empty())
		return true;

	if (m_match_all_comparisons) {
		// all comparisons in the rule chain must pass for the Event to be delivered
		for (; i != m_comparisons.end(); ++i) {
			if (i->isRunning()) {
				try {
					if (! i->evaluate(*e) )
						return false;
				} catch (pion::platform::Comparison::RegexFailure&) {
				}
			}
		}
		return true;
	} else {
		// any one comparison in the rule chain must pass for the Event to be delivered
		for (; i != m_comparisons.end(); ++i) {
			if (i->isRunning()) {
				try {
					if ( i->evaluate(*e) )
						return true;
				} catch (pion::platform::Comparison::RegexFailure&) {
				}
			}
		}
		return false;
	}
}


}	// end namespace platform
}	// end namespace pion

#endif
