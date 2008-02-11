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
#include <pion/platform/VocabularyManager.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <boost/cstdint.hpp>
#include <boost/thread/xtime.hpp>
#include <boost/thread/thread.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include <fstream>
#include <string>

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


/// static strings used by these unit tests
static const std::string COMBINED_LOG_FILE(get_log_file_dir() + "combined.log");
static const std::string REACTORS_TEMPLATE_FILE(get_config_file_dir() + "reactors.tmpl");
static const std::string REACTORS_CONFIG_FILE(get_config_file_dir() + "reactors.xml");
static const std::string CODECS_TEMPLATE_FILE(get_config_file_dir() + "codecs.tmpl");
static const std::string CODECS_CONFIG_FILE(get_config_file_dir() + "codecs.xml");


/// cleans up reactor config files in the working directory
void cleanup_reactor_config_files(void)
{
	cleanup_vocab_config_files();

	if (boost::filesystem::exists(REACTORS_CONFIG_FILE))
		boost::filesystem::remove(REACTORS_CONFIG_FILE);

	if (boost::filesystem::exists(CODECS_CONFIG_FILE))
		boost::filesystem::remove(CODECS_CONFIG_FILE);
	boost::filesystem::copy_file(CODECS_TEMPLATE_FILE, CODECS_CONFIG_FILE);
}


/// interface class for ReactionEngine tests
class ReactionEngineTestInterface_F {
public:
	ReactionEngineTestInterface_F()
		: m_vocab_mgr(), m_codec_factory(m_vocab_mgr), m_database_mgr(m_vocab_mgr),
		m_reaction_engine(m_vocab_mgr, m_codec_factory, m_database_mgr),
		m_combined_id("urn:uuid:3f49f2da-bfe3-11dc-8875-0016cb926e68"),
		m_ie_filter_id("urn:uuid:153f6c40-cb78-11dc-8fa0-0019e3f89cd2")
	{
		setup_logging_for_unit_tests();
		setup_plugins_directory();		
		cleanup_reactor_config_files();
		m_vocab_mgr.setConfigFile(get_vocabularies_file());
		m_vocab_mgr.openConfigFile();
		m_codec_factory.setConfigFile(CODECS_CONFIG_FILE);
		m_codec_factory.openConfigFile();
		m_combined_codec = m_codec_factory.getCodec(m_combined_id);
		BOOST_CHECK(m_combined_codec);
	}
	virtual ~ReactionEngineTestInterface_F() {}
	
	/**
	 * put the current thread to sleep for an amount of time
	 *
	 * @param nsec number of nanoseconds (10^-9) to sleep for
	 */
	inline void sleep_briefly(unsigned long nsec)
	{
		boost::xtime stop_time;
		boost::xtime_get(&stop_time, boost::TIME_UTC);
		stop_time.nsec += nsec;
		if (stop_time.nsec >= 1000000000) {
			stop_time.sec++;
			stop_time.nsec -= 1000000000;
		}
		boost::thread::sleep(stop_time);
	}
	
	
	VocabularyManager	m_vocab_mgr;
	CodecFactory		m_codec_factory;
	DatabaseManager		m_database_mgr;
	ReactionEngine		m_reaction_engine;
	const std::string	m_combined_id;
	const std::string	m_ie_filter_id;
	CodecPtr			m_combined_codec;
};


/// fixture for some basic ReactionEngine tests
class ReactionEngineBasicTests_F
	: public ReactionEngineTestInterface_F
{
public:
	ReactionEngineBasicTests_F() {
		m_reaction_engine.setConfigFile(REACTORS_CONFIG_FILE);
		m_reaction_engine.createConfigFile();
	}
	virtual ~ReactionEngineBasicTests_F() {}
};

BOOST_FIXTURE_TEST_SUITE(ReactionEngineBasicTests_S, ReactionEngineBasicTests_F)

BOOST_AUTO_TEST_CASE(checkAddConnectionForMissingReactor) {
	BOOST_CHECK_THROW(m_reaction_engine.addConnection("bad_id", "another_bad_id"),
					  ReactionEngine::ReactorNotFoundException);
}

BOOST_AUTO_TEST_CASE(checkRemoveConnectionForMissingReactor) {
	BOOST_CHECK_THROW(m_reaction_engine.removeConnection("bad_id", "another_bad_id"),
					  ReactionEngine::ReactorNotFoundException);
}

