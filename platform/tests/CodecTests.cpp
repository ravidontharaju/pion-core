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
#include <pion/platform/Codec.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/mpl/list.hpp>
#include <boost/bind.hpp>
#include <libxml/tree.h>
#include <fstream>

using namespace pion;
using namespace pion::platform;

#if defined(_MSC_VER)
	#if defined(_DEBUG) && defined(PION_FULL)
		static const std::string PATH_TO_PLUGINS("../../bin/Debug_DLL_full");
	#elif defined(_DEBUG) && !defined(PION_FULL)
		static const std::string PATH_TO_PLUGINS("../../bin/Debug_DLL");
	#elif defined(NDEBUG) && defined(PION_FULL)
		static const std::string PATH_TO_PLUGINS("../../bin/Release_DLL_full");
	#elif defined(NDEBUG) && !defined(PION_FULL)
		static const std::string PATH_TO_PLUGINS("../../bin/Release_DLL");
	#endif
	static const std::string TESTS_CONFIG_FILE_DIR("");
#elif defined(PION_XCODE)
	static const std::string PATH_TO_PLUGINS(".");
	static const std::string TESTS_CONFIG_FILE_DIR("../../platform/tests/");
#else
	// same for Unix and Cygwin
	static const std::string PATH_TO_PLUGINS("../codecs/.libs");
	static const std::string TESTS_CONFIG_FILE_DIR("");
#endif


static const std::string CODECS_CONFIG_FILE(TESTS_CONFIG_FILE_DIR + "codecs.xml");
static const std::string CODECS_BACKUP_FILE(TESTS_CONFIG_FILE_DIR + "codecs.xml.bak");
static const std::string VOCAB_CLF_CONFIG_FILE(TESTS_CONFIG_FILE_DIR + "vocab_clf.xml");
static const std::string CODECS_CLF_CONFIG_FILE(TESTS_CONFIG_FILE_DIR + "codecs_clf.xml");
static const std::string COMMON_LOG_FILE(TESTS_CONFIG_FILE_DIR + "common.log");
static const std::string COMBINED_LOG_FILE(TESTS_CONFIG_FILE_DIR + "combined.log");
static const std::string EXTENDED_LOG_FILE(TESTS_CONFIG_FILE_DIR + "extended.log");

/// sets up logging (run once only)
extern void setup_logging_for_unit_tests(void);

/// cleans up vocabulary config files in the working directory
void cleanup_codec_config_files(void)
{
	if (boost::filesystem::exists(CODECS_CONFIG_FILE))
		boost::filesystem::remove(CODECS_CONFIG_FILE);
	if (boost::filesystem::exists(CODECS_BACKUP_FILE))
		boost::filesystem::remove(CODECS_BACKUP_FILE);
}


