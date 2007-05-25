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
#include <boost/filesystem/path.hpp>
#include <boost/filesystem/operations.hpp>

#ifdef WIN32
	#include <windows.h>
#else
	#include <dlfcn.h>
#endif


namespace pion {	// begin namespace pion
	
// static members of PionEngine
	
const std::string			PionPlugin::PION_PLUGIN_CREATE("create");
const std::string			PionPlugin::PION_PLUGIN_DESTROY("destroy");
#ifdef WIN32
	const std::string			PionPlugin::PION_PLUGIN_EXTENSION(".dll");
#else
	const std::string			PionPlugin::PION_PLUGIN_EXTENSION(".so");
#endif
std::vector<std::string>	PionPlugin::m_plugin_dirs;
boost::mutex				PionPlugin::m_plugin_mutex;

	
// PionEngine member functions
	
void PionPlugin::addPluginDirectory(const std::string& dir)
{
	if (! boost::filesystem::exists(dir) )
		throw DirectoryNotFoundException(dir);
	boost::mutex::scoped_lock plugin_lock(m_plugin_mutex);
	m_plugin_dirs.push_back(dir);
}

void PionPlugin::resetPluginDirectories(void)
{
	boost::mutex::scoped_lock plugin_lock(m_plugin_mutex);
	m_plugin_dirs.clear();
}

bool PionPlugin::findPluginFile(const std::string& name, std::string& path)
{
	boost::mutex::scoped_lock plugin_lock(m_plugin_mutex);

	// try working directory first
	boost::filesystem::path module_path(".", &boost::filesystem::no_check);
	if (checkForPlugin(module_path, name)) {
		path = module_path.native_directory_string();
		return true;
	}

	// nope, check search paths
	for (std::vector<std::string>::iterator i = m_plugin_dirs.begin();
		 i != m_plugin_dirs.end(); ++i)
	{
		module_path = *i;
		if (checkForPlugin(module_path, name)) {
			path = module_path.native_directory_string();
			return true;
		}
	}
	
	return false;
}

bool PionPlugin::checkForPlugin(boost::filesystem::path& p, const std::string& name)
{
	const boost::filesystem::path base_path(p);
	
	// check for plug-in file without using extension (may already be provided)
	p = base_path / boost::filesystem::path(name, &boost::filesystem::no_check);
	if (boost::filesystem::exists(p)) return true;

	// check for plug-in file with extension
	p = base_path / boost::filesystem::path(name + PION_PLUGIN_EXTENSION, &boost::filesystem::no_check);
	if (boost::filesystem::exists(p)) return true;

	// no plug-in file found
	return false;
}

void *PionPlugin::loadDynamicLibrary(const std::string& plugin_file) {
#ifdef WIN32
	return LoadLibrary(plugin_file.c_str());
#else
	return dlopen(plugin_file.c_str(), RTLD_LAZY);
#endif
}

void PionPlugin::closeDynamicLibrary(void *lib_handle) {
#ifdef WIN32
	FreeLibrary((HINSTANCE) lib_handle);
#else
	dlclose(lib_handle);
#endif
}

void *PionPlugin::getLibrarySymbol(void *lib_handle, const std::string& symbol) {
#ifdef WIN32
	return (void*)GetProcAddress((HINSTANCE) lib_handle, symbol.c_str());
#else
	return dlsym(lib_handle, symbol.c_str());
#endif
}
	
}	// end namespace pion
