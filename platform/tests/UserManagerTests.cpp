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
#include <pion/PionUnitTestDefs.hpp>
#include <pion/platform/PionPlatformUnitTest.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem.hpp>
#include <boost/filesystem/fstream.hpp>
#include "../server/PlatformConfig.hpp"
#include "../server/UserManager.hpp"

using namespace pion;
using namespace pion::net;
using namespace pion::platform;
using namespace pion::server;


/// external functions defined in PionPlatformUnitTests.cpp
extern void cleanup_platform_config_files(void);


class NewUserManager_F : public UserManager {
public:
	NewUserManager_F() : UserManager() {
		// get everything set up first
		cleanup_platform_config_files();

		// The default constructor for UserManager sets the config file to "users.xml".
		// Since that's a relative path, we set the current directory to the test config directory.
		BOOST_REQUIRE(GET_DIRECTORY(m_old_cwd, DIRECTORY_MAX_SIZE) != NULL);
		BOOST_REQUIRE(CHANGE_DIRECTORY(CONFIG_FILE_DIR.c_str()) == 0);
	}
	~NewUserManager_F() {
		BOOST_CHECK(CHANGE_DIRECTORY(m_old_cwd) == 0);
	}

	// Use startWritingUsersConfigFile and finishWritingUsersConfigFile to overwrite the version 
	// of users.xml in the test config directory.
	void startWritingUsersConfigFile() {
		m_users_config_file.open("users.xml");
		m_users_config_file
			<< "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
			<< "<PionConfig xmlns=\"http://purl.org/pion/config\">\n";
	}

	void finishWritingUsersConfigFile() {
		m_users_config_file
			<< "</PionConfig>\n";
		m_users_config_file.close();
	}

	char m_old_cwd[DIRECTORY_MAX_SIZE+1];
	xmlNodePtr m_user_config_ptr;
	std::string m_returned_user_id;
	boost::filesystem::ofstream m_users_config_file;
};

BOOST_FIXTURE_TEST_SUITE(NewUserManager_S, NewUserManager_F)

BOOST_AUTO_TEST_CASE(checkOpenConfigFile) {
	BOOST_CHECK_NO_THROW(openConfigFile());
}

BOOST_AUTO_TEST_CASE(checkCreateUserConfig) {
	std::string user_id = "new_user";
	std::string config_data_str = "<PionConfig><User id =\"" + user_id + "\"><Password>123</Password></User></PionConfig>";
	BOOST_CHECK_NO_THROW(m_user_config_ptr = createUserConfig(m_returned_user_id, config_data_str.c_str(), config_data_str.size()));
	BOOST_CHECK_EQUAL(m_returned_user_id, user_id);
}

BOOST_AUTO_TEST_CASE(checkCreateUserConfigWithoutPassword) {
	std::string user_id = "new_user";
	std::string config_data_str = "<PionConfig><User id =\"" + user_id + "\"></User></PionConfig>";

	// Should this throw an exception?
	BOOST_CHECK_NO_THROW(m_user_config_ptr = createUserConfig(m_returned_user_id, config_data_str.c_str(), config_data_str.size()));
	BOOST_CHECK_EQUAL(m_returned_user_id, user_id);
}

BOOST_AUTO_TEST_CASE(checkOpenConfigFileWithNoUsers) {
	startWritingUsersConfigFile();
	finishWritingUsersConfigFile();

	BOOST_CHECK_NO_THROW(openConfigFile());
}

#ifdef PION_HAVE_SSL
BOOST_AUTO_TEST_CASE(checkOpenConfigFileWithNoUserId) {
	startWritingUsersConfigFile();
	m_users_config_file << "<User><Password>123</Password></User>\n";
	finishWritingUsersConfigFile();

	BOOST_CHECK_THROW(openConfigFile(), UserManager::MissingUserIdInConfigFileException);
}

BOOST_AUTO_TEST_CASE(checkOpenConfigFileWithEmptyUserId) {
	startWritingUsersConfigFile();
	m_users_config_file << "<User id=\"\"><Password>123</Password></User>\n";
	finishWritingUsersConfigFile();

	BOOST_CHECK_THROW(openConfigFile(), UserManager::MissingUserIdInConfigFileException);
}

BOOST_AUTO_TEST_CASE(checkOpenConfigFileWithUserWithNoPassword) {
	startWritingUsersConfigFile();
	m_users_config_file << "<User id=\"user1\"></User>\n";
	finishWritingUsersConfigFile();

	BOOST_CHECK_THROW(openConfigFile(), UserManager::NoPasswordException);
}

