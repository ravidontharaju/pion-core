// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2011 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#include <pion/platform/VocabularyConfig.hpp>
#include <boost/lexical_cast.hpp>
#include <cstdlib>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of VocabularyConfig
	
const std::string			VocabularyConfig::DEFAULT_CONFIG_FILE = "vocabulary.xml";
const std::string			VocabularyConfig::VOCABULARY_ELEMENT_NAME = "Vocabulary";
const std::string			VocabularyConfig::LOCKED_ELEMENT_NAME = "Locked";
const std::string			VocabularyConfig::TERM_ELEMENT_NAME = "Term";
const std::string			VocabularyConfig::TYPE_ELEMENT_NAME = "Type";
const std::string			VocabularyConfig::SIZE_ATTRIBUTE_NAME = "size";
const std::string			VocabularyConfig::FORMAT_ATTRIBUTE_NAME = "format";
	
		
// VocabularyConfig member functions

VocabularyConfig::VocabularyConfig(void)
	: ConfigManager(DEFAULT_CONFIG_FILE),
	m_vocabulary_node(NULL), m_is_locked(false)
{
	setLogger(PION_GET_LOGGER("pion.platform.VocabularyConfig"));
}

void VocabularyConfig::createConfigFile(void)
{
	// just return if it's already open
	if (m_vocabulary_node != NULL)
		return;
	
	// create the file with "config" root element
	ConfigManager::createConfigFile();
	
	PION_LOG_INFO(m_logger, "Initializing new Vocabulary configuration file: " << m_config_file);

	// create a new vocabulary element
	m_vocabulary_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(VOCABULARY_ELEMENT_NAME.c_str()));
	if (m_vocabulary_node == NULL)
		throw InitializeConfigException(getConfigFile());
	if ((m_vocabulary_node=xmlAddChild(m_config_node_ptr,
									   m_vocabulary_node)) == NULL)
	{
		xmlFreeNode(m_vocabulary_node);
		throw InitializeConfigException(getConfigFile());
	}
	if (xmlNewProp(m_vocabulary_node,
				   reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
				   reinterpret_cast<const xmlChar*>(m_vocabulary_id.c_str())) == NULL)
		throw InitializeConfigException(getConfigFile());
	
	// create a name child element
	if (! m_name.empty()) {
		if (xmlNewTextChild(m_vocabulary_node, NULL,
							reinterpret_cast<const xmlChar*>(NAME_ELEMENT_NAME.c_str()),
							reinterpret_cast<const xmlChar*>(m_name.c_str())) == NULL)
			throw InitializeConfigException(getConfigFile());
	}
	
	// create a comment child element
	if (! m_comment.empty()) {
		if (xmlNewTextChild(m_vocabulary_node, NULL,
							reinterpret_cast<const xmlChar*>(COMMENT_ELEMENT_NAME.c_str()),
							reinterpret_cast<const xmlChar*>(m_comment.c_str())) == NULL)
			throw InitializeConfigException(getConfigFile());
	}
	
	// create a locked child element
	if (m_is_locked) {
		if (xmlNewTextChild(m_vocabulary_node, NULL,
							reinterpret_cast<const xmlChar*>(LOCKED_ELEMENT_NAME.c_str()),
							reinterpret_cast<const xmlChar*>("true")) == NULL)
			throw InitializeConfigException(getConfigFile());
	}

	// save the new XML config file
	saveConfigFile();
}

