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
	var accordion_height = pion.databases.selected_pane.getHeight();
	dojo.forEach(config_accordion.getChildren(), function(pane) {
		accordion_height += pane._buttonWidget.getTitleHeight();
	});
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
					config_accordion.removeChild(first_pane); // Remove placeholder, which causes first remaining child to be selected.
				},
				onError: pion.handleFetchError
			});
		}
	}

	pion.plugins.initLoadedPluginList()
		.addCallback(pion.databases.getAllDatabasesInUIDirectory)
		.addCallback(initUsableDatabasePlugins)
		.addCallback(initConfiguredDatabases);

	pion.databases._replaceAccordionPane = function(old_pane) {
		var plugin = pion.databases.config_store.getValue(old_pane.config_item, 'Plugin');
		var pane_class_name = 'plugins.databases.' + plugin + 'Pane';
		var pane_class = dojo.getObject(pane_class_name);
		if (pane_class) {
			console.debug('found class ', pane_class_name);
			var new_pane = new pane_class({title: old_pane.title});
		} else {
			console.debug('class ', pane_class_name, ' not found; using plugins.databases.DatabasePane instead.');
			var new_pane = new plugins.databases.DatabasePane({title: old_pane.title});
		}
		new_pane.uuid = old_pane.uuid;
		new_pane.config_item = old_pane.config_item;
		new_pane.initialized = true;

		var config_accordion = dijit.byId("database_config_accordion");
		var idx = config_accordion.getIndexOfChild(old_pane);
		config_accordion.pendingSelection = new_pane;
		config_accordion.pendingRemoval = old_pane;
		config_accordion.addChild(new_pane, idx);
	}

	pion.databases._updatePane = function(pane) {
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

		pion.databases._adjustAccordionSize();
		dojo.style(pane.containerNode, "overflow", "hidden"); // For IE.
		// ???????????? Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
	}

	function _paneSelected(pane) {
		console.debug('Selected ' + pane.title);

		var selected_pane = pion.databases.selected_pane;
		if (pane == selected_pane) {
			return;
		}
		var config_accordion = dijit.byId("database_config_accordion");
		if (selected_pane && dojo.hasClass(selected_pane.domNode, 'unsaved_changes')) {
			var dialog = new dijit.Dialog({title: "Warning: unsaved changes"});
			dialog.attr('content', 'Please save or cancel unsaved changes before selecting another Database.');
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
					pion.databases._replaceAccordionPane(pane);
				else {
					pion.databases.selected_pane = pane;
					pion.databases._updatePane(pane);
				}
			},
			config_accordion.duration + 100
		);
	}

	function _paneAdded(pane) {
		var config_accordion = dijit.byId("database_config_accordion");
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

	dojo.subscribe("database_config_accordion-selectChild", _paneSelected);
	dojo.subscribe("database_config_accordion-addChild", _paneAdded);
	dojo.subscribe("database_config_accordion-removeChild", _paneRemoved);

	pion.databases.createNewPaneFromItem = function(item) {
		var title = pion.databases.config_store.getValue(item, 'Name').toString();
		var database_pane = new dijit.layout.ContentPane({ title: title, content: 'loading...'});
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
			if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
			this.execute_already_called = true;
			if (pion.key_service_running &&
				plugins.databases[dialogFields.Plugin] &&
				plugins.databases[dialogFields.Plugin].edition == 'Enterprise') {
				pion.about.checkKeyStatus({success_callback: function() {
					_initNewDatabase(dialogFields.Plugin);
				}});
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
		dialog.attr('value', {Plugin: plugin});

		// Set the focus to the first input field, with a delay so that it doesn't get overridden.
		setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

		dialog.show();
		dialog.execute = function(dialogFields) {
			if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
			this.execute_already_called = true;

			// TODO: override pion.databases.config_store._getPostContent() (see XmlStore._getPostContent())
			// with the code below to build the post data.
			// Then we can get rid of createNewPaneFromStore(), and do the following here:
			// 		var item = pion.databases.config_store.newItem({...});
			// 		pion.databases.createNewPaneFromItem(item);

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
