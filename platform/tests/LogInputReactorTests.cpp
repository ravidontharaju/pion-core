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
static const std::string NEW_INPUT_LOG_FNAME("combined-new");
static const std::string REACTORS_TEMPLATE_FILE(get_config_file_dir() + "reactors.tmpl");
static const std::string REACTORS_CONFIG_FILE(get_config_file_dir() + "reactors.xml");
static const std::string CODECS_TEMPLATE_FILE(get_config_file_dir() + "codecs.tmpl");
static const std::string CODECS_CONFIG_FILE(get_config_file_dir() + "codecs.xml");


const boost::uint64_t ONE_SECOND = 1000000000; // in nsec

const boost::uint64_t NUM_LINES_IN_DEFAULT_LOG_FILE = 4;
const boost::uint64_t TOTAL_LINES_IN_ALL_CLF_LOG_FILES = 7;
const boost::uint64_t NUM_LINES_IN_LARGE_LOG_FILE = 20000;

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

// These have external linkage so they can be used as template parameters.
extern const char LogCodec_id[]  = "3f49f2da-bfe3-11dc-8875-0016cb926e68";
extern const char JSONCodec_id[] = "9446b74a-71e4-426c-b965-ae55260375af";
extern const char XMLCodec_id[]  = "f7bb0fd8-3fe0-4227-accb-aaba2440a638";
extern const char LogCodec_file_ext[]  = ".log";
extern const char JSONCodec_file_ext[] = ".json";
extern const char XMLCodec_file_ext[]  = ".xml";


/// fixture for testing LogInputReactor
template<const char* codec_id, const char* file_ext>
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
		boost::filesystem::remove(get_log_file_dir() + NEW_INPUT_LOG_FNAME + file_ext);

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
		m_input_codec_id = codec_id;

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
		inner_config_str += !name.empty()?      name :      "Log Reader";
		inner_config_str += "</Name><Codec>";
		inner_config_str += !codec.empty()?     codec :     codec_id;
		inner_config_str += "</Codec><Directory>";
		inner_config_str += !directory.empty()? directory : "../logs";
		inner_config_str += "</Directory><Filename>";
		inner_config_str += !filename.empty()?  filename :  std::string("combined.*\\") + file_ext; // e.g. combined.*\.xml
		inner_config_str += "</Filename>";

		return makeReactorConfigFromString(inner_config_str);
	}
	std::string multiFileRegex(void) {
		return std::string("comb.*\\") + file_ext; // e.g. comb.*\.xml
	}
	void setupForLargeLogFile(void) {
		std::string large_log_file = get_log_file_dir() + "large" + file_ext;
		if (! boost::filesystem::exists(large_log_file)) {
			std::ofstream out(large_log_file.c_str());
			std::string before, after;
			if (file_ext == JSONCodec_file_ext) {
				out << "[";
				before = "\n{\"bytes\": ";
				after = "}, ";
			} else if (file_ext == XMLCodec_file_ext) {
				out << "<Events>\n";
				before = "<Event><bytes>";
				after = "</bytes></Event>\n";
			} else {
				before = "- - - [] \"\" - ";
				after = " \"\" \"\"\n";
			}
			for (int i = 0; i < NUM_LINES_IN_LARGE_LOG_FILE; ++i) {
				out << before << i << after;
			}
			if (file_ext == JSONCodec_file_ext) {
				out.seekp(-2, std::ios::cur);  // Back up over final comma.
				out << "\n]\n";
			} else if (file_ext == XMLCodec_file_ext) {
				out << "</Events>\n";
			}
		}

		// Reconfigure the LogInputReactor to search for the large log file.
		xmlNodePtr config_ptr = makeLogInputReactorConfig("", "", "", std::string("large") + file_ext);
		m_reaction_engine->setReactorConfig(m_log_reader_id, config_ptr);
	}
	void waitForMinimumNumberOfEventsIn(
		const std::string& reactor_id,
		boost::uint64_t time_limit,
		boost::uint64_t min_num_events_in)
	{
		boost::uint64_t total_nsec = 0;
		boost::uint32_t num_nsec = 100000000; // 0.1 seconds
		while (total_nsec < time_limit) {
			PionScheduler::sleep(0, num_nsec);
			if (m_reaction_engine->getEventsIn(m_log_reader_id) >= min_num_events_in)
				return;
			total_nsec += num_nsec;
		}
		BOOST_FAIL("LogInputReactor was taking too long to read the required number of events from a log file.");
	}
	void makeNewLogFileByCopying(const std::string& fname_of_file_to_copy) {
		boost::filesystem::copy_file(get_log_file_dir() + fname_of_file_to_copy + file_ext,
									 get_log_file_dir() + NEW_INPUT_LOG_FNAME + file_ext);
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
	std::string			m_input_codec_id;
};

