dojo.provide("pion.databases");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.data.XmlStore");

pion.databases.config_store = new dojox.data.XmlStore({url: '/config/databases'});

pion.databases.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.databases.height;
}

pion.databases.init = function() {
	var database_pane_title_height = -1;
	var accordion_width = -1;
	var selected_pane = null;

	function _populatePaneFromConfigItem(item) {
		var store = pion.databases.config_store;
		var form_data = {};
		form_data.name = store.getValue(item, 'Name');
		form_data.ID = store.getValue(item, '@id') || '';
		var xml_item = store.getValue(item, 'Comment');
		form_data.comment = xml_item? xml_item.element.firstChild.nodeValue : '';
		form_data.plugin_type = store.getValue(item, 'Plugin');

		var form = dijit.byId('database_form');
		form.setValues(form_data);
		selected_pane.title = form_data.name;
		var title_node = dojo.query('.dijitAccordionTitle .dijitAccordionText', selected_pane.domNode)[0];
		title_node.firstChild.nodeValue = selected_pane.title;

		// Wait a bit for the change events on the FilteringSelect widgets to get handled.
		setTimeout(_setUnsavedChangesFalse, 500);
	}

	function _adjustAccordionSize() {
		var config_accordion = dijit.byId('database_config_accordion');
		var num_databases = config_accordion.getChildren().length;
		console.debug("num_databases = " + num_databases);

		// TODO: replace 200 with some computed value
		var database_pane_body_height = 200;

		var accordion_height = database_pane_body_height + num_databases * database_pane_title_height;
		config_accordion.resize({h: accordion_height, w: accordion_width});

		// TODO: replace 160 with some computed value  (see adjustUserAccordionSize)
		pion.databases.height = accordion_height + 160;
		dijit.byId('main_stack_container').resize({h: pion.databases.height});
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
			setTimeout(function(){dijit.byId('database_config_accordion').selectChild(selected_pane);}, 500);
			return;
		}

		// Move all the DOM nodes for the form from the previously selected pane to the newly selected one.
		var form_node_to_move = dojo.query('form', selected_pane.domNode)[0];
		form_node_to_move.parentNode.replaceChild(document.createElement('form'), form_node_to_move);
		var form_node_to_replace = dojo.query('form', pane.domNode)[0];
		form_node_to_replace.parentNode.replaceChild(form_node_to_move, form_node_to_replace);

		// Update selected_pane, so _populatePaneFromConfigItem() and the form buttons will now act on the newly selected database.
		selected_pane = pane;
		_populatePaneFromConfigItem(pane.config_item);
	}

	dojo.subscribe("database_config_accordion-selectChild", _paneSelected);

	function _createNewPane(title) {
		var database_pane_node = document.createElement('span');
		var empty_form_node = document.createElement('form');
		database_pane_node.appendChild(empty_form_node);
		var database_pane = new dijit.layout.AccordionPane({ 'class': 'database_pane', title: title }, database_pane_node);
		return database_pane;
	}

	selected_pane = dijit.byId('database_config_accordion').getChildren()[0];
	console.debug('selected_pane = ', selected_pane);
	database_pane_title_height = selected_pane.getTitleHeight();

	if (file_protocol) {
		dijit.byId('database_config_accordion').removeChild(selected_pane);
		_adjustAccordionSize();
	} else {
		pion.databases.config_store.fetch({
			onComplete: function (items, request) {
				selected_pane.config_item = items[0];
				_populatePaneFromConfigItem(items[0]);

				var config_accordion = dijit.byId('database_config_accordion');
				for (var i = 1; i < items.length; ++i) {
					var title = pion.databases.config_store.getValue(items[i], 'Name');
					var database_pane = _createNewPane(title);
					database_pane.config_item = items[i];
					config_accordion.addChild(database_pane);
				}
				_adjustAccordionSize();
			}
		});
	}

	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	accordion_width = dijit.byId('database_config_accordion').domNode.clientWidth - 15;

	_adjustAccordionSize();

	function _isDuplicateDatabaseId(id) {
		var databases = dijit.byId('database_config_accordion').getChildren();
		for (var i = 0; i < databases.length; ++i) {
			if (pion.databases.config_store.getValue(databases[i].config_item, '@id') == id) {
				return true;
			}
		}
		return false;
	}

	function _isDuplicateDatabaseName(name) {
		var databases = dijit.byId('database_config_accordion').getChildren();
		for (var i = 0; i < databases.length; ++i) {
			if (databases[i].title == name) {
				return true;
			}
		}
		return false;
	}

	function _addNewDatabase() {
		alert('Database Configuration is read-only for now.');
		return;
		
		dijit.byId('new_database_id').isValid = function(isFocused) {
			if (!this.validator(this.textbox.value, this.constraints)) {
				this.invalidMessage = "Invalid Database name";
				return false;
			}
			if (_isDuplicateDatabaseId(this.textbox.value)) {
				this.invalidMessage = "A Database with this ID already exists";
				return false;
			}
			return true;
		};
		dijit.byId('new_database_name').isValid = function(isFocused) {
			if (!this.validator(this.textbox.value, this.constraints)) {
				this.invalidMessage = "Invalid Database name";
				return false;
			}
			if (_isDuplicateDatabaseName(this.textbox.value)) {
				this.invalidMessage = "A Database with this name already exists";
				return false;
			}
			return true;
		};
		dijit.byId('new_database_id').setDisplayedValue('');
		dijit.byId('new_database_name').setDisplayedValue('New Database');
		dijit.byId('new_database_comment').setDisplayedValue('');

		var dialog = dijit.byId("new_database_dialog");
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
			var database_config_accordion = dijit.byId('database_config_accordion');
			if (!database_config_accordion.hasChildren()) {
				// It would be nice to have code here to workaround the sizing bug that occurs after 
				// deleting all the panes and then adding one.
			}

			var database_pane = _createNewPane(dialogFields.database_name);
			database_pane.config_item = item;

			database_config_accordion.addChild(database_pane);
			_adjustAccordionSize();
			database_config_accordion.selectChild(database_pane);
			console.debug("database_config_accordion.domNode.style.height = " + database_config_accordion.domNode.style.height);

			dijit.byId('database_form').setValues(dialogFields);

			// Eventually, this block will be replaced by a request that causes the server to add the item.
			var item = pion.databases.config_store.newItem({tagName: 'Database'});
			pion.databases.config_store.setValue(item, 'Name', dialogFields.database_name);
		}
	}

	function _setUnsavedChangesTrue() {
		// disable for now
		return;

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

	function _handlePluginTypeChange() {
		console.debug('changed plugin_type (_handlePluginTypeChange)');
		dojo.addClass(selected_pane.domNode, 'unsaved_changes');
	}

	dojo.connect(dojo.byId('database_plugin_type'), 'change', _handlePluginTypeChange);
	dojo.connect(dojo.byId('add_new_database_button'), 'click', _addNewDatabase);
	dojo.connect(database_comment_widget, 'onChange', _setUnsavedChangesTrue);

	dojo.query(".dijitButton.save", selected_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			alert('Database Configuration is read-only for now.');
		})
	});
	dojo.query(".dijitButton.cancel", selected_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
		})
	});
	dojo.query(".dijitButton.delete", selected_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			alert('Database Configuration is read-only for now.');
		})
	});
}
