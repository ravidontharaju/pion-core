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

#ifdef _MSC_VER
// This could be any valid .lib file; its only purpose is to prevent the compiler  
// from trying to link to boost_zlib-*.lib (e.g. boost_zip-vc80-mt-1_37.dll).  
// HTTPProtocol only uses zlib indirectly, through boost_iostreams-*.dll.
#define BOOST_ZLIB_BINARY "zdll.lib"
#endif


#include <iostream>
#include <boost/iostreams/copy.hpp>
#include <boost/iostreams/device/array.hpp>
#include <boost/iostreams/filtering_streambuf.hpp>
#include <boost/iostreams/filter/zlib.hpp>
#include <boost/iostreams/filter/gzip.hpp>
#include <boost/algorithm/string.hpp>
#include <pion/platform/ConfigManager.hpp>
#include "HTTPProtocol.hpp"

using namespace pion::net;
using namespace pion::platform;

namespace pion {	// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of HTTPProtocol
	
const std::string HTTPProtocol::MAX_REQUEST_CONTENT_LENGTH_ELEMENT_NAME = "MaxRequestContentLength";
const std::string HTTPProtocol::MAX_RESPONSE_CONTENT_LENGTH_ELEMENT_NAME = "MaxResponseContentLength";
const std::string HTTPProtocol::CONTENT_TYPE_ELEMENT_NAME = "ContentType";
const std::string HTTPProtocol::MAX_SIZE_ELEMENT_NAME = "MaxSize";
const std::string HTTPProtocol::EXTRACT_ELEMENT_NAME = "Extract";
const std::string HTTPProtocol::SOURCE_ELEMENT_NAME = "Source";
const std::string HTTPProtocol::MATCH_ELEMENT_NAME = "Match";
const std::string HTTPProtocol::FORMAT_ELEMENT_NAME = "Format";
const std::string HTTPProtocol::NAME_ELEMENT_NAME = "Name";
const std::string HTTPProtocol::TERM_ATTRIBUTE_NAME = "term";

const std::string HTTPProtocol::EXTRACT_QUERY_STRING = "query";
const std::string HTTPProtocol::EXTRACT_COOKIE_STRING = "cookie";
const std::string HTTPProtocol::EXTRACT_CS_HEADER_STRING = "cs-header";
const std::string HTTPProtocol::EXTRACT_SC_HEADER_STRING = "sc-header";
const std::string HTTPProtocol::EXTRACT_CS_CONTENT_STRING = "cs-content";
const std::string HTTPProtocol::EXTRACT_SC_CONTENT_STRING = "sc-content";
const std::string HTTPProtocol::EXTRACT_CS_RAW_CONTENT_STRING = "cs-raw-content";
const std::string HTTPProtocol::EXTRACT_SC_RAW_CONTENT_STRING = "sc-raw-content";
	
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_CS_DATA_PACKETS="urn:vocab:clickstream#cs-data-packets";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_SC_DATA_PACKETS="urn:vocab:clickstream#sc-data-packets";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_CS_MISSING_PACKETS="urn:vocab:clickstream#cs-missing-packets";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_SC_MISSING_PACKETS="urn:vocab:clickstream#sc-missing-packets";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_CS_BYTES="urn:vocab:clickstream#cs-bytes";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_SC_BYTES="urn:vocab:clickstream#sc-bytes";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_BYTES="urn:vocab:clickstream#bytes";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_STATUS="urn:vocab:clickstream#status";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_COMMENT="urn:vocab:clickstream#comment";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_METHOD="urn:vocab:clickstream#method";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_URI="urn:vocab:clickstream#uri";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_URI_STEM="urn:vocab:clickstream#uri-stem";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_URI_QUERY="urn:vocab:clickstream#uri-query";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_REQUEST="urn:vocab:clickstream#request";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_CACHED="urn:vocab:clickstream#cached";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_DATE="urn:vocab:clickstream#date";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_TIME="urn:vocab:clickstream#time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_DATE_TIME="urn:vocab:clickstream#date-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_CLF_DATE="urn:vocab:clickstream#clf-date";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_REQUEST_START_TIME="urn:vocab:clickstream#request-start-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_REQUEST_END_TIME="urn:vocab:clickstream#request-end-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_RESPONSE_START_TIME="urn:vocab:clickstream#response-start-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_RESPONSE_END_TIME="urn:vocab:clickstream#response-end-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_TIME_TAKEN="urn:vocab:clickstream#time-taken";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_CS_SEND_TIME="urn:vocab:clickstream#cs-send-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_CS_ACK_TIME="urn:vocab:clickstream#cs-ack-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_SC_REPLY_TIME="urn:vocab:clickstream#sc-reply-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_SC_SEND_TIME="urn:vocab:clickstream#sc-send-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_SC_ACK_TIME="urn:vocab:clickstream#sc-ack-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_END_USER_TIME="urn:vocab:clickstream#end-user-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_DATA_CENTER_TIME="urn:vocab:clickstream#data-center-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_AUTHUSER="urn:vocab:clickstream#authuser";
	

// HTTPProtocol member functions

void HTTPProtocol::reset(void)
{
	m_request_parser.reset();
	m_response_parser.reset();
	m_request.clear();
	m_response.clear();
	m_request_start_time = m_request_end_time = m_request_ack_time
		= m_response_start_time = m_response_end_time = m_response_ack_time
		= boost::date_time::not_a_date_time;
	m_cs_data_packets = m_sc_data_packets = m_cs_missing_packets
		= m_sc_missing_packets = m_sc_ack_sum = 0;
}

bool HTTPProtocol::close(EventPtr& event_ptr_ref)
{
	if (! m_request.isValid())
		m_request_parser.finish(m_request);

	if (! m_response.isValid())
		m_response_parser.finish(m_response);

	if (m_request_parser.getTotalBytesRead() > 0)
		generateEvent(event_ptr_ref);

	return (m_request.isValid() && m_response.isValid());
}

boost::tribool HTTPProtocol::readNext(bool request, const char *ptr, size_t len, 
									  boost::posix_time::ptime data_timestamp,
									  boost::posix_time::ptime ack_timestamp,
									  EventPtr& event_ptr_ref)
{
	boost::tribool rc;

	if (ptr == NULL) {
	
		// missing data -> try to recover from lost packet
		if (request) {
			++m_cs_missing_packets;
			rc = m_request_parser.parseMissingData(m_request, len);
		} else {
			++m_sc_missing_packets;
			rc = m_response_parser.parseMissingData(m_response, len);
		}
	
	} else {

		// has valid data available for parsing
		
		if (request) {

			// update data packet counter
			++m_cs_data_packets;
	
			// update timestamps if necessary
			if (m_request_start_time.is_not_a_date_time()) {
				m_request_start_time = m_request_end_time = data_timestamp;
				m_request_ack_time = ack_timestamp;
			} else if (data_timestamp > m_request_end_time) {
				m_request_end_time = data_timestamp;
				m_request_ack_time = ack_timestamp;
			}
	
			// parse the data
			m_request_parser.setReadBuffer(ptr, len);
			rc = m_request_parser.parse(m_request);
	
		} else {
	
			// update data packet counter
			++m_sc_data_packets;

			// update response ack sum counter
			m_sc_ack_sum += ( ack_timestamp > data_timestamp ?
				(ack_timestamp-data_timestamp).total_microseconds() : 0 );

			// update timestamps if necessary
			if (m_response_start_time.is_not_a_date_time()) {
				m_response_start_time = m_response_end_time = data_timestamp;
				m_response_ack_time = ack_timestamp;
			} else if (data_timestamp > m_response_end_time) {
				m_response_end_time = data_timestamp;
				m_response_ack_time = ack_timestamp;
			}
	
			// parse the data
			m_response_parser.setReadBuffer(ptr, len);
			rc = m_response_parser.parse(m_response);
		}
	}

	if (rc == true) {
		// message has been fully parsed, generate an event
		if (request) {
			// update response to "know" about the request (this influences parsing)
			m_response.updateRequestInfo(m_request);
			 // wait until the response is parsed before generating an event
			rc = boost::indeterminate;
		} else {
			generateEvent(event_ptr_ref);
		}
	}

	return rc;
}

bool HTTPProtocol::checkRecoveryPacket(bool request, const char* ptr, size_t len)
{
	if (request && ptr != NULL && len > 7) {
		// look for valid HTTP request method at the beginning of request packet
		if (memcmp(ptr, "GET ", 4)==0 || memcmp(ptr, "PUT ", 4)==0 || memcmp(ptr, "POST ", 5)==0
			|| memcmp(ptr, "HEAD ", 5)==0 || memcmp(ptr, "TRACE ", 6)==0
			|| memcmp(ptr, "DELETE ", 7)==0 || memcmp(ptr, "CONNECT ", 8)==0
			|| memcmp(ptr, "OPTIONS ", 8)==0   )
		{
			return true;
		}
	}

	return false;
}

boost::shared_ptr<Protocol> HTTPProtocol::clone(void) const
{
	HTTPProtocol* retval = new HTTPProtocol;
	retval->copyProtocol(*this);

	retval->m_cs_data_packets_term_ref = m_cs_data_packets_term_ref;
	retval->m_sc_data_packets_term_ref = m_sc_data_packets_term_ref;
	retval->m_cs_missing_packets_term_ref = m_cs_missing_packets_term_ref;
	retval->m_sc_missing_packets_term_ref = m_sc_missing_packets_term_ref;
	retval->m_cs_bytes_term_ref = m_cs_bytes_term_ref;
	retval->m_sc_bytes_term_ref = m_sc_bytes_term_ref;
	retval->m_bytes_term_ref = m_bytes_term_ref;
	retval->m_status_term_ref = m_status_term_ref;
	retval->m_comment_term_ref = m_comment_term_ref;
	retval->m_method_term_ref = m_method_term_ref;
	retval->m_uri_term_ref = m_uri_term_ref;
	retval->m_uri_stem_term_ref = m_uri_stem_term_ref;
	retval->m_uri_query_term_ref = m_uri_query_term_ref;
	retval->m_request_term_ref = m_request_term_ref;
	retval->m_cached_term_ref = m_cached_term_ref;
	retval->m_date_term_ref = m_date_term_ref;
	retval->m_time_term_ref = m_time_term_ref;
	retval->m_date_time_term_ref = m_date_time_term_ref;
	retval->m_clf_date_term_ref = m_clf_date_term_ref;
	retval->m_request_start_time_term_ref = m_request_start_time_term_ref;
	retval->m_request_end_time_term_ref = m_request_end_time_term_ref;
	retval->m_response_start_time_term_ref = m_response_start_time_term_ref;
	retval->m_response_end_time_term_ref = m_response_end_time_term_ref;
	retval->m_time_taken_term_ref = m_time_taken_term_ref;
	retval->m_cs_send_time_term_ref = m_cs_send_time_term_ref;
	retval->m_cs_ack_time_term_ref = m_cs_ack_time_term_ref;
	retval->m_sc_reply_time_term_ref = m_sc_reply_time_term_ref;
	retval->m_sc_send_time_term_ref = m_sc_send_time_term_ref;
	retval->m_sc_ack_time_term_ref = m_sc_ack_time_term_ref;
	retval->m_end_user_time_term_ref = m_end_user_time_term_ref;
	retval->m_data_center_time_term_ref = m_data_center_time_term_ref;
	retval->m_authuser_term_ref = m_authuser_term_ref;

	retval->m_request_parser.setMaxContentLength(m_request_parser.getMaxContentLength());
	retval->m_response_parser.setMaxContentLength(m_response_parser.getMaxContentLength());

	retval->m_extraction_rules = m_extraction_rules;

	return ProtocolPtr(retval);
}

void HTTPProtocol::generateEvent(EventPtr& event_ptr_ref)
{
	const Event::EventType event_type(getEventType());

	// create a new event via EventFactory
	m_event_factory.create(event_ptr_ref, event_type);

	// populate some basic fields
	(*event_ptr_ref).setUBigInt(m_cs_bytes_term_ref, m_request_parser.getTotalBytesRead());
	(*event_ptr_ref).setUBigInt(m_sc_bytes_term_ref, m_response_parser.getTotalBytesRead());
	(*event_ptr_ref).setUBigInt(m_bytes_term_ref, m_request_parser.getTotalBytesRead()
							 + m_response_parser.getTotalBytesRead());
	(*event_ptr_ref).setUInt(m_status_term_ref, m_response.getStatusCode());
	(*event_ptr_ref).setString(m_comment_term_ref, m_response.getStatusMessage());
	(*event_ptr_ref).setString(m_method_term_ref, m_request.getMethod());

	// construct uri string
	std::string uri_str(m_request.getResource());
	if (! m_request.getQueryString().empty()) {
		uri_str += '?';
		uri_str += m_request.getQueryString();
	}
	(*event_ptr_ref).setString(m_uri_term_ref, uri_str);

	// check for Authorization header
	const std::string& authorization_header = m_request.getHeader(HTTPTypes::HEADER_AUTHORIZATION);
	if (!authorization_header.empty()) {
		if (boost::algorithm::starts_with(authorization_header, "Basic ")) {
			// found -> extract Basic authenticated username
			std::string username;
			const std::string base64_encoded = authorization_header.substr(6);
			if (HTTPTypes::base64_decode(base64_encoded, username)) {
				std::size_t pos = username.find(':');
				if (pos != std::string::npos) {
					username.resize(pos);
					(*event_ptr_ref).setString(m_authuser_term_ref, username);
				}
			}
		} else if (boost::algorithm::starts_with(authorization_header, "Digest ")) {
			// found -> extract Digest authenticated username
			std::size_t start_pos = authorization_header.find("username=\"");
			if (start_pos != std::string::npos) {
				start_pos += 10;	// step past first quote
				std::size_t end_pos = authorization_header.find('\"', start_pos);
				if (end_pos != std::string::npos) {
					std::string username = authorization_header.substr(start_pos, end_pos-start_pos);
					(*event_ptr_ref).setString(m_authuser_term_ref, username);
				}
			}
		}
	}

	// populate some more fields...
	(*event_ptr_ref).setString(m_uri_stem_term_ref, m_request.getResource());
	(*event_ptr_ref).setString(m_uri_query_term_ref, m_request.getQueryString());
	(*event_ptr_ref).setString(m_request_term_ref, m_request.getFirstLine());
	(*event_ptr_ref).setUInt(m_cached_term_ref,
							 m_response.getStatusCode() == HTTPTypes::RESPONSE_CODE_NOT_MODIFIED
							 ? 1 : 0);

	// sanity checks for timestamps
	// (may have only request packets or only response packets)
	if (m_request_start_time.is_not_a_date_time())
		m_request_start_time = m_request_end_time = m_request_ack_time = m_response_start_time;
	else if (m_response_start_time.is_not_a_date_time())
		m_response_start_time = m_response_end_time = m_response_ack_time = m_request_end_time;
	if (m_response_ack_time < m_response_end_time)
		m_response_ack_time = m_response_end_time;

	// set timestamp fields
	(*event_ptr_ref).setDateTime(m_date_term_ref, m_request_start_time); 
	(*event_ptr_ref).setDateTime(m_time_term_ref, m_request_start_time); 
	(*event_ptr_ref).setDateTime(m_date_time_term_ref, m_request_start_time); 
	(*event_ptr_ref).setDateTime(m_clf_date_term_ref, m_request_start_time); 
	(*event_ptr_ref).setDateTime(m_request_start_time_term_ref, m_request_start_time); 
	(*event_ptr_ref).setDateTime(m_request_end_time_term_ref, m_request_end_time); 
	(*event_ptr_ref).setDateTime(m_response_start_time_term_ref, m_response_start_time); 
	(*event_ptr_ref).setDateTime(m_response_end_time_term_ref, m_response_end_time); 

	// set time duration fields
	(*event_ptr_ref).setUInt(m_time_taken_term_ref,
		( m_response_ack_time > m_request_start_time ?
		  (m_response_ack_time - m_request_start_time).total_microseconds()
		  : 0 ) );
	(*event_ptr_ref).setUInt(m_cs_send_time_term_ref,
		( m_request_end_time > m_request_start_time ?
		  (m_request_end_time - m_request_start_time).total_microseconds()
		  : 0 ) );
	(*event_ptr_ref).setUInt(m_cs_ack_time_term_ref,
		( m_request_ack_time > m_request_end_time ?
		  (m_request_ack_time - m_request_end_time).total_microseconds()
		  : 0 ) );
	(*event_ptr_ref).setUInt(m_sc_reply_time_term_ref,
		( m_response_start_time > m_request_end_time ?
		  (m_response_start_time - m_request_end_time).total_microseconds()
		  : 0 ) );
	(*event_ptr_ref).setUInt(m_sc_send_time_term_ref,
		( m_response_end_time > m_response_start_time ?
		  (m_response_end_time - m_response_start_time).total_microseconds()
		  : 0 ) );
	(*event_ptr_ref).setUInt(m_data_center_time_term_ref,
		( m_response_end_time > m_request_end_time ?
		  (m_response_end_time - m_request_end_time).total_microseconds()
		  : 0 ) );

	// save sc_ack_time for next calculation
	const boost::uint32_t sc_ack_time = ( m_response_ack_time > m_response_end_time ?
		  (m_response_ack_time - m_response_end_time).total_microseconds() : 0 );
	(*event_ptr_ref).setUInt(m_sc_ack_time_term_ref, sc_ack_time);

	// calculate simple transaction time for starting end-user-time
	boost::uint32_t end_user_time = ( m_response_end_time > m_request_start_time ?
		  (m_response_end_time - m_request_start_time).total_microseconds() : 0 );

	// calculate end-user-time metric:
	// use average ack time if sc_ack_time is more than two times greater
	const boost::uint32_t avg_sc_ack_time = ( m_sc_data_packets == 0 ? 0 : 
		( m_sc_ack_sum / m_sc_data_packets ) );
	if ( avg_sc_ack_time == 0 || (sc_ack_time > 0 && sc_ack_time <= (avg_sc_ack_time * 2)) ) {
		// use half of sc_ack_time
		end_user_time += (sc_ack_time / 2);
	} else {
		// use half of avg_sc_ack_time
		end_user_time += (avg_sc_ack_time / 2);
	}
	(*event_ptr_ref).setUInt(m_end_user_time_term_ref, end_user_time);

	// set packet counter fields
	(*event_ptr_ref).setUInt(m_cs_data_packets_term_ref, m_cs_data_packets);
	(*event_ptr_ref).setUInt(m_sc_data_packets_term_ref, m_sc_data_packets);
	(*event_ptr_ref).setUInt(m_cs_missing_packets_term_ref, m_cs_missing_packets);
	(*event_ptr_ref).setUInt(m_sc_missing_packets_term_ref, m_sc_missing_packets);
	
	// used to cache decoded payload content
	size_t decoded_request_length;
	size_t decoded_response_length;
	boost::shared_array<char> decoded_request_content;
	boost::shared_array<char> decoded_response_content;
	boost::logic::tribool decoded_request_flag(boost::indeterminate);
	boost::logic::tribool decoded_response_flag(boost::indeterminate);

	// process content extraction rules
	for (ExtractionRuleVector::const_iterator i = m_extraction_rules.begin();
		i != m_extraction_rules.end(); ++i)
	{
		const ExtractionRule& rule = **i;
		switch (rule.m_source) {
			case EXTRACT_QUERY:
				// extract query parameter from request
				rule.process(event_ptr_ref, m_request.getQueryParams().equal_range(rule.m_name), true);
				break;
			case EXTRACT_COOKIE:
				// extract cookie parameter from request
				rule.process(event_ptr_ref, m_request.getCookieParams().equal_range(rule.m_name), false);
				break;
			case EXTRACT_CS_HEADER:
				// extract HTTP header from request
				rule.process(event_ptr_ref, m_request.getHeaders().equal_range(rule.m_name), false);
				break;
			case EXTRACT_SC_HEADER:
				// extract HTTP header from response
				rule.process(event_ptr_ref, m_response.getHeaders().equal_range(rule.m_name), false);
				break;
			case EXTRACT_CS_CONTENT:
				// extract decoded HTTP payload content from request
				rule.processDecodedContent(event_ptr_ref, m_request, decoded_request_flag,
					decoded_request_content, decoded_request_length);
				break;
			case EXTRACT_SC_CONTENT:
				// extract decoded HTTP payload content from response
				rule.processDecodedContent(event_ptr_ref, m_response, decoded_response_flag,
					decoded_response_content, decoded_response_length);
				break;
			case EXTRACT_CS_RAW_CONTENT:
				// extract raw HTTP payload content from request
				rule.processContent(event_ptr_ref, m_request);
				break;
			case EXTRACT_SC_RAW_CONTENT:
				// extract raw HTTP payload content from response
				rule.processContent(event_ptr_ref, m_response);
				break;
		}
	}
}

void HTTPProtocol::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	Protocol::setConfig(v, config_ptr);
	