#define SKIP_WITH_WARNING_FOR_JSON_CODECS \
	if (F::m_input_codec_id == JSONCodec_id) { \
		BOOST_WARN_MESSAGE(false, "Skipping this test for JSONCodec fixture because it doesn't pass yet."); \
		return; \
	}

#define SKIP_WITH_WARNING_FOR_XML_CODECS \
	if (F::m_input_codec_id == XMLCodec_id) { \
		BOOST_WARN_MESSAGE(false, "Skipping this test for XMLCodec fixture because it doesn't pass yet."); \
		return; \
	}

typedef boost::mpl::list<RunningReactionEngineWithLogInputReactor_F<LogCodec_id, LogCodec_file_ext>,
						 RunningReactionEngineWithLogInputReactor_F<JSONCodec_id, JSONCodec_file_ext>,
						 RunningReactionEngineWithLogInputReactor_F<XMLCodec_id, XMLCodec_file_ext> > codec_fixture_list;

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(RunningReactionEngineWithLogInputReactor_S, codec_fixture_list)

/*
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(demonstrateLeak) {
	// start the log reader reactor
	m_reaction_engine->startReactor(m_log_reader_id);

	PionScheduler::sleep(0, 100000000);
}
*/

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkNumberOfEventsProcessed) {
	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Wait up to one second for the LogInputReactor to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Confirm that the LogInputReactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), NUM_LINES_IN_DEFAULT_LOG_FILE);
}

// Check that the LogInputReactor correctly handled at least one value (specifically, the referrer URL) for every input line.
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(spotCheckEvents) {
	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Wait up to one second for the LogInputReactor to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);

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

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(testEmptyLogFile) {
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

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkNumberOfEventsProcessedForMultipleLogFiles) {
	// Reconfigure the LogInputReactor to search for multiple log files.
	xmlNodePtr config_ptr = makeLogInputReactorConfig("", "", "", multiFileRegex());
	m_reaction_engine->setReactorConfig(m_log_reader_id, config_ptr);

	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Wait up to one second for the LogInputReactor to finish consuming all the log files.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, TOTAL_LINES_IN_ALL_CLF_LOG_FILES);

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), TOTAL_LINES_IN_ALL_CLF_LOG_FILES);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), TOTAL_LINES_IN_ALL_CLF_LOG_FILES);
}

