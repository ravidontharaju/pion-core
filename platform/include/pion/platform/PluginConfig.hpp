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

#ifndef __PION_PLUGINCONFIG_HEADER__
#define __PION_PLUGINCONFIG_HEADER__

#include <libxml/tree.h>
#include <boost/bind.hpp>
#include <boost/signal.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PluginManager.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/VocabularyManager.hpp>
#include <pion/platform/ConfigManager.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

///
/// PluginConfig: manages a collection of plug-ins and their configuration settings
///
template <typename PluginType>
class PluginConfig :
	public ConfigManager
{
public:

	/// exception used to propagate exceptions thrown by Pion plugins
	class PluginException : public PionException {
	public:
		PluginException(const std::string& error_msg)
			: PionException(error_msg)
		{}
	};
	

	/// virtual destructor: this class is meant to be extended
	virtual ~PluginConfig() {}
	
	/// creates a new plug-in config file that includes the Pion "config" element
	virtual void createConfigFile(void) {
		boost::mutex::scoped_lock plugins_lock(m_mutex);
		// just return if it's already open
		if (ConfigManager::configIsOpen())
			return;
		// create the file with "config" root element
		ConfigManager::createConfigFile();
		PION_LOG_INFO(m_logger, "Initializing new " << m_plugin_element
					  << " configuration file: " << ConfigManager::getConfigFile());
	}		
	
	/// opens an existing configuration file and loads the plug-ins it contains
	virtual void openConfigFile(void) {
		boost::mutex::scoped_lock plugins_lock(m_mutex);
		// just return if it's already open
		if (ConfigManager::configIsOpen())
			return;
		// open the plug-in config file and load plug-ins
		ConfigManager::openPluginConfig(m_plugin_element);
		PION_LOG_INFO(m_logger, "Loaded " << m_plugin_element
					  << " configuration file: " << ConfigManager::getConfigFile());
	}
		
	/**
	 * writes the entire configuration tree to an output stream (as XML)
	 *
	 * @param out the ostream to write the configuration tree into
	 */
	virtual void writeConfigXML(std::ostream& out) const {
		boost::mutex::scoped_lock plugins_lock(m_mutex);
		ConfigManager::writeConfigXML(out, m_config_node_ptr, true);
	}
	
	/**
	 * writes the configuration data for a particular plug-in (as XML)
	 *
	 * @param out the ostream to write the configuration tree into
	 * @param plugin_id unique identifier associated with the plug-in
	 */
	inline bool writeConfigXML(std::ostream& out, const std::string& plugin_id) const;
	
	/**
	 * returns an XML tree representing the configuration for a plug-in
	 *
	 * @param plugin_id unique identifier associated with the plug-in
	 *
	 * @return xmlNodePtr pointer to a list of XML nodes containing plug-in
	 *                    configuration parameters; the parameters are copied,
	 *                    so the caller is responsible for freeing the list
	 *                    when finished
	 */
	inline xmlNodePtr getPluginConfig(const std::string& plugin_id);
	
	/**
	 * registers a callback function to be executed whenever plug-ins are updated
	 *
	 * @param f the callback function to register
	 */
	template <typename PluginUpdateFunction>
	inline void registerForUpdates(PluginUpdateFunction f) const {
		boost::mutex::scoped_lock plugins_lock(m_mutex);
		m_signal_plugins_updated.connect(f);
	}

	/// this updates the Vocabularies used by all plug-ins
	inline void updateVocabulary(void) {
		m_plugins.run(boost::bind(&PluginType::updateVocabulary, _1,
								  boost::cref(m_vocabulary)));
	}

	
protected:

	/**
	 * protected constructor: this should only be used by derived classes
	 *
	 * @param vocab_mgr the global manager of Vocabularies
	 * @param default_config_file the default configuration file to use
	 * @param plugin_element the name of the plug-in element node
	 */
	PluginConfig(const VocabularyManager& vocab_mgr,
				 const std::string& config_file,
				 const std::string& plugin_element)
		: ConfigManager(config_file),
		m_vocabulary(vocab_mgr.getVocabulary()),
		m_plugin_element(plugin_element)
	{
		vocab_mgr.registerForUpdates(boost::bind(&PluginConfig::updateVocabulary, this));
		setLogger(PION_GET_LOGGER("pion.platform.PluginConfig"));
	}

	/**
	 * sets configuration parameters for a managed plug-in
	 *
	 * @param plugin_id unique identifier associated with the plug-in
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 */
	inline void setPluginConfig(const std::string& plugin_id,
								const xmlNodePtr config_ptr);
	
	/**
	 * adds a new plug-in object
	 *
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters (must include a Plugin type)
	 *
	 * @return std::string string containing the plug-in's auto-generated identifier
	 */
	inline std::string addPlugin(const xmlNodePtr config_ptr);
	
	/**
	 * removes a plug-in object
	 *
	 * @param plugin_id unique identifier associated with the plug-in
	 */
	inline void removePlugin(const std::string& plugin_id);
	
	/**
	 * adds a new plug-in object (without locking or config file updates).  This
	 * function must be defined properly for any derived classes that wish to
	 * use openPluginConfig().
	 *
	 * @param plugin_id unique identifier associated with the plug-in
	 * @param plugin_name the name of the plug-in to load (searches
	 *                    plug-in directories and appends extensions)
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 */
	virtual void addPluginNoLock(const std::string& plugin_id,
								 const std::string& plugin_name,
								 const xmlNodePtr config_ptr)
	{
		PluginType *new_plugin_ptr = m_plugins.load(plugin_id, plugin_name);
		new_plugin_ptr->setId(plugin_id);
		if (config_ptr != NULL)
			new_plugin_ptr->setConfig(m_vocabulary, config_ptr);
	}
	
	
	/// references the Vocabulary used by plug-ins to describe Terms
	const Vocabulary&				m_vocabulary;

	/// name of the plug-in element for Pion XML config files
	const std::string				m_plugin_element;
	
	/// collection of plug-in objects being managed
	PluginManager<PluginType>		m_plugins;

	/// signal triggered whenever a plug-in is modified
	mutable boost::signal0<void>	m_signal_plugins_updated;

	/// mutex to make class thread-safe
	mutable boost::mutex			m_mutex;	
};

	
// inline member functions for PluginConfig

