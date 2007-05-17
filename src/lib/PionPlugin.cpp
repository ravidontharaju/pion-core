// -----------------------------------------------------------------
// libpion: a C++ framework for building lightweight HTTP interfaces
// -----------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
//

#include <libpion/PionConfig.hpp>
#include <libpion/PionPlugin.hpp>


namespace pion {	// begin namespace pion
	
boost::mutex			PION_LTDL_MUTEX;
boost::once_flag		PION_LTDL_INIT_FLAG = BOOST_ONCE_INIT;

void PION_ADD_PLUGIN_DIRECTORY(const std::string& dir) {
	// lock the ltdl library and make sure it was initialized
	boost::mutex::scoped_lock ltdl_lock(PION_LTDL_MUTEX);
	boost::call_once(reinterpret_cast<void (*)()>(lt_dlinit), PION_LTDL_INIT_FLAG);
	// add the directory to the ltdl search path
	lt_dladdsearchdir(dir.c_str());
}

}	// end namespace pion