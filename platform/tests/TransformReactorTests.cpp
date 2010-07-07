// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2010 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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


class TransformReactorEventValidator_F : public ReactionEngineReadyToAddReactors_F {
public:
	TransformReactorEventValidator_F() {
		m_num_events_validated = 0;
		m_page_event_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clickstream#page-event");
		m_sc_content_term_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clickstream#sc-content");
	}

	typedef std::map<Vocabulary::TermRef, std::string> ExpectedTerms;

	void MockEventHandler(EventPtr& e, const ExpectedTerms& expected_terms) {
		if (m_num_events_validated > 0)
			return;

		BOOST_REQUIRE(! e->empty());
		for (ExpectedTerms::const_iterator i = expected_terms.begin(); i != expected_terms.end(); ++i)
			BOOST_CHECK_EQUAL(e->getString(i->first), i->second);

		++m_num_events_validated;
	}

	void sendEventAndValidateOutput(EventPtr e, const std::string& transformer_id) {
		// Add an Event handler to check that the output of the TransformReactor is as expected.
		Reactor::EventHandler eventValidator = boost::bind(&TransformReactorEventValidator_F::MockEventHandler, this, _1, m_expected_terms);
		m_reaction_engine->addTempConnectionOut(transformer_id, PionId().to_string(), "blah", eventValidator);

		// Start the ReactionEngine and send the input Event to the TransformReactor.
		m_reaction_engine->start();
		m_reaction_engine->send(transformer_id, e);

		// Check that the TransformReactor output an Event and that the Event was validated.
		PionPlatformUnitTest::checkReactorEventsOut(*m_reaction_engine, transformer_id, 1);
		BOOST_CHECK_EQUAL(m_num_events_validated, 1);
	}

	EventFactory		m_event_factory;
	int					m_num_events_validated;
	Vocabulary::TermRef	m_page_event_ref;
	Vocabulary::TermRef	m_sc_content_term_ref;
	ExpectedTerms		m_expected_terms;
};

BOOST_FIXTURE_TEST_SUITE(TransformReactorEventValidator_S, TransformReactorEventValidator_F)

