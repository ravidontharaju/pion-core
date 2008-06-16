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


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

class PION_PLATFORM_API Transform : 
	public pion::platform::Comparison
{
public:

	/// if the Type matches on a field, then the action will take place
	/// all Types yield a "SET action" except REGEX
	enum TransformationType {
		TYPE_FALSE = 0,						// always false
		TYPE_TRUE,							// always true
		TYPE_IS_DEFINED,					// true if at least one value is defined
		TYPE_IS_NOT_DEFINED,				// true if no values are defined
		// numeric operations
		TYPE_EQUALS,
		TYPE_NOT_EQUALS,
		TYPE_GREATER_THAN,
		TYPE_LESS_THAN,
		TYPE_GREATER_OR_EQUAL,
		TYPE_LESS_OR_EQUAL,
		// string operations
		TYPE_EXACT_MATCH,
		TYPE_NOT_EXACT_MATCH,
		TYPE_CONTAINS,
		TYPE_NOT_CONTAINS,
		TYPE_STARTS_WITH,
		TYPE_NOT_STARTS_WITH,
		TYPE_ENDS_WITH,
		TYPE_NOT_ENDS_WITH,
		TYPE_ORDERED_BEFORE,
		TYPE_NOT_ORDERED_BEFORE,
		TYPE_ORDERED_AFTER,
		TYPE_NOT_ORDERED_AFTER,
		TYPE_REGEX,
		TYPE_NOT_REGEX,
		// date_time operations
		TYPE_SAME_DATE_TIME,
		TYPE_NOT_SAME_DATE_TIME,
		TYPE_EARLIER_DATE_TIME,
		TYPE_LATER_DATE_TIME,
		TYPE_SAME_OR_EARLIER_DATE_TIME,
		TYPE_SAME_OR_LATER_DATE_TIME,
		// date operations
		TYPE_SAME_DATE,
		TYPE_NOT_SAME_DATE,
		TYPE_EARLIER_DATE,
		TYPE_LATER_DATE,
		TYPE_SAME_OR_EARLIER_DATE,
		TYPE_SAME_OR_LATER_DATE,
		// time of day operations
		TYPE_SAME_TIME,
		TYPE_NOT_SAME_TIME,
		TYPE_EARLIER_TIME,
		TYPE_LATER_TIME,
		TYPE_SAME_OR_EARLIER_TIME,
		TYPE_SAME_OR_LATER_TIME,
	};

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
