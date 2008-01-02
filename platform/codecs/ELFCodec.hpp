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

#ifndef __PION_ELFCODEC_HEADER__
#define __PION_ELFCODEC_HEADER__

#include <vector>
#include <boost/bind.hpp>
#include <boost/shared_ptr.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionHashMap.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// ELFCodec: used to encode and decode Events using Extended Log Format (ELF)
///
class ELFCodec :
	public Codec
{
public:

	/// exception thrown if there is an unknown field name used in a format
	class UnknownFieldInFormat : public PionException {
	public:
		UnknownFieldInFormat(const std::string& field)
			: PionException("Unknown field in ELFCodec format: ", field) {}
	};

	/// data type that describes the sequence of data fields in the log format
	typedef std::vector<std::string>	FieldFormat;
	

	/// constructs a new ELFCodec object
	ELFCodec(void) : Codec() {}

	/// virtual destructor: this class is meant to be extended
	virtual ~ELFCodec() {}
	
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
	 * reads an Event from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @return EventPtr& pointer to the event read, if any; null if error
	 */
	virtual EventPtr read(std::istream& in);
	
	/**
	 * this updates the Vocabulary information used by this Codec; it should be
	 * called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 */
	virtual void updateVocabulary(const Vocabulary& v);

	
	/**
	 * maps a data field to a Vocabulary Term
	 *
	 * @param field the name of the data field
	 * @param term the Vocabulary Term to map the data field to
	 * @param delim_start character used to deliminate the start of the data field value
	 * @param delim_end character used to deliminate the end of the data field value
	 */
	inline void mapFieldToTerm(const std::string& field,
							   const Vocabulary::Term& term,
							   char delim_start, char delim_end)
	{
		m_field_map[field].reset(new LogField(field, term, delim_start, delim_end));
		m_ref_map[term.term_ref] = m_field_map[field];
	}

	/// sets the format of data fields used by this Codec
	inline void setFieldFormat(const FieldFormat& format) {
		m_default_format = format;
		m_format.clear();
		std::for_each(format.begin(), format.end(),
					  boost::bind(&ELFCodec::appendToFormat, this, _1));
	}
	
	/// resets the configuration for this Codec
	inline void reset(void) {
		m_field_map.clear();
		m_ref_map.clear();
		m_format.clear();
		m_default_format.clear();
	}
	
	
private:
	
	/**
	 * appends a field to the current format
	 *
	 * @param field the name of the field to append
	 */
	inline void appendToFormat(const std::string& field) {
		FieldMap::iterator i = m_field_map.find(field);
		if (i == m_field_map.end())
			throw UnknownFieldInFormat(field);
		m_format.push_back(i->second);
	}

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
		/// the name of the field
		std::string			log_field;
		/// the Vocabulary Term that the data field represents
		Vocabulary::Term	log_term;
		/// a character that deliminates the beginning of the field value, or '\0' if none
		char				log_delim_start;
		/// a character that deliminates the end of the field value, or '\0' if none
		char				log_delim_end;
	};
	
	/// data type that maps field names to LogFields
	typedef PION_HASH_MAP<std::string, boost::shared_ptr<LogField>, PION_HASH_STRING >	FieldMap;

	/// data type that maps Term reference values to LogFields
	typedef PION_HASH_MAP<Vocabulary::TermRef, boost::shared_ptr<LogField> >	TermRefMap;
	
	/// data type that keeps track of the log file's current field format
	typedef std::vector<boost::shared_ptr<LogField> >	CurrentFormat;

	
	/// content type used by this Codec
	static const std::string		CONTENT_TYPE;
	
	/// used to configure which fields map to Vocabulary Terms (for reading)
	FieldMap						m_field_map;
	
	/// maps Vocabulary Term references to LogFields (for writing)
	TermRefMap						m_ref_map;
	
	/// represents the current sequence of data fields in the log format
	CurrentFormat					m_format;

	/// configured to represent the default sequence of data fields in the log format
	FieldFormat						m_default_format;
};


}	// end namespace platform
}	// end namespace pion

#endif
