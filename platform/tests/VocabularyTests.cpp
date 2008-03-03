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


class VocabularyWithSomeTermsAdded_F : public Vocabulary {
public:
	VocabularyWithSomeTermsAdded_F()
		: m_null_term("urn:vocab:test#null-term"), m_plain_int_term("urn:vocab:test#plain-old-int"),
		m_big_int_term("urn:vocab:test#big-int"), m_fixed_term("urn:vocab:test#fixed-text"),
		m_date_term("urn:vocab:test#date"), m_object_term("urn:vocab:test#simple-object")
	{
		setup_logging_for_unit_tests();
		// initialize our initial term set
		m_null_term.term_ref = static_cast<Vocabulary::TermRef>(1);
		m_plain_int_term.term_ref = static_cast<Vocabulary::TermRef>(2);
		m_big_int_term.term_ref = static_cast<Vocabulary::TermRef>(3);
		m_fixed_term.term_ref = static_cast<Vocabulary::TermRef>(4);
		m_date_term.term_ref = static_cast<Vocabulary::TermRef>(5);
		m_object_term.term_ref = static_cast<Vocabulary::TermRef>(6);
		m_null_term.term_type = Vocabulary::TYPE_NULL;
		m_plain_int_term.term_type = Vocabulary::TYPE_INT16;
		m_big_int_term.term_type = Vocabulary::TYPE_UINT64;
		m_fixed_term.term_type = Vocabulary::TYPE_CHAR;
		m_date_term.term_type = Vocabulary::TYPE_DATE_TIME;
		m_object_term.term_type = Vocabulary::TYPE_OBJECT;
		m_null_term.term_comment = "A plain, old integer number";
		m_plain_int_term.term_comment = "A plain, old integer number";
		m_big_int_term.term_comment = "A really big positive integer";
		m_fixed_term.term_comment = "Ten bytes of text";
		m_date_term.term_comment = "A specific date";
		m_object_term.term_comment = "An object containing other Terms";
		m_fixed_term.term_size = 10;
		m_date_term.term_format = "%Y-%m-%d";
		addAllTerms();
	}
	~VocabularyWithSomeTermsAdded_F() {
	}
	void addAllTerms() {
		addTerm(m_null_term);
		addTerm(m_plain_int_term);
		addTerm(m_big_int_term);
		addTerm(m_fixed_term);
		addTerm(m_date_term);
		addTerm(m_object_term);
	}

	Vocabulary::Term	m_null_term;
	Vocabulary::Term	m_plain_int_term;
	Vocabulary::Term	m_big_int_term;
	Vocabulary::Term	m_fixed_term;
	Vocabulary::Term	m_date_term;
	Vocabulary::Term	m_object_term;
};

BOOST_FIXTURE_TEST_SUITE(VocabularyWithSomeTermsAdded_S, VocabularyWithSomeTermsAdded_F)

BOOST_AUTO_TEST_CASE(checkVocabularyIdValues) {
	// check term_id values
	BOOST_CHECK_EQUAL((*this)[1].term_id, m_null_term.term_id);
	BOOST_CHECK_EQUAL((*this)[2].term_id, m_plain_int_term.term_id);
	BOOST_CHECK_EQUAL((*this)[3].term_id, m_big_int_term.term_id);
	BOOST_CHECK_EQUAL((*this)[4].term_id, m_fixed_term.term_id);
	BOOST_CHECK_EQUAL((*this)[5].term_id, m_date_term.term_id);
	BOOST_CHECK_EQUAL((*this)[6].term_id, m_object_term.term_id);
}

BOOST_AUTO_TEST_CASE(checkVocabularyCommentValues) {
	// check data type values
	BOOST_CHECK_EQUAL((*this)[1].term_comment, m_null_term.term_comment);
	BOOST_CHECK_EQUAL((*this)[2].term_comment, m_plain_int_term.term_comment);
	BOOST_CHECK_EQUAL((*this)[3].term_comment, m_big_int_term.term_comment);
	BOOST_CHECK_EQUAL((*this)[4].term_comment, m_fixed_term.term_comment);
	BOOST_CHECK_EQUAL((*this)[5].term_comment, m_date_term.term_comment);
	BOOST_CHECK_EQUAL((*this)[6].term_comment, m_object_term.term_comment);
}

