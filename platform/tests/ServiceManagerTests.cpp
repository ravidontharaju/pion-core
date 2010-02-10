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

#include <pion/PionConfig.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <pion/platform/PionPlatformUnitTest.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem.hpp>
#include <boost/filesystem/fstream.hpp>
#include <boost/asio.hpp>
#include <pion/net/HTTPRequest.hpp>
#include <pion/net/HTTPResponse.hpp>
#include "../server/PlatformConfig.hpp"
#include "../server/ServiceManager.hpp"

using namespace pion;
using namespace pion::net;
using namespace pion::platform;
using namespace pion::server;


/// external functions defined in PionPlatformUnitTests.cpp
extern void cleanup_platform_config_files(void);

// "Servers Only" means no top level Services. 
class ServicesConfigFileServersOnly_F
{
public:
	ServicesConfigFileServersOnly_F() {
		// get everything set up first
		cleanup_platform_config_files();

		// open the default service configuration file for writing
		m_services_config_file_path = SERVICES_CONFIG_FILE;
		m_services_config_file.open(m_services_config_file_path);

		// get the service manager and set its config file 
		// to the (now empty) default service configuration file
		m_service_manager = &m_platform_cfg.getServiceManager();
		m_service_manager->setConfigFile(m_services_config_file_path);
	}
	
	virtual ~ServicesConfigFileServersOnly_F() {}

	void startWritingServicesConfigFile() {
		m_services_config_file
			<< "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
			<< "<PionConfig xmlns=\"http://purl.org/pion/config\">\n"
			<< "    <Server id=\"main-server\">\n"
			<< "        <Port>0</Port>\n";
	}

	void finishWritingServicesConfigFile() {
		m_services_config_file
			<< "    </Server>\n"
			<< "</PionConfig>\n";
		m_services_config_file.close();
	}

	std::string m_services_config_file_path;
	boost::filesystem::ofstream m_services_config_file;
	PlatformConfig m_platform_cfg;
	ServiceManager* m_service_manager;
};

BOOST_FIXTURE_TEST_SUITE(ServicesConfigFileServersOnly_S, ServicesConfigFileServersOnly_F)

BOOST_AUTO_TEST_CASE(checkCanReadValidRedirect) {
	startWritingServicesConfigFile();

	// add a correctly formatted Redirect element
	m_services_config_file << "        <Redirect>\n"
						   << "            <Source>/redirect-me</Source>\n"
						   << "            <Target>/resource2</Target>\n"
						   << "        </Redirect>\n";

	finishWritingServicesConfigFile();

	// try to parse the services config file and confirm that no exception is thrown
	BOOST_CHECK_NO_THROW(m_service_manager->openConfigFile());
}

BOOST_AUTO_TEST_CASE(checkRedirectWithNoSource) {
	startWritingServicesConfigFile();

	// add a Redirect element with no Source node
	m_services_config_file << "        <Redirect>\n"
						   << "            <Target>/resource2</Target>\n"
						   << "        </Redirect>\n";

	finishWritingServicesConfigFile();

	// try to parse the services config file and confirm the correct exception is thrown
	BOOST_CHECK_THROW(m_service_manager->openConfigFile(), ServiceManager::RedirectMissingSourceException);
}

BOOST_AUTO_TEST_CASE(checkRedirectWithEmptySource) {
	startWritingServicesConfigFile();

	// add a Redirect element with empty Source node
	m_services_config_file << "        <Redirect>\n"
						   << "            <Source></Source>\n"
						   << "            <Target>/resource2</Target>\n"
						   << "        </Redirect>\n";

	finishWritingServicesConfigFile();

	// try to parse the services config file and confirm the correct exception is thrown
	BOOST_CHECK_THROW(m_service_manager->openConfigFile(), ServiceManager::RedirectMissingSourceException);
}

BOOST_AUTO_TEST_CASE(checkRedirectWithNoTarget) {
	startWritingServicesConfigFile();

	// add a Redirect element with no Target node
	m_services_config_file << "        <Redirect>\n"
						   << "            <Source>/redirect-me</Source>\n"
						   << "        </Redirect>\n";

	finishWritingServicesConfigFile();

	// try to parse the services config file and confirm the correct exception is thrown
	BOOST_CHECK_THROW(m_service_manager->openConfigFile(), ServiceManager::RedirectMissingTargetException);
}

