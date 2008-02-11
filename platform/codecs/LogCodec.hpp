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

#ifndef __PION_LOGCODEC_HEADER__
#define __PION_LOGCODEC_HEADER__

#include <vector>
#include <boost/bind.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/scoped_array.hpp>
#include <boost/lexical_cast.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionHashMap.hpp>
#include <pion/PionDateTime.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// LogCodec: used to encode and decode Events using standard log file formats
///
class LogCodec :
	public Codec
{
public:

	/// exception thrown if the Codec configuration includes an empty field name
	class EmptyFieldException : public PionException {
	public:
		EmptyFieldException(const std::string& codec_id)
			: PionException("LogCodec configuration includes an empty field name: ", codec_id) {}
	};

	/// exception thrown if the Codec configuration does not define a term in a field mapping
	class EmptyTermException : public PionException {
	public:
		EmptyTermException(const std::string& codec_id)
			: PionException("LogCodec configuration is missing a term identifier: ", codec_id) {}
	};
	
	/// exception thrown if the Codec configuration uses an unknown term in a field mapping
	class UnknownTermException : public PionException {
	public:
		UnknownTermException(const std::string& term_id)
			: PionException("LogCodec configuration maps field to an unknown term: ", term_id) {}
	};

	
	/// constructs a new LogCodec object
	LogCodec(void)
		: Codec(), m_read_buf(new char[READ_BUFFER_SIZE+1]),
		m_needs_to_write_headers(false)
	{}

	/// virtual destructor: this class is meant to be extended
	virtual ~LogCodec() {}
	
	/// returns an HTTP content type that is used by this Codec
	virtual const std::string& getContentType(void) const { return CONTENT_TYPE; }
	
	/**
	 * clones the codec, returning a pointer to the cloned copy
	 *
	 * @return CodecPtr pointer to the cloned copy of the codec
	 */
	virtual CodecPtr clone(void) const;
	
	/**
	 * writes an Event to an output stream
	 *
	 * @param out the output stream to which the Event will be written
	 * @param e the Event to write to the output stream
	 */
	virtual void write(std::ostream& out, const Event& e);

	/**
	 * reads an Event from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @param e the Event read, if any; null if error
	 * @return true if successful, false otherwise
	 */
	virtual bool read(std::istream& in, Event& e);

	/**
	 * sets configuration parameters for this Codec
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Codec
	 *                   configuration parameters
	 */
	virtual void setConfig(const Vocabulary& v, const xmlNodePtr config_ptr);
	
	/**
	 * this updates the Vocabulary information used by this Codec; it should be
	 * called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);
	
	/// resets the configuration for this Codec
	inline void reset(void) {
		boost::mutex::scoped_lock codec_lock(m_mutex);
		m_field_map.clear();
		m_format.clear();
	}
	
	
private:

	/**
	 * maps a data field to a Vocabulary Term
	 *
	 * @param field the name of the data field
	 * @param term the Vocabulary Term to map the data field to
	 * @param delim_start character used to delimit the start of the data field value
	 * @param delim_end character used to delimit the end of the data field value
	 */
	inline void mapFieldToTerm(const std::string& field,
							   const Vocabulary::Term& term,
							   char delim_start, char delim_end);
	
	/**
	 * changes the current format used by the Codec
	 *
	 * @param fmt the new format to use (a sequence of field names separated by spaces)
	 * @return true if the format was successfully changed; false if error
	 */
	inline bool changeFormat(char *fmt);
	
	/**
	 * writes the ELF version number and field format headers
	 *
	 * @param out the output stream to which the headers will be written
	 */
	inline void writeHeaders(std::ostream& out) const;

	
	/// data type used to configure how the log format describes Vocabulary Terms
	struct LogField {
		/// constructs a new LogField structure
		LogField(const std::string& f, const Vocabulary::Term& t, char d_start, char d_end)
			: log_field(f), log_term(t), log_delim_start(d_start), log_delim_end(d_end)
		{}

		/// copy constructor
		LogField(const LogField& f)
			: log_field(f.log_field), log_term(f.log_term),
			log_delim_start(f.log_delim_start), log_delim_end(f.log_delim_end)
		{}

		/// assignment operator
		inline LogField& operator=(const LogField& f) {
			log_field = f.log_field;
			log_term = f.log_term;
			log_delim_start = f.log_delim_start;
			log_delim_end = f.log_delim_end;
			return *this;
		}

		/// writes an empty value to an output stream
		void writeEmptyValue(std::ostream& out) const {
			if (log_delim_start == '\0') {
				// use a single minus symbol if no delimiters
				out << '-';
			} else {
				// otherwise just write the delimiters one after the other
				out << log_delim_start << log_delim_end;
			}
		}
		
		/**
		 * writes the value for a single field
		 *
		 * @param out the output stream to which the value will be written
		 * @param value the value to write
		 */
		inline void write(std::ostream& out, const boost::any& value);
		
		/**
		 * reads the value for a single field
		 *
		 * @param buf array of bytes to read the value from
		 * @param value the value to read
		 */
		inline void read(const char *buf, boost::any& value);

		/// the name of the field
		std::string			log_field;
		/// the Vocabulary Term that the data field represents
		Vocabulary::Term	log_term;
		/// used to encode and decode date_time fields
		PionTimeFacet		log_time_facet;
		/// a character that delimits the beginning of the field value, or '\0' if none
		char				log_delim_start;
		/// a character that delimits the end of the field value, or '\0' if none
		char				log_delim_end;
	};
	
	/// data type for a pointer to a LogField object
	typedef boost::shared_ptr<LogField>		LogFieldPtr;
	
	/// data type that maps field names to LogFields
	typedef PION_HASH_MAP<std::string, LogFieldPtr, PION_HASH_STRING >	FieldMap;

	/// data type that keeps track of the log file's current field format
	typedef std::vector<LogFieldPtr>	CurrentFormat;

	
	/// content type used by this Codec
	static const std::string		CONTENT_TYPE;
	
	/// String defines a field format for the log file (ELF)
	static const std::string		FIELDS_FORMAT_STRING;
	
	/// name of the field mapping element for Pion XML config files
	static const std::string		FIELD_ELEMENT_NAME;
	
	/// name of the headers element for Pion XML config files
	static const std::string		HEADERS_ELEMENT_NAME;
	
	/// name of the Term ID attribute for Pion XML config files
	static const std::string		TERM_ATTRIBUTE_NAME;	

	/// name of the start delimiter attribute for Pion XML config files
	static const std::string		START_ATTRIBUTE_NAME;	

	/// name of the end delimiter attribute for Pion XML config files
	static const std::string		END_ATTRIBUTE_NAME;	
	
	/// maxiumum size of the read buffer
	static const unsigned int		READ_BUFFER_SIZE;
	

	/// memory buffer used to read events
	boost::scoped_array<char>		m_read_buf;
	
	/// used to configure which fields map to Vocabulary Terms (for reading)
	FieldMap						m_field_map;
	
	/// represents the current sequence of data fields in the log format
	CurrentFormat					m_format;
	
	/// true if the codec should write out ELF headers
	bool							m_needs_to_write_headers;

	/// mutex used to protect the field mappings
	mutable boost::mutex			m_mutex;	
};


