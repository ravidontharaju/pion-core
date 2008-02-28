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
#include <boost/test/unit_test.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <pion/net/TCPStream.hpp>
#include <pion/net/HTTPRequest.hpp>
#include <pion/net/HTTPResponse.hpp>
#include "../server/PlatformConfig.hpp"

using namespace pion;
using namespace pion::net;
using namespace pion::platform;
using namespace pion::server;


/// external functions defined in PionPlatformUnitTests.cpp
extern const std::string& get_log_file_dir(void);
extern const std::string& get_config_file_dir(void);
extern const std::string& get_vocabulary_path(void);
extern const std::string& get_vocabularies_file(void);
extern const std::string& get_platform_config_file(void);
extern void setup_logging_for_unit_tests(void);
extern void setup_plugins_directory(void);
extern void cleanup_platform_config_files(void);


/// interface class for ConfigService tests
class ConfigServiceTestInterface_F {
public:
	ConfigServiceTestInterface_F()
		: m_log_reader_id("c7a9f95a-e305-11dc-98ce-0016cb926e68"),
		m_log_writer_id("a92b7278-e306-11dc-85f0-0016cb926e68"),
		m_do_nothing_id("0cc21558-cf84-11dc-a9e0-0019e3f89cd2")
	{
		setup_logging_for_unit_tests();
		setup_plugins_directory();		
		cleanup_platform_config_files();

		// start the ServiceManager, ReactionEngine, etc.
		m_platform_cfg.setConfigFile(get_platform_config_file());
		m_platform_cfg.openConfigFile();
	}
	
	virtual ~ConfigServiceTestInterface_F() {}
	
	/**
	 * sends a Request to the local server
	 *
	 * @param request the HTTP request to send to the server
	 * @return HTTPResponsePtr pointer to an HTTP response received from the server
	 */
	inline HTTPResponsePtr sendRequest(HTTPRequest& request) {
		// connect a stream to localhost
		TCPStream tcp_stream(m_platform_cfg.getServiceManager().getIOService());
		boost::system::error_code ec;
		ec = tcp_stream.connect(boost::asio::ip::address::from_string("127.0.0.1"), 8080);
		BOOST_REQUIRE(! ec);
		
		// send the HTTPRequest
		request.send(tcp_stream.rdbuf()->getConnection(), ec);
		BOOST_REQUIRE(! ec);
		
		// get the response from the server
		HTTPResponsePtr response_ptr(new HTTPResponse(request));
		response_ptr->receive(tcp_stream.rdbuf()->getConnection(), ec);
		BOOST_REQUIRE(! ec);
		
		// return the response
		return response_ptr;
	}
	
	/**
	 * checks if a Reactor is running using the "stat" service
	 *
	 * @param reactor_id the unique identifier for the Reactor to check
	 * @param response uses this HTTP response's content as the stats XML
	 * @return true if the Reactor is running
	 */
	inline bool checkIfReactorIsRunning(const std::string& reactor_id,
										const HTTPResponse& response)
	{
		// check the response status code
		BOOST_CHECK_EQUAL(response.getStatusCode(), HTTPTypes::RESPONSE_CODE_OK);
		
		// parse the response content
		xmlDocPtr doc_ptr = xmlParseMemory(response.getContent(),
										   response.getContentLength());
		BOOST_REQUIRE(doc_ptr);
		xmlNodePtr node_ptr = xmlDocGetRootElement(doc_ptr);
		BOOST_REQUIRE(node_ptr);
		BOOST_REQUIRE(node_ptr->children);
		
		// look for the Reactor's node
		xmlNodePtr plugin_node = ConfigManager::findConfigNodeByAttr("Reactor",
																	 "id", reactor_id,
																	 node_ptr->children);
		BOOST_REQUIRE(plugin_node);
		BOOST_REQUIRE(plugin_node->children);
		
		// find the "Running" element
		std::string is_running_str;
		BOOST_REQUIRE(ConfigManager::getConfigOption("Running", is_running_str, plugin_node->children));
	
		return(is_running_str == "true");
	}

	/**
	 * checks if a Reactor is running using the "stat" service
	 *
	 * @param reactor_id the unique identifier for the Reactor to check
	 * @return true if the Reactor is running
	 */
	inline bool checkIfReactorIsRunning(const std::string& reactor_id) {
		// make a request to remove the "log writer" reactor
		HTTPRequest request;
		request.setMethod(HTTPTypes::REQUEST_METHOD_GET);
		request.setResource("/config/reactors/stats");
		HTTPResponsePtr response_ptr(sendRequest(request));

		return checkIfReactorIsRunning(reactor_id, *response_ptr);
	}		
		