BOOST_AUTO_TEST_CASE(checkRedirectWithEmptyTarget) {
	startWritingServicesConfigFile();

	// add a Redirect element with no Target node
	m_services_config_file << "        <Redirect>\n"
						   << "            <Source>/redirect-me</Source>\n"
						   << "            <Target></Target>\n"
						   << "        </Redirect>\n";

	finishWritingServicesConfigFile();

	// try to parse the services config file and confirm the correct exception is thrown
	BOOST_CHECK_THROW(m_service_manager->openConfigFile(), ServiceManager::RedirectMissingTargetException);
}

BOOST_AUTO_TEST_CASE(checkNestedWebService) {
	startWritingServicesConfigFile();
	m_services_config_file << "        <WebService id=\"hello-service\">\n"
						   << "            <Name>Hello Service</Name>\n"
						   << "            <Plugin>HelloService</Plugin>\n"
						   << "            <Resource>/hello</Resource>\n"
						   << "        </WebService>\n";
	finishWritingServicesConfigFile();

	// open (and read) the services config file
	m_service_manager->openConfigFile();

	// open a connection
	TCPConnection tcp_conn(m_service_manager->getIOService());
	tcp_conn.setLifecycle(TCPConnection::LIFECYCLE_KEEPALIVE);
	boost::system::error_code error_code;
	error_code = tcp_conn.connect(boost::asio::ip::address::from_string("127.0.0.1"),
		m_service_manager->getPort());
	BOOST_REQUIRE(!error_code);

	// send a request to the HelloService and check for a response
	HTTPRequest http_request;
	http_request.setResource("/hello");
	http_request.send(tcp_conn, error_code);
	HTTPResponse http_response(http_request);
	http_response.receive(tcp_conn, error_code);
	BOOST_CHECK(http_response.getStatusCode() == 200);
	BOOST_CHECK(boost::regex_match(http_response.getContent(), boost::regex(".*Hello\\sWorld.*")));
}

BOOST_AUTO_TEST_CASE(checkRedirectElementHasDesiredEffect) {
	// write a services config file that redirects /xyz to /hello and loads the HelloService for resource /hello 
	startWritingServicesConfigFile();
	m_services_config_file << "        <Redirect>\n"
						   << "            <Source>/xyz</Source>\n"
						   << "            <Target>/hello</Target>\n"
						   << "        </Redirect>\n"
						   << "        <WebService id=\"hello-service\">\n"
						   << "            <Name>Hello Service</Name>\n"
						   << "            <Plugin>HelloService</Plugin>\n"
						   << "            <Resource>/hello</Resource>\n"
						   << "        </WebService>\n";
	finishWritingServicesConfigFile();

	// open (and read) the services config file
	m_service_manager->openConfigFile();

	// open a connection
	TCPConnection tcp_conn(m_service_manager->getIOService());
	tcp_conn.setLifecycle(TCPConnection::LIFECYCLE_KEEPALIVE);
	boost::system::error_code error_code;
	error_code = tcp_conn.connect(boost::asio::ip::address::from_string("127.0.0.1"),
		m_service_manager->getPort());
	BOOST_REQUIRE(!error_code);

	// send a request to /xyz and check that the response is from HelloService
	HTTPRequest http_request;
	http_request.setResource("/xyz");
	http_request.send(tcp_conn, error_code);
	HTTPResponse http_response(http_request);
	http_response.receive(tcp_conn, error_code);
	BOOST_CHECK(http_response.getStatusCode() == 200);
	BOOST_CHECK(boost::regex_match(http_response.getContent(), boost::regex(".*Hello\\sWorld.*")));
}

