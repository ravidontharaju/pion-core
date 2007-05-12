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


namespace pion {	// begin namespace pion

// HelloModule member functions

bool HelloModule::handleRequest(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	static const std::string HELLO_HTML = "<html><body>Hello World!</body></html>\r\n\r\n";
	HTTPResponsePtr response(HTTPResponse::create());
	response->writeNoCopy(HELLO_HTML);
	response->send(tcp_conn);
	return true;
}

}	// end namespace pion


/// creates new HelloModule objects
extern "C" HelloModule *create(void)
{
	return new HelloModule();
}


/// destroys HelloModule objects
extern "C" destroy(HelloModule *module_ptr)
{
	delete module_ptr;
}