template <typename PluginType>
inline bool PluginConfig<PluginType>::writeConfigXML(std::ostream& out,
													 const std::string& plugin_id) const
{
	// find the plug-in element in the XML config document
	boost::mutex::scoped_lock plugins_lock(m_mutex);
	xmlNodePtr plugin_node = findConfigNodeByAttr(m_plugin_element,
												  ID_ATTRIBUTE_NAME,
												  plugin_id,
												  m_config_node_ptr->children);
	if (plugin_node == NULL)
		return false;
	
	// found it
	ConfigManager::writeBeginPionConfigXML(out);
	ConfigManager::writeConfigXML(out, plugin_node, false);
	ConfigManager::writeEndPionConfigXML(out);

	return true;
}

template <typename PluginType>
inline xmlNodePtr PluginConfig<PluginType>::getPluginConfig(const std::string& plugin_id)
{
	// find the plug-in element in the XML config document
	boost::mutex::scoped_lock plugins_lock(m_mutex);
	xmlNodePtr plugin_node = findConfigNodeByAttr(m_plugin_element,
												  ID_ATTRIBUTE_NAME,
												  plugin_id,
												  m_config_node_ptr->children);
	if (plugin_node == NULL)
		throw typename PluginManager<PluginType>::PluginNotFoundException(plugin_id);
	
	// copy the plugin configuration
	return xmlCopyNodeList(plugin_node);
}
	
template <typename PluginType>
inline void PluginConfig<PluginType>::setPluginConfig(const std::string& plugin_id,
													  const xmlNodePtr config_ptr)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());
	
	// update it within memory and the configuration file
	boost::mutex::scoped_lock plugins_lock(m_mutex);
	m_plugins.run(plugin_id, boost::bind(&PluginType::setConfig, _1,
										 boost::cref(m_vocabulary), config_ptr));
	ConfigManager::setPluginConfig(m_plugin_element, plugin_id, config_ptr);
	
	// send notifications
	m_signal_plugins_updated();
	PION_LOG_DEBUG(m_logger, "Updated " << m_plugin_element << " configuration (" << plugin_id << ')');
}

template <typename PluginType>
inline std::string PluginConfig<PluginType>::addPlugin(const xmlNodePtr config_ptr)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());

	// find the plug-in type within the XML configuration
	std::string plugin_type;
	const std::string plugin_id(ConfigManager::createUUID());
	if (config_ptr == NULL || ! getConfigOption(PLUGIN_ELEMENT_NAME, plugin_type, config_ptr))
		throw EmptyPluginElementException(plugin_id);
	
	// create the new plug-in and add it to the config file
	boost::mutex::scoped_lock plugins_lock(m_mutex);
	addPluginNoLock(plugin_id, plugin_type, config_ptr);
	addPluginConfig(m_plugin_element, plugin_id, plugin_type, config_ptr);
	
	// send notifications
	m_signal_plugins_updated();
	PION_LOG_DEBUG(m_logger, "Loaded " << m_plugin_element << " (" << plugin_type << "): " << plugin_id);
	
	// return the plug-in's (new) identifier
	return plugin_id;
}

template <typename PluginType>
inline void PluginConfig<PluginType>::removePlugin(const std::string& plugin_id)
{
	// make sure that the plug-in configuration file is open
	if (! configIsOpen())
		throw ConfigNotOpenException(getConfigFile());

	// remove it from memory and the configuration file
	boost::mutex::scoped_lock plugins_lock(m_mutex);
	m_plugins.remove(plugin_id);
	removePluginConfig(m_plugin_element, plugin_id);
	
	// send notifications
	m_signal_plugins_updated();
	PION_LOG_DEBUG(m_logger, "Removed " << m_plugin_element << ": " << plugin_id);
}


}	// end namespace platform
}	// end namespace pion

#endif
