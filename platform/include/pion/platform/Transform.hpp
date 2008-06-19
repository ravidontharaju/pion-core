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

#ifndef __PION_TRANSFORM_HEADER__
#define __PION_TRANSFORM_HEADER__

#include <boost/regex.hpp>
#include <boost/logic/tribool.hpp>
#include <boost/algorithm/string/compare.hpp>
#include <boost/algorithm/string/predicate.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Comparison.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

class PION_PLATFORM_API Transform : 
	public pion::platform::Comparison
{
public:

	/// For everything but regexp, what is the "set" value
	std::string					m_set_value;

	/// Substitute in-place, or create new term
	bool						m_set_inplace;

	/// identifies the Vocabulary Term to set
	Vocabulary::Term			m_set_term;

	/// virtual destructor: you may extend this class
	virtual ~Transform() {}

	/**
	 * constructs a new Comparison
	 *
	 * @param term the term that will be examined
	 */
	explicit Transform(const Vocabulary::Term& term)
		: Comparison(term), m_set_value(NULL), m_set_inplace(false), m_set_term(NULL)
//		: m_term(term), m_type(TYPE_FALSE), m_match_all_values(false)
	{}

/*
	/// standard copy constructor
	Transform(const Comparison& c)
		: m_term(c.m_term), m_type(c.m_type), m_value(c.m_value),
		m_str_value(c.m_str_value), m_regex(c.m_regex),
		m_match_all_values(c.m_match_all_values)
	{}
*/

	/**
	 * evaluates the result of the Comparison
	 *
	 * @param e the Event to evaluate
	 *
	 * @return true if the Comparison succeeded; false if it did not
	 */
	inline bool transform(const Event& e) const
	{
		return true;	// TODO: Actually do the transformation
	}
};

}
}


#endif
