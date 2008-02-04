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

#include <boost/asio.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/platform/ReactionEngine.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of ReactionEngine
	
const std::string		ReactionEngine::DEFAULT_CONFIG_FILE = "reactors.xml";
const std::string		ReactionEngine::REACTOR_ELEMENT_NAME = "Reactor";
const std::string		ReactionEngine::CONNECTION_ELEMENT_NAME = "Connection";
const std::string		ReactionEngine::FROM_ELEMENT_NAME = "From";
const std::string		ReactionEngine::TO_ELEMENT_NAME = "To";


// ReactionEngine member functions
	
ReactionEngine::ReactionEngine(const VocabularyManager& vocab_mgr,
							   const CodecFactory& codec_factory,
							   const DatabaseManager& database_mgr)
	: PluginConfig<Reactor>(vocab_mgr, DEFAULT_CONFIG_FILE, REACTOR_ELEMENT_NAME),
	m_scheduler(PionScheduler::getInstance()),
	m_codec_factory(codec_factory),
	m_database_mgr(database_mgr),
	m_is_running(false)
{
	setLogger(PION_GET_LOGGER("pion.platform.ReactionEngine"));
	m_codec_factory.registerForUpdates(boost::bind(&ReactionEngine::updateCodecs, this));
	m_database_mgr.registerForUpdates(boost::bind(&ReactionEngine::updateDatabases, this));
}

void ReactionEngine::openConfigFile(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);

	// just return if it's already open
	if (ConfigManager::configIsOpen())
		return;

	// open the plug-in config file and load plug-ins
	ConfigManager::openPluginConfig(m_plugin_element);
	
	// Step through and process Reactor connections.
	// This must be done last & independently to ensure that all Reactors have
	// been loaded; otherwise, you would encounter references to Reactors that
	// have not yet been loaded.
	xmlNodePtr connection_node = m_config_node_ptr->children;
	while ( (connection_node = ConfigManager::findConfigNodeByName(CONNECTION_ELEMENT_NAME, connection_node)) != NULL)
	{
		// get the ID for the Reactor where events come from
		std::string from_id;
		if (! ConfigManager::getConfigOption(FROM_ELEMENT_NAME, from_id, connection_node->children))
			throw EmptyFromException(ConfigManager::getConfigFile());
		
		// get the ID for the Reactor where events go to
		std::string to_id;
		if (! ConfigManager::getConfigOption(TO_ELEMENT_NAME, to_id, connection_node->children))
			throw EmptyToException(ConfigManager::getConfigFile());

		// add the connection w/o locking
		addConnectionNoLock(from_id, to_id);

		// step to the next Reactor connection
		connection_node = connection_node->next;
	}
	
	PION_LOG_INFO(m_logger, "Loaded Reactor configuration file: " << ConfigManager::getConfigFile());
}
	
void ReactionEngine::clearReactorStats(const std::string& reactor_id)
{
	// convert "plugin not found" exceptions into "reactor not found"
	try {
		m_plugins.run(reactor_id, boost::bind(&Reactor::clearStats, _1));
	} catch (PluginManager<Reactor>::PluginNotFoundException& /* e */) {
		throw ReactorNotFoundException(reactor_id);
	}
	PION_LOG_DEBUG(m_logger, "Cleared reactor statistics: " << reactor_id);
}

void ReactionEngine::start(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	if (! m_is_running) {
		// notify the thread scheduler that we need it now
		m_scheduler.addActiveUser();

		PION_LOG_INFO(m_logger, "Starting all reactors");
		m_plugins.run(boost::bind(&Reactor::start, _1));

		m_is_running = true;
	}
}

void ReactionEngine::stop(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	stopNoLock();
}

void ReactionEngine::clearStats(void)
{
	m_plugins.run(boost::bind(&Reactor::clearStats, _1));
	PION_LOG_DEBUG(m_logger, "Cleared all reactor statistics");
}
	
void ReactionEngine::updateCodecs(void)
{
	m_plugins.run(boost::bind(&Reactor::updateCodecs, _1,
							  boost::cref(m_codec_factory)));
}

void ReactionEngine::updateDatabases(void)
{
	m_plugins.run(boost::bind(&Reactor::updateDatabases, _1,
							  boost::cref(m_database_mgr)));
}

