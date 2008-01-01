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

	/// exception thrown if the service does not recognize a configuration option
	class UnknownOptionException : public PionException {
	public:
		UnknownOptionException(const std::string& option_name)
			: PionException("Option not recognized by codec: ", option_name) {}
	};

	
	/// constructs a new Codec object
	Codec(void) {}
	
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
	 * reads an Event from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @return EventPtr& pointer to the event read, if any; null if error
	 */
	virtual EventPtr read(std::istream& in) = 0;
	
	/**
	 * this updates the Vocabulary information used by this Codec; it should be
	 * called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v) = 0;

	/**
	 * sets a configuration option
	 *
	 * @param option_name the name of the option to change
	 * @param option_value the value of the option
	 */
	virtual void setOption(const std::string& option_name, const std::string& option_value) {
		throw UnknownOptionException(option_name);
	}
	
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
		EventPtr event_ptr;
		while ( (event_ptr = read(in)) ) {
			c.push_back(event_ptr);
		}
		return(! c.empty());
	}
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
