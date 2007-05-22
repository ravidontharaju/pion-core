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

#include <libpion/HTTPModule.hpp>
#include <libpion/HTTPResponse.hpp>

using namespace pion;


/// Module that responds with "Hello World"
class FileModule :
	public HTTPModule
{
public:
	FileModule(void) {}
	virtual ~FileModule() {}
	virtual bool handleRequest(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn);
};


/// handles requests for FileModule
bool FileModule::handleRequest(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	static const std::string HELLO_HTML = "<html><body>FileModule not yet implemented.</body></html>\r\n\r\n";
	HTTPResponsePtr response(HTTPResponse::create());
	response->writeNoCopy(HELLO_HTML);
	response->send(tcp_conn);
	return true;
}


/// creates new FileModule objects
extern "C" FileModule *FileModule_LTX_create(void)
{
	return new FileModule();
}


/// destroys FileModule objects
extern "C" void FileModule_LTX_destroy(FileModule *module_ptr)
{
	delete module_ptr;
}