BOOST_AUTO_TEST_CASE(checkNestedPlatformService) {
	startWritingServicesConfigFile();
	m_services_config_file << "        <PlatformService id=\"query-service\">\n"
						   << "            <Name>Query Service</Name>\n"
						   << "            <Plugin>QueryService</Plugin>\n"
						   << "            <Resource>/query</Resource>\n"
						   << "        </PlatformService>\n";
	finishWritingServicesConfigFile();

	// open (and read) the services config file
	m_service_manager->openConfigFile();

	// open a connection
	TCPConnection tcp_conn(m_service_manager->getIOService());
	tcp_conn.setLifecycle(TCPConnection::LIFECYCLE_KEEPALIVE);
	boost::system::error_code error_code;
	error_code = tcp_conn.connect(boost::asio::ip::address::from_string("127.0.0.1"),
		m_service_manager->getPort());
	BOOST_REQUIRE(!error_code);

	// Send a request to the QueryService and check for a response.
	// (It would be nicer to send a request that didn't result in an error, but that would require 
	// loading some Reactors, and this test is sufficient to show the QueryService is loaded.)
	HTTPRequest http_request;
	http_request.setResource("/query/BOGUS");
	http_request.send(tcp_conn, error_code);
	HTTPResponse http_response(http_request);
	http_response.receive(tcp_conn, error_code);
	BOOST_CHECK_EQUAL(http_response.getStatusCode(), HTTPTypes::RESPONSE_CODE_SERVER_ERROR);
	BOOST_CHECK_EQUAL(http_response.getContent(), "QueryService - invalid query format");
}

BOOST_AUTO_TEST_SUITE_END()


class ServicesConfigFile_F
{
public:
	ServicesConfigFile_F() : m_tcp_conn(NULL) {
		// get everything set up first
		cleanup_platform_config_files();

		// open the default service configuration file for writing
		m_services_config_file_path = SERVICES_CONFIG_FILE;
		m_services_config_file.open(m_services_config_file_path);

		// get the service manager and set its config file 
		// to the (now empty) default service configuration file
		m_service_manager = &m_platform_cfg.getServiceManager();
		m_service_manager->setConfigFile(m_services_config_file_path);
	}
	
	virtual ~ServicesConfigFile_F() {
		delete m_tcp_conn;
	}

	void sendRequestAndCheckResponse(
		const std::string& resource,
		TCPConnection& tcp_conn,
		unsigned int expected_status_code,
		const std::string& expected_content_substring)
	{
		HTTPRequest http_request;
		http_request.setResource(resource);
		http_request.send(tcp_conn, m_ec);
		HTTPResponse http_response(http_request);
		http_response.receive(tcp_conn, m_ec);
		BOOST_CHECK_EQUAL(http_response.getStatusCode(), expected_status_code);
		BOOST_CHECK(boost::regex_search(http_response.getContent(), boost::regex(expected_content_substring)));
	}

	std::string m_services_config_file_path;
	boost::filesystem::ofstream m_services_config_file;
	PlatformConfig m_platform_cfg;
	ServiceManager* m_service_manager;
	TCPConnection* m_tcp_conn;
	boost::system::error_code m_ec;
};

BOOST_FIXTURE_TEST_SUITE(ServicesConfigFile_S, ServicesConfigFile_F)

BOOST_AUTO_TEST_CASE(checkTopLevelWebService) {
	m_services_config_file
		<< "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		<< "<PionConfig xmlns=\"http://purl.org/pion/config\">\n"
		<< "    <Server id=\"main-server\">\n"
		<< "        <Port>0</Port>\n"
		<< "    </Server>\n"
		<< "    <WebService id=\"hello-service\">\n"
		<< "        <Name>Hello Service</Name>\n"
		<< "        <Plugin>HelloService</Plugin>\n"
		<< "        <Resource>/hello2</Resource>\n"
		<< "        <Server>main-server</Server>\n"
		<< "    </WebService>\n"
		<< "</PionConfig>\n";
	m_services_config_file.close();

	// try to parse the services config file and confirm that no exception is thrown
	BOOST_CHECK_NO_THROW(m_service_manager->openConfigFile());

	// open a connection
	TCPConnection tcp_conn(m_service_manager->getIOService());
	tcp_conn.setLifecycle(TCPConnection::LIFECYCLE_KEEPALIVE);
	boost::system::error_code error_code;
	error_code = tcp_conn.connect(boost::asio::ip::address::from_string("127.0.0.1"),
		m_service_manager->getPort());
	BOOST_REQUIRE(!error_code);

	// Send a request to the HelloService and spot check the response.
	sendRequestAndCheckResponse("/hello2", tcp_conn, HTTPTypes::RESPONSE_CODE_OK, "Hello World");
}

