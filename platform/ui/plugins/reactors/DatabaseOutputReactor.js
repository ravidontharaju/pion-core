dojo.provide("plugins.reactors.DatabaseOutputReactor");
dojo.require("pion.databases");
dojo.require("pion.widgets.TermTextBox");
dojo.require("pion.widgets.SimpleSelect");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.form.Button");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");

dojo.declare("plugins.reactors.DatabaseOutputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'DatabaseOutputReactor';
			this.inherited("postCreate", arguments);
			this._initOptions(this.config, plugins.reactors.DatabaseOutputReactor.option_defaults);
			this.special_config_elements.push('Comparison', 'Field');
			this.field_mapping_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.field_mapping_store.next_id = 0;
			this.comparison_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.comparison_store.next_id = 0;
			this.prepareToHandleLoadNotification();
			this._populateComparisonStore();
			this._populateFieldMappingStore();
		},
		prepareToHandleLoadNotification: function() {
			this.comparison_store_is_ready = false;
			this.field_mapping_store_is_ready = false;
			var h1 = this.connect(this, 'onDonePopulatingComparisonStore', function() {
				this.disconnect(h1);
				this._updatePutDataIfGridStoresReady();
			});
			var h2 = this.connect(this, 'onDonePopulatingFieldMappingStore', function() {
				this.disconnect(h2);
				this._updatePutDataIfGridStoresReady();
			});
		},
		_updatePutDataIfGridStoresReady: function() {
			if (this.comparison_store_is_ready && this.field_mapping_store_is_ready) {
				this.updateNamedCustomPutData('custom_put_data_from_config');
				this.comparison_store_is_ready = false;
				this.field_mapping_store_is_ready = false;
				this.onDonePopulatingGridStores();
			}
		},
		onDonePopulatingGridStores: function() {
		},
		reloadGridStores: function() {
			// Delete all items from this.comparison_store, then repopulate
			// it from the Reactor's configuration.
			var _this = this;
			this.comparison_store.fetch({
				onItem: function(item) {
					_this.comparison_store.deleteItem(item);
				},
				onComplete: function() {
					_this._populateComparisonStore();
				},
				onError: pion.handleFetchError
			});

			// Delete all items from this.field_mapping_store, then repopulate
			// it from the Reactor's configuration.
			this.field_mapping_store.fetch({
				onItem: function(item) {
					_this.field_mapping_store.deleteItem(item);
				},
				onComplete: function() {
					_this._populateFieldMappingStore();
				},
				onError: pion.handleFetchError
			});

			this.prepareToHandleLoadNotification();
		},
		_populateComparisonStore: function() {
			var _this = this;
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					var comparisons = store.getValues(item, 'Comparison');
					for (var i = 0; i < comparisons.length; ++i) {
						var comparison_item = {
							ID: _this.comparison_store.next_id++,
							Term: store.getValue(comparisons[i], 'Term'),
							Type: store.getValue(comparisons[i], 'Type'),
							MatchAllValues: _this.getOptionalBool(store, comparisons[i], 'MatchAllValues')
						}
						if (store.hasAttribute(comparisons[i], 'Value'))
							comparison_item.Value = store.getValue(comparisons[i], 'Value');
						_this.comparison_store.newItem(comparison_item);
					}
				},
				onComplete: function() {
					_this.comparison_store_is_ready = true;
					_this.onDonePopulatingComparisonStore();
				},
				onError: pion.handleFetchError
			});
		},
		onDonePopulatingComparisonStore: function() {
		},
		_populateFieldMappingStore: function() {
			var _this = this;
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					dojo.forEach(store.getValues(item, 'Field'), function(field_mapping) {
						// Read.js stipulates that if an attribute is not present, getValue() should return undefined,
						// but XmlStore.getValue() returns null (and XmlStore.hasAttribute() incorrectly returns true).
						// See http://bugs.dojotoolkit.org/ticket/9419
						var index = store.getValue(field_mapping, '@index');
						var index_present = (index !== undefined && index !== null);
						var sql_type = store.getValue(field_mapping, '@sql');
						var sql_type_present = (sql_type !== undefined && sql_type !== null);

						var new_item = {
							ID: _this.field_mapping_store.next_id++,
							Field: store.getValue(field_mapping, 'text()'),
							Term: store.getValue(field_mapping, '@term')
						};
						if (index_present) {
							if (index == 'false' || index == 'true' || index == 'unique') {
								new_item.IndexOption = index;
							} else {
								new_item.IndexOption = 'custom';
							}
							new_item.Index = index; // Won't be displayed, but needs to be saved.
						} else {
							new_item.IndexOption = 'false';
						}
						if (sql_type_present) {
							new_item.SqlType = sql_type; // Won't be displayed, but needs to be saved.
						}
						_this.field_mapping_store.newItem(new_item);
					});
				},
				onComplete: function() {
					_this.field_mapping_store_is_ready = true;
					_this.onDonePopulatingFieldMappingStore();
				},
				onError: pion.handleFetchError
			});
		},
		onDonePopulatingFieldMappingStore: function() {
		},
		// _updateCustomData() is called after a successful PUT request.
		_updateCustomData: function() {
			this.custom_put_data_from_config = this.custom_put_data_from_grid_stores;
		},
		// _insertCustomData() is called when moving the Reactor.
		_insertCustomData: function() {
			this.put_data += this.custom_put_data_from_config;
		},
		updateNamedCustomPutData: function(property_to_update) {
			var put_data = '';
			var _this = this;
			var c_store = this.comparison_store;
			var fm_store = this.field_mapping_store;
			c_store.fetch({
				onItem: function(item) {
					put_data += '<Comparison>';
					put_data += '<Term>' + c_store.getValue(item, 'Term') + '</Term>';
					put_data += '<Type>' + c_store.getValue(item, 'Type') + '</Type>';
					if (c_store.hasAttribute(item, 'Value'))
						put_data += pion.makeXmlLeafElement('Value', c_store.getValue(item, 'Value'));
					put_data += '<MatchAllValues>' + c_store.getValue(item, 'MatchAllValues') + '</MatchAllValues>';
					put_data += '</Comparison>';
				},
				onComplete: function() {
					fm_store.fetch({
						onItem: function(item) {
							put_data += '<Field term="' + fm_store.getValue(item, 'Term') + '"';
							var index = fm_store.getValue(item, 'Index');
							var index_option = fm_store.getValue(item, 'IndexOption');
							if (index_option == 'custom') {
								put_data += ' index="' + index + '"';
							} else if (index_option == 'false') {
								// Since 'false' is the default, don't insert 'index' attribute unless
								// it was explicitly set to 'false' in the original configuration.
								if (index == 'false') {
									put_data += ' index="false"';
								}
							} else { // i.e. 'true' or 'unique'
								put_data += ' index="' + index_option + '"';
							}
							if (fm_store.hasAttribute(item, 'SqlType')) {
								put_data += ' sql="' + fm_store.getValue(item, 'SqlType') + '"';
							}
							put_data += '>';
							put_data += pion.escapeXml(fm_store.getValue(item, 'Field'));
							put_data += '</Field>';
						},
						onComplete: function() {
							_this[property_to_update] = put_data;
						},
						onError: pion.handleFetchError
					});
				},
				onError: pion.handleFetchError
			});
		}
	}
);