class PluginPtrReadyToAddCodec_F : public PionPluginPtr<Codec> {
public:
	PluginPtrReadyToAddCodec_F() { 
		setup_logging_for_unit_tests();
		cleanup_codec_config_files();
		PionPlugin::resetPluginDirectories();
		PionPlugin::addPluginDirectory(PATH_TO_PLUGINS);
	}
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(PluginPtrReadyToAddCodec_S, 
									   boost::mpl::list<PluginPtrReadyToAddCodec_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenLogCodec) {
	BOOST_CHECK_NO_THROW(F::open("LogCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenJSONCodec) {
	BOOST_CHECK_NO_THROW(F::open("JSONCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenXMLCodec) {
	BOOST_CHECK_NO_THROW(F::open("XMLCodec"));
}

BOOST_AUTO_TEST_SUITE_END()


template<const char* plugin_name>
class PluginPtrWithCodecLoaded_F : public PluginPtrReadyToAddCodec_F {
public:
	PluginPtrWithCodecLoaded_F() {
		m_plugin_name = plugin_name;
		open(m_plugin_name);
		m_codec = NULL;
	}
	~PluginPtrWithCodecLoaded_F() {
		if (m_codec) destroy(m_codec);
	}

	Codec* m_codec;	
	std::string m_plugin_name;
};

// These have external linkage so they can be used as template parameters.
extern const char LogCodec_name[]  = "LogCodec";
extern const char JSONCodec_name[] = "JSONCodec";
extern const char XMLCodec_name[]  = "XMLCodec";

typedef boost::mpl::list<PluginPtrWithCodecLoaded_F<LogCodec_name>,
						 PluginPtrWithCodecLoaded_F<JSONCodec_name>,
						 PluginPtrWithCodecLoaded_F<XMLCodec_name> > codec_fixture_list;

// PluginPtrWithCodecLoaded_S contains tests that should pass for any codec
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(PluginPtrWithCodecLoaded_S, codec_fixture_list)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkIsOpenReturnsTrue) {
	BOOST_CHECK(F::is_open());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetPluginNameReturnsPluginName) {
	BOOST_CHECK_EQUAL(F::getPluginName(), F::m_plugin_name);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkCreateReturnsSomething) {
	BOOST_CHECK((F::m_codec = F::create()) != NULL);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkDestroyDoesntThrowExceptionAfterCreate) {
	F::m_codec = F::create();
	BOOST_CHECK_NO_THROW(F::destroy(F::m_codec));
	F::m_codec = NULL;
}

BOOST_AUTO_TEST_SUITE_END()


BOOST_AUTO_TEST_CASE(checkCodecFactoryConstructor) {
	VocabularyManager vocab_mgr;
	BOOST_CHECK_NO_THROW(CodecFactory codecFactory(vocab_mgr));
}


class NewCodecFactory_F : public CodecFactory {
public:
	NewCodecFactory_F() : CodecFactory(m_vocab_mgr) 
	{
		setup_logging_for_unit_tests();
		cleanup_codec_config_files();
		
		if (! m_config_loaded) {
			PionPlugin::resetPluginDirectories();
			PionPlugin::addPluginDirectory(PATH_TO_PLUGINS);
			// load the CLF vocabulary
			m_vocab_mgr.loadConfigFile(VOCAB_CLF_CONFIG_FILE);
			m_config_loaded = true;
		}

		m_codec_id = "some_ID";

		// create a new codec configuration file
		setConfigFile(CODECS_CONFIG_FILE);
		createConfigFile();
		
		// check new codec config file
		// ...
	}
	~NewCodecFactory_F() {
	}

	//TODO: rig things up so we can check that m_num_times_mock_called has some expected value
	void MockCallback(void) {
		m_num_times_mock_called++;
	}

	std::string m_codec_id;
	static VocabularyManager m_vocab_mgr;
	static int m_num_times_mock_called;
	static bool m_config_loaded;
};

VocabularyManager	NewCodecFactory_F::m_vocab_mgr;
int					NewCodecFactory_F::m_num_times_mock_called = 0;
bool				NewCodecFactory_F::m_config_loaded = false;


BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(NewCodecFactory_S, 
									   boost::mpl::list<NewCodecFactory_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadLogCodec) {
	BOOST_CHECK_NO_THROW(F::addPlugin("LogCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadJSONCodec) {
	BOOST_CHECK_NO_THROW(F::addPlugin("JSONCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadXMLCodec) {
	BOOST_CHECK_NO_THROW(F::addPlugin("XMLCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadMultipleCodecs) {
	BOOST_CHECK_NO_THROW(F::addPlugin("LogCodec"));
	BOOST_CHECK_NO_THROW(F::addPlugin("JSONCodec"));
	BOOST_CHECK_NO_THROW(F::addPlugin("XMLCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadUnknownCodec) {
	BOOST_CHECK_THROW(F::addPlugin("UnknownCodec"), PionPlugin::PluginNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecConfigForMissingCodec) {
	BOOST_CHECK_THROW(F::setPluginConfig(F::m_codec_id, NULL), PluginManager<Codec>::PluginNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveCodec) {
	BOOST_CHECK_THROW(F::removePlugin(F::m_codec_id),PluginManager<Codec>::PluginNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetCodec) {
	BOOST_CHECK_THROW(F::getCodec(F::m_codec_id), CodecFactory::CodecNotFoundException);
}

// TODO: write some tests that check that the callback actually gets called when it should
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRegisterForUpdates) {
	BOOST_CHECK_NO_THROW(F::registerForUpdates(boost::bind(&NewCodecFactory_F::MockCallback, this)));
}

// TODO: write some tests that check that updateVocabulary() actually does something
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUpdateVocabulary) {
	BOOST_CHECK_NO_THROW(F::updateVocabulary());
}

BOOST_AUTO_TEST_SUITE_END()


template<const char* plugin_name>
class CodecFactoryWithCodecLoaded_F : public NewCodecFactory_F {
public:
	CodecFactoryWithCodecLoaded_F() {
		m_plugin_name = plugin_name;
		m_codec_id = addPlugin(m_plugin_name);
	}
	
	std::string m_plugin_name;
};

typedef boost::mpl::list<CodecFactoryWithCodecLoaded_F<LogCodec_name>,
						 CodecFactoryWithCodecLoaded_F<JSONCodec_name>,
						 CodecFactoryWithCodecLoaded_F<XMLCodec_name> > codec_fixture_list_2;

// CodecFactoryWithCodecLoaded_S contains tests that should pass for any codec
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithCodecLoaded_S, codec_fixture_list_2)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetCodec) {
	BOOST_CHECK(F::getCodec(F::m_codec_id));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveCodec) {
	BOOST_CHECK_NO_THROW(F::removePlugin(F::m_codec_id));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecConfigMissingEventType) {
	BOOST_CHECK_THROW(F::setPluginConfig(F::m_codec_id, NULL), Codec::EmptyEventException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecConfigUnknownEventType) {
	xmlNodePtr event_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("event"));
	xmlNodeSetContent(event_node,  reinterpret_cast<const xmlChar*>("NotATerm"));

	BOOST_CHECK_THROW(F::setPluginConfig(F::m_codec_id, event_node), Codec::UnknownTermException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecConfigEventTypeNotAnObject) {
	xmlNodePtr event_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("event"));
	xmlNodeSetContent(event_node,  reinterpret_cast<const xmlChar*>("urn:vocab:clf#remotehost"));
	
	BOOST_CHECK_THROW(F::setPluginConfig(F::m_codec_id, event_node), Codec::NotAnObjectException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetNewCodecConfiguration) {
	xmlNodePtr comment_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("comment"));
	xmlNodeSetContent(comment_node,  reinterpret_cast<const xmlChar*>("A new comment"));
	xmlNodePtr event_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("event"));
	xmlNodeSetContent(event_node,  reinterpret_cast<const xmlChar*>("urn:vocab:clf#http-request"));
	xmlAddNextSibling(comment_node, event_node);

	BOOST_CHECK_NO_THROW(F::setPluginConfig(F::m_codec_id, comment_node));
	xmlFreeNodeList(comment_node);
	
	// check codec config file
	// ...
}

// TODO: is there a way to get the plugin name from the factory?
//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetPluginNameReturnsPluginName) {
//	BOOST_CHECK_EQUAL(F::getPluginName(F::m_codec_id), F::m_plugin_name);
//}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithLogCodecLoaded_S contains tests that are specific to LogCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithLogCodecLoaded_S, boost::mpl::list<CodecFactoryWithCodecLoaded_F<LogCodec_name> >)

//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecConfigX) {
//	...
//	BOOST_CHECK_NO_THROW(F::setPluginConfig(F::m_codec_id, log_codec_options));
//	...
//}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithJSONCodecLoaded_S contains tests that are specific to JSONCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithJSONCodecLoaded_S, boost::mpl::list<CodecFactoryWithCodecLoaded_F<JSONCodec_name> >)

//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecConfigX) {
//	...
//	BOOST_CHECK_NO_THROW(F::setPluginConfig(F::m_codec_id, json_codec_options));
//	...
//}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithXMLCodecLoaded_S contains tests that are specific to XMLCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithXMLCodecLoaded_S, boost::mpl::list<CodecFactoryWithCodecLoaded_F<XMLCodec_name> >)

//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecConfigX) {
//	...
//	BOOST_CHECK_NO_THROW(F::setPluginConfig(F::m_codec_id, xml_codec_options));
//	...
//}

BOOST_AUTO_TEST_SUITE_END()


class CodecFactoryWithMultipleCodecsLoaded_F : public NewCodecFactory_F {
public:
	CodecFactoryWithMultipleCodecsLoaded_F() {
		m_LogCodec_id = addPlugin(LogCodec_name);
		m_JSONCodec_id = addPlugin(JSONCodec_name);
		m_XMLCodec_id = addPlugin(XMLCodec_name);
	}
	
	std::string m_LogCodec_id;
	std::string m_JSONCodec_id;
	std::string m_XMLCodec_id;
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithMultipleCodecsLoaded_S, 
									   boost::mpl::list<CodecFactoryWithMultipleCodecsLoaded_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetCodec) {
	BOOST_CHECK(F::getCodec(F::m_LogCodec_id));
	BOOST_CHECK(F::getCodec(F::m_JSONCodec_id));
	BOOST_CHECK(F::getCodec(F::m_XMLCodec_id));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveCodec) {
	BOOST_CHECK_NO_THROW(F::removePlugin(F::m_LogCodec_id));
	BOOST_CHECK_NO_THROW(F::removePlugin(F::m_JSONCodec_id));
	BOOST_CHECK_NO_THROW(F::removePlugin(F::m_XMLCodec_id));
}

// TODO: check that all the codecs got their vocabulary updated
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUpdateVocabulary) {
	BOOST_CHECK_NO_THROW(F::updateVocabulary());
}

BOOST_AUTO_TEST_SUITE_END()


template<const char* plugin_name>
class CodecFactoryWithCodecPtr_F : public CodecFactoryWithCodecLoaded_F<plugin_name> {
public:
	CodecFactoryWithCodecPtr_F() {
		BOOST_REQUIRE(m_codec_ptr = this->getCodec(this->m_codec_id));
	}

	CodecPtr m_codec_ptr;
};

typedef boost::mpl::list<CodecFactoryWithCodecPtr_F<LogCodec_name>,
						 CodecFactoryWithCodecPtr_F<JSONCodec_name>,
						 CodecFactoryWithCodecPtr_F<XMLCodec_name> > codec_fixture_list_3;

// CodecFactoryWithCodecPtr_S contains tests that should pass for any codec
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithCodecPtr_S, codec_fixture_list_3)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetOption) {
	//BOOST_CHECK_THROW(F::m_codec_ptr->setOption("NotAnOption", "value1"), Codec::UnknownOptionException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkClone) {
	BOOST_CHECK(F::m_codec_ptr->clone());

	// just one simple check of 'cloneness' for now
	BOOST_CHECK(F::m_codec_ptr->clone()->getContentType() == F::m_codec_ptr->getContentType());
}

// TODO: is there a way to get the plugin name?
//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetPluginNameReturnsPluginName) {
//	BOOST_CHECK_EQUAL(F::m_codec_ptr->getPluginName(), F::m_plugin_name);
//}

// TODO: write some tests that check that updateVocabulary() actually does something
BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUpdateVocabulary) {
	Vocabulary v;
	BOOST_CHECK_NO_THROW(F::m_codec_ptr->updateVocabulary(v));
}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithLogCodecPtr_S contains tests that are specific to LogCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithLogCodecPtr_S, boost::mpl::list<CodecFactoryWithCodecPtr_F<LogCodec_name> >)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetContentType) {
	BOOST_CHECK_EQUAL(F::m_codec_ptr->getContentType(), "text/ascii");
}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithJSONCodecPtr_S contains tests that are specific to JSONCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithJSONCodecPtr_S, boost::mpl::list<CodecFactoryWithCodecPtr_F<JSONCodec_name> >)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetContentType) {
	BOOST_CHECK_EQUAL(F::m_codec_ptr->getContentType(), "text/json");
}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithXMLCodecPtr_S contains tests that are specific to XMLCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithXMLCodecPtr_S, boost::mpl::list<CodecFactoryWithCodecPtr_F<XMLCodec_name> >)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetContentType) {
	BOOST_CHECK_EQUAL(F::m_codec_ptr->getContentType(), "text/xml");
}

