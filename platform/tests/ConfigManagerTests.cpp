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
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), "/opt/pion/config/../ui");
}

BOOST_AUTO_TEST_CASE(checkResolveRelativePathThatIsNotRelative) {
	std::string base_path("/opt/pion/config/platform.xml");
	std::string relative_path("/opt/pion/ui");
	BOOST_CHECK_EQUAL(ConfigManager::resolveRelativePath(base_path, relative_path), "/opt/pion/ui");
}