// inline member functions for LogCodec

inline void LogCodec::mapFieldToTerm(const std::string& field,
									 const Vocabulary::Term& term,
									 char delim_start, char delim_end)
{
	// prepare a new Logfield object
	LogFieldPtr field_ptr(new LogField(field, term, delim_start, delim_end));
	switch (term.term_type) {
		case Vocabulary::TYPE_DATE_TIME:
		case Vocabulary::TYPE_DATE:
		case Vocabulary::TYPE_TIME:
			field_ptr->log_time_facet.setFormat(term.term_format);
			break;
		default:
			break; // do nothing
	}
	// add it to the mapping of field names
	m_field_map[field] = field_ptr;
	// append the new field to the current (default) format
	m_format.push_back(field_ptr);
}
	
inline bool LogCodec::changeFormat(char *fmt)
{
	m_format.clear();
	char *ptr;
	bool last_field = false;
	while (!last_field && *fmt != '\0' && *fmt != '\n' && *fmt != '\r') {
		// skip leading spaces
		while (*fmt == ' ') ++fmt;
		// find the end of the field name
		ptr = fmt;
		while (*ptr != '\0' && *ptr != '\n' && *ptr != '\r' && *ptr != ' ') ++ptr;
		// set last_field if we're at the end
		if (*ptr == '\0' || *ptr == '\n' || *ptr == '\r') last_field = true;
		*ptr = '\0';
		FieldMap::const_iterator i = m_field_map.find(fmt);
		if (i == m_field_map.end()) return false;
		m_format.push_back(i->second);
		fmt = ptr + 1;
	}
	return true;
}
	
