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
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/mpl/list.hpp>
#include <boost/bind.hpp>
#include <boost/cast.hpp>
#include <libxml/tree.h>

using namespace pion;
using namespace pion::platform;

/// external functions defined in PionPlatformUnitTests.cpp
extern const std::string& get_log_file_dir(void);
extern const std::string& get_config_file_dir(void);
extern const std::string& get_vocabulary_path(void);
extern const std::string& get_vocabularies_file(void);
extern void setup_logging_for_unit_tests(void);
extern void setup_plugins_directory(void);
extern void cleanup_vocab_config_files(void);

VocabularyManager g_vocab_mgr;
CodecFactory g_codec_factory(g_vocab_mgr);
DatabaseManager g_database_mgr(g_vocab_mgr);

class PluginConfigFixture {
public:
	PluginConfigFixture(const std::string& concrete_plugin_class) {
		m_concrete_plugin_class = concrete_plugin_class;
		BOOST_REQUIRE_NO_THROW(m_config_ptr = ConfigManager::createPluginConfig(m_concrete_plugin_class));
	}
	~PluginConfigFixture(void) {
		xmlFreeNodeList(m_config_ptr);
	}

	xmlNodePtr m_config_ptr;
	std::string m_concrete_plugin_class;
};

class DCCodecFactory : public CodecFactory, public PluginConfigFixture {
public:
	DCCodecFactory(void) : CodecFactory(g_vocab_mgr), PluginConfigFixture("LogCodec") {
		g_vocab_mgr.setConfigFile(get_vocabularies_file());
		g_vocab_mgr.openConfigFile();

		xmlNodePtr event_type_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("EventType"));
		xmlNodeSetContent(event_type_node,  reinterpret_cast<const xmlChar*>("urn:vocab:clickstream#http-request"));
		xmlAddNextSibling(m_config_ptr, event_type_node);
	}

	typedef Codec plugin_type;
};

class DCDatabaseManager : public DatabaseManager, public PluginConfigFixture {
public:
	DCDatabaseManager(void) : DatabaseManager(g_vocab_mgr), PluginConfigFixture("SQLiteDatabase") {
		xmlNodePtr node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("Filename"));
		xmlNodeSetContent(node, reinterpret_cast<const xmlChar*>("some_file"));
		xmlAddNextSibling(m_config_ptr, node);
	}

	typedef Database plugin_type;
};

class DCReactionEngine : public ReactionEngine, public PluginConfigFixture {
public:
	DCReactionEngine(void) : ReactionEngine(g_vocab_mgr, g_codec_factory, g_database_mgr),
							 PluginConfigFixture("FilterReactor")
	{
	}

	typedef Reactor plugin_type;
};

template <typename DefaultConstructablePluginConfig>
class PluginConfig_F : public DefaultConstructablePluginConfig {
public:
	PluginConfig_F() {
		setup_logging_for_unit_tests();
		setup_plugins_directory();

		m_config_file_path = std::string("config/") + m_config_file;
	}
	~PluginConfig_F() {
	}

	typedef DefaultConstructablePluginConfig DCPluginConfig;
	std::string m_config_file_path;
};

typedef boost::mpl::list<PluginConfig_F<DCCodecFactory>, PluginConfig_F<DCDatabaseManager>, PluginConfig_F<DCReactionEngine> > PluginConfig_fixture_list;

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(PluginConfig_S, PluginConfig_fixture_list)

// configIsOpen is inherited from ConfigManager
// ConfigManagerTests tests the static methods of ConfigManager, but PluginConfigTests is a good 
// place to test a lot of the non-static methods, since ConfigManager has a protected constructor.
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigIsOpen) {
	BOOST_CHECK(!F::configIsOpen());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAccessors) {
	BOOST_CHECK_NO_THROW(F::setConfigFile("abc.xml"));
	BOOST_CHECK_EQUAL(F::getConfigFile(), "abc.xml");
	BOOST_CHECK_NO_THROW(F::setConfigFile("xyz.xml"));
	BOOST_CHECK_EQUAL(F::getConfigFile(), "xyz.xml");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkCreateConfigFile) {
	boost::filesystem::remove(m_config_file_path);
	BOOST_CHECK(!boost::filesystem::exists(m_config_file_path));
	BOOST_CHECK_NO_THROW(F::setConfigFile(m_config_file_path));
	BOOST_CHECK_NO_THROW(F::createConfigFile());
	BOOST_CHECK(boost::filesystem::exists(m_config_file_path));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenConfigFile) {
	BOOST_CHECK_NO_THROW(F::setConfigFile(m_config_file_path));
	BOOST_CHECK_NO_THROW(F::openConfigFile());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetPluginConfig) {
	xmlNodePtr comment_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("Comment"));
	xmlNodeSetContent(comment_node,  reinterpret_cast<const xmlChar*>("A new comment"));

	BOOST_CHECK_THROW(F::setPluginConfig("some_id", comment_node), DCPluginConfig::ConfigNotOpenException);
	xmlFreeNodeList(comment_node);
}

