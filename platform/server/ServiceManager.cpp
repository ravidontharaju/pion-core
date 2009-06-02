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

#include <pion/net/HTTPBasicAuth.hpp>
#include <pion/net/HTTPCookieAuth.hpp>
#include <pion/net/HTTPResponseWriter.hpp>
#include "PlatformConfig.hpp"
#include "ServiceManager.hpp"

using namespace pion::net;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)


// static members of ServiceManager
	
const boost::uint32_t		ServiceManager::DEFAULT_NUM_THREADS = 4;
const std::string			ServiceManager::DEFAULT_CONFIG_FILE = "services.xml";
const std::string			ServiceManager::SERVER_ELEMENT_NAME = "Server";
const std::string			ServiceManager::WEB_SERVICE_ELEMENT_NAME = "WebService";
const std::string			ServiceManager::PLATFORM_SERVICE_ELEMENT_NAME = "PlatformService";
const std::string			ServiceManager::PORT_ELEMENT_NAME = "Port";
const std::string			ServiceManager::SSL_KEY_ELEMENT_NAME = "SSLKey";
const std::string			ServiceManager::REDIRECT_ELEMENT_NAME = "Redirect";
const std::string			ServiceManager::REDIRECT_SOURCE_ELEMENT_NAME = "Source";
const std::string			ServiceManager::REDIRECT_TARGET_ELEMENT_NAME = "Target";
const std::string			ServiceManager::RESOURCE_ELEMENT_NAME = "Resource";
const std::string			ServiceManager::OPTION_ELEMENT_NAME = "Option";
const std::string			ServiceManager::AUTH_ELEMENT_NAME = "Auth";
const std::string			ServiceManager::AUTH_TYPE_ELEMENT_NAME = "Type";
const std::string			ServiceManager::AUTH_RESTRICT_ELEMENT_NAME = "Restrict";
const std::string			ServiceManager::AUTH_PERMIT_ELEMENT_NAME = "Permit";
const std::string			ServiceManager::AUTH_LOGIN_ELEMENT_NAME = "Login";
const std::string			ServiceManager::AUTH_LOGOUT_ELEMENT_NAME = "Logout";
const std::string			ServiceManager::AUTH_REDIRECT_ELEMENT_NAME = "AuthRedirect";
const std::string			ServiceManager::NAME_ATTRIBUTE_NAME = "name";
	
		
// ServiceManager member functions

ServiceManager::ServiceManager(PlatformConfig& platform_config)
	: ConfigManager(DEFAULT_CONFIG_FILE), m_platform_config(platform_config)
{
	setLogger(PION_GET_LOGGER("pion.server.ServiceManager"));
	m_scheduler.setLogger(PION_GET_LOGGER("pion.server.ServiceManager"));
	m_scheduler.setNumThreads(DEFAULT_NUM_THREADS);
	platform_config.getVocabularyManager().registerForUpdates(boost::bind(&ServiceManager::updateVocabulary, this));
	platform_config.getCodecFactory().registerForUpdates(boost::bind(&ServiceManager::updateCodecs, this));
	platform_config.getDatabaseManager().registerForUpdates(boost::bind(&ServiceManager::updateDatabases, this));
	platform_config.getReactionEngine().registerForUpdates(boost::bind(&ServiceManager::updateReactors, this));
}

void ServiceManager::shutdown(void)
{
	boost::mutex::scoped_lock services_lock(m_mutex);

	// stop servers first otherwise you might have lingering threads
	// that cause seg faults during shutdown
	for (ServerList::iterator it=m_servers.begin(); it!=m_servers.end(); ++it)
		(*it)->stop();

	// stop scheduler after stopping servers
	m_scheduler.shutdown();

	// finally, it's safe to clear the HTTPServer/WebServer objects
	m_servers.clear();
}

