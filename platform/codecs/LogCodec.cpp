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

#include "LogCodec.hpp"
#include <pion/platform/ConfigManager.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of LogCodec
const std::string			LogCodec::CONTENT_TYPE = "text/ascii";
const std::string			LogCodec::FIELD_ELEMENT_NAME = "field";
const std::string			LogCodec::TERM_ATTRIBUTE_NAME = "term";
const std::string			LogCodec::START_ATTRIBUTE_NAME = "start";
const std::string			LogCodec::END_ATTRIBUTE_NAME = "end";
const unsigned int			LogCodec::READ_BUFFER_SIZE = 1024 * 126;	// 128KB

	
// LogCodec member functions

CodecPtr LogCodec::clone(void) const
{
	LogCodec *new_codec(new LogCodec());
	new_codec->copy(*this);
	for (CurrentFormat::const_iterator i = m_format.begin(); i != m_format.end(); ++i) {
		new_codec->mapFieldToTerm((*i)->log_field, (*i)->log_term,
								  (*i)->log_delim_start, (*i)->log_delim_end);
	}
	return CodecPtr(new_codec);
}
	
void LogCodec::write(std::ostream& out, const Event& e)
{
	const boost::any *value_ptr;
	
	// iterate through each field in the current format
	CurrentFormat::const_iterator i = m_format.begin();
	while (i != m_format.end()) {
		// get the value for the field
		value_ptr = e.getPointer((*i)->log_term.term_ref);

		// check if the value is undefined
		if (value_ptr == NULL)
			(*i)->writeEmptyValue(out);
		else
			(*i)->write(out, *value_ptr);
		
		// iterate to the next field
		++i;
		// add space character between all fields
		if (i != m_format.end())
			out << ' ';
	}

	// write newline for each even record
	out << '\x0A';
}
	
bool LogCodec::read(std::istream& in, Event& e)
{
	int c = '\0';
	char *read_ptr;
	char * const read_start = m_read_buf.get();
	const char * const read_end = read_start + READ_BUFFER_SIZE;
	CurrentFormat::const_iterator i = m_format.begin();

	// skip space characters at beginning of line
	while (! in.eof() ) {
		c = in.peek();
		if (c == ' ') {
			in.get();
		} else if (c == '#') {
			// ignore comment line
			do {
				c = in.get();
			} while (c != '\x0A' && c != '\x0D');
			if (c == '\x0A' && in.peek() == '\x0D'
				|| c == '\x0D' && in.peek() == '\x0A')
			{
				// consume \r\n or \n\r
				in.get();
			}
		} else {
			break;
		}
	}

	// iterate through each field in the format
	while (i != m_format.end()) {
		const char delim_start = (*i)->log_delim_start;
		const char delim_end = (*i)->log_delim_end;

		// ignore input until we reach the start char (if defined)
		if (delim_start != '\0') {
			while (! in.eof() ) {
				c = in.get();
				if (c == delim_start)
					break;
			}
		}
		
		// eof before we started reading a field
		if (in.eof()) return false;
		
		// parse the field contents
		read_ptr = read_start;
		while (! in.eof() ) {
			c = in.get();
			if (c == '\x0A' || c == '\x0D' || c == delim_end
				|| (delim_end=='\0' && c == ' ') )
			{
				// we've reached the end of the field contents
				// increment the pointer so we know it's finished
				*(read_ptr++) = '\0';
				break;
			}
			if (read_ptr < read_end)
				*(read_ptr++) = c;
			else if (read_ptr == read_end)
				*(read_ptr++) = '\0';
		}
		
		// eof before we were able to parse a field
		if (read_ptr == read_start) return false;
		
		// only set values that are not null
		if (*read_start != '\0' && !(delim_start == '\0'
									 && read_start[0] == '-'
									 && read_start[1] == '\0') )
		{
			// parse the value we have extracted
			(*i)->read(read_start, e[(*i)->log_term.term_ref]);
		}
		
		++i;
		
		if (i == m_format.end()) {
			// end of format
			if (c == '\x0A' && in.peek() == '\x0D'
				|| c == '\x0D' && in.peek() == '\x0A')
			{
				// consume \r\n or \n\r
				in.get();
			}
		} else {
			// not the end of format
			// check if end of line reached prematurely
			if (c == '\x0A' || c == '\x0D')
				return false;
			// skip space characters in between fields
			while (! in.eof() ) {
				c = in.peek();
				if (c == ' ')
					in.get();
				else
					break;
			}
		}
	}
			
	return true;
}

void LogCodec::setConfig(const Vocabulary& v, const xmlNodePtr codec_config_ptr)
{
	// first set config options for the Codec base class
	Codec::setConfig(v, codec_config_ptr);
	reset();
	
	// next, map the fields to Terms
	xmlNodePtr codec_field_node = codec_config_ptr;
	while ( (codec_field_node = ConfigManager::findConfigNodeByName(FIELD_ELEMENT_NAME, codec_field_node)) != NULL)
	{
		// parse new field mapping
		
		// start with the name of the field (element content)
		xmlChar *xml_char_ptr = xmlNodeGetContent(codec_field_node);
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyFieldException(getId());
		}
		const std::string field_name(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);
		
		// next get the Term we want to map to
		xml_char_ptr = xmlGetProp(codec_field_node, reinterpret_cast<const xmlChar*>(TERM_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
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
		
		// get the starting delimiter (if any)
		char delim_start = '\0';
		xml_char_ptr = xmlGetProp(codec_field_node, reinterpret_cast<const xmlChar*>(START_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr != NULL && xml_char_ptr[0] != '\0')
			delim_start = xml_char_ptr[0];

		// get the ending delimiter (if any)
		char delim_end = '\0';
		xml_char_ptr = xmlGetProp(codec_field_node, reinterpret_cast<const xmlChar*>(END_ATTRIBUTE_NAME.c_str()));
		if (xml_char_ptr != NULL && xml_char_ptr[0] != '\0')
			delim_end = xml_char_ptr[0];
		
		// add the field mapping
		mapFieldToTerm(field_name, v[term_ref], delim_start, delim_end);
		
		// step to the next field mapping
		codec_field_node = codec_field_node->next;
	}
}

void LogCodec::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Codec base class that might be needed
	Codec::updateVocabulary(v);

	/// copy Term data over from the updated Vocabulary
	for (CurrentFormat::iterator i = m_format.begin(); i != m_format.end(); ++i) {
		/// we can assume for now that Term reference values will never change
		(*i)->log_term = v[(*i)->log_term.term_ref];
	}
}

}	// end namespace platform
}	// end namespace pion


/// creates new LogCodec objects
extern "C" PION_PLUGIN_API pion::platform::Codec *pion_create_LogCodec(void) {
	return new pion::platform::LogCodec();
}

/// destroys LogCodec objects
extern "C" PION_PLUGIN_API void pion_destroy_LogCodec(pion::platform::LogCodec *codec_ptr) {
	delete codec_ptr;
}
