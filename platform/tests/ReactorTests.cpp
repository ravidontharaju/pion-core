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
#include <pion/PionScheduler.hpp>
#include <pion/platform/VocabularyManager.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/ProtocolFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <boost/regex.hpp>
#include <boost/cstdint.hpp>
#include <boost/thread/thread.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/mpl/list.hpp>
#include <boost/mpl/transform.hpp>
#include <boost/mpl/lambda.hpp>
#include <fstream>
#include <string>

using namespace pion;
using namespace pion::platform;
//using namespace boost::mpl;	// Can't use either of these, because they make ...
//using boost::mpl::_1;			// ... event.hpp confused about which _1 to use.
using boost::mpl::transform1;
using boost::mpl::lambda;


/// external functions defined in PionPlatformUnitTests.cpp
extern const std::string& get_log_file_dir(void);
extern const std::string& get_config_file_dir(void);
extern const std::string& get_vocabulary_path(void);
extern const std::string& get_vocabularies_file(void);
extern void setup_logging_for_unit_tests(void);
extern void setup_plugins_directory(void);
extern void cleanup_vocab_config_files(void);
extern void cleanup_cache_files(void);


/// static strings used by these unit tests
static const std::string COMBINED_LOG_FILE(get_log_file_dir() + "combined.log");
static const std::string NEW_LOG_FILE(get_log_file_dir() + "new.log");
static const std::string NEW_DATABASE_FILE(get_log_file_dir() + "clickstream.db");
static const std::string REACTORS_TEMPLATE_FILE(get_config_file_dir() + "reactors.tmpl");
static const std::string REACTORS_CONFIG_FILE(get_config_file_dir() + "reactors.xml");
static const std::string CODECS_TEMPLATE_FILE(get_config_file_dir() + "codecs.tmpl");
static const std::string CODECS_CONFIG_FILE(get_config_file_dir() + "codecs.xml");
static const std::string DATABASES_TEMPLATE_FILE(get_config_file_dir() + "databases.tmpl");
static const std::string DATABASES_CONFIG_FILE(get_config_file_dir() + "databases.xml");


/// cleans up reactor config files in the working directory
void cleanup_reactor_config_files(void)
{
	cleanup_vocab_config_files();

	if (boost::filesystem::exists(REACTORS_CONFIG_FILE))
		boost::filesystem::remove(REACTORS_CONFIG_FILE);
	boost::filesystem::copy_file(REACTORS_TEMPLATE_FILE, REACTORS_CONFIG_FILE);

	if (boost::filesystem::exists(CODECS_CONFIG_FILE))
		boost::filesystem::remove(CODECS_CONFIG_FILE);
	boost::filesystem::copy_file(CODECS_TEMPLATE_FILE, CODECS_CONFIG_FILE);

	if (boost::filesystem::exists(DATABASES_CONFIG_FILE))
		boost::filesystem::remove(DATABASES_CONFIG_FILE);
	boost::filesystem::copy_file(DATABASES_TEMPLATE_FILE, DATABASES_CONFIG_FILE);
}


class FilterReactor         { public: static std::string name() { return "FilterReactor"; } };
class TransformReactor      { public: static std::string name() { return "TransformReactor"; } };
class LogInputReactor       { public: static std::string name() { return "LogInputReactor"; } };
class LogOutputReactor      { public: static std::string name() { return "LogOutputReactor"; } };
class DatabaseOutputReactor { public: static std::string name() { return "DatabaseOutputReactor"; } };

typedef boost::mpl::list<FilterReactor, TransformReactor, LogInputReactor, LogOutputReactor, DatabaseOutputReactor> reactor_list;

template<typename plugin_class>
class PluginPtrReadyToOpenReactor_F : public PionPluginPtr<Reactor> {
public:
	PluginPtrReadyToOpenReactor_F() {
		setup_logging_for_unit_tests();
		setup_plugins_directory();
		m_plugin_name = plugin_class::name();
	}
	~PluginPtrReadyToOpenReactor_F() {
	}

	std::string m_plugin_name;
};

// result is boost::mpl::list<PluginPtrReadyToOpenReactor_F<FilterReactor>, PluginPtrReadyToOpenReactor_F<TransformReactor>, ...>
typedef transform1< reactor_list, lambda<PluginPtrReadyToOpenReactor_F<boost::mpl::_1> >::type >::type
		PluginPtrReadyToOpenReactor_F_list;

