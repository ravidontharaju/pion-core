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
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/VocabularyConfig.hpp>
#include <pion/platform/VocabularyManager.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/test/unit_test.hpp>

using namespace pion;
using namespace pion::platform;


#if defined(_MSC_VER)
	static const std::string VOCAB_A_CONFIG_FILE("vocab_a.xml");
	static const std::string VOCAB_A_TEMPLATE_FILE("vocab_a.tmpl");
	static const std::string VOCAB_A_BACKUP_FILE("vocab_a.xml.bak");
	static const std::string VOCAB_B_CONFIG_FILE("vocab_b.xml");
	static const std::string VOCAB_B_TEMPLATE_FILE("vocab_b.tmpl");
	static const std::string VOCAB_B_BACKUP_FILE("vocab_b.xml.bak");
	static const std::string VOCAB_NEW_CONFIG_FILE("vocab_new.xml");
	static const std::string VOCAB_NEW_BACKUP_FILE("vocab_new.xml.bak");
#elif defined(PION_XCODE)
	static const std::string VOCAB_A_CONFIG_FILE("../../platform/tests/vocab_a.xml");
	static const std::string VOCAB_A_TEMPLATE_FILE("../../platform/tests/vocab_a.tmpl");
	static const std::string VOCAB_A_BACKUP_FILE("../../platform/tests/vocab_a.xml.bak");
	static const std::string VOCAB_B_CONFIG_FILE("../../platform/tests/vocab_b.xml");
	static const std::string VOCAB_B_TEMPLATE_FILE("../../platform/tests/vocab_b.tmpl");
	static const std::string VOCAB_B_BACKUP_FILE("../../platform/tests/vocab_b.xml.bak");
	static const std::string VOCAB_NEW_CONFIG_FILE("../../platform/tests/vocab_new.xml");
	static const std::string VOCAB_NEW_BACKUP_FILE("../../platform/tests/vocab_new.xml.bak");
#else
	// same for Unix and Cygwin
	static const std::string VOCAB_A_CONFIG_FILE("vocab_a.xml");
	static const std::string VOCAB_A_TEMPLATE_FILE("vocab_a.tmpl");
	static const std::string VOCAB_A_BACKUP_FILE("vocab_a.xml.bak");
	static const std::string VOCAB_B_CONFIG_FILE("vocab_b.xml");
	static const std::string VOCAB_B_TEMPLATE_FILE("vocab_b.tmpl");
	static const std::string VOCAB_B_BACKUP_FILE("vocab_b.xml.bak");
	static const std::string VOCAB_NEW_CONFIG_FILE("vocab_new.xml");
	static const std::string VOCAB_NEW_BACKUP_FILE("vocab_new.xml.bak");
#endif

/// sets up logging (run once only)
extern void setup_logging_for_unit_tests(void);

/// cleans up vocabulary config files in the working directory
void cleanup_vocab_config_files(void)
{
	if (boost::filesystem::exists(VOCAB_A_CONFIG_FILE))
		boost::filesystem::remove(VOCAB_A_CONFIG_FILE);
	if (boost::filesystem::exists(VOCAB_A_BACKUP_FILE))
		boost::filesystem::remove(VOCAB_A_BACKUP_FILE);
	boost::filesystem::copy_file(VOCAB_A_TEMPLATE_FILE, VOCAB_A_CONFIG_FILE);

	if (boost::filesystem::exists(VOCAB_B_CONFIG_FILE))
		boost::filesystem::remove(VOCAB_B_CONFIG_FILE);
	if (boost::filesystem::exists(VOCAB_B_BACKUP_FILE))
		boost::filesystem::remove(VOCAB_B_BACKUP_FILE);
	boost::filesystem::copy_file(VOCAB_B_TEMPLATE_FILE, VOCAB_B_CONFIG_FILE);

	if (boost::filesystem::exists(VOCAB_NEW_CONFIG_FILE))
		boost::filesystem::remove(VOCAB_NEW_CONFIG_FILE);
	if (boost::filesystem::exists(VOCAB_NEW_BACKUP_FILE))
		boost::filesystem::remove(VOCAB_NEW_BACKUP_FILE);
}


