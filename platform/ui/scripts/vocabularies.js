dojo.provide("pion.vocabularies");
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

pion.vocabularies.term_type_store = new dojo.data.ItemFileReadStore({url: 'termTypes.json'});

pion.vocabularies.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.vocabularies.height;
}

pion.vocabularies.init = function() {
	var vocab_pane_title_height = -1;
	var accordion_width = -1;
	var selected_pane = null;
	var attributes_by_column = ['@id', 'Type', '@format', 'Size', 'Comment'];
	var delete_col_index = attributes_by_column.length;
	var term_types_by_description = {};
	var term_type_descriptions_by_name = {};

	var store = pion.vocabularies.term_type_store;
	store.fetch({
		onItem: function (item, request) {
			term_types_by_description[store.getValue(item, 'description')] = store.getValue(item, 'name');
			term_type_descriptions_by_name[store.getValue(item, 'name')] = store.getValue(item, 'description');
		}
	});

	var vocab_config_store = new dojox.data.XmlStore({url: '/config/vocabularies', rootItem: 'VocabularyConfig', attributeMap: {'VocabularyConfig.id': '@id'}});
 
	var grid = new dojox.Grid({
			"model": new dojox.grid.data.Table(null, []),
			singleClickEdit: true,
			"structure": vocab_grid_layout
		}, 'vocab_grid');

	function _populatePaneFromVocabItem(vocab_item, vocab_store) {
		var form_data = {};
		form_data.vocab_id = vocab_store.getValue(vocab_item, '@id');
		form_data.vocab_name = vocab_store.getValue(vocab_item, 'Name').toString();
		var xml_item = vocab_store.getValue(vocab_item, 'Comment');
		form_data.vocab_comment = xml_item? xml_item.toString() : '';
		xml_item = vocab_store.getValue(vocab_item, 'Locked');
		if (xml_item && xml_item.toString() == 'true') {
			form_data.checkboxes = ["locked"];
		} else {
			form_data.checkboxes = [];
		}
		console.debug("from vocab_store.getValue(vocab_item, 'Locked'): form_data.checkboxes = ", form_data.checkboxes);
		var form = dijit.byId('vocab_form');
		form.setValues(form_data);
		selected_pane.title = form_data.vocab_name;
		var title_node = dojo.query('.dijitAccordionTitle .dijitAccordionText', selected_pane.domNode)[0];
		title_node.innerHTML = selected_pane.title;

		var terms = vocab_store.getValues(vocab_item, 'Term');
		selected_pane.term_table = [];
		for (var i = 0; i < terms.length; ++i) {
			var term_table_row = [];
			term_table_row[0] = vocab_store.getValue(terms[i], '@id').split('#')[1];
			var type = vocab_store.getValue(terms[i], 'Type');
			term_table_row[1] = term_type_descriptions_by_name[type];
			term_table_row[2] = vocab_store.getValue(type, '@format');
			term_table_row[3] = vocab_store.getValue(terms[i], 'Size');
			term_table_row[4] = vocab_store.getValue(terms[i], 'Comment');
			selected_pane.term_table.push(term_table_row);
		}
		grid.model.setData(selected_pane.term_table);
		grid.resize();
		grid.update();
	}
	
	function _populatePaneFromConfigItem(item) {
		var id = vocab_config_store.getValue(item, '@id');
		var url = '/config/vocabularies/' + id;
	
		if (selected_pane.vocab_store) {
			var vocab_store = selected_pane.vocab_store;
			/*********************************************************************************/
			// TEMPORARY CODE!  (Want to avoid calling fetch() for now, until updating the server is enabled.)
			_populatePaneFromVocabItem(selected_pane.vocab_item, vocab_store);
			setTimeout(_setUnsavedChangesFalse, 500);
			return;
			/*********************************************************************************/
		} else {
			var vocab_store = new dojox.data.XmlStore({url: url, attributeMap: {'Vocabulary.id': '@id'}});
			selected_pane.vocab_store = vocab_store;
		}
		
		vocab_store.fetch({
			query: {'tagName': 'Vocabulary'}, 
			onError: function(errorData, request) {
				alert('dojo.data error: url = ' + request.store._url + '\n(Note: sending a request to the server to add a new vocabulary is not implemented yet.)');
				grid.model.setData([]);
				grid.resize();
				grid.update();
			},
			onComplete: function (items, request) {
				// TODO: check that there was exactly one item returned?
				var vocab_item = items[0];
				selected_pane.vocab_item = vocab_item;
				_populatePaneFromVocabItem(vocab_item, vocab_store);
			}
		});		

		// Wait a bit for the change events on the FilteringSelect widgets to get handled.
		setTimeout(_setUnsavedChangesFalse, 500);
	}

	function _adjustAccordionSize() {
		var config_accordion = dijit.byId('vocab_config_accordion');
		var num_vocabs = config_accordion.getChildren().length;
		console.debug("num_vocabs = " + num_vocabs);

		// TODO: replace 400 with some computed value, which takes into account the height of the grid 
		// (in .vocab_grid in defaults.css) and the variable comment box height.
		var vocab_pane_body_height = 400;

		var accordion_height = vocab_pane_body_height + num_vocabs * vocab_pane_title_height;
		config_accordion.resize({h: accordion_height, w: accordion_width});

		// TODO: replace 160 with some computed value  (see adjustUserAccordionSize)
		pion.vocabularies.height = accordion_height + 160;
		dijit.byId('main_stack_container').resize({h: pion.vocabularies.height});
	}

	function _paneSelected(pane) {
		console.debug('Selected ' + pane.title);

		if (pane == selected_pane) {
			return;
		}
		if (dojo.hasClass(selected_pane.domNode, 'unsaved_changes')) {
			var dialog = dijit.byId('unsaved_changes_dialog');
			dialog.show();
			
			// Return to the previously selected pane.
			setTimeout(function(){dijit.byId('vocab_config_accordion').selectChild(selected_pane);}, 500);
			return;
		}

		// Move all the DOM nodes for the form from the previously selected pane to the newly selected one.
		var form_node_to_move = dojo.query('form', selected_pane.domNode)[0];
		form_node_to_move.parentNode.replaceChild(document.createElement('form'), form_node_to_move);
		var form_node_to_replace = dojo.query('form', pane.domNode)[0];
		form_node_to_replace.parentNode.replaceChild(form_node_to_move, form_node_to_replace);

		// Update selected_pane, so _populatePaneFromConfigItem() and the form buttons will now act on the newly selected vocabulary.
		selected_pane = pane;
		_populatePaneFromConfigItem(pane.config_item);
	}

	dojo.subscribe("vocab_config_accordion-selectChild", _paneSelected);

	function _createNewPane(title) {
		var vocab_pane_node = document.createElement('span');
		var empty_form_node = document.createElement('form');
		vocab_pane_node.appendChild(empty_form_node);
		var vocab_pane = new dijit.layout.AccordionPane({ 'class': 'vocab_pane', title: title }, vocab_pane_node);
		return vocab_pane;
	}

	selected_pane = dijit.byId('vocab_config_accordion').getChildren()[0];
	vocab_pane_title_height = selected_pane.getTitleHeight();

	if (file_protocol) {
		dojo.connect(dojo.byId('add_new_term_button'), 'click', _addNewTermToVocabulary);
		dijit.byId('vocab_config_accordion').removeChild(selected_pane);
		_adjustAccordionSize();
	} else {
		vocab_config_store.fetch({
			onComplete: function (items, request) {
				selected_pane.config_item = items[0];
				_populatePaneFromConfigItem(items[0]);

				var config_accordion = dijit.byId('vocab_config_accordion');
				for (var i = 1; i < items.length; ++i) {
					// It would be nice to have the name for the title instead of the ID, but we will have to make a request for 
					// each vocabulary (e.g. with url = '/config/vocabularies/' + id) if we want this.
					var title = vocab_config_store.getValue(items[i], '@id');
					var vocab_pane = _createNewPane(title);
					vocab_pane.config_item = items[i];
					config_accordion.addChild(vocab_pane);
				}
				_adjustAccordionSize();
			}
		});
	}
	
	dojo.connect(grid, 'onCellClick', function(e) {
		console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
		if (e.cellIndex == delete_col_index) {
			console.debug('Removing row ', e.rowIndex); 
			grid.removeSelectedRows();
			var terms = selected_pane.vocab_store.getValues(selected_pane.vocab_item, 'Term');
			/**/
			//This block is dependent on fixing a bug in setValues() in XmlStore.js.
			terms.splice(e.rowIndex, 1);
			selected_pane.vocab_store.setValues(selected_pane.vocab_item, 'Term', terms);
			/**/
		}
	});

	dojo.connect(grid, 'onApplyCellEdit', function(inValue, inRowIndex, inFieldIndex) {
		console.debug('inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', inFieldIndex = ', inFieldIndex);
		var terms = selected_pane.vocab_store.getValues(selected_pane.vocab_item, 'Term');
		var attribute_to_change = attributes_by_column[inFieldIndex];
		if (attribute_to_change == '@format') {
			alert('Changing format not implemented yet.');
			return;
		}
		
		// The reason for creating a copy and modifying it rather than the original is to enable reverting the datastore.
		var orig_term = terms[inRowIndex];
		var modified_term = {
			store: orig_term.store,
			element: dojo.clone(orig_term.element)
		};
		if (attribute_to_change == 'Type') {
			var term_type = term_types_by_description[inValue];
			selected_pane.vocab_store.setValue(modified_term, attribute_to_change, term_type);
		} else {
			selected_pane.vocab_store.setValue(modified_term, attribute_to_change, inValue);
		}
		terms.splice(inRowIndex, 1, modified_term);

		//This line is dependent on fixing a bug in setValues() in XmlStore.js.
		selected_pane.vocab_store.setValues(selected_pane.vocab_item, 'Term', terms);

		dojo.addClass(selected_pane.domNode, 'unsaved_changes');
	});

	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	accordion_width = dijit.byId('vocab_config_accordion').domNode.clientWidth - 15;

	_adjustAccordionSize();

	function _isDuplicateVocabularyId(id) {
		var vocabularies = dijit.byId('vocab_config_accordion').getChildren();
		for (var i = 0; i < vocabularies.length; ++i) {
			if (vocab_config_store.getValue(vocabularies[i].config_item, '@id') == id) {
				return true;
			}
		}
		return false;
	}

	function _isDuplicateVocabularyName(name) {
		var vocabularies = dijit.byId('vocab_config_accordion').getChildren();
		for (var i = 0; i < vocabularies.length; ++i) {
			if (vocabularies[i].title == name) {
				return true;
			}
		}
		return false;
	}

	function _addNewVocabulary() {
		dijit.byId('new_vocabulary_id').isValid = function(isFocused) {
			if (!this.validator(this.textbox.value, this.constraints)) {
				this.invalidMessage = "Invalid Vocabulary name";
				return false;
			}
			if (_isDuplicateVocabularyId(this.textbox.value)) {
				this.invalidMessage = "A Vocabulary with this ID already exists";
				return false;
			}
			return true;
		};
		dijit.byId('new_vocabulary_name').isValid = function(isFocused) {
			if (!this.validator(this.textbox.value, this.constraints)) {
				this.invalidMessage = "Invalid Vocabulary name";
				return false;
			}
			if (_isDuplicateVocabularyName(this.textbox.value)) {
				this.invalidMessage = "A Vocabulary with this name already exists";
				return false;
			}
			return true;
		};
		dijit.byId('new_vocabulary_id').setDisplayedValue('');
		dijit.byId('new_vocabulary_name').setDisplayedValue('New Vocabulary');
		dijit.byId('new_vocabulary_comment').setDisplayedValue('');

		var dialog = dijit.byId("new_vocabulary_dialog");
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
			var vocab_config_accordion = dijit.byId('vocab_config_accordion');
			if (!vocab_config_accordion.hasChildren()) {
				// It would be nice to have code here to workaround the sizing bug that occurs after 
				// deleting all the panes and then adding one.
			}

			// Eventually, this block will be replaced by a request that causes the server to add the item.
			var item = vocab_config_store.newItem({tagName: 'VocabularyConfig'});
			vocab_config_store.setValue(item, '@id', dialogFields.vocab_id);

			var vocab_pane = _createNewPane(dialogFields.vocab_name);
			vocab_pane.config_item = item;

			// Temporary code: won't be needed when the server adds the vocab, enabling url = '/config/vocabularies/urn:vocab:some_id'
			vocab_pane.vocab_store = new dojox.data.XmlStore({url: 'not_to_be_used', attributeMap: {'Vocabulary.id': '@id'}});
			vocab_pane.vocab_item = vocab_pane.vocab_store.newItem({tagName: 'Vocabulary'});
			vocab_pane.vocab_store.setValue(vocab_pane.vocab_item, '@id', dialogFields.vocab_id);
			vocab_pane.vocab_store.setValue(vocab_pane.vocab_item, 'Name', dialogFields.vocab_name);
			vocab_pane.vocab_store.setValue(vocab_pane.vocab_item, 'Comment', dialogFields.vocab_comment);			
			vocab_pane.vocab_store.setValue(vocab_pane.vocab_item, 'Locked', 'false');

			vocab_config_accordion.addChild(vocab_pane);
			_adjustAccordionSize();
			vocab_config_accordion.selectChild(vocab_pane);
			console.debug("vocab_config_accordion.domNode.style.height = " + vocab_config_accordion.domNode.style.height);

			dijit.byId('vocab_form').setValues(dialogFields);
		}
	}

	function _addNewTermToVocabulary() {
		var vocab_id = selected_pane.vocab_store.getValue(selected_pane.vocab_item, '@id');
		var terms = selected_pane.vocab_store.getValues(selected_pane.vocab_item, 'Term');
		function _isDuplicateTermId(id_suffix) {
			var id = vocab_id + '#' + id_suffix;
			for (var i = 0; i < terms.length; ++i) {
				if (selected_pane.vocab_store.getValue(terms[i], '@id') == id) {
					return true;
				}
			}
			return false;
		}
		dijit.byId('new_term_id_suffix').isValid = function(isFocused) {
			if (!this.validator(this.textbox.value, this.constraints)) {
				this.invalidMessage = "Invalid Term ID suffix";
				return false;
			}
			if (_isDuplicateTermId(this.textbox.value)) {
				this.invalidMessage = "A Term with this ID already exists";
				return false;
			}
			return true;
		};
		dijit.byId('new_term_id_suffix').setDisplayedValue('');
		dijit.byId('new_term_type').setValue('undefined type');
		dijit.byId('new_term_comment').setDisplayedValue('');

		var dialog = dijit.byId("new_term_dialog");
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
			console.debug('dialogFields = ', dialogFields);
			var id = dialogFields.term_id_suffix;

			// Eventually, this block will be replaced by a request that causes the server to add the term.
			/*
			About document.implementation.createDocument:
			Can't use document.createElement('Term'), because it changes the tagName to 'TERM'.
			Can't use dojox.xml.DomParser.parse, e.g. the following, 
				var element = dojox.xml.DomParser.parse('<Term id="urn:vocab:clf#TEST123"><Type>uint16</Type><Comment>This is a test.</Comment></Term>');
				var new_term = new dojox.data.XmlItem(element.documentElement, selected_pane.vocab_store);
			because, among other things, neither element.documentElement nor its child nodes have a tagName.
			See Javascript, p. 503 about making this work for IE.
			*/
			var element = document.implementation.createDocument('', 'Term', null);
			var new_term = new dojox.data.XmlItem(element.firstChild, selected_pane.vocab_store);
			selected_pane.vocab_store.setValue(new_term, '@id', vocab_id + '#' + id);
			var term_type = term_types_by_description[dialogFields.term_type];
			selected_pane.vocab_store.setValue(new_term, 'Type', term_type);
			selected_pane.vocab_store.setValue(new_term, 'Comment', dialogFields.term_comment);			

			var new_terms = [new_term];
			for (var i = 0; i < terms.length; ++i) {
				new_terms.push(terms[i]);
			}
			selected_pane.vocab_store.setValues(selected_pane.vocab_item, 'Term', new_terms);

			grid.addRow([id, dialogFields.term_type, '', '', dialogFields.term_comment]);
			setTimeout(function() { grid.focus.setFocusIndex(0, 0); }, 0);
			dojo.addClass(selected_pane.domNode, 'unsaved_changes');
		}
	}

	function _setUnsavedChangesTrue() {
		console.debug('_setUnsavedChangesTrue called');
		if (selected_pane) {
			dojo.addClass(selected_pane.domNode, 'unsaved_changes');
		}
	}

	function _setUnsavedChangesFalse() {
		console.debug('_setUnsavedChangesFalse called');
		if (selected_pane) {
			dojo.removeClass(selected_pane.domNode, 'unsaved_changes');
		}
	}

	dojo.connect(dojo.byId('add_new_vocab_button'), 'click', _addNewVocabulary);
	dojo.connect(dojo.byId('add_new_term_button'), 'click', _addNewTermToVocabulary);
	dojo.connect(dojo.byId('vocab_comment_widget'), 'change', _setUnsavedChangesTrue);

	dojo.query("input", selected_pane.domNode).forEach(function(n) {
		console.debug('input: n = ', n);
		dojo.connect(n, 'change', _setUnsavedChangesTrue);
	});
	dojo.query(".dijitButton.save", selected_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			var form = dijit.byId('vocab_form');
			console.debug('save: selected vocabulary is ', selected_pane.title, ', form.getValues() = ', form.getValues());
			var form_data = form.getValues();
			selected_pane.vocab_store.setValue(selected_pane.vocab_item, 'Name', form_data.vocab_name);
			selected_pane.vocab_store.setValue(selected_pane.vocab_item, 'Comment', form_data.vocab_comment);
			selected_pane.vocab_store.setValue(selected_pane.vocab_item, 'Locked', dojo.indexOf(form_data.checkboxes, 'locked') >= 0? 'true' : 'false');
			console.debug('form_data.checkboxes = ', form_data.checkboxes, ", dojo.indexOf(form_data.checkboxes, 'locked') = ", dojo.indexOf(form_data.checkboxes, 'locked'));
			selected_pane.vocab_store.save();
			selected_pane.title = form_data.vocab_name;
			dojo.query('.dijitAccordionTitle .dijitAccordionText', selected_pane.domNode).forEach(function(n){n.innerHTML = selected_pane.title;});
			dojo.removeClass(selected_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.cancel", selected_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			selected_pane.vocab_store.revert();
			_populatePaneFromConfigItem(selected_pane.config_item);
			dojo.removeClass(selected_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.delete", selected_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			console.debug('delete: selected vocabulary is ', selected_pane.title);

			dojo.removeClass(selected_pane.domNode, 'unsaved_changes');
			var pane_to_delete = selected_pane;

			selected_pane.vocab_store.deleteItem(pane_to_delete.config_item);
			selected_pane.vocab_store.save();
			
			// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
			// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
			dijit.byId('vocab_config_accordion').forward();
			
			dijit.byId('vocab_config_accordion').removeChild(pane_to_delete);
			_adjustAccordionSize();
		})
	});
}