// TODO: write some tests that check that updateVocabulary() actually does something
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUpdateVocabulary) {
	BOOST_CHECK_NO_THROW(F::updateVocabulary());
}

BOOST_AUTO_TEST_SUITE_END()


template <typename DefaultConstructablePluginConfig>
class OpenPluginConfig_F : public PluginConfig_F<DefaultConstructablePluginConfig> {
public:
	OpenPluginConfig_F() {
		m_plugin = NULL;
		BOOST_CHECK_NO_THROW(setConfigFile(m_config_file_path));
		BOOST_CHECK_NO_THROW(openConfigFile());
	}
	~OpenPluginConfig_F() {
	}

	void MockCallback(void) {
		g_num_times_mock_called++;
	}

	typename DCPluginConfig::plugin_type* m_plugin;
};

static int g_num_times_mock_called = 0;

typedef boost::mpl::list<OpenPluginConfig_F<DCCodecFactory>, OpenPluginConfig_F<DCDatabaseManager>, OpenPluginConfig_F<DCReactionEngine> > OpenPluginConfig_fixture_list;

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(OpenPluginConfig_S, OpenPluginConfig_fixture_list)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigIsOpen) {
	BOOST_CHECK(F::configIsOpen());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenConfigFileAgain) {
	BOOST_CHECK_NO_THROW(F::openConfigFile());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkAddPlugin) {
	std::string id;
	BOOST_CHECK_NO_THROW(id = F::addPlugin(F::m_config_ptr));
	BOOST_CHECK(id != "");
	BOOST_CHECK(F::hasPlugin(id));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemovePlugin) {
	BOOST_CHECK_THROW(F::removePlugin("123"), PluginManager<F::plugin_type>::PluginNotFoundException);

	std::string id = F::addPlugin(F::m_config_ptr);
	BOOST_CHECK_NO_THROW(F::removePlugin(id));
	BOOST_CHECK(!F::hasPlugin(id));

	BOOST_CHECK_THROW(F::removePlugin(id), PluginManager<F::plugin_type>::PluginNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkHasPlugin) {
	BOOST_CHECK(!F::hasPlugin("bogus_id"));

	std::string id = F::addPlugin(F::m_config_ptr);
	BOOST_CHECK(F::hasPlugin(id));

	F::removePlugin(id);
	BOOST_CHECK(!F::hasPlugin(id));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetWithUnknownId) {
	BOOST_CHECK(F::m_plugins.get("abc") == NULL);
	BOOST_CHECK(F::m_plugins.getLibPtr("abc").getPluginName() == "");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetIdReturnsId) {
	std::string id = F::addPlugin(F::m_config_ptr);

	BOOST_CHECK_NO_THROW(m_plugin = F::m_plugins.get(id));
	BOOST_CHECK_EQUAL(m_plugin->getId(), id);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetPluginNameReturnsPluginName) {
	std::string id = F::addPlugin(F::m_config_ptr);

	PionPluginPtr<F::plugin_type> p = F::m_plugins.getLibPtr(id);
	BOOST_CHECK_EQUAL(p.getPluginName(), m_concrete_plugin_class);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRegisterForUpdates) {
	BOOST_CHECK_NO_THROW(F::registerForUpdates(boost::bind(&OpenPluginConfig_F::MockCallback, this)));

	BOOST_CHECK_NO_THROW(F::setConfigFile(m_config_file_path));
	BOOST_CHECK_NO_THROW(F::openConfigFile());

	g_num_times_mock_called = 0;
	std::string id = F::addPlugin(F::m_config_ptr);
	BOOST_CHECK(g_num_times_mock_called == 1);

	xmlNodePtr comment_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("Comment"));
	xmlNodeSetContent(comment_node,  reinterpret_cast<const xmlChar*>("A new comment"));
	xmlAddNextSibling(m_config_ptr, comment_node);
	BOOST_CHECK_NO_THROW(F::setPluginConfig(id, F::m_config_ptr));
	BOOST_CHECK(g_num_times_mock_called == 2);
}

BOOST_AUTO_TEST_SUITE_END()
