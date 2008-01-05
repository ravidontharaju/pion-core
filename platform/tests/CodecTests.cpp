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
#include <boost/mpl/list.hpp>
#include <boost/bind.hpp>

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
#elif defined(PION_XCODE)
	static const std::string PATH_TO_PLUGINS(".");
#else
	// same for Unix and Cygwin
	static const std::string PATH_TO_PLUGINS("../codecs/.libs");
#endif

/// sets up logging (run once only)
extern void setup_logging_for_unit_tests(void);

class PluginPtrReadyToLoadCodec_F : public PionPluginPtr<Codec> {
public:
	PluginPtrReadyToLoadCodec_F() { 
		setup_logging_for_unit_tests();
		PionPlugin::resetPluginDirectories();
		PionPlugin::addPluginDirectory(PATH_TO_PLUGINS);
	}
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(PluginPtrReadyToLoadCodec_S, 
									   boost::mpl::list<PluginPtrReadyToLoadCodec_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenELFCodec) {
	BOOST_CHECK_NO_THROW(F::open("ELFCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenJSONCodec) {
	BOOST_CHECK_NO_THROW(F::open("JSONCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenXMLCodec) {
	BOOST_CHECK_NO_THROW(F::open("XMLCodec"));
}

BOOST_AUTO_TEST_SUITE_END()


template<const char* plugin_name>
class PluginPtrWithCodecLoaded_F : public PluginPtrReadyToLoadCodec_F {
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
extern const char ELFCodec_name[]  = "ELFCodec";
extern const char JSONCodec_name[] = "JSONCodec";
extern const char XMLCodec_name[]  = "XMLCodec";

typedef boost::mpl::list<PluginPtrWithCodecLoaded_F<ELFCodec_name>,
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
		PionPlugin::resetPluginDirectories();
		PionPlugin::addPluginDirectory(PATH_TO_PLUGINS);
		m_codec_id = "some_ID";
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
};

VocabularyManager	NewCodecFactory_F::m_vocab_mgr;
int					NewCodecFactory_F::m_num_times_mock_called = 0;

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(NewCodecFactory_S, 
									   boost::mpl::list<NewCodecFactory_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadELFCodec) {
	BOOST_CHECK_NO_THROW(F::loadCodec(F::m_codec_id, "ELFCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadJSONCodec) {
	BOOST_CHECK_NO_THROW(F::loadCodec(F::m_codec_id, "JSONCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadXMLCodec) {
	BOOST_CHECK_NO_THROW(F::loadCodec(F::m_codec_id, "XMLCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadMultipleCodecs) {
	BOOST_CHECK_NO_THROW(F::loadCodec("id_1", "ELFCodec"));
	BOOST_CHECK_NO_THROW(F::loadCodec("id_2", "JSONCodec"));
	BOOST_CHECK_NO_THROW(F::loadCodec("id_3", "XMLCodec"));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadTwoCodecsWithSameId) {
	BOOST_CHECK_NO_THROW(F::loadCodec("id_1", "ELFCodec"));
	BOOST_CHECK_THROW(F::loadCodec("id_1", "JSONCodec"), CodecFactory::DuplicateIdentifierException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadUnknownCodec) {
	BOOST_CHECK_THROW(F::loadCodec(F::m_codec_id, "UnknownCodec"), PionPlugin::PluginNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecOption) {
	BOOST_CHECK_THROW(F::setCodecOption(F::m_codec_id, "NotAnOption", "value1"), CodecFactory::CodecNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveCodec) {
	BOOST_CHECK_THROW(F::removeCodec(F::m_codec_id), CodecFactory::CodecNotFoundException);
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
		loadCodec(m_codec_id, m_plugin_name);
	}
	
	std::string m_plugin_name;
};

typedef boost::mpl::list<CodecFactoryWithCodecLoaded_F<ELFCodec_name>,
						 CodecFactoryWithCodecLoaded_F<JSONCodec_name>,
						 CodecFactoryWithCodecLoaded_F<XMLCodec_name> > codec_fixture_list_2;

// CodecFactoryWithCodecLoaded_S contains tests that should pass for any codec
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithCodecLoaded_S, codec_fixture_list_2)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetCodec) {
	BOOST_CHECK(F::getCodec(F::m_codec_id));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveCodec) {
	BOOST_CHECK_NO_THROW(F::removeCodec(F::m_codec_id));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecOptionWithInvalidOptionNameThrows) {
	BOOST_CHECK_THROW(F::setCodecOption(F::m_codec_id, "NotAnOption", "value1"), Codec::UnknownOptionException);
}

// TODO: is there a way to get the plugin name from the factory?
//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetPluginNameReturnsPluginName) {
//	BOOST_CHECK_EQUAL(F::getPluginName(F::m_codec_id), F::m_plugin_name);
//}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithELFCodecLoaded_S contains tests that are specific to ELFCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithELFCodecLoaded_S, boost::mpl::list<CodecFactoryWithCodecLoaded_F<ELFCodec_name> >)

//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecOptionX) {
//	BOOST_CHECK_NO_THROW(F::setCodecOption(F::m_codec_id, "someELFCodecOption", "someValidValue"));
//}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithJSONCodecLoaded_S contains tests that are specific to JSONCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithJSONCodecLoaded_S, boost::mpl::list<CodecFactoryWithCodecLoaded_F<JSONCodec_name> >)

//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecOptionX) {
//	BOOST_CHECK_NO_THROW(F::setCodecOption(F::m_codec_id, "someJSONCodecOption", "someValidValue"));
//}

BOOST_AUTO_TEST_SUITE_END()


// CodecFactoryWithXMLCodecLoaded_S contains tests that are specific to XMLCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithXMLCodecLoaded_S, boost::mpl::list<CodecFactoryWithCodecLoaded_F<XMLCodec_name> >)

//BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetCodecOptionX) {
//	BOOST_CHECK_NO_THROW(F::setCodecOption(F::m_codec_id, "someXMLCodecOption", "someValidValue"));
//}

BOOST_AUTO_TEST_SUITE_END()


class CodecFactoryWithMultipleCodecsLoaded_F : public NewCodecFactory_F {
public:
	CodecFactoryWithMultipleCodecsLoaded_F() {
		m_ELFCodec_id = "ELF_id";
		loadCodec(m_ELFCodec_id, ELFCodec_name);
		m_JSONCodec_id = "JSON_id";
		loadCodec(m_JSONCodec_id, JSONCodec_name);
		m_XMLCodec_id = "XML_id";
		loadCodec(m_XMLCodec_id, XMLCodec_name);
	}
	
	std::string m_ELFCodec_id;
	std::string m_JSONCodec_id;
	std::string m_XMLCodec_id;
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithMultipleCodecsLoaded_S, 
									   boost::mpl::list<CodecFactoryWithMultipleCodecsLoaded_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetCodec) {
	BOOST_CHECK(F::getCodec(F::m_ELFCodec_id));
	BOOST_CHECK(F::getCodec(F::m_JSONCodec_id));
	BOOST_CHECK(F::getCodec(F::m_XMLCodec_id));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveCodec) {
	BOOST_CHECK_NO_THROW(F::removeCodec(F::m_ELFCodec_id));
	BOOST_CHECK_NO_THROW(F::removeCodec(F::m_JSONCodec_id));
	BOOST_CHECK_NO_THROW(F::removeCodec(F::m_XMLCodec_id));
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

typedef boost::mpl::list<CodecFactoryWithCodecPtr_F<ELFCodec_name>,
						 CodecFactoryWithCodecPtr_F<JSONCodec_name>,
						 CodecFactoryWithCodecPtr_F<XMLCodec_name> > codec_fixture_list_3;

// CodecFactoryWithCodecPtr_S contains tests that should pass for any codec
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithCodecPtr_S, codec_fixture_list_3)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSetOption) {
	BOOST_CHECK_THROW(F::m_codec_ptr->setOption("NotAnOption", "value1"), Codec::UnknownOptionException);
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


// CodecFactoryWithELFCodecPtr_S contains tests that are specific to ELFCodecs
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(CodecFactoryWithELFCodecPtr_S, boost::mpl::list<CodecFactoryWithCodecPtr_F<ELFCodec_name> >)

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


