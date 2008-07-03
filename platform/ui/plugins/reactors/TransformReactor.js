dojo.provide("plugins.reactors.TransformReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojox.grid.Grid");
dojo.require("pion.terms");

dojo.declare("plugins.reactors.TransformReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'TransformReactor';
			this.inherited("postCreate", arguments);
			this.special_config_elements.push('Comparison');
			this.special_config_elements.push('Transformation');
			this._updateCustomData();
		},
		_updateCustomData: function() {
			var store = pion.reactors.config_store;
			var _this = this;
			this.comparisons = [];
			this.transformations = [];
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					_this.config.options = []; // used by pion.reactors.showReactorConfigDialog for checkboxes

					for (var option in plugins.reactors.TransformReactor.option_defaults) {
						// Set option to default values.
						_this.config[option] = plugins.reactors.TransformReactor.option_defaults[option];

						// Override default if option present in the configuration.
						if (store.hasAttribute(item, option))
							_this.config[option] = (store.getValue(item, option).toString() == 'true');

						// Add true options to list of checkboxes to check.
						if (_this.config[option])
							_this.config.options.push(option);
					}

					var comparison_items = store.getValues(item, 'Comparison');
					for (var i = 0; i < comparison_items.length; ++i) {
						var comparison = {};
						comparison.term  = store.getValue(comparison_items[i], 'Term');
						comparison.type  = store.getValue(comparison_items[i], 'Type');
						comparison.value = store.getValue(comparison_items[i], 'Value');
						_this.comparisons.push(comparison);
					}

					var transformation_items = store.getValues(item, 'Transformation');
					for (var i = 0; i < transformation_items.length; ++i) {
						var transformation = {};
						transformation.term      = store.getValue(transformation_items[i], 'Term');
						transformation.type      = store.getValue(transformation_items[i], 'Type');
						transformation.value     = store.getValue(transformation_items[i], 'Value');
						transformation.match_all = store.getValue(transformation_items[i], 'MatchAllValues');
						transformation.set_value = store.getValue(transformation_items[i], 'SetValue');
						transformation.in_place  = store.getValue(transformation_items[i], 'InPlace');
						transformation.set_term  = store.getValue(transformation_items[i], 'SetTerm');
						_this.transformations.push(transformation);
					}
				},
				onError: pion.handleFetchError
			});
		},
		_insertCustomData: function() {
			for (var i = 0; i < this.comparisons.length; ++i) {
				var c = this.comparisons[i];
				this.put_data += '<Comparison>';
				this.put_data += '<Term>' + c.term + '</Term>';
				this.put_data += '<Type>' + c.type + '</Type>';
				if (c.value)
					this.put_data += '<Value>' + c.value + '</Value>';
				this.put_data += '</Comparison>';
			}
			for (var i = 0; i < this.transformations.length; ++i) {
				var t = this.transformations[i];
				this.put_data += '<Transformation>';
				this.put_data += '<Term>' + t.term + '</Term>';
				this.put_data += '<Type>' + t.type + '</Type>';
				if (t.value)
					this.put_data += '<Value>' + t.value + '</Value>';
				if (t.match_all)
					this.put_data += '<MatchAllValues>' + t.match_all + '</MatchAllValues>';
				this.put_data += '<SetValue>' + t.set_value + '</SetValue>';
				if (t.in_place)
					this.put_data += '<InPlace>' + t.in_place + '</InPlace>';
				if (t.set_term)
					this.put_data += '<SetTerm>' + t.set_term + '</SetTerm>';
				this.put_data += '</Transformation>';
			}
		}
	}
);

