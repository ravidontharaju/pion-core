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

#include <string>
#include <vector>
#include <boost/shared_ptr.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Protocol.hpp>
#include <pion/net/HTTPParser.hpp>
#include <pion/net/HTTPRequest.hpp>
#include <pion/net/HTTPResponse.hpp>
#include <boost/regex.hpp>

namespace pion {	// begin namespace pion
namespace plugins {		// begin namespace plugins


class HTTPProtocol
	: public pion::platform::Protocol
{
public:

	/// exception thrown if there is no source defined for a content extraction rule
	class EmptySourceException : public PionException {
	public:
		EmptySourceException(const std::string& plugin_id)
			: PionException("HTTPProtocol is missing source for content extraction rule: ", plugin_id) {}
	};

	/// exception thrown if the content extraction configuration uses an unknown source
	class UnknownSourceException : public PionException {
	public:
		UnknownSourceException(const std::string& source_str)
			: PionException("HTTPProtocol content extraction specifies an unknown source: ", source_str) {}
	};

	/// exception thrown if the content extraction configuration does not define a term
	class EmptyTermException : public PionException {
	public:
		EmptyTermException(const std::string& plugin_id)
			: PionException("HTTPProtocol content extraction rule is missing a term identifier: ", plugin_id) {}
	};

	/// exception thrown if the content extraction configuration uses an unknown term
	class UnknownTermException : public PionException {
	public:
		UnknownTermException(const std::string& term_id)
			: PionException("HTTPProtocol content extraction maps field to an unknown term: ", term_id) {}
	};

	/// exception thrown if the content extraction configuration does not define a name
	class EmptyNameException : public PionException {
	public:
		EmptyNameException(const std::string& plugin_id)
			: PionException("HTTPProtocol content extraction rule is missing a parameter name: ", plugin_id) {}
	};

	/// exception thrown if the content extraction configuration has a bad Match parameter
	class BadMatchRegexException : public PionException {
	public:
		BadMatchRegexException(const std::string& regex_str)
			: PionException("HTTPProtocol content extraction rule contains bad Match parameter: ", regex_str) {}
	};

	/// exception thrown if the content extraction configuration has a bad ContentType parameter
	class BadContentRegexException : public PionException {
	public:
		BadContentRegexException(const std::string& regex_str)
			: PionException("HTTPProtocol content extraction rule contains bad ContentType parameter: ", regex_str) {}
	};

	/// exception thrown if the term specified for content extraction is not string type
	class TermNotStringException : public PionException {
	public:
		TermNotStringException(const std::string& term_id)
			: PionException("HTTPProtocol content extraction non-string term specified: ", term_id) {}
	};


	/// constructs HTTPProtocol object
	HTTPProtocol() : m_request_parser(true), m_response_parser(false), 
		m_request_start_time(boost::date_time::not_a_date_time),
		m_request_end_time(boost::date_time::not_a_date_time),
		m_request_ack_time(boost::date_time::not_a_date_time),
		m_response_start_time(boost::date_time::not_a_date_time),
		m_response_end_time(boost::date_time::not_a_date_time),
		m_response_ack_time(boost::date_time::not_a_date_time),
		m_cs_data_packets(0), m_sc_data_packets(0),
		m_cs_missing_packets(0), m_sc_missing_packets(0)
	{}

	/// virtual destructor
	virtual ~HTTPProtocol() {}

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

	/**
	 * called when parsing previously failed.  should return true if the current packet
	 * allows parsing to recover by starting over at the current point in the data stream.
	 * 
	 * @param request direction flag (true if request, false if response)
	 * @param ptr pointer to data (may be NULL if data packet was missing)
	 * @param len length in bytes of the network data
	 *
	 * @return true if the current packet allows parsing to recover
	 */
	virtual bool checkRecoveryPacket(bool request, const char* ptr, size_t len);

	/**
	 * clones the Protocol, returning a pointer to the cloned copy
	 *
	 * @return ProtocolPtr pointer to the cloned copy of the codec
	 */
	virtual boost::shared_ptr<Protocol> clone(void) const;

	/**
	 * sets configuration parameters for this Protocol
	 *
	 * @param v the Vocabulary that this Protocol will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Protocol
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);


private:

	/// data source supported for field content extraction
	enum ExtractionSource {
		EXTRACT_QUERY,			//< use map of query pairs from request URI & content (requires name=)
		EXTRACT_COOKIE,			//< use map of cookies from request+response (requires name=)
		EXTRACT_CS_HEADER,		//< use HTTP request header (requires name=)
		EXTRACT_SC_HEADER,		//< use HTTP response header (requires name=)
		EXTRACT_CS_CONTENT,		//< use HTTP request payload content
		EXTRACT_SC_CONTENT		//< use HTTP response payload content
	};

	/// data type used to determine whether or not payload content should be saved
	struct ExtractionRule {
	
		/**
		 * constructs a new content extraction rule
		 *
		 * @param term_id unique identifier for the event term
		 */
		ExtractionRule(const std::string& term_id) :
			m_term(term_id)
		{}
	
		/**
		 * processes content extraction for given content
		 *
		 * @param event_ptr_ref pointer to the Event being generated
		 * @param range pair of map iterators representing content to extract
		 * @param url_decode if true, the value will first be url_decoded
		 */
		template <typename RangePair>
		inline void process(pion::platform::EventPtr& event_ptr_ref,
			RangePair range, bool url_decode) const;
	
		/**
		 * processes content extraction for HTTPMessage payload content
		 *
		 * @param event_ptr_ref pointer to the Event being generated
		 * @param http_msg the message object to extract payload content from
		 */
		inline void processContent(pion::platform::EventPtr& event_ptr_ref,
			const pion::net::HTTPMessage& http_msg) const;

		/// vocabulary term for the event field where the content is stored
		pion::platform::Vocabulary::Term	m_term;

		/// data source used for the content extraction
		ExtractionSource					m_source;

		/// name parameter used for extraction from dictionary/maps
		std::string							m_name;

		/// format used for regex extraction (if empty, entire value is used)
		std::string							m_format;

		/// regex that must match the source value; may contain ()'s for m_format
		boost::regex						m_match;

		/// regex that must match the content-type (for cs-content and sc-content)
		boost::regex						m_type_regex;

		/// maximum size (in bytes) of content to save (0 = do not save)
		boost::uint32_t						m_max_size;
	};
	
