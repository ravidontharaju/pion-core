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
	// split out the path branches from the HTTP request
	PathBranches branches;
	splitPathBranches(branches, request->getResource());

	// use a stringstream for the response content
	// since HTTPResponseWriter does not yet have a stream wrapper available
	std::stringstream ss;
	
	// start responses with the XML header line <?xml ... ?>
	ConfigManager::writeConfigXMLHeader(ss);
	
	if (branches.empty()) {
		getConfig().writeConfigXML(ss);
	} else if (branches.front() == "vocabularies") {
		if (branches.size() == 1) {
			getConfig().getVocabularyManager().writeConfigXML(ss);
		} else {
			if (! getConfig().getVocabularyManager().writeConfigXML(ss, branches[1])) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		}
	} else if (branches.front() == "codecs") {
		if (branches.size() == 1) {
			getConfig().getCodecFactory().writeConfigXML(ss);
		} else {
			if (! getConfig().getCodecFactory().writeConfigXML(ss, branches[1])) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		}
	} else if (branches.front() == "databases") {
		if (branches.size() == 1) {
			getConfig().getDatabaseManager().writeConfigXML(ss);
		} else {
			if (! getConfig().getDatabaseManager().writeConfigXML(ss, branches[1])) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		}
	} else if (branches.front() == "reactors") {
		if (branches.size() == 1) {
			getConfig().getReactionEngine().writeConfigXML(ss);
		} else {
			if (! getConfig().getReactionEngine().writeConfigXML(ss, branches[1])) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		}
	} else if (branches.front() == "connections") {
		if (branches.size() == 1) {
			getConfig().getReactionEngine().writeConnectionsXML(ss);
		} else {
			getConfig().getReactionEngine().writeConnectionsXML(ss, branches[1]);
		}
	} else if (branches.front() == "services") {
		if (branches.size() == 1) {
			getConfig().getServiceManager().writeConfigXML(ss);
		} else {
			if (! getConfig().getServiceManager().writeConfigXML(ss, branches[1])) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		}
	} else {
		HTTPServer::handleNotFoundRequest(request, tcp_conn);
		return;
	}

	// prepare the writer object for XML output
	HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, *request,
															boost::bind(&TCPConnection::finish, tcp_conn)));
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
