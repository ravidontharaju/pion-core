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

#include <sstream>
#include <pion/net/HTTPResponseWriter.hpp>
#include "PlatformConfig.hpp"
#include "ConfigService.hpp"

using namespace pion::net;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)

		
// ConfigService member functions

void ConfigService::operator()(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	// get the relative resource path for the request
	const std::string relative_path(getRelativeResource(request->getResource()));

	// use a stringstream for the response content
	// since HTTPResponseWriter does not yet have a stream wrapper available
	std::stringstream ss;

	if (relative_path.empty()) {
		getConfig().writeConfigXML(ss);
	} else if (relative_path == "vocabularies") {
		if (request->hasQuery("id")) {
			if (! getConfig().getVocabularyManager().writeConfigXML(ss, request->getQuery("id"))) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		} else {
			getConfig().getVocabularyManager().writeConfigXML(ss);
		}
	} else if (relative_path == "codecs") {
		if (request->hasQuery("id")) {
			if (! getConfig().getCodecFactory().writeConfigXML(ss, request->getQuery("id"))) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		} else {
			getConfig().getCodecFactory().writeConfigXML(ss);
		}
	} else if (relative_path == "databases") {
		if (request->hasQuery("id")) {
			if (! getConfig().getDatabaseManager().writeConfigXML(ss, request->getQuery("id"))) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		} else {
			getConfig().getDatabaseManager().writeConfigXML(ss);
		}
	} else if (relative_path == "reactors") {
		if (request->hasQuery("id")) {
			if (! getConfig().getReactionEngine().writeConfigXML(ss, request->getQuery("id"))) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		} else {
			getConfig().getReactionEngine().writeConfigXML(ss);
		}
	} else if (relative_path == "services") {
		if (request->hasQuery("id")) {
			if (! getConfig().getServiceManager().writeConfigXML(ss, request->getQuery("id"))) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		} else {
			getConfig().getServiceManager().writeConfigXML(ss);
		}
	} else {
		HTTPServer::handleNotFoundRequest(request, tcp_conn);
		return;
	}

	// prepare the writer object for XML output
	HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, *request));
	writer->getResponse().setContentType(HTTPTypes::CONTENT_TYPE_XML);

	// send the response
	writer->write(ss.str());
	writer->send();
}
	
}	// end namespace server
}	// end namespace pion


/// creates new ConfigService objects
extern "C" PION_PLUGIN_API pion::server::PlatformService *pion_create_ConfigService(void) {
	return new pion::server::ConfigService();
}

/// destroys ConfigService objects
extern "C" PION_PLUGIN_API void pion_destroy_ConfigService(pion::server::ConfigService *service_ptr) {
	delete service_ptr;
}