/// Fixture for VocabularyConfig unit tests
class NewVocabularyConfigTests_F {
public:
	NewVocabularyConfigTests_F() {
		setup_logging_for_unit_tests();
		cleanup_vocab_config_files();
		
		// open up a new Vocabulary configuration file
		m_config.setConfigFile(VOCAB_NEW_CONFIG_FILE);
	}
	~NewVocabularyConfigTests_F() {
	}
	
	VocabularyConfig	m_config;
};

BOOST_FIXTURE_TEST_SUITE(NewVocabularyConfigTests_S, NewVocabularyConfigTests_F)

BOOST_AUTO_TEST_CASE(checkNewVocabularyConfigAddTermBeforeOpening) {
	Vocabulary::Term new_term("urn:pion::new-null-term");
	BOOST_CHECK_THROW(m_config.addTerm(new_term), VocabularyConfig::VocabularyNotOpenException);
}

BOOST_AUTO_TEST_CASE(checkNewVocabularyConfigSizeEqualsZero) {
	m_config.openConfigFile();
	BOOST_CHECK_EQUAL(m_config.getVocabulary().size(), static_cast<size_t>(0));
}

BOOST_AUTO_TEST_CASE(checkNewVocabularyConfigSetId) {
	m_config.openConfigFile();
	const std::string new_value("urn:vocab:test_new");
	m_config.setId(new_value);
	BOOST_CHECK_EQUAL(m_config.getId(), new_value);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkNewVocabularyConfigSetNamespace) {
	m_config.openConfigFile();
	const std::string new_value("new");
	m_config.setNamespace(new_value);
	BOOST_CHECK_EQUAL(m_config.getNamespace(), new_value);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkNewVocabularyConfigSetComment) {
	m_config.openConfigFile();
	const std::string new_value("This is a new Vocabulary");
	m_config.setComment(new_value);
	BOOST_CHECK_EQUAL(m_config.getComment(), new_value);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkNewVocabularyConfigAddTermAfterOpening) {
	m_config.openConfigFile();
	// create a new term to add
	Vocabulary::Term new_term("urn:pion::new-float-number");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	new_term.term_comment = "A floating-point number";
	
	// add the term to the vocabulary & check the return value
	m_config.addTerm(new_term);
	
	// look up the term using the ID
	BOOST_CHECK(m_config.getVocabulary().findTerm(new_term.term_id) != Vocabulary::UNDEFINED_TERM_REF);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_SUITE_END()

	
/// Fixture for VocabularyConfig unit tests
class VocabularyConfigTests_F {
public:
	VocabularyConfigTests_F() {
		setup_logging_for_unit_tests();
		cleanup_vocab_config_files();
		
		// open up the Vocabulary configuration file
		m_config.setConfigFile(VOCAB_A_CONFIG_FILE);
		m_config.openConfigFile();
		
		// associate our Vocabulary with the config manager
		m_config.bind(m_vocabulary);
	}
	~VocabularyConfigTests_F() {
	}

	VocabularyConfig	m_config;
	Vocabulary			m_vocabulary;
};

BOOST_FIXTURE_TEST_SUITE(VocabularyConfigTests_S, VocabularyConfigTests_F)

BOOST_AUTO_TEST_CASE(checkVocabularyConfigSizeEqualsFive) {
	// there should be five terms defined in the config file
	BOOST_CHECK_EQUAL(m_config.getVocabulary().size(), static_cast<size_t>(5));
	BOOST_CHECK_EQUAL(m_vocabulary.size(), static_cast<size_t>(5));
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigOptionValues) {
	BOOST_CHECK_EQUAL(m_config.getId(), "urn:vocab:test");
	BOOST_CHECK_EQUAL(m_config.getNamespace(), "t");
	BOOST_CHECK_EQUAL(m_config.getComment(), "Vocabulary for Unit Tests");
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigIdValues) {
	// check term_id values
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_id, "urn:pion:null-term");
	BOOST_CHECK_EQUAL(m_vocabulary[2].term_id, "urn:pion:plain-old-int");
	BOOST_CHECK_EQUAL(m_vocabulary[3].term_id, "urn:pion:big-int");
	BOOST_CHECK_EQUAL(m_vocabulary[4].term_id, "urn:pion:fixed-text");
	BOOST_CHECK_EQUAL(m_vocabulary[5].term_id, "urn:pion:simple-object");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[1].term_id, "urn:pion:null-term");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[2].term_id, "urn:pion:plain-old-int");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[3].term_id, "urn:pion:big-int");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[4].term_id, "urn:pion:fixed-text");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[5].term_id, "urn:pion:simple-object");
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigCommentValues) {
	// check data type values
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_comment, "");
	BOOST_CHECK_EQUAL(m_vocabulary[2].term_comment, "A plain, old integer number");
	BOOST_CHECK_EQUAL(m_vocabulary[3].term_comment, "A really big positive integer");
	BOOST_CHECK_EQUAL(m_vocabulary[4].term_comment, "Ten bytes of text");
	BOOST_CHECK_EQUAL(m_vocabulary[5].term_comment, "An object containing other Terms");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[1].term_comment, "");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[2].term_comment, "A plain, old integer number");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[3].term_comment, "A really big positive integer");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[4].term_comment, "Ten bytes of text");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[5].term_comment, "An object containing other Terms");
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigDataTypeValues) {
	// check data type values
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_type, Vocabulary::TYPE_NULL);
	BOOST_CHECK_EQUAL(m_vocabulary[2].term_type, Vocabulary::TYPE_INT16);
	BOOST_CHECK_EQUAL(m_vocabulary[3].term_type, Vocabulary::TYPE_UINT64);
	BOOST_CHECK_EQUAL(m_vocabulary[4].term_type, Vocabulary::TYPE_CHAR);
	BOOST_CHECK_EQUAL(m_vocabulary[5].term_type, Vocabulary::TYPE_OBJECT);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[1].term_type, Vocabulary::TYPE_NULL);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[2].term_type, Vocabulary::TYPE_INT16);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[3].term_type, Vocabulary::TYPE_UINT64);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[4].term_type, Vocabulary::TYPE_CHAR);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[5].term_type, Vocabulary::TYPE_OBJECT);
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigDataTypeSizes) {
	// check data type values
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_vocabulary[2].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_vocabulary[3].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_vocabulary[4].term_size, static_cast<size_t>(10));
	BOOST_CHECK_EQUAL(m_vocabulary[5].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[1].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[2].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[3].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[4].term_size, static_cast<size_t>(10));
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[5].term_size, static_cast<size_t>(0));
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigMembersOfSimpleObjectTerm) {
	// check members of the simple-object term
	Vocabulary::OBJECT_MEMBER_LIST member_list = m_vocabulary.getObjectMembers(static_cast<Vocabulary::TermRef>(5));
	Vocabulary::OBJECT_MEMBER_LIST::const_iterator i = member_list.begin();
	BOOST_REQUIRE(i != member_list.end());
	BOOST_CHECK_EQUAL(*i, static_cast<Vocabulary::TermRef>(2));
	BOOST_REQUIRE(++i != member_list.end());
	BOOST_CHECK_EQUAL(*i, static_cast<Vocabulary::TermRef>(3));
	BOOST_REQUIRE(++i != member_list.end());
	BOOST_CHECK_EQUAL(*i, static_cast<Vocabulary::TermRef>(4));
	BOOST_CHECK(++i == member_list.end());
	
	member_list = m_config.getVocabulary().getObjectMembers(static_cast<Vocabulary::TermRef>(5));
	i = member_list.begin();
	BOOST_REQUIRE(i != member_list.end());
	BOOST_CHECK_EQUAL(*i, static_cast<Vocabulary::TermRef>(2));
	BOOST_REQUIRE(++i != member_list.end());
	BOOST_CHECK_EQUAL(*i, static_cast<Vocabulary::TermRef>(3));
	BOOST_REQUIRE(++i != member_list.end());
	BOOST_CHECK_EQUAL(*i, static_cast<Vocabulary::TermRef>(4));
	BOOST_CHECK(++i == member_list.end());
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigAddNewMemberForNonObject) {
	BOOST_CHECK_THROW(m_config.addObjectMember("urn:pion:plain-old-int",
											   "urn:pion:big-int"),
					  Vocabulary::NotObjectTermException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigAddDuplicateObjectMember) {
	// try adding a duplicate member (should throw)
	BOOST_CHECK_THROW(m_config.addObjectMember("urn:pion:simple-object",
											   "urn:pion:plain-old-int"),
					  Vocabulary::DuplicateMemberException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigAddDuplicateTerm) {
	// check throw if we try adding a term with the same ID
	Vocabulary::Term temp_term("urn:pion:simple-object");
	BOOST_CHECK_THROW(m_config.addTerm(temp_term), Vocabulary::DuplicateTermException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigRemoveTermFailures) {
	// try to remove Term using empty ID
	BOOST_CHECK_THROW(m_config.removeTerm(""), Vocabulary::RemoveTermNotFoundException);
	
	// try to remove Term using an unknown ID
	BOOST_CHECK_THROW(m_config.removeTerm("unknown"), Vocabulary::RemoveTermNotFoundException);
	
	// try to remove Term that is a member of a parent object
	BOOST_CHECK_THROW(m_config.removeTerm("urn:pion:plain-old-int"),
					  Vocabulary::RemoveTermHasParentsException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigChangeId) {
	const std::string new_value("urn:vocab:new_id");
	m_config.setId(new_value);
	BOOST_CHECK_EQUAL(m_config.getId(), new_value);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigChangeNamespace) {
	const std::string new_value("test");
	m_config.setNamespace(new_value);
	BOOST_CHECK_EQUAL(m_config.getNamespace(), new_value);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigChangeComment) {
	const std::string new_value("A new comment");
	m_config.setComment(new_value);
	BOOST_CHECK_EQUAL(m_config.getComment(), new_value);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigAddNewObjectMember) {
	// Add the null term to the simple-object term
	m_config.addObjectMember("urn:pion:simple-object", "urn:pion:null-term");

	// make sure it has been added
	Vocabulary::OBJECT_MEMBER_LIST member_list = m_vocabulary.getObjectMembers(static_cast<Vocabulary::TermRef>(5));
	BOOST_CHECK_EQUAL(member_list.back(), static_cast<Vocabulary::TermRef>(1));
	member_list = m_config.getVocabulary().getObjectMembers(static_cast<Vocabulary::TermRef>(5));
	BOOST_CHECK_EQUAL(member_list.back(), static_cast<Vocabulary::TermRef>(1));

	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigRemoveObjectMember) {
	// remove the object member
	m_config.removeObjectMember("urn:pion:simple-object", "urn:pion:plain-old-int");

	// make sure it is gone
	Vocabulary::OBJECT_MEMBER_LIST member_list = m_vocabulary.getObjectMembers(static_cast<Vocabulary::TermRef>(5));
	for (Vocabulary::OBJECT_MEMBER_LIST::iterator i = member_list.begin();
		 i != member_list.end(); ++i)
	{
		BOOST_CHECK(*i != static_cast<Vocabulary::TermRef>(1));
	}
	member_list = m_config.getVocabulary().getObjectMembers(static_cast<Vocabulary::TermRef>(5));
	for (Vocabulary::OBJECT_MEMBER_LIST::iterator i = member_list.begin();
		 i != member_list.end(); ++i)
	{
		BOOST_CHECK(*i != static_cast<Vocabulary::TermRef>(1));
	}
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigAddNewTerm) {
	// create a new term to add
	Vocabulary::Term new_term("urn:pion::floating-point-number");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	new_term.term_comment = "A floating-point number";
	
	// add the term to the vocabulary & check the return value
	m_config.addTerm(new_term);

	// look up the term using the ID
	Vocabulary::TermRef term_ref = m_vocabulary.findTerm(new_term.term_id);
	BOOST_CHECK_EQUAL(term_ref, static_cast<Vocabulary::TermRef>(6));
	term_ref = m_config.getVocabulary().findTerm(new_term.term_id);
	BOOST_CHECK_EQUAL(term_ref, static_cast<Vocabulary::TermRef>(6));
	
	// check Term member values
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_id, new_term.term_id);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_comment, new_term.term_comment);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_type, new_term.term_type);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_size, new_term.term_size);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[term_ref].term_id, new_term.term_id);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[term_ref].term_comment, new_term.term_comment);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[term_ref].term_type, new_term.term_type);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[term_ref].term_size, new_term.term_size);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigRemoveTerm) {
	// remove the Term
	m_config.removeTerm("urn:pion:null-term");
	
	// make sure it is gone
	BOOST_CHECK_EQUAL(m_vocabulary.findTerm("urn:pion:null-term"), Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK_EQUAL(m_config.getVocabulary().findTerm("urn:pion:null-term"), Vocabulary::UNDEFINED_TERM_REF);
	
	// make sure that the TermRef is still valid (should point to the undefined Term)
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_ref, Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[1].term_ref, Vocabulary::UNDEFINED_TERM_REF);

	// check config file
	// ...
}

