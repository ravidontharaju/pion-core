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
#include <boost/noncopyable.hpp>
#include <boost/thread/mutex.hpp>
#include <boost/thread/once.hpp>
#include <string>
#include <ltdl.h>


#define PION_CREATE_PLUGIN "create"
#define PION_DESTROY_PLUGIN "destroy"


namespace pion {	// begin namespace pion

	
/// mutex used to make the ltdl library thread-safe
extern boost::mutex			PION_LTDL_MUTEX;

/// flag used to make sure that the ltdl library is initialized only once
extern boost::once_flag		PION_LTDL_INIT_FLAG;

/// appends a directory to the plug-in search path
void PION_ADD_PLUGIN_DIRECTORY(const std::string& dir);



///
/// PionPlugin: manages plug-in code loaded from shared object libraries.  This
/// class uses the ltdl library included with GNU libtool.  For more information
/// on ltdl, please see http://www.gnu.org/software/libtool/manual.html#Using-libltdl
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
		if (m_handle != NULL) {
			boost::mutex::scoped_lock ltdl_lock(PION_LTDL_MUTEX);
			lt_dlclose(m_handle);
			m_handle = NULL;
		}
	}

	/**
	 * opens plug-in library within a shared object file
	 * 
	 * @param plugin_file shared object file containing the plugin code
	 */
	inline void open(const std::string& plugin_file) {
		close();
		// lock the ltdl library and make sure it was initialized
		boost::mutex::scoped_lock ltdl_lock(PION_LTDL_MUTEX);
		boost::call_once(reinterpret_cast<void (*)()>(lt_dlinit), PION_LTDL_INIT_FLAG);
		
		// attempt to open the plugin; note that this tries all search paths
		// and also tries a variety of platform-specific extensions
		m_handle = lt_dlopenext(plugin_file.c_str());
		if (m_handle == NULL) throw PluginNotFoundException();

		// find the function used to create new plugin objects
		m_create_func = reinterpret_cast<CreateObjectFunction*>(lt_dlsym(m_handle, PION_CREATE_PLUGIN));
		if (m_create_func == NULL) throw PluginMissingCreateException();

		// find the function used to destroy existing plugin objects
		m_destroy_func = reinterpret_cast<DestroyObjectFunction*>(lt_dlsym(m_handle, PION_DESTROY_PLUGIN));
		if (m_destroy_func == NULL) throw PluginMissingDestroyException();
	}	

	/// creates a new instance of the plug-in object
	inline InterfaceClassType *create(void) {
		if (m_create_func == NULL) throw PluginUndefinedException();
		boost::mutex::scoped_lock ltdl_lock(PION_LTDL_MUTEX);
		return m_create_func();
	}
	
	/// destroys an instance of the plug-in object
	inline void destroy(InterfaceClassType *object_ptr) {
		if (m_destroy_func == NULL) throw PluginUndefinedException();
		boost::mutex::scoped_lock ltdl_lock(PION_LTDL_MUTEX);
		m_destroy_func(object_ptr);
	}
	
	/// default constructor
	PionPlugin(void)
		: m_handle(NULL), m_create_func(NULL), m_destroy_func(NULL)
	{}

	/**
	 * constructs a new plug-in object
	 * 
	 * @param plugin_file shared object file containing the plugin code
	 */
	PionPlugin(const std::string& plugin_file)
		: m_handle(NULL), m_create_func(NULL), m_destroy_func(NULL)
	{
		open(plugin_file);
	}	

	/// virtual destructor
	virtual ~PionPlugin() { close(); }
	
	
private:

	/// data type for a function that is used to create object instances
	typedef InterfaceClassType* CreateObjectFunction(void);

	/// data type for a function that is used to destroy object instances
	typedef void DestroyObjectFunction(InterfaceClassType*);

	/// symbol library loaded from a shared object file
	lt_dlhandle						m_handle;
	
	/// function used to create instances of the plug-in object
	CreateObjectFunction *			m_create_func;

	/// function used to destroy instances of the plug-in object
	DestroyObjectFunction *			m_destroy_func;
};

}	// end namespace pion

#endif
