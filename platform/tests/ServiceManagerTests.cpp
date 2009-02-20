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


class ServicesConfigFile_F
{
public:
	ServicesConfigFile_F() {
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
	
	virtual ~ServicesConfigFile_F() {}

	void startWritingServicesConfigFile() {
		m_services_config_file
			<< "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
			<< "<PionConfig xmlns=\"http://purl.org/pion/config\">\n"
			<< "    <Server id=\"main-server\">\n"
			<< "        <Port>8080</Port>\n";
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

BOOST_FIXTURE_TEST_SUITE(ServicesConfigFile_S, ServicesConfigFile_F)

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
	error_code = tcp_conn.connect(boost::asio::ip::address::from_string("127.0.0.1"), 8080);
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

BOOST_AUTO_TEST_SUITE_END()
