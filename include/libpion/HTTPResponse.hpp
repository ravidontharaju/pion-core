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
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
//

#ifndef __PION_HTTPRESPONSE_HEADER__
#define __PION_HTTPRESPONSE_HEADER__

#include <libpion/PionConfig.hpp>
#include <libpion/PionLogger.hpp>
#include <libpion/TCPConnection.hpp>
#include <libpion/HTTPTypes.hpp>
#include <boost/asio.hpp>
#include <boost/asio/buffer.hpp>
#include <boost/noncopyable.hpp>
#include <boost/enable_shared_from_this.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/lexical_cast.hpp>
#include <vector>
#include <string>


namespace pion {	// begin namespace pion

///
/// HTTPResponse: container for HTTP response information
/// 
class HTTPResponse :
	public boost::enable_shared_from_this<HTTPResponse>,
	private boost::noncopyable
{
	
public:

	/// creates new HTTPResponse objects
	static inline boost::shared_ptr<HTTPResponse> create(void) {
		return boost::shared_ptr<HTTPResponse>(new HTTPResponse);
	}
	
	/// default destructor
	virtual ~HTTPResponse() {}

	/**
	 * write text (non-binary) response content
	 *
	 * @param data the data to append to the response content
	 */
	template <typename T>
	inline void write(const T& data) {
		m_content_stream << data;
		if (m_stream_is_empty) m_stream_is_empty = false;
	}
	
	/**
	 * write binary response content
	 *
	 * @param data points to the binary data to append to the response content
	 * @param length the length, in bytes, of the binary data
	 */
	inline void write(const void *data, size_t length) {
		flushContentStream();
		m_content_buffers.push_back(m_binary_cache.add(data, length));
		m_content_length += length;
	}
	
	/**
	 * write text (non-binary) response content; the data written is not copied,
	 * and therefore must persist until the response has finished sending
	 *
	 * @param data the data to append to the response content
	 */
	template <typename T>
	inline void writeNoCopy(const T& data) {
		flushContentStream();
		std::string as_string(boost::lexical_cast<std::string>(data));
		m_content_buffers.push_back(boost::asio::buffer(as_string));
		m_content_length += as_string.size();
	}

	/**
	 * write text (non-binary) response content; the data written is not
	 * copied, and therefore must persist until the response has finished
	 * sending; this specialization avoids lexical_cast for strings
	 *
	 * @param data the data to append to the response content
	 */
	inline void writeNoCopy(const std::string& data) {
		flushContentStream();
		m_content_buffers.push_back(boost::asio::buffer(data));
		m_content_length += data.size();
	}
	
	/**
	 * write binary response content;  the data written is not copied, and
	 * therefore must persist until the response has finished sending
	 *
	 * @param data points to the binary data to append to the response content
	 * @param length the length, in bytes, of the binary data
	 */
	inline void writeNoCopy(void *data, size_t length) {
		flushContentStream();
		m_content_buffers.push_back(boost::asio::buffer(data, length));
		m_content_length += length;
	}


	/**
	 * sends the response
	 *
	 * @param tcp_conn TCP connection used to send the response
	 */
	void send(TCPConnectionPtr& tcp_conn);
	

	/// adds an HTTP response header
	inline void addHeader(const std::string& key, const std::string& value) {
		m_response_headers.insert(std::make_pair(key, value));
	}
	
	/// sets the response or status code to send
	inline void setResponseCode(const unsigned int n) {
		// add space character to beginning and end
		m_response_code = ' ';
		m_response_code += boost::lexical_cast<std::string>(n);
		m_response_code += ' ';
	}
	
	/// sets the response or status message to send
	inline void setResponseMessage(const std::string& m) { m_response_message = m; }

	/// sets the type of response content to be sent (Content-Type)
	inline void setContentType(const std::string& t) { m_content_type = t; }

	/// sets the logger to be used
	inline void setLogger(PionLogger log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline PionLogger getLogger(void) { return m_logger; }

	
protected:
		
	/// protected constructor restricts creation of objects (use create())
	HTTPResponse(void)
		: m_logger(PION_GET_LOGGER("Pion.HTTPResponse")),
		m_stream_is_empty(true), 
		m_response_message(HTTPTypes::RESPONSE_MESSAGE_OK),
		m_content_type(HTTPTypes::CONTENT_TYPE_HTML),
		m_content_length(0)
	{
			setResponseCode(HTTPTypes::RESPONSE_CODE_OK);
	}

	
private:
	
	/**
	 * called after the response is sent
	 * 
	 * @param tcp_conn TCP connection used to send the response
	 * @param write_error error status from the last write operation
	 * @param bytes_written number of bytes sent by the last write operation
	 */
	void handleWrite(TCPConnectionPtr tcp_conn, const boost::asio::error& write_error,
					 std::size_t bytes_written);

	/// flushes any text data in the content stream after caching it in the TextCache
	inline void flushContentStream(void) {
		if (! m_stream_is_empty) {
			m_text_cache.push_back(m_content_stream.str());
			m_content_buffers.push_back(boost::asio::buffer(m_text_cache.back()));
			m_content_length += m_text_cache.back().size();
			m_content_stream.str("");
			m_stream_is_empty = true;
		}
	}
	
	/// used to cache binary data included within the response
	class BinaryCache : public std::vector<std::pair<const char *, size_t> > {
	public:
		~BinaryCache() {
			for (iterator i=begin(); i!=end(); ++i) {
				delete[] i->first;
			}
		}
		inline boost::asio::const_buffer add(const void *ptr, const size_t size) {
			char *data_ptr = new char[size];
			memcpy(data_ptr, ptr, size);
			push_back( std::make_pair(data_ptr, size) );
			return boost::asio::buffer(data_ptr, size);
		}
	};
	
	/// used to cache text (non-binary) data included within the response
	typedef std::vector<std::string>				TextCache;

	/// data type for I/O write buffers (these wrap existing data to be sent)
	typedef std::vector<boost::asio::const_buffer>	WriteBuffers;
	
		
	/// primary logging interface used by this class
	PionLogger								m_logger;

	/// I/O write buffers that wrap the response content to be written
	WriteBuffers							m_content_buffers;
	
	/// caches binary data included within the response
	BinaryCache								m_binary_cache;

	/// caches text (non-binary) data included within the response
	TextCache								m_text_cache;
	
	/// incrementally creates strings of text data for the TextCache
	std::ostringstream						m_content_stream;
	
	/// true if the content_stream is empty (avoids unnecessary string copies)
	bool									m_stream_is_empty;
	
	/// The HTTP response headers to send
	HTTPTypes::StringDictionary				m_response_headers;
	
	/// The HTTP response or status code to send (as a string wrapped with spaces)
	std::string								m_response_code;

	/// The HTTP response or status message to send
	std::string								m_response_message;
	
	/// The type of response content to be sent (Content-Type)
	std::string								m_content_type;
	
	/// The length (in bytes) of the response content to be sent (Content-Length)
	unsigned long							m_content_length;
};


/// data type for a HTTPResponse pointer
typedef boost::shared_ptr<HTTPResponse>		HTTPResponsePtr;


/// override operator<< for convenience
template <typename T>
HTTPResponsePtr& operator<<(HTTPResponsePtr& response, const T& data) {
	response->write(data);
	return response;
}


}	// end namespace pion

#endif
