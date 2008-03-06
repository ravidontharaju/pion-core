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
		m_do_nothing_id("0cc21558-cf84-11dc-a9e0-0019e3f89cd2"),
		m_date_codec_id("dba9eac2-d8bb-11dc-bebe-001cc02bd66b"),
		m_embedded_db_id("e75d88f0-e7df-11dc-a76c-0016cb926e68"),
		m_vocab_a_id("urn:vocab:test"), m_big_int_id("urn:vocab:test#big-int")
	{
		// get everything setup first
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
	
	/**
	 * uses the ConfigService to add a new resource (plugin, connection, etc.)
	 *
	 * @param resource the resource to add
	 * @param element_name the name of the resource's XML config element
	 * @param config_str XML config for the new resource
	 *
	 * @return std::string unique identifier for the new resource
	 */
	inline std::string checkAddResource(const std::string& resource,
										const std::string& element_name,
										const std::string& config_str)
	{
		// make a request to add a new resource
		HTTPRequest request;
		request.setMethod(HTTPTypes::REQUEST_METHOD_POST);
		request.setResource(resource);
		request.setContentLength(config_str.size());
		memcpy(request.createContentBuffer(), config_str.c_str(), config_str.size());
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
		
		// look for the resource's node
		node_ptr = ConfigManager::findConfigNodeByName(element_name, node_ptr->children);
		BOOST_REQUIRE(node_ptr);
		std::string resource_id;
		BOOST_REQUIRE(ConfigManager::getNodeId(node_ptr, resource_id));
	 
		return resource_id;
	}
	
	/**
	 * uses the ConfigService to update a resource (plugin, connection, etc.)
	 *
	 * @param resource the resource to update
	 * @param element_name the name of the resource's XML config element
	 * @param config_str XML config for the new resource
	 * @param check_opt_name name of an option to check
	 * @param check_opt_value value that the option should be assigned to
	 */
	inline void checkUpdateResource(const std::string& resource,
									const std::string& element_name,
									const std::string& config_str,
									const std::string& check_opt_name,
									const std::string& check_opt_value)
	{
		// make a request to update the resource's configuration
		HTTPRequest request;
		request.setMethod(HTTPTypes::REQUEST_METHOD_PUT);
		request.setResource(resource);
		request.setContentLength(config_str.size());
		memcpy(request.createContentBuffer(), config_str.c_str(), config_str.size());
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
		
		// look for the resource's node
		node_ptr = ConfigManager::findConfigNodeByName(element_name, node_ptr->children);
		BOOST_REQUIRE(node_ptr);
		BOOST_REQUIRE(node_ptr->children);
		
		// find the option element
		std::string value_str;
		BOOST_REQUIRE(ConfigManager::getConfigOption(check_opt_name, value_str, node_ptr->children));
		BOOST_CHECK_EQUAL(value_str, check_opt_value);
	}

	/**
	 * uses the ConfigService to remove a resource (plugin, connection, etc.)
	 *
	 * @param resource the resource representing the item to remove
	 */
	inline void checkDeleteResource(const std::string& resource) {
		// make a request to remove the "log writer" reactor
		HTTPRequest request;
		request.setMethod(HTTPTypes::REQUEST_METHOD_DELETE);
		request.setResource(resource);
		HTTPResponsePtr response_ptr(sendRequest(request));
		
		// check the response status code
		BOOST_CHECK_EQUAL(response_ptr->getStatusCode(), HTTPTypes::RESPONSE_CODE_NO_CONTENT);
	}
		

	PlatformConfig		m_platform_cfg;
	const std::string	m_log_reader_id;
	const std::string	m_log_writer_id;
	const std::string	m_do_nothing_id;
	const std::string	m_date_codec_id;
	const std::string	m_embedded_db_id;
	const std::string	m_vocab_a_id;
	const std::string	m_big_int_id;
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
	std::string reactor_id = checkAddResource("/config/reactors", "Reactor", reactor_config_str);
	
	// make sure that the Reactor was created
	BOOST_CHECK(m_platform_cfg.getReactionEngine().hasPlugin(reactor_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceUpdateLogWriterReactorConfig) {
	std::string reactor_config_str = "<PionConfig><Reactor>"
		"<Name>Updated ELF Log Writer</Name>"
		"<Comment>Writes a new log file using ELF (Updated)</Comment>"
		"<Plugin>LogOutputReactor</Plugin>"
		"<Codec>23f68d5a-bfec-11dc-81a7-0016cb926e68</Codec>"
		"<Filename>../logs/new.log</Filename>"
		"</Reactor></PionConfig>";
	
	// make a request to update the "log writer" Reactor
	checkUpdateResource("/config/reactors/" + m_log_writer_id, "Reactor",
						reactor_config_str, "Filename", "../logs/new.log");
}

BOOST_AUTO_TEST_CASE(checkConfigServiceRemoveLogWriterReactor) {
	// make a request to remove the "log writer" reactor
	checkDeleteResource("/config/reactors/" + m_log_writer_id);

	// make sure that the Reactor was removed
	BOOST_CHECK(! m_platform_cfg.getReactionEngine().hasPlugin(m_log_writer_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceAddNewConnection) {
	std::string connection_config_str = "<PionConfig><Connection>"
		"<Type>reactor</Type>"
		"<From>c7a9f95a-e305-11dc-98ce-0016cb926e68</From>"
		"<To>0cc21558-cf84-11dc-a9e0-0019e3f89cd2</To>"
		"</Connection></PionConfig>";
	
	// make a request to add a new Reactor
	std::string connection_id = checkAddResource("/config/connections", "Connection", connection_config_str);

	// make sure that the connection was added
	std::stringstream ss;
	// note: this would throw if the connection is not recognized
	BOOST_CHECK_NO_THROW(m_platform_cfg.getReactionEngine().writeConnectionsXML(ss, connection_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceRemoveConnection) {
	const std::string connection_id("1b7f88d2-dc1d-11dc-9d44-0019e3f89cd2");

	// make a request to remove the connection
	checkDeleteResource("/config/connections/" + connection_id);
	
	// make sure that the connection was removed
	std::stringstream ss;
	// note: this should throw if the connection is not recognized
	BOOST_CHECK_THROW(m_platform_cfg.getReactionEngine().writeConnectionsXML(ss, connection_id),
					  ReactionEngine::ConnectionNotFoundException);
}

BOOST_AUTO_TEST_CASE(checkConfigServiceAddNewCodec) {
	std::string codec_config_str = "<PionConfig><Codec>"
		"<Plugin>LogCodec</Plugin>"
		"<EventType>urn:vocab:clickstream#http-request</EventType>"
		"</Codec></PionConfig>";
	
	// make a request to add a new Codec
	std::string codec_id = checkAddResource("/config/codecs", "Codec", codec_config_str);
	
	// make sure that the Codec was created
	BOOST_CHECK(m_platform_cfg.getCodecFactory().hasPlugin(codec_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceUpdateDateCodecConfig) {
	std::string codec_config_str = "<PionConfig><Codec>"
		"<Name>Updated Date</Name>"
		"<Comment>Updated codec for just dates</Comment>"
		"<Plugin>LogCodec</Plugin>"
		"<EventType>urn:vocab:clickstream#http-request</EventType>"
		"<Field term=\"urn:vocab:clickstream#date\" start=\"[\" end=\"]\">date</Field>"
		"</Codec></PionConfig>";
	
	// make a request to update the "log writer" Reactor
	checkUpdateResource("/config/codecs/" + m_date_codec_id, "Codec",
						codec_config_str, "Name", "Updated Date");
}

BOOST_AUTO_TEST_CASE(checkConfigServiceRemoveDateCodec) {
	// make a request to remove the "just the date" codec
	checkDeleteResource("/config/codecs/" + m_date_codec_id);

	// make sure that the Reactor was removed
	BOOST_CHECK(! m_platform_cfg.getCodecFactory().hasPlugin(m_date_codec_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceAddNewDatabase) {
	std::string database_config_str = "<PionConfig><Database>"
		"<Plugin>SQLiteDatabase</Plugin>"
		"<Filename>new.db</Filename>"
		"</Database></PionConfig>";
	
	// make a request to add a new Database
	std::string database_id = checkAddResource("/config/databases", "Database", database_config_str);
	
	// make sure that the Database was created
	BOOST_CHECK(m_platform_cfg.getDatabaseManager().hasPlugin(database_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceUpdateEmbeddedDatabaseConfig) {
	std::string database_config_str = "<PionConfig><Database>"
		"<Name>Updated Storage Database</Name>"
		"<Comment>Embedded SQLite database for storing events</Comment>"
		"<Plugin>SQLiteDatabase</Plugin>"
		"<Filename>updated.db</Filename>"
		"</Database></PionConfig>";
	
	// make a request to update the "log writer" Reactor
	checkUpdateResource("/config/databases/" + m_embedded_db_id, "Database",
						database_config_str, "Filename", "updated.db");
}

BOOST_AUTO_TEST_CASE(checkConfigServiceRemoveEmbeddedDatabase) {
	// make a request to remove the "embedded storage" Database
	checkDeleteResource("/config/databases/" + m_embedded_db_id);
	
	// make sure that the Database was removed
	BOOST_CHECK(! m_platform_cfg.getDatabaseManager().hasPlugin(m_embedded_db_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceAddNewVocabulary) {
	const std::string vocab_c_id("urn:vocab:test_c");
	std::string vocab_config_str = "<PionConfig><Vocabulary>"
		"<Name>Vocabulary C</Name>"
		"</Vocabulary></PionConfig>";
	
	// make a request to add a new Vocabulary
	std::string vocab_id = checkAddResource("/config/vocabularies/" + vocab_c_id,
											"Vocabulary", vocab_config_str);
	BOOST_CHECK_EQUAL(vocab_id, vocab_c_id);
	
	// make sure that the Vocabulary was created
	BOOST_CHECK(m_platform_cfg.getVocabularyManager().hasVocabulary(vocab_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceUpdateTestAVocabulary) {
	std::string vocab_config_str = "<PionConfig><Vocabulary>"
		"<Name>Vocabulary A</Name>"
		"<Comment>Locked Vocabulary for Unit Tests</Comment>"
		"<Locked>true</Locked>"
		"</Vocabulary></PionConfig>";
	
	// make a request to update the "test a" Vocabulary
	checkUpdateResource("/config/vocabularies/" + m_vocab_a_id, "Vocabulary",
						vocab_config_str, "Locked", "true");
	
	// try to update the Vocabulary
	BOOST_CHECK_THROW(m_platform_cfg.getVocabularyManager().removeTerm(m_vocab_a_id,
																	   m_big_int_id),
					  VocabularyConfig::VocabularyIsLockedException);
}

BOOST_AUTO_TEST_CASE(checkConfigServiceRemoveTestAVocabulary) {
	// make a request to remove the "test a" Vocabulary
	checkDeleteResource("/config/vocabularies/" + m_vocab_a_id);
	
	// make sure that the Database was removed
	BOOST_CHECK(! m_platform_cfg.getVocabularyManager().hasVocabulary(m_vocab_a_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceAddNewTerm) {
	const std::string new_term_id("urn:vocab:test#a-new-term");
	std::string term_config_str = "<PionConfig><Term>"
		"<Type>uint64</Type>"
		"</Term></PionConfig>";
	
	// make a request to add a new Term
	std::string term_id = checkAddResource("/config/terms/" + new_term_id,
										   "Term", term_config_str);
	BOOST_CHECK_EQUAL(term_id, new_term_id);
	
	// make sure that the Term was created
	BOOST_CHECK(m_platform_cfg.getVocabularyManager().hasTerm(term_id));
}

BOOST_AUTO_TEST_CASE(checkConfigServiceUpdateBigIntTerm) {
	std::string term_config_str = "<PionConfig><Term>"
		"<Type>int32</Type>"
		"<Comment>A big integer</Comment>"
		"</Term></PionConfig>";
	
	// make a request to update the "big integer" Term
	checkUpdateResource("/config/terms/" + m_big_int_id, "Term",
						term_config_str, "Type", "int32");
}

BOOST_AUTO_TEST_CASE(checkConfigServiceRemoveBigIntTerm) {
	// make a request to remove the "big integer" Term
	checkDeleteResource("/config/terms/" + m_big_int_id);
	
	// make sure that the Term was removed
	BOOST_CHECK(! m_platform_cfg.getVocabularyManager().hasTerm(m_big_int_id));
}

BOOST_AUTO_TEST_SUITE_END()

