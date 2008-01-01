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
#include <pion/PionLogger.hpp>

#define BOOST_TEST_MODULE pion-platform-unit-tests
#include <boost/test/unit_test.hpp>


/// sets up logging (run once only)
void setup_logging_for_unit_tests(void)
{
	static bool first_run = true;
	if (first_run) {
		first_run = false;
		// configure logging
		PION_LOG_CONFIG_BASIC;
		pion::PionLogger log_ptr;
		log_ptr = PION_GET_LOGGER("pion.platform");
		PION_LOG_SETLEVEL_WARN(log_ptr);
	}
}
