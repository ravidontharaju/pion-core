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
	
	// use a response in case we want to change any of the headers/etc.
	// while processing the request
	HTTPResponsePtr response_ptr(new HTTPResponse(*request));

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
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {

				// retrieve configuration for all Reactors
				getConfig().getReactionEngine().writeConfigXML(ss);

			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_POST) {
				
				// add (create) a new Reactor
				
				// convert request content into XML configuration info
				xmlNodePtr reactor_config_ptr =
					ReactionEngine::createPluginConfig(request->getContent(),
													   request->getContentLength());
				
				std::string reactor_id;
				// add the new Reactor to the ReactionEngine
				try {
					reactor_id = getConfig().getReactionEngine().addReactor(reactor_config_ptr);
				} catch (std::exception& e) {
					xmlFreeNodeList(reactor_config_ptr);
					throw;
				}
				xmlFreeNodeList(reactor_config_ptr);
				
				// send a 201 (created) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_CREATED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_CREATED);
				
				// respond with the new Reactor's configuration
				if (! getConfig().getReactionEngine().writeConfigXML(ss, reactor_id))
					throw ReactionEngine::ReactorNotFoundException(reactor_id);

			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}

		} else if (branches[1] == "stats") {
			getConfig().getReactionEngine().writeStatsXML(ss);
		} else if (branches.size() == 2) {
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				// retrieve an existing Reactor's configuration

				if (! getConfig().getReactionEngine().writeConfigXML(ss, branches[1]))
					throw ReactionEngine::ReactorNotFoundException(branches[1]);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT) {
				// update existing Reactor's configuration

												
				// convert request content into XML configuration info
				xmlNodePtr reactor_config_ptr =
					ReactionEngine::createPluginConfig(request->getContent(),
													   request->getContentLength());

				try {
					// push the new config into the ReactionEngine
					getConfig().getReactionEngine().setReactorConfig(branches[1], reactor_config_ptr);
				} catch (std::exception& e) {
					xmlFreeNodeList(reactor_config_ptr);
					throw;
				}
				xmlFreeNodeList(reactor_config_ptr);
				
				// respond with the Reactor's updated configuration
				if (! getConfig().getReactionEngine().writeConfigXML(ss, branches[1]))
					throw ReactionEngine::ReactorNotFoundException(branches[1]);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_DELETE) {
				// delete an existing Reactor

				getConfig().getReactionEngine().removeReactor(branches[1]);

				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);

			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
			
		} else if (branches.size() == 3) {
			if (branches[2] == "start") {
				
				// start a Reactor
				getConfig().getReactionEngine().startReactor(branches[1]);

				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);
				
			} else if (branches[2] == "stop") {
				
				// stop a Reactor
				getConfig().getReactionEngine().stopReactor(branches[1]);

				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);
				
			} else {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		} else {
			HTTPServer::handleNotFoundRequest(request, tcp_conn);
			return;
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
	HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, response_ptr,
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
