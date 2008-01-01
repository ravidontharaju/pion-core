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
#include <boost/filesystem/operations.hpp>
#include <boost/test/unit_test.hpp>

using namespace pion;
using namespace pion::platform;


/// sets up logging (run once only)
extern void setup_logging_for_unit_tests(void);


class VocabularyTests_F {
public:
	VocabularyTests_F()
		: m_null_term("urn:pion:null-term"), m_plain_int_term("urn:pion:plain-old-int"),
		m_big_int_term("urn:pion:big-int"), m_fixed_term("urn:pion:fixed-text"),
		m_object_term("urn:pion:simple-object")
	{
		setup_logging_for_unit_tests();
		// initialize our initial term set
		m_null_term.term_ref = static_cast<Vocabulary::TermRef>(1);
		m_plain_int_term.term_ref = static_cast<Vocabulary::TermRef>(2);
		m_big_int_term.term_ref = static_cast<Vocabulary::TermRef>(3);
		m_fixed_term.term_ref = static_cast<Vocabulary::TermRef>(4);
		m_object_term.term_ref = static_cast<Vocabulary::TermRef>(5);
		m_null_term.term_type = Vocabulary::TYPE_NULL;
		m_plain_int_term.term_type = Vocabulary::TYPE_INT16;
		m_big_int_term.term_type = Vocabulary::TYPE_UINT64;
		m_fixed_term.term_type = Vocabulary::TYPE_CHAR;
		m_object_term.term_type = Vocabulary::TYPE_OBJECT;
		m_null_term.term_comment = "A plain, old integer number";
		m_plain_int_term.term_comment = "A plain, old integer number";
		m_big_int_term.term_comment = "A really big positive integer";
		m_fixed_term.term_comment = "Ten bytes of text";
		m_object_term.term_comment = "An object containing other Terms";
		m_fixed_term.term_size = 10;
	}
	~VocabularyTests_F() {
	}
	void addAllTerms() {
		m_vocabulary.addTerm(m_null_term);
		m_vocabulary.addTerm(m_plain_int_term);
		m_vocabulary.addTerm(m_big_int_term);
		m_vocabulary.addTerm(m_fixed_term);
		m_vocabulary.addTerm(m_object_term);
		m_vocabulary.addObjectMember(m_object_term.term_id, m_plain_int_term.term_id);
		m_vocabulary.addObjectMember(m_object_term.term_id, m_big_int_term.term_id);
		m_vocabulary.addObjectMember(m_object_term.term_id, m_fixed_term.term_id);
	}

	Vocabulary			m_vocabulary;
	Vocabulary::Term	m_null_term;
	Vocabulary::Term	m_plain_int_term;
	Vocabulary::Term	m_big_int_term;
	Vocabulary::Term	m_fixed_term;
	Vocabulary::Term	m_object_term;
};

BOOST_FIXTURE_TEST_SUITE(VocabularyTests_S, VocabularyTests_F)

BOOST_AUTO_TEST_CASE(checkVocabularyIdValues) {
	// check term_id values
	addAllTerms();
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_id, m_null_term.term_id);
	BOOST_CHECK_EQUAL(m_vocabulary[2].term_id, m_plain_int_term.term_id);
	BOOST_CHECK_EQUAL(m_vocabulary[3].term_id, m_big_int_term.term_id);
	BOOST_CHECK_EQUAL(m_vocabulary[4].term_id, m_fixed_term.term_id);
	BOOST_CHECK_EQUAL(m_vocabulary[5].term_id, m_object_term.term_id);
}

BOOST_AUTO_TEST_CASE(checkVocabularyCommentValues) {
	// check data type values
	addAllTerms();
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_comment, m_null_term.term_comment);
	BOOST_CHECK_EQUAL(m_vocabulary[2].term_comment, m_plain_int_term.term_comment);
	BOOST_CHECK_EQUAL(m_vocabulary[3].term_comment, m_big_int_term.term_comment);
	BOOST_CHECK_EQUAL(m_vocabulary[4].term_comment, m_fixed_term.term_comment);
	BOOST_CHECK_EQUAL(m_vocabulary[5].term_comment, m_object_term.term_comment);
}

BOOST_AUTO_TEST_CASE(checkVocabularyDataTypeValues) {
	// check data type values
	addAllTerms();
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_type, m_null_term.term_type);
	BOOST_CHECK_EQUAL(m_vocabulary[2].term_type, m_plain_int_term.term_type);
	BOOST_CHECK_EQUAL(m_vocabulary[3].term_type, m_big_int_term.term_type);
	BOOST_CHECK_EQUAL(m_vocabulary[4].term_type, m_fixed_term.term_type);
	BOOST_CHECK_EQUAL(m_vocabulary[5].term_type, m_object_term.term_type);
}

