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

#include "FileModule.hpp"
#include <libpion/HTTPResponse.hpp>
#include <boost/scoped_array.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/filesystem/fstream.hpp>
#include <algorithm>

using namespace pion;


// static members of FileModule

FileModule::MIMETypeMap	*	FileModule::m_mime_types_ptr = NULL;
boost::once_flag			FileModule::m_mime_types_init_flag = BOOST_ONCE_INIT;
const std::string			FileModule::DEFAULT_MIME_TYPE("application/octet-stream");


// FileModule member functions

bool FileModule::findMIMEType(const std::string& extension, std::string& mime_type) {
	boost::call_once(FileModule::createMIMETypes, m_mime_types_init_flag);
	MIMETypeMap::iterator i = m_mime_types_ptr->find(extension);
	if (i == m_mime_types_ptr->end()) return false;
	mime_type = i->second;
	return true;
}

void FileModule::createMIMETypes(void) {
	// create the map
	static MIMETypeMap mime_types;
	
	// populate mime types
	mime_types["txt"] = "text/plain";
	mime_types["xml"] = "text/xml";
	mime_types["htm"] = "text/html";
	mime_types["html"] = "text/html";
	mime_types["gif"] = "image/gif";
	mime_types["png"] = "image/png";
	mime_types["jpg"] = "image/jpeg";
	mime_types["jpeg"] = "image/jpeg";
	// ...
	
	// set the static pointer
	m_mime_types_ptr = &mime_types;
}

void FileModule::setOption(const std::string& name, const std::string& value)
{
	if (name == "directory") {
		m_directory = value;
		// make sure that the directory exists
		if (! boost::filesystem::exists(m_directory) )
			throw DirectoryNotFoundException(value);
		if (! boost::filesystem::is_directory(m_directory) )
			throw NotADirectoryException(value);
	} else {
		throw UnknownOptionException(name);
	}
}

bool FileModule::handleRequest(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	// get the resource path relative to the module's location
	const std::string relative_resource(getRelativeResource(request->getResource()));
	if (relative_resource.empty()) return false;	// module's directory is not valid
	
	// calculate the location of the file being requested
	const boost::filesystem::path file_path(m_directory / relative_resource);

	// make sure that the file exists and is not a directory
	if (! boost::filesystem::exists(file_path) || boost::filesystem::is_directory(file_path))
		return false;

	// make sure that the file is within the configured directory
	const std::string file_name(file_path.native_directory_string());
	if (file_name.find(m_directory.native_directory_string()) != 0)
		return false;
	
	// get the size of the file
	const unsigned long file_size = boost::filesystem::file_size(file_path);

	// prepare a response
	HTTPResponsePtr response(HTTPResponse::create());

	if (file_size != 0) {
		// allocate memory for the contents of the file
		boost::scoped_array<char> file_data(new char[file_size]);
		
		// open the file for reading
		boost::filesystem::ifstream file_stream;
		file_stream.open(file_path, std::ios::in | std::ios::binary);
		if (! file_stream.is_open())
			return false;	// unable to open file for reading -> return not found
		
		// read the file into memory
		if (! file_stream.read(file_data.get(), file_size))
			return false;	// unable to read file contents -> return not found
		
		// write the file's contents to the response stream
		response->write(file_data.get(), file_size);
	}
	
	// determine the MIME type using the file's extension
	std::string file_extension(file_name.substr(file_name.find_last_of('.') + 1));
	std::transform(file_extension.begin(), file_extension.end(),
				   file_extension.begin(), tolower);
	std::string mime_type;
	if (! findMIMEType(file_extension, mime_type))
		mime_type = DEFAULT_MIME_TYPE;
	response->setContentType(mime_type);
	
	// send the response
	response->send(tcp_conn);
	return true;
}


/// creates new FileModule objects
extern "C" FileModule *create(void)
{
	return new FileModule();
}


/// destroys FileModule objects
extern "C" void destroy(FileModule *module_ptr)
{
	delete module_ptr;
}
