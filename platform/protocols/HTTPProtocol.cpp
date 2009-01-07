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
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_TIME_TAKEN="urn:vocab:clickstream#time-taken";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_CS_SEND_TIME="urn:vocab:clickstream#cs-send-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_SC_REPLY_TIME="urn:vocab:clickstream#sc-reply-time";
const std::string HTTPProtocol::VOCAB_CLICKSTREAM_SC_SEND_TIME="urn:vocab:clickstream#sc-send-time";

	
// HTTPProtocol member functions

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
									  EventPtr& event_ptr_ref)
{
	boost::tribool rc;

	if (ptr == NULL) {
	
		// missing data -> try to recover from lost packet
		rc = (request ? m_request_parser.parseMissingData(m_request, len)
			: m_response_parser.parseMissingData(m_response, len) );
	
	} else {

		// has valid data available for parsing
		
		if (request) {
	
			// update timestamps if necessary
			if (m_request_start_time.is_not_a_date_time()) {
				m_request_start_time = m_request_end_time = data_timestamp;
			} else if (data_timestamp > m_request_end_time) {
				m_request_end_time = data_timestamp;
			}
	
			// parse the data
			m_request_parser.setReadBuffer(ptr, len);
			rc = m_request_parser.parse(m_request);
	
		} else {
	
			// update timestamps if necessary
			if (m_response_start_time.is_not_a_date_time()) {
				m_response_start_time = m_response_end_time = data_timestamp;
			} else if (data_timestamp > m_response_end_time) {
				m_response_end_time = data_timestamp;
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
			m_request_parser.reset();
			m_response_parser.reset();
			m_request.clear();
			m_response.clear();
			m_request_start_time = m_request_end_time = boost::date_time::not_a_date_time;
			m_response_start_time = m_response_end_time = boost::date_time::not_a_date_time;
		}
	}

	return rc;
}

boost::shared_ptr<Protocol> HTTPProtocol::clone(void) const
{
	HTTPProtocol* retval = new HTTPProtocol;
	retval->copyProtocol(*this);

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
	retval->m_time_taken_term_ref = m_time_taken_term_ref;
	retval->m_cs_send_time_term_ref = m_cs_send_time_term_ref;
	retval->m_sc_reply_time_term_ref = m_sc_reply_time_term_ref;
	retval->m_sc_send_time_term_ref = m_sc_send_time_term_ref;

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
		m_request_start_time = m_request_end_time = m_response_start_time;
	else if (m_response_start_time.is_not_a_date_time())
		m_response_start_time = m_response_end_time = m_request_end_time;

	// set timestamp fields
	(*event_ptr_ref).setDateTime(m_date_term_ref, m_request_start_time); 
	(*event_ptr_ref).setDateTime(m_time_term_ref, m_request_start_time); 
	(*event_ptr_ref).setDateTime(m_date_time_term_ref, m_request_start_time); 
	(*event_ptr_ref).setDateTime(m_clf_date_term_ref, m_request_start_time); 

	// set time duration fields
	(*event_ptr_ref).setUInt(m_time_taken_term_ref,
		( m_response_end_time > m_request_start_time ?
		  (m_response_end_time - m_request_start_time).total_microseconds()
		  : 0 ) );
	(*event_ptr_ref).setUInt(m_cs_send_time_term_ref,
		( m_request_end_time > m_request_start_time ?
		  (m_request_end_time - m_request_start_time).total_microseconds()
		  : 0 ) );
	(*event_ptr_ref).setUInt(m_sc_reply_time_term_ref,
		( m_response_start_time > m_request_end_time ?
		  (m_response_start_time - m_request_end_time).total_microseconds()
		  : 0 ) );
	(*event_ptr_ref).setUInt(m_sc_send_time_term_ref,
		( m_response_end_time > m_response_start_time ?
		  (m_response_end_time - m_response_start_time).total_microseconds()
		  : 0 ) );

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
				// extract HTTP payload content from request
				rule.processContent(event_ptr_ref, m_request);
				break;
			case EXTRACT_SC_CONTENT:
				// extract HTTP payload content from response
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

	m_time_taken_term_ref = v.findTerm(VOCAB_CLICKSTREAM_TIME_TAKEN);
	if (m_time_taken_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_TIME_TAKEN);

	m_cs_send_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_CS_SEND_TIME);
	if (m_cs_send_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_CS_SEND_TIME);

	m_sc_reply_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_SC_REPLY_TIME);
	if (m_sc_reply_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_SC_REPLY_TIME);

	m_sc_send_time_term_ref = v.findTerm(VOCAB_CLICKSTREAM_SC_SEND_TIME);
	if (m_sc_send_time_term_ref == Vocabulary::UNDEFINED_TERM_REF)
		throw UnknownTermException(VOCAB_CLICKSTREAM_SC_SEND_TIME);
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
