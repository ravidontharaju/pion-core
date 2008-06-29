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