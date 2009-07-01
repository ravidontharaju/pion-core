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
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <boost/test/unit_test.hpp>

using namespace pion;
using namespace pion::platform;


class EventTests_F {
public:
	EventTests_F()
		: m_null_term("urn:vocab:test#null-term"), m_plain_int_term("urn:vocab:test#plain-old-int"),
		m_big_int_term("urn:vocab:test#big-int"), m_fixed_term("urn:vocab:test#fixed-text"),
		m_date_term("urn:vocab:test#date"), m_object_term("urn:vocab:test#simple-object")
	{
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
		m_date_term.term_type = Vocabulary::TYPE_DATE;
		m_object_term.term_type = Vocabulary::TYPE_OBJECT;
		m_null_term.term_comment = "A plain, old integer number";
		m_plain_int_term.term_comment = "A plain, old integer number";
		m_big_int_term.term_comment = "A really big positive integer";
		m_fixed_term.term_comment = "Ten bytes of text";
		m_date_term.term_comment = "A date";
		m_object_term.term_comment = "An object containing other Terms";
		m_fixed_term.term_size = 10;
		m_date_term.term_format = "%Y-%m-%d";
	}
	~EventTests_F() {
	}
	void addAllTerms() {
		m_vocabulary.addTerm(m_null_term);
		m_vocabulary.addTerm(m_plain_int_term);
		m_vocabulary.addTerm(m_big_int_term);
		m_vocabulary.addTerm(m_fixed_term);
		m_vocabulary.addTerm(m_date_term);
		m_vocabulary.addTerm(m_object_term);
	}

	EventFactory		m_event_factory;
	Vocabulary			m_vocabulary;
	Vocabulary::Term	m_null_term;
	Vocabulary::Term	m_plain_int_term;
	Vocabulary::Term	m_big_int_term;
	Vocabulary::Term	m_fixed_term;
	Vocabulary::Term	m_date_term;
	Vocabulary::Term	m_object_term;
};

BOOST_FIXTURE_TEST_SUITE(EventTests_S, EventTests_F)

BOOST_AUTO_TEST_CASE(checkEventAllocatorIsOk) {
	EventAllocator event_alloc;

	void *mem_ptr = event_alloc.malloc(sizeof(Event));
	Event *event_ptr = new (mem_ptr) Event(m_object_term.term_ref, &event_alloc);
	event_ptr->setInt(m_plain_int_term.term_ref, 24);
	event_ptr->setUBigInt(m_big_int_term.term_ref, 2025221224);
	event_ptr->setDateTime(m_date_term.term_ref, PionDateTime(boost::gregorian::date(2007, 4, 5)));
	
	event_ptr->~Event();
	event_alloc.free(event_ptr, sizeof(Event));	
}

BOOST_AUTO_TEST_CASE(checkEmptyEventValues) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	BOOST_CHECK(event_ptr->empty());
	BOOST_CHECK(event_ptr->begin() == event_ptr->end());
	BOOST_CHECK(event_ptr->find(m_null_term.term_ref) == event_ptr->end());
	BOOST_CHECK(event_ptr->getPointer(m_null_term.term_ref) == NULL);
	BOOST_CHECK(! event_ptr->isDefined(m_null_term.term_ref));

	Event::ValuesRange range = event_ptr->equal_range(m_null_term.term_ref);
	BOOST_CHECK(range.first == range.second);
	BOOST_CHECK(range.first == event_ptr->end());
	BOOST_CHECK(range.second == event_ptr->end());
}

