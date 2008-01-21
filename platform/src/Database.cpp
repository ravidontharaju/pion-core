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

#include <pion/platform/Database.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of Database
const std::string			Database::DATABASE_ELEMENT_NAME = "database";
const std::string			Database::TABLE_ELEMENT_NAME = "table";
const std::string			Database::FIELD_ELEMENT_NAME = "field";
const std::string			Database::COMMENT_ELEMENT_NAME = "comment";
	
		
// Database member functions
	
void Database::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	PlatformPlugin::setConfig(v, config_ptr);
}

void Database::updateVocabulary(const Vocabulary& v)
{
	PlatformPlugin::updateVocabulary(v);
}	
	
	
}	// end namespace platform
}	// end namespace pion
