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
#include <boost/test/unit_test.hpp>

using namespace pion;
using namespace pion::platform;


/// sets up logging (run once only)
extern void setup_logging_for_unit_tests(void);


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
		setup_logging_for_unit_tests();
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
	BOOST_CHECK_THROW(c.configure(Comparison::TYPE_LESS_THAN, "28"), Comparison::InvalidValueForTypeException);
	BOOST_CHECK_THROW(c.configure(Comparison::TYPE_GREATER_THAN, 28.3), Comparison::InvalidValueForTypeException);
}

BOOST_AUTO_TEST_CASE(checkGenericComparisons) {
	Event e(m_object_term.term_ref);
	e.setInt(m_plain_int_term.term_ref, 100);
	Comparison c(m_plain_int_term);
	
	c.configure(Comparison::TYPE_FALSE);
	BOOST_CHECK(! c.evaluate(e));

	c.configure(Comparison::TYPE_TRUE);
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_IS_DEFINED);
	BOOST_CHECK(c.evaluate(e));

	Comparison c2(m_date_term);
	c2.configure(Comparison::TYPE_IS_NOT_DEFINED);
	BOOST_CHECK(c2.evaluate(e));
}

BOOST_AUTO_TEST_CASE(checkInt16Comparisons) {
	Event e(m_object_term.term_ref);
	e.setInt(m_plain_int_term.term_ref, 100);
	Comparison c(m_plain_int_term);
	
	c.configure(Comparison::TYPE_EQUALS, static_cast<boost::int32_t>(100));
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_NOT_EQUALS, static_cast<boost::int32_t>(101));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_GREATER_THAN, static_cast<boost::int32_t>(99));
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_LESS_THAN, static_cast<boost::int32_t>(101));
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_GREATER_OR_EQUAL, static_cast<boost::int32_t>(100));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_GREATER_OR_EQUAL, static_cast<boost::int32_t>(10));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_LESS_OR_EQUAL, static_cast<boost::int32_t>(100));
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_LESS_OR_EQUAL, static_cast<boost::int32_t>(1000));
	BOOST_CHECK(c.evaluate(e));
}

BOOST_AUTO_TEST_CASE(checkStringComparisons) {
	Event e(m_object_term.term_ref);
	e.setString(m_string_term.term_ref, "Atomic");
	Comparison c(m_string_term);
	
	c.configure(Comparison::TYPE_EXACT_MATCH, "Atomic");
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_EXACT_MATCH, "Pion");
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_CONTAINS, "tom");
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_CONTAINS, "tack");
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_STARTS_WITH, "At");
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_STARTS_WITH, "mic");
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_ENDS_WITH, "mic");
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_ENDS_WITH, "tom");
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_ORDERED_BEFORE, "Bat");
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_NOT_ORDERED_BEFORE, "Ata");
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_ORDERED_AFTER, "Ata");
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_NOT_ORDERED_AFTER, "Bat");
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_REGEX, "^A.o.*c$");
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_NOT_REGEX, "A+");
	BOOST_CHECK(c.evaluate(e));
}

BOOST_AUTO_TEST_CASE(checkDateTimeComparisons) {
	Event e(m_object_term.term_ref);
	PionTimeFacet f(m_date_time_term.term_format);	
	e.setDateTime(m_date_time_term.term_ref, f.fromString("2007-12-22 12:22:22"));
	Comparison c(m_date_time_term);
	
	// DateTime comparisons
	c.configure(Comparison::TYPE_SAME_DATE_TIME, f.fromString("2007-12-22 12:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_SAME_DATE_TIME, f.fromString("2007-12-22 12:12:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_EARLIER_DATE_TIME, f.fromString("2007-12-22 14:22:22"));
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_LATER_DATE_TIME, f.fromString("2007-12-21 12:22:22"));
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE_TIME, f.fromString("2007-12-22 12:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE_TIME, f.fromString("2007-12-22 12:22:23"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE_TIME, f.fromString("2007-12-22 12:22:22"));
	BOOST_CHECK(c.evaluate(e));

	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE_TIME, f.fromString("2007-12-21 12:22:22"));
	BOOST_CHECK(c.evaluate(e));

	f.setFormat("%Y-%m-%d");
	
	// Date comparisons
	c.configure(Comparison::TYPE_SAME_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_SAME_DATE, f.fromString("2006-12-22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_EARLIER_DATE, f.fromString("2008-01-20"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_LATER_DATE, f.fromString("2006-12-21"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE, f.fromString("2007-12-23"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE, f.fromString("2007-09-20"));
	BOOST_CHECK(c.evaluate(e));
	
	f.setFormat("%H:%M:%S");
	
	// Time comparisons
	c.configure(Comparison::TYPE_SAME_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_SAME_TIME, f.fromString("12:12:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_EARLIER_TIME, f.fromString("14:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_LATER_TIME, f.fromString("10:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_TIME, f.fromString("12:22:23"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_TIME, f.fromString("09:22:22"));
	BOOST_CHECK(c.evaluate(e));
}

BOOST_AUTO_TEST_CASE(checkDateComparisons) {
	Event e(m_object_term.term_ref);
	PionTimeFacet f("%Y-%m-%d");
	e.setDateTime(m_date_term.term_ref, f.fromString("2007-12-22"));
	Comparison c(m_date_term);
	
	// Date comparisons
	c.configure(Comparison::TYPE_SAME_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_SAME_DATE, f.fromString("2006-12-22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_EARLIER_DATE, f.fromString("2008-01-20"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_LATER_DATE, f.fromString("2006-12-21"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_DATE, f.fromString("2007-12-23"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE, f.fromString("2007-12-22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_DATE, f.fromString("2007-09-20"));
	BOOST_CHECK(c.evaluate(e));
}

BOOST_AUTO_TEST_CASE(checkTimeComparisons) {
	Event e(m_object_term.term_ref);
	PionTimeFacet f("%H:%M:%S");
	e.setDateTime(m_time_term.term_ref, f.fromString("12:22:22"));
	Comparison c(m_time_term);
	
	// Time comparisons
	c.configure(Comparison::TYPE_SAME_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_NOT_SAME_TIME, f.fromString("12:12:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_EARLIER_TIME, f.fromString("14:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_LATER_TIME, f.fromString("10:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_EARLIER_TIME, f.fromString("12:22:23"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_TIME, f.fromString("12:22:22"));
	BOOST_CHECK(c.evaluate(e));
	
	c.configure(Comparison::TYPE_SAME_OR_LATER_TIME, f.fromString("09:22:22"));
	BOOST_CHECK(c.evaluate(e));
}

BOOST_AUTO_TEST_SUITE_END()
