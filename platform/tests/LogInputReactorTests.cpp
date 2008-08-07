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
#include <pion/PionScheduler.hpp>
#include <pion/platform/VocabularyManager.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/ProtocolFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <boost/regex.hpp>
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
extern void cleanup_cache_files(void);


/// static strings used by these unit tests
static const std::string NEW_OUTPUT_LOG_FILE(get_log_file_dir() + "new.log");
static const std::string NEW_INPUT_LOG_FILE(get_log_file_dir() + "combined.new");
static const std::string REACTORS_TEMPLATE_FILE(get_config_file_dir() + "reactors.tmpl");
static const std::string REACTORS_CONFIG_FILE(get_config_file_dir() + "reactors.xml");
static const std::string CODECS_TEMPLATE_FILE(get_config_file_dir() + "codecs.tmpl");
static const std::string CODECS_CONFIG_FILE(get_config_file_dir() + "codecs.xml");


const int NUM_LINES_IN_DEFAULT_LOG_FILE = 4;
const int TOTAL_LINES_IN_ALL_CLF_LOG_FILES = 7;
const int NUM_LINES_IN_LARGE_LOG_FILE = 20000;

static const std::string expected_urls[] = {
	// from combined.log
	"http://www.example.com/start.html",
	"http://www.atomiclabs.com/",
	"http://www.google.com/",
	"http://www.wikipedia.com/",

	// from comb-log-2.log
	"http://www.example.com/index.html",
	"http://www.amazon.com/",

	// from comb-log-3.log
	"http://xkcd.com/327"
};

static const unsigned int BUF_SIZE = 1023;


/// fixture for testing LogInputReactor
class RunningReactionEngineWithLogInputReactor_F {
public:
	RunningReactionEngineWithLogInputReactor_F() :
		m_vocab_mgr(), m_codec_factory(m_vocab_mgr), m_protocol_factory(m_vocab_mgr), m_database_mgr(m_vocab_mgr),
		m_reaction_engine(NULL)
	 {
		setup_logging_for_unit_tests();
		setup_plugins_directory();		
		cleanup_config_files();
		cleanup_cache_files();
		
		m_vocab_mgr.setConfigFile(get_vocabularies_file());
		m_vocab_mgr.openConfigFile();
		m_codec_factory.setConfigFile(CODECS_CONFIG_FILE);
		m_codec_factory.openConfigFile();

		boost::filesystem::remove(NEW_OUTPUT_LOG_FILE);
		boost::filesystem::remove(NEW_INPUT_LOG_FILE);

		// Create a new (empty) reactor configuration file.
		m_reactor_config_file = get_config_file_dir() + "reactors1.xml";
		if (boost::filesystem::exists(m_reactor_config_file))
			boost::filesystem::remove(m_reactor_config_file);

		// Create and initialize a ReactionEngine.
		m_reaction_engine = new ReactionEngine(m_vocab_mgr, m_codec_factory, m_protocol_factory, m_database_mgr);
		m_reaction_engine->setConfigFile(m_reactor_config_file);
		m_reaction_engine->createConfigFile();

		// Add a LogInputReactor, since that's what we're testing here.
		xmlNodePtr config_ptr = makeLogInputReactorConfig();
		m_log_reader_id = m_reaction_engine->addReactor(config_ptr);

		// Add a LogOutputReactor and connect it to the LogInputReactor so it has something to send output to.
		config_ptr = makeReactorConfigFromString(
			"<Name>DLF Log Writer</Name>"
			"<Plugin>LogOutputReactor</Plugin>"
			"<Codec>3f49f2da-bfe3-11dc-8875-0016cb926e68</Codec>"
			"<Filename>../logs/new.log</Filename>");
		m_log_writer_id = m_reaction_engine->addReactor(config_ptr);
		m_reaction_engine->addReactorConnection(m_log_reader_id, m_log_writer_id);

		// Start the ReactionEngine.  (This starts the log writer, but not the log reader.)
		m_reaction_engine->start();
	}
	virtual ~RunningReactionEngineWithLogInputReactor_F() {
		delete m_reaction_engine;
	}
	
	/// cleans up config files in the working directory
	void cleanup_config_files(void) {
		cleanup_vocab_config_files();

		if (boost::filesystem::exists(REACTORS_CONFIG_FILE))
			boost::filesystem::remove(REACTORS_CONFIG_FILE);
		boost::filesystem::copy_file(REACTORS_TEMPLATE_FILE, REACTORS_CONFIG_FILE);

		if (boost::filesystem::exists(CODECS_CONFIG_FILE))
			boost::filesystem::remove(CODECS_CONFIG_FILE);
		boost::filesystem::copy_file(CODECS_TEMPLATE_FILE, CODECS_CONFIG_FILE);
	}