BOOST_AUTO_TEST_CASE(checkOpenConfigFileWithEmptyPassword) {
	startWritingUsersConfigFile();
	m_users_config_file << "<User id=\"user1\"><Password></Password></User>\n";
	finishWritingUsersConfigFile();

	BOOST_CHECK_THROW(openConfigFile(), UserManager::NoPasswordException);
}

BOOST_AUTO_TEST_CASE(checkOpenConfigFileWithUnencryptedPassword) {
	startWritingUsersConfigFile();
	m_users_config_file << "<User id=\"user1\"><Password>123</Password></User>\n";
	finishWritingUsersConfigFile();

	BOOST_CHECK_THROW(openConfigFile(), PionUser::BadPasswordHash);
}

BOOST_AUTO_TEST_CASE(checkOpenConfigFileWithDuplicateUserIds) {
	startWritingUsersConfigFile();
	m_users_config_file << "<User id=\"user1\"><Password>5f493757a8d897bf46f73413f54e8e6afb1d6186</Password></User>\n"
						<< "<User id=\"user2\"><Password>7c4a8d09ca3762af61e59520943dc26494f8941b</Password></User>\n"
						<< "<User id=\"user1\"><Password>7c4a8d09ca3762af61e59520943dc26494f8941b</Password></User>\n";
	finishWritingUsersConfigFile();

	BOOST_CHECK_THROW(openConfigFile(), UserManager::DuplicateUserException);
}
#endif

BOOST_AUTO_TEST_SUITE_END()


class UserManagerWithConfigFileOpen_F : public NewUserManager_F {
public:
	UserManagerWithConfigFileOpen_F() : NewUserManager_F() {
		BOOST_CHECK_NO_THROW(openConfigFile());
		std::string basic_config_data_str = "<PionConfig><User><Password>123</Password></User></PionConfig>";
		BOOST_CHECK_NO_THROW(m_basic_user_config_ptr = createUserConfig(m_returned_user_id,
																		basic_config_data_str.c_str(),
																		basic_config_data_str.size()));
	}
	~UserManagerWithConfigFileOpen_F() {
	}

	xmlNodePtr m_basic_user_config_ptr;
};

BOOST_FIXTURE_TEST_SUITE(UserManagerWithConfigFileOpen_S, UserManagerWithConfigFileOpen_F)

BOOST_AUTO_TEST_CASE(checkOpenConfigFileAgain) {
	BOOST_CHECK_NO_THROW(openConfigFile());
}

BOOST_AUTO_TEST_CASE(checkWriteConfigXML) {
	std::stringstream ss;
	BOOST_CHECK_NO_THROW(writeConfigXML(ss));
	boost::regex expected_output(".*<PionConfig.*>\\s*"
								 "(<User id=\"\\w*\">\\s*"
								 "<Password>\\w*</Password>.*"
								 "</User>\\s*)+"
								 "</PionConfig>\\s*");
	BOOST_CHECK(boost::regex_match(ss.str(), expected_output));
}

BOOST_AUTO_TEST_CASE(checkWriteConfigXMLForUser) {
	std::stringstream ss;
	BOOST_CHECK_NO_THROW(writeConfigXML(ss, "test2"));
	boost::regex expected_output(".*<PionConfig.*>\\s*"
								 "(<User id=\"test2\">\\s*"
								 "<Password>\\w*</Password>.*"
								 "</User>\\s*)"
								 "</PionConfig>\\s*");
	BOOST_CHECK(boost::regex_match(ss.str(), expected_output));
}

BOOST_AUTO_TEST_CASE(checkWriteConfigXMLConsistency) {
	std::stringstream ss1;
	BOOST_CHECK_NO_THROW(writeConfigXML(ss1));
	std::stringstream ss2;
	BOOST_CHECK_NO_THROW(writeConfigXML(ss2, "test2"));
	boost::regex expected_output("(.*<PionConfig[^>]*>\\s*)<User.*");
	std::string s1 = ss1.str();
	boost::cmatch match_results_1;
	BOOST_CHECK(boost::regex_match(s1.c_str(), match_results_1, expected_output));
	std::string s2 = ss2.str();
	boost::cmatch match_results_2;
	BOOST_CHECK(boost::regex_match(s2.c_str(), match_results_2, expected_output));

	// This is just a warning, because as long as the previous two matches succeeded,
	// the format is correct in both cases, so this is just pointing out an
	// inconsistency in formatting.
	BOOST_WARN_EQUAL(match_results_1[1].str(), match_results_2[1].str());
}

BOOST_AUTO_TEST_CASE(checkAddUser) {
	std::string user_id = "new_user";
#ifdef PION_HAVE_SSL
	BOOST_CHECK_EQUAL(addUser(user_id, m_basic_user_config_ptr), user_id);
#else
	BOOST_CHECK_THROW(addUser(user_id, m_basic_user_config_ptr), UserManager::MissingOpenSSLException);
#endif
}

