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

#ifndef __PION_VOCABULARYMANAGER_HEADER__
#define __PION_VOCABULARYMANAGER_HEADER__

#include <string>
#include <boost/bind.hpp>
#include <boost/signal.hpp>
#include <boost/noncopyable.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/PionHashMap.hpp>
#include <pion/platform/VocabularyConfig.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


///
/// VocabularyManager: maps URI identifiers to VocabularyConfig objects
///
class PION_PLATFORM_API VocabularyManager
	: private boost::noncopyable
{
public:
	
	/// exception thrown if you try loading a duplicate Vocabulary
	class DuplicateVocabularyException : public PionException {
	public:
		DuplicateVocabularyException(const std::string& vocab_id)
			: PionException("Vocabulary has already been loaded: ", vocab_id) {}
	};

	/// exception thrown if you try referencing an unknown Vocabulary
	class VocabularyNotFoundException : public PionException {
	public:
		VocabularyNotFoundException(const std::string& vocab_id)
			: PionException("Vocabulary has not beed defined: ", vocab_id) {}
	};

	
	/// constructs a new VocabularyManager instance
	VocabularyManager(void) {}
	
	/// public destructor: not virtual, should not be extended
	~VocabularyManager() {}
	

	/**
	 * loads a new Vocabulary configuration file
	 *
	 * @param file_name the name of the XML configuration file to load
	 */
	inline void loadConfigFile(const std::string& file_name) {
		// open and parse the Vocabulary configuration file
		VocabularyConfigPtr new_config(new VocabularyConfig());
		new_config->setConfigFile(file_name);
		new_config->openConfigFile();
		const std::string new_vocab_id(new_config->getId());
		
		// make sure it has not already been loaded
		boost::mutex::scoped_lock manager_lock(m_mutex);
		if (m_vocab_map.find(new_vocab_id) != m_vocab_map.end())
			throw DuplicateVocabularyException(new_vocab_id);
		
		// it's new; add it to the vocabulary map and bind it
		m_vocab_map.insert(std::make_pair(new_vocab_id, new_config));
		new_config->bind(m_vocabulary);
		
		// notify everyone that the vocabulary was updated
		m_signal_vocabulary_updated();
	}
	
	/**
	 * changes the URI used to uniquely identify a Vocabulary
	 *
	 * @param old_id the current unique identifier for the Vocabulary
	 * @param new_id the new unique identifier to assign to the Vocabulary
	 */
	inline void setId(const std::string& old_id, const std::string& new_id) {
		updateVocabulary(old_id, boost::bind(&VocabularyConfig::setId, _1,
											 boost::cref(new_id)));
	}
	
	/**
	 * changes the default namespace assigned to a Vocabulary
	 *
	 * @param vocab_id the unique identifier for the Vocabulary to modify
	 * @param new_namespace the new namespace to assign to the Vocabulary
	 */
	inline void setNamespace(const std::string& vocab_id,
							 const std::string& new_namespace)
	{
		updateVocabulary(vocab_id, boost::bind(&VocabularyConfig::setNamespace,
											   _1, boost::cref(new_namespace)));
	}
	
	/**
	 * changes the comment that describes a Vocabulary
	 *
	 * @param vocab_id the unique identifier for the Vocabulary to modify
	 * @param new_comment the new comment to assign to the Vocabulary
	 */
	inline void setComment(const std::string& vocab_id,
						   const std::string& new_comment)
	{
		updateVocabulary(vocab_id, boost::bind(&VocabularyConfig::setComment,
											   _1, boost::cref(new_comment)));
	}
	
	/**
	 * adds a new Term to a Vocabulary
	 *
	 * @param vocab_id the unique identifier for the Vocabulary to modify
	 * @param new_term the new Term to define
	 */
	inline void addTerm(const std::string& vocab_id,
						const Vocabulary::Term& new_term)
	{
		updateVocabulary(vocab_id, boost::bind(&VocabularyConfig::addTerm,
											   _1, boost::cref(new_term)));
	}
	
	/**
	 * update the settings for a Term
	 *
	 * @param vocab_id the unique identifier for the Vocabulary to modify
	 * @param t the Term to update (t.term_id is used to find the Term to change)
	 */
	inline void updateTerm(const std::string& vocab_id,
						   const Vocabulary::Term& t)
	{
		updateVocabulary(vocab_id, boost::bind(&VocabularyConfig::updateTerm,
											   _1, boost::cref(t)));
	}
	
	/**
	 * removes a Term from the Vocabulary (use with caution!!!)
	 *
	 * @param vocab_id the unique identifier for the Vocabulary to modify
	 * @param term_id unique identifier for the Term to remove
	 */
	inline void removeTerm(const std::string& vocab_id,
						   const std::string& term_id)
	{
		updateVocabulary(vocab_id, boost::bind(&VocabularyConfig::removeTerm,
											   _1, boost::cref(term_id)));
	}
	
	/**
	 * adds a Term as a member of an OBJECT Term
	 * 
	 * @param vocab_id the unique identifier for the Vocabulary to modify
	 * @param object_term_id unique identifier for the OBJECT term
	 * @param member_term_id unique identifier for the member Term to add
	 */
	inline void addObjectMember(const std::string& vocab_id, 
								const std::string& object_term_id,
								const std::string& member_term_id)
	{
		updateVocabulary(vocab_id, boost::bind(&VocabularyConfig::addObjectMember,
											   _1, boost::cref(object_term_id),
											   boost::cref(member_term_id)));
	}
	
	/**
	 * removes a member Term from an OBJECT Term
	 * 
	 * @param vocab_id the unique identifier for the Vocabulary to modify
	 * @param object_term_id unique identifier for the OBJECT term
	 * @param member_term_id unique identifier for the member Term to remove
	 */
	inline void removeObjectMember(const std::string& vocab_id, 
								   const std::string& object_term_id,
								   const std::string& member_term_id)
	{
		updateVocabulary(vocab_id, boost::bind(&VocabularyConfig::removeObjectMember,
											   _1, boost::cref(object_term_id),
											   boost::cref(member_term_id)));
	}
	
	/**
	 * registers a callback function to be executed whenever a Vocabulary is updated
	 *
	 * @param f the callback function to register
	 */
	template <typename VocabularyUpdateFunction>
	inline void registerForUpdates(VocabularyUpdateFunction f) const {
		boost::mutex::scoped_lock manager_lock(m_mutex);
		m_signal_vocabulary_updated.connect(f);
	}
	
	/**
	 * returns the default namespace assigned to a Vocabulary
	 * 
	 * @param vocab_id the unique identifier for the Vocabulary to search for
	 * @return const std::string& the namespace assigned to the Vocabulary
	 */
	inline const std::string& getNamespace(const std::string& vocab_id) const {
		VocabularyMap::const_iterator i = m_vocab_map.find(vocab_id);
		if (i == m_vocab_map.end())
			throw VocabularyNotFoundException(vocab_id);
		return i->second->getNamespace();
	}

	/**
	 * returns the descriptive comment assigned to a Vocabulary
	 * 
	 * @param vocab_id the unique identifier for the Vocabulary to search for
	 * @return const std::string& the comment assigned to the Vocabulary
	 */
	inline const std::string& getComment(const std::string& vocab_id) const {
		VocabularyMap::const_iterator i = m_vocab_map.find(vocab_id);
		if (i == m_vocab_map.end())
			throw VocabularyNotFoundException(vocab_id);
		return i->second->getComment();
	}

	/// returns a const reference to the universal Vocabulary
	inline const Vocabulary& getVocabulary(void) const { return m_vocabulary; }


private:

	/**
	 * updates a Vocabulary by calling a an update function for the
	 * VocabularyConfig object.  The function should return void and take
	 * a Vocabulary* as its first and only parameter.
	 * 
	 * @param vocab_id the unique identifier for the Vocabulary to modify
	 * @param f the Vocabulary update function to run (after it is found)
	 */
	template <typename Function>
	inline void updateVocabulary(const std::string& vocab_id, Function f) {
		boost::mutex::scoped_lock manager_lock(m_mutex);
		VocabularyMap::iterator i = m_vocab_map.find(vocab_id);
		if (i == m_vocab_map.end())
			throw VocabularyNotFoundException(vocab_id);
		f(i->second);
		m_signal_vocabulary_updated();
	}
	
	
	/// data type for a pointer to a VocabularyConfig object
	typedef boost::shared_ptr<VocabularyConfig>		VocabularyConfigPtr;
	
	/// data type that maps strings to Term definition objects
	typedef PION_HASH_MAP<std::string, VocabularyConfigPtr, PION_HASH_STRING >	VocabularyMap;
	
	
	/// used to map Term reference numbers to Term definition objects
	VocabularyMap						m_vocab_map;
	
	/// this includes a union of all Vocabularies that have been loaded
	Vocabulary							m_vocabulary;

	/// signal triggered whenever a Vocabulary is modified
	mutable boost::signal0<void>		m_signal_vocabulary_updated;

	/// mutex to make class thread-safe
	mutable boost::mutex				m_mutex;	
};


}	// end namespace platform
}	// end namespace pion

#endif
