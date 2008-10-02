//alert('vocabularies.js 1');
dojo.provide("pion.vocabularies");
dojo.require("plugins.vocabularies.Vocabulary");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.data.XmlStore");
dojo.require("dojox.grid.Grid");
dojo.require("dojox.xml.DomParser");

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
	
	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	var accordion_width = dijit.byId('vocab_config_accordion').domNode.clientWidth - 15;

	config_accordion.resize({h: accordion_height, w: accordion_width});

	// TODO: replace 160 with some computed value  (see pion.users._adjustAccordionSize)
	pion.vocabularies.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.vocabularies.height});
}

pion.vocabularies.isDuplicateVocabularyId = function(id) {
	var vocabularies = dijit.byId('vocab_config_accordion').getChildren();
	var full_id = 'urn:vocab:' + id;
	for (var i = 0; i < vocabularies.length; ++i) {
		if (vocabularies[i].config['@id'] == full_id) {
			return true;
		}
	}
	return false;
}

pion.vocabularies.isDuplicateVocabularyName = function(name) {
	var vocabularies = dijit.byId('vocab_config_accordion').getChildren();
	for (var i = 0; i < vocabularies.length; ++i) {
		if (vocabularies[i].title == name) {
			return true;
		}
	}
	return false;
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
		pane.populateFromVocabStore();

		// Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
		var slide_duration = dijit.byId('vocab_config_accordion').duration;
		setTimeout(function(){dojo.style(pane.containerNode, "overflow", "hidden")}, slide_duration + 50);
	}

	dojo.subscribe("vocab_config_accordion-selectChild", _paneSelected);

	function _createNewPane(keywordArgs) {
		var vocab_pane_node = document.createElement('span');
		var vocab_pane = new plugins.vocabularies.VocabularyPane(keywordArgs, vocab_pane_node);
		return vocab_pane;
	}

	pion.vocabularies.config_store.fetch({
		onComplete: function(items, request) {
			var config_accordion = dijit.byId('vocab_config_accordion');
			for (var i = 0; i < items.length; ++i) {
				// It would be nice to have the name for the title instead of the ID, but we will have to make a request for 
				// each vocabulary (e.g. with url = '/config/vocabularies/' + id) if we want this.
				var id = pion.vocabularies.config_store.getValue(items[i], '@id');
				var vocab_pane = _createNewPane({config: {'@id': id}, title: id});
				config_accordion.addChild(vocab_pane);
			}
			pion.vocabularies._adjustAccordionSize();
			var first_pane = config_accordion.getChildren()[0];
			config_accordion.selectChild(first_pane);
		},
		onError: pion.handleFetchError
	});

	function _addNewVocabulary() {
		var dialog = new plugins.vocabularies.VocabularyInitDialog();
		dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
			dojo.connect(n, 'click', dialog, 'onCancel')
		});
		dojo.query(".dijitButton.save", dialog.domNode).forEach(function(n) {
			dijit.byNode(n).onClick = function() { return dialog.isValid(); };
		});

		// Set the focus to the first input field, with a delay so that it doesn't get overridden.
		setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

		dialog.show();
		dialog.execute = function(dialogFields) {
			var post_data = '<PionConfig><Vocabulary>';
			post_data += '<Name>' + dialogFields.Name + '</Name>';
			post_data += '<Comment>' + dialogFields.Comment + '</Comment>';
			post_data += '</Vocabulary></PionConfig>';
			console.debug('post_data: ', post_data);
			var full_id = 'urn:vocab:' + dialogFields['@id'];
			
			dojo.rawXhrPost({
				url: '/config/vocabularies/' + full_id,
				contentType: "text/xml",
				handleAs: "xml",
				postData: post_data,
				load: function(response){
					var node = response.getElementsByTagName('Vocabulary')[0];
					var vocab_config_accordion = dijit.byId('vocab_config_accordion');
					var vocab_pane = _createNewPane({config: {'@id': full_id, Name: dialogFields.Name}, title: dialogFields.Name});
					vocab_config_accordion.addChild(vocab_pane);
					pion.vocabularies._adjustAccordionSize();
					vocab_config_accordion.selectChild(vocab_pane);
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
			});
		}
	}
	dojo.connect(dojo.byId('add_new_vocab_button'), 'click', _addNewVocabulary);
}
