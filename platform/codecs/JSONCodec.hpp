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

#ifndef __PION_JSONCODEC_HEADER__
#define __PION_JSONCODEC_HEADER__

#include <pion/PionConfig.hpp>
#include <pion/platform/Codec.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// JSONCodec: used to encode and decode Events using JSON
///
class JSONCodec :
	public Codec
{
public:

	/// constructs a new JSONCodec object
	JSONCodec(void) : Codec() {}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~JSONCodec() {}
	
	/// returns an HTTP content type that is used by this Codec
	virtual const std::string& getContentType(void) const { return CONTENT_TYPE; }

	/**
	 * clones the codec, returning a pointer to the cloned copy
	 *
	 * @return CodecPtr pointer to the cloned copy of the codec
	 */
	virtual CodecPtr clone(void) const;

	/**
	 * writes an Event to an output stream
	 *
	 * @param out the output stream to which the Event will be written
	 * @param e the Event to write to the output stream
	 */
	virtual void write(std::ostream& out, const Event& e);

	/**
	 * reads an Event from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @param e the Event read, if any; null if error
	 * @return true if successful, false otherwise
	 */
	virtual bool read(std::istream& in, Event& e);

	/**
	 * reads an Event from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @return EventPtr& pointer to the event read, if any; null if error
	 */
	virtual EventPtr read(std::istream& in);

	/**
	 * this updates the Vocabulary information used by this Codec; it should be
	 * called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);
	
	
private:

	/// content type used by this Codec
	static const std::string		CONTENT_TYPE;
};


}	// end namespace platform
}	// end namespace pion

#endif