BOOST_AUTO_TEST_CASE(checkBasicRegex) {
	// Add a TransformReactor that does a regular expression transformation.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<SourceTerm>urn:vocab:clickstream#sc-content</SourceTerm>"
			"<Regex exp=\"x=(\\S+)\">$1</Regex>"
			"<Type>Regex</Type>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	e->setString(m_sc_content_term_ref, "some content x=hello blah blah");
	m_expected_terms[m_sc_content_term_ref] = "hello";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_CASE(checkRulesTransformation) {
	// Add a TransformReactor that does a Rule based Transformation.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<Type>Rules</Type>"
			"<StopOnFirstMatch>true</StopOnFirstMatch>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#sc-content</Term>"
				"<Type>exact-match</Type>"
				"<Value>hello</Value>"
				"<SetValue>Rule 1: content is hello</SetValue>"
			"</Rule>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#sc-content</Term>"
				"<Type>starts-with</Type>"
				"<Value>hello</Value>"
				"<SetValue>Rule 2: content starts with hello</SetValue>"
			"</Rule>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#sc-content</Term>"
				"<Type>contains</Type>"
				"<Value>hello</Value>"
				"<SetValue>Rule 3: content contains hello</SetValue>"
			"</Rule>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	e->setString(m_sc_content_term_ref, "hello, world");
	m_expected_terms[m_sc_content_term_ref] = "Rule 2: content starts with hello";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_CASE(checkRulesTransformationWithUndefinedTerm) {
	// Add a TransformReactor that does a Rule based Transformation with Rules based on two different Terms.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<Type>Rules</Type>"
			"<StopOnFirstMatch>true</StopOnFirstMatch>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#visitor-id</Term>"
				"<Type>starts-with</Type>"
				"<Value>hello</Value>"
				"<SetValue>Rule 1: visitor-id Term starts with hello</SetValue>"
			"</Rule>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#sc-content</Term>"
				"<Type>starts-with</Type>"
				"<Value>hello</Value>"
				"<SetValue>Rule 2: sc-content Term starts with hello</SetValue>"
			"</Rule>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event with the visitor-id Term undefined and the sc-content Term set to a value 
	// such that the second Rule should match.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	e->setString(m_sc_content_term_ref, "hello, world");
	m_expected_terms[m_sc_content_term_ref] = "Rule 2: sc-content Term starts with hello";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_CASE(checkRuleTypeIsDefined) {
	// Add a TransformReactor that does Rule based Transformations of type is-defined.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<Type>Rules</Type>"
			"<StopOnFirstMatch>true</StopOnFirstMatch>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#visitor-id</Term>"
				"<Type>is-defined</Type>"
				"<SetValue>Rule 1: visitor-id Term is defined</SetValue>"
			"</Rule>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#sc-content</Term>"
				"<Type>is-defined</Type>"
				"<SetValue>Rule 2: sc-content Term is defined</SetValue>"
			"</Rule>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	e->setString(m_sc_content_term_ref, "hello, world");

	m_expected_terms[m_sc_content_term_ref] = "Rule 2: sc-content Term is defined";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_CASE(checkRuleTypeIsNotDefined) {
	// Add a TransformReactor that does a Rule based Transformation of type is-not-defined.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<Type>Rules</Type>"
			"<StopOnFirstMatch>true</StopOnFirstMatch>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#sc-content</Term>"
				"<Type>is-not-defined</Type>"
				"<SetValue>Rule 1: sc-content Term is not defined</SetValue>"
			"</Rule>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#visitor-id</Term>"
				"<Type>is-not-defined</Type>"
				"<SetValue>Rule 2: visitor-id Term is not defined</SetValue>"
			"</Rule>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	e->setString(m_sc_content_term_ref, "hello, world");

	m_expected_terms[m_sc_content_term_ref] = "Rule 2: visitor-id Term is not defined";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_CASE(checkRuleTypeIsDefinedWithEventType) {
	// Add a TransformReactor that does a Rule based Transformation of type is-defined where the
	// Term, urn:vocab:clickstream#page-event, is the same as the type of the Event.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<Type>Rules</Type>"
			"<StopOnFirstMatch>true</StopOnFirstMatch>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#page-event</Term>"
				"<Type>is-defined</Type>"
				"<SetValue>Rule 1: page-event Term is defined</SetValue>"
			"</Rule>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#sc-content</Term>"
				"<Type>starts-with</Type>"
				"<Value>hello</Value>"
				"<SetValue>Rule 2: content starts with hello</SetValue>"
			"</Rule>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	e->setString(m_sc_content_term_ref, "hello, world");

	m_expected_terms[m_sc_content_term_ref] = "Rule 1: page-event Term is defined";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_CASE(checkRuleTypeIsNotDefinedWithEventType) {
	// Add a TransformReactor that does a Rule based Transformation of type is-not-defined where the
	// Term, urn:vocab:clickstream#page-event, is the same as the type of the Event.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<Type>Rules</Type>"
			"<StopOnFirstMatch>true</StopOnFirstMatch>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#page-event</Term>"
				"<Type>is-not-defined</Type>"
				"<SetValue>Rule 1: page-event Term is not defined</SetValue>"
			"</Rule>"
			"<Rule>"
				"<Term>urn:vocab:clickstream#sc-content</Term>"
				"<Type>starts-with</Type>"
				"<Value>hello</Value>"
				"<SetValue>Rule 2: content starts with hello</SetValue>"
			"</Rule>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	e->setString(m_sc_content_term_ref, "hello, world");

	m_expected_terms[m_sc_content_term_ref] = "Rule 2: content starts with hello";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_CASE(checkUtf8RegexUsingHexadecimalEscapeCodes) {
	// Add a TransformReactor that does a regular expression transformation that includes a non-US-ASCII character.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<SourceTerm>urn:vocab:clickstream#sc-content</SourceTerm>"
			"<Regex exp=\"\xCE\xB1=(\\S+)\">$1</Regex>"
			"<Type>Regex</Type>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	char UTF8_ENCODED_TEST_CHAR_ARRAY[] = {
		(char)0xCE, (char)0xB1,				// UTF-8 encoding of U+03B1 (GREEK SMALL LETTER ALPHA)
		0x3D,								// '='
		0x31,								// '1'
		0x20,								// space
		(char)0xCE, (char)0xB2,				// UTF-8 encoding of U+03B2 (GREEK SMALL LETTER BETA)
		0x3D,								// '='
		0x32};								// '2'
	const std::string UTF8_ENCODED_TEST_STRING(UTF8_ENCODED_TEST_CHAR_ARRAY, sizeof(UTF8_ENCODED_TEST_CHAR_ARRAY));
	e->setString(m_sc_content_term_ref, UTF8_ENCODED_TEST_STRING);
	m_expected_terms[m_sc_content_term_ref] = "1";

	sendEventAndValidateOutput(e, transformer_id);
}

// This test is the same as checkUtf8RegexUsingHexadecimalEscapeCodes, except that the non-US-ASCII
// character 'alpha' appears directly in the regular expression.  (This may not be apparent if you are
// not viewing this test code with UTF-8 encoding, but note that reactors.xml is always UTF-8 encoded.)
BOOST_AUTO_TEST_CASE(checkUtf8RegexUsingEmbeddedUtf8) {
	// Add a TransformReactor that does a regular expression transformation that includes a non-US-ASCII character.
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>urn:vocab:clickstream#sc-content</Term>"
			"<SourceTerm>urn:vocab:clickstream#sc-content</SourceTerm>"
			"<Regex exp=\"α=(\\S+)\">$1</Regex>"
			"<Type>Regex</Type>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);

	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	char UTF8_ENCODED_TEST_CHAR_ARRAY[] = {
		(char)0xCE, (char)0xB1,				// UTF-8 encoding of U+03B1 (GREEK SMALL LETTER ALPHA)
		0x3D,								// '='
		0x31,								// '1'
		0x20,								// space
		(char)0xCE, (char)0xB2,				// UTF-8 encoding of U+03B2 (GREEK SMALL LETTER BETA)
		0x3D,								// '='
		0x32};								// '2'
	const std::string UTF8_ENCODED_TEST_STRING(UTF8_ENCODED_TEST_CHAR_ARRAY, sizeof(UTF8_ENCODED_TEST_CHAR_ARRAY));
	e->setString(m_sc_content_term_ref, UTF8_ENCODED_TEST_STRING);
	m_expected_terms[m_sc_content_term_ref] = "1";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_CASE(checkCaseInsensitiveUtf8Regex) {
	// Add a TransformReactor that does case insensitive regular expression transformations using non-US-ASCII characters.

	// A couple of arbitrary Terms of string type.
	std::string string_term_1 = "urn:vocab:atom#icon";
	std::string string_term_2 = "urn:vocab:atom#logo";
	Vocabulary::TermRef	string_term_1_ref = m_vocab_mgr.getVocabulary().findTerm(string_term_1);
	Vocabulary::TermRef	string_term_2_ref = m_vocab_mgr.getVocabulary().findTerm(string_term_2);

	// TODO: Put this in a config file (tr-reactor-i18n.xml?) for testing regex rules with non-US-ASCII characters.
	// Note that the first line of our config files is always: <?xml version="1.0" encoding="UTF-8"?>
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<Plugin>TransformReactor</Plugin>"
		"<Transformation>"
			"<Term>" + string_term_1 + "</Term>"
			"<SourceTerm>urn:vocab:clickstream#sc-content</SourceTerm>"
			"<Regex exp=\"(?i)Äiti\">found it with uppercase</Regex>"
			"<Type>Regex</Type>"
		"</Transformation>"
		"<Transformation>"
			"<Term>" + string_term_2 + "</Term>"
			"<SourceTerm>urn:vocab:clickstream#sc-content</SourceTerm>"
			"<Regex exp=\"(?i)äiti\">found it with lowercase</Regex>"
			"<Type>Regex</Type>"
		"</Transformation>");
	std::string transformer_id = m_reaction_engine->addReactor(config_ptr);


	// Create an input Event and specify expected Term value(s) in the corresponding output Event.
	EventPtr e(m_event_factory.create(m_page_event_ref));
	//char utf8_content[] = {
	//	(char)0xC3, (char)0x84,	// UTF-8 encoding of U+00C4 (LATIN CAPITAL LETTER A WITH DIAERESIS)
	//	0x69,					// 'i'
	//	0x74,					// 't'
	//	0x69,					// 'i'
	//	0x00 };
	char utf8_content[] = "Äiti was here";
	e->setString(m_sc_content_term_ref, utf8_content);
	m_expected_terms[string_term_1_ref] = "found it with uppercase";
	m_expected_terms[string_term_2_ref] = "found it with lowercase";

	sendEventAndValidateOutput(e, transformer_id);
}

BOOST_AUTO_TEST_SUITE_END()