	PlatformConfig		m_platform_cfg;
	const std::string	m_log_reader_id;
	const std::string	m_log_writer_id;
	const std::string	m_do_nothing_id;
};

BOOST_FIXTURE_TEST_SUITE(ConfigServiceTestInterface_S, ConfigServiceTestInterface_F)

BOOST_AUTO_TEST_CASE(checkConfigServiceLogReaderReactorStartsOutRunning) {
	// check to make sure the Reactor starts out 
	BOOST_CHECK(checkIfReactorIsRunning(m_log_reader_id));
}
	
BOOST_AUTO_TEST_CASE(checkConfigServiceStopThenStartLogReaderReactor) {
	// make a request to stop the "log reader" reactor
	HTTPRequest request;
	request.setMethod(HTTPTypes::REQUEST_METHOD_PUT);
	request.setResource("/config/reactors/" + m_log_reader_id + "/stop");
	HTTPResponsePtr response_ptr(sendRequest(request));
	
	// check the response status code
	BOOST_CHECK_EQUAL(response_ptr->getStatusCode(), HTTPTypes::RESPONSE_CODE_OK);
	
	// check to make sure the Reactor is no longer running
	BOOST_CHECK(! checkIfReactorIsRunning(m_log_reader_id, *response_ptr));
	
	// make another request to start it back up again
	request.setMethod(HTTPTypes::REQUEST_METHOD_PUT);
	request.setResource("/config/reactors/" + m_log_reader_id + "/start");
	response_ptr = sendRequest(request);
	
	// check the response status code
	BOOST_CHECK_EQUAL(response_ptr->getStatusCode(), HTTPTypes::RESPONSE_CODE_OK);
	
	// check to make sure the Reactor is running again
	BOOST_CHECK(checkIfReactorIsRunning(m_log_reader_id, *response_ptr));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceAddNewReactor) {
	std::string reactor_config_str = "<PionConfig><Reactor>"
		"<Plugin>FilterReactor</Plugin>"
		"</Reactor></PionConfig>";
	
	// make a request to add a new Reactor
	HTTPRequest request;
	request.setMethod(HTTPTypes::REQUEST_METHOD_POST);
	request.setResource("/config/reactors/");
	request.setContentLength(reactor_config_str.size());
	memcpy(request.createContentBuffer(), reactor_config_str.c_str(), reactor_config_str.size());
	HTTPResponsePtr response_ptr(sendRequest(request));
	
	// check the response status code
	BOOST_CHECK_EQUAL(response_ptr->getStatusCode(), HTTPTypes::RESPONSE_CODE_CREATED);
	
	// parse the response content
	xmlDocPtr doc_ptr = xmlParseMemory(response_ptr->getContent(),
									   response_ptr->getContentLength());
	BOOST_REQUIRE(doc_ptr);
	xmlNodePtr node_ptr = xmlDocGetRootElement(doc_ptr);
	BOOST_REQUIRE(node_ptr);
	BOOST_REQUIRE(node_ptr->children);
	
	// look for the Reactor's node
	node_ptr = ConfigManager::findConfigNodeByName("Reactor", node_ptr->children);
	BOOST_REQUIRE(node_ptr);
	std::string reactor_id;
	BOOST_REQUIRE(ConfigManager::getNodeId(node_ptr, reactor_id));
	
	// make sure that the Reactor was created
	BOOST_CHECK(m_platform_cfg.getReactionEngine().hasReactor(reactor_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceUpdateLogWriterReactorConfig) {
	std::string reactor_config_str = "<PionConfig><Reactor>"
		"<Name>Updated ELF Log Writer</Name>"
		"<Comment>Writes a new log file using ELF (Updated)</Comment>"
		"<Plugin>LogOutputReactor</Plugin>"
		"<Codec>23f68d5a-bfec-11dc-81a7-0016cb926e68</Codec>"
		"<Filename>/tmp/new.log</Filename>"
		"</Reactor></PionConfig>";
	
	// make a request to update the "log writer" Reactor
	HTTPRequest request;
	request.setMethod(HTTPTypes::REQUEST_METHOD_PUT);
	request.setResource("/config/reactors/" + m_log_writer_id);
	request.setContentLength(reactor_config_str.size());
	memcpy(request.createContentBuffer(), reactor_config_str.c_str(), reactor_config_str.size());
	HTTPResponsePtr response_ptr(sendRequest(request));
	
	// check the response status code
	BOOST_CHECK_EQUAL(response_ptr->getStatusCode(), HTTPTypes::RESPONSE_CODE_OK);
	
	// parse the response content
	xmlDocPtr doc_ptr = xmlParseMemory(response_ptr->getContent(),
									   response_ptr->getContentLength());
	BOOST_REQUIRE(doc_ptr);
	xmlNodePtr node_ptr = xmlDocGetRootElement(doc_ptr);
	BOOST_REQUIRE(node_ptr);
	BOOST_REQUIRE(node_ptr->children);
	
	// look for the Reactor's node
	node_ptr = ConfigManager::findConfigNodeByName("Reactor", node_ptr->children);
	BOOST_REQUIRE(node_ptr);
	BOOST_REQUIRE(node_ptr->children);
	
	// find the "Filename" element
	std::string filename_str;
	BOOST_REQUIRE(ConfigManager::getConfigOption("Filename", filename_str, node_ptr->children));
	BOOST_CHECK_EQUAL(filename_str, "/tmp/new.log");
}

BOOST_AUTO_TEST_CASE(checkConfigServiceRemoveLogWriterReactor) {
	// make a request to remove the "log writer" reactor
	HTTPRequest request;
	request.setMethod(HTTPTypes::REQUEST_METHOD_DELETE);
	request.setResource("/config/reactors/" + m_log_writer_id);
	HTTPResponsePtr response_ptr(sendRequest(request));

	// check the response status code
	BOOST_CHECK_EQUAL(response_ptr->getStatusCode(), HTTPTypes::RESPONSE_CODE_NO_CONTENT);

	// make sure that the Reactor was removed
	BOOST_CHECK(! m_platform_cfg.getReactionEngine().hasReactor(m_log_writer_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceAddNewConnection) {
	std::string connection_config_str = "<PionConfig><Connection>"
	"<Type>reactor</Type>"
	"<From>c7a9f95a-e305-11dc-98ce-0016cb926e68</From>"
	"<To>0cc21558-cf84-11dc-a9e0-0019e3f89cd2</To>"
	"</Connection></PionConfig>";
	
	// make a request to add a new Reactor
	HTTPRequest request;
	request.setMethod(HTTPTypes::REQUEST_METHOD_POST);
	request.setResource("/config/connections/");
	request.setContentLength(connection_config_str.size());
	memcpy(request.createContentBuffer(), connection_config_str.c_str(), connection_config_str.size());
	HTTPResponsePtr response_ptr(sendRequest(request));
	
	// check the response status code
	BOOST_CHECK_EQUAL(response_ptr->getStatusCode(), HTTPTypes::RESPONSE_CODE_CREATED);
	
	// parse the response content
	xmlDocPtr doc_ptr = xmlParseMemory(response_ptr->getContent(),
									   response_ptr->getContentLength());
	BOOST_REQUIRE(doc_ptr);
	xmlNodePtr node_ptr = xmlDocGetRootElement(doc_ptr);
	BOOST_REQUIRE(node_ptr);
	BOOST_REQUIRE(node_ptr->children);
	
	// look for the Connection's node
	node_ptr = ConfigManager::findConfigNodeByName("Connection", node_ptr->children);
	BOOST_REQUIRE(node_ptr);
	
	// get the Connection's identifier
	std::string connection_id;
	BOOST_REQUIRE(ConfigManager::getNodeId(node_ptr, connection_id));

	// make sure that the connection was added
	std::stringstream ss;
	// note: this would throw if the connection is not recognized
	BOOST_CHECK_NO_THROW(m_platform_cfg.getReactionEngine().writeConnectionsXML(ss, connection_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceRemoveConnection) {
	const std::string connection_id("1b7f88d2-dc1d-11dc-9d44-0019e3f89cd2");
	// make a request to remove the connection
	HTTPRequest request;
	request.setMethod(HTTPTypes::REQUEST_METHOD_DELETE);
	request.setResource("/config/connections/" + connection_id);
	HTTPResponsePtr response_ptr(sendRequest(request));
	
	// check the response status code
	BOOST_CHECK_EQUAL(response_ptr->getStatusCode(), HTTPTypes::RESPONSE_CODE_NO_CONTENT);
	
	// make sure that the connection was removed
	std::stringstream ss;
	// note: this should throw if the connection is not recognized
	BOOST_CHECK_THROW(m_platform_cfg.getReactionEngine().writeConnectionsXML(ss, connection_id),
					  ReactionEngine::ConnectionNotFoundException);
}


BOOST_AUTO_TEST_SUITE_END()