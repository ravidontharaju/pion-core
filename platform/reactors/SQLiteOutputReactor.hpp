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

#ifndef __PION_SQLITEOUTPUTREACTOR_HEADER__
#define __PION_SQLITEOUTPUTREACTOR_HEADER__

#include <vector>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Reactor.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// SQLiteOutputReactor: stores Events into SQLite transaction tables
/// (Work in progress...)
///
class SQLiteOutputReactor :
	public Reactor
{
public:

	/// exception thrown if the SQLiteOutputReactor configuration does not define a Term for a Comparison
	class EmptyTermException : public PionException {
	public:
		EmptyTermException(const std::string& reactor_id)
			: PionException("SQLiteOutputReactor configuration is missing a term identifier: ", reactor_id) {}
	};
		
	
	/// constructs a new SQLiteOutputReactor object
	SQLiteOutputReactor(void) : Reactor() {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~SQLiteOutputReactor() {}
	
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
	
	/**
	 * processes an Event by comparing its data to the configured RuleChain.
	 * Only Events which pass all Comparisons in the RuleChain will be
	 * delivered to the output connections.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void operator()(const EventPtr& e);
	
	
private:
	
	/// name of the term element for Pion XML config files
	static const std::string		COMPARISON_ELEMENT_NAME;
};


}	// end namespace platform
}	// end namespace pion

#endif
