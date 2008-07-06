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

#ifndef __PION_PROTOCOL_HEADER__
#define __PION_PROTOCOL_HEADER__

#include <istream>
#include <ostream>
#include <libxml/tree.h>
#include <boost/shared_ptr.hpp>
#include <boost/logic/tribool.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>
#include <pion/platform/PlatformPlugin.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// Protocol: used to encode and decode Events using a particular format
///
class PION_PLATFORM_API Protocol
	: public PlatformPlugin
{
public:

	/// exception thrown if the Protocol configuration does not define an event type
	class EmptyEventException : public PionException {
	public:
		EmptyEventException(const std::string& protocol_id)
			: PionException("Protocol configuration does not define an event type: ", protocol_id) {}
	};

	/// exception thrown if the Protocol configuration references an unknown event type
	class UnknownTermException : public PionException {
	public:
		UnknownTermException(const std::string& event_type)
			: PionException("Protocol configuration references an unknown event type: ", event_type) {}
	};

	/// exception thrown if the Protocol configuration uses an event type for a Term that is not an object
	class NotAnObjectException : public PionException {
	public:
		NotAnObjectException(const std::string& event_type)
			: PionException("Protocol configuration defines a non-object event type: ", event_type) {}
	};

	/// constructs a new Protocol object
	Protocol(void) : m_event_type(Vocabulary::UNDEFINED_TERM_REF) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~Protocol() {}
		

	/**
	 * clones the Protocol, returning a pointer to the cloned copy
	 *
	 * @return ProtocolPtr pointer to the cloned copy of the codec
	 */
	virtual boost::shared_ptr<Protocol> clone(void) const = 0;

	/**
	 * parses the next portion of the network data
	 * 
	 * @param request direction flag
	 * @ptr pointer to data
	 * @len data length
	 * @event_ptr refererence to an event object returned if the call resulted in event generation
	 * @return true if the current data chunk completes a new event, indeterminate if the event parsing is not 
	 *		   yet complete, false if an error encountered during the parsing
	 */
	virtual boost::tribool readNext(bool request, const char* ptr, size_t len, 
			pion::platform::EventPtr& event_ptr )=0;

	/**
	 * sets configuration parameters for this Protocol
	 *
	 * @param v the Vocabulary that this Protocol will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Protocol
	 *                   configuration parameters
	 */
	virtual void setConfig(const Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this Protocol;
	 * it should be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Protocol will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);
	
	/// returns the type of Event that is used by this Protocol
	inline Event::EventType getEventType(void) const { return m_event_type; }

	
protected:
	
	/// protected copy function (use clone() instead)
	inline void copyProtocol(const Protocol& c) {
		copyPlugin(c);
		m_event_type = c.m_event_type;
	}

	
private:
	
	/// name of the event type element for Pion XML config files
	static const std::string		EVENT_ELEMENT_NAME;

	
	/// the type of Events used by this Protocol (TermRef maps to Terms of type OBJECT)
	Event::EventType				m_event_type;
};


/// data type used for Protocol smart pointers
typedef boost::shared_ptr<Protocol>	ProtocolPtr;

	
}	// end namespace platform
}	// end namespace pion

#endif
