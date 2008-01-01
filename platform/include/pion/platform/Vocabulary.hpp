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

#ifndef __PION_VOCABULARY_HEADER__
#define __PION_VOCABULARY_HEADER__

#include <string>
#include <list>
#include <boost/noncopyable.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionHashMap.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// Vocabulary: maps URI identifiers and numeric references to Term information
///
class PION_PLATFORM_API Vocabulary
	: private boost::noncopyable
{
public:

	/// data type for numeric term references
	typedef unsigned long		TermRef;
	
	/// null term reference constant (0)
	static const TermRef		UNDEFINED_TERM_REF;
	
	/// data type for a list of object members
	typedef std::list<TermRef>	OBJECT_MEMBER_LIST;

	/// data type for the type of data that a term represents
	enum DataType {
		TYPE_NULL = 0,			///< NULL or undefined type
		TYPE_INT8,				///< 8-bit, signed integer
		TYPE_UINT8,				///< 8-bit, unsigned integer
		TYPE_INT16,				///< 16-bit, signed integer
		TYPE_UINT16,			///< 16-bit, unsigned integer
		TYPE_INT32,				///< 32-bit, signed integer
		TYPE_UINT32,			///< 32-bit, unsigned integer
		TYPE_INT64,				///< 64-bit, signed integer
		TYPE_UINT64,			///< 64-bit, unsigned integer
		TYPE_FLOAT,				///< floating point number
		TYPE_DOUBLE,			///< large floating point number
		TYPE_LONG_DOUBLE,		///< very large floating point number
		TYPE_SHORT_STRING,		///< variable-length string up to 255 bytes
		TYPE_STRING,			///< variable-length string up to 65535 bytes
		TYPE_LONG_STRING,		///< variable-length string up to 2^32-1 bytes
		TYPE_DATE_TIME,			///< represents a specific date and time
		TYPE_CHAR,				///< fixed-length string of size term_size
		TYPE_ENUM,				///< enumeration; handled as a 255-byte string
		TYPE_OBJECT				///< object may contain other terms (boost::any)
	};
	
	/// data type for vocabulary terms
	struct Term {
		/// default constructor
		Term(const std::string uri)
			: term_id(uri), term_ref(UNDEFINED_TERM_REF),
			term_type(TYPE_NULL), term_size(0), term_num_parents(0)
			{}
		/// copy constructor
		Term(const Term& t)
			: term_id(t.term_id), term_ref(t.term_ref),
			term_comment(t.term_comment), term_type(t.term_type),
			term_size(t.term_size), term_num_parents(t.term_num_parents)
			{}
		/// URI used to uniquely identify the term
		const std::string		term_id;
		/// used to reference the term within this Vocabulary object
		TermRef					term_ref;
		/// descriptive comment for the term
		std::string				term_comment;
		/// type of data that the term represents
		DataType				term_type;
		/// maximum length if data type == TYPE_CHAR
		size_t					term_size;
		/// the number of "parent" object terms that this is currently a member of
		unsigned int			term_num_parents;
	};
	
	/// exception thrown if you try to add a term with an empty identifier
	class EmptyTermIdException : public std::exception {
	public:
		virtual const char* what() const throw() {
			return "Tried adding a vocabulary term with an empty identifier";
		}
	};
	
	/// exception thrown if you try opening the Vocabulary config file after Terms have been defined
	class UnknownDataTypeException : public PionException {
	public:
		UnknownDataTypeException(const std::string& data_type)
			: PionException("Could not parse unknown data type: ", data_type) {}
	};

	/// exception thrown if you try to add a duplicate Term
	class DuplicateTermException : public PionException {
	public:
		DuplicateTermException(const std::string& term_id)
			: PionException("Tried adding a duplicate term to the Vocabulary: ", term_id) {}
	};
	
	/// exception thrown if you try to add a duplicate member for an object Term
	class DuplicateMemberException : public PionException {
	public:
		DuplicateMemberException(const std::string& term_member_id)
			: PionException("Member is already part of the object Term: ", term_member_id) {}
	};
		
	/// exception thrown if you try to add a member to a Term that is not an object
	class NotObjectTermException : public PionException {
	public:
		NotObjectTermException(const std::string& term_id)
			: PionException("Unable to add member to a non-object Term: ", term_id) {}
	};
	
	/// exception thrown if there is a problem finding the Term to update
	class UpdateTermNotFoundException : public PionException {
	public:
		UpdateTermNotFoundException(const std::string& term_id)
			: PionException("Unable to find the Term to update: ", term_id) {}
	};
	
	/// exception thrown if there is a problem finding the Term to remove
	class RemoveTermNotFoundException : public PionException {
	public:
		RemoveTermNotFoundException(const std::string& term_id)
			: PionException("Unable to find the Vocabulary Term to remove: ", term_id) {}
	};
	
	/// exception thrown if you try to remove a Term that is a member of parent objects
	class RemoveTermHasParentsException : public PionException {
	public:
		RemoveTermHasParentsException(const std::string& term_id)
			: PionException("Unable to remove a Term that is a member of parent objects: ", term_id) {}
	};

	/// exception thrown if you try to add a member using an unrecognized Term Identifier
	class AddMemberNotFoundException : public PionException {
	public:
		AddMemberNotFoundException(const std::string& term_id)
			: PionException("Unable to find the Vocabulary Term while adding object member: ", term_id) {}
	};

	/// exception thrown if you try to remove a member using an unrecognized Term Identifier
	class RemoveMemberNotFoundException : public PionException {
	public:
		RemoveMemberNotFoundException(const std::string& term_id)
			: PionException("Unable to find the Vocabulary Term while removing object member: ", term_id) {}
	};
	
	
	/// constructs a new Vocabulary instance
	Vocabulary(void);
	
	/// public destructor: not virtual, should not be extended
	~Vocabulary();
		
	/// returns the number of Terms that are defined within the Vocabulary
	inline size_t size(void) const { return m_num_terms; }
	
	
	/**
	 * returns a reference to the definition for a particular Term
	 * 
	 * @param term_ref reference number assigned to the Term
	 * @return const Term& reference to the Term's definition
	 */
	inline const Term& operator[](const TermRef& term_ref) const {
		boost::mutex::scoped_lock vocabulary_lock(m_mutex);
		PION_ASSERT(term_ref <= m_num_terms);
		return *(m_ref_map[term_ref]);
	}
	
	/**
	 * returns the numeric Term identifier for a Term
	 * 
	 * @param term_id unique identifier for the Term
	 * @return const TermRef& the numeric reference assigned to the Term
	 */
	inline TermRef findTerm(const std::string& term_id) const {
		TermRef term_ref = UNDEFINED_TERM_REF;
		boost::mutex::scoped_lock vocabulary_lock(m_mutex);
		TermStringMap::const_iterator i = m_uri_map.find(term_id);
		if (i != m_uri_map.end())
			term_ref = i->second->term_ref;
		return term_ref;
	}

	/**
	 * returns a list of Term identifiers that are members of an OBJECT Term
	 * 
	 * @param object_term_ref reference number assigned to the OBJECT term
	 * @return OBJECT_MEMBER_LIST list of Term identifiers that are members
	 */
	inline OBJECT_MEMBER_LIST getObjectMembers(const TermRef& object_term_ref) const {
		boost::mutex::scoped_lock vocabulary_lock(m_mutex);
		PION_ASSERT(object_term_ref <= m_num_terms);
		return m_object_members[object_term_ref];
	}
	
	/**
	 * adds a new Term if it has not yet been defined
	 *
	 * @param t the Term to identify or define
	 * @return const TermRef& the reference number assigned to the new Term
	 */
	TermRef addTerm(const Term& t);
	
	/**
	 * update the settings for a Term
	 *
	 * @param t the Term to update (t.term_id is used to find the Term to change)
	 */
	void updateTerm(const Term& t);

	/**
	 * removes a Term from the Vocabulary (use with caution!!!)
	 *
	 * @param term_id unique identifier for the Term to remove
	 */
	void removeTerm(const std::string& term_id);
	
	/**
	 * adds a Term as a member of an OBJECT Term
	 * 
	 * @param object_term_id unique identifier for the OBJECT term
	 * @param member_term_id unique identifier for the member Term to add
	 */
	void addObjectMember(const std::string& object_term_id,
						 const std::string& member_term_id);
	
	/**
	 * removes a member Term from an OBJECT Term
	 * 
	 * @param object_term_id unique identifier for the OBJECT term
	 * @param member_term_id unique identifier for the member Term to remove
	 */
	void removeObjectMember(const std::string& object_term_id,
							const std::string& member_term_id);
	
	/**
	 * Incorporates all the data from another Vocabulary into this one
	 *
	 * @param v the Vocabulary object copy data from
	 *
	 * @return const Vocabulary& reference to this Vocabulary object
	 */
	const Vocabulary& operator+=(const Vocabulary& v);
	
	/**
	 * parses data type from a string
	 *
	 * @param str the string to parse
	 * @return DataType the type matching the parsed string
	 */
	static DataType parseDataType(std::string str);
	
	/**
	 * returns a string that represents a particular data type
	 *
	 * @param type the data type to get a string for
	 * @return std::string a temporary string object that represents the data type
	 */
	static std::string getDataTypeAsString(const DataType type);
	
	
private:

	/**
	 * adds a new Term if it has not yet been defined (without locking)
	 *
	 * @param t the Term to identify or define
	 * @return const TermRef& the reference number assigned to the new Term
	 */
	TermRef addTermNoLock(const Term& t);
	

	/// data type that maps strings to Term definition objects
	typedef PION_HASH_MAP<std::string, Term*, PION_HASH_STRING >	TermStringMap;
	
	/// data type that maps Term reference numbers to Term definition objects
	typedef std::vector<Term*>					TermRefMap;
	
	/// data type that maps Term reference numbers to object members
	typedef std::vector<OBJECT_MEMBER_LIST>		ObjectMembersMap;
	
	
	/// used to map Term reference numbers to Term definition objects
	TermRefMap						m_ref_map;

	/// used to map URI Term identifiers to Term definition objects
	TermStringMap					m_uri_map;
	
	/// used to track the members of Terms that are OBJECT types
	ObjectMembersMap				m_object_members;
	
	/// number of Terms that are defined within the Vocabulary
	TermRef							m_num_terms;

	/// mutex to make class thread-safe
	mutable boost::mutex			m_mutex;	
};


}	// end namespace platform
}	// end namespace pion

#endif