void VocabularyConfig::openConfigFile(void)
{
	// just return if it's already open
	if (m_vocabulary_node != NULL)
		return;
	
	// open the file and find the "config" root element
	ConfigManager::openConfigFile();

	// find the root "vocabulary" element
	m_vocabulary_node = findConfigNodeByName(VOCABULARY_ELEMENT_NAME,
											 m_config_node_ptr->children);
	if (m_vocabulary_node == NULL)
		throw MissingVocabularyException(getConfigFile());

	// get the unique identifier for the Vocabulary
	if (! getNodeId(m_vocabulary_node, m_vocabulary_id))
		throw EmptyVocabularyIdException(getConfigFile());
	
	// find the "name" element
	getConfigOption(NAME_ELEMENT_NAME, m_name, m_vocabulary_node->children);

	// find the "comment" element
	getConfigOption(COMMENT_ELEMENT_NAME, m_comment, m_vocabulary_node->children);
	
	// find the "locked" element
	m_is_locked = false;
	std::string locked_option;
	if (getConfigOption(LOCKED_ELEMENT_NAME, locked_option,
						m_vocabulary_node->children))
	{
		if (locked_option == "true")
			m_is_locked = true;
	}

	// load Vocabulary Terms
	for (xmlNodePtr cur_node = m_vocabulary_node->children;
		 cur_node != NULL; cur_node = cur_node->next)
	{
		if (cur_node->type == XML_ELEMENT_NODE
			&& xmlStrcmp(cur_node->name, reinterpret_cast<const xmlChar*>(TERM_ELEMENT_NAME.c_str()))==0)
		{
			// parse new term definition
			std::string new_term_id;
			if (! getNodeId(cur_node, new_term_id))
				throw Vocabulary::EmptyTermIdException();
			Vocabulary::Term new_term(new_term_id);
			parseTermConfig(new_term, cur_node->children);

			// add the new term (finished parsing basic config)
			m_vocabulary.addTerm(new_term);
			m_signal_add_term(new_term);
			PION_LOG_DEBUG(m_logger, "Added Vocabulary Term: " << new_term.term_id);
		}
	}
	
	PION_LOG_INFO(m_logger, "Loaded Vocabulary configuration file: " << m_config_file);
}

