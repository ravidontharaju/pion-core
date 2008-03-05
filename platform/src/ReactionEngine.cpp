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
	
const boost::uint32_t	ReactionEngine::DEFAULT_NUM_THREADS = 8;
const std::string		ReactionEngine::DEFAULT_CONFIG_FILE = "reactors.xml";
const std::string		ReactionEngine::REACTOR_ELEMENT_NAME = "Reactor";
const std::string		ReactionEngine::CONNECTION_ELEMENT_NAME = "Connection";
const std::string		ReactionEngine::TYPE_ELEMENT_NAME = "Type";
const std::string		ReactionEngine::FROM_ELEMENT_NAME = "From";
const std::string		ReactionEngine::TO_ELEMENT_NAME = "To";
const std::string		ReactionEngine::STATS_ELEMENT_NAME = "PionStats";
const std::string		ReactionEngine::RUNNING_ELEMENT_NAME = "Running";
const std::string		ReactionEngine::EVENTS_IN_ELEMENT_NAME = "EventsIn";
const std::string		ReactionEngine::EVENTS_OUT_ELEMENT_NAME = "EventsOut";
const std::string		ReactionEngine::TOTAL_OPS_ELEMENT_NAME = "TotalOps";
const std::string		ReactionEngine::CONNECTION_TYPE_REACTOR = "reactor";
const std::string		ReactionEngine::CONNECTION_TYPE_INPUT = "input";
const std::string		ReactionEngine::CONNECTION_TYPE_OUTPUT = "output";


// ReactionEngine member functions
	
ReactionEngine::ReactionEngine(VocabularyManager& vocab_mgr,
							   CodecFactory& codec_factory,
							   DatabaseManager& database_mgr)
	: PluginConfig<Reactor>(vocab_mgr, DEFAULT_CONFIG_FILE, REACTOR_ELEMENT_NAME),
	m_codec_factory(codec_factory),
	m_database_mgr(database_mgr),
	m_is_running(false)
{
	setLogger(PION_GET_LOGGER("pion.platform.ReactionEngine"));
	m_scheduler.setLogger(PION_GET_LOGGER("pion.platform.ReactionEngine"));
	m_scheduler.setNumThreads(DEFAULT_NUM_THREADS);
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
		// parse new plug-in definition
		std::string connection_id;
		if (! ConfigManager::getNodeId(connection_node, connection_id))
			throw EmptyConnectionIdException(ConfigManager::getConfigFile());

		// make sure that it is a reactor connection type
		std::string connection_type;
		if (! ConfigManager::getConfigOption(TYPE_ELEMENT_NAME, connection_type, connection_node->children)
			|| connection_type != CONNECTION_TYPE_REACTOR)
		{
			throw BadConnectionTypeException(connection_id);
		}
		
		// get the ID for the Reactor where events come from
		std::string from_id;
		if (! ConfigManager::getConfigOption(FROM_ELEMENT_NAME, from_id, connection_node->children))
			throw EmptyFromException(connection_id);
		
		// get the ID for the Reactor where events go to
		std::string to_id;
		if (! ConfigManager::getConfigOption(TO_ELEMENT_NAME, to_id, connection_node->children))
			throw EmptyToException(connection_id);

		// add the connection w/o locking
		addConnectionNoLock(connection_id, from_id, to_id);

		// step to the next Reactor connection
		connection_node = connection_node->next;
	}
	
	PION_LOG_INFO(m_logger, "Loaded Reactor configuration file: " << ConfigManager::getConfigFile());
	
	// start the ReactionEngine
	engine_lock.unlock();
	start();
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
		PION_LOG_INFO(m_logger, "Starting the ReactionEngine");

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
	m_plugins.run(boost::bind(&Reactor::updateCodecs, _1));
}

void ReactionEngine::updateDatabases(void)
{
	m_plugins.run(boost::bind(&Reactor::updateDatabases, _1));
}
	
void ReactionEngine::setReactorConfig(const std::string& reactor_id,
									  const xmlNodePtr config_ptr)
{
	// convert PluginNotFound exceptions into ReactorNotFound exceptions
	try {
		PluginConfig<Reactor>::setPluginConfig(reactor_id, config_ptr);
	} catch (PluginManager<Reactor>::PluginNotFoundException&) {
		throw ReactorNotFoundException(reactor_id);
	}
}