BOOST_AUTO_TEST_CASE(checkVocabularyConfigUpdateExistingTerm) {
	// update the null term so that it is a string
	Vocabulary::Term updated_term("urn:pion:null-term");
	updated_term.term_type = Vocabulary::TYPE_STRING;
	updated_term.term_comment = "No longer a null term (now a string)!";
	m_config.updateTerm(updated_term);
	
	// check Term member values
	Vocabulary::TermRef term_ref = m_vocabulary.findTerm("urn:pion:null-term");
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_type, updated_term.term_type);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_comment, updated_term.term_comment);
	term_ref = m_config.getVocabulary().findTerm("urn:pion:null-term");
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[term_ref].term_type, updated_term.term_type);
	BOOST_CHECK_EQUAL(m_config.getVocabulary()[term_ref].term_comment, updated_term.term_comment);
	
	// check config file
	// ...
}

BOOST_AUTO_TEST_SUITE_END()


/// Fixture for VocabularyManager unit tests
class VocabularyManagerTests_F {
public:
	VocabularyManagerTests_F() {
		setup_logging_for_unit_tests();
		cleanup_vocab_config_files();

		// load the Vocabulary configuration files
		m_vocab_mgr.loadConfigFile(VOCAB_A_CONFIG_FILE);
		m_vocab_mgr.loadConfigFile(VOCAB_B_CONFIG_FILE);
	}
	~VocabularyManagerTests_F() {
	}
	