	/// data type for a smart pointer to an extraction rule
	typedef boost::shared_ptr<ExtractionRule>	ExtractionRulePtr;
	
	/// data type for a collection of extraction rules
	typedef std::vector<ExtractionRulePtr>		ExtractionRuleVector;
	
	
	/**
	 * generates a new Event using the existing HTTP request and 
	 * response objects 
	 * 
	 * @param event_ptr_ref pointer assigned to the new Event
	 */
	void generateEvent(pion::platform::EventPtr& event_ptr_ref);
	
	
    /// parser used for HTTP request
	pion::net::HTTPParser		m_request_parser;

    /// parser used for HTTP response
    pion::net::HTTPParser		m_response_parser;

    /// HTTP request being parsed
    pion::net::HTTPRequest		m_request;

    /// HTTP response being parsed
    pion::net::HTTPResponse		m_response;
	
	/// timestamp for the beginning of the HTTP request (first packet)
	pion::PionDateTime			m_request_start_time;

	/// timestamp for the end of the HTTP request (last packet)
	pion::PionDateTime			m_request_end_time;

	/// timestamp acknowledging receipt of the last HTTP request packet
	pion::PionDateTime			m_request_ack_time;

	/// timestamp for the beginning of the HTTP response (first packet)
	pion::PionDateTime			m_response_start_time;

	/// timestamp for the end of the HTTP response (last packet)
	pion::PionDateTime			m_response_end_time;

	/// timestamp acknowledging receipt of the last HTTP response packet
	pion::PionDateTime			m_response_ack_time;

	/// total number of request data packets
	boost::uint32_t				m_cs_data_packets;

	/// total number of response data packets
	boost::uint32_t				m_sc_data_packets;

