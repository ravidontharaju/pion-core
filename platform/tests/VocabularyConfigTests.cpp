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
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/VocabularyConfig.hpp>
#include <pion/platform/VocabularyManager.hpp>
#include <boost/filesystem/operations.hpp>
#include <boost/filesystem/fstream.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/mpl/list.hpp>
#include <boost/regex.hpp>

using namespace pion;
using namespace pion::platform;


/// external functions defined in PionPlatformUnitTests.cpp
extern const std::string& get_vocabulary_path(void);
extern void cleanup_vocab_config_files(void);


/// static strings used by these unit tests
static const std::string VOCAB_NEW_CONFIG_FILE(get_vocabulary_path() + "new.xml");
static const std::string VOCAB_DEFAULT_CONFIG_FILE("vocabulary.xml");
static const std::string VOCAB_A_CONFIG_FILE(get_vocabulary_path() + "a.xml");
static const std::string VOCAB_B_CONFIG_FILE(get_vocabulary_path() + "b.xml");


/// cleans up vocabulary config files in the working directory
void cleanup_config_files(void)
{
	cleanup_vocab_config_files();

	if (boost::filesystem::exists(VOCAB_NEW_CONFIG_FILE))
		boost::filesystem::remove(VOCAB_NEW_CONFIG_FILE);

	if (boost::filesystem::exists(VOCAB_DEFAULT_CONFIG_FILE))
		boost::filesystem::remove(VOCAB_DEFAULT_CONFIG_FILE);
}


