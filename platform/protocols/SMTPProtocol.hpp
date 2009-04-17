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

#ifndef __SMTP_PROTOCOL_HEADER__
#define __SMTP_PROTOCOL_HEADER__

#include <pion/PionException.hpp>
#include <pion/platform/Protocol.hpp>

namespace pion {	// begin namespace pion
namespace plugins {		// begin namespace plugins

class SMTPProtocol
	: public pion::platform::Protocol
{
public:
	SMTPProtocol() {}
	/// virtual destructor
	virtual ~SMTPProtocol() {}

	/// resets the Protocol to its initial state
	virtual void reset(void);

	/**
	 * called to close the protocol parsing.  An event may be returned
	 * if there is data remaining (i.e. if closed prematurely)
	 *
	 * @param event_ptr_ref refererence to an event object returned if the call resulted in event generation
	 * @return true if the request or response parsing was finished prematurely
	 */
	virtual bool close(pion::platform::EventPtr& event_ptr_ref);

	/**
	 * clones the Protocol, returning a pointer to the cloned copy
	 *
	 * @return ProtocolPtr pointer to the cloned copy of the codec
	 */
	virtual boost::shared_ptr<Protocol> clone(void) const;

	/**
	 * parses the next portion of the network data
	 *
	 * @param request direction flag (true if request, false if response)
	 * @param ptr pointer to data (may be NULL if data packet was missing)
	 * @param len length in bytes of the network data
	 * @param data_timestamp data frame timestamp
	 * @param ack_timestamp timestamp for acknowlegement of receipt of data frame
	 * @param event_ptr refererence to an event object returned if the call resulted in event generation
	 *
	 * @return true if the current data chunk completes a new event, indeterminate if the event parsing is not
	 *		   yet complete, false if an error encountered during the parsing
	 */
	virtual boost::tribool readNext(bool request, const char* ptr, size_t len,
			boost::posix_time::ptime data_timestamp, boost::posix_time::ptime ack_timestamp,
			pion::platform::EventPtr& event_ptr );

};

}	// end namespace plugins
}	// end namespace pion

#endif //__SMTP_PROTOCOL_HEADER__
