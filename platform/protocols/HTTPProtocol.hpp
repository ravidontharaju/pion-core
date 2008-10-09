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

	/// constructs HTTPProtocol object
	HTTPProtocol() : m_request_parser(true), m_response_parser(false), 
		m_request_timestamp(boost::date_time::not_a_date_time) {}

	/// virtual destructor
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
		boost::posix_time::ptime data_timestamp, pion::platform::EventPtr& event_ptr_ref);

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

	/// data type used to determine whether or not payload content should be saved
	struct ExtractionRule {
		/// regex that must match the content-type
		boost::regex		m_type_regex;
		/// maximum size (in bytes) of content to save (0 = do not save)
		boost::uint32_t		m_max_size;
	};
	
	
	/**
	 * generates a new Event using the existing HTTP request and 
	 * response objects 
	 * 
	 * @param event_ptr_ref pointer assigned to the new Event
	 */
	void generateEvent(pion::platform::EventPtr& event_ptr_ref);
	
	/**
	 * parses rule for extracting request or response HTTP payload content
	 *
	 * @param rule the resulting configuration parameters after parsing
	 * @param element_name name of the XML configuration element for the rule
	 * @param config_ptr pointer to a list of XML nodes containing Protocol
	 *                   configuration parameters
	 */
	void parseExtractionRule(ExtractionRule& rule, const std::string& element_name,
							 const xmlNodePtr config_ptr);
	
	/**
	 * checks is HTTP payload content should be saved, and extracts it if necessary
	 *
	 * @param event_ptr_ref pointer to the Event being generated
	 * @param rule payload content extraction rule to use
	 * @param http_msg HTTP message object to extract content from
	 * @param term_ref Event term reference to which content will be assigned
	 */
	inline void checkContentExtraction(pion::platform::EventPtr& event_ptr_ref,
									   const ExtractionRule& rule,
									   const pion::net::HTTPMessage& http_msg,
									   const pion::platform::Vocabulary::TermRef term_ref);
	
	
    /// parser used for HTTP request
	pion::net::HTTPParser	m_request_parser;

    /// parser used for HTTP response
    pion::net::HTTPParser	m_response_parser;

    /// HTTP request being parsed
    pion::net::HTTPRequest  m_request;

    /// HTTP response being parsed
    pion::net::HTTPResponse m_response;
	
	boost::posix_time::ptime m_request_timestamp;
	/// rule used to determine if request content should be saved
	ExtractionRule			m_request_content_rule;
	
	/// rule used to determine if response content should be saved
	ExtractionRule			m_response_content_rule;

	
	/// name of the RequestContent element for Pion XML config files
	static const std::string	REQUEST_CONTENT_ELEMENT_NAME;

	/// name of the ResponseContent element for Pion XML config files
	static const std::string	RESPONSE_CONTENT_ELEMENT_NAME;

	/// name of the ContentType element for Pion XML config files
	static const std::string	CONTENT_TYPE_ELEMENT_NAME;

	/// name of the MaxSize element for Pion XML config files
	static const std::string	MAX_SIZE_ELEMENT_NAME;
    
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

    /// urn:vocab:clickstream#host
    static const std::string	VOCAB_CLICKSTREAM_HOST;
    pion::platform::Vocabulary::TermRef	m_host_term_ref; 

	/// urn:vocab:clickstream#referer
	static const std::string	VOCAB_CLICKSTREAM_REFERER;
	pion::platform::Vocabulary::TermRef	m_referer_term_ref;

	/// urn:vocab:clickstream#useragent
	static const std::string	VOCAB_CLICKSTREAM_USERAGENT;
	pion::platform::Vocabulary::TermRef	m_useragent_term_ref;

	/// urn:vocab:clickstream#cookie
	static const std::string	VOCAB_CLICKSTREAM_COOKIE;
	pion::platform::Vocabulary::TermRef	m_cookie_term_ref;

	/// urn:vocab:clickstream#set-cookie
	static const std::string	VOCAB_CLICKSTREAM_SET_COOKIE;
	pion::platform::Vocabulary::TermRef	m_set_cookie_term_ref;

	/// urn:vocab:clickstream#cs-content
	static const std::string	VOCAB_CLICKSTREAM_CS_CONTENT;
	pion::platform::Vocabulary::TermRef	m_cs_content_term_ref;

	/// urn:vocab:clickstream#sc-content
	static const std::string	VOCAB_CLICKSTREAM_SC_CONTENT;
	pion::platform::Vocabulary::TermRef	m_sc_content_term_ref;

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

	/// NOTE: in addition to the above Terms, the SnifferReactor
	/// automatically sets the following:
	/// 
	/// * urn:vocab:clickstream#c-ip
	/// * urn:vocab:clickstream#s-ip
};

	
// inline member functions

inline void HTTPProtocol::checkContentExtraction(pion::platform::EventPtr& event_ptr_ref,
												 const ExtractionRule& rule,
												 const pion::net::HTTPMessage& http_msg,
												 const pion::platform::Vocabulary::TermRef term_ref)
{
	if (rule.m_max_size > 0
		&& http_msg.getContentLength() > 0
		&& boost::regex_search(http_msg.getHeader(pion::net::HTTPTypes::HEADER_CONTENT_TYPE),
							   rule.m_type_regex))
	{
		(*event_ptr_ref).setString(term_ref, http_msg.getContent(),
								   (http_msg.getContentLength() > rule.m_max_size
									? rule.m_max_size : http_msg.getContentLength()));
	}
}

	
}	// end namespace plugins
}	// end namespace pion

#endif