BOOST_AUTO_TEST_CASE(checkVocabularyDataTypeValues) {
	// check data type values
	BOOST_CHECK_EQUAL((*this)[1].term_type, m_null_term.term_type);
	BOOST_CHECK_EQUAL((*this)[2].term_type, m_plain_int_term.term_type);
	BOOST_CHECK_EQUAL((*this)[3].term_type, m_big_int_term.term_type);
	BOOST_CHECK_EQUAL((*this)[4].term_type, m_fixed_term.term_type);
	BOOST_CHECK_EQUAL((*this)[5].term_type, m_date_term.term_type);
	BOOST_CHECK_EQUAL((*this)[6].term_type, m_object_term.term_type);
}

BOOST_AUTO_TEST_CASE(checkVocabularyDataTypeSizes) {
	// check data type values
	BOOST_CHECK_EQUAL((*this)[1].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL((*this)[2].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL((*this)[3].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL((*this)[4].term_size, static_cast<size_t>(10));
	BOOST_CHECK_EQUAL((*this)[5].term_size, static_cast<size_t>(0));
	BOOST_CHECK_EQUAL((*this)[6].term_size, static_cast<size_t>(0));
}

BOOST_AUTO_TEST_CASE(checkVocabularyDataTypeFormats) {
	// check data format values
	BOOST_CHECK_EQUAL((*this)[1].term_format, m_null_term.term_format);
	BOOST_CHECK_EQUAL((*this)[2].term_format, m_plain_int_term.term_format);
	BOOST_CHECK_EQUAL((*this)[3].term_format, m_big_int_term.term_format);
	BOOST_CHECK_EQUAL((*this)[4].term_format, m_fixed_term.term_format);
	BOOST_CHECK_EQUAL((*this)[5].term_format, m_date_term.term_format);
	BOOST_CHECK_EQUAL((*this)[6].term_format, m_object_term.term_format);
}

BOOST_AUTO_TEST_CASE(checkVocabularyAddDuplicateTerm) {
	// check throw if we try adding a term with the same ID
	BOOST_CHECK_THROW(addTerm(m_plain_int_term), Vocabulary::DuplicateTermException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyRemoveTermFailures) {
	// try to remove Term using empty ID
	BOOST_CHECK_THROW(removeTerm(""), Vocabulary::TermNotFoundException);
	
	// try to remove Term using an unknown ID
	BOOST_CHECK_THROW(removeTerm("unknown"), Vocabulary::TermNotFoundException);
}

BOOST_AUTO_TEST_CASE(checkVocabularyAddNewTerm) {
	// create a new term to add
	Vocabulary::Term new_term("urn:vocab:test#floating-point-number");
	new_term.term_type = Vocabulary::TYPE_FLOAT;
	new_term.term_comment = "A floating-point number";
	
	// add the term to the vocabulary & check the return value
	BOOST_CHECK_EQUAL(addTerm(new_term), static_cast<Vocabulary::TermRef>(7));

	// look up the term using the ID
	Vocabulary::TermRef term_ref = findTerm(new_term.term_id);
	BOOST_CHECK_EQUAL(term_ref, static_cast<Vocabulary::TermRef>(7));
	
	// check Term member values
	BOOST_CHECK_EQUAL((*this)[term_ref].term_id, new_term.term_id);
	BOOST_CHECK_EQUAL((*this)[term_ref].term_comment, new_term.term_comment);
	BOOST_CHECK_EQUAL((*this)[term_ref].term_type, new_term.term_type);
	BOOST_CHECK_EQUAL((*this)[term_ref].term_size, new_term.term_size);
}

BOOST_AUTO_TEST_CASE(checkVocabularyRemoveTerm) {
	// remove the Term
	removeTerm(m_null_term.term_id);
	
	// make sure it is gone
	BOOST_CHECK_EQUAL(findTerm(m_null_term.term_id),
					  Vocabulary::UNDEFINED_TERM_REF);
	
	// make sure that the TermRef is still valid (should point to the undefined Term)
	BOOST_CHECK_EQUAL((*this)[m_null_term.term_ref].term_ref,
					  Vocabulary::UNDEFINED_TERM_REF);
}

BOOST_AUTO_TEST_CASE(checkVocabularyUpdateExistingTerm) {
	// update the null term so that it is a string
	Vocabulary::Term updated_term(m_null_term.term_id);
	updated_term.term_type = Vocabulary::TYPE_STRING;
	updated_term.term_comment = "No longer a null term (now a string)!";
	updateTerm(updated_term);
	
	// check Term member values
	Vocabulary::TermRef term_ref = findTerm(m_null_term.term_id);
	BOOST_CHECK_EQUAL((*this)[term_ref].term_type, updated_term.term_type);
	BOOST_CHECK_EQUAL((*this)[term_ref].term_comment, updated_term.term_comment);
}

BOOST_AUTO_TEST_SUITE_END()
