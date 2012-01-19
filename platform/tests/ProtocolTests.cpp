// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2011 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#ifdef _MSC_VER
// This could be any valid .lib file; its only purpose is to prevent the compiler  
// from trying to link to boost_zlib-*.lib (e.g. boost_zlib-vc90-mt-1_42.lib).
#define BOOST_ZLIB_BINARY "zdll.lib"
#endif

#include <pion/PionConfig.hpp>
#include <pion/PionPlugin.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <pion/platform/PionPlatformUnitTest.hpp>
#include <pion/platform/PluginConfig.hpp>
#include <pion/platform/Protocol.hpp>
#include <pion/platform/ProtocolFactory.hpp>
#include <pion/net/HTTPRequest.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/iostreams/filter/gzip.hpp>
#include <boost/iostreams/compose.hpp>
#include <boost/iostreams/copy.hpp>
#include "../protocols/HTTPProtocol.hpp"
#include "../server/PlatformConfig.hpp"

using namespace pion;
using namespace pion::platform;

static const std::string CRLF = pion::net::HTTPTypes::STRING_CRLF;


/// cleans up config files relevant to Protocols in the working directory
void cleanup_protocol_config_files(bool copy_protocol_config_file)
{
	PionPlatformUnitTest::cleanup_vocab_config_files();

	if (boost::filesystem::exists(PROTOCOLS_CONFIG_FILE))
		boost::filesystem::remove(PROTOCOLS_CONFIG_FILE);
	if (copy_protocol_config_file)
		boost::filesystem::copy_file(PROTOCOLS_TEMPLATE_FILE, PROTOCOLS_CONFIG_FILE);
}


/// fixture class used for basic Protocol tests
class BasicProtocolTests_F
{
public:
	BasicProtocolTests_F(void) {
		cleanup_protocol_config_files(false);
	}
	~BasicProtocolTests_F(void) {}
};

BOOST_FIXTURE_TEST_SUITE(BasicProtocolTests_S, BasicProtocolTests_F)

BOOST_AUTO_TEST_CASE(checkPionPluginPtrDeclaredBeforeProtocolPtr) {
	// Note that PionPluginPtr MUST be in scope as long or longer than any
	// Protocols that use it!!!
	
	PionPluginPtr<Protocol> ppp;
	ProtocolPtr p;
	ppp.open("HTTPProtocol");
	p = ProtocolPtr(ppp.create());
}

BOOST_AUTO_TEST_CASE(checkHTTPProtocolClone) {
	// Note that PionPluginPtr MUST be in scope as long or longer than any
	// Protocols that use it!!!

	PionPluginPtr<Protocol> ppp;
	ProtocolPtr p;
	ppp.open("HTTPProtocol");
	p = ProtocolPtr(ppp.create());
	ProtocolPtr pc;
	pc = p->clone();
	BOOST_CHECK_EQUAL( p->getEventType(), pc->getEventType() );
}

BOOST_AUTO_TEST_CASE(checkProtocolFactoryConstructor) {
	VocabularyManager vocab_mgr;
	BOOST_CHECK_NO_THROW(ProtocolFactory protocolFactory(vocab_mgr));
}

BOOST_AUTO_TEST_CASE(checkProtocolFactoryDestructor) {
	VocabularyManager vocab_mgr;
	ProtocolFactory* protocolFactory = new ProtocolFactory(vocab_mgr);
	BOOST_CHECK_NO_THROW(delete protocolFactory);
}

BOOST_AUTO_TEST_CASE(checkLockVocabularyManagerAfterProtocolFactoryDestroyed) {
	VocabularyManager vocab_mgr;
	vocab_mgr.setConfigFile(VOCABS_CONFIG_FILE);
	vocab_mgr.openConfigFile();
	{
		ProtocolFactory protocolFactory(vocab_mgr);
	}

	vocab_mgr.setLocked("urn:vocab:clickstream", false);
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture class used for testing Protocol Factories with empty protocols.xml
class NewProtocolFactory_F : public ProtocolFactory {
public:
	NewProtocolFactory_F() : ProtocolFactory(m_vocab_mgr) {
		cleanup_protocol_config_files(false);

		if (! m_config_loaded) {
			// load the CLF vocabulary
			m_vocab_mgr.setConfigFile(VOCABS_CONFIG_FILE);
			m_vocab_mgr.openConfigFile();
			m_config_loaded = true;
		}

		// create a new Protocol configuration file
		setConfigFile(PROTOCOLS_CONFIG_FILE);
		createConfigFile();
	}

	~NewProtocolFactory_F() {
	}

	/**
	 * returns a valid configuration tree for a Protocol
	 *
	 * @param plugin_type the type of new plugin that is being created
	 *
	 * @return xmlNodePtr XML configuration list for the new Protocol
	 */
	inline xmlNodePtr createProtocolConfig(const std::string& plugin_type) {
		xmlNodePtr config_ptr(ConfigManager::createPluginConfig(plugin_type));
		xmlNodePtr event_type_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>("EventType"));
		xmlNodeSetContent(event_type_node,  reinterpret_cast<const xmlChar*>("urn:vocab:clickstream#http-event"));
		xmlAddNextSibling(config_ptr, event_type_node);
		return config_ptr;
	}


	static VocabularyManager m_vocab_mgr;
	static bool m_config_loaded;
};

bool NewProtocolFactory_F::m_config_loaded = false;
VocabularyManager NewProtocolFactory_F::m_vocab_mgr;

BOOST_FIXTURE_TEST_SUITE(NewProtocolFactory_S, NewProtocolFactory_F)

BOOST_AUTO_TEST_CASE(checkLoadLogProtocol) {
	xmlNodePtr config_ptr(createProtocolConfig("HTTPProtocol"));
	BOOST_CHECK_NO_THROW(addProtocol(config_ptr));
	xmlFreeNodeList(config_ptr);
}

