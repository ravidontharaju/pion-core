// ---------------------------------------------------------------------------
// PionEnterpriseUnitTests: unit tests for Pion Enterprise Edition components
// ---------------------------------------------------------------------------
// Copyright (C) 2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// The contents of this file are PROPRIETARY and CONFIDENTIAL TRADE SECRETS
// of Atomic Labs, Inc.  DO NOT REDISTRIBUTE anything from here without the
// prior written permission of an executive manager.
//

#include <string>
#include <fstream>
#include <pion/PionConfig.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <pion/platform/Event.hpp>
#include "../server/PlatformConfig.hpp"

using namespace std;
using namespace pion;
using namespace pion::platform;


/// external functions defined in PionEnterpriseUnitTests.cpp
extern const std::string& get_config_file_dir(void);
extern const std::string& get_log_file_dir(void);
extern const std::string& get_license_file(void);
extern void setup_logging_for_unit_tests(void);
extern void setup_plugins_directory(void);
extern void remove_license_file(void);
extern void make_valid_license_file(void);
extern void make_invalid_license_file(void);
extern bool check_reactor_events_in(pion::platform::ReactionEngine& reaction_engine,
	const std::string& reactor_id, const boost::uint64_t expected);
extern bool check_reactor_events_out(pion::platform::ReactionEngine& reaction_engine,
	const std::string& reactor_id, const boost::uint64_t expected);
extern bool check_files_match(const std::string& fileA, const std::string& fileB);

/*********************
 * Refactor these into a utility class
 */

bool check_reactor_events_in(pion::platform::ReactionEngine& reaction_engine,
	const std::string& reactor_id, const boost::uint64_t expected)
{
	for (int i = 0; i < 10; ++i) {
		if (reaction_engine.getEventsIn(reactor_id) == expected) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}
	return (reaction_engine.getEventsIn(reactor_id) == expected);
}

bool check_reactor_events_out(pion::platform::ReactionEngine& reaction_engine,
	const std::string& reactor_id, const boost::uint64_t expected)
{
	for (int i = 0; i < 10; ++i) {
		if (reaction_engine.getEventsOut(reactor_id) == expected) break;
		PionScheduler::sleep(0, 100000000); // 0.1 seconds
	}
	return (reaction_engine.getEventsOut(reactor_id) == expected);
}

void skip_comment_lines(std::ifstream& fs) {
	int c;
	while (!fs.eof() && fs.peek() == '#') {
		while (! fs.eof()) {
			c = fs.get();
			if (c == '\n') {
				if (fs.peek() == '\r')
					fs.get();
				break;
			} else if (c == '\r') {
				if (fs.peek() == '\n')
					fs.get();
				break;
			}
		}
	}
}

char *trim(char *str)
{
	for (unsigned len = strlen(str) - 1; len > 0; len--)
		if (str[len] == '\n' || str[len] == '\r')
			str[len] = '\0';
		else
			break;
	return str;
}

// Check for file match, use std::list for sorting the files, which will allow
// random order matching...
bool check_files_match(const std::string& fileA, const std::string& fileB)
{
	// open files
	std::ifstream a_file(fileA.c_str(), std::ios::in | std::ios::binary);
	BOOST_REQUIRE(a_file.is_open());

	std::ifstream b_file(fileB.c_str(), std::ios::in | std::ios::binary);
	BOOST_REQUIRE(b_file.is_open());

	// skip lines that start with #
	skip_comment_lines(a_file);
	skip_comment_lines(b_file);

	// read and compare data in files
	static const unsigned int BUF_SIZE = 4096;
	char buf[BUF_SIZE];
    std::list<std::string> a_lines, b_lines;

	while (a_file.getline(buf, BUF_SIZE)) {
	    a_lines.push_back(trim(buf));
		if (! b_file.getline(buf, BUF_SIZE))
			return false;
	    b_lines.push_back(trim(buf));
	}
	if (b_file.getline(buf, BUF_SIZE))
		return false;
	if (a_file.gcount() != b_file.gcount())
		return false;
	a_lines.sort();
	b_lines.sort();

	if (a_lines != b_lines)
		return false;

	a_file.close();
	b_file.close();

	// files match
	return true;
}