bool VocabularyConfig::addNewTermTypeConfig(xmlNodePtr term_node, const Vocabulary::Term& t)
{
	const std::string new_type_string(Vocabulary::getDataTypeAsString(t.term_type));
	xmlNodePtr new_type_node = xmlNewTextChild(term_node, NULL,
											   reinterpret_cast<const xmlChar*>(TYPE_ELEMENT_NAME.c_str()),
											   reinterpret_cast<const xmlChar*>(new_type_string.c_str()));
	if (new_type_node == NULL)
		return false;
	// set the size attribute of type if it is non-zero (or if type CHAR)
	if (t.term_size != 0 || t.term_type == Vocabulary::TYPE_CHAR) {
		std::string new_size_string(boost::lexical_cast<std::string>(t.term_size));
		if (t.term_size == 0 && t.term_type == Vocabulary::TYPE_CHAR)
			new_size_string = "1";
		if (xmlNewProp(new_type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(new_size_string.c_str())) == NULL)
			return false;
	}
	// set the format attribute if it is not empty
	if (! t.term_format.empty()) {
		if (xmlNewProp(new_type_node, reinterpret_cast<const xmlChar*>(FORMAT_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(t.term_format.c_str())) == NULL)
			return false;
	}
	return true;
}
	
void VocabularyConfig::setId(const std::string& new_id)
{
	m_vocabulary_id = new_id;
	
	// update config file only if it is open
	if (m_vocabulary_node != NULL) {
		if (xmlSetProp(m_vocabulary_node,
					   reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(new_id.c_str())) == NULL)
			throw UpdateVocabularyException(getConfigFile());
		// save the new XML config file
		saveConfigFile();
	}
}

void VocabularyConfig::setName(const std::string& new_name)
{
	// change descriptive name
	m_name = new_name;
	
	// update config file only if it is open
	if (m_vocabulary_node != NULL) {
		if (! updateConfigOption(NAME_ELEMENT_NAME, new_name, m_vocabulary_node))
			throw UpdateVocabularyException(getConfigFile());
		// save the new XML config file
		saveConfigFile();
	}
}

void VocabularyConfig::setComment(const std::string& new_comment)
{
	// change comment option
	m_comment = new_comment;
	
	// update config file only if it is open
	if (m_vocabulary_node != NULL) {
		if (! updateConfigOption(COMMENT_ELEMENT_NAME, new_comment, m_vocabulary_node))
			throw UpdateVocabularyException(getConfigFile());
		// save the new XML config file
		saveConfigFile();
	}
}
		
void VocabularyConfig::setLocked(bool b)
{
	// change locked setting
	m_is_locked = b;
	
	// update config file only if it is open
	if (m_vocabulary_node != NULL) {
		// note that setting the value to "" (empty) removes the node
		const std::string new_locked_value(m_is_locked ? "true" : "");
		if (! updateConfigOption(LOCKED_ELEMENT_NAME, new_locked_value, m_vocabulary_node))
			throw UpdateVocabularyException(getConfigFile());
		// save the new XML config file
		saveConfigFile();
	}
}

void VocabularyConfig::setConfig(const xmlNodePtr config_ptr)
{
	// get the "Name" value
	std::string new_name;
	ConfigManager::getConfigOption(NAME_ELEMENT_NAME, new_name, config_ptr);
	if (new_name != m_name)
		setName(new_name);

	// get the "Comment" value
	std::string new_comment;
	ConfigManager::getConfigOption(COMMENT_ELEMENT_NAME, new_comment, config_ptr);
	if (new_comment != m_comment)
		setComment(new_comment);

	// get the "Locked" value
	std::string new_locked_str;
	ConfigManager::getConfigOption(LOCKED_ELEMENT_NAME, new_locked_str, config_ptr);
	const bool new_locked = (new_locked_str == "true");
	if (new_locked != m_is_locked)
		setLocked(new_locked);
}

void VocabularyConfig::addTerm(const Vocabulary::Term& new_term)
{
	// make sure that the Vocabulary configuration file is open
	if (m_vocabulary_node == NULL)
		throw ConfigNotOpenException(getConfigFile());
	// make sure that the Vocabulary is not locked
	if (m_is_locked)
		throw VocabularyIsLockedException(getId());
		
	// add it to the memory structures
	m_vocabulary.addTerm(new_term);
	m_signal_add_term(new_term);
	
	// add it to the Vocabulary config file
	
	// create a new node for the term and add it to the XML config document
	xmlNodePtr new_term_node = xmlNewNode(NULL, reinterpret_cast<const xmlChar*>(TERM_ELEMENT_NAME.c_str()));
	if (new_term_node == NULL)
		throw AddTermConfigException(new_term.term_id);
	if ((new_term_node=xmlAddChild(m_vocabulary_node, new_term_node)) == NULL) {
		xmlFreeNode(new_term_node);
		throw AddTermConfigException(new_term.term_id);
	}

	// set the id attribute for the term element
	if (xmlNewProp(new_term_node, reinterpret_cast<const xmlChar*>(ID_ATTRIBUTE_NAME.c_str()),
				   reinterpret_cast<const xmlChar*>(new_term.term_id.c_str())) == NULL)
		throw AddTermConfigException(new_term.term_id);

	// add a type child element to the term 
	if (! addNewTermTypeConfig(new_term_node, new_term))
		throw AddTermConfigException(new_term.term_id);

	// add a comment child element to the term if it is not empty
	if (! new_term.term_comment.empty()) {
		if (xmlNewTextChild(new_term_node, NULL,
							reinterpret_cast<const xmlChar*>(COMMENT_ELEMENT_NAME.c_str()),
							reinterpret_cast<const xmlChar*>(new_term.term_comment.c_str())) == NULL)
			throw AddTermConfigException(new_term.term_id);
	}
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Added Vocabulary Term: " << new_term.term_id);
}

void VocabularyConfig::updateTerm(const Vocabulary::Term& t)
{
	// make sure that the Vocabulary configuration file is open
	if (m_vocabulary_node == NULL)
		throw ConfigNotOpenException(getConfigFile());
	// make sure that the Vocabulary is not locked
	if (m_is_locked)
		throw VocabularyIsLockedException(getId());
	
	// update the values in memory
	m_vocabulary.updateTerm(t);
	m_signal_update_term(t);

	// update it within the Vocabulary config file
	
	// find the term element in the XML config document
	xmlNodePtr term_node = findConfigNodeByAttr(TERM_ELEMENT_NAME,
												ID_ATTRIBUTE_NAME,
												t.term_id,
												m_vocabulary_node->children);
	if (term_node == NULL)
		throw UpdateTermConfigException(t.term_id);
	
	// find the existing "type" node (if any)
	xmlNodePtr type_node = findConfigNodeByName(TYPE_ELEMENT_NAME,
												term_node->children);
	if (type_node == NULL) {
		
		// no type node currently exists
		// add a new one, so long as the new type is not "NULL"
		if (t.term_type != Vocabulary::TYPE_NULL) {
			if (! addNewTermTypeConfig(term_node, t))
				throw UpdateTermConfigException(t.term_id);
		}
		
	} else {
		
		// look for the existing size attribute
		const std::string new_size_string(boost::lexical_cast<std::string>(t.term_size));
		xmlAttrPtr size_attr_ptr = xmlHasProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()));
		if (size_attr_ptr == NULL) {
			// no size attribute currently defined -> add a new one if size != 0
			if (t.term_size != 0) {
				if (xmlNewProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()),
							   reinterpret_cast<const xmlChar*>(new_size_string.c_str())) == NULL)
					throw UpdateTermConfigException(t.term_id);
			}
		} else if (t.term_size == 0) {
			// size is being changed to "0" -> remove the existing attribute
			xmlUnsetProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()));
		} else {
			// update the value of the existing size attribute
			xmlSetProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(new_size_string.c_str()));
		}

		// look for existing format attribute
		xmlAttrPtr format_attr_ptr = xmlHasProp(type_node, reinterpret_cast<const xmlChar*>(FORMAT_ATTRIBUTE_NAME.c_str()));
		if (format_attr_ptr == NULL) {
			// no format attribute currently defined -> add one if not empty
			if (! t.term_format.empty()) {
				if (xmlNewProp(type_node, reinterpret_cast<const xmlChar*>(FORMAT_ATTRIBUTE_NAME.c_str()),
							   reinterpret_cast<const xmlChar*>(t.term_format.c_str())) == NULL)
					throw UpdateTermConfigException(t.term_id);
			}
		} else if (t.term_format.empty()) {
			// format is being removed -> remove the existing attribute
			xmlUnsetProp(type_node, reinterpret_cast<const xmlChar*>(FORMAT_ATTRIBUTE_NAME.c_str()));
		} else {
			// update the value of the existing format attribute
			xmlSetProp(type_node, reinterpret_cast<const xmlChar*>(FORMAT_ATTRIBUTE_NAME.c_str()),
					   reinterpret_cast<const xmlChar*>(t.term_format.c_str()));
		}
			
		// update the content of the type attribute
		const std::string new_type_string(Vocabulary::getDataTypeAsString(t.term_type));
		xmlNodeSetContent(type_node, reinterpret_cast<const xmlChar*>(new_type_string.c_str()));
	}

	// find the existing "comment" node (if any)
	xmlNodePtr comment_node = findConfigNodeByName(COMMENT_ELEMENT_NAME,
												   term_node->children);
	if (comment_node == NULL) {
		// no comment node currently exists
		// add a new one, so long as the new comment is not empty
		if (! t.term_comment.empty()) {
			if (xmlNewTextChild(term_node, NULL,
								reinterpret_cast<const xmlChar*>(COMMENT_ELEMENT_NAME.c_str()),
								reinterpret_cast<const xmlChar*>(t.term_comment.c_str())) == NULL)
				throw UpdateTermConfigException(t.term_id);
		}
	} else {
		// change the value for the existing comment node
		xmlNodeSetContent(comment_node, reinterpret_cast<const xmlChar*>(xml_encode(t.term_comment).c_str()));
	}
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Updated Vocabulary Term: " << t.term_id);
}

