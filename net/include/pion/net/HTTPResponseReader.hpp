// ------------------------------------------------------------------
// pion-net: a C++ framework for building lightweight HTTP interfaces
// ------------------------------------------------------------------
// Copyright (C) 2007-2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Distributed under the Boost Software License, Version 1.0.
// See http://www.boost.org/LICENSE_1_0.txt
//

#ifndef __PION_HTTPRESPONSEREADER_HEADER__
#define __PION_HTTPRESPONSEREADER_HEADER__

#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <boost/function.hpp>
#include <boost/function/function2.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/enable_shared_from_this.hpp>
#include <pion/PionConfig.hpp>
#include <pion/net/HTTPResponse.hpp>
#include <pion/net/HTTPReader.hpp>


namespace pion {	// begin namespace pion
namespace net {		// begin namespace net (Pion Network Library)


///
/// HTTPResponseReader: asynchronously reads and parses HTTP responses
///
class HTTPResponseReader :
	public HTTPReader,
	public boost::enable_shared_from_this<HTTPResponseReader>
{

public:

	/// function called after the HTTP message has been parsed
	typedef boost::function3<void, HTTPResponsePtr, TCPConnectionPtr,
		const boost::system::error_code&>	FinishedHandler;

	
	// default destructor
	virtual ~HTTPResponseReader() {}
	
	/**
	 * creates new HTTPResponseReader objects
	 *
	 * @param tcp_conn TCP connection containing a new message to parse
     * @param http_request the request we are responding to
	 * @param handler function called after the message has been parsed
	 * @param headers_handler function called after the message headers has been parsed
	 */
	static inline boost::shared_ptr<HTTPResponseReader>
		create(TCPConnectionPtr& tcp_conn,
			   const HTTPRequest& http_request,
			   FinishedHandler handler,
			   FinishedHandler headers_handler = FinishedHandler() )
	{
		return boost::shared_ptr<HTTPResponseReader>
			(new HTTPResponseReader(tcp_conn,
									http_request,
									handler,
									headers_handler));
	}

	
protected:

	/**
	 * protected constructor restricts creation of objects (use create())
	 *
	 * @param tcp_conn TCP connection containing a new message to parse
     * @param http_request the request we are responding to
	 * @param handler function called after the message has been parsed
	 * @param headers_handler function called after the message headers has been parsed
	 */
	HTTPResponseReader(TCPConnectionPtr& tcp_conn, const HTTPRequest& http_request,
					   FinishedHandler handler, FinishedHandler headers_handler)
		: HTTPReader(false, tcp_conn), m_http_msg(new HTTPResponse(http_request)),
		m_finished(handler), m_finished_headers(headers_handler)
	{
		m_http_msg->setRemoteIp(tcp_conn->getRemoteIp());
		setLogger(PION_GET_LOGGER("pion.net.HTTPResponseReader"));
	}
		
	/// Reads more bytes from the TCP connection
	virtual void readBytes()
	{
		if( !m_http_msg->isStream() || !m_http_msg->isContentBufferAllocated() )
		{
			// if content is not being parsed yet or streaming mode isn't used,
			// then initiate getting data as usual
			readBytesImpl();
			return;
		}
		
		HTTPResponse::BodyStreamHandler stream_handler
			= m_http_msg->getBodyStreamHandler();
		if( !stream_handler )
			return;

		stream_handler(
			true, m_http_msg, false,
			boost::bind(
				// if it's last data portion just stop request next one
				&HTTPResponseReader::readBytesImpl,
				shared_from_this()
			)
		);
	}
	
	/// It initiates async request for more data from TCP connection
	void readBytesImpl()
	{
		TCPConnectionPtr connection = getTCPConnection();
		if( !connection->is_open() )
			return;
			
		connection->async_read_some(
			boost::bind( &HTTPResponseReader::consumeBytes,
														shared_from_this(),
														boost::asio::placeholders::error,
 						 boost::asio::placeholders::bytes_transferred ) );
 	}
	
	void dummy()
	{}
	
	/// Called after we have finished parsing the HTTP message headers
	virtual void finishedHeaders(const boost::system::error_code& ec)
	{
		if( m_finished_headers )
			m_finished_headers(m_http_msg, getTCPConnection(), ec);
	}

	/// Called after we have finished reading/parsing the HTTP message
	virtual void finishedReading(const boost::system::error_code& ec)
	{
		if( !m_http_msg->isStream() )
		{
		// call the finished handler with the finished HTTP message
		if (m_finished) m_finished(m_http_msg, getTCPConnection(), ec);
			return;
		}

		HTTPResponse::BodyStreamHandler
			stream_handler = m_http_msg->getBodyStreamHandler();
		if( !stream_handler )
			return;
			
		bool good = m_http_msg->isValid();
		stream_handler(
			good, m_http_msg, true,
			boost::bind(
				// if it's last data portion just stop request next one
				&HTTPResponseReader::dummy,
				shared_from_this()
			)
		);
	}
	
	/// Returns a reference to the HTTP message being parsed
	virtual HTTPMessage& getMessage(void) { return *m_http_msg; }

	
	/// The new HTTP message container being created
	HTTPResponsePtr				m_http_msg;

	/// function called after the HTTP message has been parsed
	FinishedHandler				m_finished;
	
	/// function called after the HTTP message headers has been parsed
	FinishedHandler				m_finished_headers;
};


/// data type for a HTTPResponseReader pointer
typedef boost::shared_ptr<HTTPResponseReader>	HTTPResponseReaderPtr;


}	// end namespace net
}	// end namespace pion

#endif
