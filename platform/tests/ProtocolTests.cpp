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
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/iostreams/filter/gzip.hpp>
#include <boost/iostreams/compose.hpp>
#include <boost/iostreams/copy.hpp>
#include "../protocols/HTTPProtocol.hpp"

using namespace pion;
using namespace pion::platform;

static const std::string CRLF = pion::net::HTTPTypes::STRING_CRLF;


/// external functions defined in PionPlatformUnitTests.cpp
extern void cleanup_vocab_config_files(void);


/// cleans up config files relevant to Protocols in the working directory
void cleanup_protocol_config_files(bool copy_protocol_config_file)
{
	cleanup_vocab_config_files();

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
	}

	~StandardProtocolFactory_F() {
	}

	static VocabularyManager m_vocab_mgr;
	static bool m_config_loaded;
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

static const char UTF8_ENCODED_TEST_STRING_1[] = {
		0x63,								// 'c'
		0x61,								// 'a'
		0x74,								// 't'
		(char)0xE7, (char)0x8C,	(char)0xAB,	// UTF-8 encoding of U+732B
		(char)0xEF, (char)0xBC,	(char)0xAF,	// UTF-8 encoding of U+FF2F
		(char)0xEF, (char)0xBC,	(char)0xAB,	// UTF-8 encoding of U+FF2B
		0x00 };

// See http://demo.icu-project.org/icu-bin/convexp?conv=ibm-33722_P12A_P12A-2004_U2 for EUC-JP tables.
static const char EUC_JP_ENCODED_TEST_STRING_1[] = {
	0x63,				// 'c'
	0x61,				// 'a'
	0x74,				// 't'
	(char)0xC7, 0xAD,	// EUC-JP encoding of U+732B (simplified Chinese character for "cat")
	(char)0xA3, 0xCF,	// EUC-JP encoding of U+FF2F (FULLWIDTH LATIN CAPITAL LETTER O)
	(char)0xA3, 0xCB};	// EUC-JP encoding of U+FF2B (FULLWIDTH LATIN CAPITAL LETTER K)


/// fixture class used for testing Protocol "HTTP (full content)"
class HTTPFullContentProtocol_F : public StandardProtocolFactory_F  {
public:
	HTTPFullContentProtocol_F() : StandardProtocolFactory_F() {
		m_protocol_ptr = getProtocol("593f044a-ac60-11dd-aba3-001cc02bd66b");

		m_minimal_request = "GET / HTTP/1.1" + CRLF + "Host: X" + CRLF + CRLF;

		// We're not testing timestamps here, so use anything that works.
		m_t0 = boost::posix_time::ptime();

		m_cs_content_term_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clickstream#cs-content");
		m_sc_content_term_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clickstream#sc-content");
		m_page_title_term_ref = m_vocab_mgr.getVocabulary().findTerm("urn:vocab:clickstream#page-title");
	}

	~HTTPFullContentProtocol_F() {
	}

	std::string gzipEncode(std::string content) {
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

	std::string m_minimal_request;
	boost::tribool m_rc;
	EventPtr m_e;
	pion::platform::ProtocolPtr m_protocol_ptr;
	boost::posix_time::ptime m_t0;
	pion::platform::Vocabulary::TermRef	m_cs_content_term_ref;
	pion::platform::Vocabulary::TermRef	m_sc_content_term_ref;
	pion::platform::Vocabulary::TermRef	m_page_title_term_ref;
};

BOOST_FIXTURE_TEST_SUITE(HTTPFullContentProtocol_S, HTTPFullContentProtocol_F)

BOOST_AUTO_TEST_CASE(checkReadNextRequestAndResponse) {
	bool is_request;
	m_rc = m_protocol_ptr->readNext(is_request = true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));
	BOOST_CHECK(m_e.get() == NULL);

