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
	 * returns a reference to a VocabularyConfig object (for config changes only)
	 * 
	 * @param vocab_id the unique Vocabulary identifier to search for
	 * @return VocabularyConfig& reference to the VocabularyConfig object
	 */
	inline VocabularyConfig& getConfig(const std::string& vocab_id) {
		boost::mutex::scoped_lock vocabulary_lock(m_mutex);
		VocabularyMap::const_iterator i = m_vocab_map.find(vocab_id);
		if (i == m_vocab_map.end())
			throw VocabularyNotFoundException(vocab_id);
		return *(i->second);
	}

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
		boost::mutex::scoped_lock vocabulary_lock(m_mutex);
		if (m_vocab_map.find(new_vocab_id) != m_vocab_map.end())
			throw DuplicateVocabularyException(new_vocab_id);
		
		// it's new; add it to the vocabulary map and bind it
		m_vocab_map.insert(std::make_pair(new_vocab_id, new_config));
		new_config->bind(m_vocabulary);
	}

	/// returns a const reference to the universal Vocabulary
	inline const Vocabulary& getVocabulary(void) const { return m_vocabulary; }


private:

	/// data type for a pointer to a VocabularyConfig object
	typedef boost::shared_ptr<VocabularyConfig>		VocabularyConfigPtr;
	
	/// data type that maps strings to Term definition objects
	typedef PION_HASH_MAP<std::string, VocabularyConfigPtr, PION_HASH_STRING >	VocabularyMap;
	
	
	/// used to map Term reference numbers to Term definition objects
	VocabularyMap					m_vocab_map;
	
	/// this includes a union of all Vocabularies that have been loaded
	Vocabulary						m_vocabulary;

	/// mutex to make class thread-safe
	mutable boost::mutex			m_mutex;	
};


}	// end namespace platform
}	// end namespace pion

#endif