	VocabularyManager	m_vocab_mgr;
};

BOOST_FIXTURE_TEST_SUITE(VocabularyManagerTests_S, VocabularyManagerTests_F)

BOOST_AUTO_TEST_CASE(checkVocabularyManagerSizeEqualsSeven) {
	// there should be seven terms defined in the (two) config files
	BOOST_CHECK_EQUAL(m_vocab_mgr.getVocabulary().size(), static_cast<size_t>(7));
}

BOOST_AUTO_TEST_CASE(checkVocabularyManagerOptionValues) {
	const std::string vocab_a_id("urn:vocab:test");
	BOOST_CHECK_EQUAL(m_vocab_mgr.getNamespace(vocab_a_id), "t");
	BOOST_CHECK_EQUAL(m_vocab_mgr.getComment(vocab_a_id), "Vocabulary for Unit Tests");

	const std::string vocab_b_id("urn:vocab:test_b");
	BOOST_CHECK_EQUAL(m_vocab_mgr.getNamespace(vocab_b_id), "b");
	BOOST_CHECK_EQUAL(m_vocab_mgr.getComment(vocab_b_id), "Vocabulary for Unit Tests");
}

BOOST_AUTO_TEST_CASE(checkVocabularyManagerTermIds) {
	// check term_id values
	const Vocabulary& universal_vocab = m_vocab_mgr.getVocabulary();
	BOOST_CHECK(universal_vocab.findTerm("urn:pion:null-term") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:pion:plain-old-int") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:pion:big-int") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:pion:fixed-text") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:pion:simple-object") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:pion:b-null-term") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:pion:b-int") != Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_SUITE_END()
