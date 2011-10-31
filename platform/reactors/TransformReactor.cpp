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

#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include "TransformReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of TransformReactor

const std::string			TransformReactor::OUTGOING_EVENT_ELEMENT_NAME = "OutgoingEvent";
const std::string			TransformReactor::DELIVER_ORIGINAL_NAME = "DeliverOriginal";
const std::string			TransformReactor::COPY_ORIGINAL_ELEMENT_NAME = "CopyOriginal";
const std::string			TransformReactor::TRANSFORMATION_ELEMENT_NAME = "Transformation";
const std::string			TransformReactor::TERM_ELEMENT_NAME = "Term";
const std::string			TransformReactor::TYPE_ELEMENT_NAME = "Type";


/*
 *  This is the spec, using annotated XML

<TransformReactor>
	<OutgoingEvent>obj-term</OutgoingEvent>
	<CopyOriginal>all-terms|if-not-defined|none</CopyOriginal>			-> DEFAULT: if-not-defined
	<DeliverOriginal>always|if-not-changed|never</DeliveryOriginal>		-> DEFAULT: never
[rpt]	<Transformation>
			<Term>dst-term</Term>
			<Type>AssignValue|AssignTerm|Lookup|Rules|Regex</Type>
			[see TransformReactor/Transformations/Type]
[/rpt]	</Transformation>
</TransformReactor>

TransformReactor/Transformations/Type = AssignValue
			<Type>AssignValue</Type>
			<Value>escape(value)</Value>

TransformReactor/Transformations/Type = AssignTerm
			<Type>AssignTerm</Type>
			<Value>src-term</Value>

TransformReactor/Transformations/Type = Lookup
			<Type>Lookup</Type>
			<LookupTerm>src-term</LookupTerm>
[opt]		<Match>escape(regexp)</Match>
[opt]		<Format>escape(format)</Format>
[opt]		<DefaultAction>leave-undefined|src-term|output|fixedvalue</DefaultAction>
[opt]		<DefaultValue>escape(text)</DefaultValue>
[rpt/]		<Lookup key="escape(key)">escape(value)</Lookup>

TransformReactor/Transformations/Type = Rules
			<Type>Rules</Type>
			<StopOnFirstMatch>true|false</StopOnFirstMatch>			-> DEFAULT: true
[rpt]		<Rule>
				<Term>src-term</Term>
				<Type>test-type</Type>
				<Value>escape(test-value)</Value>
				<SetValue>escape(set-value)</SetValue>
[/rpt]		</Rule>

TransformReactor/Transformations/Type = Regex
			<Type>Regex</Type>
			<SourceTerm>src-term</SourceTerm>
[rpt]		<Regex exp="escape(key)">escape(format)</Regex>

JoinTerm: Iterates over source-term's values, joins values using separator-string (defaults to none), produces single-value term.  Optionally eliminates duplicates from source-term (defaults to false).  If only one value results, then no separator.
  <Transformation>
    <Term>urn:vocab:foo#single-value</Term>
    <Type>JoinTerm</Type>
    <Value sep="," uniq="true">urn:vocab:foo#multi-value</Value>
  </Transformation>
 
SplitTerm: Iterates over source-term's values, splits each value on separator-string (required), produces multi-value term.  If separator does not exist in value, value is preserved unchanged.
  <Transformation>
    <Term>urn:vocab:foo#multi-value</Term>
    <Type>SplitTerm</Type>
    <Value sep=",">urn:vocab:foo#single-or-multi-value</Value>
  </Transformation>

 */

// TransformReactor member functions

void TransformReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	ConfigWriteLock cfg_lock(*this);
	Reactor::setConfig(v, config_ptr);

	// clear the current configuration
	m_transforms.clear();

	// Outgoing Event type -- i.e. what will the outgoing event be transformed into
	// Default (UNDEFINED_TERM_REF) -- make it the same as incoming event type
	// 	<OutgoingEvent>obj-term</OutgoingEvent>
	m_event_type = Vocabulary::UNDEFINED_TERM_REF;
	std::string event_type_str;
	if (ConfigManager::getConfigOption(OUTGOING_EVENT_ELEMENT_NAME, event_type_str, config_ptr))
	{
		if (!event_type_str.empty())
			m_event_type = v.findTerm(event_type_str);
	}

	// This really doesn't make much sense anymore -- you can wire the delivery of the original right through
	// it would make sense, if it was possible to deliver "if-not-changed" but TR2 always changes...
	// 	<DeliverOriginal>always|if-not-changed|never</DeliveryOriginal>		-> DEFAULT: never
	m_deliver_original = DO_NEVER;
	std::string deliver_original_str;
	if (ConfigManager::getConfigOption(DELIVER_ORIGINAL_NAME, deliver_original_str, config_ptr))
	{
		if (deliver_original_str == "true" || deliver_original_str == "always")
			m_deliver_original = DO_ALWAYS;
		else if (deliver_original_str == "if-not-changed")
			m_deliver_original = DO_SOMETIMES;
		// Could add code to throw if d_o_s is not "never"
	}

	// What fields/terms of the original event should be COPIED into the new event
	// <CopyOriginal>all-terms|if-not-defined|none</CopyOriginal>			-> DEFAULT: if-not-defined
	m_copy_original = COPY_UNCHANGED;
	std::string copy_original_str;
	if (ConfigManager::getConfigOption(COPY_ORIGINAL_ELEMENT_NAME, copy_original_str, config_ptr))
	{
		if (copy_original_str == "all-terms")
			m_copy_original = COPY_ALL;
		else if (copy_original_str == "none")
			m_copy_original = COPY_NONE;
		// Could add code to throw if c_o_s is not "if-not-defined"
	}

	// now, parse transformation rules
	// [rpt]	<Transformation>
	xmlNodePtr transformation_node = config_ptr;
	while ( (transformation_node = ConfigManager::findConfigNodeByName(TRANSFORMATION_ELEMENT_NAME, transformation_node)) != NULL)
	{
		// parse new Transformation rule

		// get the Term used for the Transformation rule
		//	<Term>src-term</Term>
		std::string term_id;
		if (! ConfigManager::getConfigOption(TERM_ELEMENT_NAME, term_id,
											 transformation_node->children))
			throw EmptyTermException(getId());

		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(getId());

		// get the Type of transformation
		//	<Type>AssignValue|AssignTerm|Lookup|Rules</Type>
		std::string type_str;
		if (! ConfigManager::getConfigOption(TYPE_ELEMENT_NAME, type_str,
											 transformation_node->children))
			throw EmptyTypeException(getId());	// TODO: Improve the error message

		// Add the transformation
		const bool debug_mode = getReactionEngine().getDebugMode();
		Transform *new_transform;
		if (type_str == "AssignValue")
			new_transform = new TransformAssignValue(v, v[term_ref], transformation_node->children, debug_mode);
		else if (type_str == "AssignTerm")
			new_transform = new TransformAssignTerm(v, v[term_ref], transformation_node->children, debug_mode);
		else if (type_str == "Lookup")
			new_transform = new TransformLookup(v, v[term_ref], transformation_node->children, debug_mode);
		else if (type_str == "Rules")
			new_transform = new TransformRules(v, v[term_ref], transformation_node->children, debug_mode);
		else if (type_str == "Regex")
			new_transform = new TransformRegex(v, v[term_ref], transformation_node->children, debug_mode);
		else if (type_str == "SplitTerm")
			new_transform = new TransformSplitTerm(v, v[term_ref], transformation_node->children, debug_mode);
		else if (type_str == "JoinTerm")
			new_transform = new TransformJoinTerm(v, v[term_ref], transformation_node->children, debug_mode);
		else if (type_str == "URLEncode")
			new_transform = new TransformURLEncode(v, v[term_ref], transformation_node->children, debug_mode);
		else if (type_str == "URLDecode")
			new_transform = new TransformURLDecode(v, v[term_ref], transformation_node->children, debug_mode);
		else
			throw InvalidTransformation(type_str);

		m_transforms.push_back(new_transform);

		// step to the next Comparison rule
		transformation_node = transformation_node->next;
	}
}

void TransformReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	ConfigWriteLock cfg_lock(*this);
	Reactor::updateVocabulary(v);

	// update Vocabulary for each of the rules
	for (TransformChain::iterator i = m_transforms.begin(); i != m_transforms.end(); ++i) {
		(*i)->updateVocabulary(v);
	}
}

void TransformReactor::process(const EventPtr& e)
{
	EventPtr new_e;
	// Create new event; either same type (if UNDEFINED) or defined type
	m_event_factory.create(new_e, m_event_type == Vocabulary::UNDEFINED_TERM_REF ? e->getType() : m_event_type);

	// Copy terms over from original
	switch (m_copy_original) {
		case COPY_ALL:				// Copy all terms over from original event
			*new_e += *e;
			break;
		case COPY_UNCHANGED:		// Copy ONLY terms, that are not defined in transformations...
			*new_e += *e;			// First copy all terms...
			// Then remove all the ones with transformations...
			for (TransformChain::iterator i = m_transforms.begin(); i != m_transforms.end(); i++)
				(*i)->removeTerm(new_e);
			// TODO: Which is more efficient? Only copying the ones that are not transformed, or this?
			break;
		case COPY_NONE:				// Do not copy terms from original event
			break;
	}

	try {
		for (TransformChain::iterator i = m_transforms.begin(); i != m_transforms.end(); i++)
			(*i)->transform(new_e, e);		// transform   d <- s
	} catch (std::exception& e) {
		// Likely Boost.regex throw
		PION_LOG_ERROR(m_logger, "reactor_id: " << getId() << " - " << e.what() << " - handled");
	}

	deliverEvent(new_e);			// Deliver the modified event

	// Transformation is done, deliver original event?
	if (m_deliver_original != DO_NEVER)
	 	deliverEvent(e);
}


}	// end namespace plugins
}	// end namespace pion


/// creates new TransformReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_TransformReactor(void) {
	return new pion::plugins::TransformReactor();
}

/// destroys TransformReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_TransformReactor(pion::plugins::TransformReactor *reactor_ptr) {
	delete reactor_ptr;
}