	/// total number of missing request data packets
	boost::uint32_t				m_cs_missing_packets;

	/// total number of missing response data packets
	boost::uint32_t				m_sc_missing_packets;

	/// collection of rules used to extract content
	ExtractionRuleVector		m_extraction_rules;

	
	/// name of the MaxRequestContentLength element for Pion XML config files
	static const std::string	MAX_REQUEST_CONTENT_LENGTH_ELEMENT_NAME;

	/// name of the MaxResponseContentLength element for Pion XML config files
	static const std::string	MAX_RESPONSE_CONTENT_LENGTH_ELEMENT_NAME;

	/// name of the ContentType element for Pion XML config files
	static const std::string	CONTENT_TYPE_ELEMENT_NAME;

	/// name of the MaxSize element for Pion XML config files
	static const std::string	MAX_SIZE_ELEMENT_NAME;

	/// name of the extract element for Pion XML config files
	static const std::string	EXTRACT_ELEMENT_NAME;

	/// name of the source element for Pion XML config files
	static const std::string	SOURCE_ELEMENT_NAME;

	/// name of the match element for Pion XML config files
	static const std::string	MATCH_ELEMENT_NAME;

	/// name of the format element for Pion XML config files
	static const std::string	FORMAT_ELEMENT_NAME;

	/// name of the descriptive name element for Pion XML config files
	static const std::string	NAME_ELEMENT_NAME;

	/// name of the Term ID attribute for Pion XML config files
	static const std::string	TERM_ATTRIBUTE_NAME;


	/// string used for query string extraction source type
	static const std::string	EXTRACT_QUERY_STRING;

	/// string used for cookie extraction source type
	static const std::string	EXTRACT_COOKIE_STRING;

	/// string used for request header extraction source type
	static const std::string	EXTRACT_CS_HEADER_STRING;

	/// string used for response header extraction source type
	static const std::string	EXTRACT_SC_HEADER_STRING;

	/// string used for request content extraction source type
	static const std::string	EXTRACT_CS_CONTENT_STRING;

	/// string used for response content extraction source type
	static const std::string	EXTRACT_SC_CONTENT_STRING;

	/// urn:vocab:clickstream#cs-data-packets
    static const std::string	VOCAB_CLICKSTREAM_CS_DATA_PACKETS;
    pion::platform::Vocabulary::TermRef	m_cs_data_packets_term_ref; 

	/// urn:vocab:clickstream#sc-data-packets
    static const std::string	VOCAB_CLICKSTREAM_SC_DATA_PACKETS;
    pion::platform::Vocabulary::TermRef	m_sc_data_packets_term_ref; 

	/// urn:vocab:clickstream#cs-missing-packets
    static const std::string	VOCAB_CLICKSTREAM_CS_MISSING_PACKETS;
    pion::platform::Vocabulary::TermRef	m_cs_missing_packets_term_ref; 

	/// urn:vocab:clickstream#sc-missing-packets
    static const std::string	VOCAB_CLICKSTREAM_SC_MISSING_PACKETS;
    pion::platform::Vocabulary::TermRef	m_sc_missing_packets_term_ref; 

	/// urn:vocab:clickstream#cs-bytes
    static const std::string	VOCAB_CLICKSTREAM_CS_BYTES;
    pion::platform::Vocabulary::TermRef	m_cs_bytes_term_ref; 

    /// urn:vocab:clickstream#sc-bytes
    static const std::string	VOCAB_CLICKSTREAM_SC_BYTES;
    pion::platform::Vocabulary::TermRef	m_sc_bytes_term_ref; 

    /// urn:vocab:clickstream#bytes
    static const std::string	VOCAB_CLICKSTREAM_BYTES;
    pion::platform::Vocabulary::TermRef	m_bytes_term_ref; 

    /// urn:vocab:clickstream#status
    static const std::string	VOCAB_CLICKSTREAM_STATUS;
    pion::platform::Vocabulary::TermRef	m_status_term_ref; 

    /// urn:vocab:clickstream#comment
    static const std::string	VOCAB_CLICKSTREAM_COMMENT;
    pion::platform::Vocabulary::TermRef	m_comment_term_ref; 