	// From a string representation of a Reactor configuration, obtain an xmlNodePtr that
	// points to a list of all the child nodes needed by Reactor::setConfig().
	xmlNodePtr makeReactorConfigFromString(const std::string& inner_config_str) {
		std::string config_str = std::string("<PionConfig><Reactor>") + inner_config_str + "</Reactor></PionConfig>";
		xmlNodePtr config_ptr = ConfigManager::createResourceConfig("Reactor", config_str.c_str(), config_str.size());
		BOOST_REQUIRE(config_ptr);
		return config_ptr;
	}

	// Make a LogInputReactor configuration, using defaults for unspecified values.
	xmlNodePtr makeLogInputReactorConfig(const std::string& name = "",
										 const std::string& codec = "",
										 const std::string& directory = "",
										 const std::string& filename = "")
	{
		std::string inner_config_str = "<Plugin>LogInputReactor</Plugin><Name>";
		inner_config_str += !name.empty()?      name :      "DLF Log Reader";
		inner_config_str += "</Name><Codec>";
		inner_config_str += !codec.empty()?     codec :     "3f49f2da-bfe3-11dc-8875-0016cb926e68";
		inner_config_str += "</Codec><Directory>";
		inner_config_str += !directory.empty()? directory : "../logs";
		inner_config_str += "</Directory><Filename>";
		inner_config_str += !filename.empty()?  filename :  "combined\\..*";
		inner_config_str += "</Filename>";

		return makeReactorConfigFromString(inner_config_str);
	}
	void setupForLargeLogFile(void) {
		if (! boost::filesystem::exists("logs/large.log")) {
			std::ofstream large_log_file("logs/large.log");
			for (int i = 0; i < NUM_LINES_IN_LARGE_LOG_FILE; ++i) {
				large_log_file << "- - - [] \"\" - " << i << " \"\" \"\"" << std::endl;
			}
		}

		// Reconfigure the LogInputReactor to search for the large log file.
		xmlNodePtr config_ptr = makeLogInputReactorConfig("", "", "", "large.*");
		m_reaction_engine->setReactorConfig(m_log_reader_id, config_ptr);
	}

	VocabularyManager	m_vocab_mgr;
	CodecFactory		m_codec_factory;
	ProtocolFactory		m_protocol_factory;
	DatabaseManager		m_database_mgr;
	ReactionEngine*		m_reaction_engine;
	std::string			m_reactor_config_file;
	std::string			m_log_reader_id;
	std::string			m_log_writer_id;
	char				m_buf[BUF_SIZE + 1];
};


BOOST_FIXTURE_TEST_SUITE(RunningReactionEngineWithLogInputReactor_S, RunningReactionEngineWithLogInputReactor_F)

/*
BOOST_AUTO_TEST_CASE(demonstrateLeak) {
	// start the log reader reactor
	m_reaction_engine->startReactor(m_log_reader_id);

	PionScheduler::sleep(0, 100000000);
}
*/

BOOST_AUTO_TEST_CASE(checkNumberOfEventsProcessed) {
	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Make sure that the LogInputReactor has consumed all of the events.
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine->getEventsIn(m_log_reader_id) == static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE));
}

// Check that the LogInputReactor correctly handled at least one value (specifically, the referrer URL) for every input line.
BOOST_AUTO_TEST_CASE(spotCheckEvents) {
	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Make sure that the LogInputReactor has consumed all of the events.
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine->getEventsIn(m_log_reader_id) == static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}

	// Confirm that the new log file has some expected values in it.
	m_reaction_engine->stopReactor(m_log_writer_id);
	std::ifstream log_stream(NEW_OUTPUT_LOG_FILE.c_str());
	BOOST_REQUIRE(log_stream.is_open());
	for (int i = 0; i < NUM_LINES_IN_DEFAULT_LOG_FILE; ++i) {
		log_stream.getline(m_buf, BUF_SIZE);
		BOOST_CHECK(boost::regex_search(m_buf, boost::regex(expected_urls[i].c_str())));
	}
	BOOST_CHECK(! log_stream.getline(m_buf, BUF_SIZE));
}

