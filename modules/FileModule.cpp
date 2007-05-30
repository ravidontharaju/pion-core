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
#include <libpion/PionPlugin.hpp>
#include <libpion/HTTPResponse.hpp>
#include <boost/scoped_array.hpp>
#include <boost/filesystem/operations.hpp>
#include <fstream>
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
		m_directory = boost::filesystem::path(value, &boost::filesystem::no_check);
		PionPlugin::checkCygwinPath(m_directory, value);
		// make sure that the directory exists
		if (! boost::filesystem::exists(m_directory) )
			throw DirectoryNotFoundException(value);
		if (! boost::filesystem::is_directory(m_directory) )
			throw NotADirectoryException(value);
	} else if (name == "file") {
		m_file = boost::filesystem::path(value, &boost::filesystem::no_check);
		PionPlugin::checkCygwinPath(m_file, value);
		// make sure that the directory exists
		if (! boost::filesystem::exists(m_file) )
			throw FileNotFoundException(value);
		if (boost::filesystem::is_directory(m_file) )
			throw NotAFileException(value);
	} else {
		throw UnknownOptionException(name);
	}
}

bool FileModule::handleRequest(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	std::string file_name;
	unsigned long file_size;
	const std::string relative_resource(getRelativeResource(request->getResource()));

	// check the resource path relative to the module's location
	if (relative_resource.empty()) {

		// request matches resource exactly
		if (m_file.empty())
			return false;	// no file defined -> module's directory is not valid
		
		// use file to service directory request
		file_name = m_file.native_directory_string();
		file_size = boost::filesystem::file_size(m_file);

	} else if (! m_directory.empty()) {

		// calculate the location of the file being requested
		boost::filesystem::path file_path(m_directory);
		file_path /= boost::filesystem::path(relative_resource, &boost::filesystem::no_check);

		// make sure that the file exists and is not a directory
		if (! boost::filesystem::exists(file_path) || boost::filesystem::is_directory(file_path))
			return false;
		
		// make sure that the file is within the configured directory
		file_name = file_path.native_directory_string();
		if (file_name.find(m_directory.native_directory_string()) != 0)
			return false;
		
		// get the size of the file
		file_size = boost::filesystem::file_size(file_path);

	} else {
		// request does not match exactly and no directory is defined
		return false;
	}
	
	// prepare a response
	HTTPResponsePtr response(HTTPResponse::create());

	if (file_size != 0) {
		// allocate memory for the contents of the file
		boost::scoped_array<char> file_data(new char[file_size]);
		
		// open the file for reading
		std::ifstream file_stream;
		file_stream.open(file_name.c_str(), std::ios::in | std::ios::binary);
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
extern "C" FileModule *pion_create_FileModule(void)
{
	return new FileModule();
}


/// destroys FileModule objects
extern "C" void pion_destroy_FileModule(FileModule *module_ptr)
{
	delete module_ptr;
}