void ServiceManager::openConfigFile(void)
{
	boost::mutex::scoped_lock services_lock(m_mutex);

	// just return if it's already open
	if (configIsOpen())
		return;
	
	// open the file and find the "config" root element
	ConfigManager::openConfigFile();

	// some strings that get re-used a bunch
	std::string server_id;
	std::string port_str;
	std::string ssl_key;
	std::string redirect_source;
	std::string redirect_target;
	std::string service_id;
	std::string plugin_type;
	std::string http_resource;

	// step through Server configurations
	xmlNodePtr server_node = m_config_node_ptr->children;
	while ( (server_node = ConfigManager::findConfigNodeByName(SERVER_ELEMENT_NAME, server_node)) != NULL)
	{
		// get the unique identifier for the Server
		if (! getNodeId(server_node, server_id))
			throw EmptyServerIdException(getConfigFile());

		// get the port number for the server
		if (! ConfigManager::getConfigOption(PORT_ELEMENT_NAME, port_str,
											 server_node->children))
			throw MissingPortException(server_id);
		
		// create the server and add it to our list
		HTTPServerPtr server_ptr(new HTTPServer(m_scheduler, boost::lexical_cast<unsigned int>(port_str)));
		m_servers.push_back(server_ptr);

		// get the Authentication configuration
		HTTPAuthPtr auth_ptr(new HTTPCookieAuth(m_platform_config.getUserManagerPtr()));
		std::string value;

		if(ConfigManager::getConfigOption(AUTH_LOGIN_ELEMENT_NAME, value,server_node->children)){
			auth_ptr->setOption("login",value);
		}
		if(ConfigManager::getConfigOption(AUTH_LOGOUT_ELEMENT_NAME, value,server_node->children)){
			auth_ptr->setOption("logout",value);
		}
		if(ConfigManager::getConfigOption(AUTH_REDIRECT_ELEMENT_NAME, value,server_node->children)){
			auth_ptr->setOption("redirect",value);
		}
		// step through restricted URL definitions
		xmlNodePtr restrict_node=server_node->children;
		while ( (restrict_node = ConfigManager::findConfigNodeByName(AUTH_RESTRICT_ELEMENT_NAME, restrict_node)) != NULL)
		{
			// get the  value
			std::string restrict_value;
			xmlChar *xml_char_ptr = xmlNodeGetContent(restrict_node);
			if (xml_char_ptr != NULL) {
				restrict_value = reinterpret_cast<char*>(xml_char_ptr);
				xmlFree(xml_char_ptr);
				auth_ptr->addRestrict(restrict_value);
			}

			// step to the next definition
			restrict_node = restrict_node->next;
		}

		// step through permitted URL definitions
		xmlNodePtr permit_node=server_node->children;
		while ( (permit_node = ConfigManager::findConfigNodeByName(AUTH_PERMIT_ELEMENT_NAME, permit_node)) != NULL)
		{
			// get the  value
			std::string permit_value;
			xmlChar *xml_char_ptr = xmlNodeGetContent(permit_node);
			if (xml_char_ptr != NULL) {
				permit_value = reinterpret_cast<char*>(xml_char_ptr);
				xmlFree(xml_char_ptr);
				auth_ptr->addPermit(permit_value);
			}

			// step to the next definition
			permit_node = permit_node->next;
		}
		// set up authentication for given server
		server_ptr->setAuthentication(auth_ptr);

		// use ServiceManager for handling error responses
		server_ptr->setServerErrorHandler(boost::bind(&ServiceManager::handleServerError, _1, _2, _3));

		// get the ssl key for the server (if defined)
		if (ConfigManager::getConfigOption(SSL_KEY_ELEMENT_NAME, ssl_key,
										   server_node->children))
		{
			#ifdef PION_HAVE_SSL
				// enable SSL for the server using the key provided
				const std::string path_to_key_file(ConfigManager::resolveRelativePath(ssl_key));
				try {
					server_ptr->setSSLKeyFile(path_to_key_file);
				} catch (std::exception&) {
					throw SSLKeyException(path_to_key_file);
				}
			#else
				PION_LOG_WARN(m_logger, "Ignoring SSL keyfile parameter (Pion was not built with SSL support)");
			#endif
		}

		// step through resource redirections
		xmlNodePtr redirect_node = server_node->children;
		while ((redirect_node = ConfigManager::findConfigNodeByName(REDIRECT_ELEMENT_NAME, redirect_node)) != NULL) {
			// get the source of the redirection 
			if (!getConfigOption(REDIRECT_SOURCE_ELEMENT_NAME, redirect_source, redirect_node->children))
				throw RedirectMissingSourceException(server_id);

			// get the target of the redirection 
			if (!getConfigOption(REDIRECT_TARGET_ELEMENT_NAME, redirect_target, redirect_node->children))
				throw RedirectMissingTargetException(server_id);

			server_ptr->addRedirect(redirect_source, redirect_target);

			redirect_node = redirect_node->next;
		}

		// step through PlatformService configurations
		xmlNodePtr service_node = server_node->children;
		while ( (service_node = ConfigManager::findConfigNodeByName(PLATFORM_SERVICE_ELEMENT_NAME, service_node)) != NULL)
		{
			// get common service configuration
			getServiceConfig(service_node, server_id, service_id, plugin_type, http_resource);
			
			// catch exceptions thrown by services since their exceptions may be free'd
			// from memory before they are caught
			PlatformService *service_ptr;
			try {
				// load the service
				service_ptr = m_platform_services.load(service_id, plugin_type);
				service_ptr->setId(service_id);
				service_ptr->setResource(http_resource);
				service_ptr->setConfig(m_platform_config, service_node->children);
			} catch (std::exception& e) {
				throw WebServiceException(http_resource, e.what());
			}
			
			// add the service to the HTTP server
			server_ptr->addResource(http_resource, boost::ref(*service_ptr));
			
			// step to the next service definition
			service_node = service_node->next;
		}
		
		// step through WebService configurations
		service_node = server_node->children;
		while ( (service_node = ConfigManager::findConfigNodeByName(WEB_SERVICE_ELEMENT_NAME, service_node)) != NULL)
		{
			// get common service configuration
			getServiceConfig(service_node, server_id, service_id, plugin_type, http_resource);
			
			// catch exceptions thrown by services since their exceptions may be free'd
			// from memory before they are caught
			WebService *service_ptr;
			try {
				// load the service
				service_ptr = m_web_services.load(service_id, plugin_type);
				service_ptr->setResource(http_resource);
			} catch (std::exception& e) {
				throw WebServiceException(http_resource, e.what());
			}
			
			// step through WebService configuration options
			xmlNodePtr option_node = service_node->children;
			while ( (option_node = ConfigManager::findConfigNodeByName(OPTION_ELEMENT_NAME, option_node)) != NULL)
			{
				// get the option name
				xmlChar *xml_char_ptr = xmlGetProp(option_node, reinterpret_cast<const xmlChar*>(NAME_ATTRIBUTE_NAME.c_str()));
				if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
					if (xml_char_ptr != NULL)
						xmlFree(xml_char_ptr);
					throw EmptyOptionNameException(service_id);
				}
				const std::string option_name(reinterpret_cast<char*>(xml_char_ptr));
				xmlFree(xml_char_ptr);
				
				// get the option value
				std::string option_value;
				xml_char_ptr = xmlNodeGetContent(option_node);
				if (xml_char_ptr != NULL) {
					option_value = reinterpret_cast<char*>(xml_char_ptr);
					xmlFree(xml_char_ptr);
				}
				
				// catch exceptions thrown by services since their exceptions may be free'd
				// from memory before they are caught
				try {
					// set the configuration option
					service_ptr->setOption(option_name, option_value);
				} catch (std::exception& e) {
					throw WebServiceException(http_resource, e.what());
				}
				
				// step to the next WebService configuration option
				option_node = option_node->next;
			}				

			// add the service to the HTTP server
			server_ptr->addResource(http_resource, boost::ref(*service_ptr));
			
			// step to the next service definition
			service_node = service_node->next;
		}
		
		// start up the server
		server_ptr->start();
		
		// step to the next server definition
		server_node = server_node->next;
	}
	
	PION_LOG_INFO(m_logger, "Loaded Service configuration file: " << m_config_file);
}

