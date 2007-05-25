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
	boost::filesystem::path plugin_path(dir, &boost::filesystem::no_check);
	checkCygwinPath(plugin_path, dir);
	if (! boost::filesystem::exists(plugin_path) )
		throw DirectoryNotFoundException(dir);
	boost::mutex::scoped_lock plugin_lock(m_plugin_mutex);
	m_plugin_dirs.push_back(plugin_path.native_directory_string());
}

void PionPlugin::resetPluginDirectories(void)
{
	boost::mutex::scoped_lock plugin_lock(m_plugin_mutex);
	m_plugin_dirs.clear();
}

bool PionPlugin::findPluginFile(const std::string& name, std::string& path_to_file)
{
	// first, try the name as-is
	if (checkForPlugin(path_to_file, name, ""))
		return true;

	// nope, check search paths
	boost::mutex::scoped_lock plugin_lock(m_plugin_mutex);
	for (std::vector<std::string>::iterator i = m_plugin_dirs.begin();
		 i != m_plugin_dirs.end(); ++i)
	{
		if (checkForPlugin(path_to_file, *i, name))
			return true;
	}
	
	// no plug-in file found
	return false;
}

bool PionPlugin::checkForPlugin(std::string& final_path, const std::string& start_path, const std::string& name)
{
	// check for cygwin path oddities
	boost::filesystem::path cygwin_safe_path(start_path, &boost::filesystem::no_check);
	checkCygwinPath(cygwin_safe_path, start_path);
	boost::filesystem::path test_path(cygwin_safe_path);

	// if a name is specified, append it to the test path
	if (! name.empty())
		test_path /= boost::filesystem::path(name, &boost::filesystem::no_check);

	// check for existence of plug-in (without extension)		
	if (boost::filesystem::exists(test_path)) {
		final_path = test_path.native_directory_string();
		return true;
	}
		
	// next, try appending the plug-in extension		
	if (name.empty()) {
		// no "name" specified -> append it directly to start_path
		test_path = boost::filesystem::path(start_path + PION_PLUGIN_EXTENSION,
			&boost::filesystem::no_check);
		// in this case, we need to re-check for the cygwin oddities
		checkCygwinPath(test_path, start_path + PION_PLUGIN_EXTENSION);
	} else {
		// name is specified, so we can just re-use cygwin_safe_path
		test_path = cygwin_safe_path /
			boost::filesystem::path(name + PION_PLUGIN_EXTENSION,
				&boost::filesystem::no_check);
	}

	// re-check for existence of plug-in (after adding extension)		
	if (boost::filesystem::exists(test_path)) {
		final_path = test_path.native_directory_string();
		return true;
	}
	
	// no plug-in file found
	return false;
}

void PionPlugin::checkCygwinPath(boost::filesystem::path& final_path, const std::string& path_string)
{
#ifdef PION_CYGWIN_DIRECTORY
	// try prepending PION_CYGWIN_DIRECTORY if not complete
	if (! final_path.is_complete() && final_path.has_root_directory())
	{
		final_path = boost::filesystem::path(
			std::string(PION_CYGWIN_DIRECTORY) + path_string,
			&boost::filesystem::no_check);
	}
#endif
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
