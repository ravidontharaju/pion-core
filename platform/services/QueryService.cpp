// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Pion is free software: you can redistribute it and/or modify it under the
// terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option)
// any later version.
//
// Pion is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
// more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Pion.  If not, see <http://www.gnu.org/licenses/>.
//

#include "QueryService.hpp"
#include <boost/bind.hpp>
#include <pion/net/HTTPResponseWriter.hpp>
#include <pion/net/PionUser.hpp>
#include "PlatformConfig.hpp"

using namespace pion;
using namespace pion::net;

namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins

	
// QueryService member functions

/// handles requests for QueryService
void QueryService::operator()(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	// split out the path branches from the HTTP request
	PathBranches branches;
	splitPathBranches(branches, request->getResource());

	// use a response in case we want to change any of the headers/etc.
	// while processing the request
	HTTPResponsePtr response_ptr(new HTTPResponse(*request));

	// use a stringstream for the response content
	// since HTTPResponseWriter does not yet have a stream wrapper available
	std::ostringstream ss;

/*
	for (int i = 0; i < branches.size() ; i++ )
		xml += branches[i] + "::";

	xml += "\r\n";
*/
	/*
	 *	branches[0]	== reactors
	 *	branches[1] == UUID
	 *	branches[2] == aggregate/example/info
	 */

	if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
		if (branches.size() >= 2 && branches.front() == "reactors") {
			if (getConfig().getReactionEngine().hasPlugin(branches.at(1))) {
				getConfig().getReactionEngine().query(
					branches.at(1), ss, branches,
					request->getQueryParams());
			} else {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		} else {
			throw UnknownQueryException();
		}
	} else {
		// send a 405 (method not allowed) response
		response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
		response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
	}

	// Set Content-type to "text/plain" (plain ascii text)
	HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, response_ptr,
															boost::bind(&TCPConnection::finish, tcp_conn)));
	writer->getResponse().setContentType(HTTPTypes::CONTENT_TYPE_XML);

	writer->write(ss.str());
	
	// send the writer
	writer->send();
}


}	// end namespace plugins
}	// end namespace pion


/// creates new QueryService objects
extern "C" PION_SERVICE_API pion::server::PlatformService *pion_create_QueryService(void)
{
	return new pion::plugins::QueryService();
}

/// destroys QueryService objects
extern "C" PION_SERVICE_API void pion_destroy_QueryService(pion::plugins::QueryService *service_ptr)
{
	delete service_ptr;
}