std::string ReactionEngine::addReactor(const xmlNodePtr config_ptr)
{
	return PluginConfig<Reactor>::addPlugin(config_ptr);
}

void ReactionEngine::removeReactor(const std::string& reactor_id)
{
	// disconnect any Reactor connections involving the Reactor being removed
	boost::mutex::scoped_lock engine_lock(m_mutex);
	ReactorConnectionList::iterator reactor_i = m_reactor_connections.begin();
	while (reactor_i != m_reactor_connections.end()) {
		ReactorConnectionList::iterator current_i = reactor_i++;
		if (current_i->m_from_id == reactor_id || current_i->m_to_id == reactor_id) {
			// remove the connection
			removeConnectionNoLock(current_i->m_from_id, current_i->m_to_id);
			removeConnectionConfigNoLock(current_i->m_from_id, current_i->m_to_id);
			m_reactor_connections.erase(current_i);
		}
	}
	
	// disconnect any temporary output connections involving the Reactor being removed
	TempConnectionList::iterator connection_i = m_temp_connections.begin();
	while (connection_i != m_temp_connections.end()) {
		TempConnectionList::iterator current_i = connection_i++;
		if (current_i->m_reactor_id == reactor_id) {
			if (current_i->m_output_connection) {
				// remove the output connection from the Reactor
				removeConnectionNoLock(current_i->m_reactor_id, current_i->m_connection_id);
			}
			// send notification that the Reactor is being removed
			current_i->m_removed_handler();
			// remove the connection
			m_temp_connections.erase(current_i);
		}
	}

	// convert PluginNotFound exceptions into ReactorNotFound exceptions
	try {
		// remove the Reactor object
		engine_lock.unlock();
		PluginConfig<Reactor>::removePlugin(reactor_id);
	} catch (PluginManager<Reactor>::PluginNotFoundException&) {
		throw ReactorNotFoundException(reactor_id);
	}
}

Reactor *ReactionEngine::addTempConnectionIn(const std::string& reactor_id, 
											 const std::string& connection_id,
											 const std::string& connection_info,
											 boost::function0<void> removed_handler)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());
	
	// get a pointer to the Reactor to return to the caller
	boost::mutex::scoped_lock engine_lock(m_mutex);
	Reactor *reactor_ptr = m_plugins.get(reactor_id);
	if (reactor_ptr == NULL)
		throw ReactorNotFoundException(reactor_id);

	// keep track of the temporary connection
	m_temp_connections.push_back(TempConnection(false, reactor_id, connection_id,
												connection_info, removed_handler));
	
	PION_LOG_DEBUG(m_logger, "Added temporary Reactor input connection: "
				   << reactor_id << " <- " << connection_info);
	
	return reactor_ptr;
}

void ReactionEngine::addTempConnectionOut(const std::string& reactor_id, 
										  const std::string& connection_id,
										  const std::string& connection_info,
										  Reactor::EventHandler connection_handler)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());
	
	// connect the Reactor to the connection handler
	boost::mutex::scoped_lock engine_lock(m_mutex);
	Reactor *reactor_ptr = m_plugins.get(reactor_id);
	if (reactor_ptr == NULL)
		throw ReactorNotFoundException(reactor_id);
	reactor_ptr->addConnection(connection_id, connection_handler);

	// if the Reactor is removed, send a null event to the connection
	EventPtr null_event_ptr;
	boost::function0<void>	removed_handler(boost::bind(connection_handler, null_event_ptr));
													
	// keep track of the temporary connection
	m_temp_connections.push_back(TempConnection(true, reactor_id, connection_id,
												connection_info, removed_handler));
	
	PION_LOG_DEBUG(m_logger, "Added temporary Reactor output connection: "
				   << reactor_id << " -> " << connection_info);
}
	
