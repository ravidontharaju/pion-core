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

#ifndef __PION_PIONPLUGIN_HEADER__
#define __PION_PIONPLUGIN_HEADER__

#include <libpion/PionConfig.hpp>
#include <libpion/PionException.hpp>
#include <boost/noncopyable.hpp>
#include <boost/thread/mutex.hpp>
#include <vector>
#include <string>

// forward declaration of boost::filesystem::path
namespace boost { namespace filesystem { class path; } }


namespace pion {	// begin namespace pion

///
/// PionPlugin: base class for plug-in management
///
class PionPlugin {
public:

	/// exception thrown if the plug-in file cannot be opened
	class PluginUndefinedException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "Plug-in was not loaded properly";
		}
	};
	
	/// exception thrown if the plug-in directory does not exist
	class DirectoryNotFoundException : public pion::PionException {
	public:
		DirectoryNotFoundException(const std::string& dir)
			: pion::PionException("Plug-in directory not found: ", dir) {}
	};

	/// exception thrown if the plug-in file cannot be opened
	class PluginNotFoundException : public PionException {
	public:
		PluginNotFoundException(const std::string& dir)
			: PionException("Plug-in library not found: ", dir) {}
	};
	
	/// exception thrown if a plug-in library is missing the create() function
	class PluginMissingCreateException : public PionException {
	public:
		PluginMissingCreateException(const std::string& dir)
			: PionException("Plug-in library does not include create() symbol: ", dir) {}
	};
	
	/// exception thrown if a plug-in library is missing the destroy() function
	class PluginMissingDestroyException : public PionException {
	public:
		PluginMissingDestroyException(const std::string& dir)
			: PionException("Plug-in library does not include destroy() symbol: ", dir) {}
	};

	// default constructor and destructor
	PionPlugin(void) {}
	virtual ~PionPlugin() {}
	
	/// appends a directory to the plug-in search path
	static void addPluginDirectory(const std::string& dir);
	
	/// clears all directories from the plug-in search path
	static void resetPluginDirectories(void);
	
	/**
	 * searches directories for a valid plug-in file
	 *
	 * @param name name of the plug-in to search for
	 * @param path the path to the plug-in file, if found
	 * @return true if the plug-in file was found
	 */
	static bool findPluginFile(const std::string& name, std::string& path);

	
protected:
	
	/// returns true if plug-in name exists within path p
	static bool checkForPlugin(boost::filesystem::path& p, const std::string& name);

	/// load a dynamic library from plugin_file and return its handle
	static void *loadDynamicLibrary(const std::string& plugin_file);

	/// close the dynamic library corresponding with lib_handle
	static void closeDynamicLibrary(void *lib_handle);

	/// returns the address of a library symbal
	static void *getLibrarySymbol(void *lib_handle, const std::string& symbol);
	
		
	/// name of function defined in object code to create a new plug-in instance
	static const std::string			PION_PLUGIN_CREATE;

	/// name of function defined in object code to destroy a plug-in instance
	static const std::string			PION_PLUGIN_DESTROY;

	/// file extension used for Pion plug-ins (platform specific)
	static const std::string			PION_PLUGIN_EXTENSION;
	
private:
		
	/// directories containing plugin files
	static std::vector<std::string>		m_plugin_dirs;

	/// mutex to make class thread-safe
	static boost::mutex					m_plugin_mutex;
};


///
/// PionPluginPtr: manages plug-in code loaded from shared object libraries.
///
template <typename InterfaceClassType>
class PionPluginPtr :
	public PionPlugin,
	private boost::noncopyable
{
public:

	/// closes plug-in library, if open
	inline void close(void) {
		m_create_func = NULL;
		m_destroy_func = NULL;
		if (m_lib_handle != NULL) {
			closeDynamicLibrary(m_lib_handle);
			m_lib_handle = NULL;
		}
	}

	/**
	 * opens plug-in library within a shared object file
	 * 
	 * @param plugin_file shared object file containing the plugin code
	 */
	inline void open(const std::string& plugin_file) {
		close();
		
		// attempt to open the plugin; note that this tries all search paths
		// and also tries a variety of platform-specific extensions
		m_lib_handle = loadDynamicLibrary(plugin_file.c_str());
		if (m_lib_handle == NULL) throw PluginNotFoundException(plugin_file);

		// find the function used to create new plugin objects
		m_create_func = (CreateObjectFunction*)(getLibrarySymbol(m_lib_handle, PION_PLUGIN_CREATE));
		if (m_create_func == NULL) throw PluginMissingCreateException(plugin_file);

		// find the function used to destroy existing plugin objects
		m_destroy_func = (DestroyObjectFunction*)(getLibrarySymbol(m_lib_handle, PION_PLUGIN_DESTROY));
		if (m_destroy_func == NULL) throw PluginMissingDestroyException(plugin_file);
	}	

	/// creates a new instance of the plug-in object
	inline InterfaceClassType *create(void) {
		if (m_create_func == NULL) throw PluginUndefinedException();
		return m_create_func();
	}
	
	/// destroys an instance of the plug-in object
	inline void destroy(InterfaceClassType *object_ptr) {
		if (m_destroy_func == NULL) throw PluginUndefinedException();
		m_destroy_func(object_ptr);
	}
	
	/// default constructor
	PionPluginPtr(void)
		: m_lib_handle(NULL), m_create_func(NULL), m_destroy_func(NULL)
	{}

	/**
	 * constructs a new plug-in object
	 * 
	 * @param plugin_file shared object file containing the plugin code
	 */
	PionPluginPtr(const std::string& plugin_file)
		: m_lib_handle(NULL), m_create_func(NULL), m_destroy_func(NULL)
	{
		open(plugin_file);
	}	

	/// virtual destructor
	virtual ~PionPluginPtr() { close(); }
	
	
private:

	/// data type for a function that is used to create object instances
	typedef InterfaceClassType* CreateObjectFunction(void);

	/// data type for a function that is used to destroy object instances
	typedef void DestroyObjectFunction(InterfaceClassType*);

	/// symbol library loaded from a shared object file
	void *							m_lib_handle;
	
	/// function used to create instances of the plug-in object
	CreateObjectFunction *			m_create_func;

	/// function used to destroy instances of the plug-in object
	DestroyObjectFunction *			m_destroy_func;
};

}	// end namespace pion

#endif
