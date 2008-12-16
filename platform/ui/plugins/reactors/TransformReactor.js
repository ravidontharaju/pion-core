dojo.provide("plugins.reactors.TransformReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");
dojo.require("pion.terms");

dojo.declare("plugins.reactors.TransformReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function() {
			this.config.Plugin = 'TransformReactor';
			this.inherited("postCreate", arguments);
			this._initOptions(this.config, plugins.reactors.TransformReactor.option_defaults);
			this.special_config_elements.push('Comparison');
			this.special_config_elements.push('Transformation');

			// Create and populate two datastores, one for the Comparison grid and one for the Tranformation grid.
			this.comparison_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.comparison_store.next_id = 0;
			this.transformation_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.transformation_store.next_id = 0;
			this.prepareToHandleLoadNotification();
			this._populateComparisonStore();
			this._populateTransformationStore();
		},
		prepareToHandleLoadNotification: function() {
			this.comparison_store_is_ready = false;
			this.transformation_store_is_ready = false;
			var h1 = this.connect(this, 'onDonePopulatingComparisonStore', function() {
				this.disconnect(h1);
				this._updatePutDataIfGridStoresReady();
			});
			var h2 = this.connect(this, 'onDonePopulatingTransformationStore', function() {
				this.disconnect(h2);
				this._updatePutDataIfGridStoresReady();
			});
		},
		_updatePutDataIfGridStoresReady: function() {
			if (this.comparison_store_is_ready && this.transformation_store_is_ready) {
				this.updateNamedCustomPutData('custom_put_data_from_config');
				this.comparison_store_is_ready = false;
				this.transformation_store_is_ready = false;
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

			// Delete all items from this.transformation_store, then repopulate
			// it from the Reactor's configuration.
			var _this = this;
			this.transformation_store.fetch({
				onItem: function(item) {
					_this.transformation_store.deleteItem(item);
				},
				onComplete: function() {
					_this._populateTransformationStore();
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
					dojo.forEach(store.getValues(item, 'Comparison'), function(comparison) {
						var comparison_item = {
							ID: _this.comparison_store.next_id++,
							Term: store.getValue(comparison, 'Term'),
							Type: store.getValue(comparison, 'Type')
						}
						if (store.hasAttribute(comparison, 'Value'))
							comparison_item.Value = store.getValue(comparison, 'Value');
						_this.comparison_store.newItem(comparison_item);
					});
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
		_populateTransformationStore: function() {
			var _this = this;
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					var getBool = plugins.reactors.TransformReactor.getBool;
					dojo.forEach(store.getValues(item, 'Transformation'), function(transformation) {
						var transformation_item = {
							ID: _this.transformation_store.next_id++,
							Term: store.getValue(transformation, 'Term'),
							Type: store.getValue(transformation, 'Type'),
							MatchAllValues: getBool(store, transformation, 'MatchAllValues'),
							SetValue: store.getValue(transformation, 'SetValue'),
							InPlace: getBool(store, transformation, 'InPlace')
						}
						if (store.hasAttribute(transformation, 'Value'))
							transformation_item.Value = store.getValue(transformation, 'Value');
						if (store.hasAttribute(transformation, 'SetTerm'))
							transformation_item.SetTerm = store.getValue(transformation, 'SetTerm');
						_this.transformation_store.newItem(transformation_item);
					});
				},
				onComplete: function() {
					_this.transformation_store_is_ready = true;
					_this.onDonePopulatingTransformationStore();
				},
				onError: pion.handleFetchError
			});
		},
		onDonePopulatingTransformationStore: function() {
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
			var t_store = this.transformation_store;
			c_store.fetch({
				onItem: function(item) {
					put_data += '<Comparison>';
					put_data += '<Term>' + c_store.getValue(item, 'Term') + '</Term>';
					put_data += '<Type>' + c_store.getValue(item, 'Type') + '</Type>';
					if (t_store.hasAttribute(item, 'Value'))
						put_data += pion.makeXmlLeafElement('Value', t_store.getValue(item, 'Value'));
					put_data += '</Comparison>';
				},
				onComplete: function() {
					t_store.fetch({
						onItem: function(item) {
							put_data += '<Transformation>';
							put_data += '<Term>' + t_store.getValue(item, 'Term') + '</Term>';
							put_data += '<Type>' + t_store.getValue(item, 'Type') + '</Type>';
							if (t_store.hasAttribute(item, 'Value'))
								put_data += pion.makeXmlLeafElement('Value', t_store.getValue(item, 'Value'));
							put_data += '<MatchAllValues>' + t_store.getValue(item, 'MatchAllValues') + '</MatchAllValues>';
							if (t_store.hasAttribute(item, 'SetValue'))
								put_data += pion.makeXmlLeafElement('SetValue', t_store.getValue(item, 'SetValue'));
							put_data += '<InPlace>' + t_store.getValue(item, 'InPlace') + '</InPlace>';
							var set_term = t_store.getValue(item, 'SetTerm');
							if (set_term && set_term.toString())
								put_data += '<SetTerm>' + set_term + '</SetTerm>';
							put_data += '</Transformation>';
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

plugins.reactors.TransformReactor.label = 'Transformation Reactor';

dojo.declare("plugins.reactors.TransformReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/TransformReactor/TransformReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
			plugins.reactors.TransformReactor.outgoing_event_type_store = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: 'id',
					items: [{id: 'Same as input event'}]
				}
			});
		},
		widgetsInTemplate: true,
 		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.attr('value', {DeliverOriginal: 'if-not-changed', EventType: 'Same as input event'});
			this.reactor._initOptions(this.reactor.config, plugins.reactors.TransformReactor.option_defaults);
			var _this = this;
			pion.terms.store.fetch({
				query: {Type: 'object'},
				onItem: function(item) {
					plugins.reactors.TransformReactor.outgoing_event_type_store.newItem({id: pion.terms.store.getIdentity(item)});
				},
				onComplete: function() {
					if (_this.reactor.config.EventType) {
						_this.attr('value', {EventType: _this.reactor.config.EventType});
					}
				}
			});
			var h = dojo.connect(this.reactor, 'onDonePopulatingGridStores', function() {
				_this._updateCustomPutDataFromGridStores();
				_this.connect(_this.reactor.comparison_store, 'onNew', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.comparison_store, 'onSet', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.comparison_store, 'onDelete', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.transformation_store, 'onNew', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.transformation_store, 'onSet', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.transformation_store, 'onDelete', '_updateCustomPutDataFromGridStores');
				dojo.disconnect(h);
			});
			this.reactor.reloadGridStores();

			this.comparison_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Term', name: 'Term', width: 20, 
						widgetClass: "dijit.form.FilteringSelect", 
						widgetProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" } },
					{ field: 'Type', name: 'Comparison', width: 15, 
						widgetClass: "dijit.form.FilteringSelect", 
						widgetProps: {store: pion.reactors.comparison_type_store, query: {category: 'generic'}} },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]
			}];
			this.comparison_grid = new dojox.grid.DataGrid({
				store: this.reactor.comparison_store,
				structure: this.comparison_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
			this.comparison_grid_node.appendChild(this.comparison_grid.domNode);
			this.comparison_grid.startup();
			this.comparison_grid.connect(this.comparison_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				} else if (e.cell.field == 'Type') {
					var item = this.getItem(e.rowIndex);
					var term = this.store.getValue(item, 'Term').toString();
					console.debug('term = ', term, ', pion.terms.categories_by_id[term] = ', pion.terms.categories_by_id[term]);
					this.structure[0].rows[e.cell.index].widgetProps.query.category = pion.terms.categories_by_id[term];
				}
			});
			this.comparison_grid.connect(this.comparison_grid, 'onApplyCellEdit', function(value, row_index, attr_name) {
				switch (attr_name) {
					// If 'Comparison' cell has just been set to a 'generic' comparison, no 'Value' value is 
					// allowed, so remove any value in that cell.
					case 'Type':
						var store = pion.reactors.comparison_type_store;
						var _this = this;
						store.fetchItemByIdentity({
							identity: value,
							onItem: function(item) {
								if (store.containsValue(item, 'category', 'generic')) {
									var item = _this.getItem(row_index);
									_this.store.unsetAttribute(item, 'Value');
								}
							}
						});
						break;
	
					default:
						// do nothing
				}
			});

			this.transformation_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Term', name: 'Term', width: 14, 
						widgetClass: "dijit.form.FilteringSelect", 
						widgetProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" } },
					{ field: 'Type', name: 'Comparison', width: 10, 
						widgetClass: "dijit.form.FilteringSelect", 
						widgetProps: {store: pion.reactors.comparison_type_store, query: {category: 'generic'}} },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ field: 'MatchAllValues', name: 'Match All', width: 3, 
						type: dojox.grid.cells.Bool},
					{ field: 'SetValue', name: 'Set Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ field: 'InPlace', name: 'In Place', width: 3, 
						type: dojox.grid.cells.Bool},
					{ field: 'SetTerm', name: 'Set Term', width: 14, 
						widgetClass: "dijit.form.FilteringSelect", 
						widgetProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" } },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]
			}];
			this.transformation_grid = new dojox.grid.DataGrid({
				store: this.reactor.transformation_store,
				structure: this.transformation_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
			this.transformation_grid_node.appendChild(this.transformation_grid.domNode);
			this.transformation_grid.startup();
			this.transformation_grid.connect(this.transformation_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				} else if (e.cell.field == 'Type') {
					var item = this.getItem(e.rowIndex);
					var term = this.store.getValue(item, 'Term').toString();
					console.debug('term = ', term, ', pion.terms.categories_by_id[term] = ', pion.terms.categories_by_id[term]);
					this.structure[0].rows[e.cell.index].widgetProps.query.category = pion.terms.categories_by_id[term];
				}
			});
			this.transformation_grid.connect(this.transformation_grid, 'onApplyCellEdit', function(value, row_index, attr_name) {
				switch (attr_name) {
					// If 'Comparison' cell has just been set to a 'generic' comparison, no 'Value' value is 
					// allowed, so remove any value in that cell.
					case 'Type':
						var store = pion.reactors.comparison_type_store;
						var _this = this;
						store.fetchItemByIdentity({
							identity: value,
							onItem: function(item) {
								if (store.containsValue(item, 'category', 'generic')) {
									var item = _this.getItem(row_index);
									_this.store.unsetAttribute(item, 'Value');
								}
							}
						});
						break;
	
					// If 'In Place' cell has just been set to true, no 'Set Term' value is allowed, so remove any value in that cell.
					// Otherwise, the 'Set Term' cell needs a value, so if it doesn't have one, initialize it with the Term in the first column.
					case 'InPlace':
						var item = this.getItem(row_index);
						if (value) { // i.e. both defined and having the boolean value 'true'
							this.store.unsetAttribute(item, 'SetTerm');
						} else {
							var primary_term = this.store.getValue(item, 'Term');
							this.store.setValue(item, 'SetTerm', primary_term);
						}
						break;
	
					default:
						// do nothing
				}
			});

			this.comparison_grid.canEdit = function(cell, row_index) {
				switch (cell.field) {
					// Disable editing of 'Value' cell if 'Type' cell is set to a 'generic' comparison.
					case 'Value':
						var item = this.getItem(row_index);
						var type = this.store.getValue(item, 'Type').toString();
						return dojo.indexOf(pion.reactors.generic_comparison_types, type) == -1;

					default:
						return true;
				}
			}

			this.transformation_grid.canEdit = function(cell, row_index) {
				switch (cell.field) {
					// Disable editing of 'Value' cell if 'Type' cell is set to a 'generic' comparison.
					case 'Value':
						var item = this.getItem(row_index);
						var type = this.store.getValue(item, 'Type').toString();
						return dojo.indexOf(pion.reactors.generic_comparison_types, type) == -1;

					// Disable editing of 'Set Term' cell if 'In Place' cell is set to true.
					case 'SetTerm':
						var item = this.getItem(row_index);
						var in_place = this.store.getValue(item, 'InPlace');
						return ! in_place;

					default:
						return true;
				}
			}
		},
		_handleAddNewComparison: function() {
			this.reactor.comparison_store.newItem({ID: this.reactor.comparison_store.next_id++});
		},
		_handleAddNewTransformation: function() {
			this.reactor.transformation_store.newItem({
				ID: this.reactor.transformation_store.next_id++,
				MatchAllValues: false,
				InPlace: true
			});
		},
		// _updateCustomPutDataFromGridStores() will be passed arguments related to the item which triggered the call, which we ignore.
		_updateCustomPutDataFromGridStores: function() {
			this.reactor.updateNamedCustomPutData('custom_put_data_from_grid_stores');
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save Reactor'.
		_insertCustomData: function() {
			this.put_data += this.reactor.custom_put_data_from_grid_stores;
		}
	}
);

plugins.reactors.TransformReactor.option_defaults = {
	AllConditions: false
}

plugins.reactors.TransformReactor.grid_option_defaults = {
	InPlace: false,
	MatchAllValues: false
};

plugins.reactors.TransformReactor.getBool = function(store, item, attribute) {
	if (store.hasAttribute(item, attribute))
		// convert XmlItem to string and then to boolean
		return store.getValue(item, attribute).toString() == 'true';
	else
		return plugins.reactors.TransformReactor.grid_option_defaults[attribute];
}
