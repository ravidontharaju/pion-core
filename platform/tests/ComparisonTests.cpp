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
#include <pion/platform/Event.hpp>
#include <pion/platform/Comparison.hpp>
#include <pion/platform/RuleChain.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <pion/platform/PionPlatformUnitTest.hpp>
#include <boost/test/unit_test.hpp>

using namespace pion;
using namespace pion::platform;


class ComparisonTests_F {
public:
	ComparisonTests_F()
		: m_plain_int_term("urn:vocab:test#plain-int"),
		m_string_term("urn:vocab:test#simple-string"),
		m_date_time_term("urn:vocab:test#date-time"),
		m_date_term("urn:vocab:test#date"),
		m_time_term("urn:vocab:test#time"),
		m_object_term("urn:vocab:test#simple-object")
	{
		// initialize our initial term set
		m_plain_int_term.term_type = Vocabulary::TYPE_INT16;
		m_string_term.term_type = Vocabulary::TYPE_STRING;
		m_date_time_term.term_type = Vocabulary::TYPE_DATE_TIME;
		m_date_term.term_type = Vocabulary::TYPE_DATE;
		m_time_term.term_type = Vocabulary::TYPE_TIME;
		m_object_term.term_type = Vocabulary::TYPE_OBJECT;
		m_date_time_term.term_format = "%Y-%m-%d %H:%M:%S";
		m_date_term.term_format = "%Y-%m-%d";
		m_time_term.term_format = "%H:%M:%S";

		m_vocabulary.addTerm(m_plain_int_term);
		m_vocabulary.addTerm(m_string_term);
		m_vocabulary.addTerm(m_date_time_term);
		m_vocabulary.addTerm(m_date_term);
		m_vocabulary.addTerm(m_time_term);
		m_vocabulary.addTerm(m_object_term);

		m_plain_int_term.term_ref = m_vocabulary.findTerm(m_plain_int_term.term_id);
		m_string_term.term_ref = m_vocabulary.findTerm(m_string_term.term_id);
		m_date_time_term.term_ref = m_vocabulary.findTerm(m_date_time_term.term_id);
		m_date_term.term_ref = m_vocabulary.findTerm(m_date_term.term_id);
		m_time_term.term_ref = m_vocabulary.findTerm(m_time_term.term_id);
		m_object_term.term_ref = m_vocabulary.findTerm(m_object_term.term_id);
	}
	~ComparisonTests_F() {
	}

	EventFactory		m_event_factory;
	Vocabulary			m_vocabulary;
	Vocabulary::Term	m_plain_int_term;
	Vocabulary::Term	m_string_term;
	Vocabulary::Term	m_date_time_term;
	Vocabulary::Term	m_date_term;
	Vocabulary::Term	m_time_term;
	Vocabulary::Term	m_object_term;
};

BOOST_FIXTURE_TEST_SUITE(ComparisonTests_S, ComparisonTests_F)

BOOST_AUTO_TEST_CASE(checkThrowIfInvalidType) {
	Comparison c(m_plain_int_term);
	PionDateTime t;
	BOOST_CHECK_THROW(c.configure(Comparison::TYPE_SAME_DATE_TIME, t), Comparison::InvalidTypeForTermException);
	BOOST_CHECK_THROW(c.configure(Comparison::TYPE_CONTAINS, "error"), Comparison::InvalidTypeForTermException);
}

BOOST_AUTO_TEST_CASE(checkThrowIfInvalidValue) {
	Comparison c(m_plain_int_term);
	BOOST_CHECK_THROW(c.configure(Comparison::TYPE_EQUALS), Comparison::InvalidValueForTypeException);
	BOOST_CHECK_THROW(c.configure(Comparison::TYPE_LESS_THAN, "error"), Comparison::InvalidValueForTypeException);
	BOOST_CHECK_THROW(c.configure(Comparison::TYPE_GREATER_THAN, 28.3), Comparison::InvalidValueForTypeException);
}