inline void LogCodec::writeHeaders(std::ostream& out) const
{
	out << "#Version: 1.0\x0A";
	out << FIELDS_FORMAT_STRING << ' ';
	CurrentFormat::const_iterator i = m_format.begin();
	while (i != m_format.end()) {
		out << (*i)->log_field;
		if (++i != m_format.end()) out << ' ';
	}
	out << '\x0A';
}

	
// inline member functions for LogCodec::LogField

inline void LogCodec::LogField::write(std::ostream& out, const boost::any& value)
{
	if (log_delim_start != '\0')
		out << log_delim_start;
	
	switch(log_term.term_type) {
		case Vocabulary::TYPE_NULL:
			writeEmptyValue(out);
			break;
		case Vocabulary::TYPE_INT8:
		case Vocabulary::TYPE_INT16:
		case Vocabulary::TYPE_INT32:
			out << boost::any_cast<boost::int32_t>(value);
			break;
		case Vocabulary::TYPE_INT64:
			out << boost::any_cast<boost::int64_t>(value);
			break;
		case Vocabulary::TYPE_UINT8:
		case Vocabulary::TYPE_UINT16:
		case Vocabulary::TYPE_UINT32:
			out << boost::any_cast<boost::uint32_t>(value);
			break;
		case Vocabulary::TYPE_UINT64:
			out << boost::any_cast<boost::uint64_t>(value);
			break;
		case Vocabulary::TYPE_FLOAT:
			out << boost::any_cast<float>(value);
			break;
		case Vocabulary::TYPE_DOUBLE:
			out << boost::any_cast<double>(value);
			break;
		case Vocabulary::TYPE_LONG_DOUBLE:
			out << boost::any_cast<long double>(value);
			break;
		case Vocabulary::TYPE_SHORT_STRING:
		case Vocabulary::TYPE_STRING:
		case Vocabulary::TYPE_LONG_STRING:
		case Vocabulary::TYPE_CHAR:
			out << boost::any_cast<const std::string&>(value);
			break;
		case Vocabulary::TYPE_DATE_TIME:
		case Vocabulary::TYPE_DATE:
		case Vocabulary::TYPE_TIME:
			log_time_facet.write(out, boost::any_cast<const PionDateTime&>(value));
			break;
		case Vocabulary::TYPE_OBJECT:
			// do nothing; this is not supported for Log data streams
			break;
	}

	if (log_delim_end != '\0')
		out << log_delim_end;
}

inline void LogCodec::LogField::read(const char *buf, boost::any& value)
{
	switch(log_term.term_type) {
		case Vocabulary::TYPE_NULL:
			value = boost::any();
			break;
		case Vocabulary::TYPE_INT8:
		case Vocabulary::TYPE_INT16:
		case Vocabulary::TYPE_INT32:
			value = boost::lexical_cast<boost::int32_t>(buf);
			break;
		case Vocabulary::TYPE_INT64:
			value = boost::lexical_cast<boost::int64_t>(buf);
			break;
		case Vocabulary::TYPE_UINT8:
		case Vocabulary::TYPE_UINT16:
		case Vocabulary::TYPE_UINT32:
			value = boost::lexical_cast<boost::uint32_t>(buf);
			break;
		case Vocabulary::TYPE_UINT64:
			value = boost::lexical_cast<boost::uint64_t>(buf);
			break;
		case Vocabulary::TYPE_FLOAT:
			value = boost::lexical_cast<float>(buf);
			break;
		case Vocabulary::TYPE_DOUBLE:
			value = boost::lexical_cast<double>(buf);
			break;
		case Vocabulary::TYPE_LONG_DOUBLE:
			value = boost::lexical_cast<long double>(buf);
			break;
		case Vocabulary::TYPE_SHORT_STRING:
		case Vocabulary::TYPE_STRING:
		case Vocabulary::TYPE_LONG_STRING:
		case Vocabulary::TYPE_CHAR:
			value = std::string(buf);
			break;
		case Vocabulary::TYPE_DATE_TIME:
		case Vocabulary::TYPE_DATE:
		case Vocabulary::TYPE_TIME:
		{
			PionDateTime dt;
			log_time_facet.fromString(buf, dt);
			value = dt;
			break;
		}
		case Vocabulary::TYPE_OBJECT:
			// do nothing; this is not supported for Log data streams
			break;
	}
}
	
	
}	// end namespace platform
}	// end namespace pion

#endif
