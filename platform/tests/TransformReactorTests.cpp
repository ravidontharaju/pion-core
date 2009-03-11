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
#include <pion/platform/PionPlatformUnitTest.hpp>
#include <pion/platform/Event.hpp>
#include "../server/PlatformConfig.hpp"

using namespace std;
using namespace pion;
using namespace pion::platform;


/// static strings used by these unit tests
static const std::string LOG_FILE(LOG_FILE_DIR + "tr2.log");
static const std::string TR2_REACTORS_TEMPLATE_FILE(CONFIG_FILE_DIR + "tr2-reactors.tmpl");

static const std::string LOG_OUTPUT_FILE(LOG_FILE_DIR + "tr2.out");
static const std::string LOG_EXPECTED_FILE(LOG_FILE_DIR + "tr2-expected.out");


/// interface class for TransformReactor tests
class TransformReactorTests_F {
public:
	TransformReactorTests_F() :
		m_clf_codec_id("3f49f2da-bfe3-11dc-8875-0016cb926e68"),
		m_transformer_id("25bcc7f0-e109-11dd-aef9-001c25b8b54e"),
		m_output_log_id("18883550-e105-11dd-8c4d-001c25b8b54e")
	{
		if (boost::filesystem::exists(REACTORS_CONFIG_FILE))
			boost::filesystem::remove(REACTORS_CONFIG_FILE);

		if (boost::filesystem::exists(LOG_OUTPUT_FILE))
			boost::filesystem::remove(LOG_OUTPUT_FILE);

		boost::filesystem::copy_file(TR2_REACTORS_TEMPLATE_FILE, REACTORS_CONFIG_FILE);

		// start the ServiceManager, ReactionEngine, etc., add plugin paths
		m_platform_cfg.setConfigFile(PLATFORM_CONFIG_FILE);
		m_platform_cfg.openConfigFile();

		// get codec for CLF format
		m_codec_ptr = m_platform_cfg.getCodecFactory().getCodec(m_clf_codec_id);
	}

	virtual ~TransformReactorTests_F() {}


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
	boost::uint64_t events_read = PionPlatformUnitTest::feedFileToReactor(
		m_platform_cfg.getReactionEngine(), m_transformer_id, *m_codec_ptr, LOG_FILE);

	// make sure that all events were read from the log
	BOOST_CHECK_EQUAL(events_read, static_cast<boost::uint64_t>(16));

	// make sure that the reactor received all of the events read
	PionPlatformUnitTest::checkReactorEventsIn(m_platform_cfg.getReactionEngine(), m_transformer_id, events_read);

	// flush all events in the transformreactor to bypass waiting for time-outs (though there are none)
	m_platform_cfg.getReactionEngine().stopReactor(m_transformer_id);

	// check number of output events for each of the log reactors
	// (make sure they have finished writing data)
	PionPlatformUnitTest::checkReactorEventsOut(m_platform_cfg.getReactionEngine(), m_output_log_id, static_cast<boost::uint64_t>(16));

	// make sure that the output files match what is expected
	BOOST_CHECK(PionUnitTest::check_files_match(LOG_OUTPUT_FILE, LOG_EXPECTED_FILE));

}


BOOST_AUTO_TEST_SUITE_END()