// Check that the LogInputReactor correctly handled at least one value (specifically, the referrer URL) for every input line.
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(spotCheckEventsForMultipleLogFiles) {
	// Reconfigure the LogInputReactor to search for multiple log files.
	xmlNodePtr config_ptr = makeLogInputReactorConfig("", "", "", multiFileRegex());
	m_reaction_engine->setReactorConfig(m_log_reader_id, config_ptr);

	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Wait up to one second for the LogInputReactor to finish consuming all the log files.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, TOTAL_LINES_IN_ALL_CLF_LOG_FILES);

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

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConsumedFilesSkippedAfterRestart) {
	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Wait up to one second for the LogInputReactor to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Stop the ReactionEngine and create a new log file for the LogInputReactor to consume.
	m_reaction_engine->stop();
	makeNewLogFileByCopying("comb-log-2");
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

	// Wait up to one second for the expected number of input events.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, expected_events_in);

	// Confirm the expected totals of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConsumedFilesSkippedAfterEngineReloaded) {
	// Start the LogInputReactor.
	m_reaction_engine->startReactor(m_log_reader_id);

	// Wait up to one second for the LogInputReactor to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Delete the ReactionEngine.  (This is needed to enable creating a new LogInputReactor with the same ID, 
	// because IDs can only be specified in a configuration file, configuration files can only be read if 
	// they're not already open, and they can only be closed by ConfigManager::~ConfigManager().)
	delete m_reaction_engine;

	// Create a new log file for the LogInputReactor to consume.
	makeNewLogFileByCopying("comb-log-2");
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

	// Wait up to one second for the expected number of input events.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, expected_events_in);

	// Confirm the expected totals of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkPartiallyConsumedFileResumedAfterRestartingReactor) {
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

	// Wait up to 20 seconds for the LogInputReactor to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, 20 * ONE_SECOND, NUM_LINES_IN_LARGE_LOG_FILE);

	// Confirm that the LogInputReactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkPartiallyConsumedFileResumedAfterRestartingEngine) {
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

	// Wait up to 20 seconds for the LogInputReactor to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, 20 * ONE_SECOND, NUM_LINES_IN_LARGE_LOG_FILE);

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE));
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), static_cast<boost::uint64_t>(NUM_LINES_IN_LARGE_LOG_FILE));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkPartiallyConsumedFileResumedAfterEngineReloaded) {
	SKIP_WITH_WARNING_FOR_JSON_CODECS
	SKIP_WITH_WARNING_FOR_XML_CODECS

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

	// Stop the LogInputReactor and save the numbers of input events and output events.
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

	// Wait up to 20 seconds for the expected number of input events.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, 20 * ONE_SECOND, expected_events_in);

	// Confirm that the Reactor has the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkNumberOfEventsProcessedForMultipleReaders) {
	// Make another LogInputReactor.
	xmlNodePtr config_ptr = makeLogInputReactorConfig();
	std::string log_reader_id_2 = m_reaction_engine->addReactor(config_ptr);
	m_reaction_engine->addReactorConnection(log_reader_id_2, m_log_writer_id);

	// Start the LogInputReactors.
	m_reaction_engine->startReactor(m_log_reader_id);
	m_reaction_engine->startReactor(log_reader_id_2);

	// Wait up to one second for the LogInputReactors to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);
	waitForMinimumNumberOfEventsIn(log_reader_id_2, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(log_reader_id_2),  NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(log_reader_id_2), NUM_LINES_IN_DEFAULT_LOG_FILE);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkNumberOfEventsProcessedForMultipleReadersAndMultipleLogFiles) {
	// Reconfigure the LogInputReactor to search for multiple log files.
	xmlNodePtr config_ptr = makeLogInputReactorConfig("", "", "", multiFileRegex());
	m_reaction_engine->setReactorConfig(m_log_reader_id, config_ptr);

	// Make another LogInputReactor to search for multiple log files.
	std::string log_reader_id_2 = m_reaction_engine->addReactor(config_ptr);
	m_reaction_engine->addReactorConnection(log_reader_id_2, m_log_writer_id);

	// Start the LogInputReactors.
	m_reaction_engine->startReactor(m_log_reader_id);
	m_reaction_engine->startReactor(log_reader_id_2);

	// Wait up to one second for the LogInputReactors to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, TOTAL_LINES_IN_ALL_CLF_LOG_FILES);
	waitForMinimumNumberOfEventsIn(log_reader_id_2, ONE_SECOND, TOTAL_LINES_IN_ALL_CLF_LOG_FILES);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  TOTAL_LINES_IN_ALL_CLF_LOG_FILES);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), TOTAL_LINES_IN_ALL_CLF_LOG_FILES);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(log_reader_id_2),  TOTAL_LINES_IN_ALL_CLF_LOG_FILES);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(log_reader_id_2), TOTAL_LINES_IN_ALL_CLF_LOG_FILES);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConsumedFilesSkippedAfterRestartForMultipleReaders) {
	// Make another LogInputReactor.
	xmlNodePtr config_ptr = makeLogInputReactorConfig();
	std::string log_reader_id_2 = m_reaction_engine->addReactor(config_ptr);

	// Start the LogInputReactors.
	m_reaction_engine->startReactor(m_log_reader_id);
	m_reaction_engine->startReactor(log_reader_id_2);

	// Wait up to one second for the LogInputReactors to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);
	waitForMinimumNumberOfEventsIn(log_reader_id_2, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(log_reader_id_2),  NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(log_reader_id_2), NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Stop the ReactionEngine and create a new log file for the LogInputReactors to consume.
	m_reaction_engine->stop();
	makeNewLogFileByCopying("comb-log-2");
	const int num_lines_in_new_input_log_file = 2;

	// Restart the ReactionEngine, check and save the number of input and output events, and restart the LogInputReactors.
	m_reaction_engine->start();
	boost::uint64_t events_in_at_start = m_reaction_engine->getEventsIn(m_log_reader_id);
	boost::uint64_t events_out_at_start = m_reaction_engine->getEventsOut(m_log_reader_id);
	BOOST_CHECK_EQUAL(events_in_at_start, NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(events_out_at_start, NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(log_reader_id_2), events_in_at_start);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(log_reader_id_2), events_out_at_start);
	m_reaction_engine->startReactor(m_log_reader_id);
	m_reaction_engine->startReactor(log_reader_id_2);

	// Compute the expected totals of input events and output events.  After being restarted, the LogInputReactors 
	// should consume only the events from the new file, thus the totals should only increase by 2.
	boost::uint64_t expected_events_in  = events_in_at_start  + num_lines_in_new_input_log_file;
	boost::uint64_t expected_events_out = events_out_at_start + num_lines_in_new_input_log_file;

	// Wait up to one second for the expected number of input events.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, expected_events_in);
	waitForMinimumNumberOfEventsIn(log_reader_id_2, ONE_SECOND, expected_events_in);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(log_reader_id_2),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(log_reader_id_2), expected_events_out);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConsumedFilesSkippedAfterEngineReloadedForMultipleReaders) {
	// Make another LogInputReactor.
	xmlNodePtr config_ptr = makeLogInputReactorConfig();
	std::string log_reader_id_2 = m_reaction_engine->addReactor(config_ptr);

	// Start the LogInputReactors.
	m_reaction_engine->startReactor(m_log_reader_id);
	m_reaction_engine->startReactor(log_reader_id_2);

	// Wait up to one second for the LogInputReactors to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);
	waitForMinimumNumberOfEventsIn(log_reader_id_2, ONE_SECOND, NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(log_reader_id_2),  NUM_LINES_IN_DEFAULT_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(log_reader_id_2), NUM_LINES_IN_DEFAULT_LOG_FILE);

	// Delete the ReactionEngine.  (This is needed to enable creating a new LogInputReactor with the same ID, 
	// because IDs can only be specified in a configuration file, configuration files can only be read if 
	// they're not already open, and they can only be closed by ConfigManager::~ConfigManager().)
	delete m_reaction_engine;

	// Create a new log file for the LogInputReactor to consume.
	makeNewLogFileByCopying("comb-log-2");
	const int num_lines_in_new_input_log_file = 2;

	// Create a new ReactionEngine, using the config file created in the constructor.
	m_reaction_engine = new ReactionEngine(m_vocab_mgr, m_codec_factory, m_protocol_factory, m_database_mgr);
	m_reaction_engine->setConfigFile(m_reactor_config_file);
	m_reaction_engine->openConfigFile();

	// Start the LogInputReactors.  (The ReactionEngine and LogOutputReactor were started by openConfigFile().)
	m_reaction_engine->startReactor(m_log_reader_id);
	m_reaction_engine->startReactor(log_reader_id_2);

	// The LogInputReactors should consume only the events from the new file.
	boost::uint64_t expected_events_in  = num_lines_in_new_input_log_file;
	boost::uint64_t expected_events_out = num_lines_in_new_input_log_file;

	// Wait up to one second for the expected number of input events.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, ONE_SECOND, expected_events_in);
	waitForMinimumNumberOfEventsIn(log_reader_id_2, ONE_SECOND, expected_events_in);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(log_reader_id_2),  expected_events_in);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(log_reader_id_2), expected_events_out);
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for testing file position caching with multiple LogInputReactors
class TwoRunningLogInputReactorsReadingLargeFile_F : public RunningReactionEngineWithLogInputReactor_F<LogCodec_id, LogCodec_file_ext> {
public:
	TwoRunningLogInputReactorsReadingLargeFile_F() {
		setupForLargeLogFile();

		// Make another LogInputReactor with the same configuration as the first, so it will also read the large log file.
		// (Note that this Reactor will have no output connection, since it's not actually needed for the test,
		// but one could be added for debugging purposes if desired.)
		xmlNodePtr config_ptr_2 = m_reaction_engine->getPluginConfig(m_log_reader_id)->children;
		m_log_reader_id_2 = m_reaction_engine->addReactor(config_ptr_2);

		// Start the LogInputReactors.
		m_reaction_engine->startReactor(m_log_reader_id);
		m_reaction_engine->startReactor(m_log_reader_id_2);

		// Calibrate.
		m_num_nsec = 10000000; // 0.01 seconds (Start small, since we need to run as many as 15 intervals before either Reactor finishes the file.)
		PionScheduler::sleep(0, m_num_nsec);
		while (m_reaction_engine->getEventsIn(m_log_reader_id) < NUM_LINES_IN_LARGE_LOG_FILE / 100) { // i.e. less than 1% read
			m_num_nsec *= 2;
			if (m_num_nsec >= 1000000000) { // 1 second
				BOOST_FAIL("LogInputReactor was taking too long to start reading a log file.");
			}
			PionScheduler::sleep(0, m_num_nsec);
		}
		m_num_nsec /= 2;

		// The second LogInputReactor should have read something by now.
		BOOST_CHECK(m_reaction_engine->getEventsIn(m_log_reader_id_2) != 0);
	}
	virtual ~TwoRunningLogInputReactorsReadingLargeFile_F() {
	}

