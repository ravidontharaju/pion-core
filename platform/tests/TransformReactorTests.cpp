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
static const std::string TR2_REACTORS_TEMPLATE_FILE(CONFIG_FILE_DIR + "tr2-reactors.tmpl");
static const std::string LOG_OUTPUT_FILE(LOG_FILE_DIR + "tr2.out");
static const std::string CLF_LOG_FILE(LOG_FILE_DIR + "tr2.log");
static const int NUM_CLF_RECORDS = 16;
static const std::string CLF_LOG_EXPECTED_FILE_1(LOG_FILE_DIR + "tr2-expected.out");
static const std::string CLF_LOG_EXPECTED_FILE_2(LOG_FILE_DIR + "clf-expected.out");
static const std::string STOCK_PRICE_LOG_FILE(LOG_FILE_DIR + "stocks.log");
static const int NUM_STOCK_RECORDS = 4;
static const std::string STOCK_PRICE_LOG_EXPECTED_FILE(LOG_FILE_DIR + "stocks-expected.out");

/// external functions defined in PionPlatformUnitTests.cpp
extern void cleanup_platform_config_files(void);


/// interface class for TransformReactor tests
class TransformReactorTests_F {
public:
	TransformReactorTests_F() :
		m_clf_codec_id("3f49f2da-bfe3-11dc-8875-0016cb926e68"),
		m_transformer_id("25bcc7f0-e109-11dd-aef9-001c25b8b54e"),
		m_output_log_id("18883550-e105-11dd-8c4d-001c25b8b54e")
	{
		cleanup_platform_config_files();

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
		m_platform_cfg.getReactionEngine(), m_transformer_id, *m_codec_ptr, CLF_LOG_FILE);

	// make sure that all events were read from the log
	BOOST_CHECK_EQUAL(events_read, static_cast<boost::uint64_t>(NUM_CLF_RECORDS));

	// make sure that the reactor received all of the events read
	PionPlatformUnitTest::checkReactorEventsIn(m_platform_cfg.getReactionEngine(), m_transformer_id, events_read);

	// flush all events in the transform reactor to bypass waiting for time-outs (though there are none)
	m_platform_cfg.getReactionEngine().stopReactor(m_transformer_id);

	// check number of output events for each of the log reactors
	// (make sure they have finished writing data)
	PionPlatformUnitTest::checkReactorEventsOut(m_platform_cfg.getReactionEngine(), m_output_log_id, static_cast<boost::uint64_t>(NUM_CLF_RECORDS));

	// make sure that the output files match what is expected
	BOOST_CHECK(PionUnitTest::check_files_match(LOG_OUTPUT_FILE, CLF_LOG_EXPECTED_FILE_1));
}

BOOST_AUTO_TEST_SUITE_END()


class ReactionEngineReadyToAddReactors_F {
public:
	ReactionEngineReadyToAddReactors_F() :
		m_vocab_mgr(), m_codec_factory(m_vocab_mgr), m_protocol_factory(m_vocab_mgr), m_database_mgr(m_vocab_mgr),
		m_reaction_engine(NULL)
	{
		cleanup_platform_config_files();
		
		m_vocab_mgr.setConfigFile(VOCABS_CONFIG_FILE);
		m_vocab_mgr.openConfigFile();
		m_codec_factory.setConfigFile(CODECS_CONFIG_FILE);
		m_codec_factory.openConfigFile();

		boost::filesystem::remove(LOG_OUTPUT_FILE);
		BOOST_REQUIRE(! boost::filesystem::exists(LOG_OUTPUT_FILE)); // Confirm, to avoid accidentally passing tests due to previous output.

		// Create a new (empty) reactor configuration file.
		m_reactor_config_file = CONFIG_FILE_DIR + "reactors1.xml";
		if (boost::filesystem::exists(m_reactor_config_file))
			boost::filesystem::remove(m_reactor_config_file);

		// Create and initialize a ReactionEngine.
		m_reaction_engine = new ReactionEngine(m_vocab_mgr, m_codec_factory, m_protocol_factory, m_database_mgr);
		m_reaction_engine->setConfigFile(m_reactor_config_file);
		m_reaction_engine->createConfigFile();
	}
	virtual ~ReactionEngineReadyToAddReactors_F() {
		delete m_reaction_engine;
	}

	VocabularyManager	m_vocab_mgr;
	CodecFactory		m_codec_factory;
	ProtocolFactory		m_protocol_factory;
	DatabaseManager		m_database_mgr;
	ReactionEngine*		m_reaction_engine;
	std::string			m_reactor_config_file;
};

