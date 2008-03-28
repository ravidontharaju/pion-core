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

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of LogCodec
const std::string			LogCodec::CONTENT_TYPE = "text/ascii";
const std::string			LogCodec::FIELDS_FORMAT_STRING = "#Fields:";
const std::string			LogCodec::FIELD_ELEMENT_NAME = "Field";
const std::string			LogCodec::HEADERS_ELEMENT_NAME = "Headers";
const std::string			LogCodec::FLUSH_ELEMENT_NAME = "Flush";
const std::string			LogCodec::TERM_ATTRIBUTE_NAME = "term";
const std::string			LogCodec::START_ATTRIBUTE_NAME = "start";
const std::string			LogCodec::END_ATTRIBUTE_NAME = "end";
const unsigned int			LogCodec::READ_BUFFER_SIZE = 1024 * 126;	// 128KB

	
// LogCodec member functions

CodecPtr LogCodec::clone(void) const
{
	LogCodec *new_codec(new LogCodec());
	new_codec->copyCodec(*this);
	boost::mutex::scoped_lock codec_lock(m_mutex);
	new_codec->m_flush_after_write = m_flush_after_write;
	new_codec->m_needs_to_write_headers = m_needs_to_write_headers;
	for (CurrentFormat::const_iterator i = m_format.begin(); i != m_format.end(); ++i) {
		new_codec->mapFieldToTerm((*i)->log_field, (*i)->log_term,
								  (*i)->log_delim_start, (*i)->log_delim_end);
	}
	return CodecPtr(new_codec);
}
	
void LogCodec::write(std::ostream& out, const Event& e)
{
	const Event::ParameterValue *value_ptr;
	
	// iterate through each field in the current format
	boost::mutex::scoped_lock codec_lock(m_mutex);
	
	// write the ELF headers if necessary
	if (m_needs_to_write_headers) {
		writeHeaders(out);
		m_needs_to_write_headers = false;
	}
	
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
	
	// flush the output stream
	if (m_flush_after_write)
		out.flush();
}
	
bool LogCodec::read(std::istream& input_stream, Event& e)
{
	char *read_ptr;
	char * const read_start = m_read_buf.get();
	const char * const read_end = read_start + READ_BUFFER_SIZE;
	typedef std::istream::traits_type traits_type;
	std::basic_streambuf<std::istream::char_type, std::istream::traits_type> *buf_ptr = input_stream.rdbuf();
	std::istream::int_type c = buf_ptr->sgetc();

	// skip empty lines and space characters at beginning of line
	while (true) {
		if (traits_type::eq_int_type(c, traits_type::eof())) {
			input_stream.setstate(std::ios::eofbit);
			return false;
		} else if (c == ' ' || c == '\x0A' || c == '\x0D') {
			buf_ptr->sbumpc();
		} else if (c == '#') {
			// ignore comment line
			read_ptr = read_start;
			do {
				c = buf_ptr->sbumpc();
				// check for premature eof
				if (traits_type::eq_int_type(c, traits_type::eof())) {
					input_stream.setstate(std::ios::eofbit);
					return false;
				}
				// read in the comment in case it is a format change
				if (read_ptr < read_end)
					*(read_ptr++) = c;
			} while (c != '\x0A' && c != '\x0D');
			// consume \r\n or \n\r
			if (c == '\x0A' && buf_ptr->sgetc() == '\x0D' || c == '\x0D' && buf_ptr->sgetc() == '\x0A')
				buf_ptr->sbumpc();
			// check if it is a format change
			*read_ptr = '\0';
			read_start[FIELDS_FORMAT_STRING.size()] = '\0';
			if (FIELDS_FORMAT_STRING == read_start) {
				if (! changeFormat(read_start + FIELDS_FORMAT_STRING.size() + 1))
					return false;
			}
		} else {
			break;
		}
		c = buf_ptr->sgetc();
	}

	boost::mutex::scoped_lock codec_lock(m_mutex);
	CurrentFormat::const_iterator i = m_format.begin();

	// iterate through each field in the format
	while (i != m_format.end()) {
		const char delim_start = (*i)->log_delim_start;
		const char delim_end = (*i)->log_delim_end;

		// ignore input until we reach the start char (if defined)
		if (delim_start != '\0') {
			while (! traits_type::eq_int_type(c, traits_type::eof()) ) {
				c = buf_ptr->sbumpc();
				if (c == delim_start)
					break;
			}
		}
		
		// eof before we started reading a field
		if (traits_type::eq_int_type(c, traits_type::eof())) {
			input_stream.setstate(std::ios::eofbit);
			return false;
		}
		
		// parse the field contents
		read_ptr = read_start;
		c = buf_ptr->sbumpc();
		while (! traits_type::eq_int_type(c, traits_type::eof()) ) {
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
			c = buf_ptr->sbumpc();
		}
		
		// eof before we were able to parse a field
		if (read_ptr == read_start) {
			if (traits_type::eq_int_type(c, traits_type::eof()))
				input_stream.setstate(std::ios::eofbit);
			return false;
		}
		
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
			while (c != '\x0A' && c != '\x0D' && !traits_type::eq_int_type(c, traits_type::eof())) {
				c = buf_ptr->sbumpc();
			}
			if (c == '\x0A' && buf_ptr->sgetc() == '\x0D'
				|| c == '\x0D' && buf_ptr->sgetc() == '\x0A')
			{
				// consume \r\n or \n\r
				buf_ptr->sbumpc();
			}
		} else {
			// not the end of format
			// check if end of line reached prematurely
			if (c == '\x0A' || c == '\x0D')
				return false;
			// skip space characters in between fields
			while (! traits_type::eq_int_type(c, traits_type::eof()) ) {
				c = buf_ptr->sgetc();
				if (c == ' ')
					buf_ptr->sbumpc();
				else
					break;
			}
		}
	}
			
	if (traits_type::eq_int_type(c, traits_type::eof()))
		input_stream.setstate(std::ios::eofbit);
		
	return true;
}

void LogCodec::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Codec base class
	reset();
	Codec::setConfig(v, config_ptr);
	boost::mutex::scoped_lock codec_lock(m_mutex);
	
	// check if the Codec should flush the output stream after each write
	m_flush_after_write = false;
	std::string flush_option;
	if (ConfigManager::getConfigOption(FLUSH_ELEMENT_NAME, flush_option,
									   config_ptr))
	{
		if (flush_option == "true")
			m_flush_after_write = true;
	}
	
	// check if the Codec should include headers when writing output
	m_needs_to_write_headers = false;
	std::string headers_option;
	if (ConfigManager::getConfigOption(HEADERS_ELEMENT_NAME, headers_option,
									   config_ptr))
	{
		if (headers_option == "true")
			m_needs_to_write_headers = true;
	}
	
	// next, map the fields to Terms
	xmlNodePtr codec_field_node = config_ptr;
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
	boost::mutex::scoped_lock codec_lock(m_mutex);
	for (CurrentFormat::iterator i = m_format.begin(); i != m_format.end(); ++i) {
		/// we can assume for now that Term reference values will never change
		(*i)->log_term = v[(*i)->log_term.term_ref];
	}
}

}	// end namespace plugins
}	// end namespace pion


/// creates new LogCodec objects
extern "C" PION_PLUGIN_API pion::platform::Codec *pion_create_LogCodec(void) {
	return new pion::plugins::LogCodec();
}

/// destroys LogCodec objects
extern "C" PION_PLUGIN_API void pion_destroy_LogCodec(pion::plugins::LogCodec *codec_ptr) {
	delete codec_ptr;
}