BOOST_AUTO_TEST_CASE(testEmptyLogFile) {
	// Reconfigure the LogInputReactor to search for the empty log file.
	xmlNodePtr config_ptr = makeLogInputReactorConfig("", "", "", "comb-log-empty.*");
	m_reaction_engine->setReactorConfig(m_log_reader_id, config_ptr);

	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Give the LogInputReactor time to consume any phantom events it might erroneously find.
	PionScheduler::sleep(0, 1000000000); // 1 second

	// Confirm that the number of input events and output events is zero.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(0));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(0));

	// Stop the OutputLogReactor.  If, as expected, it's empty, it will be deleted.
	m_reaction_engine->stopReactor(m_log_writer_id);

	// Confirm that the output log file is not present.
	BOOST_CHECK(!boost::filesystem::exists(NEW_OUTPUT_LOG_FILE));
}

BOOST_AUTO_TEST_CASE(checkNumberOfEventsProcessedForMultipleLogFiles) {
	// Reconfigure the LogInputReactor to search for multiple log files.
	xmlNodePtr config_ptr = makeLogInputReactorConfig("", "", "", "comb.*");
	m_reaction_engine->setReactorConfig(m_log_reader_id, config_ptr);

	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Make sure that the LogInputReactor has consumed all of the events.
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine->getEventsIn(m_log_reader_id) == static_cast<boost::uint64_t>(TOTAL_LINES_IN_ALL_CLF_LOG_FILES)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(TOTAL_LINES_IN_ALL_CLF_LOG_FILES));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(TOTAL_LINES_IN_ALL_CLF_LOG_FILES));
}

// Check that the LogInputReactor correctly handled at least one value (specifically, the referrer URL) for every input line.
BOOST_AUTO_TEST_CASE(spotCheckEventsForMultipleLogFiles) {
	// Reconfigure the LogInputReactor to search for multiple log files.
	xmlNodePtr config_ptr = makeLogInputReactorConfig("", "", "", "comb.*");
	m_reaction_engine->setReactorConfig(m_log_reader_id, config_ptr);

	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Make sure that the LogInputReactor has consumed all of the events.
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine->getEventsIn(m_log_reader_id) == static_cast<boost::uint64_t>(TOTAL_LINES_IN_ALL_CLF_LOG_FILES)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}

	// Stop the LogOutputReactor and extract all the URLs from the output log.
	m_reaction_engine->stopReactor(m_log_writer_id);
	std::ifstream log_stream(NEW_OUTPUT_LOG_FILE.c_str());
	BOOST_REQUIRE(log_stream.is_open());
	std::list<const std::string> read_urls_list;
	for (int i = 0; i < TOTAL_LINES_IN_ALL_CLF_LOG_FILES; ++i) {
		log_stream.getline(m_buf, BUF_SIZE);

		// Extract the URL and add it to the list.
		boost::regex expected_line(".*\"(http://[^\"]*)\".*");
		boost::cmatch match_results;
		BOOST_CHECK(boost::regex_match(m_buf, match_results, expected_line));
		read_urls_list.push_back(match_results[1].str());
	}
	BOOST_CHECK(! log_stream.getline(m_buf, BUF_SIZE));

	// Confirm that the extracted URLs are the expected URLs (possibly reordered).
	std::list<const std::string> expected_urls_list(expected_urls, expected_urls + TOTAL_LINES_IN_ALL_CLF_LOG_FILES);
	expected_urls_list.sort();
	read_urls_list.sort();
	BOOST_CHECK(expected_urls_list == read_urls_list);
}

BOOST_AUTO_TEST_CASE(checkConsumedFilesSkippedAfterRestart) {
	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Make sure that the LogInputReactor has consumed all available events.
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine->getEventsIn(m_log_reader_id) == static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE));

	// Stop the ReactionEngine and create a new log file for the LogInputReactor to consume.
	m_reaction_engine->stop();
	boost::filesystem::copy_file("logs/comb-log-2.log", NEW_INPUT_LOG_FILE);
	const int num_lines_in_new_input_log_file = 2;

	// Restart the ReactionEngine and the LogInputReactor.
	m_reaction_engine->start();
	boost::uint64_t events_in_at_start = m_reaction_engine->getEventsIn(m_log_reader_id);
	boost::uint64_t events_out_at_start = m_reaction_engine->getEventsOut(m_log_reader_id);
	m_reaction_engine->startReactor(m_log_reader_id);

	// Compute the expected totals of input events and output events.  After being restarted, the Reactor 
	// should consume only the events from the new file, thus the totals should only increase by 2.
	boost::uint64_t expected_events_in  = events_in_at_start  + num_lines_in_new_input_log_file;
	boost::uint64_t expected_events_out = events_out_at_start + num_lines_in_new_input_log_file;

	// Make sure that the LogInputReactor has consumed all available events.
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine->getEventsIn(m_log_reader_id) == expected_events_in) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}

	// Confirm the expected totals of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out);
}