    /// urn:vocab:clickstream#method
    static const std::string	VOCAB_CLICKSTREAM_METHOD;
    pion::platform::Vocabulary::TermRef	m_method_term_ref; 

    /// urn:vocab:clickstream#uri
    static const std::string	VOCAB_CLICKSTREAM_URI;
    pion::platform::Vocabulary::TermRef	m_uri_term_ref; 

    /// urn:vocab:clickstream#uri-stem
    static const std::string	VOCAB_CLICKSTREAM_URI_STEM;
    pion::platform::Vocabulary::TermRef	m_uri_stem_term_ref; 

    /// urn:vocab:clickstream#uri-query
    static const std::string	VOCAB_CLICKSTREAM_URI_QUERY;
    pion::platform::Vocabulary::TermRef	m_uri_query_term_ref; 

    /// urn:vocab:clickstream#request
	static const std::string	VOCAB_CLICKSTREAM_REQUEST;
	pion::platform::Vocabulary::TermRef	m_request_term_ref; 

	/// urn:vocab:clickstream#cached
	static const std::string	VOCAB_CLICKSTREAM_CACHED;
	pion::platform::Vocabulary::TermRef	m_cached_term_ref;

	/// urn:vocab:clickstream#date
	static const std::string	VOCAB_CLICKSTREAM_DATE;
	pion::platform::Vocabulary::TermRef	m_date_term_ref;
	
    /// urn:vocab:clickstream#time
    static const std::string	VOCAB_CLICKSTREAM_TIME;
    pion::platform::Vocabulary::TermRef	m_time_term_ref;

    /// urn:vocab:clickstream#date-time
    static const std::string	VOCAB_CLICKSTREAM_DATE_TIME;
    pion::platform::Vocabulary::TermRef	m_date_time_term_ref;

    /// urn:vocab:clickstream#clf-date
    static const std::string	VOCAB_CLICKSTREAM_CLF_DATE;
    pion::platform::Vocabulary::TermRef	m_clf_date_term_ref;

    /// urn:vocab:clickstream#request-start-time
    static const std::string	VOCAB_CLICKSTREAM_REQUEST_START_TIME;
    pion::platform::Vocabulary::TermRef	m_request_start_time_term_ref;

    /// urn:vocab:clickstream#request-end-time
    static const std::string	VOCAB_CLICKSTREAM_REQUEST_END_TIME;
    pion::platform::Vocabulary::TermRef	m_request_end_time_term_ref;

    /// urn:vocab:clickstream#response-start-time
    static const std::string	VOCAB_CLICKSTREAM_RESPONSE_START_TIME;
    pion::platform::Vocabulary::TermRef	m_response_start_time_term_ref;

    /// urn:vocab:clickstream#response-end-time
    static const std::string	VOCAB_CLICKSTREAM_RESPONSE_END_TIME;
    pion::platform::Vocabulary::TermRef	m_response_end_time_term_ref;

	/// urn:vocab:clickstream#cs-send-time
	static const std::string	VOCAB_CLICKSTREAM_CS_SEND_TIME;
	pion::platform::Vocabulary::TermRef	m_cs_send_time_term_ref;

	/// urn:vocab:clickstream#cs-ack-time
	static const std::string	VOCAB_CLICKSTREAM_CS_ACK_TIME;
	pion::platform::Vocabulary::TermRef	m_cs_ack_time_term_ref;

	/// urn:vocab:clickstream#sc-reply-time
	static const std::string	VOCAB_CLICKSTREAM_SC_REPLY_TIME;
	pion::platform::Vocabulary::TermRef	m_sc_reply_time_term_ref;

	/// urn:vocab:clickstream#sc-send-time
	static const std::string	VOCAB_CLICKSTREAM_SC_SEND_TIME;
	pion::platform::Vocabulary::TermRef	m_sc_send_time_term_ref;

	/// urn:vocab:clickstream#sc-ack-time
	static const std::string	VOCAB_CLICKSTREAM_SC_ACK_TIME;
	pion::platform::Vocabulary::TermRef	m_sc_ack_time_term_ref;

