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

#include "SQLiteOutputReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of SQLiteOutputReactor

const std::string			SQLiteOutputReactor::COMPARISON_ELEMENT_NAME = "Comparison";

	
// SQLiteOutputReactor member functions

void SQLiteOutputReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);
}
	
void SQLiteOutputReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::updateVocabulary(v);
}
	
void SQLiteOutputReactor::operator()(const EventPtr& e)
{
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	incrementEventsIn();
	deliverEvent(e);
}
	
	
}	// end namespace plugins
}	// end namespace pion


/// creates new SQLiteOutputReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_SQLiteOutputReactor(void) {
	return new pion::plugins::SQLiteOutputReactor();
}

/// destroys SQLiteOutputReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_SQLiteOutputReactor(pion::plugins::SQLiteOutputReactor *reactor_ptr) {
	delete reactor_ptr;
}