// PluginPtrReadyToOpenReactor_S contains tests that should pass for any type of Reactor
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(PluginPtrReadyToOpenReactor_S, PluginPtrReadyToOpenReactor_F_list)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenReactor) {
	BOOST_CHECK_NO_THROW(F::open(F::m_plugin_name));
}

BOOST_AUTO_TEST_SUITE_END()


template<typename plugin_class>
class PluginPtrWithReactorLoaded_F : public PluginPtrReadyToOpenReactor_F<plugin_class> {
public:
	PluginPtrWithReactorLoaded_F() {
		this->open(this->m_plugin_name);
		m_reactor = NULL;
	}
	~PluginPtrWithReactorLoaded_F() {
		if (m_reactor) this->destroy(m_reactor);
	}

	Reactor* m_reactor;
};

typedef transform1< reactor_list, lambda<PluginPtrWithReactorLoaded_F<boost::mpl::_1> >::type >::type
		PluginPtrWithReactorLoaded_F_list;

// PluginPtrWithReactorLoaded_S contains tests that should pass for any type of Reactor
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(PluginPtrWithReactorLoaded_S, PluginPtrWithReactorLoaded_F_list)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkIsOpenReturnsTrue) {
	BOOST_CHECK(F::is_open());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetPluginNameReturnsPluginName) {
	BOOST_CHECK_EQUAL(F::getPluginName(), F::m_plugin_name);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkCreateReturnsSomething) {
	BOOST_CHECK((F::m_reactor = F::create()) != NULL);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkDestroyDoesntThrowExceptionAfterCreate) {
	F::m_reactor = F::create();
	BOOST_CHECK_NO_THROW(F::destroy(F::m_reactor));
	F::m_reactor = NULL;
}

BOOST_AUTO_TEST_SUITE_END()


/// interface class for ReactionEngine tests
class ReactionEngineTestInterface_F {
public:
	ReactionEngineTestInterface_F()
		: m_vocab_mgr(), m_codec_factory(m_vocab_mgr), m_protocol_factory(m_vocab_mgr), m_database_mgr(m_vocab_mgr),
		m_reaction_engine(m_vocab_mgr, m_codec_factory, m_protocol_factory, m_database_mgr),
		m_combined_id("3f49f2da-bfe3-11dc-8875-0016cb926e68"),
		m_ie_filter_id("153f6c40-cb78-11dc-8fa0-0019e3f89cd2"),
		m_log_reader_id("c7a9f95a-e305-11dc-98ce-0016cb926e68"),
		m_log_writer_id("a92b7278-e306-11dc-85f0-0016cb926e68"),
		m_clickstream_id("a8928460-eb0c-11dc-9b68-0019e3f89cd2"),
		m_embedded_db_id("e75d88f0-e7df-11dc-a76c-0016cb926e68")
	{
		setup_logging_for_unit_tests();
		setup_plugins_directory();		
		cleanup_reactor_config_files();
		
		m_vocab_mgr.setConfigFile(get_vocabularies_file());
		m_vocab_mgr.openConfigFile();
		m_codec_factory.setConfigFile(CODECS_CONFIG_FILE);
		m_codec_factory.openConfigFile();
		m_database_mgr.setConfigFile(DATABASES_CONFIG_FILE);
		m_database_mgr.openConfigFile();
		
		m_combined_codec = m_codec_factory.getCodec(m_combined_id);
		BOOST_CHECK(m_combined_codec);
	}
	virtual ~ReactionEngineTestInterface_F() {}
	
	
	VocabularyManager	m_vocab_mgr;
	CodecFactory		m_codec_factory;
	ProtocolFactory		m_protocol_factory;
	DatabaseManager		m_database_mgr;
	ReactionEngine		m_reaction_engine;
	const std::string	m_combined_id;
	const std::string	m_ie_filter_id;
	const std::string	m_log_reader_id;
	const std::string	m_log_writer_id;
	const std::string	m_clickstream_id;
	const std::string	m_embedded_db_id;
	CodecPtr			m_combined_codec;
};


