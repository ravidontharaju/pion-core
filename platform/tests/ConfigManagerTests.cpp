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

using namespace pion;
using namespace pion::platform;


BOOST_AUTO_TEST_CASE(checkCreateUUID) {
	std::string UUID = ConfigManager::createUUID();
	BOOST_CHECK_EQUAL(UUID.length(), static_cast<std::size_t>(36));
}

BOOST_AUTO_TEST_CASE(checkResolveRelativePathThatIsRelative) {
	std::string base_path("/opt/pion/config/platform.xml");
	std::string relative_path("../ui");
#if defined(_MSC_VER)
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), "c:\\opt\\pion\\ui");
#else
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), "/opt/pion/ui");
#endif
}

BOOST_AUTO_TEST_CASE(checkResolveRelativePathThatIsNotRelative) {
	std::string base_path("/opt/pion/config/platform.xml");
#if defined(_MSC_VER)
	std::string relative_path("C:\\opt\\pion\\ui");
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), "C:\\opt\\pion\\ui");
#else
	std::string relative_path("/opt/pion/ui");
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), "/opt/pion/ui");
#endif
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
