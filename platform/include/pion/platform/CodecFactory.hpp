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

#include <boost/bind.hpp>
#include <boost/noncopyable.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionLogger.hpp>
#include <pion/PluginManager.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// CodecFactory: manages the creation of codecs
///
class CodecFactory :
	public ConfigManager,
	private boost::noncopyable
{
public:

	/// exception thrown if a Codec cannot be found
	class CodecNotFoundException : public PionException {
	public:
		CodecNotFoundException(const std::string& codec_id)
			: PionException("No codecs found for identifier: ", codec_id) {}
	};

	
	/**
	 * constructs a new CodecFactory object
	 *
	 * @param v the Vocabulary that this CodecFactory will use to describe Terms
	 */
	CodecFactory(const Vocabulary& v)
		: ConfigManager(DEFAULT_CONFIG_FILE),
		m_logger(PION_GET_LOGGER("pion.platform.CodecFactory")), m_vocabulary(v)
	{}

	/// virtual destructor
	virtual ~CodecFactory() {}
	
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
	 * adds a new Codec object
	 *
	 * @param codec_id unique identifier associated with the Codec
	 * @param codec_ptr pointer to the Codec object to add
	 */
	inline void addCodec(const std::string& codec_id, Codec *codec_ptr) {
		m_codecs.add(codec_id, codec_ptr);
		PION_LOG_DEBUG(m_logger, "Added static codec: " << codec_id);
	}

	/**
	 * loads a new Codec plug-in
	 *
	 * @param codec_id unique identifier associated with the Codec
	 * @param codec_type the type of Codec plug-in to load (searches
	 *                   plug-in directories and appends extensions)
	 */
	inline void loadCodec(const std::string& codec_id, const std::string& codec_type) {
		m_codecs.load(codec_id, codec_type);
		PION_LOG_DEBUG(m_logger, "Loaded codec (" << codec_type << "): " << codec_id);
	}
	
	/**
	 * removes a Codec object
	 *
	 * @param codec_id unique identifier associated with the Codec
	 */
	inline void removeCodec(const std::string& codec_id) {
		// convert "plugin not found" exceptions into "codec not found"
		try { m_codecs.remove(codec_id); }
		catch (PluginManager<Codec>::PluginNotFoundException& /* e */) {
			throw CodecNotFoundException(codec_id);
		}
		PION_LOG_DEBUG(m_logger, "Removed codec: " << codec_id);
	}
	
	/**
	 * sets a configuration option for a managed Codec
	 *
	 * @param codec_id unique identifier associated with the Codec
	 * @param option_name the name of the configuration option
	 * @param option_value the value to set the option to
	 */
	inline void setCodecOption(const std::string& codec_id,
							   const std::string& option_name,
							   const std::string& option_value)
	{
		// convert "plugin not found" exceptions into "codec not found"
		try {
			m_codecs.run(codec_id, boost::bind(&Codec::setOption, _1, option_name, option_value));
		} catch (PluginManager<Codec>::PluginNotFoundException& /* e */) {
			throw CodecNotFoundException(codec_id);
		}
		PION_LOG_DEBUG(m_logger, "Set codec option (" << codec_id << "): "
					   << option_name << '=' << option_value);
	}

	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }
	
	
private:

	/// default name of the Codec config file
	static const std::string		DEFAULT_CONFIG_FILE;

	
	/// primary logging interface used by this class
	PionLogger						m_logger;	

	/// references the Vocabulary used by this CodecFactory to describe Terms
	const Vocabulary&				m_vocabulary;

	/// collection of codec objects being managed
	PluginManager<Codec>			m_codecs;
};


}	// end namespace platform
}	// end namespace pion

#endif
