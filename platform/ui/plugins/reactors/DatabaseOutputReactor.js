dojo.provide("plugins.reactors.DatabaseOutputReactor");
dojo.require("pion.databases");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");
dojo.require("pion.terms");

dojo.declare("plugins.reactors.DatabaseOutputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'DatabaseOutputReactor';
			this.inherited("postCreate", arguments);
			this.special_config_elements.push('Field');
			this.field_mapping_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.field_mapping_store.next_id = 0;
			this._populateFieldMappingStore();
		},
		reloadFieldMappingStore: function() {
			// First empty this.field_mapping_store.
			var _this = this;
			this.field_mapping_store.fetch({
				onItem: function(item) {
					_this.field_mapping_store.deleteItem(item);
				},
				onComplete: function() {
					// Then repopulate this.field_mapping_store from the Reactor's configuration.
					_this._populateFieldMappingStore();
				},
				onError: pion.handleFetchError
			});
		},
		onDonePopulatingFieldMappingStore: function() {
		},
		_populateFieldMappingStore: function() {
			var _this = this;
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					dojo.forEach(store.getValues(item, 'Field'), function(field_mapping) {
						_this.field_mapping_store.newItem({
							ID: _this.field_mapping_store.next_id++,
							Field: store.getValue(field_mapping, 'text()'),
							Term: store.getValue(field_mapping, '@term')
						});
					});
				},
				onComplete: function() {
					// At this point, _this.field_mapping_store reflects the Reactor's current configuration,
					// so update _this.custom_put_data_from_config.
					_this.updateNamedCustomPutData('custom_put_data_from_config');

					_this.onDonePopulatingFieldMappingStore();
				},
				onError: pion.handleFetchError
			});
		},
		// _updateCustomData() is called after a successful PUT request.
		_updateCustomData: function() {
			this.custom_put_data_from_config = this.custom_put_data_from_field_mapping_store;
		},
		// _insertCustomData() is called when moving the Reactor.
		_insertCustomData: function() {
			this.put_data += this.custom_put_data_from_config;
		},
		updateNamedCustomPutData: function(property_to_update) {
			var put_data = '';
			var _this = this;
			var store = this.field_mapping_store;
			store.fetch({
				onItem: function(item) {
					put_data += '<Field term="' + store.getValue(item, 'Term') + '">';
					put_data += pion.escapeXml(store.getValue(item, 'Field'));
					put_data += '</Field>';
				},
				onComplete: function() {
					_this[property_to_update] = put_data;
				},
				onError: pion.handleFetchError
			});
		}
	}
);

plugins.reactors.DatabaseOutputReactor.label = 'Embedded Storage Reactor';

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
			this.connect(this.field_mapping_store, 'onNew', '_updateCustomPostDataFromFieldMappingStore');
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
					post_data += '<Field term="' + store.getValue(item, 'Term') + '">';
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
			this.field_mapping_store.newItem({ID: this.field_mapping_store.next_id++});
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
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			var h = dojo.connect(this.reactor, 'onDonePopulatingFieldMappingStore', function() {
				_this._updateCustomPutDataFromFieldMappingStore();
				_this.connect(_this.reactor.field_mapping_store, 'onNew', '_updateCustomPutDataFromFieldMappingStore');
				_this.connect(_this.reactor.field_mapping_store, 'onSet', '_updateCustomPutDataFromFieldMappingStore');
				_this.connect(_this.reactor.field_mapping_store, 'onDelete', '_updateCustomPutDataFromFieldMappingStore');
				dojo.disconnect(h);
			});
			this.reactor.reloadFieldMappingStore();
			var field_mapping_grid = new dojox.grid.DataGrid({
				store: this.reactor.field_mapping_store,
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
		// _updateCustomPutDataFromFieldMappingStore() will be passed arguments related to the item which triggered the call, which we ignore.
		_updateCustomPutDataFromFieldMappingStore: function() {
			this.reactor.updateNamedCustomPutData('custom_put_data_from_field_mapping_store');
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save Reactor'.
		_insertCustomData: function() {
			this.put_data += this.reactor.custom_put_data_from_field_mapping_store;
		},
		_handleAddNewMapping: function() {
			this.reactor.field_mapping_store.newItem({ID: this.reactor.field_mapping_store.next_id++});
		}
	}
);

plugins.reactors.DatabaseOutputReactorDialog.grid_layout = [{
	defaultCell: { editable: true, type: dojox.grid.cells._Widget },
	rows: [
		{ field: 'Field', name: 'Database Column Name', width: 20,
			widgetClass: "dijit.form.ValidationTextBox", 
			widgetProps: {regExp: "[a-zA-Z][\\w]*", required: "true", invalidMessage: "Illegal database column name" } },
		{ field: 'Term', name: 'Term', width: 'auto', 
			widgetClass: "dijit.form.FilteringSelect", 
			widgetProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" } },
		{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
			value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
	]
}];