BOOST_AUTO_TEST_SUITE_END()


class CodecFactoryLogFormatTests_F : public CodecFactory {
public:
	CodecFactoryLogFormatTests_F()
		: CodecFactory(m_vocab_mgr),
		m_common_id("urn:uuid:a174c3b0-bfcd-11dc-9db2-0016cb926e68"),
		m_combined_id("urn:uuid:3f49f2da-bfe3-11dc-8875-0016cb926e68"),
		m_extended_id("urn:uuid:23f68d5a-bfec-11dc-81a7-0016cb926e68")
	{
		setup_logging_for_unit_tests();
		cleanup_codec_config_files();

		if (! m_config_loaded) {
			PionPlugin::resetPluginDirectories();
			PionPlugin::addPluginDirectory(PATH_TO_PLUGINS);
			// load the CLF vocabulary
			m_vocab_mgr.loadConfigFile(VOCAB_CLF_CONFIG_FILE);
			m_config_loaded = true;
		}
		
		setConfigFile(CODECS_CLF_CONFIG_FILE);
		openConfigFile();
		
		m_common_codec = getCodec(m_common_id);
		BOOST_CHECK(m_common_codec);
		m_combined_codec = getCodec(m_combined_id);
		BOOST_CHECK(m_combined_codec);
		m_extended_codec = getCodec(m_extended_id);
		BOOST_CHECK(m_extended_codec);
		
		m_remotehost_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#remotehost");
		m_rfc931_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#rfc931");
		m_authuser_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#authuser");
		m_date_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#date");
		m_request_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#request");
		m_status_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#status");
		m_bytes_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#bytes");
		m_referer_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#referer");
		m_useragent_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#useragent");
	}
	~CodecFactoryLogFormatTests_F() {}
	
