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

#include <boost/lexical_cast.hpp>
#include <boost/algorithm/string.hpp>
#include <pion/platform/Transform.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

const std::string			Transform::LOOKUP_TERM_NAME = "LookupTerm";
const std::string			Transform::TERM_ELEMENT_NAME = "Term";
const std::string			Transform::LOOKUP_MATCH_ELEMENT_NAME = "Match";
const std::string			Transform::LOOKUP_FORMAT_ELEMENT_NAME = "Format";
const std::string			Transform::LOOKUP_DEFAULT_ELEMENT_NAME = "DefaultValue";
const std::string			Transform::VALUE_ELEMENT_NAME = "Value";
const std::string			Transform::RULES_STOP_ON_FIRST_ELEMENT_NAME = "StopOnFirstMatch";
const std::string			Transform::RULE_ELEMENT_NAME = "Rule";
const std::string			Transform::TYPE_ELEMENT_NAME = "Type";
const std::string			Transform::TRANSFORMATION_SET_VALUE_NAME = "SetValue";

const std::string			Transform::LOOKUP_DEFAULTACTION_ELEMENT_NAME = "DefaultAction";
const std::string			Transform::LOOKUP_LOOKUP_ELEMENT_NAME = "Lookup";
const std::string			Transform::LOOKUP_KEY_ATTRIBUTE_NAME = "key";

const std::string			Transform::SOURCE_TERM_ELEMENT_NAME = "SourceTerm";
const std::string			Transform::REGEXP_ELEMENT_NAME = "Regex";
const std::string			Transform::REGEXP_ATTRIBUTE_NAME = "exp";

}
}
