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

#include <libxml/tree.h>
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
#include <pion/platform/Codec.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// CodecFactory: manages the creation of codecs
///
class PION_PLATFORM_API CodecFactory :
	public ConfigManager,
	private boost::noncopyable
{
public:

	/// exception thrown if you try modifying Codecs before opening the config file
	class CodecConfigNotOpenException : public PionException {
	public:
		CodecConfigNotOpenException(const std::string& config_file)
			: PionException("Codecs configuration file must be opened before making changes: ", config_file) {}
	};

	/// exception thrown if a Codec cannot be found
	class CodecNotFoundException : public PionException {
	public:
		CodecNotFoundException(const std::string& codec_id)
			: PionException("No codecs found for identifier: ", codec_id) {}
	};

	/// exception thrown if the codec config file contains a codec with a missing identifier
	class EmptyCodecIdException : public PionException {
	public:
		EmptyCodecIdException(const std::string& config_file)
			: PionException("Configuration file includes a codec with an empty identifier: ", config_file) {}
	};

	/// exception thrown if the codec config tree does not define a plug-in type
	class EmptyPluginException : public PionException {
	public:
		EmptyPluginException(const std::string& codec_id)
			: PionException("Codec configuration does not define a plug-in type: ", codec_id) {}
	};
	
	/// exception thrown if there is an error adding a Codec to the config file
	class AddCodecConfigException : public PionException {
	public:
		AddCodecConfigException(const std::string& codec_id)
			: PionException("Unable to add a codec to the configuration file: ", codec_id) {}
	};

	/// exception thrown if there is an error updating a Codec in the config file
	class UpdateCodecConfigException : public PionException {
	public:
		UpdateCodecConfigException(const std::string& codec_id)
			: PionException("Unable to update a codec in the configuration file: ", codec_id) {}
	};

	/// exception thrown if there is an error removing a Codec from the config file
	class RemoveCodecConfigException : public PionException {
	public:
		RemoveCodecConfigException(const std::string& codec_id)
			: PionException("Unable to remove a codec from the configuration file: ", codec_id) {}
	};
		
	
	/**
	 * constructs a new CodecFactory object
	 *
	 * @param vocab_mgr the global manager of Vocabularies
	 */
	CodecFactory(const VocabularyManager& vocab_mgr)
		: ConfigManager(DEFAULT_CONFIG_FILE),
		m_logger(PION_GET_LOGGER("pion.platform.CodecFactory")),
		m_vocabulary(vocab_mgr.getVocabulary())
	{
		vocab_mgr.registerForUpdates(boost::bind(&CodecFactory::updateVocabulary, this));
	}

	/// virtual destructor
	virtual ~CodecFactory() {}
	
	/// creates a new Codec config file that includes the Pion "config" element
	virtual void createConfigFile(void);
	
	/// opens an existing Codec config file and loads the data it contains
	virtual void openConfigFile(void);
		
	/**
	 * gets a unique instance of a Codec that may be used for en/decoding
	 *
	 * @param codec_id unique identifier associated with the Codec
	 * @return CodecPtr smart pointer to the Codec object (destructs it when finished)
	 */
	inline CodecPtr getCodec(const std::string& codec_id) {
		Codec *codec_ptr = m_codecs.get(codec_id);
		// throw an exception if the codec was not found
		if (codec_ptr == NULL)
			throw CodecNotFoundException(codec_id);
		// return a cloned instance of the Codec since its state may change
		// while encoding or decoding data streams
		return codec_ptr->clone();
	}
	
	/**
	 * removes a Codec object
	 *
	 * @param codec_id unique identifier associated with the Codec
	 */
	void removeCodec(const std::string& codec_id);
	
	/**
	 * adds a new Codec object
	 *
	 * @param codec_plugin the name of the Codec plug-in to load (searches
	 *                     plug-in directories and appends extensions)
	 * @param codec_config_ptr pointer to a list of XML nodes containing codec
	 *                         configuration parameters
	 *
	 * @return std::string string containing the Codec's auto-generated identifier
	 */
	std::string addCodec(const std::string& codec_plugin,
						 const xmlNodePtr codec_config_ptr = NULL);
	
	/**
	 * sets configuration parameters for a managed Codec
	 *
	 * @param codec_id unique identifier associated with the Codec
	 * @param codec_config_ptr pointer to a list of XML nodes containing codec
	 *                         configuration parameters
	 */
	void setCodecConfig(const std::string& codec_id, const xmlNodePtr codec_config_ptr);

	/**
	 * registers a callback function to be executed whenever a Codec is updated
	 *
	 * @param f the callback function to register
	 */
	template <typename CodecUpdateFunction>
	inline void registerForUpdates(CodecUpdateFunction f) const {
		m_signal_codec_updated.connect(f);
	}
	
	/// this updates the Vocabularies used by all Codecs
	inline void updateVocabulary(void) {
		m_codecs.run(boost::bind(&Codec::updateVocabulary, _1,
								 boost::cref(m_vocabulary)));
	}

	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }
	
	
private:

	/**
	 * add configuration parameters for a codec to the config file
	 *
	 * @param codec_node_ptr pointer to the existing codec element node
	 * @param codec_config_ptr pointer to the new configuration parameters
	 *
	 * @return true if successful, false if there was an error
	 */
	bool addCodecConfig(xmlNodePtr codec_node_ptr, xmlNodePtr codec_config_ptr);

	
	/// default name of the Codec config file
	static const std::string		DEFAULT_CONFIG_FILE;

	/// name of the codec element for Pion XML config files
	static const std::string		CODEC_ELEMENT_NAME;

	/// name of the plugin type element for Pion XML config files
	static const std::string		PLUGIN_ELEMENT_NAME;

	/// name of the ID (codec_id) attribute for Pion XML config files
	static const std::string		ID_ATTRIBUTE_NAME;

	
	/// primary logging interface used by this class
	PionLogger						m_logger;	

	/// references the Vocabulary used by this CodecFactory to describe Terms
	const Vocabulary&				m_vocabulary;

	/// collection of codec objects being managed
	PluginManager<Codec>			m_codecs;

	/// signal triggered whenever a Codec is modified
	mutable boost::signal0<void>	m_signal_codec_updated;
};


}	// end namespace platform
}	// end namespace pion

#endif