	std::string response = "HTTP/1.1 200 " + CRLF + "Content-Type: text/html" + CRLF + "Content-Length: 10" + CRLF + CRLF + "0123456789";
	m_rc = m_protocol_ptr->readNext(is_request = false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK(m_e.get());
}

BOOST_AUTO_TEST_CASE(checkEventContainsContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::string orig_sc_content = "0123456789";
	std::string response = "HTTP/1.1 200 " + CRLF + "Content-Type: text/html" + CRLF + "Content-Length: 10" + CRLF + CRLF + orig_sc_content;
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	BOOST_CHECK_EQUAL(orig_sc_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkEventContainsContentPageTitle) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::string orig_sc_content = "<title>My Home Page</title>some content";
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html" << CRLF
		<< "Content-Length: " << orig_sc_content.length() << CRLF << CRLF
		<< orig_sc_content;
	std::string response = oss.str();
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	BOOST_CHECK_EQUAL("My Home Page", m_e->getString(m_page_title_term_ref));
	BOOST_CHECK_EQUAL(orig_sc_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingEventContainsContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::string orig_content = "0123456789";
	std::string gzipped_content = gzipEncode(orig_content);

	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html" << CRLF
		<< "Content-Encoding: gzip" << CRLF
		<< "Content-Length: " << gzipped_content.length() << CRLF << CRLF
		<< gzipped_content;
	std::string response = oss.str();
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	BOOST_CHECK_EQUAL(orig_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUnknownContentEncodingEventContainsOriginalContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	// Simulate a response with content encoded with unknown compression algorithm "smash".
	char smashed_content[] = "d8kkdsj8722m";
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html" << CRLF
		<< "Content-Encoding: smash" << CRLF
		<< "Content-Length: " << sizeof(smashed_content) << CRLF << CRLF;
	oss.write(smashed_content, sizeof(smashed_content));
	std::string response = oss.str();

	// Process the response and check that the resulting Event has an sc-content Term containing the still smashed content.
	// (Note: an error should be logged - to see it, run the tests with argument '-v'.)
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK_EQUAL(smashed_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingEventContainsLongContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::ifstream log_file((LOG_FILE_DIR + "large.json").c_str());
	std::ostringstream oss0;
	char c;
	while (log_file.get(c)) oss0.put(c);
	std::string orig_content = oss0.str();
	std::string gzipped_content = gzipEncode(orig_content);

	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html" << CRLF
		<< "Content-Encoding: gzip" << CRLF
		<< "Content-Length: " << gzipped_content.length() << CRLF << CRLF
		<< gzipped_content;
	std::string response = oss.str();
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	BOOST_CHECK_EQUAL(orig_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUtf8CompatCharsetEventContainsContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::string orig_sc_content = "0123456789";
	std::string response = "HTTP/1.1 200 " + CRLF + "Content-Type: text/html; charset=ISO-8859-1" + CRLF + "Content-Length: 10" + CRLF + CRLF + orig_sc_content;
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	BOOST_CHECK_EQUAL(orig_sc_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkRequestWithContent) {
	std::string orig_cs_content = "Color=Red";
	std::string request = "POST / HTTP/1.1" + CRLF + "Content-Type: application/x-www-form-urlencoded" + CRLF 
						+ "Content-Length: 9" + CRLF + CRLF + orig_cs_content;
	m_rc = m_protocol_ptr->readNext(true, request.c_str(), request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::string orig_sc_content = "0123456789";
	std::string response = "HTTP/1.1 200 " + CRLF + "Content-Type: text/html" + CRLF + "Content-Length: 10" + CRLF + CRLF + orig_sc_content;
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	BOOST_CHECK_EQUAL(orig_cs_content, m_e->getString(m_cs_content_term_ref));
	BOOST_CHECK_EQUAL(orig_sc_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUtf16CharsetEventContainsUtf8ContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	const char UTF16_ENCODED_TEST_STRING_1[] = {
		0xFF, 0xFE,			// BOM (byte order marker)
		0x63, 0x00,			// 'c'
		0x61, 0x00,			// 'a'
		0x74, 0x00,			// 't'
		0x2B, 0x73,			// U+732B (simplified Chinese character for "cat")
		0x2F, (char)0xFF,	// U+FF2F (FULLWIDTH LATIN CAPITAL LETTER O)
		0x2B, (char)0xFF};	// U+FF2B (FULLWIDTH LATIN CAPITAL LETTER K)

	// Simulate a response with content set to test string 1 using UTF-16 encoding.
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html; charset=utf-16" << CRLF
		<< "Content-Length: " << sizeof(UTF16_ENCODED_TEST_STRING_1) << CRLF << CRLF;
	oss.write(UTF16_ENCODED_TEST_STRING_1, sizeof(UTF16_ENCODED_TEST_STRING_1));
	std::string response = oss.str();

	// Process the response and check that the resulting Event has an sc-content Term containing the UTF-8 encoding of test string 1.
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUnknownContentEncodingAndUtf16CharsetEventContainsOriginalContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	// Simulate a response with content encoded with unknown compression algorithm "smash".
	char smashed_utf16_content[] = "cmq437ghqnuv5qoigu";
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html; charset=utf-16" << CRLF
		<< "Content-Encoding: smash" << CRLF
		<< "Content-Length: " << sizeof(smashed_utf16_content) << CRLF << CRLF;
	oss.write(smashed_utf16_content, sizeof(smashed_utf16_content));
	std::string response = oss.str();

	// Process the response and check that the resulting Event has an sc-content Term containing the still smashed content.
	// (Note: an error should be logged - to see it, run the tests with argument '-v'.)
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK_EQUAL(smashed_utf16_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithShiftJISCharsetEventContainsUtf8ContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	// See http://demo.icu-project.org/icu-bin/convexp?conv=ibm-943_P15A-2003 for Shift_JIS tables.
	const char SHIFT_JIS_ENCODED_TEST_STRING_1[] = {
		0x63,				// 'c'
		0x61,				// 'a'
		0x74,				// 't'
		(char)0x94, 0x4C,	// Shift_JIS encoding of U+732B (simplified Chinese character for "cat")
		(char)0x82, 0x6E,	// Shift_JIS encoding of U+FF2F (FULLWIDTH LATIN CAPITAL LETTER O)
		(char)0x82, 0x6A};	// Shift_JIS encoding of U+FF2B (FULLWIDTH LATIN CAPITAL LETTER K)

	// Simulate a response with content set to test string 1 using Shift_JIS encoding.
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html; charset=Shift_JIS" << CRLF
		<< "Content-Length: " << sizeof(SHIFT_JIS_ENCODED_TEST_STRING_1) << CRLF << CRLF;
	oss.write(SHIFT_JIS_ENCODED_TEST_STRING_1, sizeof(SHIFT_JIS_ENCODED_TEST_STRING_1));
	std::string response = oss.str();

	// Process the response and check that the resulting Event has an sc-content Term containing the UTF-8 encoding of test string 1.
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithEucJpCharsetEventContainsUtf8ContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	// Simulate a response with content set to test string 1 using EUC-JP encoding.
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html; charset=euc-jp" << CRLF
		<< "Content-Length: " << sizeof(EUC_JP_ENCODED_TEST_STRING_1) << CRLF << CRLF;
	oss.write(EUC_JP_ENCODED_TEST_STRING_1, sizeof(EUC_JP_ENCODED_TEST_STRING_1));
	std::string response = oss.str();

	// Process the response and check that the resulting Event has an sc-content Term containing the UTF-8 encoding of test string 1.
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingAndEucJpCharsetEventContainsUtf8ContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::string gzipped_content = gzipEncode(EUC_JP_ENCODED_TEST_STRING_1);

	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html; charset=euc-jp" << CRLF
		<< "Content-Encoding: gzip" << CRLF
		<< "Content-Length: " << gzipped_content.length() << CRLF << CRLF
		<< gzipped_content;
	std::string response = oss.str();
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithUnknownCharsetEventContainsOriginalContentTerm) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	// Simulate a response with content set to test string 1 using Betelgeuse-III encoding.
	char betelgeuse_iii_encoded_content[] = "Take me to your leader.";
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html; charset=Betelgeuse-III" << CRLF
		<< "Content-Length: " << sizeof(betelgeuse_iii_encoded_content) << CRLF << CRLF;
	oss.write(betelgeuse_iii_encoded_content, sizeof(betelgeuse_iii_encoded_content));
	std::string response = oss.str();

	// Process the response and check that the resulting Event has an sc-content Term containing the Betelgeuse-III encoding of test string 1.
	// (Note: an error should be logged - to see it, run the tests with argument '-v'.)
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK_EQUAL(betelgeuse_iii_encoded_content, m_e->getString(m_sc_content_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithEucJpCharsetEventContainsUtf8PageTitle) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	// Simulate a response with EUC-JP encoded content containing a <title> equal to test string 1.
	int content_length = strlen("<title>") + sizeof(EUC_JP_ENCODED_TEST_STRING_1) + strlen("</title>more content");
	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html; charset=euc-jp" << CRLF
		<< "Content-Length: " << content_length << CRLF << CRLF
		<< "<title>";
	oss.write(EUC_JP_ENCODED_TEST_STRING_1, sizeof(EUC_JP_ENCODED_TEST_STRING_1));
	oss << "</title>more content";
	std::string response = oss.str();

	// Process the response and check that the resulting Event has a page-title Term containing the UTF-8 encoding of test string 1.
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkWithContentEncodingAndEucJpCharsetEventContainsUtf8PageTitle) {
	m_rc = m_protocol_ptr->readNext(true, m_minimal_request.c_str(), m_minimal_request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::ostringstream content_with_title;
	content_with_title << "<title>";
	content_with_title.write(EUC_JP_ENCODED_TEST_STRING_1, sizeof(EUC_JP_ENCODED_TEST_STRING_1));
	content_with_title << "</title>some more content";
	std::string gzipped_content_with_title = gzipEncode(content_with_title.str());

	std::ostringstream oss;
	oss << "HTTP/1.1 200 " << CRLF
		<< "Content-Type: text/html; charset=euc-jp" << CRLF
		<< "Content-Encoding: gzip" << CRLF
		<< "Content-Length: " << gzipped_content_with_title.length() << CRLF << CRLF
		<< gzipped_content_with_title;
	std::string response = oss.str();
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	// Process the response and check that the resulting Event has a page-title Term containing the UTF-8 encoding of test string 1.
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING_1, m_e->getString(m_page_title_term_ref));
}

BOOST_AUTO_TEST_CASE(checkRequestWithContentWithEucJpCharset) {
	std::ostringstream euc_jp_encoded_query;
	euc_jp_encoded_query << "Pet=";
	euc_jp_encoded_query.write(EUC_JP_ENCODED_TEST_STRING_1, sizeof(EUC_JP_ENCODED_TEST_STRING_1));
	std::string encoded_content = euc_jp_encoded_query.str();

	std::ostringstream oss;
	oss << "POST / HTTP/1.1" << CRLF
		<< "Content-Type: application/x-www-form-urlencoded; charset=euc-jp" << CRLF
		<< "Content-Length: " << encoded_content.length() << CRLF << CRLF
		<< encoded_content;
	std::string request = oss.str();
	m_rc = m_protocol_ptr->readNext(true, request.c_str(), request.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(boost::indeterminate(m_rc));

	std::string response = "HTTP/1.1 204 " + CRLF + CRLF;
	m_rc = m_protocol_ptr->readNext(false, response.c_str(), response.length(), m_t0, m_t0, m_e);
	BOOST_CHECK(m_rc == true);

	// Check that the resulting Event has a cs-content Term containing the UTF-8 encoding of the query.
	std::string utf8_encoded_query = std::string("Pet=") + UTF8_ENCODED_TEST_STRING_1;
	BOOST_CHECK_EQUAL(utf8_encoded_query, m_e->getString(m_cs_content_term_ref));
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture used for testing HTTPProtocol's X-Fowarded-For header parsing
class HTTPProtocolForwardedForTests_F
{
public:
	HTTPProtocolForwardedForTests_F(void) {}
	~HTTPProtocolForwardedForTests_F(void) {}

	inline void checkParsingTrue(const std::string& header, const std::string& result) {
		std::string public_ip;
		BOOST_CHECK(pion::plugins::HTTPProtocol::parseForwardedFor(header, public_ip));
		BOOST_CHECK_EQUAL(public_ip, result);
	}

	inline void checkParsingFalse(const std::string& header) {
		std::string public_ip;
		BOOST_CHECK(! pion::plugins::HTTPProtocol::parseForwardedFor(header, public_ip));
	}
};

BOOST_FIXTURE_TEST_SUITE(HTTPProtocolForwardedForTests_S, HTTPProtocolForwardedForTests_F)

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderNoIP) {
	checkParsingFalse("myserver");
	checkParsingFalse("128.2.02f.12");
}

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderNotPublic) {
	checkParsingFalse("127.0.0.1");
	checkParsingFalse("10.0.2.1");
	checkParsingFalse("192.168.2.12");
	checkParsingFalse("172.16.2.1");
	checkParsingFalse("172.21.2.1");
	checkParsingFalse("172.30.2.1");
}

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderWithSpaces) {
	checkParsingTrue("   129.12.12.204   ", "129.12.12.204");
}

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderFirstNotIP) {
	checkParsingTrue(" phono , 129.2.31.24, 62.31.21.2", "129.2.31.24");
	checkParsingTrue("not_ipv4, 127.2.31.24, 62.31.21.2", "62.31.21.2");
}

BOOST_AUTO_TEST_CASE(checkParseForwardedForHeaderFirstNotPublic) {
	checkParsingTrue("127.0.0.1, 62.31.21.2", "62.31.21.2");
	checkParsingTrue("10.21.31.2, 172.15.31.2", "172.15.31.2");
	checkParsingTrue("192.168.2.12, 172.32.31.2", "172.32.31.2");
}

BOOST_AUTO_TEST_SUITE_END()