BOOST_AUTO_TEST_CASE(checkLoadUnknownProtocol) {
	xmlNodePtr config_ptr(createProtocolConfig("UnknownProtocol"));
	BOOST_CHECK_THROW(addProtocol(config_ptr), PionPlugin::PluginNotFoundException);
	xmlFreeNodeList(config_ptr);
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture class used for testing Protocol Factories with standard protocols.xml
class StandardProtocolFactory_F : public ProtocolFactory {
public:
	StandardProtocolFactory_F() : ProtocolFactory(m_vocab_mgr) {
		cleanup_protocol_config_files(true);

		if (! m_config_loaded) {
			// load the CLF vocabulary
			m_vocab_mgr.setConfigFile(VOCABS_CONFIG_FILE);
			m_vocab_mgr.openConfigFile();
			m_config_loaded = true;
		}

		// open the default Protocol configuration file used for testing
		setConfigFile(PROTOCOLS_CONFIG_FILE);
		openConfigFile();

		m_minimal_request = "GET / HTTP/1.1" + CRLF + "Host: X" + CRLF + CRLF;

		// We're not testing timestamps here, so use anything that works.
		m_t0 = boost::posix_time::ptime();

		m_page_title_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:clickstream#page-title");
	}

	~StandardProtocolFactory_F() {
	}

	void generateEvent(const std::string& content_type_header, const std::string& content, const std::string& content_encoding = "") {
		// Process a minimal request.
		boost::system::error_code ec;
		m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e, ec);
		BOOST_REQUIRE(boost::indeterminate(m_rc));
		BOOST_CHECK(!ec);

		// Simulate a response with the given content and Content-Type header.
		std::ostringstream oss;
		oss << "HTTP/1.1 200 " << CRLF
			<< content_type_header << CRLF;
		if (! content_encoding.empty())
			oss << "Content-Encoding: " << content_encoding << CRLF;
		oss	<< "Content-Length: " << content.size() << CRLF << CRLF
			<< content;
		std::string response = oss.str();

		// Process the response and check that an Event was generated.
		m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
		BOOST_REQUIRE(m_rc == true);
		BOOST_CHECK(!ec);
		BOOST_REQUIRE(!m_e.empty());
		BOOST_REQUIRE(m_e.back().get());
	}

	static VocabularyManager m_vocab_mgr;
	static bool m_config_loaded;
	std::string m_minimal_request;
	boost::tribool m_rc;
	EventContainer m_e;
	pion::platform::ProtocolPtr m_protocol_ptr;
	boost::posix_time::ptime m_t0;
	pion::platform::Vocabulary::TermRef	m_page_title_term_ref;
};

VocabularyManager StandardProtocolFactory_F::m_vocab_mgr;
bool StandardProtocolFactory_F::m_config_loaded = false;

BOOST_FIXTURE_TEST_SUITE(StandardProtocolFactory_S, StandardProtocolFactory_F)

BOOST_AUTO_TEST_CASE(checkGetProtocol) {
	BOOST_CHECK(getProtocol("593f044a-ac60-11dd-aba3-001cc02bd66b"));
}

BOOST_AUTO_TEST_CASE(checkRemoveProtocol) {
	BOOST_CHECK_NO_THROW(removeProtocol("37A7DC3E-EE7E-4420-B0DD-CADE20DEF840"));
}

// TODO: more basic tests.

BOOST_AUTO_TEST_SUITE_END()


class string_sink : public boost::iostreams::sink {
public:
	string_sink(std::string& dest) : dest_(dest)
	{}
	std::streamsize write(const char* s, std::streamsize n)
	{
		dest_.insert(dest_.end(), s, s + n);
		return n;
	}
private:
	string_sink& operator=(const string_sink&);
	std::string& dest_;
};

/**/
// Optional code: see gzipEncode().
class string_source {
public:
	typedef char char_type;
	struct category : boost::iostreams::source_tag
	{};
	explicit string_source(const std::string& data) : data_(data), pos_(0)
	{}
	std::streamsize read(char* s, std::streamsize n)
	{
		if (pos_ == static_cast<std::streamsize>(data_.size()))
			return -1;
		std::streamsize avail = (std::min)(n, static_cast<std::streamsize>(data_.size() - pos_));
		if (avail)
			std::memcpy(s, data_.c_str() + pos_, avail);
		pos_ += avail;
		return avail;
	}
	bool putback(char c)
	{
		if (pos_ > 0) {
			data_[--pos_] = c;
			return true;
		}
		return false;
	}
private:
	std::string data_;
	std::streamsize pos_;
};
/**/


// TEST_STRING_1 corresponds to the following 6 unicode characters:
// U+0063 (LATIN SMALL LETTER C)
// U+0061 (LATIN SMALL LETTER A)
// U+0074 (LATIN SMALL LETTER T)
// U+732B (simplified Chinese character for "cat")
// U+FF2F (FULLWIDTH LATIN CAPITAL LETTER O)
// U+FF2B (FULLWIDTH LATIN CAPITAL LETTER K)

static const char UTF8_ENCODED_TEST_CHAR_ARRAY_1[] = {
		0x63,									// 'c'
		0x61,									// 'a'
		0x74,									// 't'
		(char)0xE7, (char)0x8C,	(char)0xAB,		// UTF-8 encoding of U+732B
		(char)0xEF, (char)0xBC,	(char)0xAF,		// UTF-8 encoding of U+FF2F
		(char)0xEF, (char)0xBC,	(char)0xAB};	// UTF-8 encoding of U+FF2B

static const std::string UTF8_ENCODED_TEST_STRING_1(UTF8_ENCODED_TEST_CHAR_ARRAY_1, sizeof(UTF8_ENCODED_TEST_CHAR_ARRAY_1));

static const char UTF16_ENCODED_TEST_CHAR_ARRAY_1[] = {
		(char)0xFF, (char)0xFE,	// BOM (byte order marker)
		0x63, 0x00,				// 'c'
		0x61, 0x00,				// 'a'
		0x74, 0x00,				// 't'
		0x2B, 0x73,				// U+732B (simplified Chinese character for "cat")
		0x2F, (char)0xFF,		// U+FF2F (FULLWIDTH LATIN CAPITAL LETTER O)
		0x2B, (char)0xFF};		// U+FF2B (FULLWIDTH LATIN CAPITAL LETTER K)

static const std::string UTF16_ENCODED_TEST_STRING_1(UTF16_ENCODED_TEST_CHAR_ARRAY_1, sizeof(UTF16_ENCODED_TEST_CHAR_ARRAY_1));

// See http://demo.icu-project.org/icu-bin/convexp?conv=ibm-33722_P12A_P12A-2004_U2 for EUC-JP tables.
static const char EUC_JP_ENCODED_TEST_CHAR_ARRAY_1[] = {
	0x63,						// 'c'
	0x61,						// 'a'
	0x74,						// 't'
	(char)0xC7, (char)0xAD,		// EUC-JP encoding of U+732B (simplified Chinese character for "cat")
	(char)0xA3, (char)0xCF,		// EUC-JP encoding of U+FF2F (FULLWIDTH LATIN CAPITAL LETTER O)
	(char)0xA3, (char)0xCB};	// EUC-JP encoding of U+FF2B (FULLWIDTH LATIN CAPITAL LETTER K)

