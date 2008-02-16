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
	 * @param plugin_type the type of plug-in to load (searches plug-in
	 *                    directories and appends extensions)
	 * @param config_ptr pointer to a list of XML nodes containing Codec
	 *                   configuration parameters
	 *
	 * @return std::string the new Codec's unique identifier
	 */
	std::string addCodec(const std::string& plugin_type,
						 const xmlNodePtr config_ptr = NULL);
	
	/**
	 * removes a managed Codec
	 *
	 * @param codec_id unique identifier associated with the Codec
	 */
	void removeCodec(const std::string& codec_id);

	
private:
	
	/// default name of the Codec config file
	static const std::string		DEFAULT_CONFIG_FILE;

	/// name of the codec element for Pion XML config files
	static const std::string		CODEC_ELEMENT_NAME;
};


}	// end namespace platform
}	// end namespace pion

#endif