void ReactionEngine::removeTempConnection(const std::string& connection_id)
{ 
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());

	// some variables to keep track of for later
	bool type_is_output = true;
	std::string reactor_id;
	std::string connection_info;

	// remove the connection from memory structures
	boost::mutex::scoped_lock engine_lock(m_mutex);
	for (TempConnectionList::iterator i = m_temp_connections.begin();
		 i != m_temp_connections.end(); ++i)
	{
		if (i->m_connection_id == connection_id) {
			type_is_output = i->m_output_connection;
			reactor_id = i->m_reactor_id;
			connection_info = i->m_connection_info;
			m_temp_connections.erase(i);
			break;
		}
	}
	
	if (! reactor_id.empty()) {
		if (type_is_output) {
			// remove the output connection from the Reactor
			removeConnectionNoLock(reactor_id, connection_id);

			PION_LOG_DEBUG(m_logger, "Removed temporary Reactor output connection: "
						   << reactor_id << " -> " << connection_info);
		} else {
			PION_LOG_DEBUG(m_logger, "Removed temporary Reactor input connection: "
						   << reactor_id << " <- " << connection_info);
		}
	}
}
	
std::string ReactionEngine::addReactorConnection(const std::string& from_id,
												 const std::string& to_id)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());
	
	// generate a unique identifier to represent the connection
	const std::string connection_id(ConfigManager::createUUID());
	
	// add the connection to memory structures
	boost::mutex::scoped_lock engine_lock(m_mutex);
	addConnectionNoLock(connection_id, from_id, to_id);
	
	// add the connection to the config file
	
	// create a new node for the connection and add it to the XML config document
	xmlNodePtr connection_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(CONNECTION_ELEMENT_NAME.c_str()));
	if (connection_node == NULL)
		throw AddConnectionConfigException(getConnectionAsText(from_id, to_id));
	if ((connection_node=xmlAddChild(m_config_node_ptr, connection_node)) == NULL) {
		xmlFreeNode(connection_node);
		throw AddConnectionConfigException(getConnectionAsText(from_id, to_id));
	}

	// add the "id" attribute
	if (xmlNewProp(connection_node,
				   reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
				   reinterpret_cast<const xmlChar*>(connection_id.c_str())) == NULL)
		throw AddConnectionConfigException(getConnectionAsText(from_id, to_id));
	
	// add a "Type" child element to the connection
	if (xmlNewTextChild(connection_node, NULL,
						reinterpret_cast<const xmlChar*>(TYPE_ELEMENT_NAME.c_str()),
						reinterpret_cast<const xmlChar*>(CONNECTION_TYPE_REACTOR.c_str())) == NULL)
		throw AddConnectionConfigException(getConnectionAsText(from_id, to_id));
	
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
	
	return connection_id;
}

std::string ReactionEngine::addReactorConnection(const char *content_buf,
												 std::size_t content_length)
{
	// extract the XML config info from the content buffer
	xmlNodePtr config_ptr = ConfigManager::createResourceConfig(CONNECTION_ELEMENT_NAME,
																content_buf,
																content_length);
	if (config_ptr == NULL)
		throw BadConnectionConfigException();
	
	// get the "From" value
	std::string from_id;
	if (! ConfigManager::getConfigOption(FROM_ELEMENT_NAME, from_id, config_ptr))
		throw BadConnectionConfigException();
	
	// get the "To" value
	std::string to_id;
	if (! ConfigManager::getConfigOption(TO_ELEMENT_NAME, to_id, config_ptr))
		throw BadConnectionConfigException();
	
	// call addReactorConnection() to do the real work
	return addReactorConnection(from_id, to_id);
}

void ReactionEngine::removeReactorConnection(const std::string& from_id,
											 const std::string& to_id)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());

	// remove the connection from memory structures
	boost::mutex::scoped_lock engine_lock(m_mutex);
	removeConnectionNoLock(from_id, to_id);
	for (ReactorConnectionList::iterator i = m_reactor_connections.begin();
		 i != m_reactor_connections.end(); ++i)
	{
		if (i->m_from_id == from_id && i->m_to_id == to_id) {
			m_reactor_connections.erase(i);
			break;
		}
	}
	
	// remove the connection from the config file
	removeConnectionConfigNoLock(from_id, to_id);
	
	PION_LOG_DEBUG(m_logger, "Removed reactor connection: " << from_id << " -> " << to_id);
}
	
