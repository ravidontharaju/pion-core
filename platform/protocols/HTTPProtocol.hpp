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

#ifndef __HTTP_PROTOCOL_HEADER__
#define __HTTP_PROTOCOL_HEADER__

#include <pion/platform/Protocol.hpp>
#include <pion/net/HTTPMessageParser.hpp>

namespace pion {	// begin namespace pion
namespace plugins {		// begin namespace plugins


class HTTPProtocol : public pion::platform::Protocol
{
public:

	/// constructs HTTPProtocol object
	HTTPProtocol() : m_request_parser(true), m_response_parser(false) {}

	virtual ~HTTPProtocol() {}

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
	virtual boost::tribool readNext(bool request, const char *ptr, size_t len,
		pion::platform::EventPtr& event_ptr_ref);

	/**
	 * clones the Protocol, returning a pointer to the cloned copy
	 *
	 * @return ProtocolPtr pointer to the cloned copy of the codec
	 */
	virtual boost::shared_ptr<Protocol> clone(void) const;

private:

	void generateEvent(pion::net::HTTPMessage& msg, pion::platform::EventPtr& event_ptr_ref);

	pion::net::HTTPMessageParser	m_request_parser;
	pion::net::HTTPMessageParser	m_response_parser;
};


}	// end namespace plugins
}	// end namespace pion

#endif