	// parse maximum request content length
	boost::uint64_t max_content_length = 0;
	if (ConfigManager::getConfigOption(MAX_REQUEST_CONTENT_LENGTH_ELEMENT_NAME,
		max_content_length, config_ptr))
	{
		m_request_parser.setMaxContentLength(max_content_length);
	} else {
		m_request_parser.resetMaxContentLength();
	}

	// parse maximum response content length
	if (ConfigManager::getConfigOption(MAX_RESPONSE_CONTENT_LENGTH_ELEMENT_NAME,
		max_content_length, config_ptr))
	{
		m_response_parser.setMaxContentLength(max_content_length);
	} else {
		m_response_parser.resetMaxContentLength();
	}

	// parse content extraction rules
	
	xmlNodePtr extract_node = config_ptr;
	while ((extract_node = ConfigManager::findConfigNodeByName(EXTRACT_ELEMENT_NAME, extract_node)) != NULL) {
		// get the Term we want to use
		xmlChar *xml_char_ptr = xmlGetProp(extract_node, reinterpret_cast<const xmlChar*>(TERM_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr == NULL || xml_char_ptr[0] == '\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyTermException(getId());
		}
		const std::string term_id(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);

		// create a new rule configuration object
		ExtractionRulePtr rule_ptr(new ExtractionRule(term_id));

		// make sure that the Term is valid, copy info to rule
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(term_id);
		rule_ptr->m_term = v[term_ref];
		
		// only string types are currently supported
		switch (rule_ptr->m_term.term_type) {
		case Vocabulary::TYPE_NULL:
		case Vocabulary::TYPE_OBJECT:
		case Vocabulary::TYPE_INT8:
		case Vocabulary::TYPE_INT16:
		case Vocabulary::TYPE_INT32:
		case Vocabulary::TYPE_UINT8:
		case Vocabulary::TYPE_UINT16:
		case Vocabulary::TYPE_UINT32:
		case Vocabulary::TYPE_INT64:
		case Vocabulary::TYPE_UINT64:
		case Vocabulary::TYPE_FLOAT:
		case Vocabulary::TYPE_DOUBLE:
		case Vocabulary::TYPE_LONG_DOUBLE:
		case Vocabulary::TYPE_DATE_TIME:
		case Vocabulary::TYPE_DATE:
		case Vocabulary::TYPE_TIME:
		case Vocabulary::TYPE_REGEX:
			throw TermNotStringException(term_id);
			break;
		case Vocabulary::TYPE_SHORT_STRING:
		case Vocabulary::TYPE_STRING:
		case Vocabulary::TYPE_LONG_STRING:
		case Vocabulary::TYPE_CHAR:
			break;	// these are all OK
		}

		// determine the source to use for content extraction
		xmlNodePtr source_node = ConfigManager::findConfigNodeByName(SOURCE_ELEMENT_NAME, extract_node->children);
		if (source_node == NULL)
			throw EmptySourceException(getId());
		xml_char_ptr = xmlNodeGetContent(source_node);
		if (xml_char_ptr == NULL || xml_char_ptr[0] == '\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptySourceException(getId());
		}
		const std::string source_str(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);
		if (source_str == EXTRACT_QUERY_STRING) {
			rule_ptr->m_source = EXTRACT_QUERY;
		} else if (source_str == EXTRACT_COOKIE_STRING) {
			rule_ptr->m_source = EXTRACT_COOKIE;
		} else if (source_str == EXTRACT_CS_HEADER_STRING) {
			rule_ptr->m_source = EXTRACT_CS_HEADER;
		} else if (source_str == EXTRACT_SC_HEADER_STRING) {
			rule_ptr->m_source = EXTRACT_SC_HEADER;
		} else if (source_str == EXTRACT_CS_CONTENT_STRING) {
			rule_ptr->m_source = EXTRACT_CS_CONTENT;
		} else if (source_str == EXTRACT_SC_CONTENT_STRING) {
			rule_ptr->m_source = EXTRACT_SC_CONTENT;
		} else if (source_str == EXTRACT_CS_RAW_CONTENT_STRING) {
			rule_ptr->m_source = EXTRACT_CS_RAW_CONTENT;
		} else if (source_str == EXTRACT_SC_RAW_CONTENT_STRING) {
			rule_ptr->m_source = EXTRACT_SC_RAW_CONTENT;
		} else {
			throw UnknownSourceException(source_str);
		}
		
		// parse parameter name attribute
		switch (rule_ptr->m_source) {
		case EXTRACT_QUERY:
		case EXTRACT_COOKIE:
		case EXTRACT_CS_HEADER:
		case EXTRACT_SC_HEADER:
		{
			if (! ConfigManager::getConfigOption(NAME_ELEMENT_NAME, rule_ptr->m_name,
				extract_node->children))
			{
				throw EmptyNameException(getId());
			}
			break;
		}
		case EXTRACT_CS_CONTENT:
		case EXTRACT_SC_CONTENT:
		case EXTRACT_CS_RAW_CONTENT:
		case EXTRACT_SC_RAW_CONTENT:
			break;	// ignore parameter name attribute
		}
		
		// get Format parameter
		ConfigManager::getConfigOption(FORMAT_ELEMENT_NAME, rule_ptr->m_format,
			extract_node->children);
		
		// get Match regex
		std::string regex_str;
		if (ConfigManager::getConfigOption(MATCH_ELEMENT_NAME, regex_str,
			extract_node->children))
		{
			try {
				rule_ptr->m_match.assign(regex_str, boost::regex_constants::icase);
			} catch (...) {
				throw BadMatchRegexException(regex_str);
			}
		}
		
		// get ContentType regex
		if (ConfigManager::getConfigOption(CONTENT_TYPE_ELEMENT_NAME, regex_str,
			extract_node->children))
		{
			try {
				rule_ptr->m_type_regex.assign(regex_str, boost::regex_constants::icase);
			} catch (...) {
				throw BadContentRegexException(regex_str);
			}
		}
		
		// get MaxSize parameter
		std::string max_size_str;
		rule_ptr->m_max_size = boost::uint32_t(-1);	// default is undefined/none
		if (ConfigManager::getConfigOption(MAX_SIZE_ELEMENT_NAME, max_size_str,
										   extract_node->children))
		{
			try {
				rule_ptr->m_max_size = boost::lexical_cast<boost::uint32_t>(max_size_str);
			} catch (...) {}	// ignore failed casts (keep default)
		}

		// add the content extraction rule
		m_extraction_rules.push_back(rule_ptr);

		// step to the next rule
		extract_node = extract_node->next;
	}

	// initialize references to known Terms:

	m_cs_data_packets_term_ref = v.findTerm(VOCAB_CLICKSTREAM_CS_DATA_PACKETS);
	if (m_cs_data_packets_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_CS_DATA_PACKETS);

	m_sc_data_packets_term_ref = v.findTerm(VOCAB_CLICKSTREAM_SC_DATA_PACKETS);
	if (m_sc_data_packets_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_SC_DATA_PACKETS);

	m_cs_missing_packets_term_ref = v.findTerm(VOCAB_CLICKSTREAM_CS_MISSING_PACKETS);
	if (m_cs_missing_packets_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_CS_MISSING_PACKETS);

	m_sc_missing_packets_term_ref = v.findTerm(VOCAB_CLICKSTREAM_SC_MISSING_PACKETS);
	if (m_sc_missing_packets_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_SC_MISSING_PACKETS);

	m_cs_bytes_term_ref = v.findTerm(VOCAB_CLICKSTREAM_CS_BYTES);
	if (m_cs_bytes_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_CS_BYTES);

	m_sc_bytes_term_ref = v.findTerm(VOCAB_CLICKSTREAM_SC_BYTES);
	if (m_sc_bytes_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_SC_BYTES);

	m_bytes_term_ref = v.findTerm(VOCAB_CLICKSTREAM_BYTES);
	if (m_bytes_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_BYTES);

	m_status_term_ref = v.findTerm(VOCAB_CLICKSTREAM_STATUS);
	if (m_status_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_STATUS);

	m_comment_term_ref = v.findTerm(VOCAB_CLICKSTREAM_COMMENT);
	if (m_comment_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_COMMENT);

	m_method_term_ref = v.findTerm(VOCAB_CLICKSTREAM_METHOD);
	if (m_method_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_METHOD);

	m_uri_term_ref = v.findTerm(VOCAB_CLICKSTREAM_URI);
	if (m_uri_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_URI);

	m_uri_stem_term_ref = v.findTerm(VOCAB_CLICKSTREAM_URI_STEM);
	if (m_uri_stem_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_URI_STEM);

	m_uri_query_term_ref = v.findTerm(VOCAB_CLICKSTREAM_URI_QUERY);
	if (m_uri_query_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_URI_QUERY);

	m_request_term_ref = v.findTerm(VOCAB_CLICKSTREAM_REQUEST);
	if (m_request_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_REQUEST);

	m_cached_term_ref = v.findTerm(VOCAB_CLICKSTREAM_CACHED);
	if (m_cached_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_CACHED);

	m_date_term_ref = v.findTerm(VOCAB_CLICKSTREAM_DATE);
	if (m_date_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_DATE);

	m_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_TIME);
	if (m_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_TIME);