void VocabularyConfig::removeTerm(const std::string& term_id)
{
	// make sure that the Vocabulary configuration file is open
	if (m_vocabulary_node == NULL)
		throw ConfigNotOpenException(getConfigFile());
	// make sure that the Vocabulary is not locked
	if (m_is_locked)
		throw VocabularyIsLockedException(getId());
	
	// remove the Term from our memory structures
	m_vocabulary.removeTerm(term_id);
	m_signal_remove_term(term_id);
	
	// remove it from the Vocabulary config file
	xmlNodePtr term_node = findConfigNodeByAttr(TERM_ELEMENT_NAME,
												ID_ATTRIBUTE_NAME,
												term_id,
												m_vocabulary_node->children);
	if (term_node == NULL)
		throw RemoveTermConfigException(term_id);
	xmlUnlinkNode(term_node);
	xmlFreeNode(term_node);
	
	// save the new XML config file
	saveConfigFile();
	
	PION_LOG_DEBUG(m_logger, "Removed Vocabulary Term: " << term_id);
}

void VocabularyConfig::writeTermConfigXML(std::ostream& out,
										  const Vocabulary::Term& t)
{
	// begin Term XML
	out << "\t<" << TERM_ELEMENT_NAME << ' ' << ID_ATTRIBUTE_NAME << "=\""
		<< t.term_id << "\">" << std::endl;

	// Type element
	out << "\t\t<" << TYPE_ELEMENT_NAME;
	if (t.term_type == Vocabulary::TYPE_CHAR)
		out << ' ' << SIZE_ATTRIBUTE_NAME << "=\"" << t.term_size << '\"';
	else if (! t.term_format.empty())
		out << ' ' << FORMAT_ATTRIBUTE_NAME << "=\"" << xml_encode(t.term_format) << '\"';
	out << '>' << Vocabulary::getDataTypeAsString(t.term_type)
		<< "</" << TYPE_ELEMENT_NAME << '>' << std::endl;
	
	// Comment element
	if (! t.term_comment.empty()) {
		out << "\t\t<" << COMMENT_ELEMENT_NAME << '>' << xml_encode(t.term_comment)
			<< "</" << COMMENT_ELEMENT_NAME << '>' << std::endl;
	}
	
	// end Term XML
	out << "\t</" << TERM_ELEMENT_NAME << '>' << std::endl;
}

