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

#include <iostream>
#include <string>
#include <libxml/xmlerror.h>
#include <boost/filesystem.hpp>
#include <boost/filesystem/operations.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionPlugin.hpp>

#ifdef PION_HAVE_SSL
	#include <openssl/ssl.h>
#ifdef _MSC_VER
	#include <openssl/applink.c>
#endif
#endif

#define BOOST_TEST_MODULE pion-platform-unit-tests
#include <boost/test/unit_test.hpp>

#include <pion/PionUnitTestDefs.hpp>
#include <pion/platform/PionPlatformUnitTest.hpp>

struct PionPlatformUnitTestsConfig {
	PionPlatformUnitTestsConfig() {
		std::cout << "global setup specific to pion-platform\n";

		// argc and argv do not include parameters handled by the boost unit test framework, such as --log_level.
		int argc = boost::unit_test::framework::master_test_suite().argc;
		char** argv = boost::unit_test::framework::master_test_suite().argv;

		bool verbose = false;
		if (argc > 1) {
			if (argv[1][0] == '-' && argv[1][1] == 'v') {
				verbose = true;
			}
		}
		if (!verbose) {
			xmlSetGenericErrorFunc(NULL, PionUnitTest::doNothing);
			std::cout << "Use '-v' to enable logging from libxml2.\n";
		}

		pion::PionPlugin::resetPluginDirectories();
#if defined(PION_XCODE)
		pion::PionPlugin::addPluginDirectory(".");
#else
		// same for Unix and Windows (including Cygwin)
		pion::PionPlugin::addPluginDirectory("../codecs/.libs");
		pion::PionPlugin::addPluginDirectory("../reactors/.libs");
		pion::PionPlugin::addPluginDirectory("../databases/.libs");
		pion::PionPlugin::addPluginDirectory("../services/.libs");
		pion::PionPlugin::addPluginDirectory("../protocols/.libs");
		pion::PionPlugin::addPluginDirectory("../../net/services/.libs");
#endif

		CRYPTO_malloc_init();
		SSL_library_init();	// TODO: asio should handle this, why not?!?!
	}
	~PionPlatformUnitTestsConfig() {
		std::cout << "global teardown specific to pion-platform\n";
	}
};

BOOST_GLOBAL_FIXTURE(PionUnitTestsConfig);
BOOST_GLOBAL_FIXTURE(PionPlatformUnitTestsConfig);


/// returns the path to the unit test log file directory
const std::string& get_log_file_dir(void)
{
#if defined(PION_XCODE)
	static const std::string TESTS_LOG_FILE_DIR("../../platform/tests/logs/");
#else
	static const std::string TESTS_LOG_FILE_DIR("logs/");
#endif

	return TESTS_LOG_FILE_DIR;
}

/// returns the path to the directory of compressed log files for unit tests
const std::string& get_compressed_log_file_dir(void)
{
#if defined(PION_XCODE)
	static const std::string TESTS_COMPR_LOG_FILE_DIR("../../platform/tests/compressed-logs/");
#else
	static const std::string TESTS_COMPR_LOG_FILE_DIR("compressed-logs/");
#endif

	return TESTS_COMPR_LOG_FILE_DIR;
}

/// returns the path to the unit test config file directory
const std::string& get_config_file_dir(void)
{
#if defined(PION_XCODE)
	static const std::string TESTS_CONFIG_FILE_DIR("../../platform/tests/config/");
#else
	static const std::string TESTS_CONFIG_FILE_DIR("config/");
#endif

	return TESTS_CONFIG_FILE_DIR;
}

/// returns the path to the unit test vocabulary config path
const std::string& get_vocabulary_path(void)
{
#if defined(PION_XCODE)
	static const std::string TESTS_VOCABULARY_PATH("../../platform/tests/config/vocabularies/");
#else
	static const std::string TESTS_VOCABULARY_PATH("config/vocabularies/");
#endif
	
	return TESTS_VOCABULARY_PATH;
}