	const std::string	m_common_id;
	const std::string	m_combined_id;
	const std::string	m_extended_id;
	CodecPtr			m_common_codec;
	CodecPtr			m_combined_codec;
	CodecPtr			m_extended_codec;
	Vocabulary::TermRef	m_remotehost_ref;
	Vocabulary::TermRef	m_rfc931_ref;
	Vocabulary::TermRef	m_authuser_ref;
	Vocabulary::TermRef	m_date_ref;
	Vocabulary::TermRef	m_request_ref;
	Vocabulary::TermRef	m_status_ref;
	Vocabulary::TermRef	m_bytes_ref;
	Vocabulary::TermRef	m_referer_ref;
	Vocabulary::TermRef	m_useragent_ref;

	static VocabularyManager m_vocab_mgr;
	static bool	m_config_loaded;
};

VocabularyManager	CodecFactoryLogFormatTests_F::m_vocab_mgr;
bool				CodecFactoryLogFormatTests_F::m_config_loaded = false;

// CodecFactoryWithCodecLoaded_S contains tests for the common log format
BOOST_FIXTURE_TEST_SUITE(CodecFactoryLogFormatTests_S, CodecFactoryLogFormatTests_F)

BOOST_AUTO_TEST_CASE(checkGetCodec) {
	/*
	BOOST_CHECK(getCodec(m_common_id));
	BOOST_CHECK(getCodec(m_combined_id));
	 */
}

