dojo.provide("pion.vocabularies");
dojo.require("pion.widgets.ConfigAccordion");
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
	var accordion_height = pion.vocabularies.selected_pane.getHeight();
	dojo.forEach(config_accordion.getChildren(), function(pane) {
		accordion_height += pane._buttonWidget.getTitleHeight();
	});
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
		if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
		this.execute_already_called = true;

		// TODO: override pion.vocabularies.config_store._getPostContent() (see XmlStore._getPostContent())
		// with the code below to build the post data.
		// Then we can get rid of createNewPaneFromStore(), and do the following here:
		// 		var item = pion.vocabularies.config_store.newItem({
		// 			Name: dialogFields.Name,
		// 			Comment: dialogFields.Comment
		// 		});
		// 		pion.vocabularies.createNewPaneFromItem(item);

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
	pion.vocabularies.selected_pane = null;
	pion.vocabularies.config_accordion = dijit.byId('vocab_config_accordion');
	pion.vocabularies.config_accordion.title_attribute = '@id';
	pion.vocabularies.config_accordion.createNewPaneFromItem = function(item, store) {
		var id = pion.vocabularies.config_store.getValue(item, '@id');
		var title = pion.escapeXml(store.getValue(item, this.title_attribute));
		var vocab_pane_node = document.createElement('span');
		var vocab_pane = new plugins.vocabularies.VocabularyPane({ 'class': 'vocab_pane', title: title, config: {'@id': id} }, vocab_pane_node);
		this.addChild(vocab_pane);
		return vocab_pane;
	}

	var selected_pane = null;
	var attributes_by_column = ['@id', 'Type', '@format', 'Size', 'Comment'];
	var delete_col_index = attributes_by_column.length;

	pion.vocabularies._replaceAccordionPane = function(old_pane) {
		var new_pane = new plugins.vocabularies.VocabularyPane({title: old_pane.title, config: old_pane.config});
		new_pane.initialized = true;
	
		var config_accordion = dijit.byId("vocab_config_accordion");
		var idx = config_accordion.getIndexOfChild(old_pane);
		config_accordion.pendingSelection = new_pane;
		config_accordion.pendingRemoval = old_pane;
		config_accordion.addChild(new_pane, idx);
	}

	pion.vocabularies._updatePane = function(pane) {
		pane.populateFromServerVocabStore();
		pion.vocabularies._adjustAccordionSize();
		dojo.style(pane.containerNode, "overflow", "hidden"); // For IE.
		// ???????????? Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
	}

	function _paneSelected(pane) {
		console.debug('Selected ' + pane.title);

		var selected_pane = pion.vocabularies.selected_pane;
		if (pane == selected_pane) {
			return;
		}
		var config_accordion = dijit.byId("vocab_config_accordion");
		if (selected_pane && dojo.hasClass(selected_pane.domNode, 'unsaved_changes')) {
			var dialog = new dijit.Dialog({title: "Warning: unsaved changes"});
			dialog.attr('content', 'Please save or cancel unsaved changes before selecting another Vocabulary.');
			dialog.show();

			// Return to the previously selected pane.
			setTimeout(function(){config_accordion.selectChild(selected_pane);}, 500);
			return;
		}
		setTimeout(
			function() {
				if (config_accordion.pendingRemoval) {
					config_accordion.removeChild(config_accordion.pendingRemoval);
					config_accordion.pendingRemoval = false;
				}
				if (! pane.initialized)
					// The selected pane is just a placeholder, so now replace it with the real thing.  The new pane will 
					// then be selected, causing this function to be called again, this time with pane.initialized = true;
					pion.vocabularies._replaceAccordionPane(pane);
				else {
					pion.vocabularies.selected_pane = pane;
					pion.vocabularies._updatePane(pane);
				}
			},
			config_accordion.duration + 100
		);
	}

	function _paneAdded(pane) {
		var config_accordion = dijit.byId("vocab_config_accordion");
		setTimeout(
			function() {
				if (config_accordion.pendingSelection) {
					config_accordion.selectChild(config_accordion.pendingSelection);
					config_accordion.pendingSelection = false;
				}
			},
			config_accordion.duration // Duration shouldn't be relevant here, but what should this be???
		);
	}

	function _paneRemoved(pane) {
	}

	dojo.subscribe("vocab_config_accordion-selectChild", _paneSelected);
	dojo.subscribe("vocab_config_accordion-addChild", _paneAdded);
	dojo.subscribe("vocab_config_accordion-removeChild", _paneRemoved);

	pion.vocabularies.createNewPaneFromStore = function(id, vocabulary_config_page_is_selected) {
		pion.vocabularies.config_store.fetch({
			query: {'@id': id},
			onItem: function(item) {
				var vocab_pane = pion.vocabularies.config_accordion.createNewPaneFromItem(item, pion.vocabularies.config_store);
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
			pion.vocabularies.config_accordion.createPanesFromAllItems(items, pion.vocabularies.config_store);
			pion.vocabularies.vocabularies_by_id = {};
			dojo.forEach(pion.vocabularies.config_accordion.getChildren(), function(pane) {
				var id = pane.vocabulary.config['@id'];
				pion.vocabularies.vocabularies_by_id[id] = pane.vocabulary;
			});
		},
		onError: pion.handleFetchError
	});

	dojo.connect(dojo.byId('add_new_vocab_button'), 'click', pion.vocabularies.addNewVocabulary);
}
