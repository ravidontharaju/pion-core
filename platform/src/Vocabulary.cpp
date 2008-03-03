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
	m_ref_map.push_back(new Term(""));
}

Vocabulary::~Vocabulary()
{
	// delete all Term objects held within the class' data structures
	for (size_t n = 1; n <= m_num_terms; ++n) {
		if (m_ref_map[n] != m_ref_map[UNDEFINED_TERM_REF])
			delete m_ref_map[n];
	}
	delete m_ref_map[UNDEFINED_TERM_REF];
}

Vocabulary::TermRef Vocabulary::addTermNoLock(const Term& t)
{
	// make sure that the uri is not empty
	if (t.term_id.empty()) throw EmptyTermIdException();
	
	// make sure the Term does not already exist
	if (m_uri_map.find(t.term_id) != m_uri_map.end())
		throw DuplicateTermException(t.term_id);
	
	// create a new Term
	Term *term_ptr = new Term(t.term_id);
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

Vocabulary::TermRef Vocabulary::addTerm(const Term& t)
{
	boost::mutex::scoped_lock vocabulary_lock(m_mutex);
	return addTermNoLock(t);
}

void Vocabulary::updateTerm(const Term& t)
{
	// make sure the term_id is not empty
	if (t.term_id.empty())
		throw TermNotFoundException(t.term_id);

	// find the Term to update
	boost::mutex::scoped_lock vocabulary_lock(m_mutex);
	TermStringMap::const_iterator i = m_uri_map.find(t.term_id);
	if (i == m_uri_map.end())
		throw TermNotFoundException(t.term_id);
	Term *term_ptr = i->second;
	
	// update the values in memory
	term_ptr->term_comment = t.term_comment;
	term_ptr->term_type = t.term_type;
	term_ptr->term_size = t.term_size;
	term_ptr->term_format = t.term_format;
}
	
void Vocabulary::removeTerm(const std::string& term_id)
{
	// make sure the term_id is not empty
	if (term_id.empty())
		throw TermNotFoundException(term_id);
	
	// find the Term to remove
	boost::mutex::scoped_lock vocabulary_lock(m_mutex);
	TermStringMap::iterator uri_iterator = m_uri_map.find(term_id);
	if (uri_iterator == m_uri_map.end())
		throw TermNotFoundException(term_id);
	Term *term_ptr = uri_iterator->second;
	
	// remove the Term from the URI map
	m_uri_map.erase(uri_iterator);
	
	// remove the Term's object and point it to the undefined term
	m_ref_map[term_ptr->term_ref] = m_ref_map[UNDEFINED_TERM_REF];
	delete term_ptr;
}

const Vocabulary& Vocabulary::operator+=(const Vocabulary& v)
{
	// lock both vocabularies
	boost::mutex::scoped_lock local_lock(m_mutex);
	boost::mutex::scoped_lock remote_lock(v.m_mutex);

	// copy over term object pointers
	for (TermRef n = 1; n <= v.m_num_terms; ++n) {
		if (v.m_ref_map[n] != v.m_ref_map[UNDEFINED_TERM_REF]) {
			addTermNoLock(*(v.m_ref_map[n]));
		}
	}
	local_lock.unlock();
	remote_lock.unlock();
	
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
		case TYPE_OBJECT:
			str = "object";
			break;
	}
	return str;
}
	
	
}	// end namespace platform
}	// end namespace pion