BOOST_AUTO_TEST_CASE(checkCommonCodecEventTypes) {
	const Event::EventType event_type_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clf#http-request");
	BOOST_CHECK_EQUAL(m_common_codec->getEventType(), event_type_ref);
	BOOST_CHECK_EQUAL(m_combined_codec->getEventType(), event_type_ref);
}

BOOST_AUTO_TEST_CASE(checkCommonCodecName) {
	BOOST_CHECK_EQUAL(m_common_codec->getName(), "Common Log Format");
}

BOOST_AUTO_TEST_CASE(checkCommonCodecComment) {
	BOOST_CHECK_EQUAL(m_common_codec->getComment(), "Codec for the Common Log Format (CLF)");
}

BOOST_AUTO_TEST_CASE(checkCommonCodecReadLogFile) {
	// open the CLF log file
	std::ifstream in;
	in.open(COMMON_LOG_FILE.c_str(), std::ios::in);
	BOOST_REQUIRE(in.is_open());
	
	// read the first record
	Event e(m_common_codec->getEventType());
	BOOST_REQUIRE(m_common_codec->read(in, e));
	// check the first data
	BOOST_CHECK_EQUAL(e.getString(m_remotehost_ref), "10.0.19.111");
	BOOST_CHECK(! e.isDefined(m_rfc931_ref));
	BOOST_CHECK(! e.isDefined(m_authuser_ref));
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(e.getDateTime(m_date_ref),
					  PionDateTime(boost::gregorian::date(2007, 4, 5),
								   boost::posix_time::time_duration(5, 37, 11)));
	BOOST_CHECK_EQUAL(e.getString(m_request_ref), "GET /robots.txt HTTP/1.0");
	BOOST_CHECK_EQUAL(e.getUInt(m_status_ref), 404UL);
	BOOST_CHECK_EQUAL(e.getUInt(m_bytes_ref), 208UL);

	// read the second record
	e.clear();
	BOOST_REQUIRE(m_common_codec->read(in, e));
	// check the second data
	BOOST_CHECK_EQUAL(e.getString(m_remotehost_ref), "10.0.31.104");
	BOOST_CHECK_EQUAL(e.getString(m_rfc931_ref), "ab");
	BOOST_CHECK(! e.isDefined(m_authuser_ref));
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(e.getDateTime(m_date_ref),
					  PionDateTime(boost::gregorian::date(2007, 6, 8),
								   boost::posix_time::time_duration(7, 20, 2)));
	BOOST_CHECK_EQUAL(e.getString(m_request_ref), "GET /community/ HTTP/1.1");
	BOOST_CHECK_EQUAL(e.getUInt(m_status_ref), 200UL);
	BOOST_CHECK_EQUAL(e.getUInt(m_bytes_ref), 3546UL);

	// read the third record
	e.clear();
	BOOST_REQUIRE(m_common_codec->read(in, e));
	// check the third data
	BOOST_CHECK_EQUAL(e.getString(m_remotehost_ref), "10.0.2.104");
	BOOST_CHECK(! e.isDefined(m_rfc931_ref));
	BOOST_CHECK_EQUAL(e.getString(m_authuser_ref), "cd");
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(e.getDateTime(m_date_ref),
					  PionDateTime(boost::gregorian::date(2007, 9, 24),
								   boost::posix_time::time_duration(12, 13, 3)));
	BOOST_CHECK_EQUAL(e.getString(m_request_ref), "GET /default.css HTTP/1.1");
	BOOST_CHECK_EQUAL(e.getUInt(m_status_ref), 200UL);
	BOOST_CHECK_EQUAL(e.getUInt(m_bytes_ref), 6698UL);

	// read the forth record
	e.clear();
	BOOST_REQUIRE(m_common_codec->read(in, e));
	// check the forth data
	BOOST_CHECK_EQUAL(e.getString(m_remotehost_ref), "10.0.141.122");
	BOOST_CHECK_EQUAL(e.getString(m_rfc931_ref), "ef");
	BOOST_CHECK_EQUAL(e.getString(m_authuser_ref), "gh");
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(e.getDateTime(m_date_ref),
					  PionDateTime(boost::gregorian::date(2008, 1, 30),
								   boost::posix_time::time_duration(15, 26, 7)));
	BOOST_CHECK_EQUAL(e.getString(m_request_ref), "GET /pion/ HTTP/1.1");
	BOOST_CHECK_EQUAL(e.getUInt(m_status_ref), 200UL);
	BOOST_CHECK_EQUAL(e.getUInt(m_bytes_ref), 7058UL);

	/*
	EventPtr event_ptr;
	while ((event_ptr = m_common_codec->read(in))) {
		m_common_codec->write(std::cout, *event_ptr);
	}
	*/
}