/// fixture for some basic ReactionEngine tests
class ReactionEngineBasicTests_F
	: public ReactionEngineTestInterface_F
{
public:
	ReactionEngineBasicTests_F() {
		boost::filesystem::remove(REACTORS_CONFIG_FILE);
		m_reaction_engine.setConfigFile(REACTORS_CONFIG_FILE);
		m_reaction_engine.createConfigFile();
	}
	virtual ~ReactionEngineBasicTests_F() {}
};

BOOST_FIXTURE_TEST_SUITE(ReactionEngineBasicTests_S, ReactionEngineBasicTests_F)

BOOST_AUTO_TEST_CASE(checkAddConnectionForMissingReactor) {
	BOOST_CHECK_THROW(m_reaction_engine.addReactorConnection("bad_id", "another_bad_id"),
					  ReactionEngine::ReactorNotFoundException);
}

BOOST_AUTO_TEST_CASE(checkRemoveConnectionForMissingReactor) {
	BOOST_CHECK_THROW(m_reaction_engine.removeReactorConnection("bad_id", "another_bad_id"),
					  ReactionEngine::ReactorNotFoundException);
}

BOOST_AUTO_TEST_CASE(checkAddFilterReactorNoConfig) {
	xmlNodePtr config_ptr(ConfigManager::createPluginConfig("FilterReactor"));
	std::string reactor_id = m_reaction_engine.addReactor(config_ptr);
	xmlFreeNodeList(config_ptr);
	BOOST_CHECK(! reactor_id.empty());
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for Reactor connection tests
class ReactionEngineConnectionTests_F
	: public ReactionEngineBasicTests_F
{
public:
	ReactionEngineConnectionTests_F() {
		xmlNodePtr config_ptr(ConfigManager::createPluginConfig("FilterReactor"));

		filter_one_id = m_reaction_engine.addReactor(config_ptr);
		BOOST_REQUIRE(! filter_one_id.empty());

		filter_two_id = m_reaction_engine.addReactor(config_ptr);
		BOOST_REQUIRE(! filter_two_id.empty());

		xmlFreeNodeList(config_ptr);
	}
	virtual ~ReactionEngineConnectionTests_F() {}
	
	std::string filter_one_id;
	std::string filter_two_id;
};

BOOST_FIXTURE_TEST_SUITE(ReactionEngineConnectionTests_S, ReactionEngineConnectionTests_F)

BOOST_AUTO_TEST_CASE(checkAddThenRemoveReactorConnection) {
	m_reaction_engine.addReactorConnection(filter_one_id, filter_two_id);
	
	// check config file
	// ...
	
	m_reaction_engine.removeReactorConnection(filter_one_id, filter_two_id);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for testing reactors (with the ReactionEngine already running)
class ReactionEngineAlreadyRunningTests_F
	: public ReactionEngineTestInterface_F
{
public:
	ReactionEngineAlreadyRunningTests_F() {
		cleanup_cache_files();
		boost::filesystem::remove(NEW_LOG_FILE);
		boost::filesystem::remove(NEW_DATABASE_FILE);
		m_reaction_engine.setConfigFile(REACTORS_CONFIG_FILE);
		m_reaction_engine.openConfigFile();
	}
	virtual ~ReactionEngineAlreadyRunningTests_F() {}
};


BOOST_FIXTURE_TEST_SUITE(ReactionEngineAlreadyRunningTests_S, ReactionEngineAlreadyRunningTests_F)

BOOST_AUTO_TEST_CASE(checkSetReactorWorkspace) {
	// get the current configuration for the Reactor
	xmlNodePtr reactor_config = m_reaction_engine.getPluginConfig(m_ie_filter_id);
	BOOST_REQUIRE(reactor_config);
	
	// add a "Workspace" node
	xmlNodePtr workspace_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("Workspace"));
	xmlNodeSetContent(workspace_node,  reinterpret_cast<const xmlChar*>("Log Workspace"));
	xmlAddNextSibling(reactor_config->last, workspace_node);

	// update the Reactor's config
	BOOST_CHECK_NO_THROW(m_reaction_engine.setReactorConfig(m_ie_filter_id,
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
	BOOST_CHECK_NO_THROW(m_reaction_engine.setReactorConfig(m_ie_filter_id,
														    reactor_config->children));
	xmlFreeNodeList(reactor_config);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkNumberofIERequestsInLogFile) {
	// start the log reader reactor
	m_reaction_engine.startReactor(m_log_reader_id);
	
	// open the CLF log file
	std::ifstream in;
	in.open(COMBINED_LOG_FILE.c_str(), std::ios::in);
	BOOST_REQUIRE(in.is_open());

	// push events from the log file into the IE filter reactor
	boost::uint64_t events_read = 0;
	EventFactory event_factory;
	EventPtr event_ptr;
	event_factory.create(event_ptr, m_combined_codec->getEventType());
	while (m_combined_codec->read(in, *event_ptr)) {
		++events_read;
		m_reaction_engine.send(m_ie_filter_id, event_ptr);
		event_factory.create(event_ptr, m_combined_codec->getEventType());
	}
	
	// make sure that four events were read from the log
	BOOST_CHECK_EQUAL(events_read, static_cast<boost::uint64_t>(4));
	
	// make sure that the reactor received all of the events read
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsIn(m_ie_filter_id) == events_read) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsIn(m_ie_filter_id), events_read);
	
	// make sure that only one event passed the filter
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsOut(m_ie_filter_id) == static_cast<boost::uint64_t>(1)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsOut(m_ie_filter_id), static_cast<boost::uint64_t>(1));

	// make sure that the log input reactor has consumed all of the events
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsIn(m_log_reader_id) == static_cast<boost::uint64_t>(4)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(4));
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(4));

	// make sure that the log output reactor has written all of the events
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsIn(m_log_writer_id) == static_cast<boost::uint64_t>(4)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsIn(m_log_writer_id), static_cast<boost::uint64_t>(4));
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsOut(m_log_writer_id), static_cast<boost::uint64_t>(4));

	// make sure that the number of operations equals 13
	BOOST_CHECK_EQUAL(m_reaction_engine.getTotalOperations(), static_cast<boost::uint64_t>(13));
	
	//
	// check the contents of the new log file
	//
	
	// open up the log file
	std::ifstream log_stream;
	log_stream.open(NEW_LOG_FILE.c_str(), std::ios::in);
	BOOST_REQUIRE(log_stream.is_open());
	
	// read each line
	bool found_it = false;
	boost::regex last_event_regex(".30/Jan/2008.*10.0.141.122.*pion.*wikipedia.*200");
	const unsigned int BUF_SIZE = 1023;
	char buf[BUF_SIZE+1];
	while (log_stream.getline(buf, BUF_SIZE)) {
		// look for the last Event
		if (boost::regex_search(buf, last_event_regex)) {
			found_it = true;
			break;
		}
	}
	BOOST_CHECK(found_it);
}

