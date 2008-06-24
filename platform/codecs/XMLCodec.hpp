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

#ifndef __PION_XMLCODEC_HEADER__
#define __PION_XMLCODEC_HEADER__

#include <vector>
#include <map>
#include <queue>
#include <pion/PionConfig.hpp>
#include <pion/platform/Codec.hpp>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// XMLCodec: used to encode and decode Events using XML
/// (Work in progress...)
///
class XMLCodec :
	public pion::platform::Codec
{
public:
	/// exception thrown if the Codec configuration includes an empty field name
	class EmptyFieldException : public PionException {
	public:
		EmptyFieldException(const std::string& codec_id)
			: PionException("XMLCodec configuration includes an empty field name: ", codec_id) {}
	};

	/// exception thrown if the Codec configuration does not define a term in a field mapping
	class EmptyTermException : public PionException {
	public:
		EmptyTermException(const std::string& codec_id)
			: PionException("XMLCodec configuration is missing a term identifier: ", codec_id) {}
	};


	/// constructs a new XMLCodec object
	XMLCodec(void) :
		pion::platform::Codec(),
		m_xml_reader(NULL),
		m_first_read_attempt(true)
	{}
	
	/// virtual destructor: this class is meant to be extended
	virtual ~XMLCodec() {
		if (m_xml_reader)
			xmlFreeTextReader(m_xml_reader);
	}
	
	/// returns an HTTP content type that is used by this Codec
	virtual const std::string& getContentType(void) const { return CONTENT_TYPE; }

	/**
	 * clones the codec, returning a pointer to the cloned copy
	 *
	 * @return CodecPtr pointer to the cloned copy of the codec
	 */
	virtual pion::platform::CodecPtr clone(void) const;

	/**
	 * writes an Event to an output stream
	 *
	 * @param out the output stream to which the Event will be written
	 * @param e the Event to write to the output stream
	 */
	virtual void write(std::ostream& out, const pion::platform::Event& e);

	/**
	 * writes the XML closing tag to an output stream
	 *
	 * @param out the output stream to which the tag will be written
	 */
	virtual void finish(std::ostream& out);

	/**
	 * reads an Event from an input stream
	 *
	 * @param in the input stream to read the Event from
	 * @param e the Event read, if any; null if error
	 * @return true if successful, false otherwise
	 */
	virtual bool read(std::istream& in, pion::platform::Event& e);

	/**
	 * sets configuration parameters for this Codec
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Codec
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);

	/**
	 * this updates the Vocabulary information used by this Codec; it should be
	 * called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Codec will use to describe Terms
	 */
	virtual void updateVocabulary(const pion::platform::Vocabulary& v);

	/// resets the configuration for this Codec
	inline void reset(void) {
		m_field_map.clear();
	}
	
	/// data type used to configure the formatting of Vocabulary Terms
	struct XMLField {
		XMLField(const std::string& f, const pion::platform::Vocabulary::Term& t)
			: field_name(f), term(t)
		{}

		/// the name of the field
		std::string							field_name;

		/// the Vocabulary Term that the data field represents
		pion::platform::Vocabulary::Term	term;

		/// used to encode and decode date_time fields
		PionTimeFacet						time_facet;
	};

	/// data type for a shared pointer to a XMLField object
	typedef boost::shared_ptr<XMLField>		XMLFieldPtr;

	/// data type that maps field names to Terms
	typedef PION_HASH_MAP<std::string,
		XMLFieldPtr,
		PION_HASH_STRING>					FieldMap;

	/// an ordered list of the fields in the current configuration
	typedef std::vector<XMLFieldPtr>		CurrentFormat;

private:

	/**
	 * maps a data field to a Vocabulary Term
	 *
	 * @param field the name of the data field
	 * @param term the Vocabulary Term to map the data field to
	 */
	inline void mapFieldToTerm(const std::string& field,
							   const pion::platform::Vocabulary::Term& term);


	/// content type used by this Codec
	static const std::string		CONTENT_TYPE;

	/// name of the field mapping element for Pion XML config files
	static const std::string		FIELD_ELEMENT_NAME;

	/// name of the Term ID attribute for Pion XML config files
	static const std::string		TERM_ATTRIBUTE_NAME;

	/// name of an XML element representing an Event
	static const std::string		EVENT_ELEMENT_NAME;


	/// used to configure which fields map to Vocabulary Terms (for reading)
	FieldMap						m_field_map;

	/// used to map TermRefs to XMLFieldPtrs
	std::map<pion::platform::Vocabulary::TermRef, XMLFieldPtr>
									m_XML_field_ptr_map;

	/// pointer to XML parser
    xmlTextReaderPtr				m_xml_reader;

	/// keeps track of whether a first Event has been read yet
	bool							m_first_read_attempt;
};


// inline member functions for XMLCodec

inline void XMLCodec::mapFieldToTerm(const std::string& field,
									  const pion::platform::Vocabulary::Term& term)
{
	if (m_field_map[field])
		throw PionException("Duplicate Field Name");

	// prepare a new XML field object
	XMLFieldPtr field_ptr(new XMLField(field, term));
	switch (term.term_type) {
		case pion::platform::Vocabulary::TYPE_DATE_TIME:
		case pion::platform::Vocabulary::TYPE_DATE:
		case pion::platform::Vocabulary::TYPE_TIME:
			field_ptr->time_facet.setFormat(term.term_format);
			break;
		default:
			break; // do nothing
	}

	// add it to the mapping of field names
	m_field_map[field] = field_ptr;
}

}	// end namespace plugins
}	// end namespace pion

#endif
