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

#ifndef __PION_FILEMODULE_HEADER__
#define __PION_FILEMODULE_HEADER__

#include <libpion/HTTPModule.hpp>
#include <libpion/PionException.hpp>
#include <boost/thread/once.hpp>
#include <boost/filesystem/path.hpp>
#include <string>
#include <map>


///
/// FileModule: module that serves regular files
/// 
class FileModule :
	public pion::HTTPModule
{
public:
	
	/// exception thrown if the module does not recognize a configuration option
	class DirectoryNotFoundException : public pion::PionException {
	public:
		DirectoryNotFoundException(const std::string& dir)
			: pion::PionException("FileModule directory not found: ", dir) {}
	};

	/// exception thrown if the module does not recognize a configuration option
	class NotADirectoryException : public pion::PionException {
	public:
		NotADirectoryException(const std::string& dir)
			: pion::PionException("FileModule option is not a directory: ", dir) {}
	};

	// default constructor and destructor
	FileModule(void) : m_directory("", &boost::filesystem::no_check) {}
	virtual ~FileModule() {}
	
	/**
	 * configuration options supported by FileModule:
	 *
	 * directory: all files within the directory will be made available
	 */
	virtual void setOption(const std::string& name, const std::string& value);
	
	/// handles requests for FileModule
	virtual bool handleRequest(pion::HTTPRequestPtr& request,
							   pion::TCPConnectionPtr& tcp_conn);	
	
	
protected:

	/**
	 * searches for a MIME type that matches a file extension
	 *
	 * @param extension the file extension to look for
	 * @param mime_type the MIME type found, if any
	 * @return true if a matching MIME type was found
	 */
	static bool findMIMEType(const std::string& extension, std::string& mime_type);

	
private:

	/// function called once to initialize the map of MIME types
	static void createMIMETypes(void);
		
	/// data type for map of file extensions to MIME types
	typedef std::map<std::string, std::string>	MIMETypeMap;
	
	/// map of file extensions to MIME types
	static MIMETypeMap *		m_mime_types_ptr;
	
	/// flag used to make sure that createMIMETypes() is called only once
	static boost::once_flag		m_mime_types_init_flag;
	
	/// mime type used if no others are found for the file's extension
	static const std::string	DEFAULT_MIME_TYPE;

	/// directory containing files that will be made available
	boost::filesystem::path		m_directory;
};

#endif