/// fixture for unit tests on newly created VocabularyConfig 
class NewVocabularyConfig_F : public VocabularyConfig {
public:
	NewVocabularyConfig_F() {
		cleanup_config_files();
	}
	~NewVocabularyConfig_F() {
	}
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(NewVocabularyConfig_S, 
									   boost::mpl::list<NewVocabularyConfig_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigIsNotOpen) {
	BOOST_CHECK(!F::configIsOpen());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAccessors) {
	F::setConfigFile(VOCAB_A_CONFIG_FILE);
	BOOST_CHECK_EQUAL(F::getConfigFile(), VOCAB_A_CONFIG_FILE);
	F::setConfigFile(VOCAB_B_CONFIG_FILE);
	BOOST_CHECK_EQUAL(F::getConfigFile(), VOCAB_B_CONFIG_FILE);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetConfigFileBeforeSettingConfigFile) {
	BOOST_CHECK_EQUAL(F::getConfigFile(), VOCAB_DEFAULT_CONFIG_FILE);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenConfigFileThatDoesNotExist) {
	BOOST_CHECK_THROW(F::openConfigFile(), ConfigManager::MissingConfigFileException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkCreateNewConfigFile) {
	F::setConfigFile(VOCAB_NEW_CONFIG_FILE);
	BOOST_CHECK_NO_THROW(F::createConfigFile());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkAddTermBeforeOpening) {
	Vocabulary::Term new_term("urn:vocab:test#new-null-term");
	BOOST_CHECK_THROW(F::addTerm(new_term), ConfigManager::ConfigNotOpenException);
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for unit tests on newly opened VocabularyConfig with non-pre-existing config file
class VocabularyConfigWithNewConfigFileOpen_F : public NewVocabularyConfig_F {
public:
	VocabularyConfigWithNewConfigFileOpen_F() {
		// open up a new Vocabulary configuration file
		setConfigFile(VOCAB_NEW_CONFIG_FILE);
		createConfigFile();
	}
	~VocabularyConfigWithNewConfigFileOpen_F() {
	}
	bool configFileContainsExpression(const boost::regex& regex) {
		boost::filesystem::ifstream in(VOCAB_NEW_CONFIG_FILE);
		std::string file_contents;
		char c;
		while (in.get(c)) file_contents += c;
		return boost::regex_search(file_contents, regex);
	}

};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(VocabularyConfigWithNewConfigFileOpen_S, 
									   boost::mpl::list<VocabularyConfigWithNewConfigFileOpen_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigIsOpen) {
	BOOST_CHECK(F::configIsOpen());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOpenConfigFileAgain) {
	BOOST_CHECK_NO_THROW(F::openConfigFile());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSizeEqualsZero) {
	BOOST_CHECK_EQUAL(F::getVocabulary().size(), static_cast<size_t>(0));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileWasCreated) {
	BOOST_CHECK(boost::filesystem::exists(VOCAB_NEW_CONFIG_FILE));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkAddTerm) {
	// create a new term to add
	Vocabulary::Term new_term("urn:vocab:test#new-float-number");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	new_term.term_comment = "A floating-point number";
	
	// add the term to the vocabulary
	F::addTerm(new_term);
	
	// look up the term using the ID
	BOOST_CHECK(F::getVocabulary().findTerm(new_term.term_id) != Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSizeAfterAddingTerm) {
	// create a new term to add
	Vocabulary::Term new_term("urn:vocab:test#new-float-number");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	new_term.term_comment = "A floating-point number";
	
	// add the term to the vocabulary
	F::addTerm(new_term);
	
	// size should now be one, since it was zero before
	BOOST_CHECK_EQUAL(F::getVocabulary().size(), static_cast<size_t>(1));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterAddingTerm) {
	// create a new term to add
	Vocabulary::Term new_term("urn:vocab:test#new-float-number");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	new_term.term_comment = "A floating-point number";
	
	// add the term to the vocabulary
	F::addTerm(new_term);
	
	BOOST_CHECK(F::configFileContainsExpression(boost::regex("<Term id=\"urn:vocab:test#new-float-number\"")));
	BOOST_CHECK(F::configFileContainsExpression(boost::regex("<Type>float</Type>")));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterAddingEmptyTerm) {
	// create a new term without specifying a type
	Vocabulary::Term new_term("urn:vocab:test#empty");
	
	// add the term to the vocabulary
	F::addTerm(new_term);
	
	BOOST_CHECK(F::configFileContainsExpression(boost::regex("<Type>null</Type>")));
}

BOOST_AUTO_TEST_SUITE_END()

	
/// fixture for unit tests on newly opened VocabularyConfig with pre-existing config file
class VocabularyConfigWithPreExistingConfigFileOpen_F : public NewVocabularyConfig_F {
public:
	VocabularyConfigWithPreExistingConfigFileOpen_F() {
		// open up an existing Vocabulary configuration file
		setConfigFile(VOCAB_A_CONFIG_FILE);
		openConfigFile();
	}
	~VocabularyConfigWithPreExistingConfigFileOpen_F() {
	}
	bool configFileContainsExpression(const boost::regex& regex) {
		boost::filesystem::ifstream in(VOCAB_A_CONFIG_FILE);
		std::string file_contents;
		char c;
		while (in.get(c)) file_contents += c;
		return boost::regex_search(file_contents, regex);
	}
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(VocabularyConfigWithPreExistingConfigFileOpen_S, 
									   boost::mpl::list<VocabularyConfigWithPreExistingConfigFileOpen_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigIsOpen) {
	BOOST_CHECK(F::configIsOpen());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSizeEqualsSix) {
	BOOST_CHECK_EQUAL(F::getVocabulary().size(), static_cast<size_t>(6));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkVocabularyConfigOptionValues) {
	BOOST_CHECK_EQUAL(F::getId(), "urn:vocab:test");
	BOOST_CHECK_EQUAL(F::getName(), "Vocabulary A");
	BOOST_CHECK_EQUAL(F::getComment(), "Vocabulary for Unit Tests");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkChangeId) {
	const std::string new_value("urn:vocab:new_id");
	F::setId(new_value);
	BOOST_CHECK_EQUAL(F::getId(), new_value);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkChangeName) {
	const std::string new_value("test");
	F::setName(new_value);
	BOOST_CHECK_EQUAL(F::getName(), new_value);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkChangeComment) {
	const std::string new_value("A new comment");
	F::setComment(new_value);
	BOOST_CHECK_EQUAL(F::getComment(), new_value);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkChangeLocking) {
	F::setLocked(true);
	BOOST_CHECK_EQUAL(F::getLocked(), true);
	F::setLocked(true);
	BOOST_CHECK_EQUAL(F::getLocked(), true);
	F::setLocked(false);
	BOOST_CHECK_EQUAL(F::getLocked(), false);
	F::setLocked(false);
	BOOST_CHECK_EQUAL(F::getLocked(), false);
	F::setLocked(true);
	BOOST_CHECK_EQUAL(F::getLocked(), true);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkAddDuplicateTerm) {
	// check throw if we try adding a term with the same ID as an existing term
	Vocabulary::Term temp_term("urn:vocab:test#simple-object");
	BOOST_CHECK_THROW(F::addTerm(temp_term), Vocabulary::DuplicateTermException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveTermFailures) {
	// try to remove Term using empty ID
	BOOST_CHECK_THROW(F::removeTerm(""), Vocabulary::TermNotFoundException);
	
	// try to remove Term using an unknown ID
	BOOST_CHECK_THROW(F::removeTerm("unknown"), Vocabulary::TermNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveTerm) {
	F::removeTerm("urn:vocab:test#null-term");
	
	// make sure Term is gone
	BOOST_CHECK_EQUAL(F::getVocabulary().findTerm("urn:vocab:test#null-term"), Vocabulary::UNDEFINED_TERM_REF);
	
	// make sure that the TermRef is still valid (should point to the undefined Term)
	BOOST_CHECK_EQUAL(F::getVocabulary()[1].term_ref, Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterRemovingTerm) {
	// first check that the expected expression is in the file before removing the Term
	BOOST_CHECK(F::configFileContainsExpression(boost::regex("<Term id=\"urn:vocab:test#null-term\"/>")));

	F::removeTerm("urn:vocab:test#null-term");
	
	// now check that the expression is no longer in the file
	BOOST_CHECK(!F::configFileContainsExpression(boost::regex("<Term id=\"urn:vocab:test#null-term\"/>")));
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for unit tests on newly opened VocabularyConfig with bound Vocabulary
class BoundVocabularyConfig_F : public VocabularyConfigWithPreExistingConfigFileOpen_F {
public:
	BoundVocabularyConfig_F() {
		// associate our Vocabulary with the config manager
		bind(m_vocabulary);
	}
	~BoundVocabularyConfig_F() {
	}

	Vocabulary			m_vocabulary;
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(BoundVocabularyConfig_S, 
									   boost::mpl::list<BoundVocabularyConfig_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSizeEqualsFive) {
	// there should be five terms defined in the config file
	BOOST_CHECK_EQUAL(F::getVocabulary().size(), static_cast<size_t>(6));
	BOOST_CHECK_EQUAL(F::m_vocabulary.size(), static_cast<size_t>(6));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkIdValues) {
	// check term_id values
	BOOST_CHECK_EQUAL(F::m_vocabulary[1].term_id, "urn:vocab:test#null-term");
	BOOST_CHECK_EQUAL(F::m_vocabulary[2].term_id, "urn:vocab:test#plain-old-int");
	BOOST_CHECK_EQUAL(F::m_vocabulary[3].term_id, "urn:vocab:test#big-int");
	BOOST_CHECK_EQUAL(F::m_vocabulary[4].term_id, "urn:vocab:test#fixed-text");
	BOOST_CHECK_EQUAL(F::m_vocabulary[5].term_id, "urn:vocab:test#date");
	BOOST_CHECK_EQUAL(F::m_vocabulary[6].term_id, "urn:vocab:test#simple-object");
	BOOST_CHECK_EQUAL(F::getVocabulary()[1].term_id, "urn:vocab:test#null-term");
	BOOST_CHECK_EQUAL(F::getVocabulary()[2].term_id, "urn:vocab:test#plain-old-int");
	BOOST_CHECK_EQUAL(F::getVocabulary()[3].term_id, "urn:vocab:test#big-int");
	BOOST_CHECK_EQUAL(F::getVocabulary()[4].term_id, "urn:vocab:test#fixed-text");
	BOOST_CHECK_EQUAL(F::getVocabulary()[5].term_id, "urn:vocab:test#date");
	BOOST_CHECK_EQUAL(F::getVocabulary()[6].term_id, "urn:vocab:test#simple-object");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkCommentValues) {
	// check data type values
	BOOST_CHECK_EQUAL(F::m_vocabulary[1].term_comment, "");
	BOOST_CHECK_EQUAL(F::m_vocabulary[2].term_comment, "A plain, old integer number");
	BOOST_CHECK_EQUAL(F::m_vocabulary[3].term_comment, "A really big positive integer");
	BOOST_CHECK_EQUAL(F::m_vocabulary[4].term_comment, "Ten bytes of text");
	BOOST_CHECK_EQUAL(F::m_vocabulary[5].term_comment, "A specific date");
	BOOST_CHECK_EQUAL(F::m_vocabulary[6].term_comment, "An object containing other Terms");
	BOOST_CHECK_EQUAL(F::getVocabulary()[1].term_comment, "");
	BOOST_CHECK_EQUAL(F::getVocabulary()[2].term_comment, "A plain, old integer number");
	BOOST_CHECK_EQUAL(F::getVocabulary()[3].term_comment, "A really big positive integer");
	BOOST_CHECK_EQUAL(F::getVocabulary()[4].term_comment, "Ten bytes of text");
	BOOST_CHECK_EQUAL(F::getVocabulary()[5].term_comment, "A specific date");
	BOOST_CHECK_EQUAL(F::getVocabulary()[6].term_comment, "An object containing other Terms");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkDataTypeValues) {
	// check data type values
	BOOST_CHECK_EQUAL(F::m_vocabulary[1].term_type, Vocabulary::TYPE_NULL);
	BOOST_CHECK_EQUAL(F::m_vocabulary[2].term_type, Vocabulary::TYPE_INT16);
	BOOST_CHECK_EQUAL(F::m_vocabulary[3].term_type, Vocabulary::TYPE_UINT64);
	BOOST_CHECK_EQUAL(F::m_vocabulary[4].term_type, Vocabulary::TYPE_CHAR);
	BOOST_CHECK_EQUAL(F::m_vocabulary[5].term_type, Vocabulary::TYPE_DATE_TIME);
	BOOST_CHECK_EQUAL(F::m_vocabulary[6].term_type, Vocabulary::TYPE_OBJECT);
	BOOST_CHECK_EQUAL(F::getVocabulary()[1].term_type, Vocabulary::TYPE_NULL);
	BOOST_CHECK_EQUAL(F::getVocabulary()[2].term_type, Vocabulary::TYPE_INT16);
	BOOST_CHECK_EQUAL(F::getVocabulary()[3].term_type, Vocabulary::TYPE_UINT64);
	BOOST_CHECK_EQUAL(F::getVocabulary()[4].term_type, Vocabulary::TYPE_CHAR);
	BOOST_CHECK_EQUAL(F::getVocabulary()[5].term_type, Vocabulary::TYPE_DATE_TIME);
	BOOST_CHECK_EQUAL(F::getVocabulary()[6].term_type, Vocabulary::TYPE_OBJECT);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkDataTypeSizes) {
	// check data type values
	BOOST_CHECK_EQUAL(F::m_vocabulary[1].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::m_vocabulary[2].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::m_vocabulary[3].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::m_vocabulary[4].term_size, static_cast<size_t>(10));
	BOOST_CHECK_EQUAL(F::m_vocabulary[5].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::m_vocabulary[6].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::getVocabulary()[1].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::getVocabulary()[2].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::getVocabulary()[3].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::getVocabulary()[4].term_size, static_cast<size_t>(10));
	BOOST_CHECK_EQUAL(F::getVocabulary()[5].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(F::getVocabulary()[6].term_size, static_cast<size_t>(0));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkDataTypeFormats) {
	// check data format values
	BOOST_CHECK_EQUAL(F::m_vocabulary[1].term_format, "");
	BOOST_CHECK_EQUAL(F::m_vocabulary[2].term_format, "");
	BOOST_CHECK_EQUAL(F::m_vocabulary[3].term_format, "");
	BOOST_CHECK_EQUAL(F::m_vocabulary[4].term_format, "");
	BOOST_CHECK_EQUAL(F::m_vocabulary[5].term_format, "%Y-%m-%d");
	BOOST_CHECK_EQUAL(F::m_vocabulary[6].term_format, "");
	BOOST_CHECK_EQUAL(F::getVocabulary()[1].term_format, "");
	BOOST_CHECK_EQUAL(F::getVocabulary()[2].term_format, "");
	BOOST_CHECK_EQUAL(F::getVocabulary()[3].term_format, "");
	BOOST_CHECK_EQUAL(F::getVocabulary()[4].term_format, "");
	BOOST_CHECK_EQUAL(F::getVocabulary()[5].term_format, "%Y-%m-%d");
	BOOST_CHECK_EQUAL(F::getVocabulary()[6].term_format, "");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkAddNewTerm) {
	// create a new term to add
	Vocabulary::Term new_term("urn:vocab:test#floating-point-number");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	new_term.term_comment = "A floating-point number";
	
	// add the term to the vocabulary
	F::addTerm(new_term);

	// look up the term using the ID
	Vocabulary::TermRef term_ref = F::m_vocabulary.findTerm(new_term.term_id);
	BOOST_CHECK_EQUAL(term_ref, static_cast<Vocabulary::TermRef>(7));
	term_ref = F::getVocabulary().findTerm(new_term.term_id);
	BOOST_CHECK_EQUAL(term_ref, static_cast<Vocabulary::TermRef>(7));
	
	// check Term member values
	BOOST_CHECK_EQUAL(F::m_vocabulary[term_ref].term_id, new_term.term_id);
	BOOST_CHECK_EQUAL(F::m_vocabulary[term_ref].term_comment, new_term.term_comment);
	BOOST_CHECK_EQUAL(F::m_vocabulary[term_ref].term_type, new_term.term_type);
	BOOST_CHECK_EQUAL(F::m_vocabulary[term_ref].term_size, new_term.term_size);
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_id, new_term.term_id);
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_comment, new_term.term_comment);
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_type, new_term.term_type);
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_size, new_term.term_size);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveTerm) {
	// remove the Term
	F::removeTerm("urn:vocab:test#null-term");
	
	// make sure it is gone
	BOOST_CHECK_EQUAL(F::m_vocabulary.findTerm("urn:vocab:test#null-term"), Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK_EQUAL(F::getVocabulary().findTerm("urn:vocab:test#null-term"), Vocabulary::UNDEFINED_TERM_REF);
	
	// make sure that the TermRef is still valid (should point to the undefined Term)
	BOOST_CHECK_EQUAL(F::m_vocabulary[1].term_ref, Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK_EQUAL(F::getVocabulary()[1].term_ref, Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUpdateExistingTerm) {
	// update the null term so that it is a string
	Vocabulary::Term updated_term("urn:vocab:test#null-term");
	updated_term.term_type = Vocabulary::TYPE_STRING;
	updated_term.term_comment = "No longer a null term (now a string)!";
	F::updateTerm(updated_term);
	
	// check Term member values
	Vocabulary::TermRef term_ref = F::m_vocabulary.findTerm("urn:vocab:test#null-term");
	BOOST_CHECK_EQUAL(F::m_vocabulary[term_ref].term_type, updated_term.term_type);
	BOOST_CHECK_EQUAL(F::m_vocabulary[term_ref].term_comment, updated_term.term_comment);
	term_ref = F::getVocabulary().findTerm("urn:vocab:test#null-term");
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_type, updated_term.term_type);
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_comment, updated_term.term_comment);	

	//What if updated_term is actually a new term?
}

BOOST_AUTO_TEST_SUITE_END()


typedef boost::mpl::list<VocabularyConfigWithNewConfigFileOpen_F, 
						 VocabularyConfigWithPreExistingConfigFileOpen_F> type_list_1;

// AnyVocabularyConfig_S contains tests that should pass for a VocabularyConfig with any config file open
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(VocabularyConfigWithConfigFileOpen_S, type_list_1)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterChangingId) {
	F::setId("urn:vocab:new_id");
	BOOST_CHECK(F::configFileContainsExpression(boost::regex("<Vocabulary id=\"urn:vocab:new_id\"")));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterChangingName) {
	F::setName("test");
	BOOST_CHECK(F::configFileContainsExpression(boost::regex("<Name>test</Name>")));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterChangingComment) {
	F::setComment("A new comment");
	BOOST_CHECK(F::configFileContainsExpression(boost::regex("<Comment>A new comment</Comment>")));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterChangingLock) {
	F::setLocked(true);
	BOOST_CHECK(F::configFileContainsExpression(boost::regex("<Locked>true</Locked>")));
	F::setLocked(false);
	bool explicitly_false = F::configFileContainsExpression(boost::regex("<Locked>false</Locked>"));
	bool implicitly_false = !F::configFileContainsExpression(boost::regex("<Locked>"));
	BOOST_CHECK(explicitly_false || implicitly_false);
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for unit tests on newly opened VocabularyConfig with bound Vocabulary
class VocabularyConfigWithNewTermAdded_F : public VocabularyConfigWithNewConfigFileOpen_F {
public:
	VocabularyConfigWithNewTermAdded_F()
		: m_new_term("urn:vocab:test#new-float-number"),
		  m_expectedExpression("<Term id=\"urn:vocab:test#new-float-number\">\\s*"
							   "<Type>float</Type>\\s*"
							   "<Comment>A floating-point number</Comment>\\s*"
							   "</Term>"),
		  m_updated_term_ptr(NULL)
	{
		// create a new term to add
		//Vocabulary::Term new_term("urn:vocab:test#new-float-number");
		m_new_term.term_type = Vocabulary::TYPE_FLOAT;
		m_new_term.term_comment = "A floating-point number";
		
		BOOST_CHECK_NO_THROW(addTerm(m_new_term));
	}
	~VocabularyConfigWithNewTermAdded_F() {
		delete m_updated_term_ptr;
	}
	const Vocabulary::Term& updatedTerm(void) {
		if (m_updated_term_ptr == NULL) {
			m_updated_term_ptr = new Vocabulary::Term(m_new_term);
			m_updated_term_ptr->term_type = Vocabulary::TYPE_STRING;
			m_updated_term_ptr->term_comment = "was a float, now a string";
		}
		return *m_updated_term_ptr;
	}

	Vocabulary::Term	m_new_term;
	boost::regex		m_expectedExpression;
	Vocabulary::Term*	m_updated_term_ptr;
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(VocabularyConfigWithNewTermAdded_S, 
									   boost::mpl::list<VocabularyConfigWithNewTermAdded_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkFindTerm) {
	// look up the term using the ID and confirm that it's defined
	BOOST_CHECK(F::getVocabulary().findTerm(F::m_new_term.term_id) != Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFile) {
	BOOST_CHECK(F::configFileContainsExpression(F::m_expectedExpression));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSize) {
	BOOST_CHECK_EQUAL(F::getVocabulary().size(), static_cast<size_t>(1));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkFindTermAfterRemovingTerm) {
	F::removeTerm(F::m_new_term.term_id);
	
	// look up the term using the ID and confirm that it's now undefined
	BOOST_CHECK(F::getVocabulary().findTerm(F::m_new_term.term_id) == Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterRemovingTerm) {
	F::removeTerm(F::m_new_term.term_id);
	
	// check that the expression is no longer in the file
	BOOST_CHECK(!F::configFileContainsExpression(F::m_expectedExpression));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkSizeAfterRemovingTerm) {
	F::removeTerm(F::m_new_term.term_id);

	// size should still be 1, because there's still an entry for the removed term,
	// (which now indicates that it's undefined)
	BOOST_CHECK_EQUAL(F::getVocabulary().size(), static_cast<size_t>(1));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUpdateTerm) {
	// call updateTerm() with a Term that's a modified copy of the original Term
	F::updateTerm(F::updatedTerm());

	// check Term member values
	Vocabulary::TermRef term_ref = F::getVocabulary().findTerm(F::m_new_term.term_id);
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_type, F::updatedTerm().term_type);
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_comment, F::updatedTerm().term_comment);	
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUpdateTermWithTermNotAdded) {
	// call updateTerm() with a different Term, i.e. one with a different ID than the Term that was added
	Vocabulary::Term different_term("urn:vocab:test#something-new");
	BOOST_CHECK_THROW(F::updateTerm(different_term), Vocabulary::TermNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkConfigFileAfterUpdatingTerm) {
	// call updateTerm() with a Term that's a modified copy of the original Term
	F::updateTerm(F::updatedTerm());

	// check that the old expression is no longer in the file
	BOOST_CHECK(!F::configFileContainsExpression(F::m_expectedExpression));

	// check that an updated expression is in the file
	boost::regex newExpectedExpression("<Term id=\"urn:vocab:test#new-float-number\">\\s*"
									   "<Type>string</Type>\\s*"
									   "<Comment>was a float, now a string</Comment>\\s*"
									   "</Term>");
	BOOST_CHECK(F::configFileContainsExpression(newExpectedExpression));
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for unit tests on an open VocabularyConfig after locking it
class LockedVocabularyConfig_F : public VocabularyConfigWithPreExistingConfigFileOpen_F {
public:
	LockedVocabularyConfig_F()
	{
		setLocked(true);
		BOOST_CHECK_EQUAL(getLocked(), true);
	}
	~LockedVocabularyConfig_F() {
	}
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(LockedVocabularyConfig_S, 
									   boost::mpl::list<LockedVocabularyConfig_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkChangeName) {
	const std::string new_value("new name for test");
	F::setName(new_value);
	BOOST_CHECK_EQUAL(F::getName(), new_value);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUnlock) {
	F::setLocked(false);
	BOOST_CHECK_EQUAL(F::getLocked(), false);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkAddTerm) {
	Vocabulary::Term new_term("urn:vocab:test#another-float");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	BOOST_CHECK_THROW(F::addTerm(new_term), VocabularyConfig::VocabularyIsLockedException);

	// make sure Term was not added
	BOOST_CHECK(F::getVocabulary().findTerm("urn:vocab:test#another-float") == Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkUpdateTerm) {
	Vocabulary::TermRef term_ref = F::getVocabulary().findTerm("urn:vocab:test#big-int");
	Vocabulary::DataType original_type = F::getVocabulary()[term_ref].term_type;
	std::string original_comment = F::getVocabulary()[term_ref].term_comment;

	Vocabulary::Term updated_term("urn:vocab:test#big-int");
	updated_term.term_type = Vocabulary::TYPE_UINT32;
	updated_term.term_comment = "not quite so big int";
	BOOST_CHECK_THROW(F::updateTerm(updated_term), VocabularyConfig::VocabularyIsLockedException);

	// make sure Term was not updated
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_type, original_type);
	BOOST_CHECK_EQUAL(F::getVocabulary()[term_ref].term_comment, original_comment);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkRemoveTerm) {
	BOOST_CHECK_THROW(F::removeTerm("urn:vocab:test#null-term"), VocabularyConfig::VocabularyIsLockedException);

	// make sure Term was not removed
	BOOST_CHECK(F::getVocabulary().findTerm("urn:vocab:test#null-term") != Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_SUITE_END()


typedef boost::mpl::list<NewVocabularyConfig_F,
						 VocabularyConfigWithNewConfigFileOpen_F, 
						 VocabularyConfigWithPreExistingConfigFileOpen_F> type_list_2;

// AnyVocabularyConfig_S contains tests that should pass for a VocabularyConfig in any state
BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(AnyVocabularyConfig_S, type_list_2)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkIdAccessors) {
	const std::string new_value("urn:vocab:test_new");
	F::setId(new_value);
	BOOST_CHECK_EQUAL(F::getId(), new_value);
	const std::string newer_value("urn:vocab:test_newer");
	F::setId(newer_value);
	BOOST_CHECK_EQUAL(F::getId(), newer_value);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkNameAccessors) {
	const std::string new_value("new");
	F::setName(new_value);
	BOOST_CHECK_EQUAL(F::getName(), new_value);
	const std::string newer_value("newer");
	F::setName(newer_value);
	BOOST_CHECK_EQUAL(F::getName(), newer_value);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkCommentAccessors) {
	const std::string new_value("This is a new Vocabulary");
	F::setComment(new_value);
	BOOST_CHECK_EQUAL(F::getComment(), new_value);
	const std::string newer_value("This is a newer Vocabulary");
	F::setComment(newer_value);
	BOOST_CHECK_EQUAL(F::getComment(), newer_value);
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for unit tests on a newly created VocabularyManager
class NewVocabularyManager_F : public VocabularyManager {
public:
	NewVocabularyManager_F() {
		cleanup_config_files();
	}
	~NewVocabularyManager_F() {
	}
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(NewVocabularyManager_S, 
									   boost::mpl::list<NewVocabularyManager_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkLoadConfigFile) {
	BOOST_CHECK_NO_THROW(F::setConfigFile(VOCABS_CONFIG_FILE));
	BOOST_CHECK_NO_THROW(F::openConfigFile());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkMethodsTakingIds) {
	// These should all throw VocabularyManager::VocabularyNotFoundException, since no vocabularies have been loaded.
	BOOST_CHECK_THROW(F::setName("urn:vocab:id1", "new_name"), VocabularyManager::VocabularyNotFoundException);
	BOOST_CHECK_THROW(F::getName("urn:vocab:id1"), VocabularyManager::VocabularyNotFoundException);
	BOOST_CHECK_THROW(F::setComment("urn:vocab:id2", "new_comment"), VocabularyManager::VocabularyNotFoundException);
	BOOST_CHECK_THROW(F::getComment("urn:vocab:id2"), VocabularyManager::VocabularyNotFoundException);
	Vocabulary::Term new_term("some_uri");
	BOOST_CHECK_THROW(F::addTerm("urn:vocab:id3", new_term), VocabularyManager::VocabularyNotFoundException);
	BOOST_CHECK_THROW(F::updateTerm("urn:vocab:id4", new_term), VocabularyManager::VocabularyNotFoundException);
	BOOST_CHECK_THROW(F::removeTerm("urn:vocab:id5", "some_term_id"), VocabularyManager::VocabularyNotFoundException);
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetVocabulary) {
	BOOST_CHECK_NO_THROW(F::getVocabulary());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkVocabularySizeEqualsZero) {
	BOOST_CHECK_EQUAL(F::getVocabulary().size(), static_cast<size_t>(0));
}

BOOST_AUTO_TEST_SUITE_END()


/// fixture for unit tests on a VocabularyManager with two config files loaded
class VocabularyManagerWithConfigFilesLoaded_F : public NewVocabularyManager_F {
public:
	VocabularyManagerWithConfigFilesLoaded_F() {
		setConfigFile(VOCABS_CONFIG_FILE);
		openConfigFile();

		// It doesn't seem like the user should have to provide both the file name and the ID, since the ID is in the file.
		// Consider having loadConfigFile return the ID.
		m_vocab_a_id = "urn:vocab:test";
		m_vocab_b_id = "urn:vocab:test_b";
	}
	~VocabularyManagerWithConfigFilesLoaded_F() {
	}

	std::string m_vocab_a_id;
	std::string m_vocab_b_id;
};

BOOST_AUTO_TEST_SUITE_FIXTURE_TEMPLATE(VocabularyManagerWithConfigFilesLoaded_S, 
									   boost::mpl::list<VocabularyManagerWithConfigFilesLoaded_F>)

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkGetVocabulary) {
	BOOST_CHECK_NO_THROW(F::getVocabulary());
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkVocabularySizeIsCorrect) {
	// there should be 45 terms defined in the (three) config files
	// instead of comparing ==78, using >=83 for now
	BOOST_CHECK_GE(F::getVocabulary().size(), static_cast<size_t>(83));
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkOptionValues) {
	BOOST_CHECK_EQUAL(F::getName(F::m_vocab_a_id), "Vocabulary A");
	BOOST_CHECK_EQUAL(F::getComment(F::m_vocab_a_id), "Vocabulary for Unit Tests");

	BOOST_CHECK_EQUAL(F::getName(F::m_vocab_b_id), "Vocabulary B");
	BOOST_CHECK_EQUAL(F::getComment(F::m_vocab_b_id), "Another Vocabulary for Unit Tests");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkNameAccessors) {
	F::setName(F::m_vocab_a_id, "new_name_a");
	F::setName(F::m_vocab_b_id, "new_name_b");
	BOOST_CHECK_EQUAL(F::getName(F::m_vocab_a_id), "new_name_a");
	BOOST_CHECK_EQUAL(F::getName(F::m_vocab_b_id), "new_name_b");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkCommentAccessors) {
	F::setComment(F::m_vocab_a_id, "New comment a");
	F::setComment(F::m_vocab_b_id, "New comment b");
	BOOST_CHECK_EQUAL(F::getComment(F::m_vocab_a_id), "New comment a");
	BOOST_CHECK_EQUAL(F::getComment(F::m_vocab_b_id), "New comment b");
}

BOOST_AUTO_TEST_CASE_FIXTURE_TEMPLATE(checkTermIds) {
	// check term_id values
	const Vocabulary& universal_vocab = F::getVocabulary();
	BOOST_CHECK(universal_vocab.findTerm("urn:vocab:test#null-term") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:vocab:test#plain-old-int") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:vocab:test#big-int") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:vocab:test#fixed-text") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:vocab:test#simple-object") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:vocab:test_b#b-null-term") != Vocabulary::UNDEFINED_TERM_REF);
	BOOST_CHECK(universal_vocab.findTerm("urn:vocab:test_b#b-int") != Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_SUITE_END()

// TODO:
// void registerForUpdates(VocabularyUpdateFunction f)

