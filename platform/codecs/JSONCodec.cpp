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

#include "JSONCodec.hpp"


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of JSONCodec
const std::string			JSONCodec::CONTENT_TYPE = "text/json";


// JSONCodec member functions

CodecPtr JSONCodec::clone(void) const
{
	JSONCodec *new_codec(new JSONCodec());
	return CodecPtr(new_codec);
}

void JSONCodec::write(std::ostream& out, const Event& e)
{
}

bool JSONCodec::read(std::istream& in, Event& e)
{
	return false;
}

void JSONCodec::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Codec base class
	Codec::setConfig(v, config_ptr);
	
	// ...
}

void JSONCodec::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Codec base class that might be needed
	Codec::updateVocabulary(v);

	// ...
}
	
	
}	// end namespace platform
}	// end namespace pion


/// creates new JSONCodec objects
extern "C" PION_PLUGIN_API pion::platform::Codec *pion_create_JSONCodec(void) {
	return new pion::platform::JSONCodec();
}

/// destroys JSONCodec objects
extern "C" PION_PLUGIN_API void pion_destroy_JSONCodec(pion::platform::JSONCodec *codec_ptr) {
	delete codec_ptr;
}
