dojo.provide("pion.databases");
dojo.require("pion.plugins");
dojo.require("plugins.databases.Database");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.data.XmlStore");

// Databases don't have to be listed here to be usable, but they do to be included in pion-dojo.js.
dojo.require("plugins.databases.SQLiteDatabase");

pion.databases.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.databases.height;
}

pion.databases.config_store = new dojox.data.XmlStore({url: '/config/databases'});

// fetchItemByIdentity and getIdentity are needed for dijit.form.FilteringSelect and pion.widgets.SimpleSelect.
pion.databases.config_store.fetchItemByIdentity = function(keywordArgs) {
	pion.databases.config_store.fetch({query: {'@id': keywordArgs.identity}, onItem: keywordArgs.onItem, onError: pion.handleFetchError});
}
pion.databases.config_store.getIdentity = function(item) {
	return pion.databases.config_store.getValue(item, '@id');
}

pion.databases._adjustAccordionSize = function() {
	var config_accordion = dijit.byId('database_config_accordion');
	var num_databases = config_accordion.getChildren().length;
	console.debug("num_databases = " + num_databases);

	var database_pane_body_height = pion.databases.selected_pane.getHeight();
	var title_height = 0;
	if (num_databases > 0) {
		var first_pane = config_accordion.getChildren()[0];
		title_height = first_pane.getTitleHeight();
	}
	var accordion_height = database_pane_body_height + num_databases * title_height;
	config_accordion.resize({h: accordion_height});

	// TODO: replace 160 with some computed value  (see pion.users._adjustAccordionSize)
	pion.databases.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.databases.height});
}