	boost::uint32_t m_num_nsec;
	std::string m_log_reader_id_2;
};

BOOST_FIXTURE_TEST_SUITE(TwoRunningLogInputReactorsReadingLargeFile_S, TwoRunningLogInputReactorsReadingLargeFile_F)

BOOST_AUTO_TEST_CASE(checkPartiallyConsumedFileResumedAfterRestartingReactors) {
	// Stop and restart both LogInputReactors 5 times.
	for (int i = 0; i < 5; ++i) {
		PionScheduler::sleep(0, m_num_nsec); // both Reactors running
		m_reaction_engine->stopReactor(m_log_reader_id);
		BOOST_CHECK(m_reaction_engine->getEventsIn(m_log_reader_id) != NUM_LINES_IN_LARGE_LOG_FILE);
		PionScheduler::sleep(0, m_num_nsec); // second Reactor only running
		m_reaction_engine->stopReactor(m_log_reader_id_2);
		BOOST_CHECK(m_reaction_engine->getEventsIn(m_log_reader_id_2) != NUM_LINES_IN_LARGE_LOG_FILE);
		m_reaction_engine->startReactor(m_log_reader_id);
		PionScheduler::sleep(0, m_num_nsec); // first Reactor only running
		m_reaction_engine->startReactor(m_log_reader_id_2);
	}

	// Wait up to 20 seconds for the LogInputReactors to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, 20 * ONE_SECOND, NUM_LINES_IN_LARGE_LOG_FILE);
	waitForMinimumNumberOfEventsIn(m_log_reader_id_2, 20 * ONE_SECOND, NUM_LINES_IN_LARGE_LOG_FILE);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  NUM_LINES_IN_LARGE_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), NUM_LINES_IN_LARGE_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id_2),  NUM_LINES_IN_LARGE_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id_2), NUM_LINES_IN_LARGE_LOG_FILE);
}