void VocabularyConfig::parseTermConfig(Vocabulary::Term& new_term,
									   const xmlNodePtr config_ptr)
{
	xmlChar *xml_char_ptr;
	
	// find the existing "type" node (if any)
	xmlNodePtr type_node = findConfigNodeByName(TYPE_ELEMENT_NAME, config_ptr);
	if (type_node == NULL) {
		new_term.term_type = Vocabulary::TYPE_NULL;
	} else {
		// found a type node (if not found we can leave it as "NULL" (the default)
		xml_char_ptr = xmlNodeGetContent(type_node);
		if (xml_char_ptr == NULL || xml_char_ptr[0]=='\0') {
			if (xml_char_ptr != NULL)
				xmlFree(xml_char_ptr);
			throw EmptyTypeException(new_term.term_id);
		}
		
		// set the term's data type
		const std::string new_term_type(reinterpret_cast<char*>(xml_char_ptr));
		xmlFree(xml_char_ptr);
		new_term.term_type = Vocabulary::parseDataType(new_term_type);
		
		// check for "size" attribute only if type is "char"
		if (new_term.term_type == Vocabulary::TYPE_CHAR) {
			// use a default size of '1' for char data type
			new_term.term_size = 1;
			xml_char_ptr = xmlGetProp(type_node, reinterpret_cast<const xmlChar*>(SIZE_ATTRIBUTE_NAME.c_str()));
			if (xml_char_ptr != NULL) {
				if (xml_char_ptr[0] != '\0')
					new_term.term_size = strtoul(reinterpret_cast<char*>(xml_char_ptr), NULL, 10);
				// make sure it is not equal to 0 (change to 1 if it is)
				if (new_term.term_size == 0)
					new_term.term_size = 1;
				xmlFree(xml_char_ptr);
			}
		}
	}
	
	// check for "format" attribute
	xml_char_ptr = xmlGetProp(type_node, reinterpret_cast<const xmlChar*>(FORMAT_ATTRIBUTE_NAME.c_str()));
	if (xml_char_ptr != NULL) {
		new_term.term_format = reinterpret_cast<char*>(xml_char_ptr);
		xmlFree(xml_char_ptr);
	}				
	
	// find the existing "comment" node (if any)
	getConfigOption(COMMENT_ELEMENT_NAME, new_term.term_comment, config_ptr);
}

	
}	// end namespace platform
}	// end namespace pion