BOOST_AUTO_TEST_CASE(checkDatabaseOutputReactor) {
	// open the CLF log file
	std::ifstream in;
	in.open(COMBINED_LOG_FILE.c_str(), std::ios::in);
	BOOST_REQUIRE(in.is_open());
	
	// push events from the log file into the data store reactor
	boost::uint64_t events_read = 0;
	EventFactory event_factory;
	EventPtr event_ptr;
	event_factory.create(event_ptr, m_combined_codec->getEventType());
	while (m_combined_codec->read(in, *event_ptr)) {
		++events_read;
		m_reaction_engine.send(m_clickstream_id, event_ptr);
		event_factory.create(event_ptr, m_combined_codec->getEventType());
	}
	
	// make sure that four events were read from the log
	BOOST_CHECK_EQUAL(events_read, static_cast<boost::uint64_t>(4));
	
	// make sure that the reactor received all of the events read
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsIn(m_clickstream_id) == events_read) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsIn(m_clickstream_id), events_read);
	
	//
	// check the contents of the new database
	//
	
	// first stop the data store reactor to make sure the events get flushed
	m_reaction_engine.stopReactor(m_clickstream_id);
	
	// open the database
	DatabasePtr db_ptr = m_database_mgr.getDatabase(m_embedded_db_id);
	BOOST_REQUIRE(db_ptr);
	db_ptr->open();
	BOOST_REQUIRE(db_ptr->is_open());
	
	// prepare a query
	QueryPtr query_ptr = db_ptr->addQuery("urn:query:select_all", "SELECT * FROM clickstream");
	BOOST_REQUIRE(query_ptr);
	
	// count the number of records returned
	unsigned int db_records = 0;
	while (query_ptr->run())
		++db_records;
	BOOST_CHECK_EQUAL(db_records, events_read);
}

BOOST_AUTO_TEST_SUITE_END()