BOOST_AUTO_TEST_CASE(checkPartiallyConsumedFileResumedAfterRestartingEngine) {
	// Stop and restart the ReactorEngine 10 times.
	for (int i = 0; i < 10; ++i) {
		PionScheduler::sleep(0, m_num_nsec);

		// If the LogInputReactor is not stopped first, bad assertion exceptions are often thrown in LogOutputReactor::operator().
		m_reaction_engine->stopReactor(m_log_reader_id);

		m_reaction_engine->stop();
		BOOST_CHECK(m_reaction_engine->getEventsIn(m_log_reader_id) != NUM_LINES_IN_LARGE_LOG_FILE);
		BOOST_CHECK(m_reaction_engine->getEventsIn(m_log_reader_id_2) != NUM_LINES_IN_LARGE_LOG_FILE);
		m_reaction_engine->start();
		m_reaction_engine->startReactor(m_log_writer_id);
		m_reaction_engine->startReactor(m_log_reader_id);
		m_reaction_engine->startReactor(m_log_reader_id_2);
	}

	// Wait up to 20 seconds for the LogInputReactors to finish consuming the log file.
	waitForMinimumNumberOfEventsIn(m_log_reader_id, 20 * ONE_SECOND, NUM_LINES_IN_LARGE_LOG_FILE);
	waitForMinimumNumberOfEventsIn(m_log_reader_id_2, 20 * ONE_SECOND, NUM_LINES_IN_LARGE_LOG_FILE);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  NUM_LINES_IN_LARGE_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), NUM_LINES_IN_LARGE_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id_2),  NUM_LINES_IN_LARGE_LOG_FILE);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id_2), NUM_LINES_IN_LARGE_LOG_FILE);
}