dojo.declare("plugins.reactors.TransformReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/TransformReactor/TransformReactorDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.initGridLayouts();
			var _this = this;
			this.comparison_grid.setStructure(this.comparison_grid_layout);
			var comparison_grid_model = pion.reactors.transform_reactor_comparison_grid_model;
			this.comparison_grid.canEdit = function(cell, row_index) {
				switch (cell.index) {
					// Disable editing of 'Value' cell if 'Type' cell is set to a 'generic' comparison.
					case this.value_column_index:
						var type = comparison_grid_model.getDatum(row_index, this.type_column_index);
						return dojo.indexOf(pion.reactors.generic_comparison_types, type) == -1;

					default:
						return true;
				}
			}
			this.transformation_grid.setStructure(this.transformation_grid_layout);
			var transformation_grid_model = pion.reactors.transform_reactor_transformation_grid_model;
			this.transformation_grid.canEdit = function(cell, row_index) {
				switch (cell.index) {
					// Disable editing of 'Value' cell if 'Type' cell is set to a 'generic' comparison.
					case this.value_column_index:
						var type = transformation_grid_model.getDatum(row_index, this.type_column_index);
						return dojo.indexOf(pion.reactors.generic_comparison_types, type) == -1;
						
					// Disable editing of 'Set Term' cell if 'In Place' cell is set to true.
					case this.set_term_column_index:
						var in_place = transformation_grid_model.getDatum(row_index, this.in_place_column_index);
						console.debug('in_place = ', in_place);
						if (in_place) // i.e. both defined and having the boolean value 'true'
							return false;
						else
							return true;
							
					default:
						return true;
				}
			}
			this.comparison_table = [];
			this.transformation_table = [];
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.reactor.config['@id']},
				onItem: function(item) {
					var comparisons = store.getValues(item, 'Comparison');
					var cg = _this.comparison_grid;
					for (var i = 0; i < comparisons.length; ++i) {
						var table_row = [];
						table_row[cg.term_column_index]  = store.getValue(comparisons[i], 'Term');
						table_row[cg.type_column_index]  = store.getValue(comparisons[i], 'Type');
						table_row[cg.value_column_index] = store.getValue(comparisons[i], 'Value');
						_this.comparison_table.push(table_row);
					}
					comparison_grid_model.setData(_this.comparison_table);

					var transformations = store.getValues(item, 'Transformation');
					var tg = _this.transformation_grid;
					for (var i = 0; i < transformations.length; ++i) {
						var table_row = [];
						table_row[tg.term_column_index]      = store.getValue(transformations[i], 'Term');
						table_row[tg.type_column_index]      = store.getValue(transformations[i], 'Type');
						table_row[tg.value_column_index]     = store.getValue(transformations[i], 'Value');
						if (store.hasAttribute(transformations[i], 'MatchAllValues'))
							table_row[tg.match_all_column_index] = store.getValue(transformations[i], 'MatchAllValues');
						else
							table_row[tg.match_all_column_index] = false;
						table_row[tg.set_value_column_index] = store.getValue(transformations[i], 'SetValue');
						if (store.hasAttribute(transformations[i], 'InPlace'))
							table_row[tg.in_place_column_index] = store.getValue(transformations[i], 'InPlace');
						else
							table_row[tg.in_place_column_index] = false;
						table_row[tg.set_term_column_index]  = store.getValue(transformations[i], 'SetTerm');
						_this.transformation_table.push(table_row);
					}
					transformation_grid_model.setData(_this.transformation_table);

					dojo.connect(_this.comparison_grid, 'onCellClick', _this, _this._handleComparisonGridCellClick);
					dojo.connect(_this.comparison_grid, 'onApplyCellEdit', _this, _this._handleComparisonGridCellEdit);
					dojo.connect(_this.transformation_grid, 'onCellClick', _this, _this._handleTransformationGridCellClick);
					dojo.connect(_this.transformation_grid, 'onApplyCellEdit', _this, _this._handleTransformationGridCellEdit);
					setTimeout(function(){
						_this.comparison_grid.update();
						_this.comparison_grid.resize();
						_this.transformation_grid.update();
						_this.transformation_grid.resize();
					}, 200);
				},
				onError: pion.handleFetchError
			});
		},
		initGridLayouts: function() {
			this.comparison_grid.term_column_index   = 0;
			this.comparison_grid.type_column_index   = 1;
			this.comparison_grid.value_column_index  = 2;
			this.comparison_grid.delete_column_index = 3;
			this.comparison_grid_layout = [{
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

			this.transformation_grid.term_column_index      = 0;
			this.transformation_grid.type_column_index      = 1;
			this.transformation_grid.value_column_index     = 2;
			this.transformation_grid.match_all_column_index = 3;
			this.transformation_grid.set_value_column_index = 4;
			this.transformation_grid.in_place_column_index  = 5;
			this.transformation_grid.set_term_column_index  = 6;
			this.transformation_grid.delete_column_index    = 7;
			this.transformation_grid_layout = [{
				rows: [[
					{ name: 'Term', styles: '', 
						editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
						editorProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" }, width: 14 },
					{ name: 'Comparison', styles: '', width: 'auto', 
						editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
						editorProps: {store: pion.reactors.comparison_type_store, query: {category: 'generic'}} },
					{ name: 'Value', width: 'auto', styles: 'text-align: center;', 
						editor: dojox.grid.editors.Input},
					{ name: 'Match All', width: 3, 
						editor: dojox.grid.editors.CheckBox},
					{ name: 'Set Value', width: 'auto', styles: 'text-align: center;', 
						editor: dojox.grid.editors.Input},
					{ name: 'In Place', width: 3, 
						editor: dojox.grid.editors.CheckBox},       // try dojox.grid.editors.Bool 
					{ name: 'Set Term', styles: '', 
						editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
						editorProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" }, width: 14 },
					{ name: 'Delete', styles: 'align: center;', width: 3, 
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]]
			}];
		},
		_handleComparisonGridCellClick: function(e) {
			console.debug('In _handleComparisonGridCellClick: this.id = ', this.id);
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			var grid = this.comparison_grid;
			var model = pion.reactors.transform_reactor_comparison_grid_model;
			switch (e.cellIndex) {
				// User clicked in 'Comparison' cell, so set up query for dropdown list of comparisons suitable for term.
				case grid.type_column_index:
					var term = model.getDatum(e.rowIndex, grid.term_column_index).toString();
					console.debug('term = ', term, ', pion.terms.categories_by_id[term] = ', pion.terms.categories_by_id[term]);
					this.comparison_grid_layout[0].rows[0][e.cellIndex].editorProps.query.category = pion.terms.categories_by_id[term];
					break;

				case grid.delete_column_index:
					console.debug('Removing row ', e.rowIndex); 
					grid.removeSelectedRows();
					break;

				default:
					// do nothing
			}
		},
		_handleTransformationGridCellClick: function(e) {
			console.debug('In _handleTransformationGridCellClick: this.transformation_grid.id = ', this.transformation_grid.id);
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			var grid = this.transformation_grid;
			var model = pion.reactors.transform_reactor_transformation_grid_model;
			switch (e.cellIndex) {
				// User clicked in 'Comparison' cell, so set up query for dropdown list of comparisons suitable for term.
				case grid.type_column_index:
					var term = model.getDatum(e.rowIndex, grid.term_column_index).toString();
					console.debug('term = ', term, ', pion.terms.categories_by_id[term] = ', pion.terms.categories_by_id[term]);
					this.transformation_grid_layout[0].rows[0][e.cellIndex].editorProps.query.category = pion.terms.categories_by_id[term];
					break;

				case grid.delete_column_index:
					console.debug('Removing row ', e.rowIndex); 
					grid.removeSelectedRows();
					break;

				default:
					// do nothing
			}
		},
		_handleComparisonGridCellEdit: function(value, row_index, col_index) {
			console.debug('value = ', value);
			var grid = this.comparison_grid;
			var model = pion.reactors.transform_reactor_comparison_grid_model;
			switch (col_index) {
				// If 'Comparison' cell has just been set to a 'generic' comparison, no 'Value' value is 
				// allowed, so remove any value in that cell.
				case grid.type_column_index:
					var store = pion.reactors.comparison_type_store;
					store.fetchItemByIdentity({
						identity: value,
						onItem: function(item) {
							if (store.containsValue(item, 'category', 'generic'))
								model.setDatum('', row_index, grid.value_column_index);
						}
					});
					break;

				default:
					// do nothing
			}
		},
		_handleTransformationGridCellEdit: function(value, row_index, col_index) {
			console.debug('value = ', value);
			var grid = this.transformation_grid;
			var model = pion.reactors.transform_reactor_transformation_grid_model;
			switch (col_index) {
				// If 'Comparison' cell has just been set to a 'generic' comparison, no 'Value' value is 
				// allowed, so remove any value in that cell.
				case grid.type_column_index:
					var store = pion.reactors.comparison_type_store;
					store.fetchItemByIdentity({
						identity: value,
						onItem: function(item) {
							if (store.containsValue(item, 'category', 'generic'))
								model.setDatum('', row_index, grid.value_column_index);
						}
					});
					break;

				// If 'In Place' cell has just been set to true, no 'Set Term' value is allowed, so remove any value in that cell.
				// Otherwise, the 'Set Term' cell needs a value, so if it doesn't have one, initialize it with the Term in the first column.
				case grid.in_place_column_index:
					if (value) { // i.e. both defined and having the boolean value 'true'
						model.setDatum('', row_index, grid.set_term_column_index);
					} else {
						if (model.getDatum(row_index, grid.set_term_column_index) === undefined) {
							var primary_term = model.getDatum(row_index, grid.term_column_index);
							model.setDatum(primary_term, row_index, grid.set_term_column_index);
						}
					}
					break;

				default:
					// do nothing
			}
		},
		_handleAddNewComparison: function() {
			console.debug('this.comparison_grid.id = ', this.comparison_grid.id);
			this.comparison_grid.addRow([0, 'true']);
		},
		_handleAddNewTransformation: function() {
			console.debug('this.transformation_grid.id = ', this.transformation_grid.id);
			this.transformation_grid.addRow([0, 'true', , false, 0, true]);
		},
		_insertCustomData: function(dialog_options) {
			for (var option in plugins.reactors.TransformReactor.option_defaults) {
				this.put_data += '<' + option + '>';
				this.put_data += (dojo.indexOf(dialog_options, option) != -1); // 'true' iff corresponding checkbox was checked
				this.put_data += '</' + option + '>';
			}

			var num_comparisons = pion.reactors.transform_reactor_comparison_grid_model.getRowCount();
			var cg = this.comparison_grid;
			for (var i = 0; i < num_comparisons; ++i) {
				var row = pion.reactors.transform_reactor_comparison_grid_model.getRow(i);
				this.put_data += '<Comparison>';
				this.put_data += '<Term>' + row[cg.term_column_index] + '</Term>';
				this.put_data += '<Type>' + row[cg.type_column_index] + '</Type>';
				if (row[cg.value_column_index])
					this.put_data += '<Value>' + row[cg.value_column_index] + '</Value>'
				this.put_data += '</Comparison>';
			}

			var num_transformations = pion.reactors.transform_reactor_transformation_grid_model.getRowCount();
			var tg = this.transformation_grid;
			for (var i = 0; i < num_transformations; ++i) {
				var row = pion.reactors.transform_reactor_transformation_grid_model.getRow(i);
				this.put_data += '<Transformation>';
				this.put_data += '<Term>' + row[tg.term_column_index] + '</Term>';
				this.put_data += '<Type>' + row[tg.type_column_index] + '</Type>';
				if (row[tg.value_column_index])
					this.put_data += '<Value>' + row[tg.value_column_index] + '</Value>'
				if (row[tg.match_all_column_index])
					this.put_data += '<MatchAllValues>' + row[tg.match_all_column_index] + '</MatchAllValues>'
				this.put_data += '<SetValue>' + row[tg.set_value_column_index] + '</SetValue>'
				if (row[tg.in_place_column_index])
					this.put_data += '<InPlace>' + row[tg.in_place_column_index] + '</InPlace>'
				if (row[tg.set_term_column_index])
					this.put_data += '<SetTerm>' + row[tg.set_term_column_index] + '</SetTerm>'
				this.put_data += '</Transformation>';
			}
		}
	}
);

plugins.reactors.TransformReactor.option_defaults = {
	AllConditions: false,
	DeliverOriginal: false
};
