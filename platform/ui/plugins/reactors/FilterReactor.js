dojo.provide("plugins.reactors.FilterReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojox.grid.Grid");
dojo.require("pion.codecs"); // term_store

dojo.declare("plugins.reactors.FilterReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'FilterReactor';
			console.debug('FilterReactor.postCreate: ', this.domNode);
			this.inherited("postCreate", arguments);
			var store = pion.reactors.config_store;
			var _this = this;
			this.comparison_table = [];
			store.fetch({
				query: {'@id': this.config.@id},
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
				}
			});
		},
		handleMoveStop: function(mover) {
			if (this.config.X == mover.host.node.offsetLeft && this.config.Y == mover.host.node.offsetTop) {
				return;
			}
			this.config.X = mover.host.node.offsetLeft;
			this.config.Y = mover.host.node.offsetTop;

			var put_data = '<PionConfig><Reactor>';
			for (var tag in this.config) {
				if (tag != '@id' && tag != 'Comparison') {
					console.debug('dialogFields[', tag, '] = ', this.config[tag]);
					put_data += '<' + tag + '>' + this.config[tag] + '</' + tag + '>';
				}
			}
			for (var i = 0; i < this.comparison_table.length; ++i) {
				var row = this.comparison_table[i];
				console.debug('frag: <Term>' + row[0] + '</Term><Type>' + row[1] + '</Type><Value>' + row[2] + '</Value>');
				put_data += '<Comparison><Term>' + row[0] + '</Term><Type>' + row[1] + '</Type><Value>' + row[2] + '</Value></Comparison>';
			}
			put_data += '</Reactor></PionConfig>';
			console.debug('put_data: ', put_data);

			dojo.rawXhrPut({
				url: '/config/reactors/' + this.config.@id,
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					console.debug('response: ', response);
				},
				error: function(response, ioArgs) {
					console.error('Error from rawXhrPut to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		}
	}
);

plugins.reactors.initFilterReactorGridLayout = function() {
	plugins.reactors.filter_reactor_grid_layout = [{
		rows: [[
			{ name: 'Term', styles: '', 
				editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
				editorProps: {store: pion.codecs.term_store, searchAttr: "id", keyAttr: "id" }, width: 'auto' },
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
			this.reactor.comparison_table = [];
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.reactor.config.@id},
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
					filter_reactor_grid_model.setData(_this.reactor.comparison_table);
					var grid = _this.filter_reactor_grid;
					dojo.connect(grid, 'onCellClick', grid, _this._handleCellClick);
					dojo.connect(_this.add_new_comparison_button.domNode, 'click', grid, _this._handleAddNewComparison);
					setTimeout(function(){
						grid.update();
						grid.resize();
					}, 200);
				}
			});
		},
		_handleCellClick: function(e) {
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			if (e.cellIndex == 1) { // clicked in comparison column
				var term = filter_reactor_grid_model.getDatum(e.rowIndex, 0).toString();
				console.debug('term = ', term, ', pion.codecs.term_categories_by_id[term] = ', pion.codecs.term_categories_by_id[term]);
				plugins.reactors.filter_reactor_grid_layout[0].rows[0][1].editorProps.query.category = pion.codecs.term_categories_by_id[term];
			} else if (e.cellIndex == 3) { // clicked in delete column
				console.debug('Removing row ', e.rowIndex); 
				this.removeSelectedRows();
			}
		},
		_handleAddNewComparison: function() {
			this.addRow([0, 'true']);
			//dojo.addClass(selected_pane.domNode, 'unsaved_changes');
		},
		execute: function(dialogFields) {
			dojo.mixin(this.reactor.config, dialogFields);
			this.reactor.name_div.innerHTML = dialogFields.Name;

			var put_data = '<PionConfig><Reactor><Plugin>FileReactor'
						  + '</Plugin><Workspace>' + this.reactor.config.Workspace 
						  + '</Workspace><X>' + this.reactor.config.X + '</X><Y>' + this.reactor.config.Y + '</Y>';
			for (var tag in dialogFields) {
				if (tag != '@id') {
					console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
					put_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
				}
			}
			var num_comparisons = filter_reactor_grid_model.getRowCount();
			for (var i = 0; i < num_comparisons; ++i) {
				var row = filter_reactor_grid_model.getRow(i);
				console.debug('frag: <Term>' + row[0] + '</Term><Type>' + row[1] + '</Type><Value>' + row[2] + '</Value>');
				put_data += '<Comparison><Term>' + row[0] + '</Term><Type>' + row[1] + '</Type><Value>' + row[2] + '</Value></Comparison>';
			}
			put_data += '</Reactor></PionConfig>';
			console.debug('put_data: ', put_data);

			dojo.rawXhrPut({
				url: '/config/reactors/' + this.reactor.config.@id,
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					console.debug('response: ', response);
				},
				error: function(response, ioArgs) {
					console.error('Error from rawXhrPut to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		}
	}
);