void ReactionEngine::removeReactorConnection(const std::string& connection_id)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());
	
	// find the connection in our memory structures
	boost::mutex::scoped_lock engine_lock(m_mutex);
	ReactorConnectionList::iterator i = m_reactor_connections.begin();
	while (i != m_reactor_connections.end()) {
		if (i->m_connection_id == connection_id)
			break;
		++i;
	}
	if (i == m_reactor_connections.end())
		throw ConnectionNotFoundException(connection_id);
	
	// remove the connection between the reactors
	removeConnectionNoLock(i->m_from_id, i->m_to_id);
	
	// remove the connection from the config file
	removeConnectionConfigNoLock(i->m_from_id, i->m_to_id);
	
	PION_LOG_DEBUG(m_logger, "Removed reactor connection: "
				   << i->m_from_id << " -> " << i->m_to_id);

	// remove the connection from memory structures
	m_reactor_connections.erase(i);
}

void ReactionEngine::addConnectionNoLock(const std::string& connection_id,
										 const std::string& from_id,
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

	// keep track of all Reactor connections
	m_reactor_connections.push_back(ReactorConnection(connection_id, from_id, to_id));
}

void ReactionEngine::removeConnectionNoLock(const std::string& reactor_id,
											const std::string& connection_id)
{
	// find the source Reactor
	Reactor *from_ptr = m_plugins.get(reactor_id);
	if (from_ptr == NULL)
		throw ReactorNotFoundException(reactor_id);

	// remove the connection
	from_ptr->removeConnection(connection_id);
}

void ReactionEngine::removeConnectionConfigNoLock(const std::string& from_id,
												  const std::string& to_id)
{
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
}

void ReactionEngine::stopNoLock(void)
{
	if (m_is_running) {
		PION_LOG_INFO(m_logger, "Stopping the ReactionEngine");

		// terminate all temporary connections
		for (TempConnectionList::iterator i = m_temp_connections.begin();
			 i != m_temp_connections.end(); ++i)
		{
			if (i->m_output_connection) {
				// remove the output connection from the Reactor
				removeConnectionNoLock(i->m_reactor_id, i->m_connection_id);
			}
			// send notification that the Reactor is being removed
			i->m_removed_handler();
		}
		m_temp_connections.clear();
		
		// stop all reactors
		PION_LOG_INFO(m_logger, "Stopping all reactors");
		m_plugins.run(boost::bind(&Reactor::stop, _1));

		// notify the thread scheduler that we no longer need it
		m_scheduler.removeActiveUser();

		m_is_running = false;
	}
}

void ReactionEngine::writeStatsXML(std::ostream& out) const
{
	out << '<' << STATS_ELEMENT_NAME << " xmlns=\""
		<< CONFIG_NAMESPACE_URL << "\">" << std::endl;
	
	boost::mutex::scoped_lock engine_lock(m_mutex);

	// step through each reactor configured
	std::string reactor_id;
	const Reactor *reactor_ptr;
	xmlNodePtr reactor_node = m_config_node_ptr->children;
	while ( (reactor_node = ConfigManager::findConfigNodeByName(REACTOR_ELEMENT_NAME, reactor_node)) != NULL)
	{
		// get a pointer to the reactor
		if (getNodeId(reactor_node, reactor_id)
			&& (reactor_ptr = m_plugins.get(reactor_id)) != NULL)
		{
			// write reactor statistics
			out << "\t<" << REACTOR_ELEMENT_NAME << ' ' << ID_ATTRIBUTE_NAME
				<< "=\"" << reactor_id << "\">" << std::endl
				<< "\t\t<" << RUNNING_ELEMENT_NAME << '>'
				<< (reactor_ptr->isRunning() ? "true" : "false")
				<< "</" << RUNNING_ELEMENT_NAME << '>' << std::endl
				<< "\t\t<" << EVENTS_IN_ELEMENT_NAME << '>' << reactor_ptr->getEventsIn()
				<< "</" << EVENTS_IN_ELEMENT_NAME << '>' << std::endl
				<< "\t\t<" << EVENTS_OUT_ELEMENT_NAME << '>' << reactor_ptr->getEventsOut()
				<< "</" << EVENTS_OUT_ELEMENT_NAME << '>' << std::endl
				<< "\t</" << REACTOR_ELEMENT_NAME << '>' << std::endl;
		}
		// step to the next Reactor
		reactor_node = reactor_node->next;
	}
	
	// write total operations
	out << "\t<" << TOTAL_OPS_ELEMENT_NAME << '>' << getTotalOperations()
		<< "</" << TOTAL_OPS_ELEMENT_NAME << '>' << std::endl;
	
	out << "</" << STATS_ELEMENT_NAME << '>' << std::endl;
}
	
