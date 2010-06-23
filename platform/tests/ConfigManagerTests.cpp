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
#include <pion/platform/ConfigManager.hpp>
#include <boost/test/unit_test.hpp>
#include <cstring>

using namespace pion;
using namespace pion::platform;

BOOST_AUTO_TEST_CASE(checkResolveRelativePathThatIsRelative) {
	std::string relative_path("../ui");
#if defined(_MSC_VER)
	std::string base_path("c:\\opt\\pion\\config\\platform.xml");
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), "c:\\opt\\pion\\ui");
#else
	std::string base_path("/opt/pion/config/platform.xml");
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), "/opt/pion/ui");
#endif
}

BOOST_AUTO_TEST_CASE(checkResolveRelativePathThatIsNotRelative) {
#if defined(_MSC_VER)
	std::string base_path("c:\\opt\\pion\\config\\platform.xml");
	std::string relative_path("c:\\opt\\pion\\ui");
#else
	std::string base_path("/opt/pion/config/platform.xml");
	std::string relative_path("/opt/pion/ui");
#endif
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), relative_path);
}

BOOST_AUTO_TEST_CASE(checkCreateResourceConfigWithSomeValidInputs) {
	xmlNodePtr p(NULL);

	char buf1[] = "<PionConfig><resource1></resource1></PionConfig>";
	BOOST_CHECK_NO_THROW(p = ConfigManager::createResourceConfig("resource1", buf1, strlen(buf1)));
	BOOST_CHECK(p == NULL);

	char buf2[] = "<PionConfig><resource1>value1</resource1></PionConfig>";
	BOOST_CHECK_NO_THROW(p = ConfigManager::createResourceConfig("resource1", buf2, strlen(buf2)));
	BOOST_CHECK(p != NULL);
	BOOST_CHECK(p->children == NULL);

	char buf3[] = "<PionConfig><resource1><tag1></tag1></resource1></PionConfig>";
	BOOST_CHECK_NO_THROW(p = ConfigManager::createResourceConfig("resource1", buf3, strlen(buf3)));
	BOOST_CHECK(p != NULL);
	BOOST_CHECK(p->children == NULL);

	char buf4[] = "<PionConfig><resource1><tag1>value1</tag1></resource1></PionConfig>";
	BOOST_CHECK_NO_THROW(p = ConfigManager::createResourceConfig("resource1", buf4, strlen(buf4)));
	BOOST_CHECK(p != NULL);
	BOOST_CHECK(p->children != NULL);

	char buf5[] = "<PionConfig><resource1><tag1 attr=\"attr1\"></tag1></resource1></PionConfig>";
	BOOST_CHECK_NO_THROW(p = ConfigManager::createResourceConfig("resource1", buf5, strlen(buf5)));
	BOOST_CHECK(p != NULL);
	BOOST_CHECK(p->children == NULL);

	char buf6[] = "<PionConfig><resource1><tag1 attr1=\"1\" attr2=\"2\">value1</tag1></resource1></PionConfig>";
	BOOST_CHECK_NO_THROW(p = ConfigManager::createResourceConfig("resource1", buf6, strlen(buf6)));
	BOOST_CHECK(p != NULL);
	BOOST_CHECK(p->children != NULL);
}

BOOST_AUTO_TEST_CASE(checkCreateResourceConfigWithMissingConfigElement) {
	BOOST_CHECK_THROW(ConfigManager::createResourceConfig("resource1", NULL, 100), ConfigManager::BadXMLBufferException);

	BOOST_CHECK_THROW(ConfigManager::createResourceConfig("resource1", "", 0), ConfigManager::BadXMLBufferException);

	char buf2[] = "<otherTag></otherTag>";
	BOOST_CHECK_THROW(ConfigManager::createResourceConfig("resource1", buf2, strlen(buf2)), ConfigManager::MissingRootElementException);
}

BOOST_AUTO_TEST_CASE(checkCreateResourceConfigWithMissingResourceElement) {
	char buf[] = "<PionConfig></PionConfig>";
	BOOST_CHECK_THROW(ConfigManager::createResourceConfig("resource1", buf, strlen(buf)), ConfigManager::MissingResourceElementException);

	char buf2[] = "<PionConfig><otherTag></otherTag></PionConfig>";
	BOOST_CHECK_THROW(ConfigManager::createResourceConfig("resource1", buf2, strlen(buf2)), ConfigManager::MissingResourceElementException);
}