BOOST_AUTO_TEST_CASE(checkEventAssignmentValues) {
	addAllTerms();
	std::string short_msg_str("short msg");
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	event_ptr->setInt(m_plain_int_term.term_ref, 24);
	event_ptr->setUBigInt(m_big_int_term.term_ref, 2025221224);
	event_ptr->setString(m_fixed_term.term_ref, short_msg_str);
	event_ptr->setDateTime(m_date_term.term_ref, PionDateTime(boost::gregorian::date(2007, 4, 5)));

	const Event::ParameterValue *value_ptr = event_ptr->getPointer(m_plain_int_term.term_ref);
	BOOST_REQUIRE(value_ptr != NULL);
	BOOST_CHECK_EQUAL(boost::get<boost::int32_t>(*value_ptr), 24);
	BOOST_CHECK_EQUAL(event_ptr->getUBigInt(m_big_int_term.term_ref), 2025221224UL);
	BOOST_CHECK_EQUAL(event_ptr->getString(m_fixed_term.term_ref), short_msg_str);
	PionDateTime pdt = event_ptr->getDateTime(m_date_term.term_ref);
	BOOST_CHECK_EQUAL(pdt.date().year(), 2007);
	BOOST_CHECK_EQUAL(pdt.date().month(), 4);
	BOOST_CHECK_EQUAL(pdt.date().day(), 5);
}

BOOST_AUTO_TEST_CASE(checkMultipleTermValues) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	event_ptr->setInt(m_plain_int_term.term_ref, 10);
	event_ptr->setInt(m_plain_int_term.term_ref, 100);
	event_ptr->setInt(m_plain_int_term.term_ref, 1000);
	event_ptr->setInt(m_plain_int_term.term_ref, 10000);
	
	BOOST_CHECK(! event_ptr->empty());
	BOOST_CHECK(event_ptr->isDefined(m_plain_int_term.term_ref));
	BOOST_CHECK(event_ptr->find(m_plain_int_term.term_ref) != event_ptr->end());
	BOOST_CHECK_EQUAL(event_ptr->getInt(m_plain_int_term.term_ref) % 10, 0);
	
	Event::ValuesRange range = event_ptr->equal_range(m_plain_int_term.term_ref);
	BOOST_CHECK(range.first == event_ptr->begin());
	BOOST_CHECK(range.first != range.second);
	BOOST_CHECK(range.first != event_ptr->end());

	Event::ConstIterator i = range.first;
	BOOST_REQUIRE(i != event_ptr->end());
	BOOST_CHECK_EQUAL(boost::get<boost::int32_t>(i->value), 10);
	++i;
	BOOST_REQUIRE(i != range.second);
	BOOST_CHECK_EQUAL(boost::get<boost::int32_t>(i->value), 100);
	++i;
	BOOST_REQUIRE(i != range.second);
	BOOST_CHECK_EQUAL(boost::get<boost::int32_t>(i->value), 1000);
	++i;
	BOOST_REQUIRE(i != range.second);
	BOOST_CHECK_EQUAL(boost::get<boost::int32_t>(i->value), 10000);
	++i;
	BOOST_CHECK(i == range.second);
	BOOST_CHECK(i == event_ptr->end());
}

BOOST_AUTO_TEST_CASE(checkClearTermValues) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	event_ptr->setInt(m_plain_int_term.term_ref, 10);
	event_ptr->setInt(m_plain_int_term.term_ref, 100);
	event_ptr->clear(m_plain_int_term.term_ref);
}

BOOST_AUTO_TEST_CASE(checkEventOperatorPlusEquals) {
	EventPtr a_ptr(m_event_factory.create(m_object_term.term_ref));
	EventPtr b_ptr(m_event_factory.create(m_object_term.term_ref));
	a_ptr->setInt(m_plain_int_term.term_ref, 10);
	b_ptr->setUBigInt(m_big_int_term.term_ref, 2025221224UL);

	BOOST_CHECK(!a_ptr->isDefined(m_big_int_term.term_ref));
	*a_ptr += *b_ptr;
	BOOST_CHECK(a_ptr->isDefined(m_big_int_term.term_ref));
	BOOST_CHECK_EQUAL(a_ptr->getUBigInt(m_big_int_term.term_ref), 2025221224UL);

	BOOST_CHECK(a_ptr->isDefined(m_plain_int_term.term_ref));
	BOOST_CHECK(b_ptr->isDefined(m_big_int_term.term_ref));
	BOOST_CHECK_EQUAL(a_ptr->getInt(m_plain_int_term.term_ref), 10);
	BOOST_CHECK_EQUAL(b_ptr->getUBigInt(m_big_int_term.term_ref), 2025221224UL);
}