void ReactionEngine::writeConnectionsXML(std::ostream& out,
										 const std::string& only_id) const
{
	ConfigManager::writeBeginPionConfigXML(out);
	
	bool found_one = false;
	boost::mutex::scoped_lock engine_lock(m_mutex);

	// iterate through Reactor connections
	for (ReactorConnectionList::const_iterator reactor_i = m_reactor_connections.begin();
		 reactor_i != m_reactor_connections.end(); ++reactor_i)
	{
		if (only_id.empty() || reactor_i->m_connection_id == only_id
			|| reactor_i->m_from_id == only_id || reactor_i->m_to_id == only_id)
		{
			found_one = true;
			out << "\t<" << CONNECTION_ELEMENT_NAME << ' ' << ID_ATTRIBUTE_NAME
				<< "=\"" << reactor_i->m_connection_id << "\">" << std::endl
				<< "\t\t<" << TYPE_ELEMENT_NAME << '>' << CONNECTION_TYPE_REACTOR
				<< "</" << TYPE_ELEMENT_NAME << '>' << std::endl
				<< "\t\t<" << FROM_ELEMENT_NAME << '>' << reactor_i->m_from_id << "</"
				<< FROM_ELEMENT_NAME << '>' << std::endl
				<< "\t\t<" << TO_ELEMENT_NAME << '>' << reactor_i->m_to_id << "</"
				<< TO_ELEMENT_NAME << '>' << std::endl
				<< "\t</" << CONNECTION_ELEMENT_NAME << '>' << std::endl;
		}
	}

	// iterate through temporary connections
	for (TempConnectionList::const_iterator temp_i = m_temp_connections.begin();
		 temp_i != m_temp_connections.end(); ++temp_i)
	{
		if (only_id.empty() || temp_i->m_connection_id == only_id
			|| temp_i->m_reactor_id == only_id)
		{
			found_one = true;
			out << "\t<" << CONNECTION_ELEMENT_NAME << ' ' << ID_ATTRIBUTE_NAME
				<< "=\"" << temp_i->m_connection_id << "\">" << std::endl
				<< "\t\t<" << TYPE_ELEMENT_NAME << '>';
			if (temp_i->m_output_connection) {
				out << CONNECTION_TYPE_OUTPUT << "</" << TYPE_ELEMENT_NAME << '>' << std::endl
					<< "\t\t<" << FROM_ELEMENT_NAME << '>' << temp_i->m_reactor_id
					<< "</" << FROM_ELEMENT_NAME << '>' << std::endl
					<< "\t\t<" << TO_ELEMENT_NAME << '>' << temp_i->m_connection_info;
			} else {
				out << CONNECTION_TYPE_INPUT << "</" << TYPE_ELEMENT_NAME << '>' << std::endl
					<< "\t\t<" << FROM_ELEMENT_NAME << '>' << temp_i->m_connection_info
					<< "</" << FROM_ELEMENT_NAME << '>' << std::endl
					<< "\t\t<" << TO_ELEMENT_NAME << '>' << temp_i->m_reactor_id;
			}
			out << "</" << TO_ELEMENT_NAME << '>' << std::endl
				<< "\t</" << CONNECTION_ELEMENT_NAME << '>' << std::endl;
		}
	}

	if (! found_one && ! only_id.empty())
		throw ConnectionNotFoundException(only_id);
	
	ConfigManager::writeEndPionConfigXML(out);
}
	
	
}	// end namespace platform
}	// end namespace pion