BOOST_AUTO_TEST_CASE(checkVocabularyDataTypeSizes) {
	// check data type values
	addAllTerms();
	BOOST_CHECK_EQUAL(m_vocabulary[1].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_vocabulary[2].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_vocabulary[3].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL(m_vocabulary[4].term_size, static_cast<size_t>(10));
	BOOST_CHECK_EQUAL(m_vocabulary[5].term_size, static_cast<size_t>(0));
}

BOOST_AUTO_TEST_CASE(checkVocabularyMembersOfSimpleObjectTerm) {
	// check members of the simple-object term
	addAllTerms();
	Vocabulary::OBJECT_MEMBER_LIST member_list = m_vocabulary.getObjectMembers(m_object_term.term_ref);
	Vocabulary::OBJECT_MEMBER_LIST::const_iterator i = member_list.begin();
	BOOST_REQUIRE(i != member_list.end());
	BOOST_CHECK_EQUAL(*i, m_plain_int_term.term_ref);
	BOOST_REQUIRE(++i != member_list.end());
	BOOST_CHECK_EQUAL(*i, m_big_int_term.term_ref);
	BOOST_REQUIRE(++i != member_list.end());
	BOOST_CHECK_EQUAL(*i, m_fixed_term.term_ref);
	BOOST_CHECK(++i == member_list.end());
}

BOOST_AUTO_TEST_CASE(checkVocabularyAddNewMemberForNonObject) {
	addAllTerms();
	BOOST_CHECK_THROW(m_vocabulary.addObjectMember(m_plain_int_term.term_id,
												   m_big_int_term.term_id),
					  Vocabulary::NotObjectTermException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyAddDuplicateObjectMember) {
	addAllTerms();
	// try adding a duplicate member (should throw)
	BOOST_CHECK_THROW(m_vocabulary.addObjectMember(m_object_term.term_id,
												   m_plain_int_term.term_id),
					  Vocabulary::DuplicateMemberException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyAddDuplicateTerm) {
	addAllTerms();
	// check throw if we try adding a term with the same ID
	BOOST_CHECK_THROW(m_vocabulary.addTerm(m_plain_int_term), Vocabulary::DuplicateTermException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyRemoveTermFailures) {
	addAllTerms();
	
	// try to remove Term using empty ID
	BOOST_CHECK_THROW(m_vocabulary.removeTerm(""), Vocabulary::RemoveTermNotFoundException);
	
	// try to remove Term using an unknown ID
	BOOST_CHECK_THROW(m_vocabulary.removeTerm("unknown"), Vocabulary::RemoveTermNotFoundException);
	
	// try to remove Term that is a member of a parent object
	BOOST_CHECK_THROW(m_vocabulary.removeTerm(m_plain_int_term.term_id),
					  Vocabulary::RemoveTermHasParentsException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyAddNewObjectMember) {
	addAllTerms();
	// Add the null term to the simple-object term
	m_vocabulary.addObjectMember(m_object_term.term_id, m_null_term.term_id);
	// make sure it has been added
	Vocabulary::OBJECT_MEMBER_LIST member_list = m_vocabulary.getObjectMembers(m_object_term.term_ref);
	BOOST_CHECK_EQUAL(member_list.back(), m_null_term.term_ref);
}

BOOST_AUTO_TEST_CASE(checkVocabularyRemoveObjectMember) {
	addAllTerms();
	// remove the object member
	m_vocabulary.removeObjectMember(m_object_term.term_id, m_fixed_term.term_id);
	// make sure it is gone
	Vocabulary::OBJECT_MEMBER_LIST member_list = m_vocabulary.getObjectMembers(m_object_term.term_ref);
	for (Vocabulary::OBJECT_MEMBER_LIST::iterator i = member_list.begin();
		 i != member_list.end(); ++i)
	{
		BOOST_CHECK(*i != m_null_term.term_ref);
	}
}

BOOST_AUTO_TEST_CASE(checkVocabularyAddNewTerm) {
	addAllTerms();

	// create a new term to add
	Vocabulary::Term new_term("urn:pion::floating-point-number");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	new_term.term_comment = "A floating-point number";
	
	// add the term to the vocabulary & check the return value
	BOOST_CHECK_EQUAL(m_vocabulary.addTerm(new_term), static_cast<Vocabulary::TermRef>(6));

	// look up the term using the ID
	Vocabulary::TermRef term_ref = m_vocabulary.findTerm(new_term.term_id);
	BOOST_CHECK_EQUAL(term_ref, static_cast<Vocabulary::TermRef>(6));
	
	// check Term member values
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_id, new_term.term_id);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_comment, new_term.term_comment);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_type, new_term.term_type);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_size, new_term.term_size);
}

BOOST_AUTO_TEST_CASE(checkVocabularyRemoveTerm) {
	addAllTerms();

	// remove the Term
	m_vocabulary.removeTerm(m_null_term.term_id);
	
	// make sure it is gone
	BOOST_CHECK_EQUAL(m_vocabulary.findTerm(m_null_term.term_id),
					  Vocabulary::UNDEFINED_TERM_REF);
	
	// make sure that the TermRef is still valid (should point to the undefined Term)
	BOOST_CHECK_EQUAL(m_vocabulary[m_null_term.term_ref].term_ref,
					  Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_CASE(checkVocabularyUpdateExistingTerm) {
	addAllTerms();

	// update the null term so that it is a string
	Vocabulary::Term updated_term(m_null_term.term_id);
	updated_term.term_type = Vocabulary::TYPE_STRING;
	updated_term.term_comment = "No longer a null term (now a string)!";
	m_vocabulary.updateTerm(updated_term);
	
	// check Term member values
	Vocabulary::TermRef term_ref = m_vocabulary.findTerm(m_null_term.term_id);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_type, updated_term.term_type);
	BOOST_CHECK_EQUAL(m_vocabulary[term_ref].term_comment, updated_term.term_comment);
}

BOOST_AUTO_TEST_SUITE_END()
