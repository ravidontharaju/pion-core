dojo.provide("plugins.reactors.FilterReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojox.grid.Grid");
dojo.require("pion.terms");

dojo.declare("plugins.reactors.FilterReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'FilterReactor';
			console.debug('FilterReactor.postCreate: ', this.domNode);
			this.inherited("postCreate", arguments);
			this.special_config_elements.push('Comparison');
			var store = pion.reactors.config_store;
			var _this = this;
			this.comparison_table = [];
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					var comparisons = store.getValues(item, 'Comparison');
					for (var i = 0; i < comparisons.length; ++i) {
						var comparison_table_row = [];
						//console.debug('comparisons[', i, '] = ', comparisons[i]);
						comparison_table_row[0] = store.getValue(comparisons[i], 'Term');
						comparison_table_row[1] = store.getValue(comparisons[i], 'Type');
						comparison_table_row[2] = store.getValue(comparisons[i], 'Value');
						_this.comparison_table.push(comparison_table_row);
					}
				},
				onError: pion.handleFetchError
			});
		},
		_insertCustomData: function() {
			for (var i = 0; i < this.comparison_table.length; ++i) {
				var row = this.comparison_table[i];
				console.debug('frag: <Term>' + row[0] + '</Term><Type>' + row[1] + '</Type><Value>' + row[2] + '</Value>');
				this.put_data += '<Comparison><Term>' + row[0] + '</Term><Type>' + row[1] + '</Type><Value>' + row[2] + '</Value></Comparison>';
			}
		}
	}
);

plugins.reactors.initFilterReactorGridLayout = function() {
	plugins.reactors.filter_reactor_grid_layout = [{
		rows: [[
			{ name: 'Term', styles: '', 
				editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
				editorProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" }, width: 'auto' },
			{ name: 'Comparison', styles: '', width: 'auto', 
				editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
				editorProps: {store: pion.reactors.comparison_type_store, query: {category: 'generic'}} },
			{ name: 'Value', width: 'auto', styles: 'text-align: center;', 
				editor: dojox.grid.editors.Input},
			{ name: 'Delete', styles: 'align: center;', width: 3, 
			  value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
		]]
	}];
}

dojo.declare("plugins.reactors.FilterReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/FilterReactor/FilterReactorDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			plugins.reactors.initFilterReactorGridLayout();
			this.filter_reactor_grid.setStructure(plugins.reactors.filter_reactor_grid_layout);
			this.reactor.comparison_table = [];
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.reactor.config['@id']},
				onItem: function(item) {
					var comparisons = store.getValues(item, 'Comparison');
					for (var i = 0; i < comparisons.length; ++i) {
						var comparison_table_row = [];
						//console.debug('comparisons[', i, '] = ', comparisons[i]);
						comparison_table_row[0] = store.getValue(comparisons[i], 'Term');
						comparison_table_row[1] = store.getValue(comparisons[i], 'Type');
						comparison_table_row[2] = store.getValue(comparisons[i], 'Value');
						_this.reactor.comparison_table.push(comparison_table_row);
					}
					pion.reactors.filter_reactor_grid_model.setData(_this.reactor.comparison_table);
					var grid = _this.filter_reactor_grid;
					dojo.connect(grid, 'onCellClick', grid, _this._handleCellClick);
					dojo.connect(_this.add_new_comparison_button.domNode, 'click', grid, _this._handleAddNewComparison);
					setTimeout(function(){
						grid.update();
						grid.resize();
					}, 200);
				},
				onError: pion.handleFetchError
			});
		},
		_handleCellClick: function(e) {
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			if (e.cellIndex == 1) { // clicked in comparison column
				var term = pion.reactors.filter_reactor_grid_model.getDatum(e.rowIndex, 0).toString();
				console.debug('term = ', term, ', pion.terms.categories_by_id[term] = ', pion.terms.categories_by_id[term]);
				plugins.reactors.filter_reactor_grid_layout[0].rows[0][1].editorProps.query.category = pion.terms.categories_by_id[term];
			} else if (e.cellIndex == 3) { // clicked in delete column
				console.debug('Removing row ', e.rowIndex); 
				this.removeSelectedRows();
			}
		},
		_handleAddNewComparison: function() {
			this.addRow([0, 'true']);
			//dojo.addClass(selected_pane.domNode, 'unsaved_changes');
		},
		_insertCustomData: function() {
			var num_comparisons = pion.reactors.filter_reactor_grid_model.getRowCount();
			for (var i = 0; i < num_comparisons; ++i) {
				var row = pion.reactors.filter_reactor_grid_model.getRow(i);
				console.debug('frag: <Term>' + row[0] + '</Term><Type>' + row[1] + '</Type><Value>' + row[2] + '</Value>');
				this.put_data += '<Comparison><Term>' + row[0] + '</Term><Type>' + row[1] + '</Type><Value>' + row[2] + '</Value></Comparison>';
			}
		}
	}
);