BOOST_AUTO_TEST_CASE(checkCommonCodecWriteLogFormatJustOneField) {
	Event e(m_common_codec->getEventType());
	e.setString(m_remotehost_ref, "192.168.0.1");
	std::stringstream ss;
	m_common_codec->write(ss, e);
	BOOST_CHECK_EQUAL(ss.str(), "192.168.0.1 - - [] \"\" - -\x0A");
}

BOOST_AUTO_TEST_CASE(checkCommonCodecWriteLogFormatAllFields) {
	Event e(m_common_codec->getEventType());
	e.setString(m_remotehost_ref, "192.168.10.10");
	e.setString(m_rfc931_ref, "greg");
	e.setString(m_authuser_ref, "bob");
	e.setDateTime(m_date_ref, PionDateTime(boost::gregorian::date(2008, 1, 10),
										   boost::posix_time::time_duration(12, 31, 0)));
	e.setString(m_request_ref, "GET / HTTP/1.1");
	e.setUInt(m_status_ref, 302);
	e.setUInt(m_bytes_ref, 116);
	std::stringstream ss;
	m_common_codec->write(ss, e);
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(ss.str(), "192.168.10.10 greg bob [10/Jan/2008:12:31:00 ] \"GET / HTTP/1.1\" 302 116\x0A");
}