BOOST_AUTO_TEST_CASE(checkAddFilterReactorNoConfig) {
	std::string reactor_id = m_reaction_engine.addPlugin("FilterReactor");
	BOOST_CHECK(! reactor_id.empty());
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for Reactor connection tests
class ReactionEngineConnectionTests_F
	: public ReactionEngineTestInterface_F
{
public:
	ReactionEngineConnectionTests_F() {
		m_reaction_engine.setConfigFile(REACTORS_CONFIG_FILE);
		m_reaction_engine.createConfigFile();
		
		filter_one_id = m_reaction_engine.addPlugin("FilterReactor");
		BOOST_REQUIRE(! filter_one_id.empty());

		filter_two_id = m_reaction_engine.addPlugin("FilterReactor");
		BOOST_REQUIRE(! filter_two_id.empty());
	}
	virtual ~ReactionEngineConnectionTests_F() {}
	
	std::string filter_one_id;
	std::string filter_two_id;
};

BOOST_FIXTURE_TEST_SUITE(ReactionEngineConnectionTests_S, ReactionEngineConnectionTests_F)

BOOST_AUTO_TEST_CASE(checkAddThenRemoveReactorConnection) {
	m_reaction_engine.addConnection(filter_one_id, filter_two_id);
	
	// check config file
	// ...
	
	m_reaction_engine.removeConnection(filter_one_id, filter_two_id);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for testing filters on log file data
class ReactionEngineLogFilterTests_F
	: public ReactionEngineTestInterface_F
{
public:
	ReactionEngineLogFilterTests_F() {
		boost::filesystem::copy_file(REACTORS_TEMPLATE_FILE, REACTORS_CONFIG_FILE);
		m_reaction_engine.setConfigFile(REACTORS_CONFIG_FILE);
		m_reaction_engine.openConfigFile();
	}
	virtual ~ReactionEngineLogFilterTests_F() {}
};


BOOST_FIXTURE_TEST_SUITE(ReactionEngineLogFilterTests_S, ReactionEngineLogFilterTests_F)

BOOST_AUTO_TEST_CASE(checkSetReactorWorkspace) {
	// get the current configuration for the Reactor
	xmlNodePtr reactor_config = m_reaction_engine.getPluginConfig(m_ie_filter_id);
	BOOST_REQUIRE(reactor_config);
	
	// add a "Workspace" node
	xmlNodePtr workspace_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("Workspace"));
	xmlNodeSetContent(workspace_node,  reinterpret_cast<const xmlChar*>("Log Workspace"));
	xmlAddNextSibling(reactor_config->last, workspace_node);

	// update the Reactor's config
	BOOST_CHECK_NO_THROW(m_reaction_engine.setPluginConfig(m_ie_filter_id,
														   reactor_config->children));
	xmlFreeNodeList(reactor_config);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkSetReactorCoordinates) {
	// get the current configuration for the Reactor
	xmlNodePtr reactor_config = m_reaction_engine.getPluginConfig(m_ie_filter_id);
	BOOST_REQUIRE(reactor_config);
	
	// add coordinate nodes
	xmlNodePtr x_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("X"));
	xmlNodeSetContent(x_node,  reinterpret_cast<const xmlChar*>("75"));
	xmlAddNextSibling(reactor_config->last, x_node);
	xmlNodePtr y_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("Y"));
	xmlNodeSetContent(y_node,  reinterpret_cast<const xmlChar*>("50"));
	xmlAddNextSibling(reactor_config->last, y_node);
	
	// update the Reactor's config
	BOOST_CHECK_NO_THROW(m_reaction_engine.setPluginConfig(m_ie_filter_id,
														   reactor_config->children));
	xmlFreeNodeList(reactor_config);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkNumberofIERequestsInLogFile) {
	// start the reaction engine
	m_reaction_engine.start();
	
	// open the CLF log file
	std::ifstream in;
	in.open(COMBINED_LOG_FILE.c_str(), std::ios::in);
	BOOST_REQUIRE(in.is_open());

	// push events from the log file into the IE filter reactor
	boost::uint64_t events_read = 0;
	EventPtr event_ptr;
	while ((event_ptr = m_combined_codec->read(in))) {
		++events_read;
		m_reaction_engine.send(m_ie_filter_id, event_ptr);
	}
	
	// make sure that four events were read from the log
	BOOST_CHECK_EQUAL(events_read, static_cast<boost::uint64_t>(4));
	
	// make sure that the reactor received all of the events read
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsIn(m_ie_filter_id) == events_read) break;
		sleep_briefly(100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsIn(m_ie_filter_id), events_read);
	
	// make sure that the number of operations matches the events read plus 1
	// plus 1 because one event (with MSIE) is passed along to the "Do Nothing" reactor
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getTotalOperations() == events_read + 1) break;
		sleep_briefly(100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getTotalOperations(), events_read + 1);

	// make sure that only one event passed the filter
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsOut(m_ie_filter_id) == static_cast<boost::uint64_t>(1)) break;
		sleep_briefly(100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsOut(m_ie_filter_id), static_cast<boost::uint64_t>(1));
}

BOOST_AUTO_TEST_SUITE_END()
