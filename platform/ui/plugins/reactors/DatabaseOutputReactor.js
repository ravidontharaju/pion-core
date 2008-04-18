dojo.provide("plugins.reactors.DatabaseOutputReactor");
dojo.require("pion.databases");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojox.grid.Grid");
dojo.require("pion.terms");

dojo.declare("plugins.reactors.DatabaseOutputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'DatabaseOutputReactor';
			this.inherited("postCreate", arguments);
			this.special_config_elements.push('Field');
			var store = pion.reactors.config_store;
			var _this = this;
			this.field_mapping_table = [];
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					var field_mappings = store.getValues(item, 'Field');
					for (var i = 0; i < field_mappings.length; ++i) {
						var row = [];
						row[0] = store.getValue(field_mappings[i], 'text()');
						row[1] = store.getValue(field_mappings[i], '@term');
						_this.field_mapping_table.push(row);
					}
				}
			});
		},
		_insertCustomData: function() {
			for (var i = 0; i < this.field_mapping_table.length; ++i) {
				var row = this.field_mapping_table[i];
				console.debug('frag: <Field term="' + row[1] + '">' + row[0] + '</Field>');
				this.put_data += '<Field term="' + row[1] + '">' + row[0] + '</Field>';
			}
		}
	}
);

dojo.declare("plugins.reactors.DatabaseOutputReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/DatabaseOutputReactor/DatabaseOutputReactorInitDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.plugin = 'DatabaseOutputReactor';
			this.inherited("postCreate", arguments);
			_this = this;
			this.submit_button.onClick = function() { return _this.isValid(); };
			plugins.reactors.DatabaseOutputReactorDialog.grid_model.setData([]);
			var grid = this.grid;
			dojo.connect(grid, 'onCellClick', grid, this._handleCellClick);
			dojo.connect(this.add_new_term_button.domNode, 'click', grid, this._handleAddNewTerm);
			setTimeout(function(){
				grid.update();
				grid.resize();
			}, 200);
		},
		isValid: function() {
			if (plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount() == 0) {
				return false;
			}
			return true;
		},
		_handleCellClick: function(e) {
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			if (e.cellIndex == 2) {
				console.debug('Removing row ', e.rowIndex); 
				this.removeSelectedRows();
			}
		},
		_handleAddNewTerm: function() {
			this.addRow([]);
			//dojo.addClass(selected_pane.domNode, 'unsaved_changes');
		},
		_insertCustomData: function() {
			var num_field_mappings = plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
			for (var i = 0; i < num_field_mappings; ++i) {
				var row = plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRow(i);
				console.debug('frag: <Field term="' + row[1] + '">' + row[0] + '</Field>');
				this.post_data += '<Field term="' + row[1] + '">' + row[0] + '</Field>';
			}
		}
	}
);

dojo.declare("plugins.reactors.DatabaseOutputReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/DatabaseOutputReactor/DatabaseOutputReactorDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			this.reactor.field_mapping_table = [];
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.reactor.config['@id']},
				onItem: function(item) {
					var field_mappings = store.getValues(item, 'Field');
					for (var i = 0; i < field_mappings.length; ++i) {
						var row = [];
						row[0] = store.getValue(field_mappings[i], 'text()');
						row[1] = store.getValue(field_mappings[i], '@term');
						console.debug('row = ', row);
						_this.reactor.field_mapping_table.push(row);
					}
					plugins.reactors.DatabaseOutputReactorDialog.grid_model.setData(_this.reactor.field_mapping_table);
					var grid = _this.grid;
					dojo.connect(grid, 'onCellClick', grid, _this._handleCellClick);
					dojo.connect(_this.add_new_term_button.domNode, 'click', grid, _this._handleAddNewTerm);
					setTimeout(function(){
						grid.update();
						grid.resize();
					}, 200);
				}
			});
		},
		_handleCellClick: function(e) {
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			if (e.cellIndex == 2) {
				console.debug('Removing row ', e.rowIndex); 
				this.removeSelectedRows();
			}
		},
		_handleAddNewTerm: function() {
			this.addRow([]);
			//dojo.addClass(selected_pane.domNode, 'unsaved_changes');
		},
		_insertCustomData: function() {
			var num_field_mappings = plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
			for (var i = 0; i < num_field_mappings; ++i) {
				var row = plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRow(i);
				console.debug('frag: <Field term="' + row[1] + '">' + row[0] + '</Field>');
				this.put_data += '<Field term="' + row[1] + '">' + row[0] + '</Field>';
			}
		}
	}
);

plugins.reactors.DatabaseOutputReactorDialog.grid_model = new dojox.grid.data.Table(null, []);

plugins.reactors.DatabaseOutputReactorDialog.grid_layout = [{
	rows: [[
		{ name: 'Field Name', styles: '', width: 'auto', 
			editor: dojox.grid.editors.Input},
		{ name: 'Term', styles: '', 
			editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
			editorProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" }, width: 'auto'},
		{ name: 'Delete', styles: 'align: center;', width: 3, 
		  value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
	]]
}];