	/// urn:vocab:clickstream#data-center-time
	static const std::string	VOCAB_CLICKSTREAM_DATA_CENTER_TIME;
	pion::platform::Vocabulary::TermRef	m_data_center_time_term_ref;

	/// urn:vocab:clickstream#authuser
	static const std::string	VOCAB_CLICKSTREAM_AUTHUSER;
	pion::platform::Vocabulary::TermRef	m_authuser_term_ref;

	/// NOTE: in addition to the above Terms, the SnifferReactor
	/// automatically sets the following:
	/// 
	/// * urn:vocab:clickstream#c-ip
	/// * urn:vocab:clickstream#s-ip
	/// * urn:vocab:clickstream#c-port
	/// * urn:vocab:clickstream#s-port
	/// * urn:vocab:clickstream#c-mac
	/// * urn:vocab:clickstream#s-mac
	/// * urn:vocab:clickstream#ssl-time
	/// * urn:vocab:clickstream#cs-packets
	/// * urn:vocab:clickstream#sc-packets
	/// * urn:vocab:clickstream#cs-ack-packets
	/// * urn:vocab:clickstream#sc-ack-packets
	/// * urn:vocab:clickstream#cs-duplicate-packets
	/// * urn:vocab:clickstream#sc-duplicate-packets
};


// inline member functions for HTTPProtocol::ExtractionRule

template <typename RangePair>
inline void HTTPProtocol::ExtractionRule::process(pion::platform::EventPtr& event_ptr_ref,
	RangePair range, bool url_decode) const
{
	boost::match_results<std::string::const_iterator> mr;
	while (range.first != range.second) {
		const std::string content_ref = (url_decode
			? pion::net::HTTPTypes::url_decode(range.first->second)
			: range.first->second);
		if ( m_max_size > 0 && ! content_ref.empty() ) {
			if ( m_match.empty() ) {
				(*event_ptr_ref).setString(m_term.term_ref, content_ref.c_str(),
										   (content_ref.size() > m_max_size
											? m_max_size : content_ref.size()));
			} else if ( boost::regex_search(content_ref, mr, m_match) ) {
				if (m_format.empty() || mr.empty()) {
					(*event_ptr_ref).setString(m_term.term_ref, content_ref.c_str(),
											   (content_ref.size() > m_max_size
												? m_max_size : content_ref.size()));
				} else {
					std::string content_str(mr.format(m_format));
					(*event_ptr_ref).setString(m_term.term_ref, content_str.c_str(),
											   (content_str.size() > m_max_size
												? m_max_size : content_str.size()));
				}
			}
		}
		++range.first;
	}
}
	
inline void HTTPProtocol::ExtractionRule::processContent(pion::platform::EventPtr& event_ptr_ref,
	const pion::net::HTTPMessage& http_msg) const
{
	boost::match_results<const char*> mr;
	if (m_max_size > 0
		&& http_msg.getContentLength() > 0
		&& ( m_type_regex.empty()
			|| boost::regex_search(http_msg.getHeader(pion::net::HTTPTypes::HEADER_CONTENT_TYPE), m_type_regex) ) )
	{
		if ( m_match.empty() ) {
			(*event_ptr_ref).setString(m_term.term_ref, http_msg.getContent(),
									   (http_msg.getContentLength() > m_max_size
										? m_max_size : http_msg.getContentLength()));
		} else if ( boost::regex_search(http_msg.getContent(), mr, m_match) ) {
			if (m_format.empty() || mr.empty()) {
				(*event_ptr_ref).setString(m_term.term_ref, http_msg.getContent(),
										   (http_msg.getContentLength() > m_max_size
											? m_max_size : http_msg.getContentLength()));
			} else {
				std::string content_str(mr.format(m_format));
				(*event_ptr_ref).setString(m_term.term_ref, content_str.c_str(),
										   (content_str.size() > m_max_size
											? m_max_size : content_str.size()));
			}
		}
	}
}
	
	
}	// end namespace plugins
}	// end namespace pion

#endif
