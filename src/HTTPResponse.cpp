// -----------------------------------------------------------------
// libpion: a C++ framework for building lightweight HTTP interfaces
// -----------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
//

#include <libpion/HTTPResponse.hpp>
#include <boost/bind.hpp>


namespace pion {	// begin namespace pion

	
// HTTPResponse member functions

void HTTPResponse::send(TCPConnectionPtr& tcp_conn)
{
	flushContentStream();
	
	// update headers
	m_response_headers.insert(std::make_pair(HTTPTypes::HEADER_CONTENT_TYPE, m_content_type));
	m_response_headers.insert(std::make_pair(HTTPTypes::HEADER_CONTENT_LENGTH,
									boost::lexical_cast<std::string>(m_content_length)));
	m_response_headers.insert(std::make_pair(HTTPTypes::HEADER_CONNECTION,
									(tcp_conn->getKeepAlive() ? "Keep-Alive" : "close") ));
	
	// combine I/O write buffers (headers and content) so that everything
	// can be sent together; otherwise, we would have to send headers
	// and content separately, which would not be as efficient
	
	WriteBuffers write_buffers;
	
	// first response line (HTTP/1.1 200 OK)
	write_buffers.push_back(boost::asio::buffer(HTTPTypes::STRING_HTTP_VERSION));
	write_buffers.push_back(boost::asio::buffer(m_response_code));
	write_buffers.push_back(boost::asio::buffer(m_response_message));
	write_buffers.push_back(boost::asio::buffer(HTTPTypes::STRING_CRLF));
	
	// HTTP headers
	for (HTTPTypes::StringDictionary::const_iterator i = m_response_headers.begin();
		 i != m_response_headers.end(); ++i)
	{
		write_buffers.push_back(boost::asio::buffer(i->first));
		write_buffers.push_back(boost::asio::buffer(HTTPTypes::HEADER_NAME_VALUE_DELIMINATOR));
		write_buffers.push_back(boost::asio::buffer(i->second));
		write_buffers.push_back(boost::asio::buffer(HTTPTypes::STRING_CRLF));
	}
	
	// extra CRLF to end HTTP headers
	write_buffers.push_back(boost::asio::buffer(HTTPTypes::STRING_CRLF));
	
	// append response content buffers
	write_buffers.insert(write_buffers.end(), m_content_buffers.begin(),
						 m_content_buffers.end());
	
	// send response
	boost::asio::async_write(tcp_conn->getSocket(), write_buffers,
							 boost::bind(&HTTPResponse::handleWrite, shared_from_this(),
										 tcp_conn, boost::asio::placeholders::error,
										 boost::asio::placeholders::bytes_transferred));
}

void HTTPResponse::handleWrite(TCPConnectionPtr tcp_conn,
							   const boost::asio::error& write_error,
							   std::size_t bytes_written)
{
	if (write_error) {
		// encountered error sending response
		PION_LOG_INFO(m_logger, "Unable to send HTTP response due to I/O error");
	} else {
		// response sent OK
		PION_LOG_DEBUG(m_logger, "Sent HTTP response of " << bytes_written << " bytes ("
					   << (tcp_conn->getKeepAlive() ? "keeping alive" : "closing") << ")");
	}
	
	// all finished handling the connection
	tcp_conn->finish();
}


}	// end namespace pion

