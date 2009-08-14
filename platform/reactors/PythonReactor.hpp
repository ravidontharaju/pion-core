// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2009 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#ifndef __PION_PYTHONREACTOR_HEADER__
#define __PION_PYTHONREACTOR_HEADER__

#include <string>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Reactor.hpp>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// PythonReactor: used embed Python code within Pion
///
class PythonReactor :
	public pion::platform::Reactor
{
public:	
	
	/// constructs a new PythonReactorReactor object
	PythonReactor(void);
	
	/// virtual destructor: this class is meant to be extended
	virtual ~PythonReactor();
	
	/**
	 * sets configuration parameters for this Reactor
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Reactor
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * processes an Event by comparing its data to the configured RuleChain.
	 * Only Events which pass all Comparisons in the RuleChain will be
	 * delivered to the output connections.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void process(const pion::platform::EventPtr& e);
	
	
private:
	
	/// name of the Filename element for Pion XML config files
	static const std::string		FILENAME_ELEMENT_NAME;

	/// name of the PythonSource element for Pion XML config files
	static const std::string		PYTHON_SOURCE_ELEMENT_NAME;

	/// mutex used to protect the initialization counter
	static boost::mutex				m_init_mutex;
	
	/// total number of PythonReactor instances
	static boost::uint32_t			m_init_num;

	/// string containing python source code to execute
	std::string						m_source;

	/// path to a file containing the Python source code to execute
	std::string						m_source_file;
};


}	// end namespace plugins
}	// end namespace pion

#endif
