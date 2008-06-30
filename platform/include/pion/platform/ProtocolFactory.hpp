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

#ifndef __PION_PROTOCOLFACTORY_HEADER__
#define __PION_PROTOCOLFACTORY_HEADER__

#include <string>
#include <libxml/tree.h>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Protocol.hpp>
#include <pion/platform/PluginConfig.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

///
/// ProtocolFactory: manages Pion's Protocol plug-ins
///
class PION_PLATFORM_API ProtocolFactory :
	public PluginConfig<Protocol>
{
public:

	/// exception thrown if a Protocol cannot be found
	class ProtocolNotFoundException : public PionException {
	public:
		ProtocolNotFoundException(const std::string& protocol_id)
			: PionException("No protocol found for identifier: ", protocol_id) {}
	};

	
	/// virtual destructor
	virtual ~ProtocolFactory() {}
	
	/**
	 * constructs a new ProtocolFactory object
	 *
	 * @param vocab_mgr the global manager of Vocabularies
	 */
	explicit ProtocolFactory(const VocabularyManager& vocab_mgr);

	/**
	 * gets a unique instance of a Protocol that may be used for en/decoding
	 *
	 * @param protocol_id unique identifier associated with the Protocol
	 * @return ProtocolPtr smart pointer to the Protocol object (destructs it when finished)
	 */
	ProtocolPtr getProtocol(const std::string& protocol_id);

	/**
	 * sets configuration parameters for a managed Protocol
	 *
	 * @param protocol_id unique identifier associated with the Protocol
	 * @param config_ptr pointer to a list of XML nodes containing Protocol
	 *                   configuration parameters
	 */
	void setProtocolConfig(const std::string& protocol_id, const xmlNodePtr config_ptr);

	/**
	 * adds a new managed Protocol
	 *
	 * @param config_ptr pointer to a list of XML nodes containing Protocol
	 *                   configuration parameters (must include a Plugin type)
	 *
	 * @return std::string the new Protocol's unique identifier
	 */
	std::string addProtocol(const xmlNodePtr config_ptr);
	
	/**
	 * removes a managed Protocol
	 *
	 * @param protocol_id unique identifier associated with the Protocol
	 */
	void removeProtocol(const std::string& protocol_id);

	/**
	 * uses a memory buffer to generate XML configuration data for a Protocol
	 *
	 * @param buf pointer to a memory buffer containing configuration data
	 * @param len number of bytes available in the memory buffer
	 *
	 * @return xmlNodePtr XML configuration list for the Protocol
	 */
	static xmlNodePtr createProtocolConfig(const char *buf, std::size_t len) {
		return ConfigManager::createResourceConfig(PROTOCOL_ELEMENT_NAME, buf, len);
	}
	
protected:
	
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
		try {
			Protocol *new_plugin_ptr = m_plugins.load(plugin_id, plugin_name);
			new_plugin_ptr->setId(plugin_id);
			new_plugin_ptr->setProtocolFactory(*this);
			if (config_ptr != NULL)
				new_plugin_ptr->setConfig(m_vocabulary, config_ptr);
		} catch (PionPlugin::PluginNotFoundException&) {
			throw;
		} catch (std::exception& e) {
			throw PluginException(e.what());
		}
	}

	
private:
	
	/// default name of the Protocol config file
	static const std::string		DEFAULT_CONFIG_FILE;

	/// name of the protocol element for Pion XML config files
	static const std::string		PROTOCOL_ELEMENT_NAME;
};


}	// end namespace platform
}	// end namespace pion

#endif