BOOST_AUTO_TEST_CASE(checkPartiallyConsumedFileResumedAfterEngineReloaded) {
	// Stop the LogInputReactors and save the numbers of input events and output events.
	m_reaction_engine->stopReactor(m_log_reader_id);
	m_reaction_engine->stopReactor(m_log_reader_id_2);
	boost::uint64_t events_in_before_delete_1  = m_reaction_engine->getEventsIn(m_log_reader_id);
	boost::uint64_t events_out_before_delete_1 = m_reaction_engine->getEventsOut(m_log_reader_id);
	boost::uint64_t events_in_before_delete_2  = m_reaction_engine->getEventsIn(m_log_reader_id_2);
	boost::uint64_t events_out_before_delete_2 = m_reaction_engine->getEventsOut(m_log_reader_id_2);

	// Delete the ReactionEngine.  (This is needed to enable creating new LogInputReactors with the same IDs, 
	// because IDs can only be specified in a configuration file, configuration files can only be read if 
	// they're not already open, and they can only be closed by ConfigManager::~ConfigManager().)
	delete m_reaction_engine;

	// Create a new ReactionEngine, using the config file created in the constructor.
	m_reaction_engine = new ReactionEngine(m_vocab_mgr, m_codec_factory, m_protocol_factory, m_database_mgr);
	m_reaction_engine->setConfigFile(m_reactor_config_file);
	m_reaction_engine->openConfigFile();

	// Start the LogInputReactors.  (The ReactionEngine and LogOutputReactor were started by openConfigFile().)
	m_reaction_engine->startReactor(m_log_reader_id);
	m_reaction_engine->startReactor(m_log_reader_id_2);

	// Compute the expected numbers of input events and output events (which should be
	// the number of lines in the log file that haven't yet been read).
	boost::uint64_t expected_events_in_1  = NUM_LINES_IN_LARGE_LOG_FILE - events_in_before_delete_1;
	boost::uint64_t expected_events_out_1 = NUM_LINES_IN_LARGE_LOG_FILE - events_out_before_delete_1;
	boost::uint64_t expected_events_in_2  = NUM_LINES_IN_LARGE_LOG_FILE - events_in_before_delete_2;
	boost::uint64_t expected_events_out_2 = NUM_LINES_IN_LARGE_LOG_FILE - events_out_before_delete_2;

	// Wait up to 20 seconds for the expected number of input events.
	waitForMinimumNumberOfEventsIn(m_log_reader_id,   20 * ONE_SECOND, expected_events_in_1);
	waitForMinimumNumberOfEventsIn(m_log_reader_id_2, 20 * ONE_SECOND, expected_events_in_2);

	// Confirm that both LogInputReactors have the expected number of input events and output events.
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id),  expected_events_in_1);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id), expected_events_out_1);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsIn(m_log_reader_id_2),  expected_events_in_2);
	BOOST_CHECK_EQUAL(m_reaction_engine->getEventsOut(m_log_reader_id_2), expected_events_out_2);
}

BOOST_AUTO_TEST_SUITE_END()