plugins.reactors.DatabaseOutputReactor.label = 'Embedded Storage Reactor';


plugins.reactors.DatabaseOutputReactor.option_defaults = {
	IgnoreInsert: false,
	MatchAllComparisons: false
};

plugins.reactors.DatabaseOutputReactor.grid_option_defaults = {
	MatchAllValues: false
};

dojo.declare("plugins.reactors.DatabaseOutputReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "storage/DatabaseOutputReactor/DatabaseOutputReactorInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.plugin = 'DatabaseOutputReactor';
			this.inherited("postCreate", arguments);
			this.field_mapping_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.field_mapping_store.next_id = 0;
			this.custom_post_data_from_field_mapping_store = '';
			this.connect(this.field_mapping_store, 'onSet', '_updateCustomPostDataFromFieldMappingStore');
			this.connect(this.field_mapping_store, 'onDelete', '_updateCustomPostDataFromFieldMappingStore');
			var field_mapping_grid = new dojox.grid.DataGrid({
				store: this.field_mapping_store,
				structure: plugins.reactors.DatabaseOutputReactorDialog.grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
			this.field_mapping_grid_node.appendChild(field_mapping_grid.domNode);
			field_mapping_grid.startup();
			field_mapping_grid.connect(field_mapping_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				}
			});
		},
		// _updateCustomPostDataFromFieldMappingStore() will be passed arguments related to the item which triggered the call, which we ignore.
		_updateCustomPostDataFromFieldMappingStore: function() {
			var post_data = '';
			var _this = this;
			var store = this.field_mapping_store;
			store.fetch({
				onItem: function(item) {
					post_data += '<Field term="' + store.getValue(item, 'Term') + '"';
					var index_option = store.getValue(item, 'IndexOption');
					if (index_option != 'false') { // i.e. 'true' or 'unique'
						post_data += ' index="' + index_option + '"';
					}
					post_data += '>';
					post_data += pion.escapeXml(store.getValue(item, 'Field'));
					post_data += '</Field>';
				},
				onComplete: function() {
					_this.custom_post_data_from_field_mapping_store = post_data;
				},
				onError: pion.handleFetchError
			});
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save'.
		_insertCustomData: function() {
			this.post_data += this.custom_post_data_from_field_mapping_store;
		},
		_handleAddNewMapping: function() {
			this.field_mapping_store.newItem({
				ID: this.field_mapping_store.next_id++,
				IndexOption: 'false'
			});
		}
	}
);

