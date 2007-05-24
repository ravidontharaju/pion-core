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
#ifdef WIN32
	#include <windows.h>
#else
	#include <dlfcn.h>
#endif


namespace pion {	// begin namespace pion
	
// static members of PionEngine
	
const std::string	PionPluginBase::PION_PLUGIN_CREATE("create");
const std::string	PionPluginBase::PION_PLUGIN_DESTROY("destroy");
boost::mutex		PionPluginBase::PION_PLUGIN_MUTEX;
	
	
// PionEngine member functions

void PionPluginBase::addPluginDirectory(const std::string& dir) {
	// currently does nothing
}

void *PionPluginBase::loadDynamicLibrary(const std::string& plugin_file) {
#ifdef WIN32
	return LoadLibrary(plugin_file.c_str());
#else
	return dlopen(plugin_file.c_str());
#endif
}

void PionPluginBase::closeDynamicLibrary(void *lib_handle) {
#ifdef WIN32
	FreeLibrary((HINSTANCE) lib_handle);
#else
	dlclose(lib_handle);
#endif
}

void *PionPluginBase::getLibrarySymbol(void *lib_handle, const std::string& symbol) {
#ifdef WIN32
	return (void*)GetProcAddress((HINSTANCE) lib_handle, symbol.c_str());
#else
	return dlsym(lib_handle, symbol.c_str());
#endif
}
	
}	// end namespace pion