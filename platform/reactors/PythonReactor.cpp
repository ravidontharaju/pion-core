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

#include <Python.h>
#include <pion/platform/ConfigManager.hpp>
#include "PythonReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of LogInputReactor
	
const std::string			PythonReactor::FILENAME_ELEMENT_NAME = "Filename";
boost::mutex				PythonReactor::m_init_mutex;
boost::uint32_t				PythonReactor::m_init_num = 0;


// PythonReactor member functions

PythonReactor::PythonReactor(void)
	: Reactor(TYPE_PROCESSING)
{
	boost::mutex::scoped_lock init_lock(m_init_mutex);
	if (++m_init_num == 1)
		Py_Initialize();
}
	
PythonReactor::~PythonReactor()
{
	stop();
	boost::mutex::scoped_lock init_lock(m_init_mutex);
	if (--m_init_num == 0)
		Py_Finalize();
}

void PythonReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	ConfigWriteLock cfg_lock(*this);
	Reactor::setConfig(v, config_ptr);
	
	// get name of source code file
	if (! ConfigManager::getConfigOption(FILENAME_ELEMENT_NAME, m_source_file, config_ptr))
		throw EmptyFilenameException(getId());
}
	
void PythonReactor::process(const EventPtr& e)
{
	// TODO: implement me!
	
	PyRun_SimpleString("print 'Python got event'\n");
	
	deliverEvent(e);
}
	
	
}	// end namespace plugins
}	// end namespace pion


/// creates new PythonReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_PythonReactor(void) {
	return new pion::plugins::PythonReactor();
}

/// destroys PythonReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_PythonReactor(pion::plugins::PythonReactor *reactor_ptr) {
	delete reactor_ptr;
}