BOOST_AUTO_TEST_CASE(checkCombinedCodecReadLogFile) {
	// open the CLF log file
	std::ifstream in;
	in.open(COMBINED_LOG_FILE.c_str(), std::ios::in);
	BOOST_REQUIRE(in.is_open());
	
	// read the first record
	Event e(m_combined_codec->getEventType());
	BOOST_REQUIRE(m_combined_codec->read(in, e));
	BOOST_CHECK_EQUAL(e.getString(m_referer_ref), "http://www.example.com/start.html");
	BOOST_CHECK_EQUAL(e.getString(m_useragent_ref), "Mozilla/4.08 [en] (Win98; I ;Nav)");
	
	// read the second record
	e.clear();
	BOOST_REQUIRE(m_combined_codec->read(in, e));
	BOOST_CHECK_EQUAL(e.getString(m_referer_ref), "http://www.atomiclabs.com/");
	BOOST_CHECK_EQUAL(e.getString(m_useragent_ref), "Mozilla/4.08 [en] (Win98; I ;Nav)");
	
	// read the third record
	e.clear();
	BOOST_REQUIRE(m_combined_codec->read(in, e));
	BOOST_CHECK_EQUAL(e.getString(m_referer_ref), "http://www.google.com/");
	BOOST_CHECK_EQUAL(e.getString(m_useragent_ref), "Mozilla/5.0 (Macintosh; U; PPC Mac OS X Mach-O; en-US; rv:1.7a) Gecko/20040614 Firefox/0.9.0+");
	
	// read the forth record
	e.clear();
	BOOST_REQUIRE(m_combined_codec->read(in, e));
	BOOST_CHECK_EQUAL(e.getString(m_referer_ref), "http://www.wikipedia.com/");
	BOOST_CHECK_EQUAL(e.getString(m_useragent_ref), "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)");
}

BOOST_AUTO_TEST_CASE(checkCombinedCodecWriteJustExtraFields) {
	Event e(m_combined_codec->getEventType());
	e.setString(m_referer_ref, "http://www.atomiclabs.com/");
	e.setString(m_useragent_ref, "Mozilla/4.08 [en] (Win98; I ;Nav)");
	std::stringstream ss;
	m_combined_codec->write(ss, e);
	BOOST_CHECK_EQUAL(ss.str(), "- - - [] \"\" - - \"http://www.atomiclabs.com/\" \"Mozilla/4.08 [en] (Win98; I ;Nav)\"\x0A");
}