	m_date_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_DATE_TIME);
	if (m_date_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_DATE_TIME);

	m_clf_date_term_ref = v.findTerm(VOCAB_CLICKSTREAM_CLF_DATE);
	if (m_clf_date_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_CLF_DATE);

	m_request_start_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_REQUEST_START_TIME);
	if (m_request_start_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_REQUEST_START_TIME);

	m_request_end_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_REQUEST_END_TIME);
	if (m_request_end_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_REQUEST_END_TIME);

	m_response_start_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_RESPONSE_START_TIME);
	if (m_response_start_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_RESPONSE_START_TIME);

	m_response_end_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_RESPONSE_END_TIME);
	if (m_response_end_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_RESPONSE_END_TIME);

	m_time_taken_term_ref = v.findTerm(VOCAB_CLICKSTREAM_TIME_TAKEN);
	if (m_time_taken_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_TIME_TAKEN);

	m_cs_send_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_CS_SEND_TIME);
	if (m_cs_send_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_CS_SEND_TIME);

	m_cs_ack_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_CS_ACK_TIME);
	if (m_cs_ack_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_CS_ACK_TIME);

	m_sc_reply_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_SC_REPLY_TIME);
	if (m_sc_reply_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_SC_REPLY_TIME);

	m_sc_send_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_SC_SEND_TIME);
	if (m_sc_send_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_SC_SEND_TIME);

	m_sc_ack_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_SC_ACK_TIME);
	if (m_sc_ack_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_SC_ACK_TIME);

	m_end_user_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_END_USER_TIME);
	if (m_end_user_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_END_USER_TIME);

	m_data_center_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_DATA_CENTER_TIME);
	if (m_data_center_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_DATA_CENTER_TIME);

	m_authuser_term_ref = v.findTerm(VOCAB_CLICKSTREAM_AUTHUSER);
	if (m_authuser_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_AUTHUSER);
}