dojo.declare("plugins.reactors.DatabaseOutputReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "storage/DatabaseOutputReactor/DatabaseOutputReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
			this.reactor._initOptions(this.reactor.config, plugins.reactors.DatabaseOutputReactor.option_defaults);
			var _this = this;
			var h = dojo.connect(this.reactor, 'onDonePopulatingGridStores', function() {
				_this._updateCustomPutDataFromGridStores();
				_this._checkForUniqueIndex();
				_this.connect(_this.reactor.comparison_store, 'onSet', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.comparison_store, 'onDelete', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.field_mapping_store, 'onSet', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.field_mapping_store, 'onDelete', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.field_mapping_store, 'onSet', '_checkForUniqueIndex');
				_this.connect(_this.reactor.field_mapping_store, 'onDelete', '_checkForUniqueIndex');
				dojo.disconnect(h);
			});
			this.reactor.reloadGridStores();

			this.comparison_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Term', name: 'Term', width: 20, 
						type: pion.widgets.TermTextCell },
					{ field: 'Type', name: 'Comparison', width: 15, 
						widgetClass: pion.widgets.SimpleSelect, 
						widgetProps: {store: pion.reactors.comparison_type_store, query: {category: 'generic'}} },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ field: 'MatchAllValues', name: 'Match All', width: 3, 
						type: dojox.grid.cells.Bool},
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false, formatter: pion.makeDeleteButton }
				]
			}];
			this.comparison_grid = new dojox.grid.DataGrid({
				store: this.reactor.comparison_store,
				structure: this.comparison_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
			this.comparison_grid._prev_term_type_category = this.comparison_grid.structure[0].rows[1].widgetProps.query.category;
			this.comparison_grid_node.appendChild(this.comparison_grid.domNode);
			this.comparison_grid.startup();
			this.comparison_grid.connect(this.comparison_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Comparison') {
					var item = this.getItem(e.rowIndex);
					var term = this.store.getValue(item, 'Term').toString();
					if (pion.terms.categories_by_id[term] != this._prev_term_type_category) {
						this._prev_term_type_category = pion.terms.categories_by_id[term];
						if (e.cell.widget) {
							e.cell.widget.setQuery({category: pion.terms.categories_by_id[term]});
						} else {
							// Since the widget hasn't been created yet, we can just change widgetProps.query. 
							// (Note that with FilteringSelect, setting widgetProps.query has the desired effect even
							// when the widget already exists.)
							this.structure[0].rows[1].widgetProps.query.category = pion.terms.categories_by_id[term];
						}
					}
				} else if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				}
			});

			var field_mapping_grid = new dojox.grid.DataGrid({
				store: this.reactor.field_mapping_store,
				structure: plugins.reactors.DatabaseOutputReactorDialog.grid_layout,
				singleClickEdit: true
			}, document.createElement('div'));
			this.field_mapping_grid_node.appendChild(field_mapping_grid.domNode);
			field_mapping_grid.startup();
			field_mapping_grid.connect(field_mapping_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				}
			});
			field_mapping_grid.canEdit = function(cell, row_index) {
				switch (cell.name) {
					// Disable editing of 'Index' cell if value is 'custom'.
					case 'Index':
						var item = this.getItem(row_index);
						var index_option = this.store.getValue(item, 'IndexOption').toString();
						return index_option != 'custom';

					default:
						return true;
				}
			}

			// See comments in FilterReactorDialog.postCreate() before copying these anywhere.
			// Adding these fixed a problem where opening the configuration dialog for the second (or later) time
			// was taking much longer than the first time, due to the connection to 'onDelete' not going away, which
			// caused reloadFieldMappingStore() to take forever, since _updateCustomPutDataFromFieldMappingStore()
			// was getting called for each item that was deleted.
			this.connect(this, "onCancel", function() {this.destroyRecursive(false)});
			this.connect(this, "execute", function() {this.destroyRecursive(false)});
		},
		_onUpdateMatchAllComparisons: function(e) {
			this.reactor.comparison_store.match_all_comparisons = e.target.checked;
			this.reactor.updateNamedCustomPutData('custom_put_data_from_grid_stores');
		},
		// _updateCustomPutDataFromGridStores() will be passed arguments related to the item which triggered the call, which we ignore.
		_updateCustomPutDataFromGridStores: function() {
			this.reactor.updateNamedCustomPutData('custom_put_data_from_grid_stores');
		},
		_checkForUniqueIndex: function() {
			// This is called whenever a field mapping row is changed or deleted.
			// If there is any 'Index' cell with value 'unique' or 'custom', the "key cache" parameter edit boxes 
			// are enabled, otherwise they are disabled and their values cleared.
			// (A custom index is treated as unique because it might be unique; it's the server's job to return an 
			// error if there are custom indexes, but no unique indexes (custom or otherwise), and a non-zero
			// Key Cache Max Age is specified.)
			var _this = this;
			var unique_index_exists = false;
			var fm_store = this.reactor.field_mapping_store;
			fm_store.fetch({
				onItem: function(item) {
					var index = fm_store.getValue(item, 'Index');
					var index_option = fm_store.getValue(item, 'IndexOption');
					if (index_option == 'unique' || index_option == 'custom') {
						unique_index_exists = true;
					}
				},
				onComplete: function() {
					if (unique_index_exists) {
						dojo.removeClass(_this.key_cache_max_age_label, 'disabled');
						_this.key_cache_max_age.attr('disabled', false);
						dojo.removeClass(_this.key_cache_age_term_label, 'disabled');
						_this.key_cache_age_term.attr('disabled', false);
					} else {
						dojo.addClass(_this.key_cache_max_age_label, 'disabled');
						_this.key_cache_max_age.attr('disabled', true);
						_this.key_cache_max_age.attr('value', '');
						dojo.addClass(_this.key_cache_age_term_label, 'disabled');
						_this.key_cache_age_term.attr('disabled', true);
						_this.key_cache_age_term.attr('value', '');
					}
				},
				onError: pion.handleFetchError
			});
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save Reactor'.
		_insertCustomData: function() {
			this.put_data += this.reactor.custom_put_data_from_grid_stores;
		},
		_handleAddNewComparison: function() {
			this.reactor.comparison_store.newItem({
				ID: this.reactor.comparison_store.next_id++,
				MatchAllValues: false
			});
		},
		_handleAddNewMapping: function() {
			this.reactor.field_mapping_store.newItem({
				ID: this.reactor.field_mapping_store.next_id++,
				IndexOption: 'false'
			});
		}
	}
);

plugins.reactors.DatabaseOutputReactorDialog.grid_layout = [{
	defaultCell: { editable: true, type: dojox.grid.cells._Widget },
	rows: [
		{ field: 'Field', name: 'Database Column Name', width: 20,
			widgetClass: dijit.form.ValidationTextBox, 
			widgetProps: {regExp: "[a-zA-Z][\\w]*", required: "true", invalidMessage: "Illegal database column name" } },
		{ field: 'Term', name: 'Term', width: 'auto', 
			type: pion.widgets.TermTextCell },
		{ field: 'IndexOption', name: 'Index', styles: 'text-align: center;', width: 4, 
			type: dojox.grid.cells.Select, options: ['true', 'false', 'unique'] },
		{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
			formatter: function() { return pion.makeDeleteButton(); } // This looks redundant, but pion.makeDeleteButton() isn't defined yet when this file is loaded.
		}
	]
}];