/// static strings used by these unit tests
static const std::string LOG_FILE(get_log_file_dir() + "tr2.log");
static const std::string REACTORS_TEMPLATE_FILE(get_config_file_dir() + "tr2-reactors.tmpl");
static const std::string REACTORS_CONFIG_FILE(get_config_file_dir() + "reactors.xml");
static const std::string PLATFORM_CONFIG_FILE(get_config_file_dir() + "platform.xml");

static const std::string LOG_OUTPUT_FILE(get_log_file_dir() + "tr2.out");
static const std::string LOG_EXPECTED_FILE(get_log_file_dir() + "tr2-expected.out");


/// interface class for TransformReactor tests
class TransformReactorTests_F {
public:
	TransformReactorTests_F() :
		m_clf_codec_id("3f49f2da-bfe3-11dc-8875-0016cb926e68"),
		m_transformer_id("25bcc7f0-e109-11dd-aef9-001c25b8b54e"),
		m_output_log_id("18883550-e105-11dd-8c4d-001c25b8b54e")
	{
		setup_logging_for_unit_tests();
		setup_plugins_directory();

		if (boost::filesystem::exists(REACTORS_CONFIG_FILE))
			boost::filesystem::remove(REACTORS_CONFIG_FILE);

		if (boost::filesystem::exists(LOG_OUTPUT_FILE))
			boost::filesystem::remove(LOG_OUTPUT_FILE);

		boost::filesystem::copy_file(REACTORS_TEMPLATE_FILE, REACTORS_CONFIG_FILE);

		// start the ServiceManager, ReactionEngine, etc., add plugin paths
		m_platform_cfg.setConfigFile(PLATFORM_CONFIG_FILE);
		m_platform_cfg.openConfigFile();

		// get codec for CLF format
		m_codec_ptr = m_platform_cfg.getCodecFactory().getCodec(m_clf_codec_id);
	}

	virtual ~TransformReactorTests_F() {}

	boost::uint64_t processLogFile(const std::string& reactor_id, const std::string& log_file) {
		std::ifstream in(log_file.c_str(), std::ios::in);
		BOOST_REQUIRE(in.is_open());

		// push events from the log file into the TransformReactor
		boost::uint64_t events_read = 0;
		EventPtr event_ptr;
		m_event_factory.create(event_ptr, m_codec_ptr->getEventType());
		while (m_codec_ptr->read(in, *event_ptr)) {
			++events_read;
			m_platform_cfg.getReactionEngine().send(reactor_id, event_ptr);
			m_event_factory.create(event_ptr, m_codec_ptr->getEventType());
		}

		in.close();

		return events_read;
	}

	const std::string				m_clf_codec_id;
	const std::string				m_transformer_id;
	const std::string				m_output_log_id;
	EventFactory					m_event_factory;
	pion::server::PlatformConfig	m_platform_cfg;
	CodecPtr						m_codec_ptr;
};


// TransformReactor unit tests

BOOST_FIXTURE_TEST_SUITE(TransformReactorTests_S, TransformReactorTests_F)

BOOST_AUTO_TEST_CASE(checkTransformLogFile) {
	// read in events from the log file
	boost::uint64_t events_read = processLogFile(m_transformer_id, LOG_FILE);

	// make sure that all events were read from the log
	BOOST_CHECK_EQUAL(events_read, static_cast<boost::uint64_t>(16));

	// make sure that the reactor received all of the events read
	BOOST_CHECK(check_reactor_events_in(m_platform_cfg.getReactionEngine(), m_transformer_id, events_read));

	// flush all events in the transformreactor to bypass waiting for time-outs (though there are none)
	m_platform_cfg.getReactionEngine().stopReactor(m_transformer_id);

	// check number of output events for each of the log reactors
	// (make sure they have finished writing data)
	BOOST_CHECK(check_reactor_events_out(m_platform_cfg.getReactionEngine(), m_output_log_id, static_cast<boost::uint64_t>(16)));

	// make sure that the output files match what is expected
	BOOST_CHECK(check_files_match(LOG_OUTPUT_FILE, LOG_EXPECTED_FILE));

}


BOOST_AUTO_TEST_SUITE_END()