BOOST_AUTO_TEST_CASE(checkEventTypeComparisons) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));

	Comparison c(m_object_term);
	c.configure(Comparison::TYPE_IS_DEFINED);
	BOOST_CHECK(c.evaluate(*event_ptr));
	c.configure(Comparison::TYPE_IS_NOT_DEFINED);
	BOOST_CHECK(! c.evaluate(*event_ptr));

	Comparison c2(m_plain_int_term);
	c2.configure(Comparison::TYPE_IS_DEFINED);
	BOOST_CHECK(! c2.evaluate(*event_ptr));
	c2.configure(Comparison::TYPE_IS_NOT_DEFINED);
	BOOST_CHECK(c2.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkGenericComparisons) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	event_ptr->setInt(m_plain_int_term.term_ref, 100);
	Comparison c(m_plain_int_term);
	
	c.configure(Comparison::TYPE_FALSE);
	BOOST_CHECK(! c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_TRUE);
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_IS_DEFINED);
	BOOST_CHECK(c.evaluate(*event_ptr));

	Comparison c2(m_date_term);
	c2.configure(Comparison::TYPE_IS_NOT_DEFINED);
	BOOST_CHECK(c2.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkInt16Comparisons) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	event_ptr->setInt(m_plain_int_term.term_ref, 100);
	Comparison c(m_plain_int_term);
	
	c.configure(Comparison::TYPE_EQUALS, static_cast<boost::int32_t>(100));
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_NOT_EQUALS, static_cast<boost::int32_t>(101));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_GREATER_THAN, static_cast<boost::int32_t>(99));
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_LESS_THAN, static_cast<boost::int32_t>(101));
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_GREATER_OR_EQUAL, static_cast<boost::int32_t>(100));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_GREATER_OR_EQUAL, static_cast<boost::int32_t>(10));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_LESS_OR_EQUAL, static_cast<boost::int32_t>(100));
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_LESS_OR_EQUAL, static_cast<boost::int32_t>(1000));
	BOOST_CHECK(c.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkStringComparisons) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	event_ptr->setString(m_string_term.term_ref, "Atomic");
	Comparison c(m_string_term);
	
	c.configure(Comparison::TYPE_EXACT_MATCH, "Atomic");
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_EXACT_MATCH, "Atom");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_EXACT_MATCH, "Atom");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_NOT_EXACT_MATCH, "Pion");
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_EXACT_MATCH, "Atomic");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_CONTAINS, "tom");
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_CONTAINS, "tack");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_CONTAINS, "tack");
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_CONTAINS, "tom");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_STARTS_WITH, "At");
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_STARTS_WITH, "Add");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_STARTS_WITH, "Add");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_NOT_STARTS_WITH, "mic");
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_STARTS_WITH, "At");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_ENDS_WITH, "mic");
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_ENDS_WITH, "mack");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_ENDS_WITH, "Bic");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_NOT_ENDS_WITH, "tom");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_NOT_ENDS_WITH, "mic");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_ORDERED_BEFORE, "Bat");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_ORDERED_BEFORE, "Ata");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_ORDERED_BEFORE, "Ata");
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_ORDERED_BEFORE, "Bat");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_ORDERED_AFTER, "Ata");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_ORDERED_AFTER, "Bat");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_ORDERED_AFTER, "Bat");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_NOT_ORDERED_AFTER, "Ata");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_REGEX, "^A.o.*c$");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_REGEX, "Bat");
	BOOST_CHECK(! c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_REGEX, "AA+");
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_NOT_REGEX, "A.*c");
	BOOST_CHECK(! c.evaluate(*event_ptr));

	event_ptr->clear(m_string_term.term_ref);
	event_ptr->setString(m_string_term.term_ref, "GET /favicon.ico HTTP/1.1");
	c.configure(Comparison::TYPE_REGEX, "\\.(png|gif|jpg|jpeg|ico)");
	BOOST_CHECK(c.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkComparisonCopyWorksForRegex) {
	// prepare event
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	event_ptr->setString(m_string_term.term_ref, "Atomic");

	// prepare original comparison
	Comparison c_orig(m_string_term);
	c_orig.configure(Comparison::TYPE_REGEX, "^A.o.*c$");

	// create a copy
	Comparison c_copy(c_orig);

	// make sure it works correctly
	BOOST_CHECK(c_copy.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkDateTimeComparisons) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	PionTimeFacet f(m_date_time_term.term_format);	
	event_ptr->setDateTime(m_date_time_term.term_ref, f.fromString("2007-12-22 12:22:22"));
	Comparison c(m_date_time_term);
	
	// DateTime comparisons
	c.configure(Comparison::TYPE_SAME_DATE_TIME, f.fromString("2007-12-22 12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_SAME_DATE_TIME, f.fromString("2007-12-22 12:12:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_EARLIER_DATE_TIME, f.fromString("2007-12-22 14:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_LATER_DATE_TIME, f.fromString("2007-12-21 12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE_TIME, f.fromString("2007-12-22 12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE_TIME, f.fromString("2007-12-22 12:22:23"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE_TIME, f.fromString("2007-12-22 12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));

	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE_TIME, f.fromString("2007-12-21 12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));

	f.setFormat("%Y-%m-%d");
	
	// Date comparisons
	c.configure(Comparison::TYPE_SAME_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_SAME_DATE, f.fromString("2006-12-22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_EARLIER_DATE, f.fromString("2008-01-20"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_LATER_DATE, f.fromString("2006-12-21"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE, f.fromString("2007-12-23"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE, f.fromString("2007-09-20"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	f.setFormat("%H:%M:%S");
	
	// Time comparisons
	c.configure(Comparison::TYPE_SAME_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_SAME_TIME, f.fromString("12:12:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_EARLIER_TIME, f.fromString("14:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_LATER_TIME, f.fromString("10:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_TIME, f.fromString("12:22:23"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_TIME, f.fromString("09:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkDateComparisons) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	PionTimeFacet f("%Y-%m-%d");
	event_ptr->setDateTime(m_date_term.term_ref, f.fromString("2007-12-22"));
	Comparison c(m_date_term);
	
	// Date comparisons
	c.configure(Comparison::TYPE_SAME_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_SAME_DATE, f.fromString("2006-12-22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_EARLIER_DATE, f.fromString("2008-01-20"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_LATER_DATE, f.fromString("2006-12-21"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE, f.fromString("2007-12-23"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE, f.fromString("2007-09-20"));
	BOOST_CHECK(c.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkTimeComparisons) {
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	PionTimeFacet f("%H:%M:%S");
	event_ptr->setDateTime(m_time_term.term_ref, f.fromString("12:22:22"));
	Comparison c(m_time_term);
	
	// Time comparisons
	c.configure(Comparison::TYPE_SAME_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_NOT_SAME_TIME, f.fromString("12:12:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_EARLIER_TIME, f.fromString("14:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_LATER_TIME, f.fromString("10:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_TIME, f.fromString("12:22:23"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_TIME, f.fromString("09:22:22"));
	BOOST_CHECK(c.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkConfigureDateTimeComparisonsUsingStrings) {
	// Set up an Event to compare against.
	EventPtr event_ptr(m_event_factory.create(m_object_term.term_ref));
	PionTimeFacet fdt(m_date_time_term.term_format);	
	event_ptr->setDateTime(m_date_time_term.term_ref, fdt.fromString("2007-12-22 12:22:22"));
	PionTimeFacet fd(m_date_term.term_format);	
	event_ptr->setDateTime(m_date_term.term_ref, fd.fromString("2007-12-22"));
	PionTimeFacet ft(m_time_term.term_format);	
	event_ptr->setDateTime(m_time_term.term_ref, ft.fromString("12:22:22"));

	// Try some date-time strings.
	Comparison cdt(m_date_time_term);
	cdt.configure(Comparison::TYPE_SAME_DATE_TIME, "2007-12-22 12:22:22");
	BOOST_CHECK(cdt.evaluate(*event_ptr));
	cdt.configure(Comparison::TYPE_SAME_DATE_TIME, "2007-12-22 12:22:34");
	BOOST_CHECK(! cdt.evaluate(*event_ptr));

	// Try some date strings.
	Comparison cd(m_date_term);
	cd.configure(Comparison::TYPE_SAME_DATE, "2007-12-22");
	BOOST_CHECK(cd.evaluate(*event_ptr));
	cd.configure(Comparison::TYPE_SAME_DATE, "2008-12-22");
	BOOST_CHECK(! cd.evaluate(*event_ptr));

	// Try some time strings.
	Comparison ct(m_time_term);
	ct.configure(Comparison::TYPE_SAME_TIME, "12:22:22");
	BOOST_CHECK(ct.evaluate(*event_ptr));
	ct.configure(Comparison::TYPE_SAME_TIME, "12:22:01");
	BOOST_CHECK(! ct.evaluate(*event_ptr));
}

BOOST_AUTO_TEST_CASE(checkRuleChainWithMatchAllComparisonsFalse) {
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<MatchAllComparisons>false</MatchAllComparisons>"
		"<Comparison>"
			"<Term>urn:vocab:test#plain-int</Term>"
			"<Type>less-than</Type>"
			"<Value>10</Value>"
		"</Comparison>"
		"<Comparison>"
			"<Term>urn:vocab:test#simple-string</Term>"
			"<Type>contains</Type>"
			"<Value>Atom</Value>"
		"</Comparison>");

	RuleChain r;
	r.setConfig(m_vocabulary, config_ptr);

	EventPtr e1(m_event_factory.create(m_object_term.term_ref));
	e1->setInt(m_plain_int_term.term_ref, 5);
	e1->setString(m_string_term.term_ref, "Atomic");
	EventPtr e2(m_event_factory.create(m_object_term.term_ref));
	e2->setInt(m_plain_int_term.term_ref, 15);
	e2->setString(m_string_term.term_ref, "Atomic");
	EventPtr e3(m_event_factory.create(m_object_term.term_ref));
	e3->setInt(m_plain_int_term.term_ref, 5);
	e3->setString(m_string_term.term_ref, "Pion");
	EventPtr e4(m_event_factory.create(m_object_term.term_ref));
	e4->setInt(m_plain_int_term.term_ref, 15);
	e4->setString(m_string_term.term_ref, "Pion");

	BOOST_CHECK(r(e1));
	BOOST_CHECK(r(e2));
	BOOST_CHECK(r(e3));
	BOOST_CHECK(! r(e4));

	// Now test some Events where at least one of the Terms being tested is undefined.
	EventPtr e5(m_event_factory.create(m_object_term.term_ref));
	e5->setInt(m_plain_int_term.term_ref, 5);
	EventPtr e6(m_event_factory.create(m_object_term.term_ref));
	e6->setString(m_string_term.term_ref, "Atomic");
	EventPtr e7(m_event_factory.create(m_object_term.term_ref));

	BOOST_CHECK(r(e5));
	BOOST_CHECK(r(e6));
	BOOST_CHECK(! r(e7));
}

BOOST_AUTO_TEST_CASE(checkRuleChainWithMatchAllComparisonsTrue) {
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<MatchAllComparisons>true</MatchAllComparisons>"
		"<Comparison>"
			"<Term>urn:vocab:test#plain-int</Term>"
			"<Type>less-than</Type>"
			"<Value>10</Value>"
		"</Comparison>"
		"<Comparison>"
			"<Term>urn:vocab:test#simple-string</Term>"
			"<Type>contains</Type>"
			"<Value>Atom</Value>"
		"</Comparison>");

	RuleChain r;
	r.setConfig(m_vocabulary, config_ptr);

	EventPtr e1(m_event_factory.create(m_object_term.term_ref));
	e1->setInt(m_plain_int_term.term_ref, 5);
	e1->setString(m_string_term.term_ref, "Atomic");
	EventPtr e2(m_event_factory.create(m_object_term.term_ref));
	e2->setInt(m_plain_int_term.term_ref, 15);
	e2->setString(m_string_term.term_ref, "Atomic");
	EventPtr e3(m_event_factory.create(m_object_term.term_ref));
	e3->setInt(m_plain_int_term.term_ref, 5);
	e3->setString(m_string_term.term_ref, "Pion");
	EventPtr e4(m_event_factory.create(m_object_term.term_ref));
	e4->setInt(m_plain_int_term.term_ref, 15);
	e4->setString(m_string_term.term_ref, "Pion");

	BOOST_CHECK(r(e1));
	BOOST_CHECK(! r(e2));
	BOOST_CHECK(! r(e3));
	BOOST_CHECK(! r(e4));

	// Now test some Events where at least one of the Terms being tested is undefined.
	EventPtr e5(m_event_factory.create(m_object_term.term_ref));
	e5->setInt(m_plain_int_term.term_ref, 5);
	EventPtr e6(m_event_factory.create(m_object_term.term_ref));
	e6->setString(m_string_term.term_ref, "Atomic");
	EventPtr e7(m_event_factory.create(m_object_term.term_ref));

	BOOST_CHECK(! r(e5));
	BOOST_CHECK(! r(e6));
	BOOST_CHECK(! r(e7));
}

BOOST_AUTO_TEST_CASE(checkRuleChainWithIsNotDefinedComparison) {
	xmlNodePtr config_ptr = PionPlatformUnitTest::makeReactorConfigFromString(
		"<MatchAllComparisons>true</MatchAllComparisons>"
		"<Comparison>"
			"<Term>urn:vocab:test#simple-string</Term>"
			"<Type>is-not-defined</Type>"
		"</Comparison>"
		"<Comparison>"
			"<Term>urn:vocab:test#plain-int</Term>"
			"<Type>less-than</Type>"
			"<Value>10</Value>"
		"</Comparison>");

	RuleChain r;
	r.setConfig(m_vocabulary, config_ptr);

	EventPtr e1(m_event_factory.create(m_object_term.term_ref));
	e1->setString(m_string_term.term_ref, "Atomic");
	e1->setInt(m_plain_int_term.term_ref, 5);
	EventPtr e2(m_event_factory.create(m_object_term.term_ref));
	e2->setString(m_string_term.term_ref, "Atomic");
	e2->setInt(m_plain_int_term.term_ref, 15);
	EventPtr e3(m_event_factory.create(m_object_term.term_ref));
	e3->setInt(m_plain_int_term.term_ref, 5);
	EventPtr e4(m_event_factory.create(m_object_term.term_ref));
	e4->setInt(m_plain_int_term.term_ref, 15);
	EventPtr e5(m_event_factory.create(m_object_term.term_ref));

	BOOST_CHECK(! r(e1));
	BOOST_CHECK(! r(e2));
	BOOST_CHECK(r(e3));
	BOOST_CHECK(! r(e4));
	BOOST_CHECK(! r(e5));
}

BOOST_AUTO_TEST_SUITE_END()