pion.databases.init = function() {
	pion.databases.selected_pane = null;

	pion.databases.getAllDatabasesInUIDirectory = function() {
		var d = new dojo.Deferred();
		var store = new dojox.data.XmlStore({url: '/config/databases/plugins'});
		store.fetch({
			onComplete: function(items) {
				var databases_in_ui_dir = dojo.map(items, function(item) {
					return store.getValue(item, 'Plugin').toString();
				});
				d.callback(databases_in_ui_dir);
			}
		});
		return d;
	}

	// databases_in_ui_dir: all Databases for which a UI was found in the UI directory 
	//                      (as specified in services.xml, in PlatformService "config-service").
	var initUsableDatabasePlugins = function(databases_in_ui_dir) {
		var d = new dojo.Deferred();
		plugin_data_store_items = [];
		dojo.forEach(databases_in_ui_dir, function(database) {
			// Skip plugins that can't be found on any of the configured plugin paths.
			if (dojo.indexOf(pion.plugins.loaded_plugins, database) != -1) {
				var prototype = pion.plugins.getPluginPrototype('plugins.databases', database, '/plugins/databases');
				plugin_data_store_items.push({plugin: database, label: prototype.label});
			}
			pion.databases.plugin_data_store = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: 'plugin',
					items: plugin_data_store_items
				}
			});
		});
		d.callback();
		return d;
	}

	var initConfiguredDatabases = function() {
		if (file_protocol) {
			pion.databases._adjustAccordionSize();
		} else {
			pion.databases.config_store.fetch({
				onComplete: function (items, request) {
					var config_accordion = dijit.byId('database_config_accordion');
					for (var i = 0; i < items.length; ++i) {
						pion.databases.createNewPaneFromItem(items[i]);
					}
					var first_pane = config_accordion.getChildren()[0];
					config_accordion.selectChild(first_pane);
				},
				onError: pion.handleFetchError
			});
		}
	}

	pion.plugins.initLoadedPluginList()
		.addCallback(pion.databases.getAllDatabasesInUIDirectory)
		.addCallback(initUsableDatabasePlugins)
		.addCallback(initConfiguredDatabases);

	function _paneSelected(pane) {
		console.debug('Selected ' + pane.title);

		var selected_pane = pion.databases.selected_pane;
		if (pane == selected_pane) {
			return;
		}
		if (selected_pane && dojo.hasClass(selected_pane.domNode, 'unsaved_changes')) {
			var dialog = new dijit.Dialog({title: "Warning: unsaved changes"});
			dialog.setContent('Please save or cancel unsaved changes before selecting another Database.');
			dialog.show();

			// Return to the previously selected pane.
			setTimeout(function(){dijit.byId('database_config_accordion').selectChild(selected_pane);}, 500);
			return;
		}

		pion.databases.selected_pane = pane;

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
			},
			onError: pion.handleFetchError
		});

		// Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
		// At that time, AccordionContainer will also be done with resizing, so it's safe to call _adjustAccordionSize().
		var slide_duration = dijit.byId('database_config_accordion').duration;
		setTimeout(function(){
						dojo.style(pane.containerNode, "overflow", "hidden");
						pion.databases._adjustAccordionSize();
					},
					slide_duration + 50);
	}

	dojo.subscribe("database_config_accordion-selectChild", _paneSelected);

	pion.databases.createNewPaneFromItem = function(item) {
		var title = pion.databases.config_store.getValue(item, 'Name');
		var plugin = pion.databases.config_store.getValue(item, 'Plugin');
		var database_pane_node = document.createElement('span');
		var pane_class_name = 'plugins.databases.' + plugin + 'Pane';
		var pane_class = dojo.getObject(pane_class_name);
		if (pane_class) {
			console.debug('found class ', pane_class_name);
			var database_pane = new pane_class({ 'class': 'database_pane', title: title }, database_pane_node);
		} else {
			console.debug('class ', pane_class_name, ' not found; using plugins.databases.DatabasePane instead.');
			var database_pane = new plugins.databases.DatabasePane({ 'class': 'database_pane', title: title }, database_pane_node);
		}
		database_pane.config_item = item;
		database_pane.uuid = pion.databases.config_store.getValue(item, '@id');
		dijit.byId('database_config_accordion').addChild(database_pane);
		return database_pane;
	}

	pion.databases.createNewPaneFromStore = function(id, database_config_page_is_selected) {
		pion.databases.config_store.fetch({
			query: {'@id': id},
			onItem: function(item) {
				var database_pane = pion.databases.createNewPaneFromItem(item);
				if (database_config_page_is_selected) {
					pion.databases._adjustAccordionSize();
					dijit.byId('database_config_accordion').selectChild(database_pane);
				}
			},
			onError: pion.handleFetchError
		});
	}

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
		var dialog = new plugins.databases.SelectPluginDialog({title: 'Select Database Plugin'});
		dialog.show();
		dialog.execute = function(dialogFields) {
			console.debug(dialogFields);
			if (plugins.databases[dialogFields.Plugin] &&
				plugins.databases[dialogFields.Plugin].edition == 'Enterprise') {
				pion.about.checkKeyStatus({success_callback: function() {_initNewDatabase(dialogFields.Plugin);}});
			} else {
				_initNewDatabase(dialogFields.Plugin);
			}
		}
	}

	function _initNewDatabase(plugin) {
		var title = 'Add New ' + plugin;
		var dialog_class_name = 'plugins.databases.' + plugin + 'InitDialog';
		var dialog_class = dojo.getObject(dialog_class_name);
		if (dialog_class) {
			console.debug('found class ', dialog_class_name);
			var dialog = new dialog_class({title: title});
		} else {
			console.debug('class ', dialog_class_name, ' not found; using plugins.databases.DatabaseInitDialog instead.');
			var dialog = new plugins.databases.DatabaseInitDialog({title: title});
		}
		dialog.setValues({Plugin: plugin});

		// Set the focus to the first input field, with a delay so that it doesn't get overridden.
		setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

		dialog.show();
		dialog.execute = function(dialogFields) {
			console.debug(dialogFields);
			var post_data = '<PionConfig><Database>';
			for (var tag in dialogFields) {
				console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
				post_data += pion.makeXmlLeafElement(tag, dialogFields[tag]);
			}
			if (this._insertCustomData) {
				this._insertCustomData();
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
					pion.databases.createNewPaneFromStore(id, true);
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
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