BOOST_AUTO_TEST_CASE(checkEventCopyValues) {
	EventPtr a_ptr(m_event_factory.create(m_object_term.term_ref));
	EventPtr b_ptr(m_event_factory.create(m_object_term.term_ref));
	b_ptr->setUBigInt(m_big_int_term.term_ref, 2025221224UL);
	b_ptr->setUBigInt(m_big_int_term.term_ref, 25UL);
	b_ptr->setInt(m_plain_int_term.term_ref, 10);
	b_ptr->setInt(m_plain_int_term.term_ref, 100);
	b_ptr->setInt(m_plain_int_term.term_ref, 1000);
	b_ptr->setInt(m_plain_int_term.term_ref, 10000);

	BOOST_CHECK(!a_ptr->isDefined(m_plain_int_term.term_ref));
	BOOST_CHECK(!a_ptr->isDefined(m_big_int_term.term_ref));

	a_ptr->copyValues(*b_ptr, m_big_int_term.term_ref);

	BOOST_CHECK(!a_ptr->isDefined(m_plain_int_term.term_ref));
	BOOST_CHECK(a_ptr->isDefined(m_big_int_term.term_ref));

	Event::ValuesRange range = a_ptr->equal_range(m_big_int_term.term_ref);
	BOOST_CHECK(range.first == a_ptr->begin());
	BOOST_CHECK(range.first != range.second);
	BOOST_CHECK(range.first != a_ptr->end());

	Event::ConstIterator i = range.first;
	BOOST_REQUIRE(i != a_ptr->end());
	BOOST_CHECK_EQUAL(boost::get<boost::uint64_t>(i->value), 2025221224UL);
	++i;
	BOOST_REQUIRE(i != range.second);
	BOOST_CHECK_EQUAL(boost::get<boost::uint64_t>(i->value), 25UL);
	++i;
	BOOST_CHECK(i == range.second);
	BOOST_CHECK(i == a_ptr->end());
}

BOOST_AUTO_TEST_CASE(checkParameterValueOperatorEquals) {
	Event::ParameterValue pv1 = boost::int32_t(4);
	Event::ParameterValue pv2 = boost::int32_t(4);
	BOOST_CHECK(pv1 == pv2);

	pv2 = boost::int32_t(5);
	//BOOST_CHECK(pv1 != pv2); // can't use this because boost::variant doesn't define operator!=
	BOOST_CHECK(!(pv1 == pv2));

	pv2 = 5.0;
	BOOST_CHECK(!(pv1 == pv2));

	char buf1[] = "abc";
	EventAllocator event_alloc;
	pv1 = Event::SimpleString(event_alloc, buf1, strlen(buf1));
	BOOST_CHECK(!(pv1 == pv2));

	char buf2[] = "abc";
	pv2 = Event::SimpleString(event_alloc, buf2, strlen(buf2));
	BOOST_CHECK(pv1 == pv2);

	char buf3[] = "abd";
	pv2 = Event::SimpleString(event_alloc, buf3, strlen(buf3));
	BOOST_CHECK(!(pv1 == pv2));

	char buf4[] = "ab";
	pv2 = Event::SimpleString(event_alloc, buf4, strlen(buf4));
	BOOST_CHECK(!(pv1 == pv2));
}

BOOST_AUTO_TEST_CASE(checkParameterValueCallsPionBlobDestructor) {
	EventAllocator event_alloc;

	Event::SimpleString str(event_alloc, "abc");
	BOOST_CHECK(str.unique());
	BOOST_CHECK_EQUAL(str.use_count(), 1);

	{
		Event::ParameterValue pv1 = str;
		BOOST_CHECK(! str.unique());
		BOOST_CHECK_EQUAL(str.use_count(), 2);
	}	// should destruct SimpleString copy

	BOOST_CHECK(str.unique());
	BOOST_CHECK_EQUAL(str.use_count(), 1);

	Event::ParameterValue pv2 = str;
	BOOST_CHECK(! str.unique());
	BOOST_CHECK_EQUAL(str.use_count(), 2);

	pv2 = boost::uint32_t(42);	// should destruct SimpleString copy

	BOOST_CHECK(str.unique());
	BOOST_CHECK_EQUAL(str.use_count(), 1);
}

BOOST_AUTO_TEST_SUITE_END()
