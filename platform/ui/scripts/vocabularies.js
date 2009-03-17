dojo.provide("pion.vocabularies");
dojo.require("plugins.vocabularies.Vocabulary");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.data.XmlStore");
dojo.require("dojox.xml.DomParser");

pion.vocabularies.vocabularies_by_id = {};

pion.vocabularies.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.vocabularies.height;
}

pion.vocabularies._adjustAccordionSize = function() {
	var config_accordion = dijit.byId('vocab_config_accordion');
	var num_vocabs = config_accordion.getChildren().length;
	console.debug("num_vocabs = " + num_vocabs);

	// TODO: replace 450 with some computed value, which takes into account the height of the grid 
	// (in .vocab_grid in defaults.css) and the variable comment box height.
	var vocab_pane_body_height = 450;

	var title_height = 0;
	if (num_vocabs > 0) {
		var first_pane = config_accordion.getChildren()[0];
		var title_height = first_pane.getTitleHeight();
	}
	var accordion_height = vocab_pane_body_height + num_vocabs * title_height;
	config_accordion.resize({h: accordion_height});

	// TODO: replace 160 with some computed value  (see pion.users._adjustAccordionSize)
	pion.vocabularies.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.vocabularies.height});
}

pion.vocabularies.isDuplicateVocabularyId = function(id) {
	var full_id = 'urn:vocab:' + id;
	return (full_id in pion.vocabularies.vocabularies_by_id);
}

// TODO: for this to work correctly, it would be necessary to query every Vocabulary
// for its name sometime previous to calling this.
// Currently, we only do this on demand, which is why VocabularyPanes show an ID
// instead of a name if they haven't been opened yet.
pion.vocabularies.isDuplicateVocabularyName = function(name) {
	if (dijit.byId('vocab_config_accordion')) {
		var vocabularies = dijit.byId('vocab_config_accordion').getChildren();
		for (var i = 0; i < vocabularies.length; ++i) {
			if (vocabularies[i].title == name) {
				return true;
			}
		}
	}
	return false;
}

pion.vocabularies.addNewVocabulary = function() {
	var dialog = new plugins.vocabularies.VocabularyInitDialog();
	dojo.query(".dijitButton.save", dialog.domNode).forEach(function(n) {
		dijit.byNode(n).onClick = function() { return dialog.isValid(); };
	});

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dialog.show();
	dialog.execute = function(dialogFields) {
		var post_data = '<PionConfig><Vocabulary>';
		post_data += pion.makeXmlLeafElement('Name', dialogFields.Name);
		post_data += pion.makeXmlLeafElement('Comment', dialogFields.Comment);
		post_data += '</Vocabulary></PionConfig>';
		console.debug('post_data: ', post_data);

		// This dialog field only accepts input matching regExp="\w+", so the url below is safe.
		var full_id = 'urn:vocab:' + dialogFields['@id'];

		dojo.rawXhrPost({
			url: '/config/vocabularies/' + full_id,
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response) {
				if (vocab_config_page_initialized) {
					pion.vocabularies.createNewPaneFromStore(full_id, pion.current_page == "Vocabularies");
				}
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	}
}

pion.vocabularies.config_store = new dojox.data.XmlStore({url: '/config/vocabularies', rootItem: 'VocabularyConfig', attributeMap: {'VocabularyConfig.id': '@id'}});

pion.vocabularies.init = function() {
	var selected_pane = null;
	var attributes_by_column = ['@id', 'Type', '@format', 'Size', 'Comment'];
	var delete_col_index = attributes_by_column.length;

	function _paneSelected(pane) {
		console.debug('Selected ' + pane.title);

		if (pane == selected_pane) {
			return;
		}
		if (selected_pane && dojo.hasClass(selected_pane.domNode, 'unsaved_changes')) {
			var dialog = new dijit.Dialog({title: "Warning: unsaved changes"});
			dialog.setContent('Please save or cancel unsaved changes before selecting another Vocabulary.');
			dialog.show();
			
			// Return to the previously selected pane.
			setTimeout(function(){dijit.byId('vocab_config_accordion').selectChild(selected_pane);}, 500);
			return;
		}
		selected_pane = pane;
		pion.vocabularies.selected_pane = selected_pane;
		pane.populateFromServerVocabStore();

		//// Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
		//var slide_duration = dijit.byId('vocab_config_accordion').duration;
		//setTimeout(function(){dojo.style(pane.containerNode, "overflow", "hidden")}, slide_duration + 50);
	}

	dojo.subscribe("vocab_config_accordion-selectChild", _paneSelected);

	pion.vocabularies.createNewPaneFromItem = function(item) {
		var id = pion.vocabularies.config_store.getValue(item, '@id');
		var title = id; // Replaced by Name in populateFromServerVocabItem().
		var vocab_pane_node = document.createElement('span');
		var vocab_pane = new plugins.vocabularies.VocabularyPane({ 'class': 'vocab_pane', title: title, config: {'@id': id} }, vocab_pane_node);
		dijit.byId('vocab_config_accordion').addChild(vocab_pane);
		return vocab_pane;
	}

	pion.vocabularies.createNewPaneFromStore = function(id, vocabulary_config_page_is_selected) {
		pion.vocabularies.config_store.fetch({
			query: {'@id': id},
			onItem: function(item) {
				var vocab_pane = pion.vocabularies.createNewPaneFromItem(item);
				if (vocabulary_config_page_is_selected) {
					pion.vocabularies._adjustAccordionSize();
					dijit.byId('vocab_config_accordion').selectChild(vocab_pane);
				}
			},
			onError: pion.handleFetchError
		});
	}

	pion.vocabularies.config_store.fetch({
		onComplete: function(items, request) {
			var config_accordion = dijit.byId('vocab_config_accordion');
			pion.vocabularies.vocabularies_by_id = {};
			for (var i = 0; i < items.length; ++i) {
				var vocab_pane = pion.vocabularies.createNewPaneFromItem(items[i]);
				var id = vocab_pane.vocabulary.config['@id'];
				pion.vocabularies.vocabularies_by_id[id] = vocab_pane.vocabulary;
			}
			pion.vocabularies._adjustAccordionSize();
			var first_pane = config_accordion.getChildren()[0];
			config_accordion.selectChild(first_pane);
		},
		onError: pion.handleFetchError
	});

	dojo.connect(dojo.byId('add_new_vocab_button'), 'click', pion.vocabularies.addNewVocabulary);
}
