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
#include <pion/platform/PluginConfig.hpp>
#include <pion/platform/Protocol.hpp>
#include <pion/platform/ProtocolFactory.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>

using namespace pion;
using namespace pion::platform;


/// external functions defined in PionPlatformUnitTests.cpp
extern const std::string& get_log_file_dir(void);
extern const std::string& get_config_file_dir(void);
extern const std::string& get_vocabulary_path(void);
extern const std::string& get_vocabularies_file(void);
extern void setup_plugins_directory(void);
extern void cleanup_vocab_config_files(void);

static const std::string PROTOCOLS_CONFIG_FILE(get_config_file_dir() + "protocols.xml");
static const std::string PROTOCOLS_TEMPLATE_FILE(get_config_file_dir() + "protocols.tmpl");


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
	setup_plugins_directory();
	ppp.open("HTTPProtocol");
	p = ProtocolPtr(ppp.create());
}

BOOST_AUTO_TEST_CASE(checkHTTPProtocolClone) {
	// Note that PionPluginPtr MUST be in scope as long or longer than any
	// Protocol that use it!!!

	PionPluginPtr<Protocol> ppp;
	ProtocolPtr p;
	setup_plugins_directory();
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
	vocab_mgr.setConfigFile(get_vocabularies_file());
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
			setup_plugins_directory();
			// load the CLF vocabulary
			m_vocab_mgr.setConfigFile(get_vocabularies_file());
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
