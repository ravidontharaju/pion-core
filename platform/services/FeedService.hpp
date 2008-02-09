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

#ifndef __PION_FEEDSERVICE_HEADER__
#define __PION_FEEDSERVICE_HEADER__

#include <string>
#include <boost/function.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include "PlatformService.hpp"


namespace pion {		// begin namespace pion
namespace server {		// begin namespace server (Pion Server)


///
/// FeedHandler: base helper class for sending and receiving Events
///
class FeedHandler
{
public:
	
	/// data type for a function that is called when the connection is lost
	typedef boost::function0<void>		FinishedHandler;
	
	
	/// virtual destructor
	virtual ~FeedHandler() {}
	
	/**
	 * constructs a new FeedHandler object
	 *
	 * @param reactor_id unique identifier for the Reactor that this handler interacts with
	 * @param codec_ptr pointer to the Codec that this handler will use
	 * @param tcp_conn TCP connection that will be used to send/receive Events
	 * @param finished_handler function that is called when the connection is lost
	 */
	FeedHandler(const std::string& reactor_id, pion::platform::CodecPtr& codec_ptr,
				pion::net::TCPConnectionPtr& tcp_conn, FinishedHandler finished_handler)
		: m_reactor_id(reactor_id), m_codec_ptr(codec_ptr),
		m_tcp_conn(tcp_conn), m_finished_handler(finished_handler)
	{}
	
	
	/// returns the unique identifier for the Reactor that this handler interacts with
	inline const std::string& getReactorId(void) const { return m_reactor_id; }

	/// returns the unique identifier for the Codec that this handler uses
	inline const std::string& getCodecId(void) const { return m_codec_ptr->getId(); }

	
protected:
	
	/// unique identifier for the Reactor that this handler interacts with
	const std::string					m_reactor_id;
	
	/// pointer to the Codec used to write outgoing Event streams
	pion::platform::CodecPtr			m_codec_ptr;
	
	/// TCP connection for sending outgoing Event streams
	pion::net::TCPConnectionPtr			m_tcp_conn;
	
	/// Wrapper on top of the TCP connection for synchronous stream operations
	boost::asio::ip::tcp::iostream		m_tcp_stream;
	
	/// function called after the connection is lost (finished sending)
	FinishedHandler						m_finished_handler;
};			

	
///
/// FeedWriter: helper class used to send Events over a TCP connection
///
class FeedWriter
	: public FeedHandler
{
public:
	
	/// virtual destructor
	virtual ~FeedWriter() {}

	/**
	 * constructs a new FeedWriter object
	 *
	 * @param reactor_id unique identifier for the Reactor that this handler interacts with
	 * @param codec_ptr pointer to the Codec that this handler will use
	 * @param tcp_conn TCP connection that will be used to send/receive Events
	 * @param finished_handler function that is called when the connection is lost
	 */
	FeedWriter(const std::string& reactor_id, pion::platform::CodecPtr& codec_ptr,
				pion::net::TCPConnectionPtr& tcp_conn, FinishedHandler finished_handler)
		: FeedHandler(reactor_id, codec_ptr, tcp_conn, finished_handler)
	{}
	
	/**
	 * sends an Event over the TCP connection and cleans up if the
	 * connection has closed since we last sent data
	 *
	 * @param e the Event to send over the TCPConnection
	 */
	void writeEvent(pion::platform::EventPtr& e);

	
private:

	/// mutex used to ensure that only one Event is sent at a time
	mutable boost::mutex				m_mutex;	
};

/// data type used for FeedWriter smart pointers
typedef boost::shared_ptr<FeedWriter>	FeedWriterPtr;

	
///
/// FeedReader: helper class used to read Events from a TCP connection
///
class FeedReader
	: public FeedHandler
{
public:
	
	/// virtual destructor
	virtual ~FeedReader() {}
	
	/**
	 * constructs a new FeedReader object
	 *
	 * @param reaction_engine reference to the ReactionEngine
	 * @param reactor_id unique identifier for the Reactor that this handler interacts with
	 * @param codec_ptr pointer to the Codec that this handler will use
	 * @param tcp_conn TCP connection that will be used to send/receive Events
	 * @param finished_handler function that is called when the connection is lost
	 */
	FeedReader(pion::platform::ReactionEngine &reaction_engine,
			   const std::string& reactor_id, pion::platform::CodecPtr& codec_ptr,
			   pion::net::TCPConnectionPtr& tcp_conn, FinishedHandler finished_handler)
		: FeedHandler(reactor_id, codec_ptr, tcp_conn, finished_handler),
		m_reaction_engine(reaction_engine)
	{}
	
	/// reads a stream of Events and delivers them to a Reactor
	void readEvents(void);

	
private:
	
	/// reference to ReactionEngine used to send Events to Reactors
	pion::platform::ReactionEngine &	m_reaction_engine;
};

/// data type used for FeedReader smart pointers
typedef boost::shared_ptr<FeedReader>	FeedReaderPtr;

	
///
/// FeedService: Platform WebService used to send and receive Event streams
///
class FeedService
	: public PlatformService
{
public:
	
	/// constructs a new FeedService object
	FeedService(void) {}
	
	/// virtual destructor
	virtual ~FeedService() {}
	
	/**
	 * attempts to handle a new HTTP request
	 *
	 * @param request the new HTTP request to handle
	 * @param tcp_conn the TCP connection that has the new request
	 */
	virtual void operator()(pion::net::HTTPRequestPtr& request,
							pion::net::TCPConnectionPtr& tcp_conn);
	
	
private:
	
	/**
	 * binds a new FeedWriter to a TCP connection
	 *
	 * @param reactor_id unique identifier associated with the Reactor
	 * @param codec_ptr pointer to the Codec that the handler will use
	 * @param tcp_conn the TCP connection to which the Events will be sent
	 */
	void addFeedWriter(const std::string& reactor_id,
					   pion::platform::CodecPtr& codec_ptr,
					   pion::net::TCPConnectionPtr& tcp_conn);

	/**
	 * reads Events from a TCP connection and delivers them to a Reactor
	 *
	 * @param reactor_id unique identifier associated with the Reactor
	 * @param codec_ptr pointer to the Codec that the handler will use
	 * @param tcp_conn the TCP connection from which the Events will be read
	 */
	void addFeedReader(const std::string& reactor_id,
					   pion::platform::CodecPtr& codec_ptr,
					   pion::net::TCPConnectionPtr& tcp_conn);
	
	/**
	 * removes a feed handler
	 *
	 * @parma connection_id unique identifier for the feed connection
	 */
	void removeFeedHandler(const std::string& connection_id);
	
	/**
	 * schedules an Event to be sent using the ServiceManager's thread pool
	 *
	 * @param writer_ptr pointer to a FeedWriter that will send the Event
	 * @param e the Event to send over the TCPConnection
	 */
	void scheduleWriteEvent(FeedWriterPtr writer_ptr, pion::platform::EventPtr& e);
	
	
	/// data type for a map of connection identifiers to FeedHandler smart pointers
	typedef std::map<std::string,boost::shared_ptr<FeedHandler> >	FeedHandlerMap;

	
	/// collection of feeds generated by this service that are currently active
	FeedHandlerMap					m_feed_handlers;
	
	/// mutex used to protect access to the Feed handlers
	mutable boost::mutex			m_mutex;	
};

	
}	// end namespace server
}	// end namespace pion

#endif