#ifdef PION_HAVE_SSL
BOOST_AUTO_TEST_CASE(checkAddUserWithDifferentIdThanConfigData) {
	std::string user_id = "new_user";
	std::string config_data_str = "<PionConfig><User id =\"" + user_id + "\"><Password>123</Password></User></PionConfig>";
	BOOST_CHECK_NO_THROW(m_user_config_ptr = createUserConfig(m_returned_user_id, config_data_str.c_str(), config_data_str.size()));

	std::string different_id = "different_id";
	BOOST_CHECK_EQUAL(addUser(different_id, m_user_config_ptr), different_id);
}

BOOST_AUTO_TEST_CASE(checkAddUserTwice) {
	std::string user_id = "new_user";
	BOOST_CHECK_EQUAL(addUser(user_id, m_basic_user_config_ptr), user_id);
	BOOST_CHECK_THROW(addUser(user_id, m_basic_user_config_ptr), UserManager::DuplicateUserException);
}

BOOST_AUTO_TEST_CASE(checkAddUserWithSameIdAsUserInConfigFile) {
	std::string duplicate_user_id = "test1"; // the config file contains a user with id = "test1"
	BOOST_CHECK_THROW(addUser(duplicate_user_id, m_basic_user_config_ptr), UserManager::DuplicateUserException);
}

BOOST_AUTO_TEST_CASE(checkAddUserWithNoPassword) {
	std::string config_data_str = "<PionConfig><User></User></PionConfig>";
	BOOST_CHECK_NO_THROW(m_user_config_ptr = createUserConfig(m_returned_user_id, config_data_str.c_str(), config_data_str.size()));

	std::string user_id = "new_user";
	BOOST_CHECK_THROW(addUser(user_id, m_user_config_ptr), UserManager::NoPasswordException);
}

BOOST_AUTO_TEST_CASE(checkAddUserWithEmptyPassword) {
	std::string config_data_str = "<PionConfig><User><Password></Password></User></PionConfig>";
	BOOST_CHECK_NO_THROW(m_user_config_ptr = createUserConfig(m_returned_user_id, config_data_str.c_str(), config_data_str.size()));

	std::string user_id = "new_user";
	BOOST_CHECK_THROW(addUser(user_id, m_user_config_ptr), UserManager::NoPasswordException);
}
#endif

BOOST_AUTO_TEST_CASE(checkSetUserConfigForExistingUser) {
	std::string existing_user_id = "test1";
#ifdef PION_HAVE_SSL
	BOOST_CHECK_NO_THROW(setUserConfig(existing_user_id, m_basic_user_config_ptr));
#else
	BOOST_CHECK_THROW(setUserConfig(existing_user_id, m_basic_user_config_ptr), UserManager::MissingOpenSSLException);
#endif
}

#ifdef PION_HAVE_SSL
BOOST_AUTO_TEST_CASE(checkSetUserConfigForNonExistentUser) {
	std::string non_existent_user_id = "smurf";
	BOOST_CHECK_THROW(setUserConfig(non_existent_user_id, m_basic_user_config_ptr), UserManager::UserNotFoundException);
}

BOOST_AUTO_TEST_CASE(checkSetUserConfigUpdatesUserConfig) {
	std::string config_data_str = "<PionConfig><User><Password>123</Password><T1>blueberry</T1></User></PionConfig>";
	BOOST_CHECK_NO_THROW(m_user_config_ptr = createUserConfig(m_returned_user_id, config_data_str.c_str(), config_data_str.size()));
	std::string existing_user_id = "test1";
	BOOST_CHECK_NO_THROW(setUserConfig(existing_user_id, m_user_config_ptr));

	std::stringstream ss;
	BOOST_CHECK_NO_THROW(writeConfigXML(ss, existing_user_id));
	boost::regex expected_substring("<T1>blueberry</T1>");
	BOOST_CHECK(boost::regex_search(ss.str(), expected_substring));
}
#endif

BOOST_AUTO_TEST_CASE(checkRemoveExistingUser) {
	std::string existing_user_id = "test1";
#ifdef PION_HAVE_SSL
	BOOST_CHECK(removeUser(existing_user_id));
#else
	BOOST_CHECK_THROW(removeUser(existing_user_id), UserManager::MissingOpenSSLException);
#endif
}

#ifdef PION_HAVE_SSL
BOOST_AUTO_TEST_CASE(checkRemoveNonExistentUser) {
	std::string non_existent_user_id = "smurf";
	BOOST_CHECK(!removeUser(non_existent_user_id));
}
#endif

BOOST_AUTO_TEST_SUITE_END()