// class HTTPProtocol::ExtractionRule

bool HTTPProtocol::ExtractionRule::tryDecoding(const pion::net::HTTPMessage& http_msg, 
	boost::shared_array<char>& decoded_content, size_t& decoded_content_length) const
{
	// check if content is encoded
	const std::string& content_encoding(http_msg.getHeader(pion::net::HTTPTypes::HEADER_CONTENT_ENCODING));
	if (content_encoding.empty()) {
		return false;
	}
		
	// attempt to decode content
	boost::iostreams::filtering_streambuf<boost::iostreams::input> decoder;
	
	if (content_encoding == "gzip" || content_encoding == "x-gzip") {

		// payload has gzip (LZ77) encoding
		decoder.push(boost::iostreams::gzip_decompressor());

	} else if (content_encoding == "deflate") {

		// payload has deflate ("zlib") encoding
		decoder.push(boost::iostreams::zlib_decompressor());

	} else if (content_encoding == "compress" || content_encoding == "x-compress") {

		// payload has compress (LZW) encoding
		// CAN'T HANDLE
		return false;
	
	} else {

		// unrecognized content encoding
		// CAN'T HANDLE
		return false;
	}

	// for input filters, the source should be pushed last
	decoder.push( boost::iostreams::basic_array_source<char>(http_msg.getContent(),
		http_msg.getContentLength()) );

	// write encoded content to stream
	DecoderSink decoder_sink;

	// NOTE: iostreams::copy() does not work as of 1.37.0 b/c it creates a copy
	// of decoder_sink instead of using a reference to decoder_sink (UGH!)
	//size_t len = boost::iostreams::copy(decoder, decoder_sink);
	{
		char buf[4096];
		std::streamsize num_read;
		while ((num_read=decoder.sgetn(buf, 4096)) == 4096)
			decoder_sink.write(buf, 4096);
		if (num_read > 0) 
			decoder_sink.write(buf, num_read);
	}
	
	// initialize decoded content cache to hold results
	decoded_content_length = decoder_sink.getBytes();
	decoded_content.reset(new char[decoded_content_length+1]);	// add 1 in case length == 0

	if (decoded_content_length > 0) {	
		// copy results into decoded content cache (a contiguous array)
		char *decoded_ptr = decoded_content.get();
		const DecoderContainer& container = decoder_sink.getContainer();
		for (DecoderContainer::const_iterator it = container.begin();
			it != container.end(); ++it)
		{
			if (it->second > 0) {
				memcpy(decoded_ptr, it->first.get(), it->second);
				decoded_ptr += it->second;
			}
		}
	}

	// content was decoded
	return true;
}


}	// end namespace plugins
}	// end namespace pion



/// creates new HTTPProtocol objects
extern "C" PION_PLUGIN_API pion::platform::Protocol *pion_create_HTTPProtocol(void) {
	return new pion::plugins::HTTPProtocol();
}

/// destroys HTTPProtocol objects
extern "C" PION_PLUGIN_API void pion_destroy_HTTPProtocol(pion::plugins::HTTPProtocol *protocol_ptr) {
	delete protocol_ptr;
}