BOOST_FIXTURE_TEST_SUITE(ReactionEngineReadyToAddReactors_S, ReactionEngineReadyToAddReactors_F)

// Tests transformations with source terms of integer type.
// Also tests a transformation where the source term isn't the same as the term being modified.
BOOST_AUTO_TEST_CASE(checkTransformCLFLogFile) {
	// Add a TransformReactor that does some transformations with source terms of integer type.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Name>Float Transformer</Name>"
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#referer</Term>"
			"<Type>Lookup</Type>"
			"<LookupTerm>urn:vocab:clickstream#status</LookupTerm>"
			"<Lookup key=\"200\">OK</Lookup>"
		"</Transformation>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#bytes</Term>"
			"<Type>Regex</Type>"
			"<SourceTerm>urn:vocab:clickstream#bytes</SourceTerm>"
			"<Regex exp=\"\\d\\d\\d\\d\\d+\">10000</Regex>"
			"<Regex exp=\"^\\d\\d\\d$\">1000</Regex>"
			"<Regex exp=\"^\\d\\d$\">100</Regex>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Add a LogOutputReactor and connect it to the TransformReactor so it has something to send output to.
	config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Name>CLF Log Writer</Name>"
		"<Plugin>LogOutputReactor</Plugin>"
		"<Codec>3f49f2da-bfe3-11dc-8875-0016cb926e68</Codec>"
		"<Filename>../" + LOG_OUTPUT_FILE + "</Filename>");
	std::string log_writer_id = m_reaction_engine->addReactor(config_ptr);
	m_reaction_engine->addReactorConnection(transformer_id, log_writer_id);

	// Start the ReactionEngine.
	m_reaction_engine->start();

	// Read in events from a CLF log file.
	CodecPtr clf_codec_ptr = m_codec_factory.getCodec("3f49f2da-bfe3-11dc-8875-0016cb926e68");
	boost::uint64_t events_read = PionPlatformUnitTest::feedFileToReactor(
		*m_reaction_engine, transformer_id, *clf_codec_ptr, CLF_LOG_FILE);

	// Make sure the LogOutputReactor has finished writing the expected number of records.
	PionPlatformUnitTest::checkReactorEventsOut(*m_reaction_engine, log_writer_id, static_cast<boost::uint64_t>(NUM_CLF_RECORDS));

	// Stop the LogOutputReactor and confirm that the log file it wrote has the expected contents.
	m_reaction_engine->stopReactor(log_writer_id);
	BOOST_CHECK(PionUnitTest::check_files_match(LOG_OUTPUT_FILE, CLF_LOG_EXPECTED_FILE_2));
}

// tests transformation of float terms
BOOST_AUTO_TEST_CASE(checkTransformStockPriceLogFile) {
	// Add a TransformReactor that does regular expression transformations on a term of type float.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Name>Float Transformer</Name>"
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:stocks#price</Term>"
			"<SourceTerm>urn:vocab:stocks#price</SourceTerm>"
			"<Regex exp=\"\\d\\d\\d\\.\">-1</Regex>"
			"<Type>Regex</Type>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Add a LogOutputReactor and connect it to the TransformReactor so it has something to send output to.
	config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Name>Stock Price Log Writer</Name>"
		"<Plugin>LogOutputReactor</Plugin>"
		"<Codec>90eb7478-1629-11dd-81cb-0019e3f89cd2</Codec>"
		"<Filename>../" + LOG_OUTPUT_FILE + "</Filename>");
	std::string log_writer_id = m_reaction_engine->addReactor(config_ptr);
	m_reaction_engine->addReactorConnection(transformer_id, log_writer_id);

	// Start the ReactionEngine.
	m_reaction_engine->start();

	// Read in events from a log of stock prices.
	CodecPtr stock_codec_ptr = m_codec_factory.getCodec("90eb7478-1629-11dd-81cb-0019e3f89cd2");
	boost::uint64_t events_read = PionPlatformUnitTest::feedFileToReactor(
		*m_reaction_engine, transformer_id, *stock_codec_ptr, STOCK_PRICE_LOG_FILE);

	// Make sure the LogOutputReactor has finished writing the expected number of records.
	PionPlatformUnitTest::checkReactorEventsOut(*m_reaction_engine, log_writer_id, static_cast<boost::uint64_t>(NUM_STOCK_RECORDS));

	// Stop the LogOutputReactor and confirm that the log file it wrote has the expected contents.
	m_reaction_engine->stopReactor(log_writer_id);
	BOOST_CHECK(PionUnitTest::check_files_match(LOG_OUTPUT_FILE, STOCK_PRICE_LOG_EXPECTED_FILE));
}

BOOST_AUTO_TEST_SUITE_END()
