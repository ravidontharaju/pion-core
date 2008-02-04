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

#include <string>
#include <pion/PionConfig.hpp>
#include <pion/PionPlugin.hpp>
#include <pion/PionLogger.hpp>

#define BOOST_TEST_MODULE pion-platform-unit-tests
#include <boost/test/unit_test.hpp>


/// returns the path to the unit test log file directory
const std::string& get_log_file_dir(void)
{
#if defined(_MSC_VER)
	static const std::string TESTS_LOG_FILE_DIR("logs\\");
#elif defined(PION_XCODE)
	static const std::string TESTS_LOG_FILE_DIR("../../platform/tests/logs/");
#else
	// same for Unix and Cygwin
	static const std::string TESTS_LOG_FILE_DIR("logs/");
#endif

	return TESTS_LOG_FILE_DIR;
}

/// returns the path to the unit test config file directory
const std::string& get_config_file_dir(void)
{
#if defined(_MSC_VER)
	static const std::string TESTS_CONFIG_FILE_DIR("config\\");
#elif defined(PION_XCODE)
	static const std::string TESTS_CONFIG_FILE_DIR("../../platform/tests/config/");
#else
	// same for Unix and Cygwin
	static const std::string TESTS_CONFIG_FILE_DIR("config/");
#endif
	
	return TESTS_CONFIG_FILE_DIR;
}

/// returns the path to the unit test vocabulary config path
const std::string& get_vocabulary_path(void)
{
#if defined(_MSC_VER)
	static const std::string TESTS_VOCABULARY_PATH("config\\vocabularies\\");
#elif defined(PION_XCODE)
	static const std::string TESTS_VOCABULARY_PATH("../../platform/tests/config/vocabularies/");
#else
	// same for Unix and Cygwin
	static const std::string TESTS_VOCABULARY_PATH("config/vocabularies/");
#endif
	
	return TESTS_VOCABULARY_PATH;
}

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

/// initializes the Pion plug-in path
void setup_plugins_directory(void)
{
	static bool init_done = false;
	if (! init_done) {
		pion::PionPlugin::resetPluginDirectories();

#if defined(_MSC_VER)
	#if defined(_DEBUG) && defined(PION_FULL)
		pion::PionPlugin::addPluginDirectory("../../bin/Debug_DLL_full");
	#elif defined(_DEBUG) && !defined(PION_FULL)
		pion::PionPlugin::addPluginDirectory("../../bin/Debug_DLL");
	#elif defined(NDEBUG) && defined(PION_FULL)
		pion::PionPlugin::addPluginDirectory("../../bin/Release_DLL_full");
	#elif defined(NDEBUG) && !defined(PION_FULL)
		pion::PionPlugin::addPluginDirectory("../../bin/Release_DLL");
	#endif
#elif defined(PION_XCODE)
		pion::PionPlugin::addPluginDirectory(".");
#else
		// same for Unix and Cygwin
		pion::PionPlugin::addPluginDirectory("../codecs/.libs");
		pion::PionPlugin::addPluginDirectory("../reactors/.libs");
#endif
	}
}