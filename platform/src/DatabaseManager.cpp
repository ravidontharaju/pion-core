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

#include <pion/platform/DatabaseManager.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of DatabaseManager
const std::string		DatabaseManager::DEFAULT_CONFIG_FILE = "databases.xml";
const std::string		DatabaseManager::DATABASE_ELEMENT_NAME = "Database";
const std::string		DatabaseManager::DEFAULT_DATABASE_TYPE = "sqlite";


// DatabaseManager member functions
	
DatabaseManager::DatabaseManager(const VocabularyManager& vocab_mgr)
	: PluginConfig<Database>(vocab_mgr, DEFAULT_CONFIG_FILE, DATABASE_ELEMENT_NAME)
{
	setLogger(PION_GET_LOGGER("pion.platform.DatabaseManager"));
}
	
DatabasePtr DatabaseManager::getDatabase(const std::string& database_id)
{
	boost::mutex::scoped_lock manager_lock(m_mutex);
	Database *database_ptr = m_plugins.get(database_id);
	// throw an exception if the Database was not found
	if (database_ptr == NULL)
		throw DatabaseNotFoundException(database_id);
	// return a cloned instance of the Database since it may change during use
	return database_ptr->clone();
}

	
}	// end namespace platform
}	// end namespace pion