BOOST_AUTO_TEST_CASE(checkExtendedCodecReadLogFile) {
	// open the CLF log file
	std::ifstream in;
	in.open(EXTENDED_LOG_FILE.c_str(), std::ios::in);
	BOOST_REQUIRE(in.is_open());
	
	// read the first record
	Event e(m_extended_codec->getEventType());
	BOOST_REQUIRE(m_extended_codec->read(in, e));
	// check the third data
	BOOST_CHECK_EQUAL(e.getString(m_remotehost_ref), "10.0.2.104");
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(e.getDateTime(m_date_ref),
					  PionDateTime(boost::gregorian::date(2007, 9, 24),
								   boost::posix_time::time_duration(12, 13, 3)));
	BOOST_CHECK_EQUAL(e.getString(m_request_ref), "GET /default.css HTTP/1.1");
	BOOST_CHECK_EQUAL(e.getUInt(m_status_ref), 200UL);
	
	// read the second record
	e.clear();
	BOOST_REQUIRE(m_extended_codec->read(in, e));
	// check the forth data
	BOOST_CHECK_EQUAL(e.getString(m_remotehost_ref), "10.0.141.122");
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(e.getDateTime(m_date_ref),
					  PionDateTime(boost::gregorian::date(2008, 1, 30),
								   boost::posix_time::time_duration(15, 26, 7)));
	BOOST_CHECK_EQUAL(e.getString(m_request_ref), "GET /pion/ HTTP/1.1");
	BOOST_CHECK_EQUAL(e.getUInt(m_status_ref), 200UL);

	// read the third record
	e.clear();
	BOOST_REQUIRE(m_extended_codec->read(in, e));
	// check the first data
	BOOST_CHECK_EQUAL(e.getString(m_remotehost_ref), "10.0.19.111");
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(e.getDateTime(m_date_ref),
					  PionDateTime(boost::gregorian::date(2007, 4, 5),
								   boost::posix_time::time_duration(5, 37, 11)));
	BOOST_CHECK_EQUAL(e.getString(m_request_ref), "GET /robots.txt HTTP/1.0");
	BOOST_CHECK_EQUAL(e.getUInt(m_status_ref), 404UL);
	
	// read the forth record
	e.clear();
	BOOST_REQUIRE(m_extended_codec->read(in, e));
	// check the second data
	BOOST_CHECK_EQUAL(e.getString(m_remotehost_ref), "10.0.31.104");
	// NOTE: timezone offsets are currently not working in DateTimeFacet
	BOOST_CHECK_EQUAL(e.getDateTime(m_date_ref),
					  PionDateTime(boost::gregorian::date(2007, 6, 8),
								   boost::posix_time::time_duration(7, 20, 2)));
	BOOST_CHECK_EQUAL(e.getString(m_request_ref), "GET /community/ HTTP/1.1");
	BOOST_CHECK_EQUAL(e.getUInt(m_status_ref), 200UL);
	
}

BOOST_AUTO_TEST_CASE(checkExtendedCodecWrite) {
	Event e(m_extended_codec->getEventType());
	e.setString(m_remotehost_ref, "192.168.10.10");
	e.setDateTime(m_date_ref, PionDateTime(boost::gregorian::date(2008, 1, 10),
										   boost::posix_time::time_duration(12, 31, 0)));
	e.setString(m_request_ref, "GET / HTTP/1.1");
	e.setString(m_referer_ref, "http://www.atomiclabs.com/");
	e.setUInt(m_status_ref, 302);
	std::stringstream ss;
	m_extended_codec->write(ss, e);
	m_extended_codec->write(ss, e);
	BOOST_CHECK_EQUAL(ss.str(), "#Version: 1.0\x0A#Fields: date remotehost request cs(Referer) status\x0A\"10/Jan/2008:12:31:00 \" 192.168.10.10 \"GET / HTTP/1.1\" \"http://www.atomiclabs.com/\" 302\x0A\"10/Jan/2008:12:31:00 \" 192.168.10.10 \"GET / HTTP/1.1\" \"http://www.atomiclabs.com/\" 302\x0A");
}


BOOST_AUTO_TEST_SUITE_END()
