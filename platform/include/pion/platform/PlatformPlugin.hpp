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

#ifndef __PION_PLATFORMPLUGIN_HEADER__
#define __PION_PLATFORMPLUGIN_HEADER__

#include <string>
#include <libxml/tree.h>
#include <boost/noncopyable.hpp>
#include <pion/PionConfig.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

// forward declarations
class Vocabulary;

///
/// PlatformPlugin: interface class extended by all Pion Platform plug-ins
///
class PION_PLATFORM_API PlatformPlugin
	: private boost::noncopyable
{
public:

	/// constructs a new PlatformPlugin object
	PlatformPlugin(void) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~PlatformPlugin() {}
	
	/**
	 * sets configuration parameters for this plug-in
	 *
	 * @param v the Vocabulary that this plug-in will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing plug-in
	 *                   configuration parameters
	 */
	virtual void setConfig(const Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this plug-in;
	 * it should be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this plug-in will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);

	
	/// sets the unique identifier for this plug-in
	inline void setId(const std::string& plugin_id) { m_plugin_id = plugin_id; }
	
	/// returns the unique identifier for this plug-in
	inline const std::string& getId(void) const { return m_plugin_id; }
	
	/// sets the descriptive name for this plug-in
	inline void setName(const std::string& plugin_name) { m_plugin_name = plugin_name; }
	
	/// returns the descriptive name for this plug-in
	inline const std::string& getName(void) const { return m_plugin_name; }
	
	/// sets the descriptive comment for this plug-in
	inline void setComment(const std::string& plugin_comment) { m_plugin_comment = plugin_comment; }
	
	/// returns the descriptive comment for this plug-in
	inline const std::string& getComment(void) const { return m_plugin_comment; }

	
protected:
	
	/// protected copy function (use clone() instead)
	inline void copyPlugin(const PlatformPlugin& pp) {
		m_plugin_id = pp.m_plugin_id;
		m_plugin_name = pp.m_plugin_name;
		m_plugin_comment = pp.m_plugin_comment;
	}
	
	
private:
	
	/// name of the descriptive name element for Pion XML config files
	static const std::string		NAME_ELEMENT_NAME;
	
	/// name of the comment element for Pion XML config files
	static const std::string		COMMENT_ELEMENT_NAME;


	/// uniquely identifies this particular Codec
	std::string						m_plugin_id;

	/// descriptive name for this Codec
	std::string						m_plugin_name;

	/// descriptive comment for this Codec
	std::string						m_plugin_comment;
};

	
}	// end namespace platform
}	// end namespace pion

#endif