void ServiceManager::getServiceConfig(xmlNodePtr service_node, const std::string& server_id,
									  std::string& service_id, std::string& plugin_type,
									  std::string& http_resource)
{
	// get the unique identifier for the Service
	if (! getNodeId(service_node, service_id))
		throw EmptyServiceIdException(server_id);
		
	// find plug-in type
	if (! getConfigOption(PLUGIN_ELEMENT_NAME, plugin_type, service_node->children))
		throw EmptyServicePluginException(service_id);
		
	// find the HTTP resource
	if (! getConfigOption(RESOURCE_ELEMENT_NAME, http_resource, service_node->children))
		throw EmptyServiceResourceException(service_id);
	
	// remove the trailing slash (if any) from the HTTP resource
	http_resource = HTTPServer::stripTrailingSlash(http_resource);
}
	
bool ServiceManager::writeConfigXML(std::ostream& out,
									const std::string& server_id) const
{
	// find the plug-in element in the XML config document
	boost::mutex::scoped_lock services_lock(m_mutex);
	xmlNodePtr server_node = findConfigNodeByAttr(SERVER_ELEMENT_NAME,
												  ID_ATTRIBUTE_NAME,
												  server_id,
												  m_config_node_ptr->children);
	if (server_node == NULL)
		return false;
	
	// found it
	ConfigManager::writeConfigXMLHeader(out);
	ConfigManager::writeConfigXML(out, server_node, false);
	return true;
}

void ServiceManager::updateVocabulary(void)
{
	m_platform_services.run(boost::bind(&PlatformService::updateVocabulary, _1,
										boost::cref(m_platform_config.getVocabularyManager().getVocabulary())));
}

void ServiceManager::updateCodecs(void)
{
	m_platform_services.run(boost::bind(&PlatformService::updateCodecs, _1,
										boost::ref(m_platform_config)));
}

void ServiceManager::updateDatabases(void)
{
	m_platform_services.run(boost::bind(&PlatformService::updateDatabases, _1,
										boost::ref(m_platform_config)));
}

void ServiceManager::updateReactors(void)
{
	m_platform_services.run(boost::bind(&PlatformService::updateReactors, _1,
										boost::ref(m_platform_config)));
}
	
void ServiceManager::handleServerError(HTTPRequestPtr& http_request,
	TCPConnectionPtr& tcp_conn, const std::string& error_msg)
{
	HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, *http_request,
															boost::bind(&TCPConnection::finish, tcp_conn)));
	writer->getResponse().setStatusCode(HTTPTypes::RESPONSE_CODE_SERVER_ERROR);
	writer->getResponse().setStatusMessage(HTTPTypes::RESPONSE_MESSAGE_SERVER_ERROR);
	writer->getResponse().setContentType(HTTPTypes::CONTENT_TYPE_TEXT);
	writer << error_msg;
	writer->send();
}

	
}	// end namespace server
}	// end namespace pion
