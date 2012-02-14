dojo.provide("plugins.reactors.FissionReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("pion.terms");
dojo.require("pion.codecs");
dojo.require("pion.widgets.TermTextBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");

dojo.declare("plugins.reactors.FissionReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function() {
			this.config.Plugin = 'FissionReactor';
			this.inherited("postCreate", arguments); 
			this.special_config_elements.push('CopyTerm');
			this.copy_term_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.copy_term_store.next_id = 0;
			this._populateCopyTermStore();
		},
		reloadCopyTermStore: function() {
			// First empty this.copy_term_store.
			var _this = this;
			this.copy_term_store.fetch({
				onItem: function(item) {
					_this.copy_term_store.deleteItem(item);
				},
				onComplete: function() {
					// Then repopulate this.copy_term_store from the Reactor's configuration.
					_this._populateCopyTermStore();
				},
				onError: pion.handleFetchError
			});
		},
		onDonePopulatingCopyTermStore: function() {
		},
		_populateCopyTermStore: function() {
			var _this = this;
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					var copy_terms = store.getValues(item, 'CopyTerm');
					for (var i = 0; i < copy_terms.length; ++i) {
						var copy_term_item = {
							ID: _this.copy_term_store.next_id++,
							Term: copy_terms[i]
						}
						_this.copy_term_store.newItem(copy_term_item);
					}
				},
				onComplete: function() {
					// At this point, _this.copy_term_store reflects the Reactor's current configuration,
					// so update _this.custom_put_data_from_config.
					_this.updateNamedCustomPutData('custom_put_data_from_config');

					_this.onDonePopulatingCopyTermStore();
				},
				onError: pion.handleFetchError
			});
		},
		// _updateCustomData() is called after a successful PUT request.
		_updateCustomData: function() {
			this.custom_put_data_from_config = this.custom_put_data_from_copy_term_store;
		},
		// _insertCustomData() is called when moving the Reactor.
		_insertCustomData: function() {
			this.put_data += this.custom_put_data_from_config;
		},
		updateNamedCustomPutData: function(property_to_update) {
			var put_data = '';
			var _this = this;
			var store = this.copy_term_store;
			store.fetch({
				onItem: function(item) {
					put_data += pion.makeXmlLeafElement('CopyTerm', store.getValue(item, 'Term'));
				},
				onComplete: function() {
					_this[property_to_update] = put_data;
				},
				onError: pion.handleFetchError
			});
		}
	}
);

plugins.reactors.FissionReactor.label = 'Fission Reactor';

plugins.reactors.FissionReactor.option_defaults = {
	CopyAllTerms: false
}

dojo.declare("plugins.reactors.FissionReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/FissionReactor/FissionReactorInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
		}
	}
);

dojo.declare("plugins.reactors.FissionReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/FissionReactor/FissionReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
			var _this = this;
			this.add_new_copy_term_button.onClick = function() { _this._handleAddNewCopyTerm(); return false; };
			var h = dojo.connect(this.reactor, 'onDonePopulatingCopyTermStore', function() {
				_this._updateCustomPutDataFromCopyTermStore();
				_this.connect(_this.reactor.copy_term_store, 'onSet', '_updateCustomPutDataFromCopyTermStore');
				_this.connect(_this.reactor.copy_term_store, 'onDelete', '_updateCustomPutDataFromCopyTermStore');
				dojo.disconnect(h);
			});
			this.reactor.reloadCopyTermStore();
			this.copy_term_grid_layout = [{
				rows: [
					{ field: 'Term', name: 'Term', relWidth: 1, editable: true,
						type: pion.widgets.TermTextCell },
					{ name: 'Delete', classes: 'delete button', formatter: pion.makeDeleteButton }
				]
			}];
			this.copy_term_grid = new dojox.grid.DataGrid({
				store: this.reactor.copy_term_store,
				structure: this.copy_term_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
			this.copy_term_grid_node.appendChild(this.copy_term_grid.domNode);
			this.copy_term_grid.startup();
			this.copy_term_grid.connect(this.copy_term_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				}
			});
		},
		// _updateCustomPutDataFromCopyTermStore() will be passed arguments related to the item which triggered the call, which we ignore.
		_updateCustomPutDataFromCopyTermStore: function() {
			this.reactor.updateNamedCustomPutData('custom_put_data_from_copy_term_store');
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save Reactor'.
		_insertCustomData: function() {
			this.put_data += this.reactor.custom_put_data_from_copy_term_store;
		},
		_handleAddNewCopyTerm: function() {
			this.reactor.copy_term_store.newItem({ID: this.reactor.copy_term_store.next_id++});
		}
	}
);
