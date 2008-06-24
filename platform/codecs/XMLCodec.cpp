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

#include <libxml/tree.h>
#include <libxml/xmlreader.h>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Vocabulary.hpp>
#include "XMLCodec.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of XMLCodec
const std::string			XMLCodec::CONTENT_TYPE = "text/xml";
const std::string			XMLCodec::FIELD_ELEMENT_NAME = "Field";
const std::string			XMLCodec::TERM_ATTRIBUTE_NAME = "term";
const std::string			XMLCodec::EVENT_ELEMENT_NAME = "Event";


// XMLCodec member functions

CodecPtr XMLCodec::clone(void) const
{
	XMLCodec *new_codec(new XMLCodec());
	new_codec->copyCodec(*this);
	return CodecPtr(new_codec);
}

void XMLCodec::write(std::ostream& out, const Event& e)
{
}

void XMLCodec::finish(std::ostream& out)
{
}

int	xmlInputReadCallback(void* context, char* buffer, int len)
{
	std::istream* p = (std::istream*)context;
	return p->readsome(buffer, len);
}

int	xmlInputCloseCallback(void* context)
{
	return 0;
}

bool XMLCodec::read(std::istream& in, Event& e)
{
	if (e.getType() != getEventType())
		throw WrongEventTypeException();

	e.clear();

	if (m_first_read_attempt) {
		if (m_field_map.empty())
			throw PionException("Codec is not configured yet.");
	    m_xml_reader = xmlReaderForIO(xmlInputReadCallback, xmlInputCloseCallback, (void*)(&in), NULL, NULL, 0);
		if (!m_xml_reader)
			throw PionException("failed to create XML parser");
		m_first_read_attempt = false;
	}

	// parse the input until the next 'Event' start-tag is found
	while (1) {
		int ret = xmlTextReaderRead(m_xml_reader);
		if (ret == 0)
			return false;
		if (ret < 0)
			throw PionException("XML parser error");
		const xmlChar* name = xmlTextReaderConstName(m_xml_reader);
		if (strcmp((char*)name, EVENT_ELEMENT_NAME.c_str()) == 0)
			break;
	}

	// parse the input until the 'Event' end-tag is found
	while (1) {
		if (xmlTextReaderRead(m_xml_reader) != 1)
			throw PionException("XML parser error");
		const xmlChar* name = xmlTextReaderConstName(m_xml_reader);
		if (strcmp((char*)name, EVENT_ELEMENT_NAME.c_str()) == 0)
			break;

		// get the Term corresponding to the tag
		XMLCodec::FieldMap::const_iterator i = m_field_map.find(std::string((char*)name));
		if (i == m_field_map.end())
			// TODO: Should we just skip unknown Terms instead?
			throw PionException("Unknown Term in Event");
		const pion::platform::Vocabulary::Term& term = i->second->term;

		// get the value of the Term from the contents of the element
		if (xmlTextReaderRead(m_xml_reader) != 1)
			throw PionException("XML parser error");
		const std::string value_str((char*)xmlTextReaderConstValue(m_xml_reader));

		// parse the end-tag for the Term 
		if (xmlTextReaderRead(m_xml_reader) != 1)
			throw PionException("XML parser error");

		switch (term.term_type) {
			case pion::platform::Vocabulary::TYPE_NULL:
				// do nothing
				break;
			case pion::platform::Vocabulary::TYPE_INT8:
			case pion::platform::Vocabulary::TYPE_INT16:
			case pion::platform::Vocabulary::TYPE_INT32:
				e.setInt(term.term_ref, boost::lexical_cast<boost::int32_t>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_INT64:
				e.setBigInt(term.term_ref, boost::lexical_cast<boost::int64_t>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_UINT8:
			case pion::platform::Vocabulary::TYPE_UINT16:
			case pion::platform::Vocabulary::TYPE_UINT32:
				e.setUInt(term.term_ref, boost::lexical_cast<boost::uint32_t>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_UINT64:
				e.setUBigInt(term.term_ref, boost::lexical_cast<boost::uint64_t>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_FLOAT:
				e.setFloat(term.term_ref, boost::lexical_cast<float>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_DOUBLE:
				e.setDouble(term.term_ref, boost::lexical_cast<double>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_LONG_DOUBLE:
				e.setLongDouble(term.term_ref, boost::lexical_cast<long double>(value_str));
				break;
			case pion::platform::Vocabulary::TYPE_SHORT_STRING:
			case pion::platform::Vocabulary::TYPE_STRING:
			case pion::platform::Vocabulary::TYPE_LONG_STRING:
				e.setString(term.term_ref, value_str);
				break;
			case pion::platform::Vocabulary::TYPE_CHAR:
				if (value_str.size() > term.term_size) {
					e.setString(term.term_ref, std::string(value_str, 0, term.term_size));
				} else {
					e.setString(term.term_ref, value_str);
				}
				break;
			case pion::platform::Vocabulary::TYPE_DATE_TIME:
			case pion::platform::Vocabulary::TYPE_DATE:
			case pion::platform::Vocabulary::TYPE_TIME:
			{
				PionDateTime dt;
				m_XML_field_ptr_map[term.term_ref]->time_facet.fromString(value_str, dt);
				e.setDateTime(term.term_ref, dt);
				break;
			}
			default:
				return false;
		}
	}

	return true;
}

void XMLCodec::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Codec base class
	reset();
	Codec::setConfig(v, config_ptr);

	// TODO: options

	// next, map the fields to Terms
	xmlNodePtr codec_field_node = config_ptr;
	while ( (codec_field_node = ConfigManager::findConfigNodeByName(FIELD_ELEMENT_NAME, codec_field_node)) != NULL) {
		// parse new field mapping

		// start with the name of the field (element content)
		xmlChar *xml_char_ptr = xmlNodeGetContent(codec_field_node);
		if (xml_char_ptr == NULL || xml_char_ptr[0] == '\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyFieldException(getId());
		}
		const std::string field_name(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);

		// next get the Term we want to map to
		xml_char_ptr = xmlGetProp(codec_field_node, reinterpret_cast<const xmlChar*>(TERM_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr == NULL || xml_char_ptr[0] == '\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyTermException(getId());
		}
		const std::string term_id(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);

		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(term_id);

		// add the field mapping
		mapFieldToTerm(field_name, v[term_ref]);

		// step to the next field mapping
		codec_field_node = codec_field_node->next;
	}

	m_XML_field_ptr_map.clear();
	for (FieldMap::const_iterator i = m_field_map.begin(); i != m_field_map.end(); ++i) {
		if (m_XML_field_ptr_map.find(i->second->term.term_ref) != m_XML_field_ptr_map.end())
			throw PionException("Duplicate Field Term");
		m_XML_field_ptr_map[i->second->term.term_ref] = i->second;
	}
}

void XMLCodec::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Codec base class that might be needed
	Codec::updateVocabulary(v);
	
	// ...
}
	
	
}	// end namespace plugins
}	// end namespace pion


/// creates new XMLCodec objects
extern "C" PION_PLUGIN_API pion::platform::Codec *pion_create_XMLCodec(void) {
	return new pion::plugins::XMLCodec();
}

/// destroys XMLCodec objects
extern "C" PION_PLUGIN_API void pion_destroy_XMLCodec(pion::plugins::XMLCodec *codec_ptr) {
	delete codec_ptr;
}