BOOST_AUTO_TEST_CASE(checkCreateResourceConfigWithIncompleteInput) {
	char buf[] = "<PionConfig><resource1></resource1>";
	BOOST_CHECK_THROW(ConfigManager::createResourceConfig("resource1", buf, strlen(buf)), ConfigManager::XMLBufferParsingException);
}

BOOST_AUTO_TEST_CASE(checkCreateResourceConfigWithBadlyFormedInput) {
	char buf[] = "<PionConfig><resource1<></resource1></PionConfig>";
	BOOST_CHECK_THROW(ConfigManager::createResourceConfig("resource1", buf, strlen(buf)), ConfigManager::XMLBufferParsingException);
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithAlphanumericString) {
	BOOST_CHECK_EQUAL("Freedom7", ConfigManager::xml_encode("Freedom7"));
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithAmpersand) {
	BOOST_CHECK_EQUAL("A&amp;P", ConfigManager::xml_encode("A&P"));
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithVariousSpecialXmlCharacters) {
	BOOST_CHECK_EQUAL("&quot;1&quot; &lt; &quot;2&quot; &amp;&amp; &apos;b&apos; &gt; &apos;a&apos;", ConfigManager::xml_encode("\"1\" < \"2\" && 'b' > 'a'"));
}

// UTF-8 replacement character
const std::string RC = "\xEF\xBF\xBD";

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithControlCharacters) {
	char cc_array_1[] = "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F";
	char cc_array_2[] = "\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F";
	std::string cc_str_1(cc_array_1, 16);
	std::string cc_str_2(cc_array_2, 16);
	std::string expected_output_1 = RC + RC + RC + RC + RC + RC + RC + RC + RC + "\x09\x0A" + RC + RC + "\x0D" + RC + RC;
	std::string expected_output_2 = RC + RC + RC + RC + RC + RC + RC + RC + RC + RC + RC + RC + RC + RC + RC + RC;

	BOOST_CHECK_EQUAL(expected_output_1, ConfigManager::xml_encode(cc_str_1));
	BOOST_CHECK_EQUAL(expected_output_2, ConfigManager::xml_encode(cc_str_2));
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithValidUtf8TwoByteSequences) {
	const char UTF8_ENCODED_TEST_CHAR_ARRAY[] = {
		(char)0xCE, (char)0xB1,				// UTF-8 encoding of U+03B1 (GREEK SMALL LETTER ALPHA)
		0x3D,								// '='
		0x31,								// '1'
		0x20,								// space
		(char)0xCE, (char)0xB2,				// UTF-8 encoding of U+03B2 (GREEK SMALL LETTER BETA)
		0x3D,								// '='
		0x32};								// '2'
	const std::string UTF8_ENCODED_TEST_STRING(UTF8_ENCODED_TEST_CHAR_ARRAY, sizeof(UTF8_ENCODED_TEST_CHAR_ARRAY));
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING, ConfigManager::xml_encode(UTF8_ENCODED_TEST_STRING));
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithValidUtf8ThreeByteSequences) {
	const char UTF8_ENCODED_TEST_CHAR_ARRAY[] = {
		(char)0xE2, (char)0x82, (char)0xA4,		// UTF-8 encoding of U+20A4 (LIRA SIGN)
		0x32,									// '2'
		0x3D,									// '='
		(char)0xE2, (char)0x82, (char)0xA8,		// UTF-8 encoding of U+20A8 (RUPEE SIGN)
		0x32};									// '3'
	const std::string UTF8_ENCODED_TEST_STRING(UTF8_ENCODED_TEST_CHAR_ARRAY, sizeof(UTF8_ENCODED_TEST_CHAR_ARRAY));
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING, ConfigManager::xml_encode(UTF8_ENCODED_TEST_STRING));
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithValidUtf8FourByteSequences) {
	char UTF8_ENCODED_TEST_CHAR_ARRAY[] = {
		(char)0xF0, (char)0x90, (char)0x82, (char)0x88,		// UTF-8 encoding of U+10088 (LINEAR B IDEOGRAM B107F SHE-GOAT)
		(char)0xE2, (char)0x82, (char)0xA8,					// UTF-8 encoding of U+2260 (NOT EQUAL TO)
		(char)0xF0, (char)0x90, (char)0x82, (char)0x89};	// UTF-8 encoding of U+10089 (LINEAR B IDEOGRAM B107M HE-GOAT)
	const std::string UTF8_ENCODED_TEST_STRING(UTF8_ENCODED_TEST_CHAR_ARRAY, sizeof(UTF8_ENCODED_TEST_CHAR_ARRAY));
	BOOST_CHECK_EQUAL(UTF8_ENCODED_TEST_STRING, ConfigManager::xml_encode(UTF8_ENCODED_TEST_STRING));
}

