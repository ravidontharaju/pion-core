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
using namespace pion::server;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins

		
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

	if (branches.empty()) {

		// send platform configuration info
		getConfig().writeConfigXML(ss);
		
	} else if (branches.front() == "vocabularies") {
		//
		// BEGIN VOCABULARIES CONFIG
		//
		if (branches.size() == 1) {
			
			// returns a list of all Vocabularies
			getConfig().getVocabularyManager().writeConfigXML(ss);
			
		} else if (branches.size() == 2) {
			// branches[1] == vocabulary_id
			const std::string vocab_id(branches[1]);
			
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				// retrieve an existing Vocabulary's configuration
				
				if (! getConfig().getVocabularyManager().writeConfigXML(ss, vocab_id))
					throw VocabularyManager::VocabularyNotFoundException(vocab_id);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_POST) {
				
				// add (create) a new Vocabulary
				getConfig().getVocabularyManager().addVocabulary(vocab_id,
																 request->getContent(),
																 request->getContentLength());
				
				// send a 201 (created) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_CREATED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_CREATED);
				
				// respond with the new Vocabulary's configuration
				if (! getConfig().getVocabularyManager().writeConfigXML(ss, vocab_id))
					throw VocabularyManager::VocabularyNotFoundException(vocab_id);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT) {
				// update existing Vocabulary's configuration
				
				// convert request content into XML configuration info
				xmlNodePtr vocab_config_ptr =
					VocabularyConfig::createVocabularyConfig(request->getContent(),
															 request->getContentLength());
				
				try {
					// push the new config into the VocabularyManager
					getConfig().getVocabularyManager().setVocabularyConfig(vocab_id, vocab_config_ptr);
				} catch (std::exception&) {
					xmlFreeNodeList(vocab_config_ptr);
					throw;
				}
				xmlFreeNodeList(vocab_config_ptr);
				
				// respond with the Vocabulary's updated configuration
				if (! getConfig().getVocabularyManager().writeConfigXML(ss, vocab_id))
					throw VocabularyManager::VocabularyNotFoundException(vocab_id);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_DELETE) {
				// delete an existing Vocabulary
				
				getConfig().getVocabularyManager().removeVocabulary(vocab_id);
				
				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);
				
			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
			
		} else {
			HTTPServer::handleNotFoundRequest(request, tcp_conn);
			return;
		}
		//
		// END VOCABULARIES CONFIG
		//
	} else if (branches.front() == "terms") {
		//
		// BEGIN TERMS CONFIG
		//
		if (branches.size() == 1) {
			
			// returns a list of all Vocabularies
			getConfig().getVocabularyManager().writeTermConfigXML(ss);
			
		} else if (branches.size() == 2) {
			// branches[1] == term_id
			const std::string term_id(branches[1]);
			const std::string vocab_id(term_id.substr(0, term_id.find_last_of('#')));
			
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				// retrieve an existing Vocabulary Term's configuration
				
				if (! getConfig().getVocabularyManager().writeTermConfigXML(ss, term_id))
					throw Vocabulary::TermNotFoundException(term_id);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_POST) {
				
				// add (create) a new Vocabulary Term
				
				// convert request content into XML configuration info
				xmlNodePtr term_config_ptr =
					VocabularyConfig::createTermConfig(request->getContent(),
													   request->getContentLength());
				
				// add the new Vocabulary Term to the VocabularyManager
				try {
					getConfig().getVocabularyManager().addTerm(vocab_id, term_id,
															   term_config_ptr);
				} catch (std::exception&) {
					xmlFreeNodeList(term_config_ptr);
					throw;
				}
				xmlFreeNodeList(term_config_ptr);
				
				// send a 201 (created) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_CREATED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_CREATED);
				
				// respond with the new Vocabulary Term's configuration
				if (! getConfig().getVocabularyManager().writeTermConfigXML(ss, term_id))
					throw Vocabulary::TermNotFoundException(term_id);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT) {
				// update existing Vocabulary's configuration
				
				// convert request content into XML configuration info
				xmlNodePtr term_config_ptr =
					VocabularyConfig::createTermConfig(request->getContent(),
													   request->getContentLength());
				
				// get the Vocabulary name and comment from the XML config
				
				try {
					// push the new config into the VocabularyManager
					getConfig().getVocabularyManager().updateTerm(vocab_id, term_id,
																  term_config_ptr);
				} catch (std::exception&) {
					xmlFreeNodeList(term_config_ptr);
					throw;
				}
				xmlFreeNodeList(term_config_ptr);
				
				// respond with the Vocabulary Term's updated configuration
				if (! getConfig().getVocabularyManager().writeTermConfigXML(ss, term_id))
					throw Vocabulary::TermNotFoundException(term_id);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_DELETE) {
				// delete an existing Vocabulary Term
				
				getConfig().getVocabularyManager().removeTerm(vocab_id, term_id);
				
				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);
				
			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
			
		} else {
			HTTPServer::handleNotFoundRequest(request, tcp_conn);
			return;
		}
		//
		// END TERMS CONFIG
		//
	} else if (branches.front() == "codecs") {
		//
		// BEGIN CODECS CONFIG
		//
		if (branches.size() == 1) {
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				
				// retrieve configuration for all Codecs
				getConfig().getCodecFactory().writeConfigXML(ss);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_POST) {
				
				// add (create) a new Codec
				
				// convert request content into XML configuration info
				xmlNodePtr codec_config_ptr =
					CodecFactory::createCodecConfig(request->getContent(),
													request->getContentLength());
				
				std::string codec_id;
				// add the new Codec to the CodecFactory
				try {
					codec_id = getConfig().getCodecFactory().addCodec(codec_config_ptr);
				} catch (std::exception&) {
					xmlFreeNodeList(codec_config_ptr);
					throw;
				}
				xmlFreeNodeList(codec_config_ptr);
				
				// send a 201 (created) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_CREATED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_CREATED);
				
				// respond with the new Codec's configuration
				if (! getConfig().getCodecFactory().writeConfigXML(ss, codec_id))
					throw CodecFactory::CodecNotFoundException(branches[1]);
				
			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
			
		} else if (branches.size() == 2) {
			// branches[1] == codec_id
			
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				// retrieve an existing Codec's configuration
				
				if (! getConfig().getCodecFactory().writeConfigXML(ss, branches[1]))
					throw CodecFactory::CodecNotFoundException(branches[1]);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT) {
				// update existing Codec's configuration
				
				// convert request content into XML configuration info
				xmlNodePtr codec_config_ptr =
					CodecFactory::createCodecConfig(request->getContent(),
													request->getContentLength());
				
				try {
					// push the new config into the CodecFactory
					getConfig().getCodecFactory().setCodecConfig(branches[1], codec_config_ptr);
				} catch (std::exception&) {
					xmlFreeNodeList(codec_config_ptr);
					throw;
				}
				xmlFreeNodeList(codec_config_ptr);
				
				// respond with the Codec's updated configuration
				if (! getConfig().getCodecFactory().writeConfigXML(ss, branches[1]))
					throw CodecFactory::CodecNotFoundException(branches[1]);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_DELETE) {
				// delete an existing Codec
				
				getConfig().getCodecFactory().removeCodec(branches[1]);
				
				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);
				
			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
			
		} else {
			HTTPServer::handleNotFoundRequest(request, tcp_conn);
			return;
		}
		//
		// END CODECS CONFIG
		//
	} else if (branches.front() == "databases") {
		//
		// BEGIN DATABASES CONFIG
		//
		if (branches.size() == 1) {
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				
				// retrieve configuration for all Databases
				getConfig().getDatabaseManager().writeConfigXML(ss);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_POST) {
				
				// add (create) a new Database
				
				// convert request content into XML configuration info
				xmlNodePtr database_config_ptr =
					DatabaseManager::createDatabaseConfig(request->getContent(),
														  request->getContentLength());
				
				std::string database_id;
				// add the new Database to the DatabaseManager
				try {
					database_id = getConfig().getDatabaseManager().addDatabase(database_config_ptr);
				} catch (std::exception&) {
					xmlFreeNodeList(database_config_ptr);
					throw;
				}
				xmlFreeNodeList(database_config_ptr);
				
				// send a 201 (created) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_CREATED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_CREATED);
				
				// respond with the new Database's configuration
				if (! getConfig().getDatabaseManager().writeConfigXML(ss, database_id))
					throw DatabaseManager::DatabaseNotFoundException(branches[1]);
				
			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
			
		} else if (branches.size() == 2) {
			// branches[1] == database_id
			
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				// retrieve an existing Database's configuration
				
				if (! getConfig().getDatabaseManager().writeConfigXML(ss, branches[1]))
					throw DatabaseManager::DatabaseNotFoundException(branches[1]);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT) {
				// update existing Database's configuration
				
				// convert request content into XML configuration info
				xmlNodePtr database_config_ptr =
					DatabaseManager::createDatabaseConfig(request->getContent(),
														  request->getContentLength());
				
				try {
					// push the new config into the DatabaseManager
					getConfig().getDatabaseManager().setDatabaseConfig(branches[1], database_config_ptr);
				} catch (std::exception&) {
					xmlFreeNodeList(database_config_ptr);
					throw;
				}
				xmlFreeNodeList(database_config_ptr);
				
				// respond with the Database's updated configuration
				if (! getConfig().getDatabaseManager().writeConfigXML(ss, branches[1]))
					throw DatabaseManager::DatabaseNotFoundException(branches[1]);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_DELETE) {
				// delete an existing Database
				
				getConfig().getDatabaseManager().removeDatabase(branches[1]);
				
				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);
				
			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
			
		} else {
			HTTPServer::handleNotFoundRequest(request, tcp_conn);
			return;
		}
		//
		// END DATABASES CONFIG
		//
	} else if (branches.front() == "reactors") {
		//
		// BEGIN REACTORS CONFIG
		//
		if (branches.size() == 1) {
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {

				// retrieve configuration for all Reactors
				getConfig().getReactionEngine().writeConfigXML(ss);

			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_POST) {
				
				// add (create) a new Reactor
				
				// convert request content into XML configuration info
				xmlNodePtr reactor_config_ptr =
					ReactionEngine::createReactorConfig(request->getContent(),
														request->getContentLength());
				
				std::string reactor_id;
				// add the new Reactor to the ReactionEngine
				try {
					reactor_id = getConfig().getReactionEngine().addReactor(reactor_config_ptr);
				} catch (std::exception&) {
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
			
			// send statistics for all Reactors
			getConfig().getReactionEngine().writeStatsXML(ss);
			
		} else if (branches.size() == 2) {
			// branches[1] == reactor_id
			
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				// retrieve an existing Reactor's configuration

				if (! getConfig().getReactionEngine().writeConfigXML(ss, branches[1]))
					throw ReactionEngine::ReactorNotFoundException(branches[1]);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT) {
				// update existing Reactor's configuration

												
				// convert request content into XML configuration info
				xmlNodePtr reactor_config_ptr =
					ReactionEngine::createReactorConfig(request->getContent(),
														request->getContentLength());

				try {
					// push the new config into the ReactionEngine
					getConfig().getReactionEngine().setReactorConfig(branches[1], reactor_config_ptr);
				} catch (std::exception&) {
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

				// respond by sending all the Reactor stats
				getConfig().getReactionEngine().writeStatsXML(ss);
				
			} else if (branches[2] == "stop") {
				
				// stop a Reactor
				getConfig().getReactionEngine().stopReactor(branches[1]);

				// respond by sending all the Reactor stats
				getConfig().getReactionEngine().writeStatsXML(ss);
				
			} else {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		} else {
			HTTPServer::handleNotFoundRequest(request, tcp_conn);
			return;
		}
		//
		// END REACTORS CONFIG
		//
	} else if (branches.front() == "connections") {
		//
		// BEGIN CONNECTIONS CONFIG
		//
		if (branches.size() == 1) {
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				
				// retrieve configuration for all Reactor connections
				getConfig().getReactionEngine().writeConnectionsXML(ss);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_POST) {
				
				// create a new Reactor connection
				std::string connection_id = getConfig().getReactionEngine().addReactorConnection(request->getContent(),
																								 request->getContentLength());
				
				// send a 201 (created) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_CREATED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_CREATED);
				
				// respond with the new connection's configuration
				getConfig().getReactionEngine().writeConnectionsXML(ss, connection_id);
				
			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
			
		} else {
			// branches[1] == connection_id
			
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {
				
				// retrieve configuration for specific Reactor connections
				getConfig().getReactionEngine().writeConnectionsXML(ss, branches[1]);
				
			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_DELETE) {

				// remove an existing Reactor connection
				getConfig().getReactionEngine().removeReactorConnection(branches[1]);

				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);

			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
		}
		//
		// END CONNECTIONS CONFIG
		//
	} else if (branches.front() == "services") {
		//
		// BEGIN SERVICES CONFIG
		//
		if (branches.size() == 1) {
			getConfig().getServiceManager().writeConfigXML(ss);
		} else {
			if (! getConfig().getServiceManager().writeConfigXML(ss, branches[1])) {
				HTTPServer::handleNotFoundRequest(request, tcp_conn);
				return;
			}
		}
		//
		// END SERVICES CONFIG
		//
	} else if (branches.front() == "users") {
		//
		// BEGIN USERS CONFIG
		//
		if (branches.size() == 1) {
			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {

				// retrieve configuration for all Users
				getConfig().getUserManagerPtr()->writeConfigXML(ss);

			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_POST) {

				// add (create) a new user

				// convert request content into XML configuration info
				std::string user_id;
				xmlNodePtr user_config_ptr =
					UserManager::createUserConfig(
					user_id,
					request->getContent(),
					request->getContentLength());

				// add the new User to the UserManager
				try {
					user_id = getConfig().getUserManagerPtr()->addUser(user_id,user_config_ptr);
				} catch (std::exception& e) {
					xmlFreeNodeList(user_config_ptr);
					throw;
				}
				xmlFreeNodeList(user_config_ptr);

				// send a 201 (created) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_CREATED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_CREATED);

				// respond with the new Users's configuration
				if (! getConfig().getUserManagerPtr()->writeConfigXML(ss, user_id))
					throw UserManager::UserNotFoundException(branches[1]);

			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}

		} else {
			// branches[1] == user_id

			if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {

				// retrieve configuration for specific User
				getConfig().getUserManagerPtr()->writeConfigXML(ss, branches[1]);

			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT) {
				// update existing user

				// convert request content into XML configuration info
				std::string user_id;
				xmlNodePtr user_config_ptr =
					UserManager::createUserConfig(
					user_id,
					request->getContent(),
					request->getContentLength());

				// add the new User to the UserManager
				try {
					getConfig().getUserManagerPtr()->setUserConfig(branches[1], user_config_ptr);
				} catch (std::exception& e) {
					xmlFreeNodeList(user_config_ptr);
					throw;
				}
				xmlFreeNodeList(user_config_ptr);

				// respond with the new Users's configuration
				if (! getConfig().getUserManagerPtr()->writeConfigXML(ss, branches[1]))
					throw UserManager::UserNotFoundException(branches[1]);

			} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_DELETE) {

				// remove an existing User
				getConfig().getUserManagerPtr()->removeUser(branches[1]);

				// send a 204 (no content) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_NO_CONTENT);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_NO_CONTENT);

			} else {
				// send a 405 (method not allowed) response
				response_ptr->setStatusCode(HTTPTypes::RESPONSE_CODE_METHOD_NOT_ALLOWED);
				response_ptr->setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_METHOD_NOT_ALLOWED);
			}
		}
		//
		// END USERS CONFIG
		//
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
	
}	// end namespace plugins
}	// end namespace pion


/// creates new ConfigService objects
extern "C" PION_PLUGIN_API pion::server::PlatformService *pion_create_ConfigService(void) {
	return new pion::plugins::ConfigService();
}

/// destroys ConfigService objects
extern "C" PION_PLUGIN_API void pion_destroy_ConfigService(pion::plugins::ConfigService *service_ptr) {
	delete service_ptr;
}