static const std::string EUC_JP_ENCODED_TEST_STRING_1(EUC_JP_ENCODED_TEST_CHAR_ARRAY_1, sizeof(EUC_JP_ENCODED_TEST_CHAR_ARRAY_1));

// This is what you get when EUC_JP_ENCODED_TEST_STRING_1 is interpreted as UTF-8, and invalid characters are replaced.
static const char CLEANSED_EUC_JP_ENCODED_TEST_CHAR_ARRAY_1[] = {
	0x63,								// 'c'
	0x61,								// 'a'
	0x74,								// 't'
	(char)0xC7, (char)0xAD,				// UTF-8 encoding of U+01ED
	(char)0xEF, (char)0xBF,	(char)0xBD,	// UTF-8 encoding of U+FFFD (REPLACEMENT CHARACTER)
	(char)0xCF,	(char)0xA3,				// UTF-8 encoding of U+03E3
	(char)0xEF, (char)0xBF,	(char)0xBD};// UTF-8 encoding of U+FFFD (REPLACEMENT CHARACTER)

static const std::string CLEANSED_EUC_JP_ENCODED_TEST_STRING_1(CLEANSED_EUC_JP_ENCODED_TEST_CHAR_ARRAY_1, sizeof(CLEANSED_EUC_JP_ENCODED_TEST_CHAR_ARRAY_1));

// See http://demo.icu-project.org/icu-bin/convexp?conv=ibm-943_P15A-2003 for Shift_JIS tables.
static const char SHIFT_JIS_ENCODED_TEST_CHAR_ARRAY_1[] = {
	0x63,				// 'c'
	0x61,				// 'a'
	0x74,				// 't'
	(char)0x94, 0x4C,	// Shift_JIS encoding of U+732B (simplified Chinese character for "cat")
	(char)0x82, 0x6E,	// Shift_JIS encoding of U+FF2F (FULLWIDTH LATIN CAPITAL LETTER O)
	(char)0x82, 0x6A};	// Shift_JIS encoding of U+FF2B (FULLWIDTH LATIN CAPITAL LETTER K)

static const std::string SHIFT_JIS_ENCODED_TEST_STRING_1(SHIFT_JIS_ENCODED_TEST_CHAR_ARRAY_1, sizeof(SHIFT_JIS_ENCODED_TEST_CHAR_ARRAY_1));

static const char INVALID_UTF8_CHAR_ARRAY_1[] = {
		0x63,									// 'c'
		0x61,									// 'a'
		0x74,									// 't'
		(char)0xFE,								// can never occur in a valid UTF-8 sequence
		0x63,									// 'c'
		0x61,									// 'a'
		0x74};									// 't'

static const std::string INVALID_UTF8_STRING_1(INVALID_UTF8_CHAR_ARRAY_1, sizeof(INVALID_UTF8_CHAR_ARRAY_1));

static const char CLEANSED_UTF8_CHAR_ARRAY_1[] = {
		0x63,									// 'c'
		0x61,									// 'a'
		0x74,									// 't'
		(char)0xEF, (char)0xBF,	(char)0xBD,		// UTF-8 encoding of U+FFFD (REPLACEMENT CHARACTER)
		0x63,									// 'c'
		0x61,									// 'a'
		0x74};									// 't'

static const std::string CLEANSED_UTF8_STRING_1(CLEANSED_UTF8_CHAR_ARRAY_1, sizeof(CLEANSED_UTF8_CHAR_ARRAY_1));

static const char INVALID_UTF8_RESOURCE_CHAR_ARRAY[] = {
		0x2F,									// '/'
		0x61,									// 'a'
		0x62,									// 'b'
		(char)0xFE,								// can never occur in a valid UTF-8 sequence
		0x63};									// 'c'

static const std::string INVALID_UTF8_RESOURCE_STRING(INVALID_UTF8_RESOURCE_CHAR_ARRAY, sizeof(INVALID_UTF8_RESOURCE_CHAR_ARRAY));

static const char CLEANSED_UTF8_RESOURCE_CHAR_ARRAY[] = {
		0x2F,									// '/'
		0x61,									// 'a'
		0x62,									// 'b'
		(char)0xEF, (char)0xBF,	(char)0xBD,		// UTF-8 encoding of U+FFFD (REPLACEMENT CHARACTER)
		0x63};									// 'c'

static const std::string CLEANSED_UTF8_RESOURCE_STRING(CLEANSED_UTF8_RESOURCE_CHAR_ARRAY, sizeof(CLEANSED_UTF8_RESOURCE_CHAR_ARRAY));

static const char UTF8_REPL_CHAR_CHAR_ARRAY[] = {
	(char)0xEF, (char)0xBF,	(char)0xBD};		// UTF-8 encoding of U+FFFD (REPLACEMENT CHARACTER)

static const std::string UTF8_REPL_CHAR(UTF8_REPL_CHAR_CHAR_ARRAY, sizeof(UTF8_REPL_CHAR_CHAR_ARRAY));


/// fixture class used for testing Protocol "HTTP (full content)"
class HTTPFullContentProtocol_F : public StandardProtocolFactory_F  {
public:
	HTTPFullContentProtocol_F() : StandardProtocolFactory_F() {
		m_protocol_ptr = getProtocol("593f044a-ac60-11dd-aba3-001cc02bd66b");

		m_cs_content_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:clickstream#cs-content");
		m_sc_content_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:clickstream#sc-content");
	}

	~HTTPFullContentProtocol_F() {
	}

	std::string gzipEncode(const std::string& content) {
		std::istringstream src(content);
		std::string encoded_content;
		boost::iostreams::copy(
			src, 
			boost::iostreams::compose(boost::iostreams::gzip_compressor(), string_sink(encoded_content)));
/**/
// Optional decompression code for testing the compression above.
		std::string decoded_content;
		boost::iostreams::copy( 
			boost::iostreams::compose(boost::iostreams::gzip_decompressor(), string_source(encoded_content)),
			boost::iostreams::back_inserter(decoded_content));
		BOOST_REQUIRE_EQUAL(content, decoded_content);
/**/
		return encoded_content;
	}

	pion::platform::Vocabulary::TermRef	m_cs_content_term_ref;
	pion::platform::Vocabulary::TermRef	m_sc_content_term_ref;
};

