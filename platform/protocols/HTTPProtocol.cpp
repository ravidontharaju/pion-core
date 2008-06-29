#include "HTTPProtocol.hpp"

using namespace pion::net;

namespace pion {	// begin namespace pion
namespace plugins {		// begin namespace plugins

boost::tribool HTTPProtocol::readNext(bool request, const char *ptr, size_t len, 
									  pion::platform::EventPtr& event_ptr_ref)
{
	pion::net::HTTPMessageParser& parser = request ? m_request_parser : m_response_parser;

	// parse the data
	boost::tribool rc = parser.readNext(ptr, len);

	// message has been fully parsed, generate an event
	if(rc == true) 
	{
		generateEvent(parser.getMessage(), event_ptr_ref); 
		if(request) 
		{
			// HTTPResponse is recommended to be initialized with the original request
			m_response_parser.setRequest(dynamic_cast<pion::net::HTTPRequest&>(parser.getMessage())); 
		}
	}

	return rc;
}

boost::shared_ptr<pion::platform::Protocol> HTTPProtocol::clone(void) const
{
	HTTPProtocol* retval = new HTTPProtocol;
	retval->copyProtocol(*this);

	return pion::platform::ProtocolPtr(retval);
}


void HTTPProtocol::generateEvent(HTTPMessage& msg, pion::platform::EventPtr& event_ptr_ref)
{
	// TODO: generate pion event from the message
}

}	// end namespace plugins
}	// end namespace pion

/// creates new LogCodec objects
extern "C" PION_PLUGIN_API pion::platform::Protocol *pion_create_HTTPProtocol(void) {
	return new pion::plugins::HTTPProtocol();
}

/// destroys LogCodec objects
extern "C" PION_PLUGIN_API void pion_destroy_HTTPProtocol(pion::plugins::HTTPProtocol *protocol_ptr) {
	delete protocol_ptr;
}