BOOST_AUTO_TEST_CASE(checkConsumedFilesSkippedAfterEngineReloaded) {
	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Make sure that the LogInputReactor has consumed all available events.
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine->getEventsIn(m_log_reader_id) == static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE)) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_DEFAULT_LOG_FILE));

	// Delete the ReactionEngine.  (This is needed to enable creating a new LogInputReactor with the same ID, 
	// because IDs can only be specified in a configuration file, configuration files can only be read if 
	// they're not already open, and they can only be closed by ConfigManager::~ConfigManager().)
	delete m_reaction_engine;

	// Create a new log file for the LogInputReactor to consume.
	boost::filesystem::copy_file("logs/comb-log-2.log", NEW_INPUT_LOG_FILE);
	const int num_lines_in_new_input_log_file = 2;

	// Create a new ReactionEngine, using the config file created in the constructor.
	m_reaction_engine = new ReactionEngine(m_vocab_mgr, m_codec_factory, m_protocol_factory, m_database_mgr);
	m_reaction_engine->setConfigFile(m_reactor_config_file);
	m_reaction_engine->openConfigFile();

	// Start the LogInputReactor.  (The ReactionEngine and LogOutputReactor were started by openConfigFile().)
	m_reaction_engine->startReactor(m_log_reader_id);

	// The LogInputReactor should consume only the events from the new file.
	boost::uint64_t expected_events_in  = num_lines_in_new_input_log_file;
	boost::uint64_t expected_events_out = num_lines_in_new_input_log_file;

	// Make sure that the LogInputReactor has consumed all available events.
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine->getEventsIn(m_log_reader_id) == expected_events_in) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}

	// Confirm the expected totals of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out);
}

BOOST_AUTO_TEST_CASE(checkPartiallyConsumedFileResumedAfterRestartingReactor) {
	setupForLargeLogFile();

	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Calibrate.
	boost::uint32_t num_nsec = 10000000; // 0.01 seconds (Start small, since we need to run 10 intervals before finishing the file.)
	PionScheduler::sleep(0, num_nsec);
	while (m_reaction_engine->getEventsIn(m_log_reader_id) < NUM_LINES_IN_LARGE_LOG_FILE / 100) { // i.e. less than 1% read
		num_nsec *= 2;
		if (num_nsec >= 1000000000) { // 1 second
			BOOST_FAIL("LogInputReactor was taking too long to start reading a log file.");
		}
		PionScheduler::sleep(0, num_nsec);
	}

	// Stop and restart the LogInputReactor 10 times.
	boost::uint64_t prev_num_events_in = 0;
	for (int i = 0; i < 10; ++i) {
		PionScheduler::sleep(0, num_nsec);
		m_reaction_engine->stopReactor(m_log_reader_id);
		boost::uint64_t num_events_in = m_reaction_engine->getEventsIn(m_log_reader_id);
		BOOST_CHECK(num_events_in > prev_num_events_in); // i.e. at least one event was read
		prev_num_events_in = num_events_in;
		m_reaction_engine->startReactor(m_log_reader_id);
	}

	// Let the LogInputReactor consume the rest of the log file.
	const boost::uint64_t MAX_NSEC = 20000000000; // 20 seconds
	boost::uint64_t total_nsec = 0;
	while (total_nsec < MAX_NSEC) {
		PionScheduler::sleep(0, num_nsec);
		if (m_reaction_engine->getEventsIn(m_log_reader_id) >= static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE)) break;
		total_nsec += num_nsec;
	}
	if (total_nsec >= MAX_NSEC) {
		BOOST_FAIL("LogInputReactor was taking too long to read a log file.");
	}

	// Confirm that the LogInputReactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE));
}

