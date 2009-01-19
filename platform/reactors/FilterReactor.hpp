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
#include <pion/PionConfig.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/RuleChain.hpp>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// FilterReactor: used to filter out unwanted Events
///
class FilterReactor :
	public pion::platform::Reactor
{
public:	
	
	/// constructs a new FilterReactor object
	FilterReactor(void) : Reactor(TYPE_PROCESSING) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~FilterReactor() { stop(); }
	
	/**
	 * sets configuration parameters for this Reactor
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Reactor
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this Reactor; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 */
	virtual void updateVocabulary(const pion::platform::Vocabulary& v);
	
	/**
	 * processes an Event by comparing its data to the configured RuleChain.
	 * Only Events which pass all Comparisons in the RuleChain will be
	 * delivered to the output connections.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void operator()(const pion::platform::EventPtr& e);
	
	
private:
	
	/// a chain of Comparison rules used to filter out unwanted Events
	pion::platform::RuleChain		m_rules;
};


}	// end namespace plugins
}	// end namespace pion

#endif
