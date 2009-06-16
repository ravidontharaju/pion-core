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
#include <pion/PionPlugin.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <pion/platform/PionPlatformUnitTest.hpp>
#include <pion/platform/PluginConfig.hpp>
#include <pion/platform/Protocol.hpp>
#include <pion/platform/ProtocolFactory.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include "../protocols/HTTPProtocol.hpp"

using namespace pion;
using namespace pion::platform;


/// external functions defined in PionPlatformUnitTests.cpp
extern void cleanup_vocab_config_files(void);


/// cleans up config files relevant to Codecs in the working directory
void cleanup_protocol_config_files(bool copy_protocol_config_file)
{
	cleanup_vocab_config_files();

	if (boost::filesystem::exists(PROTOCOLS_CONFIG_FILE))
		boost::filesystem::remove(PROTOCOLS_CONFIG_FILE);
	if (copy_protocol_config_file)
		boost::filesystem::copy_file(PROTOCOLS_TEMPLATE_FILE, PROTOCOLS_CONFIG_FILE);
}


/// fixture class used for basic Protocol tests
class BasicProtocolTests_F
{
public:
	BasicProtocolTests_F(void) {
		cleanup_protocol_config_files(false);
	}
	~BasicProtocolTests_F(void) {}
};

BOOST_FIXTURE_TEST_SUITE(BasicProtocolTests_S, BasicProtocolTests_F)

BOOST_AUTO_TEST_CASE(checkPionPluginPtrDeclaredBeforeProtocolPtr) {
	// Note that PionPluginPtr MUST be in scope as long or longer than any
	// Protocol that use it!!!
	
	PionPluginPtr<Protocol> ppp;
	ProtocolPtr p;
	ppp.open("HTTPProtocol");
	p = ProtocolPtr(ppp.create());
}

BOOST_AUTO_TEST_CASE(checkHTTPProtocolClone) {
	// Note that PionPluginPtr MUST be in scope as long or longer than any
	// Protocol that use it!!!

	PionPluginPtr<Protocol> ppp;
	ProtocolPtr p;
	ppp.open("HTTPProtocol");
	p = ProtocolPtr(ppp.create());
	ProtocolPtr pc;
	pc = p->clone();
	BOOST_CHECK_EQUAL( p->getEventType(), pc->getEventType() );
}

BOOST_AUTO_TEST_CASE(checkProtocolFactoryConstructor) {
	VocabularyManager vocab_mgr;
	BOOST_CHECK_NO_THROW(ProtocolFactory protocolFactory(vocab_mgr));
}

BOOST_AUTO_TEST_CASE(checkProtocolFactoryDestructor) {
	VocabularyManager vocab_mgr;
	ProtocolFactory* protocolFactory = new ProtocolFactory(vocab_mgr);
	BOOST_CHECK_NO_THROW(delete protocolFactory);
}

BOOST_AUTO_TEST_CASE(checkLockVocabularyManagerAfterProtocolFactoryDestroyed) {
	VocabularyManager vocab_mgr;
	vocab_mgr.setConfigFile(VOCABS_CONFIG_FILE);
	vocab_mgr.openConfigFile();
	{
		ProtocolFactory protocolFactory(vocab_mgr);
	}

	vocab_mgr.setLocked("urn:vocab:clickstream", false);
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture class used for testing Protocol Factories
class NewProtocolFactory_F : public ProtocolFactory {
public:
	NewProtocolFactory_F() : ProtocolFactory(m_vocab_mgr) {
		cleanup_protocol_config_files(false);

		if (! m_config_loaded) {
			// load the CLF vocabulary
			m_vocab_mgr.setConfigFile(VOCABS_CONFIG_FILE);
			m_vocab_mgr.openConfigFile();
			m_config_loaded = true;
		}

		// create a new Protocol configuration file
		setConfigFile(PROTOCOLS_CONFIG_FILE);
		createConfigFile();
	}

	~NewProtocolFactory_F() {
	}

	/**
	 * returns a valid configuration tree for a Protocol
	 *
	 * @param plugin_type the type of new plugin that is being created
	 *
	 * @return xmlNodePtr XML configuration list for the new Protocol
	 */
	inline xmlNodePtr createProtocolConfig(const std::string& plugin_type) {
		xmlNodePtr config_ptr(ConfigManager::createPluginConfig(plugin_type));
		xmlNodePtr event_type_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("EventType"));
		xmlNodeSetContent(event_type_node,  reinterpret_cast<const xmlChar*>("urn:vocab:clickstream#http-event"));
		xmlAddNextSibling(config_ptr, event_type_node);
		return config_ptr;
	}


	static VocabularyManager m_vocab_mgr;
	static bool m_config_loaded;
};

bool NewProtocolFactory_F::m_config_loaded = false;
VocabularyManager NewProtocolFactory_F::m_vocab_mgr;

BOOST_FIXTURE_TEST_SUITE(NewProtocolFactory_S, NewProtocolFactory_F)

BOOST_AUTO_TEST_CASE(checkLoadLogProtocol) {
	xmlNodePtr config_ptr(createProtocolConfig("HTTPProtocol"));
	BOOST_CHECK_NO_THROW(addProtocol(config_ptr));
	xmlFreeNodeList(config_ptr);
}

BOOST_AUTO_TEST_CASE(checkLoadUnknownProtocol) {
	xmlNodePtr config_ptr(createProtocolConfig("UnknownProtocol"));
	BOOST_CHECK_THROW(addProtocol(config_ptr), PionPlugin::PluginNotFoundException);
	xmlFreeNodeList(config_ptr);
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture used for to test HTTPProtocol's X-Fowarded-For header parsing
class HTTPProtocolForwardedForTests_F
{
public:
	HTTPProtocolForwardedForTests_F(void) {}
	~HTTPProtocolForwardedForTests_F(void) {}

	inline void checkParsingTrue(const std::string& header, const std::string& result) {
		std::string public_ip;
		BOOST_CHECK(pion::plugins::HTTPProtocol::parseForwardedFor(header, public_ip));
		BOOST_CHECK_EQUAL(public_ip, result);
	}

	inline void checkParsingFalse(const std::string& header) {
		std::string public_ip;
		BOOST_CHECK(! pion::plugins::HTTPProtocol::parseForwardedFor(header, public_ip));
	}
};

BOOST_FIXTURE_TEST_SUITE(HTTPProtocolForwardedForTests_S, HTTPProtocolForwardedForTests_F)

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderNoIP) {
	checkParsingFalse("myserver");
	checkParsingFalse("128.2.02f.12");
}

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderNotPublic) {
	checkParsingFalse("127.0.0.1");
	checkParsingFalse("10.0.2.1");
	checkParsingFalse("192.168.2.12");
	checkParsingFalse("172.16.2.1");
	checkParsingFalse("172.21.2.1");
	checkParsingFalse("172.30.2.1");
}

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderWithSpaces) {
	checkParsingTrue("   129.12.12.204   ", "129.12.12.204");
}

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderFirstNotIP) {
	checkParsingTrue(" phono , 129.2.31.24, 62.31.21.2", "129.2.31.24");
	checkParsingTrue("not_ipv4, 127.2.31.24, 62.31.21.2", "62.31.21.2");
}

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderFirstNotPublic) {
	checkParsingTrue("127.0.0.1, 62.31.21.2", "62.31.21.2");
	checkParsingTrue("10.21.31.2, 172.15.31.2", "172.15.31.2");
	checkParsingTrue("192.168.2.12, 172.32.31.2", "172.32.31.2");
}

BOOST_AUTO_TEST_SUITE_END()
