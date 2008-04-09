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

#ifndef __PION_CODECFACTORY_HEADER__
#define __PION_CODECFACTORY_HEADER__

#include <string>
#include <libxml/tree.h>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/PluginConfig.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

///
/// CodecFactory: manages Pion's Codec plug-ins
///
class PION_PLATFORM_API CodecFactory :
	public PluginConfig<Codec>
{
public:

	/// exception thrown if a Codec cannot be found
	class CodecNotFoundException : public PionException {
	public:
		CodecNotFoundException(const std::string& codec_id)
			: PionException("No codecs found for identifier: ", codec_id) {}
	};

	
	/// virtual destructor
	virtual ~CodecFactory() {}
	
	/**
	 * constructs a new CodecFactory object
	 *
	 * @param vocab_mgr the global manager of Vocabularies
	 */
	explicit CodecFactory(const VocabularyManager& vocab_mgr);

	/**
	 * gets a unique instance of a Codec that may be used for en/decoding
	 *
	 * @param codec_id unique identifier associated with the Codec
	 * @return CodecPtr smart pointer to the Codec object (destructs it when finished)
	 */
	CodecPtr getCodec(const std::string& codec_id);

	/**
	 * sets configuration parameters for a managed Codec
	 *
	 * @param codec_id unique identifier associated with the Codec
	 * @param config_ptr pointer to a list of XML nodes containing Codec
	 *                   configuration parameters
	 */
	void setCodecConfig(const std::string& codec_id, const xmlNodePtr config_ptr);

	/**
	 * adds a new managed Codec
	 *
	 * @param config_ptr pointer to a list of XML nodes containing Codec
	 *                   configuration parameters (must include a Plugin type)
	 *
	 * @return std::string the new Codec's unique identifier
	 */
	std::string addCodec(const xmlNodePtr config_ptr);
	
	/**
	 * removes a managed Codec
	 *
	 * @param codec_id unique identifier associated with the Codec
	 */
	void removeCodec(const std::string& codec_id);

	/**
	 * uses a memory buffer to generate XML configuration data for a Codec
	 *
	 * @param buf pointer to a memory buffer containing configuration data
	 * @param len number of bytes available in the memory buffer
	 *
	 * @return xmlNodePtr XML configuration list for the Codec
	 */
	static xmlNodePtr createCodecConfig(const char *buf, std::size_t len) {
		return ConfigManager::createResourceConfig(CODEC_ELEMENT_NAME, buf, len);
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
			Codec *new_plugin_ptr = m_plugins.load(plugin_id, plugin_name);
			new_plugin_ptr->setId(plugin_id);
			new_plugin_ptr->setCodecFactory(*this);
			if (config_ptr != NULL)
				new_plugin_ptr->setConfig(m_vocabulary, config_ptr);
		} catch (PionPlugin::PluginNotFoundException&) {
			throw;
		} catch (std::exception& e) {
			throw PluginException(e.what());
		}
	}

	
private:
	
	/// default name of the Codec config file
	static const std::string		DEFAULT_CONFIG_FILE;

	/// name of the codec element for Pion XML config files
	static const std::string		CODEC_ELEMENT_NAME;
};


}	// end namespace platform
}	// end namespace pion

#endif