/// cleans up vocabulary config files in the tests config directory
void cleanup_vocab_config_files(void)
{
	static const std::string VOCAB_A_TEMPLATE_FILE(get_vocabulary_path() + "a.tmpl");
	static const std::string VOCAB_A_CONFIG_FILE(get_vocabulary_path() + "a.xml");
	static const std::string VOCAB_B_TEMPLATE_FILE(get_vocabulary_path() + "b.tmpl");
	static const std::string VOCAB_B_CONFIG_FILE(get_vocabulary_path() + "b.xml");
	static const std::string CLF_VOCABULARY_TEMPLATE_FILE(get_vocabulary_path() + "clickstream.tmpl");
	static const std::string CLF_VOCABULARY_CONFIG_FILE(get_vocabulary_path() + "clickstream.xml");

	if (boost::filesystem::exists(VOCAB_A_CONFIG_FILE))
		boost::filesystem::remove(VOCAB_A_CONFIG_FILE);
	boost::filesystem::copy_file(VOCAB_A_TEMPLATE_FILE, VOCAB_A_CONFIG_FILE);
	
	if (boost::filesystem::exists(VOCAB_B_CONFIG_FILE))
		boost::filesystem::remove(VOCAB_B_CONFIG_FILE);
	boost::filesystem::copy_file(VOCAB_B_TEMPLATE_FILE, VOCAB_B_CONFIG_FILE);
	
	if (boost::filesystem::exists(CLF_VOCABULARY_CONFIG_FILE))
		boost::filesystem::remove(CLF_VOCABULARY_CONFIG_FILE);
	boost::filesystem::copy_file(CLF_VOCABULARY_TEMPLATE_FILE, CLF_VOCABULARY_CONFIG_FILE);
	
	if (boost::filesystem::exists(VOCABS_CONFIG_FILE))
		boost::filesystem::remove(VOCABS_CONFIG_FILE);
	boost::filesystem::copy_file(VOCABS_TEMPLATE_FILE, VOCABS_CONFIG_FILE);
}

/// cleans up platform config files in the working directory
void cleanup_platform_config_files(void)
{
	cleanup_vocab_config_files();
	
	if (boost::filesystem::exists(REACTORS_CONFIG_FILE))
		boost::filesystem::remove(REACTORS_CONFIG_FILE);
	boost::filesystem::copy_file(REACTORS_TEMPLATE_FILE, REACTORS_CONFIG_FILE);
	
	if (boost::filesystem::exists(CODECS_CONFIG_FILE))
		boost::filesystem::remove(CODECS_CONFIG_FILE);
	boost::filesystem::copy_file(CODECS_TEMPLATE_FILE, CODECS_CONFIG_FILE);
	
	if (boost::filesystem::exists(PROTOCOLS_CONFIG_FILE))
		boost::filesystem::remove(PROTOCOLS_CONFIG_FILE);
	boost::filesystem::copy_file(PROTOCOLS_TEMPLATE_FILE, PROTOCOLS_CONFIG_FILE);

	if (boost::filesystem::exists(DATABASES_CONFIG_FILE))
		boost::filesystem::remove(DATABASES_CONFIG_FILE);
	boost::filesystem::copy_file(DATABASES_TEMPLATE_FILE, DATABASES_CONFIG_FILE);
	
	if (boost::filesystem::exists(PLATFORM_CONFIG_FILE))
		boost::filesystem::remove(PLATFORM_CONFIG_FILE);
	boost::filesystem::copy_file(PLATFORM_TEMPLATE_FILE, PLATFORM_CONFIG_FILE);
	
	if (boost::filesystem::exists(SERVICES_CONFIG_FILE))
		boost::filesystem::remove(SERVICES_CONFIG_FILE);
	boost::filesystem::copy_file(SERVICES_TEMPLATE_FILE, SERVICES_CONFIG_FILE);

	if (boost::filesystem::exists(USERS_CONFIG_FILE))
		boost::filesystem::remove(USERS_CONFIG_FILE);
	boost::filesystem::copy_file(USERS_TEMPLATE_FILE, USERS_CONFIG_FILE);
}

void cleanup_cache_files(void)
{
	boost::filesystem::path dir_path(CONFIG_FILE_DIR);
	for (boost::filesystem::directory_iterator itr(dir_path); itr != boost::filesystem::directory_iterator(); ++itr) {
		if (boost::filesystem::extension(itr->path()) == ".cache") {
			boost::filesystem::remove(itr->path());
		}
	}
}

void cleanup_backup_files(void)
{
	boost::filesystem::path dir_path(CONFIG_FILE_DIR);
	for (boost::filesystem::directory_iterator itr(dir_path); itr != boost::filesystem::directory_iterator(); ++itr) {
		if (boost::filesystem::extension(itr->path()) == ".bak") {
			boost::filesystem::remove(itr->path());
		}
	}
}

// Deletes all files starting with "new" in the test logs directory.
void cleanup_log_files(void)
{
	boost::filesystem::path dir_path(get_log_file_dir());
	for (boost::filesystem::directory_iterator itr(dir_path); itr != boost::filesystem::directory_iterator(); ++itr) {
		std::string basename = boost::filesystem::basename(itr->path());
		if (basename.substr(0, 3) == "new") {
			boost::filesystem::remove(itr->path());
		}
	}
}