BOOST_AUTO_TEST_CASE(checkTopLevelPlatformService) {
	m_services_config_file
		<< "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		<< "<PionConfig xmlns=\"http://purl.org/pion/config\">\n"
		<< "    <Server id=\"main-server\">\n"
		<< "        <Port>0</Port>\n"
		<< "    </Server>\n"
		<< "    <PlatformService id=\"query-service\">\n"
		<< "        <Name>Query Service</Name>\n"
		<< "        <Plugin>QueryService</Plugin>\n"
		<< "        <Server>main-server</Server>\n"
		<< "        <Resource>/query2</Resource>\n"
		<< "    </PlatformService>\n"
		<< "</PionConfig>\n";
	m_services_config_file.close();

	// try to parse the services config file and confirm that no exception is thrown
	BOOST_CHECK_NO_THROW(m_service_manager->openConfigFile());

	// open a connection
	TCPConnection tcp_conn(m_service_manager->getIOService());
	tcp_conn.setLifecycle(TCPConnection::LIFECYCLE_KEEPALIVE);
	boost::system::error_code error_code;
	error_code = tcp_conn.connect(boost::asio::ip::address::from_string("127.0.0.1"),
		m_service_manager->getPort());
	BOOST_REQUIRE(!error_code);

	// Send a request to the QueryService and check for a response.
	// (It would be nicer to send a request that didn't result in an error, but that would require 
	// loading some Reactors, and this test is sufficient to show the QueryService is loaded.)
	sendRequestAndCheckResponse("/query2/BOGUS", tcp_conn, HTTPTypes::RESPONSE_CODE_SERVER_ERROR, "QueryService - invalid query format");
}

BOOST_AUTO_TEST_CASE(checkTopLevelPlatformServiceWithoutServerSpecified) {
	m_services_config_file
		<< "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		<< "<PionConfig xmlns=\"http://purl.org/pion/config\">\n"
		<< "    <Server id=\"main-server\">\n"
		<< "        <Port>0</Port>\n"
		<< "    </Server>\n"
		<< "    <PlatformService id=\"query-service\">\n"
		<< "        <Name>Query Service</Name>\n"
		<< "        <Plugin>QueryService</Plugin>\n"
		<< "        <Resource>/query</Resource>\n"
		<< "    </PlatformService>\n"
		<< "</PionConfig>\n";
	m_services_config_file.close();

	// Try to parse the services config file and confirm that the expected exception is thrown.
	bool exception_caught = false;
	try {
		m_service_manager->openConfigFile();
	} catch (PluginConfig<PlatformService>::PluginException& e) {
		exception_caught = true;
		BOOST_CHECK_EQUAL(e.what(), "Service configuration includes a Service without a Server identifier: query-service");
	}
	BOOST_CHECK(exception_caught);
}

