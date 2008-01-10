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

#ifndef __PION_CODEC_HEADER__
#define __PION_CODEC_HEADER__

#include <iostream>
#include <libxml/tree.h>
#include <boost/shared_ptr.hpp>
#include <boost/noncopyable.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// Codec: used to encode and decode Events using a particular format
///
class Codec
	: private boost::noncopyable
{
public:

	/// exception thrown if the Codec configuration does not define an event type
	class EmptyEventException : public PionException {
	public:
		EmptyEventException(const std::string& codec_id)
			: PionException("Codec configuration does not define an event type: ", codec_id) {}
	};

	/// exception thrown if the Codec configuration references an unknown event type
	class UnknownTermException : public PionException {
	public:
		UnknownTermException(const std::string& event_type)
			: PionException("Codec configuration references an unknown event type: ", event_type) {}
	};

	/// exception thrown if the Codec configuration uses an event type for a Term that is not an object
	class NotAnObjectException : public PionException {
	public:
		NotAnObjectException(const std::string& event_type)
			: PionException("Codec configuration defines a non-object event type: ", event_type) {}
	};

	
	/// constructs a new Codec object
	Codec(void) : m_event_type(Vocabulary::UNDEFINED_TERM_REF) {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~Codec() {}
	
	/// returns an HTTP content type that is used by this Codec
	virtual const std::string& getContentType(void) const = 0;
	
	/**
	 * clones the codec, returning a pointer to the cloned copy
	 *
	 * @return Codec* pointer to the cloned copy of the codec
	 */
	virtual boost::shared_ptr<Codec> clone(void) const = 0;

	/**
	 * writes an Event to an output stream
	 *
	 * @param out the output stream to which the Event will be written
	 * @param e the Event to write to the output stream
	 */
	virtual void write(std::ostream& out, const Event& e) = 0;

	/**
	 * reads an Event from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @param e the Event read, if any; null if error
	 * @return true if successful, false otherwise
	 */
	virtual bool read(std::istream& in, Event& e) = 0;

	/**
	 * sets configuration parameters for this Codec
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 * @param codec_config_ptr pointer to a list of XML nodes containing codec
	 *                         configuration parameters
	 */
	virtual void setConfig(const Vocabulary& v, const xmlNodePtr codec_config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this Codec; it should be
	 * called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);

	/**
	 * writes a collection of Events to an output stream
	 *
	 * @param out the output stream to which the Event will be written
	 * @param c the collection of Events to write to the output stream
	 */
	inline void write(std::ostream& out, const EventCollection& c) {
		for (EventCollection::const_iterator i = c.begin(); i != c.end(); ++i) {
			write(out, *i);
		}
	}

	/**
	 * writes a collection of Events to an output stream
	 *
	 * @param out the output stream to which the Event will be written
	 * @param c the collection of pointers to Events to write to the output stream
	 */
	inline void write(std::ostream& out, const EventPtrCollection& c) {
		for (EventPtrCollection::const_iterator i = c.begin(); i != c.end(); ++i) {
			write(out, **i);
		}
	}
	
	/**
	 * reads a collection of Events from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @param c the collection of pointers to Events read, if any; null if error
	 * @return true if successful, false otherwise
	 */
	inline bool read(std::istream& in, EventPtrCollection& c) {
		if (!c.empty()) c.clear();
		EventPtr event_ptr(new Event(m_event_type));
		while (read(in, *event_ptr)) {
			c.push_back(event_ptr);
			event_ptr.reset(new Event(m_event_type));
		}
		return(! c.empty());
	}
	
	/**
	 * reads an Event from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @return EventPtr& pointer to the event read, if any; null if error
	 */
	inline EventPtr read(std::istream& in) {
		EventPtr event_ptr(new Event(getEventType()));
		if (! read(in, *event_ptr))
			event_ptr.reset();
		return event_ptr;
	}
	
	/// sets the unique identifier for this Codec
	inline void setId(const std::string& codec_id) { m_codec_id = codec_id; }
	
	/// returns the unique identifier for this Codec
	inline const std::string& getId(void) const { return m_codec_id; }
	
	/// sets the descriptive name for this Codec
	inline void setName(const std::string& name) { m_name = name; }
	
	/// returns the descriptive name for this Codec
	inline const std::string& getName(void) const { return m_name; }
	
	/// sets the descriptive comment for this Codec
	inline void setComment(const std::string& comment) { m_comment = comment; }
	
	/// returns the descriptive comment for this Codec
	inline const std::string& getComment(void) const { return m_comment; }

	/// returns the type of Event that is used by this Codec
	inline Event::EventType getEventType(void) const { return m_event_type; }

	
protected:
	
	/// protected copy function (use clone() instead)
	inline void copy(const Codec& c) {
		m_codec_id = c.m_codec_id;
		m_name = c.m_name;
		m_comment = c.m_comment;
		m_event_type = c.m_event_type;
	}
	
	
private:
	
	/// name of the event type element for Pion XML config files
	static const std::string		EVENT_ELEMENT_NAME;

	/// name of the descriptive name element for Pion XML config files
	static const std::string		NAME_ELEMENT_NAME;
	
	/// name of the comment element for Pion XML config files
	static const std::string		COMMENT_ELEMENT_NAME;


	/// uniquely identifies this particular Codec
	std::string						m_codec_id;

	/// descriptive name for this Codec
	std::string						m_name;

	/// descriptive comment for this Codec
	std::string						m_comment;
	
	/// the type of Events used by this Codec (TermRef maps to Terms of type OBJECT)
	Event::EventType				m_event_type;
};


/// data type used for Codec smart pointers
typedef boost::shared_ptr<Codec>	CodecPtr;
	
	
//
// The following symbols must be defined for any Codecs that you would
// like to be able to load dynamically using the CodecFactory::loadCodec()
// function.  These are not required for any Codecs that you only want to link
// directly into your programs.
//
// Make sure that you replace "CODEC" with the name of your derived class.
// This name must also match the name of the object file (excluding the
// extension).  These symbols must be linked into your Codec's object file,
// not included in any headers that it may use (declarations are OK in headers
// but not the definitions).
//
// The "pion_create" function is used to create new instances of your Codec.
// The "pion_destroy" function is used to destroy instances of your Codec.
//
// extern "C" PION_PLUGIN_API Codec *pion_create_CODEC(void) {
//		return new CODEC;
// }
//
// extern "C" PION_PLUGIN_API void pion_destroy_CODEC(CODEC *codec_ptr) {
//		delete codec_ptr;
// }
//

	
}	// end namespace platform
}	// end namespace pion

#endif