// Any isolated high byte (i.e. > x7F) is invalid, but they are invalid for a variety of reasons.
BOOST_AUTO_TEST_CASE(checkXmlEncodeWithInvalidSingleHighByte) {
	// These are invalid because the second byte is > x7F and is not allowed as the first byte of a UTF-8 multi-byte sequence.
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\x80="));
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xBF="));
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xC0="));
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xC1="));
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xF5="));
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xFF="));

	// These are invalid because the second byte is the first byte of a UTF-8 2-byte sequence, but isn't followed by a valid second byte.
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xC2="));
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xDF="));

	// These are invalid because the second byte is the first byte of a UTF-8 3-byte sequence, but isn't followed by a valid second byte.
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xE0="));
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xEF="));

	// These are invalid because the second byte is the first byte of a UTF-8 4-byte sequence, but isn't followed by a valid second byte.
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xF0="));
	BOOST_CHECK_EQUAL("=" + RC + "=", ConfigManager::xml_encode("=\xF4="));
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithInvalidTwoHighByteSequence) {
	// These are invalid because the second byte is the first byte of a UTF-8 2-byte sequence, but isn't followed by a valid second byte.
	BOOST_CHECK_EQUAL("=" + RC + RC + "=", ConfigManager::xml_encode("=\xC2\xC0="));
	BOOST_CHECK_EQUAL("=" + RC + RC + "=", ConfigManager::xml_encode("=\xDF\xFF="));

	// These are invalid because bytes 2 & 3 are the first and second bytes of a UTF-8 3-byte sequence, but aren't followed by a valid third byte.
	BOOST_CHECK_EQUAL("=" + RC + RC + "=", ConfigManager::xml_encode("=\xE0\x80="));
	BOOST_CHECK_EQUAL("=" + RC + RC + "=", ConfigManager::xml_encode("=\xEF\xBF="));

	// These are invalid because bytes 2 & 3 are the first and second bytes of a UTF-8 4-byte sequence, but aren't followed by a valid third byte.
	BOOST_CHECK_EQUAL("=" + RC + RC + "=", ConfigManager::xml_encode("=\xF0\x80="));
	BOOST_CHECK_EQUAL("=" + RC + RC + "=", ConfigManager::xml_encode("=\xF4\xBF="));
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithInvalidThreeHighByteSequence) {
	// These are invalid because bytes 2 & 3 are the first and second bytes of a UTF-8 3-byte sequence, but aren't followed by a valid third byte.
	BOOST_CHECK_EQUAL("=" + RC + RC + RC + "=", ConfigManager::xml_encode("=\xE0\x80\xC0="));
	BOOST_CHECK_EQUAL("=" + RC + RC + RC + "=", ConfigManager::xml_encode("=\xEF\xBF\xFF="));

	// These are invalid because bytes 2 & 3 are the first and second bytes of a UTF-8 4-byte sequence, but aren't followed by a valid third byte.
	BOOST_CHECK_EQUAL("=" + RC + RC + RC + "=", ConfigManager::xml_encode("=\xF0\x80\xC0="));
	BOOST_CHECK_EQUAL("=" + RC + RC + RC + "=", ConfigManager::xml_encode("=\xF4\xBF\xFF="));
}

BOOST_AUTO_TEST_CASE(checkXmlEncodeWithInvalidFourHighByteSequence) {
	// These are invalid because bytes 2-4  are the first, second and third bytes of a UTF-8 4-byte sequence, but aren't followed by a valid fourth byte.
	BOOST_CHECK_EQUAL("=" + RC + RC + RC + RC + "=", ConfigManager::xml_encode("=\xF0\x80\x80\xC0="));
	BOOST_CHECK_EQUAL("=" + RC + RC + RC + RC + "=", ConfigManager::xml_encode("=\xF4\xBF\xBF\xFF="));
}