BOOST_AUTO_TEST_CASE(checkPartiallyConsumedFileResumedAfterRestartingEngine) {
	setupForLargeLogFile();

	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Calibrate.
	boost::uint32_t num_nsec = 10000000; // 0.01 seconds (Start small, since we need to run 10 intervals before finishing the file.)
	PionScheduler::sleep(0, num_nsec);
	while (m_reaction_engine->getEventsIn(m_log_reader_id) < NUM_LINES_IN_LARGE_LOG_FILE / 100) { // i.e. less than 1% read
		num_nsec *= 2;
		if (num_nsec >= 1000000000) { // 1 second
			BOOST_FAIL("LogInputReactor was taking too long to start reading a log file.");
		}
		PionScheduler::sleep(0, num_nsec);
	}

	// Stop and restart the ReactorEngine 10 times.
	boost::uint64_t prev_num_events_in = 0;
	for (int i = 0; i < 10; ++i) {
		PionScheduler::sleep(0, num_nsec);

		// If the LogInputReactor is not stopped first, bad assertion exceptions are often thrown in LogOutputReactor::operator().
		m_reaction_engine->stopReactor(m_log_reader_id);

		m_reaction_engine->stop();
		boost::uint64_t num_events_in = m_reaction_engine->getEventsIn(m_log_reader_id);
		BOOST_CHECK(num_events_in > prev_num_events_in); // i.e. at least one event was read
		prev_num_events_in = num_events_in;
		m_reaction_engine->start();
		m_reaction_engine->startReactor(m_log_writer_id);
		m_reaction_engine->startReactor(m_log_reader_id);
	}

	// Let the LogInputReactor consume the rest of the log file.
	const boost::uint64_t MAX_NSEC = 20000000000; // 20 seconds
	boost::uint64_t total_nsec = 0;
	while (total_nsec < MAX_NSEC) {
		PionScheduler::sleep(0, num_nsec);
		if (m_reaction_engine->getEventsIn(m_log_reader_id) >= static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE)) break;
		total_nsec += num_nsec;
	}
	if (total_nsec >= MAX_NSEC) {
		BOOST_FAIL("LogInputReactor was taking too long to read a log file.");
	}

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE));
}

BOOST_AUTO_TEST_CASE(checkPartiallyConsumedFileResumedAfterEngineReloaded) {
	setupForLargeLogFile();

	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Run until at least a few events have been read.
	boost::uint32_t num_nsec = 10000000; // 0.01 seconds
	PionScheduler::sleep(0, num_nsec);
	while (m_reaction_engine->getEventsIn(m_log_reader_id) < 10) {
		num_nsec *= 2;
		if (num_nsec >= 1000000000) { // 1 second
			BOOST_FAIL("LogInputReactor was taking too long to start reading a log file.");
		}
		PionScheduler::sleep(0, num_nsec);
	}

	// Save the number of events read.
	m_reaction_engine->stopReactor(m_log_reader_id);
	boost::uint64_t events_in_before_delete = m_reaction_engine->getEventsIn(m_log_reader_id);
	boost::uint64_t events_out_before_delete = m_reaction_engine->getEventsOut(m_log_reader_id);

	// Delete the ReactionEngine.  (This is needed to enable creating a new LogInputReactor with the same ID, 
	// because IDs can only be specified in a configuration file, configuration files can only be read if 
	// they're not already open, and they can only be closed by ConfigManager::~ConfigManager().)
	delete m_reaction_engine;

	// Create a new ReactionEngine, using the config file created in the constructor.
	m_reaction_engine = new ReactionEngine(m_vocab_mgr, m_codec_factory, m_protocol_factory, m_database_mgr);
	m_reaction_engine->setConfigFile(m_reactor_config_file);
	m_reaction_engine->openConfigFile();

	// Start the LogInputReactor.  (The ReactionEngine and LogOutputReactor were started by openConfigFile().)
	m_reaction_engine->startReactor(m_log_reader_id);

	// Compute the expected numbers of input events and output events (which should be
	// the number of lines in the log file that haven't yet been read).
	boost::uint64_t expected_events_in  = NUM_LINES_IN_LARGE_LOG_FILE - events_in_before_delete;
	boost::uint64_t expected_events_out = NUM_LINES_IN_LARGE_LOG_FILE - events_out_before_delete;

	// Let the LogInputReactor consume the rest of the log file.
	const boost::uint64_t MAX_NSEC = 20000000000; // 20 seconds
	boost::uint64_t total_nsec = 0;
	while (total_nsec < MAX_NSEC) {
		PionScheduler::sleep(0, num_nsec);
		if (m_reaction_engine->getEventsIn(m_log_reader_id) >= static_cast<boost::uint64_t>(expected_events_in)) break;
		total_nsec += num_nsec;
	}
	if (total_nsec >= MAX_NSEC) {
		BOOST_FAIL("LogInputReactor was taking too long to read a log file.");
	}

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out);
}

BOOST_AUTO_TEST_SUITE_END()
