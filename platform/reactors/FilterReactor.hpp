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

#ifndef __PION_FILTERREACTOR_HEADER__
#define __PION_FILTERREACTOR_HEADER__

#include <vector>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/Comparison.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// FilterReactor: used to filter out unwanted Events
///
class FilterReactor :
	public Reactor
{
public:

	/// exception thrown if the FilterReactor configuration does not define a Term for a Comparison
	class EmptyTermException : public PionException {
	public:
		EmptyTermException(const std::string& reactor_id)
			: PionException("FilterReactor configuration is missing a term identifier: ", reactor_id) {}
	};
	
	/// exception thrown if the FilterReactor configuration uses an unknown Term for a Comparison
	class UnknownTermException : public PionException {
	public:
		UnknownTermException(const std::string& reactor_id)
			: PionException("FilterReactor configuration maps field to an unknown term: ", reactor_id) {}
	};

	/// exception thrown if the FilterReactor configuration does not define a Comparison operation
	class EmptyComparisonException : public PionException {
	public:
		EmptyComparisonException(const std::string& reactor_id)
			: PionException("FilterReactor configuration does not include a comparison operation: ", reactor_id) {}
	};
	
	/// exception thrown if the FilterReactor configuration does not define a Term for a Comparison
	class EmptyValueException : public PionException {
	public:
		EmptyValueException(const std::string& reactor_id)
			: PionException("FilterReactor configuration is missing a required comparison value: ", reactor_id) {}
	};
	
	
	/// constructs a new FilterReactor object
	FilterReactor(void) : Reactor() {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~FilterReactor() {}
	
	/**
	 * sets configuration parameters for this Reactor
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Reactor
	 *                   configuration parameters
	 */
	virtual void setConfig(const Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this Reactor; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);
	
	
protected:
	
	/**
	 * processes an Event by comparing its data to the configured RuleChain.
	 * Only Events which pass all Comparisons in the RuleChain will be
	 * delivered to Reactors that are connected to this one.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void process(const EventPtr& e);

	/// resets the configuration for this Reactor
	inline void reset(void) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		m_rules.clear();
	}
	
	
private:
	
	/// data type for a chain of Comparison rules
	typedef std::vector<Comparison>		RuleChain;

	
	/// name of the term element for Pion XML config files
	static const std::string		TERM_ELEMENT_NAME;

	/// name of the operation element for Pion XML config files
	static const std::string		OPERATION_ELEMENT_NAME;
	
	/// name of the value element for Pion XML config files
	static const std::string		VALUE_ELEMENT_NAME;

	/// name of the 'match all values' element for Pion XML config files
	static const std::string		MATCH_ALL_VALUES_ELEMENT_NAME;
	
	
	/// a chain of Comparison rules used to filter out unwanted Events
	RuleChain						m_rules;
};


}	// end namespace platform
}	// end namespace pion

#endif
