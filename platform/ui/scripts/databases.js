dojo.provide("pion.databases");
dojo.require("plugins.databases.Database");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.data.XmlStore");

pion.databases.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.databases.height;
}

pion.databases.config_store = new dojox.data.XmlStore({url: '/config/databases'});

// fetchItemByIdentity and getIdentity are needed for FilteringSelect.
pion.databases.config_store.fetchItemByIdentity = function(keywordArgs) {
	pion.databases.config_store.fetch({query: {'@id': keywordArgs.identity}, onItem: keywordArgs.onItem});
}
pion.databases.config_store.getIdentity = function(item) {
	return pion.databases.config_store.getValue(item, '@id');
}

pion.databases._adjustAccordionSize = function() {
	var config_accordion = dijit.byId('database_config_accordion');
	var num_databases = config_accordion.getChildren().length;
	console.debug("num_databases = " + num_databases);

	// TODO: replace 200 with some computed value
	var database_pane_body_height = 200;

	var title_height = 0;
	if (num_databases > 0) {
		var first_pane = config_accordion.getChildren()[0];
		var title_height = first_pane.getTitleHeight();
	}
	var accordion_height = database_pane_body_height + num_databases * title_height;

	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	var accordion_width = config_accordion.domNode.clientWidth - 15;

	config_accordion.resize({h: accordion_height, w: accordion_width});

	// TODO: replace 160 with some computed value  (see adjustUserAccordionSize)
	pion.databases.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.databases.height});
}

pion.databases.init = function() {
	var selected_pane = null;

	var url = dojo.moduleUrl('plugins', 'databases.json');
	pion.databases.plugin_data_store = new dojo.data.ItemFileReadStore({url: url});

	function _paneSelected(pane) {
		console.debug('Selected ' + pane.title);

		if (pane == selected_pane) {
			return;
		}
		if (selected_pane && dojo.hasClass(selected_pane.domNode, 'unsaved_changes')) {
			var dialog = dijit.byId('unsaved_changes_dialog');
			dialog.show();
			
			// Return to the previously selected pane.
			setTimeout(function(){dijit.byId('database_config_accordion').selectChild(selected_pane);}, 500);
			return;
		}

		selected_pane = pane;
		
		// TODO: When should we use the item we have rather than querying the store?  Should we 
		// always do a query in case the configuration has been updated in some other way?
		// Is there a clean way to avoid another query after we've just created a database (and
		// received a response that has all the info we need)?
		/*
		if (pane.config_item) {
			pane.populateFromConfigItem(pane.config_item);
		} else {
			console.debug('Fetching item ', pane.uuid);
			var store = pion.databases.config_store;
			store.fetch({
				query: {'@id': pane.uuid},
				onItem: function(item) {
					pane.config_item = item;
					pane.populateFromConfigItem(item);
				}
			});
		}
		*/
		console.debug('Fetching item ', pane.uuid);
		var store = pion.databases.config_store;
		store.fetch({
			query: {'@id': pane.uuid},
			onItem: function(item) {
				console.debug('item: ', item);
				pane.populateFromConfigItem(item);
			}
		});
	}

	dojo.subscribe("database_config_accordion-selectChild", _paneSelected);

	function _createNewPane(title) {
		var database_pane_node = document.createElement('span');
		var database_pane = new plugins.databases.DatabasePane({ 'class': 'database_pane', title: title }, database_pane_node);
		return database_pane;
	}

	if (file_protocol) {
		pion.databases._adjustAccordionSize();
	} else {
		pion.databases.config_store.fetch({
			onComplete: function (items, request) {
				var config_accordion = dijit.byId('database_config_accordion');
				for (var i = 0; i < items.length; ++i) {
					var title = pion.databases.config_store.getValue(items[i], 'Name');
					var database_pane = _createNewPane(title);
					database_pane.config_item = items[i];
					database_pane.uuid = pion.databases.config_store.getValue(items[i], '@id');
					config_accordion.addChild(database_pane);
				}
				pion.databases._adjustAccordionSize();

				var first_pane = config_accordion.getChildren()[0];
				config_accordion.selectChild(first_pane);
			}
		});
	}

	pion.databases._adjustAccordionSize();

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
		var dialog = new plugins.databases.DatabaseInitDialog({title: 'Add New Database'});

		// Set the focus to the first input field, with a delay so that it doesn't get overridden.
		setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

		dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
			dojo.connect(n, 'click', dialog, 'onCancel')
		});
		dialog.show();
		dialog.execute = function(dialogFields) {
			console.debug(dialogFields);
			var post_data = '<PionConfig><Database>';
			for (var tag in dialogFields) {
				console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
				post_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
			}
			post_data += '</Database></PionConfig>';
			console.debug('post_data: ', post_data);

			dojo.rawXhrPost({
				url: '/config/databases',
				contentType: "text/xml",
				handleAs: "xml",
				postData: post_data,
				load: function(response){
					var node = response.getElementsByTagName('Database')[0];
					var id = node.getAttribute('id');
					console.debug('id (from server): ', id);
					var database = new plugins.databases.Database(id, dialogFields);
					var database_config_accordion = dijit.byId('database_config_accordion');
					var database_pane = _createNewPane(dialogFields.Name);
					database_pane.uuid = id;
					database_config_accordion.addChild(database_pane);
					pion.databases._adjustAccordionSize();
					database_config_accordion.selectChild(database_pane);
				},
				error: function(response, ioArgs) {
					console.error('Error from rawXhrPost to /config/databases.  HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		}

		/*
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
		*/
	}

	dojo.connect(dojo.byId('add_new_database_button'), 'click', _addNewDatabase);
}
