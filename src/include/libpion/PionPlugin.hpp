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
#include <boost/function.hpp>
#include <boost/noncopyable.hpp>
#include <string>
#ifndef WIN32
  #include <dlfcn.h>
#endif


namespace pion {	// begin namespace pion

///
/// PionPlugin: manages plug-in code loaded from shared object libraries
///
template <typename InterfaceClassType>
class PionPlugin :
	private boost::noncopyable
{
public:

	/// exception thrown if the plug-in file cannot be opened
	class PluginUndefinedException : public std::exception {
		virtual const char* what() const throw() {
			return "Plug-in was not loaded properly";
		}
	};

	/// exception thrown if the plug-in file cannot be opened
	class PluginNotFoundException : public std::exception {
		virtual const char* what() const throw() {
			return "Unable to open plug-in library";
		}
	};

	/// exception thrown if a plug-in library is missing the create() function
	class PluginMissingCreateException : public std::exception {
		virtual const char* what() const throw() {
			return "Unable to find create symbol in plug-in";
		}
	};

	/// exception thrown if a plug-in library is missing the destroy() function
	class PluginMissingDestroyException : public std::exception {
		virtual const char* what() const throw() {
			return "Unable to find destroy symbol in plug-in";
		}
	};

	/// closes plug-in library, if open
	inline void close(void) {
		m_create_func = NULL;
		m_destroy_func = NULL;
		if (m_library_ptr != NULL) {
			#ifndef WIN32
			dlclose(m_library_ptr);
			#endif
			m_library_ptr = NULL;
		}
	}

	/**
	 * loads plug-in library from a shared object file
	 * 
	 * @param plugin_file shared object file containing the plugin code
	 */
	inline void load(const std::string& plugin_file) {
		close();
		
		#ifndef WIN32
		m_library_ptr = dlopen(plugin_file.c_str(), RTLD_LAZY);
		#endif

		if (m_library_ptr == NULL) throw PluginNotFoundException();

		#ifndef WIN32
		m_create_func = reinterpret_cast<CreateObjectFunction*>(dlsym(m_library_ptr, "create"));
		#endif

		if (m_create_func == NULL) throw PluginMissingCreateException();

		#ifndef WIN32
		m_destroy_func = reinterpret_cast<DestroyObjectFunction*>(dlsym(m_library_ptr, "destroy"));
		#endif

		if (m_destroy_func == NULL) throw PluginMissingDestroyException();
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
	PionPlugin(void)
		: m_library_ptr(NULL), m_create_func(NULL), m_destroy_func(NULL)
	{}

	/**
	 * constructs a new plug-in object
	 * 
	 * @param plugin_file shared object file containing the plugin code
	 */
	PionPlugin(const std::string& plugin_file)
		: m_library_ptr(NULL), m_create_func(NULL), m_destroy_func(NULL)
	{
		load(plugin_file);
	}	

	/// virtual destructor
	virtual ~PionPlugin() { close(); }
	
	
private:

	/// data type for a function that is used to create object instances
	typedef InterfaceClassType* CreateObjectFunction(void);

	/// data type for a function that is used to destroy object instances
	typedef void DestroyObjectFunction(InterfaceClassType*);

	/// symbol library loaded from a shared object file
	void *							m_library_ptr;
	
	/// function used to create instances of the plug-in object
	CreateObjectFunction *			m_create_func;

	/// function used to destroy instances of the plug-in object
	DestroyObjectFunction *			m_destroy_func;
};

}	// end namespace pion

#endif