BOOST_FIXTURE_TEST_SUITE(HTTPFullContentProtocol_S, HTTPFullContentProtocol_F)

BOOST_AUTO_TEST_CASE(checkReadNextRequestAndResponse) {
	bool is_request;
	boost::system::error_code ec;
	m_rc = m_protocol_ptr->readNext(is_request = true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(!ec);
	BOOST_CHECK(m_e.empty());

	std::string response = "HTTP/1.1 200 " + CRLF + "Content-Type: text/html" + CRLF + "Content-Length: 10" + CRLF + CRLF + "0123456789";
	m_rc = m_protocol_ptr->readNext(is_request = false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(!ec);
	BOOST_REQUIRE(!m_e.empty());
	BOOST_REQUIRE(m_e.back().get());
}

BOOST_AUTO_TEST_CASE(checkEventContainsCsVersion) {
	m_minimal_request = "GET / HTTP/1.0" + CRLF + "Host: X" + CRLF + CRLF;
	generateEvent("Content-Type: text/html", "nothing special");

	// Check that the cs-version Term in the Event is correct.
	pion::platform::Vocabulary::TermRef	cs_version_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:clickstream#cs-version");
	BOOST_CHECK_EQUAL("HTTP/1.0", m_e.back()->getString(cs_version_term_ref));
}

BOOST_AUTO_TEST_CASE(checkEventContainsContentTerm) {
	boost::system::error_code ec;
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(!ec);

	const std::string orig_sc_content = "0123456789";
	std::string response = "HTTP/1.1 200 " + CRLF + "Content-Type: text/html" + CRLF + "Content-Length: 10" + CRLF + CRLF + orig_sc_content;
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(!ec);

	BOOST_REQUIRE(!m_e.empty());
	BOOST_REQUIRE(m_e.back().get());
	BOOST_CHECK_EQUAL(orig_sc_content, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkEventContainsContentPageTitle) {
	boost::system::error_code ec;
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(!ec);

	const std::string orig_sc_content = "<title>My Home Page</title>some content";
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html" << CRLF
		<< "Content-Length: " << orig_sc_content.length() << CRLF << CRLF
		<< orig_sc_content;
	std::string response = oss.str();
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(!ec);

	BOOST_REQUIRE(!m_e.empty());
	BOOST_REQUIRE(m_e.back().get());
	BOOST_CHECK_EQUAL("My Home Page", m_e.back()->getString(m_page_title_term_ref));
	BOOST_CHECK_EQUAL(orig_sc_content, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingEventContainsContentTerm) {
	boost::system::error_code ec;
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(!ec);

	const std::string orig_content = "0123456789";
	const std::string gzipped_content = gzipEncode(orig_content);

	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html" << CRLF
		<< "Content-Encoding: gzip" << CRLF
		<< "Content-Length: " << gzipped_content.length() << CRLF << CRLF
		<< gzipped_content;
	std::string response = oss.str();
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(!ec);

	BOOST_REQUIRE(!m_e.empty());
	BOOST_REQUIRE(m_e.back().get());
	BOOST_CHECK_EQUAL(orig_content, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUnknownContentEncodingEventContainsOriginalContentTerm) {
	boost::system::error_code ec;
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(!ec);

	// Simulate a response with content encoded with unknown compression algorithm "smash".
	const std::string smashed_content = "d8kkdsj8722m";
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html" << CRLF
		<< "Content-Encoding: smash" << CRLF
		<< "Content-Length: " << smashed_content.length() << CRLF << CRLF
		<< smashed_content;
	std::string response = oss.str();

	// Process the response and check that the resulting Event has an sc-content Term containing the still smashed content.
	// (Note: an error should be logged - to see it, run the tests with argument '-v'.)
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(!ec);
	BOOST_REQUIRE(!m_e.empty());
	BOOST_REQUIRE(m_e.back().get());
	BOOST_CHECK_EQUAL(smashed_content, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingEventContainsLongContentTerm) {
	boost::system::error_code ec;
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(!ec);

	std::ifstream log_file((LOG_FILE_DIR + "large.json").c_str());
	std::ostringstream oss0;
	char c;
	while (log_file.get(c)) oss0.put(c);
	const std::string orig_content = oss0.str();
	const std::string gzipped_content = gzipEncode(orig_content);

	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html" << CRLF
		<< "Content-Encoding: gzip" << CRLF
		<< "Content-Length: " << gzipped_content.length() << CRLF << CRLF
		<< gzipped_content;
	std::string response = oss.str();
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(!ec);

	BOOST_REQUIRE(!m_e.empty());
	BOOST_REQUIRE(m_e.back().get());
	BOOST_CHECK_EQUAL(orig_content, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkRequestWithContent) {
	const std::string orig_cs_content = "Color=Red";
	std::string request = "POST / HTTP/1.1" + CRLF + "Content-Type: application/x-www-form-urlencoded" + CRLF 
						+ "Content-Length: 9" + CRLF + CRLF + orig_cs_content;
	boost::system::error_code ec;
	m_rc = m_protocol_ptr->readNext(true, request.c_str(), request.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(!ec);

	const std::string orig_sc_content = "0123456789";
	std::string response = "HTTP/1.1 200 " + CRLF + "Content-Type: text/html" + CRLF + "Content-Length: 10" + CRLF + CRLF + orig_sc_content;
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(!ec);

	BOOST_REQUIRE(!m_e.empty());
	BOOST_REQUIRE(m_e.back().get());
	BOOST_CHECK_EQUAL(orig_cs_content, m_e.back()->getString(m_cs_content_term_ref));
	BOOST_CHECK_EQUAL(orig_sc_content, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUtf8CharsetEventContainsOriginalContentTerm) {
	// Send a Content-Type header with charset=utf-8.
	generateEvent("Content-Type: text/html; charset=utf-8", UTF8_ENCODED_TEST_STRING_1);

	// Check that the sc_content Term in the Event was unchanged.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUtf8CharsetInvalidUtf8BytesInContentAreReplaced) {
	// Send a Content-Type header with charset=utf-8.
	generateEvent("Content-Type: text/html; charset=utf-8", INVALID_UTF8_STRING_1);

	// Check that the invalid byte was replaced in the sc-content Term in the Event.
	BOOST_CHECK_EQUAL(CLEANSED_UTF8_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithNoCharsetInvalidUtf8BytesInContentAreReplaced) {
	// Send a Content-Type header with charset=utf-8.
	generateEvent("Content-Type: text/html", INVALID_UTF8_STRING_1);

	// Check that the invalid byte was replaced in the sc-content Term in the Event.
	BOOST_CHECK_EQUAL(CLEANSED_UTF8_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingInvalidUtf8BytesInContentAreReplaced) {
	// Send a Content-Type header with no charset specified and send gzipped content.
	generateEvent("Content-Type: text/html", gzipEncode(INVALID_UTF8_STRING_1), "gzip");

	// Check that the invalid byte was replaced in the sc-content Term in the Event.
	BOOST_CHECK_EQUAL(CLEANSED_UTF8_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUnknownContentEncodingInvalidUtf8BytesInContentAreReplaced) {
	// Content encoded with unknown compression algorithm "smash", containing an invalid UTF-8 byte.
	const std::string smashed_content = INVALID_UTF8_STRING_1;

	// Send a Content-Encoding header with value "smash".
	generateEvent("Content-Type: text/html", smashed_content, "smash");

	// Check that the resulting Event has an sc-content Term containing the still encoded content, with the invalid byte replaced.
	// (Note: an error should be logged - to see it, run the tests with argument '-v'.)
	BOOST_CHECK_EQUAL(CLEANSED_UTF8_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkInvalidUtf8CharsInHeaderAreReplaced) {
	// Generate an event with a resource in the request that has an invalid UTF-8 character.
	m_minimal_request = "GET " + INVALID_UTF8_RESOURCE_STRING + " HTTP/1.1" + CRLF + "Host: X" + CRLF + CRLF;
	generateEvent("Content-Type: text/html", "nothing special");

	// Check that the invalid byte was replaced in the uri-stem Term in the Event.
	pion::platform::Vocabulary::TermRef	uri_stem_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:clickstream#uri-stem");
	BOOST_CHECK_EQUAL(CLEANSED_UTF8_RESOURCE_STRING, m_e.back()->getString(uri_stem_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUtf8CompatCharsetEventContainsOriginalContentTerm) {
	// ISO-8859-1 encoded content: should be the same in UTF-8.
	const std::string ISO_8859_1_encoded_content = "0123456789";

	// Send a Content-Type header with charset=ISO-8859-1.
	generateEvent("Content-Type: text/html; charset=ISO-8859-1", ISO_8859_1_encoded_content);

	// Check that the sc_content Term in the Event was unchanged.
	BOOST_CHECK_EQUAL(ISO_8859_1_encoded_content, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUtf16CharsetEventContainsUtf8ContentTerm) {
	// Send a Content-Type header with the charset specified.
	generateEvent("Content-Type: text/html; charset=utf-16", UTF16_ENCODED_TEST_STRING_1);

	// Check that the sc_content Term in the Event was converted from UTF-16 to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUnknownContentEncodingAndUtf16CharsetEventContainsOriginalContentTerm) {
	// content encoded with unknown compression algorithm "smash"
	const std::string smashed_utf16_content = "cmq437ghqnuv5qoigu";

	// Send a Content-Type header with charset=utf-16 and a Content-Encoding header with value "smash".
	generateEvent("Content-Type: text/html; charset=utf-16", smashed_utf16_content, "smash");

	// Check that the resulting Event has an sc-content Term containing the still smashed content.
	// (Note: an error should be logged - to see it, run the tests with argument '-v'.)
	BOOST_CHECK_EQUAL(smashed_utf16_content, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithShiftJISCharsetEventContainsUtf8ContentTerm) {
	// Send a Content-Type header with the charset specified.
	generateEvent("Content-Type: text/html; charset=Shift_JIS", SHIFT_JIS_ENCODED_TEST_STRING_1);

	// Check that the sc_content Term in the Event was converted from Shift_JIS to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithEucJpCharsetEventContainsUtf8ContentTerm) {
	// Send a Content-Type header with the charset specified.
	generateEvent("Content-Type: text/html; charset=EUC-JP", EUC_JP_ENCODED_TEST_STRING_1);

	// Check that the sc_content Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingAndEucJpCharsetEventContainsUtf8ContentTerm) {
	// Send a Content-Type header with the charset specified and send gzipped content.
	generateEvent("Content-Type: text/html; charset=eUc-jP", gzipEncode(EUC_JP_ENCODED_TEST_STRING_1), "gzip");

	// Check that the sc_content Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingAndUtf16CharsetEventContainsUtf8ContentTerm) {
	// Send a Content-Type header with the charset specified and send gzipped content.
	generateEvent("Content-Type: text/html; charset=UTF-16", gzipEncode(UTF16_ENCODED_TEST_STRING_1), "gzip");

	// Check that the sc_content Term in the Event was converted from UTF-16 to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUnknownCharsetEventContainsOriginalContentTerm) {
	// Test string 1 encoded with the unknown Betelgeuse-III encoding.
	const std::string BETELGEUSE_III_ENCODED_TEST_STRING_1 = "Take me to your leader.";

	// Send a Content-Type header with charset=Betelgeuse-III.
	generateEvent("Content-Type: text/html; charset=Betelgeuse-III", BETELGEUSE_III_ENCODED_TEST_STRING_1);

	// Check that the resulting Event has an sc-content Term containing the original Betelgeuse-III encoded content.
	// (Note: an error should be logged - to see it, run the tests with argument '-v'.)
	BOOST_CHECK_EQUAL(BETELGEUSE_III_ENCODED_TEST_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}

/*
// TODO: Currently, this test fails, because HTTPProtocol::ExtractionRule::processContent() is all-or-nothing:
// if either decoding or conversion fails, it uses the original content.  It would probably be better if it used
// the decoded (i.e. uncompressed) content when decoding succeeds and conversion fails, but that would require
// substantial refactoring of processContent().

BOOST_AUTO_TEST_CASE(checkWithContentEncodingAndUnknownCharsetEventContainsOriginalUncompressedContentTerm) {
	// Test string 1 encoded with the unknown Betelgeuse-III encoding.
	const std::string BETELGEUSE_III_ENCODED_TEST_STRING_1 = "Take me to your leader.";

	// Send a Content-Type header with charset=Betelgeuse-III and send gzipped content.
	generateEvent("Content-Type: text/html; charset=Betelgeuse-III", gzipEncode(BETELGEUSE_III_ENCODED_TEST_STRING_1), "gzip");

	// Check that the resulting Event has an sc-content Term containing the original Betelgeuse-III encoded content.
	// (Note: an error should be logged - to see it, run the tests with argument '-v'.)
	BOOST_CHECK_EQUAL(BETELGEUSE_III_ENCODED_TEST_STRING_1, m_e.back()->getString(m_sc_content_term_ref));
}
*/

BOOST_AUTO_TEST_CASE(checkWithEucJpCharsetEventContainsUtf8PageTitle) {
	// Make EUC-JP encoded content containing a <title> equal to test string 1.
	// This works because the EUC-JP encoding of US-ASCII characters is the same as US-ASCII.
	const std::string content_with_title = "<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>some more content";

	// Send a Content-Type header with charset=euc-jp.
	generateEvent("Content-Type: text/html; charset=euc-jp", content_with_title);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingAndEucJpCharsetEventContainsUtf8PageTitle) {
	const std::string content_with_title = "<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>some more content";

	// Send a Content-Type header with charset=euc-jp and send gzipped content.
	generateEvent("Content-Type: text/html; charset=euc-jp", gzipEncode(content_with_title), "gzip");

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkRequestWithContentWithEucJpCharset) {
	const std::string euc_jp_encoded_query = "Pet=" + EUC_JP_ENCODED_TEST_STRING_1;

	std::ostringstream oss;
	oss << "POST / HTTP/1.1" << CRLF
		<< "Content-Type: application/x-www-form-urlencoded; charset=euc-jp" << CRLF
		<< "Content-Length: " << euc_jp_encoded_query.length() << CRLF << CRLF
		<< euc_jp_encoded_query;
	std::string request = oss.str();
	boost::system::error_code ec;
	m_rc = m_protocol_ptr->readNext(true, request.c_str(), request.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(!ec);

	std::string response = "HTTP/1.1 204 " + CRLF + CRLF;
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e, ec);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(!ec);
	BOOST_REQUIRE(!m_e.empty());
	BOOST_REQUIRE(m_e.back().get());

	// Check that the resulting Event has a cs-content Term containing the UTF-8 encoding of the query.
	const std::string utf8_encoded_query = "Pet=" + UTF8_ENCODED_TEST_STRING_1;
	BOOST_CHECK_EQUAL(utf8_encoded_query, m_e.back()->getString(m_cs_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkMetaHttpEquivContentTypeCharset) {
	// Make the content for an http response with an EUC-JP encoded title and with the charset in a meta http-equiv tag.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=euc-jp\">" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkMetaHttpEquivContentTypeCharsetSelfClosing) {
	// Make the content for an http response with an EUC-JP encoded title and with the charset in a self closing meta http-equiv tag.
	// Note that while some references say that meta tags should not be self closing, in the wild, many are.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=euc-jp\" />" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkMetaCharset) {
	// Make the content for an http response with an EUC-JP encoded title and with the charset in a meta charset tag.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta charset=euc-jp\">" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkMetaCharsetSelfClosing) {
	// Make the content for an http response with an EUC-JP encoded title and with the charset in a self closing meta charset tag.
	// Note that while some references say that meta tags should not be self closing, in the wild, many are.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta charset=euc-jp\" />" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkMetaHttpEquivContentTypeCharsetWithGzip) {
	// Make the content for an http response with an EUC-JP encoded title and with the charset in a meta charset tag.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=euc-jp\">" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified and send gzipped content.
	generateEvent("Content-Type: text/html", gzipEncode(content), "gzip");

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkHttpHeaderCharsetHasPrecedenceOverMetaCharset) {
	// Make the content for an http response with an EUC-JP encoded title and the WRONG charset in a meta charset tag.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta charset=utf-16\">" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with EUC-JP specified.
	generateEvent("Content-Type: text/html; charset=euc-jp", content);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkContentTypeHeaderWithMultipleParameters) {
	// Make the content for an http response with an EUC-JP encoded title.
	const std::string content = 
		"<html><head>" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with EUC-JP specified and another parameter after that.
	// TODO: This is not a realistic header.  I want to replace this with something better,
	// but since this test was inspired by an actual case where the charset was set to
	// "utf-8; type=feed" in HTTPProtocol, I'm leaving it in for now.
	generateEvent("Content-Type: text/html; charset=euc-jp; type=feed", content);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkMetaHttpEquivContentTypeWithMultipleParameters) {
	// Make the content for an http response with an EUC-JP encoded title.
	// TODO: See comment in checkContentTypeHeaderWithMultipleParameters.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=euc-jp; type=feed\">" + CRLF + 
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkUppercaseMetaHttpEquiv) {
	// Make the content for an http response with an EUC-JP encoded title and with the charset in a META HTTP-EQUIV tag.
	const std::string content = 
		"<html><head>" + CRLF +
		"<META HTTP-EQUIV=\"Content-Type\" content=\"text/html; charset=euc-jp\">" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture class used for testing Protocol "HTTP (no content)"
class HTTPNoContentProtocol_F : public StandardProtocolFactory_F  {
public:
	HTTPNoContentProtocol_F() : StandardProtocolFactory_F() {
		m_protocol_ptr = getProtocol("37A7DC3E-EE7E-4420-B0DD-CADE20DEF840");
	}

	~HTTPNoContentProtocol_F() {
	}
};

BOOST_FIXTURE_TEST_SUITE(HTTPNoContentProtocol_S, HTTPNoContentProtocol_F)

// Contrast with HTTPFullContentProtocol_S::checkWithEucJpCharsetEventContainsUtf8PageTitle().
// Conversion should not occur due to <AllowUtf8Conversion>false</AllowUtf8Conversion> in config.
BOOST_AUTO_TEST_CASE(checkWithEucJpCharsetEventContainsEucJpPageTitle) {
	// Make EUC-JP encoded content containing a <title> equal to test string 1.
	// This works because the EUC-JP encoding of US-ASCII characters is the same as US-ASCII.
	const std::string content_with_title = "<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>some more content";

	// Send a Content-Type header with charset=euc-jp.
	generateEvent("Content-Type: text/html; charset=euc-jp", content_with_title);

	// Check that the title Term in the Event was NOT converted from EUC-JP to UTF-8, and
	// that bytes that are invalid UTF-8 were replaced.
	BOOST_CHECK_EQUAL(CLEANSED_EUC_JP_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

// Contrast with HTTPFullContentProtocol_S::checkMetaHttpEquivContentTypeCharset().
// Conversion should not occur due to <AllowUtf8Conversion>false</AllowUtf8Conversion> in config.
BOOST_AUTO_TEST_CASE(checkMetaHttpEquivContentTypeCharset) {
	// Make the content for an http response with an EUC-JP encoded title and with the charset in a meta http-equiv tag.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=euc-jp\">" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was NOT converted from EUC-JP to UTF-8, and
	// that bytes that are invalid UTF-8 were replaced.
	BOOST_CHECK_EQUAL(CLEANSED_EUC_JP_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture class used for testing one-off HTTPProtocol configurations
class HTTPCustomProtocol_F : public StandardProtocolFactory_F  {
public:
	HTTPCustomProtocol_F() : StandardProtocolFactory_F(), m_config_ptr(NULL) {
		m_config_str_head = 
			"<PionConfig><Protocol>"
			"	<Plugin>HTTPProtocol</Plugin>"
			"	<EventType>urn:vocab:clickstream#http-event</EventType>";

		m_config_str_tail = 
			"	<Extract term=\"urn:vocab:clickstream#page-title\">"
			"		<Source>sc-content</Source>"
			"		<Match>(?i)&lt;TITLE&gt;\\s*(.*?)\\s*&lt;/TITLE&gt;</Match>"
			"		<Format>$1</Format>"
			"	</Extract>"
			"</Protocol></PionConfig>";
	}

	~HTTPCustomProtocol_F() {
		xmlFreeNodeList(m_config_ptr);
	}

	ProtocolPtr createProtocol(const std::string& config_str) {
		m_config_ptr = ConfigManager::createResourceConfig("Protocol", config_str.c_str(), config_str.size());
		std::string id = addProtocol(m_config_ptr);
		BOOST_REQUIRE(! id.empty());
		return getProtocol(id);
	}

	std::string m_config_str_head;
	std::string m_config_str_tail;
	xmlNodePtr m_config_ptr;
};

BOOST_FIXTURE_TEST_SUITE(HTTPCustomProtocol_S, HTTPCustomProtocol_F)

BOOST_AUTO_TEST_CASE(checkMetaTagIgnoredWhenAllowSearchingIsFalse) {
	m_protocol_ptr = createProtocol(
		m_config_str_head + 
		"	<AllowUtf8Conversion>true</AllowUtf8Conversion>"
		"	<AllowSearchingContentForCharset>false</AllowSearchingContentForCharset>"
		+ m_config_str_tail);

	// Make the content for an http response with an EUC-JP encoded title and with the charset in a meta http-equiv tag.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=euc-jp\">" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was NOT converted from EUC-JP to UTF-8, and
	// that bytes that are invalid UTF-8 were replaced.
	BOOST_CHECK_EQUAL(CLEANSED_EUC_JP_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkContentTypeHeaderNotIgnoredWhenAllowSearchingIsFalse) {
	m_protocol_ptr = createProtocol(
		m_config_str_head + 
		"	<AllowUtf8Conversion>true</AllowUtf8Conversion>"
		"	<AllowSearchingContentForCharset>false</AllowSearchingContentForCharset>"
		+ m_config_str_tail);

	// Make EUC-JP encoded content containing a <title> equal to test string 1.
	// This works because the EUC-JP encoding of US-ASCII characters is the same as US-ASCII.
	const std::string content_with_title = "<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>some more content";

	// Send a Content-Type header with charset=euc-jp.
	generateEvent("Content-Type: text/html; charset=euc-jp", content_with_title);

	// Check that the title Term in the Event was converted from EUC-JP to UTF-8.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

// Check that if AllowUtf8Conversion is false, a meta tag charset does not trigger conversion
// to UTF-8 even if AllowSearchingContentForCharset is true.
BOOST_AUTO_TEST_CASE(checkAllowSearchingIgnoredWhenAllowUtf8ConversionIsFalse) {
	m_protocol_ptr = createProtocol(
		m_config_str_head + 
		"	<AllowUtf8Conversion>false</AllowUtf8Conversion>"
		"	<AllowSearchingContentForCharset>true</AllowSearchingContentForCharset>"
		+ m_config_str_tail);

	// Make the content for an http response with an EUC-JP encoded title and with the charset in a meta http-equiv tag.
	const std::string content = 
		"<html><head>" + CRLF +
		"<meta http-equiv=\"Content-Type\" content=\"text/html; charset=euc-jp\">" + CRLF +
		"<title>" + EUC_JP_ENCODED_TEST_STRING_1 + "</title>" + CRLF +
		"</head><body>blah blah</body></html>" + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/html", content);

	// Check that the title Term in the Event was NOT converted from EUC-JP to UTF-8, and
	// that bytes that are invalid UTF-8 were replaced.
	BOOST_CHECK_EQUAL(CLEANSED_EUC_JP_ENCODED_TEST_STRING_1, m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkRuleDisabledAfterRegexException) {
#if defined(PION_USE_LOG4CPLUS)
	// Set up XmlLogService, clear existing Events, and set maximum length of Message content to 200 (default is 100).
	pion::server::PlatformConfig platform_cfg;
	PionPlatformUnitTest::setupXmlLogService(platform_cfg);
	PionPlatformUnitTest::sendRequestAndGetResponse(platform_cfg, pion::net::HTTPRequest("/xmllog?ack=*"), "DELETE");
	PionPlatformUnitTest::sendRequestAndGetResponse(platform_cfg, pion::net::HTTPRequest("/xmllog?truncate=200"));
#endif

	// Make a Protocol with a problematic regex and some content that will cause the regex to fail.
	// See https://svn.boost.org/trac/boost/ticket/620.
	// sc-raw-content is used so that boost::regex is used instead of boost::u32regex.
	// See checkComparisonDisabledAfterRegexException for a test of a boost::u32regex. 
	m_protocol_ptr = createProtocol(
		m_config_str_head + 
		"	<Extract term=\"urn:vocab:clickstream#comment\">"
		"		<Source>sc-raw-content</Source>"
		"		<Match>(a*ba*)*c</Match>"
		"		<Format>$1</Format>"
		"	</Extract>"
		+ m_config_str_tail);
	const std::string content = 
		"<html><head>" + CRLF +
		"<title>Title 1</title>" + CRLF +
		"</head><body>abababababababababababab</body></html>" + CRLF;

	// Ask the Protocol to process a response with the above content and generate an Event.
	generateEvent("Content-Type: text/html", content);

#if defined(PION_USE_LOG4CPLUS)
	// Use XmlLogService to confirm that the expected error and warning were logged.
	std::vector<std::string> messages;
	PionPlatformUnitTest::getXmlLogMessages(platform_cfg, messages);
	BOOST_REQUIRE_EQUAL(messages.size(), 2U);
	std::string expected_error_message = 
		"uri_str: / - Regex search failed: regex = (a*ba*)*c";
	BOOST_CHECK_EQUAL(expected_error_message, messages[0]);
	std::string expected_warning_message = "Extraction rule has been disabled: regex = (a*ba*)*c";
	BOOST_CHECK_EQUAL(expected_warning_message, messages[1]);
#endif

	// Check that the second extraction rule (whose regex is not problematic) worked.
	BOOST_CHECK_EQUAL("Title 1", m_e.back()->getString(m_page_title_term_ref));

	// Ask the Protocol to process another (identical) response.
	m_e.clear();
	generateEvent("Content-Type: text/html", content);

#if defined(PION_USE_LOG4CPLUS)
	// Check that the problematic regex was disabled by confirming that no additional error was logged.
	PionPlatformUnitTest::getXmlLogMessages(platform_cfg, messages);
	BOOST_CHECK_EQUAL(messages.size(), 2U);
#endif

	// Confirm that the second extraction rule still worked.
	BOOST_CHECK_EQUAL("Title 1", m_e.back()->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkExtractionRuleTruncation) {
	m_protocol_ptr = createProtocol(
		m_config_str_head + 
		"	<Extract term=\"urn:vocab:test#blob-1\">"
		"		<Source>sc-content</Source>"
		"		<MaxSize>4</MaxSize>"
		"	</Extract>"
		"	<Extract term=\"urn:vocab:test#blob-2\">"
		"		<Source>sc-content</Source>"
		"		<MaxSize>5</MaxSize>"
		"	</Extract>"
		"	<Extract term=\"urn:vocab:test#blob-3\">"
		"		<Source>sc-content</Source>"
		"		<MaxSize>6</MaxSize>"
		"	</Extract>"
		+ m_config_str_tail);

	pion::platform::Vocabulary::TermRef	blob_1_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:test#blob-1");
	pion::platform::Vocabulary::TermRef	blob_2_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:test#blob-2");
	pion::platform::Vocabulary::TermRef	blob_3_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:test#blob-3");

	// UTF8_ENCODED_TEST_STRING_1 has a 3-byte code point starting at offset 3.
	// Thus, if MaxSize is 4 or 5, we expect the result to be truncated to length 3.
	const std::string content = UTF8_ENCODED_TEST_STRING_1 + CRLF;

	// Send a Content-Type header with no charset specified.
	generateEvent("Content-Type: text/plain", content);

	// Check that when MaxSize specified an offset in the middle of a code point, the string was truncated to the start of that code point.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1.substr(0, 3), m_e.back()->getString(blob_1_term_ref));
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1.substr(0, 3), m_e.back()->getString(blob_2_term_ref));

	// Check that when MaxSize specified an offset on a code point boundary, the string was truncated to the length specified by MaxSize.
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1.substr(0, 6), m_e.back()->getString(blob_3_term_ref));
}

BOOST_AUTO_TEST_CASE(checkCharBasedExtractionRuleRegexAgainstNonAsciiChar) {
	// Create a protocol with an extraction rule with a regex that matches exactly one "word" character.
	m_protocol_ptr = createProtocol(
		m_config_str_head + 
		"	<Extract term=\"urn:vocab:test#blob-1\">"
		"		<Source>sc-content</Source>"
		"		<Match>x=(\\w);</Match>"
		"		<Format>[$1]</Format>"
		"	</Extract>"
		+ m_config_str_tail);

	// Create a UTF-8 string that should match the regex above, where the character we'd like to match consists of two bytes,
	// so that boost::u32regex is required for the match to succeed.
	const std::string content = "x=α;" + CRLF;

	// Send a Content-Type header with charset=utf-8.
	generateEvent("Content-Type: text/html; charset=utf-8", content);

	// Check that the extraction rule succeeded.
	pion::platform::Vocabulary::TermRef	blob_1_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:test#blob-1");
	BOOST_CHECK_EQUAL("[α]", m_e.back()->getString(blob_1_term_ref));
}

// tests HTTPProtocol::ExtractionRule::process()
BOOST_AUTO_TEST_CASE(checkNonContentSourceExtractionRules) {
	// Create a protocol with several extraction rules with source 'query'.
	m_protocol_ptr = createProtocol(
		m_config_str_head + 
		"	<Extract term=\"urn:vocab:test#blob-1\">"
		"		<Source>query</Source>"
		"		<Match>\\d</Match>"
		"		<Name>a</Name>"
		"	</Extract>"
		"	<Extract term=\"urn:vocab:test#blob-2\">"
		"		<Source>query</Source>"
		"		<Match>\\d.*</Match>"
		"		<Name>b</Name>"
		"		<Format>[$0]</Format>"
		"	</Extract>"
		"	<Extract term=\"urn:vocab:test#blob-3\">"
		"		<Source>query</Source>"
		"		<Match>\\d</Match>"
		"		<Name>c</Name>"
		"	</Extract>"
		+ m_config_str_tail);

	// Generate an event with several query parameters with invalid UTF-8 characters.
	const std::string FE(1, (char)0xFE); // One byte string where the byte is invalid anywhere in a UTF-8 sequence.
	m_minimal_request = "GET /xyz?a=Z" + FE + "Z&b=2" + FE + "&c=" + FE + "3 HTTP/1.1" + CRLF + "Host: X" + CRLF + CRLF;
	generateEvent("Content-Type: text/html", "nothing special");

	// Value for query key 'a' doesn't match rule, so getString() should return false.
	pion::platform::Vocabulary::TermRef	blob_1_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:test#blob-1");
	std::string str;
	BOOST_CHECK(! m_e.back()->getString(blob_1_term_ref, str));

	// Check that getString() returns the expected values for blob-2 and blob-3, with the invalid characters replaced.
	pion::platform::Vocabulary::TermRef	blob_2_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:test#blob-2");
	BOOST_CHECK_EQUAL("[2" + UTF8_REPL_CHAR + "]", m_e.back()->getString(blob_2_term_ref));
	pion::platform::Vocabulary::TermRef	blob_3_term_ref = m_vocab_mgr.getVocabulary()->findTerm("urn:vocab:test#blob-3");
	BOOST_CHECK_EQUAL(UTF8_REPL_CHAR + "3", m_e.back()->getString(blob_3_term_ref));
}

BOOST_AUTO_TEST_SUITE_END()
