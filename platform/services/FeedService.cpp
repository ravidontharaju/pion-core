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

#include <boost/bind.hpp>
#include <pion/net/HTTPResponseWriter.hpp>
#include <pion/platform/ConfigManager.hpp>
#include "PlatformConfig.hpp"
#include "FeedService.hpp"

using namespace pion::net;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)

	
// FeedWriter member functions

void FeedWriter::writeEvent(EventPtr& e)
{
	// use mutex to ensure only one Event is sent at a time
	boost::mutex::scoped_lock queue_lock(m_mutex);
	if (m_tcp_conn->is_open()) {
		try {
			// send the Event using the codec
			m_codec_ptr->write(m_tcp_stream, *e);
		} catch (std::exception&) {
			// stop sending Events if we encounter an exception
			m_finished_handler();
		}
	} else {
		// note that the finished handler removes the connection.  The
		// connection's EventHandler function should contain the only
		// smart pointer reference to this object.  Hence, by calling the
		// finished handler, the object will be destructed.
		m_finished_handler();
	}
}
	

// FeedReader member functions

void FeedReader::readEvents(void)
{
	// this is certainly not the most efficient way to do this, but
	// since we can't guarantee that a Reactor hasn't been deleted, we
	// have send Events by way of the ReactionEngine...
	EventPtr event_ptr;
	try {
		while ((event_ptr = m_codec_ptr->read(m_tcp_stream))) {
			m_reaction_engine.send(m_reactor_id, event_ptr);
		}
	} catch (std::exception&) {}	// just exit gracefully if exception is thrown
}

	
// FeedService member functions

void FeedService::operator()(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	// get the reactor_id using the relative request path
	const std::string reactor_id(getRelativeResource(request->getResource()));
	if (reactor_id.empty() || !getConfig().getReactionEngine().hasReactor(reactor_id)) {
		HTTPServer::handleNotFoundRequest(request, tcp_conn);
		return;
	}
	
	// get the codec_id using the relative request path
	const std::string codec_id(getRelativeResource(request->getResource()));
	CodecPtr codec_ptr(getConfig().getCodecFactory().getCodec(codec_id));
	if (codec_id.empty() || !codec_ptr) {
		HTTPServer::handleNotFoundRequest(request, tcp_conn);
		return;
	}
	
	// check the request method to determine if we should read or write Events
	if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {

		// request made to receive a stream of Events
		
		// first send an HTTP response header, then add a FeedWriter to send Events
		HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, *request));
		writer->send(boost::bind(&FeedService::addFeedWriter, this,
								 reactor_id, codec_ptr, tcp_conn));
		
	} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT
			   || request->getMethod() == HTTPTypes::REQUEST_METHOD_POST)
	{

		// request made to send a stream of Events to a Reactor

		// first send an HTTP response header, then use a FeedReader to read Events
		HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, *request));
		writer->send(boost::bind(&FeedService::addFeedReader, this,
								 reactor_id, codec_ptr, tcp_conn));
		
	} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_HEAD) {
		
		// request is just checking if the reactor is valid -> return OK
		HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, *request));
		writer->send();
	}	
}
	
void FeedService::addFeedWriter(const std::string& reactor_id,
								CodecPtr& codec_ptr,
								TCPConnectionPtr& tcp_conn)
{
	// create a unique connection id
	const std::string connection_id(ConfigManager::createUUID());
	
	// create a FeedWriter object that will be used to send Events
	FeedWriterPtr writer_ptr(new FeedWriter(reactor_id, codec_ptr, tcp_conn, 
											boost::bind(&FeedService::removeFeedHandler,
														this, connection_id)));
	
	// insert the FeedWriter into our collection of handlers
	m_feed_handlers.insert(std::make_pair(connection_id, writer_ptr));
	
	// add a temporary connection between the Reactor and the FeedWriter
	// (the FeedWriter will remove the connection for us when the connection is dropped)
	Reactor::EventHandler send_handler(boost::bind(&FeedService::scheduleWriteEvent,
												   this, writer_ptr, _1));
	getConfig().getReactionEngine().addTempConnection(reactor_id, connection_id,
													  send_handler);
}

void FeedService::addFeedReader(const std::string& reactor_id,
								CodecPtr& codec_ptr,
								TCPConnectionPtr& tcp_conn)
{
	// create a unique connection id
	const std::string connection_id(ConfigManager::createUUID());
	
	// create a FeedReader object that will be used to send Events
	FeedReaderPtr reader_ptr(new FeedReader(getConfig().getReactionEngine(),
											reactor_id, codec_ptr, tcp_conn, 
											boost::bind(&FeedService::removeFeedHandler,
														this, connection_id)));
	
	// insert the FeedReader into our collection of handlers
	m_feed_handlers.insert(std::make_pair(connection_id, reader_ptr));

	// schedule another thread to start reading Events
	getConfig().getServiceManager().post(boost::bind(&FeedReader::readEvents, reader_ptr));
}	
	
void FeedService::removeFeedHandler(const std::string& connection_id)
{
	// find the FeedHandler matching the connection_id
	boost::mutex::scoped_lock feed_handlers_lock(m_mutex);
	FeedHandlerMap::iterator i = m_feed_handlers.find(connection_id);
	if (i != m_feed_handlers.end()) {
		// ignore exceptions when trying to remove the connection
		try {
			getConfig().getReactionEngine().removeTempConnection(i->second->getReactorId(),
																 connection_id);
		} catch (...) {}
		// remove it from the service's map
		m_feed_handlers.erase(i);
	}
}

void FeedService::scheduleWriteEvent(FeedWriterPtr writer_ptr, EventPtr& e)
{
	getConfig().getServiceManager().post(boost::bind(&FeedWriter::writeEvent,
													 writer_ptr, e));
}
	
	
}	// end namespace server
}	// end namespace pion


/// creates new FeedService objects
extern "C" PION_PLUGIN_API pion::server::PlatformService *pion_create_FeedService(void) {
	return new pion::server::FeedService();
}

/// destroys FeedService objects
extern "C" PION_PLUGIN_API void pion_destroy_FeedService(pion::server::FeedService *service_ptr) {
	delete service_ptr;
}