void ReactionEngine::addConnection(const std::string& from_id,
								   const std::string& to_id)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());
	
	// add the connection to memory structures
	boost::mutex::scoped_lock engine_lock(m_mutex);
	addConnectionNoLock(from_id, to_id);

	// add the connection to the config file
	
	// create a new node for the connection and add it to the XML config document
	xmlNodePtr connection_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(CONNECTION_ELEMENT_NAME.c_str()));
	if (connection_node == NULL)
		throw AddConnectionConfigException(getConnectionAsText(from_id, to_id));
	if ((connection_node=xmlAddChild(m_config_node_ptr, connection_node)) == NULL) {
		xmlFreeNode(connection_node);
		throw AddConnectionConfigException(getConnectionAsText(from_id, to_id));
	}

	// add a "From" child element to the connection
	if (xmlNewTextChild(connection_node, NULL,
						reinterpret_cast<const xmlChar*>(FROM_ELEMENT_NAME.c_str()),
						reinterpret_cast<const xmlChar*>(from_id.c_str())) == NULL)
		throw AddConnectionConfigException(getConnectionAsText(from_id, to_id));
	
	// add a "To" child element to the connection
	if (xmlNewTextChild(connection_node, NULL,
						reinterpret_cast<const xmlChar*>(TO_ELEMENT_NAME.c_str()),
						reinterpret_cast<const xmlChar*>(to_id.c_str())) == NULL)
		throw AddConnectionConfigException(getConnectionAsText(from_id, to_id));
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Added reactor connection: " << from_id << " -> " << to_id);
}
		
void ReactionEngine::removeConnection(const std::string& from_id,
									  const std::string& to_id)

{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());

	// remove the connection from memory structures
	boost::mutex::scoped_lock engine_lock(m_mutex);
	removeConnectionNoLock(from_id, to_id);
	
	// remove the connection from the config file
	
	// step through each connection to find the right one
	xmlNodePtr connection_node = m_config_node_ptr->children;
	while ( (connection_node = ConfigManager::findConfigNodeByName(CONNECTION_ELEMENT_NAME, connection_node)) != NULL)
	{
		// get the "From" and "To" connection identifiers
		std::string node_from_id;
		std::string node_to_id;
		ConfigManager::getConfigOption(FROM_ELEMENT_NAME, node_from_id, connection_node->children);
		ConfigManager::getConfigOption(TO_ELEMENT_NAME, node_to_id, connection_node->children);
		
		// check if this is the connection we want to remove
		if (from_id == node_from_id && to_id == node_to_id) {
			// found it!
			break;
		}
		
		// step to the next Reactor connection
		connection_node = connection_node->next;
	}

	// throw exception if connection was not found
	if (connection_node == NULL)
		throw RemoveConnectionConfigException(getConnectionAsText(from_id, to_id));

	// remove the connection from the XML tree
	xmlUnlinkNode(connection_node);
	xmlFreeNode(connection_node);
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Removed reactor connection: " << from_id << " -> " << to_id);
}
		
void ReactionEngine::addConnectionNoLock(const std::string& from_id,
										 const std::string& to_id)
{
	// find the source Reactor
	Reactor *from_ptr = m_plugins.get(from_id);
	if (from_ptr == NULL)
		throw ReactorNotFoundException(from_id);

	// find the destination Reactor
	Reactor *to_ptr = m_plugins.get(to_id);
	if (to_ptr == NULL)
		throw ReactorNotFoundException(to_id);
	
	// connect them together
	from_ptr->addConnection(*to_ptr);
}

void ReactionEngine::removeConnectionNoLock(const std::string& from_id,
											const std::string& to_id)
{
	// find the source Reactor
	Reactor *from_ptr = m_plugins.get(from_id);
	if (from_ptr == NULL)
		throw ReactorNotFoundException(from_id);

	// remove the connection
	from_ptr->removeConnection(to_id);
}

void ReactionEngine::stopNoLock(void)
{
	if (m_is_running) {
		PION_LOG_INFO(m_logger, "Stopping all reactors");
		m_plugins.run(boost::bind(&Reactor::stop, _1));

		// notify the thread scheduler that we no longer need it
		PionScheduler::getInstance().removeActiveUser();

		m_is_running = false;
	}
}

	
}	// end namespace platform
}	// end namespace pion