BOOST_AUTO_TEST_CASE(checkComboOfVariousConfigCases) {
	m_services_config_file
		<< "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		<< "<PionConfig xmlns=\"http://purl.org/pion/config\">\n"
		<< "    <Server id=\"server-1\">\n"
		<< "        <Port>2050</Port>\n"
		<< "        <PlatformService id=\"query-service-1-A\">\n"
		<< "            <Name>Query Service 1-A</Name>\n"
		<< "            <Plugin>QueryService</Plugin>\n"
		<< "            <Resource>/query1A</Resource>\n"
		<< "        </PlatformService>\n"
		<< "        <PlatformService id=\"config-service-1-A\">\n"
		<< "            <Name>Config Service 1-A</Name>\n"
		<< "            <Plugin>ConfigService</Plugin>\n"
		<< "            <Resource>/config1A</Resource>\n"
		<< "            <UIDirectory>../../platform/ui</UIDirectory>\n"
		<< "        </PlatformService>\n"
		<< "        <WebService id=\"hello-service-1-A\">\n"
		<< "            <Name>Hello Service 1-A</Name>\n"
		<< "            <Plugin>HelloService</Plugin>\n"
		<< "            <Resource>/hello1A</Resource>\n"
		<< "        </WebService>\n"
		<< "    </Server>\n"
		<< "    <Server id=\"server-2\">\n"
		<< "        <Port>2051</Port>\n"
		<< "    </Server>\n"
		<< "    <PlatformService id=\"query-service-1-B\">\n"
		<< "        <Name>Query Service 1-B</Name>\n"
		<< "        <Plugin>QueryService</Plugin>\n"
		<< "        <Server>server-1</Server>\n"
		<< "        <Resource>/query1B</Resource>\n"
		<< "    </PlatformService>\n"
		<< "    <WebService id=\"hello-service-1-B\">\n"
		<< "        <Name>Hello Service 1-B</Name>\n"
		<< "        <Plugin>HelloService</Plugin>\n"
		<< "        <Server>server-1</Server>\n"
		<< "        <Resource>/hello1B</Resource>\n"
		<< "    </WebService>\n"
		<< "    <PlatformService id=\"query-service-2-A\">\n"
		<< "        <Name>Query Service 2-A</Name>\n"
		<< "        <Plugin>QueryService</Plugin>\n"
		<< "        <Server>server-2</Server>\n"
		<< "        <Resource>/query2A</Resource>\n"
		<< "    </PlatformService>\n"
		<< "    <PlatformService id=\"config-service-2-A\">\n"
		<< "        <Name>Config Service 2-A</Name>\n"
		<< "        <Plugin>ConfigService</Plugin>\n"
		<< "        <Server>server-2</Server>\n"
		<< "        <Resource>/config2A</Resource>\n"
		<< "        <UIDirectory>../../platform/ui</UIDirectory>\n"
		<< "    </PlatformService>\n"
		<< "    <WebService id=\"hello-service-2-A\">\n"
		<< "        <Name>Hello Service 2-A</Name>\n"
		<< "        <Plugin>HelloService</Plugin>\n"
		<< "        <Server>server-2</Server>\n"
		<< "        <Resource>/hello2A</Resource>\n"
		<< "    </WebService>\n"
		<< "</PionConfig>\n";
	m_services_config_file.close();

	// try to parse the services config file and confirm that no exception is thrown
	BOOST_CHECK_NO_THROW(m_service_manager->openConfigFile());
	// Use the following to find out what the problem is (address-already-in-use most likely) if errors occur
//	m_service_manager->openConfigFile();

	// open a connection on port 1
	TCPConnection tcp_conn_1(m_service_manager->getIOService());
	tcp_conn_1.setLifecycle(TCPConnection::LIFECYCLE_KEEPALIVE);
	m_ec = tcp_conn_1.connect(boost::asio::ip::address::from_string("127.0.0.1"), 2050);
	BOOST_REQUIRE(!m_ec);

	// open a connection on port 2
	TCPConnection tcp_conn_2(m_service_manager->getIOService());
	tcp_conn_2.setLifecycle(TCPConnection::LIFECYCLE_KEEPALIVE);
	m_ec = tcp_conn_2.connect(boost::asio::ip::address::from_string("127.0.0.1"), 2051);
	BOOST_REQUIRE(!m_ec);

	// Send a request to each Service and spot check the response.
	sendRequestAndCheckResponse("/query1A/BOGUS", tcp_conn_1, HTTPTypes::RESPONSE_CODE_SERVER_ERROR, "QueryService - invalid query format");
	sendRequestAndCheckResponse("/config1A/reactors/plugins", tcp_conn_1, HTTPTypes::RESPONSE_CODE_OK, "LogInputReactor");
	sendRequestAndCheckResponse("/hello1A", tcp_conn_1, HTTPTypes::RESPONSE_CODE_OK, "Hello World");
	sendRequestAndCheckResponse("/query1B/BOGUS", tcp_conn_1, HTTPTypes::RESPONSE_CODE_SERVER_ERROR, "QueryService - invalid query format");
	sendRequestAndCheckResponse("/hello1B", tcp_conn_1, HTTPTypes::RESPONSE_CODE_OK, "Hello World");
	sendRequestAndCheckResponse("/query2A/BOGUS", tcp_conn_2, HTTPTypes::RESPONSE_CODE_SERVER_ERROR, "QueryService - invalid query format");
	sendRequestAndCheckResponse("/config2A/services", tcp_conn_2, HTTPTypes::RESPONSE_CODE_OK, "Hello Service 2-A");
	sendRequestAndCheckResponse("/hello2A", tcp_conn_2, HTTPTypes::RESPONSE_CODE_OK, "Hello World");

	// sanity check
	sendRequestAndCheckResponse("/query",  tcp_conn_1, HTTPTypes::RESPONSE_CODE_NOT_FOUND, "The requested URL /query was not found on this server.");
}

BOOST_AUTO_TEST_SUITE_END()
