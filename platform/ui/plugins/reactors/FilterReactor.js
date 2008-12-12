dojo.provide("plugins.reactors.FilterReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");
dojo.require("pion.terms");

dojo.declare("plugins.reactors.FilterReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function() {
			this.config.Plugin = 'FilterReactor';
			this.inherited("postCreate", arguments);
			this.special_config_elements.push('Comparison');
			this.comparison_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.comparison_store.next_id = 0;
			this._populateComparisonStore();
		},
		reloadComparisonStore: function() {
			// First empty this.comparison_store.
			var _this = this;
			this.comparison_store.fetch({
				onItem: function(item) {
					_this.comparison_store.deleteItem(item);
				},
				onComplete: function() {
					// Then repopulate this.comparison_store from the Reactor's configuration.
					_this._populateComparisonStore();
				},
				onError: pion.handleFetchError
			});
		},
		onDonePopulatingComparisonStore: function() {
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
							Type: store.getValue(comparisons[i], 'Type')
						}
						if (store.hasAttribute(comparisons[i], 'Value'))
							comparison_item.Value = store.getValue(comparisons[i], 'Value');
						_this.comparison_store.newItem(comparison_item);
					}
				},
				onComplete: function() {
					// At this point, _this.comparison_store reflects the Reactor's current configuration,
					// so update _this.custom_put_data_from_config.
					_this.updateNamedCustomPutData('custom_put_data_from_config');

					_this.onDonePopulatingComparisonStore();
				},
				onError: pion.handleFetchError
			});
		},
		// _updateCustomData() is called after a successful PUT request.
		_updateCustomData: function() {
			this.custom_put_data_from_config = this.custom_put_data_from_comparison_store;
		},
		// _insertCustomData() is called when moving the Reactor.
		_insertCustomData: function() {
			this.put_data += this.custom_put_data_from_config;
		},
		updateNamedCustomPutData: function(property_to_update) {
			var put_data = '';
			var _this = this;
			var store = this.comparison_store;
			store.fetch({
				onItem: function(item) {
					put_data += '<Comparison>';
					put_data += '<Term>' + store.getValue(item, 'Term') + '</Term>';
					put_data += '<Type>' + store.getValue(item, 'Type') + '</Type>';
					var value = store.getValue(item, 'Value');
					if (value && value.toString())
						put_data += '<Value>' + dojox.dtl._base.escape(value.toString()) + '</Value>';
					put_data += '</Comparison>';
				},
				onComplete: function() {
					_this[property_to_update] = put_data;
				},
				onError: pion.handleFetchError
			});
		}
	}
);

plugins.reactors.FilterReactor.label = 'Filter Reactor';

dojo.declare("plugins.reactors.FilterReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/FilterReactor/FilterReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			var h = dojo.connect(this.reactor, 'onDonePopulatingComparisonStore', function() {
				_this._updateCustomPutDataFromComparisonStore();
				_this.connect(_this.reactor.comparison_store, 'onNew', '_updateCustomPutDataFromComparisonStore');
				_this.connect(_this.reactor.comparison_store, 'onSet', '_updateCustomPutDataFromComparisonStore');
				_this.connect(_this.reactor.comparison_store, 'onDelete', '_updateCustomPutDataFromComparisonStore');
				dojo.disconnect(h);
			});
			this.reactor.reloadComparisonStore();
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
						formatter: function(d) {
							if (d && d.toString()) {
								return dojox.dtl._base.escape(d.toString());
							} else {
								return this.defaultValue
							}
						} },
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
			this.comparison_grid.connect(this.comparison_grid, 'onCellClick', _this._handleCellClick);

			// Arrange for destroyRecursive() to get called when the dialog is closed.
			// This will, among other things, disconnect all the connections made via _Widget.connect().
			// TODO: Move to ReactorDialog.postCreate()?
			this.connect(this, "onCancel", function() {this.destroyRecursive(false)});

			// TODO: Move to ReactorDialog.postCreate()?
			// 		 Call destroyRecursive() at end of ReactorDialog.execute() instead?
			// It would be nicer to connect to onExecute() instead, or better yet, to hide() in place of
			// both onCancel() and execute(), but either would cause destroy() to be called before
			// execute(), and then execute() wouldn't have access to the dialog fields.
			this.connect(this, "execute", function() {this.destroyRecursive(false)});
		},
		uninitialize: function() {
			this.inherited("uninitialize", arguments);

			// In IE7, the grid has already been destroyed at this point, so this check
			// avoids crashing due to trying to destroy it again.
			if (this.comparison_grid.domNode) {
				this.comparison_grid.destroy();
			}
		},
		// _updateCustomPutDataFromComparisonStore() will be passed arguments related to the item which triggered the call, which we ignore.
		_updateCustomPutDataFromComparisonStore: function() {
			this.reactor.updateNamedCustomPutData('custom_put_data_from_comparison_store');
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save Reactor'.
		_insertCustomData: function() {
			this.put_data += this.reactor.custom_put_data_from_comparison_store;
		},
		_handleCellClick: function(e) {
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			if (e.cellIndex == 1) { // clicked in comparison column
				var item = this.getItem(e.rowIndex);
				var term = this.store.getValue(item, 'Term').toString();
				console.debug('term = ', term, ', pion.terms.categories_by_id[term] = ', pion.terms.categories_by_id[term]);
				this.structure[0].rows[1].widgetProps.query.category = pion.terms.categories_by_id[term];
			} else if (e.cellIndex == 3) { // clicked in delete column
				console.debug('Removing row ', e.rowIndex); 
				this.store.deleteItem(this.getItem(e.rowIndex));
			}
		},
		_handleAddNewComparison: function() {
			this.reactor.comparison_store.newItem({ID: this.reactor.comparison_store.next_id++});
		}
	}
);

plugins.reactors.FilterReactor.option_defaults = {
	MatchAllValues: false
}
