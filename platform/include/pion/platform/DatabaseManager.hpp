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

#ifndef __PION_DATABASEMANAGER_HEADER__
#define __PION_DATABASEMANAGER_HEADER__

#include <boost/bind.hpp>
#include <boost/signal.hpp>
#include <boost/noncopyable.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionLogger.hpp>
#include <pion/PluginManager.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/VocabularyManager.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/Database.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// DatabaseManager: singleton used to manage the creation of Databases
///
class DatabaseManager :
	public ConfigManager,
	private boost::noncopyable
{
public:

	/// exception thrown if a Database cannot be found
	class DatabaseNotFoundException : public PionException {
	public:
		DatabaseNotFoundException(const std::string& database_id)
			: PionException("No databases found for identifier: ", database_id) {}
	};

	/// exception thrown when trying to add a database with an identifier that already exists
	class DuplicateDatabaseException : public PionException {
	public:
		DuplicateDatabaseException(const std::string& database_id)
			: PionException("Cannot register database with existing identifier: ", database_id) {}
	};
	

	/**
	 * constructs a new DatabaseManager object
	 *
	 * @param vocab_mgr the global manager of Vocabularies
	 */
	DatabaseManager(const VocabularyManager& vocab_mgr)
		: ConfigManager(DEFAULT_CONFIG_FILE),
		m_logger(PION_GET_LOGGER("pion.platform.DatabaseManager")),
		m_vocabulary(vocab_mgr.getVocabulary())
	{
		vocab_mgr.registerForUpdates(boost::bind(&DatabaseManager::updateVocabulary, this));
	}

	/// virtual destructor
	virtual ~DatabaseManager() {}
	
	/**
	 * registers a new Database
	 *
	 * @param database_id unique identifier associated with the Database
	 * @return Database* pointer to the new Database object
	 */
	inline Database *registerDatabase(const std::string& database_id) {
		// make sure the database was not already registered
		if (m_databases.get(database_id) != NULL)
			throw DuplicateDatabaseException(database_id);

		// determine the type of database (driver) to load
		std::string database_type = DEFAULT_DATABASE_TYPE;
		// ...
		
		m_databases.load(database_id, database_type);
		m_signal_database_updated();
		PION_LOG_DEBUG(m_logger, "Registered database (" << database_type << "): " << database_id);
	}
	
	/**
	 * releases a registered Database
	 *
	 * @param database_id unique identifier associated with the Database
	 */
	inline void removeDatabase(const std::string& database_id) {
		// convert "plugin not found" exceptions into "database not found"
		try { m_databases.remove(database_id); }
		catch (PluginManager<Database>::PluginNotFoundException& /* e */) {
			throw DatabaseNotFoundException(database_id);
		}
		m_signal_database_updated();
		PION_LOG_DEBUG(m_logger, "Released database: " << database_id);
	}
	
	/**
	 * registers a callback function to be executed whenever a Database is updated
	 *
	 * @param f the callback function to register
	 */
	template <typename DatabaseUpdateFunction>
	inline void registerForUpdates(DatabaseUpdateFunction f) const {
		m_signal_database_updated.connect(f);
	}

	/// this updates the Vocabularies used by all Databases
	inline void updateVocabulary(void) {
		m_databases.run(boost::bind(&Database::updateVocabulary, _1,
									boost::cref(m_vocabulary)));
	}
	
	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }
	
	
private:

	/// default name of the database config file
	static const std::string		DEFAULT_CONFIG_FILE;

	/// the default type of database to use if one is not otherwise specified
	static const std::string		DEFAULT_DATABASE_TYPE;
	
	
	/// primary logging interface used by this class
	PionLogger						m_logger;	

	/// references the Vocabulary used by this DatabaseManager to describe Terms
	const Vocabulary&				m_vocabulary;

	/// collection of storage engine objects being managed
	PluginManager<Database>			m_databases;

	/// signal triggered whenever a Database is modified
	mutable boost::signal0<void>	m_signal_database_updated;
};


}	// end namespace platform
}	// end namespace pion

#endif
