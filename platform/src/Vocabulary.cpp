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

#include <boost/lexical_cast.hpp>
#include <pion/platform/Vocabulary.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of Vocabulary
const Vocabulary::TermRef	Vocabulary::UNDEFINED_TERM_REF = 0;
	
		
// Vocabulary member functions

Vocabulary::Vocabulary(void)
	: m_num_terms(0)
{
	// add an initial "null" term to the vocabulary
	m_ref_map.push_back(TermPtr(new Term()));
}

Vocabulary::Vocabulary(const Vocabulary& v)
	: m_num_terms(0)
{
	// add an initial "null" term to the vocabulary
	m_ref_map.push_back(TermPtr(new Term()));

	// copy over all terms
	operator+=(v);
}

Vocabulary::TermRef Vocabulary::addTerm(const Term& t)
{
	// make sure that the uri is not empty
	if (t.term_id.empty()) throw EmptyTermIdException();
	
	// make sure the Term does not already exist
	if (m_uri_map.find(t.term_id) != m_uri_map.end())
		throw DuplicateTermException(t.term_id);
	
	// create a new Term
	TermPtr term_ptr(new Term(t.term_id));
	term_ptr->term_ref = ++m_num_terms;
	term_ptr->term_type = t.term_type;
	term_ptr->term_comment = t.term_comment;
	// use a default size of '1' for char data type
	if (t.term_type == TYPE_CHAR && t.term_size == 0)
		term_ptr->term_size = 1;
	else
		term_ptr->term_size = t.term_size;
	term_ptr->term_format = t.term_format;
	
	// add it to the memory structures
	m_ref_map.push_back(term_ptr);
	m_uri_map.insert(std::make_pair(term_ptr->term_id, term_ptr));
	
	// return the new numeric identifier
	return term_ptr->term_ref;
}

void Vocabulary::removeTerm(const std::string& term_id)
{
	// make sure the term_id is not empty
	if (term_id.empty())
		throw TermNotFoundException(term_id);
	
	// find the Term to remove
	TermStringMap::iterator uri_iterator = m_uri_map.find(term_id);
	if (uri_iterator == m_uri_map.end())
		throw TermNotFoundException(term_id);

	// change the TermRef so it doesn't get copied into other vocabularies
	uri_iterator->second->term_ref = UNDEFINED_TERM_REF;
	
	// remove the Term from the URI map
	m_uri_map.erase(uri_iterator);
	
	// leave the TermRef reference in-tact for any existing events
}

void Vocabulary::updateTerm(const Term& t)
{
	// make sure the term_id is not empty
	if (t.term_id.empty())
		throw TermNotFoundException(t.term_id);

	// find the Term to update
	TermStringMap::const_iterator uri_iterator = m_uri_map.find(t.term_id);
	if (uri_iterator == m_uri_map.end())
		throw TermNotFoundException(t.term_id);
	Term& term_ref = *(uri_iterator->second);
	
	if (term_ref.term_type == t.term_type) {
		// same data type:
		// ok to just update the values in memory
		// since existing events should still be valid
		term_ref.term_comment = t.term_comment;
		term_ref.term_size = t.term_size;
		term_ref.term_format = t.term_format;
	} else {
		// don't change existing term so that existing events
		// with references always stay in-tact

		// remove the Term from the URI map
		m_uri_map.erase(uri_iterator);

		// add a new Term
		addTerm(t);
	}
}
	
void Vocabulary::refreshTerm(Term& t) const
{
	// find Term in updated Vocabulary
	TermRef term_ref = findTerm(t.term_id);

	// check if the Term has been removed
	if (term_ref == UNDEFINED_TERM_REF)
		throw TermNoLongerDefinedException(t.term_id);

	// refresh term values
	t = *m_ref_map[term_ref];
}

const Vocabulary& Vocabulary::operator+=(const Vocabulary& v)
{
	// copy over term object pointers
	for (TermRef n = 1; n <= v.m_num_terms; ++n) {
		if (v.m_ref_map[n]->term_ref != UNDEFINED_TERM_REF) {
			try { addTerm(*(v.m_ref_map[n])); }
			catch (...) {}
		}
	}
	return *this;
}
	
Vocabulary::DataType Vocabulary::parseDataType(std::string str)
{
	// convert to lowercase
	for (std::string::iterator i=str.begin(); i!=str.end(); ++i)
		if (isupper(*i)) *i = tolower(*i);
	
	// parse str
	if (str=="null")
		return TYPE_NULL;
	else if (str == "int8") 
		return TYPE_INT8;
	else if (str == "uint8") 
		return TYPE_UINT8;
	else if (str == "int16") 
		return TYPE_INT16;
	else if (str == "uint16") 
		return TYPE_UINT16;
	else if (str == "int32") 
		return TYPE_INT32;
	else if (str == "uint32") 
		return TYPE_UINT32;
	else if (str == "int64") 
		return TYPE_INT64;
	else if (str == "uint64") 
		return TYPE_UINT64;
	else if (str == "float") 
		return TYPE_FLOAT;
	else if (str == "double") 
		return TYPE_DOUBLE;
	else if (str == "longdouble") 
		return TYPE_LONG_DOUBLE;
	else if (str == "shortstring") 
		return TYPE_SHORT_STRING;
	else if (str == "string") 
		return TYPE_STRING;
	else if (str == "longstring") 
		return TYPE_LONG_STRING;
	else if (str == "datetime") 
		return TYPE_DATE_TIME;
	else if (str == "date") 
		return TYPE_DATE;
	else if (str == "time") 
		return TYPE_TIME;
	else if (str == "char") 
		return TYPE_CHAR;
	else if (str == "blob")
		return TYPE_BLOB;
	else if (str == "zblob")
		return TYPE_ZBLOB;
	else if (str == "object") 
		return TYPE_OBJECT;
	
	throw UnknownDataTypeException(str);
}
	
std::string Vocabulary::getDataTypeAsString(const DataType data_type)
{
	std::string str;
	switch(data_type) {
		case TYPE_NULL:
			str = "null";
			break;
		case TYPE_INT8:
			str = "int8";
			break;
		case TYPE_UINT8:
			str = "uint8";
			break;
		case TYPE_INT16:
			str = "int16";
			break;
		case TYPE_UINT16:
			str = "uint16";
			break;
		case TYPE_INT32:
			str = "int32";
			break;
		case TYPE_UINT32:
			str = "uint32";
			break;
		case TYPE_INT64:
			str = "int64";
			break;
		case TYPE_UINT64:
			str = "uint64";
			break;
		case TYPE_FLOAT:
			str = "float";
			break;
		case TYPE_DOUBLE:
			str = "double";
			break;
		case TYPE_LONG_DOUBLE:
			str = "longdouble";
			break;
		case TYPE_SHORT_STRING:
			str = "shortstring";
			break;
		case TYPE_STRING:
			str = "string";
			break;
		case TYPE_LONG_STRING:
			str = "longstring";
			break;
		case TYPE_DATE_TIME:
			str = "datetime";
			break;
		case TYPE_DATE:
			str = "date";
			break;
		case TYPE_TIME:
			str = "time";
			break;
		case TYPE_CHAR:
			str = "char";
			break;
		case TYPE_BLOB:
			str = "blob";
			break;
		case TYPE_ZBLOB:
			str = "zblob";
			break;
		case TYPE_OBJECT:
			str = "object";
			break;
	}
	return str;
}
	
	
}	// end namespace platform
}	// end namespace pion
