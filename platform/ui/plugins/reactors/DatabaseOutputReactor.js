dojo.provide("plugins.reactors.DatabaseOutputReactor");
dojo.require("pion.databases");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojox.grid.Grid");

dojo.declare("plugins.reactors.DatabaseOutputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'DatabaseOutputReactor';
			this.inherited("postCreate", arguments);
			var store = pion.reactors.config_store;
			var _this = this;
			this.field_mapping_table = [];
			store.fetch({
				query: {'@id': this.config.@id},
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
		handleMoveStop: function(mover) {
			this.config.X = mover.host.node.offsetLeft;
			this.config.Y = mover.host.node.offsetTop;

			var put_data = '<PionConfig><Reactor>';
			for (var tag in this.config) {
				if (tag != '@id' && tag != 'Field') {
					console.debug('dialogFields[', tag, '] = ', this.config[tag]);
					put_data += '<' + tag + '>' + this.config[tag] + '</' + tag + '>';
				}
			}
			for (var i = 0; i < this.field_mapping_table.length; ++i) {
				var row = this.field_mapping_table[i];
				console.debug('frag: <Field term="' + row[1] + '">' + row[0] + '</Field>');
				put_data += '<Field term="' + row[1] + '">' + row[0] + '</Field>';
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

dojo.declare("plugins.reactors.DatabaseOutputReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/DatabaseOutputReactor/DatabaseOutputReactorInitDialog.html"),
		templateString: "",
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
		execute: function(dialogFields) {
			console.debug(dialogFields);
			console.debug('this.plugin = ', this.plugin);
			var dc = dojo.coords(workspace_box.node);
			var X = pion.reactors.last_x - dc.x;
			var Y = pion.reactors.last_y - dc.y;
			var post_data = '<PionConfig><Reactor><Plugin>' + this.plugin 
						  + '</Plugin><Workspace>' + workspace_box.my_content_pane.title 
						  + '</Workspace><X>' + X + '</X><Y>' + Y + '</Y>';
			for (var tag in dialogFields) {
				console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
				post_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
			}
			var num_field_mappings = plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
			for (var i = 0; i < num_field_mappings; ++i) {
				var row = plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRow(i);
				console.debug('frag: <Field term="' + row[1] + '">' + row[0] + '</Field>');
				post_data += '<Field term="' + row[1] + '">' + row[0] + '</Field>';
			}
			post_data += '</Reactor></PionConfig>';
			console.debug('post_data: ', post_data);
			
			dojo.rawXhrPost({
				url: '/config/reactors',
				contentType: "text/xml",
				handleAs: "xml",
				postData: post_data,
				load: function(response){
					var node = response.getElementsByTagName('Reactor')[0];
					var config = { '@id': node.getAttribute('id') };
					var attribute_nodes = node.childNodes;
					//console.debug('attribute_nodes: ', attribute_nodes);
					//console.dir(attribute_nodes);
					for (var i = 0; i < attribute_nodes.length; ++i) {
						if (attribute_nodes[i].firstChild) {
							config[attribute_nodes[i].tagName] = attribute_nodes[i].firstChild.nodeValue;
						}
					}
					//console.debug('config (from server): ', config);
					//console.dir(config);
					var reactor_node = document.createElement("div");
					workspace_box.node.replaceChild(reactor_node, workspace_box.node.lastChild);
					var reactor = createReactor(config, reactor_node);
					//console.debug('config.@id: ', config.@id);
					reactors_by_id[config.@id] = reactor;
					reactor.workspace = workspace_box;
					workspace_box.reactors.push(reactor);
				},
				error: function(response, ioArgs) {
					console.error('Error from rawXhrPost to /config/reactors.  HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		}
	}
);

dojo.declare("plugins.reactors.DatabaseOutputReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/DatabaseOutputReactor/DatabaseOutputReactorDialog.html"),
		templateString: "",
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			this.reactor.field_mapping_table = [];
			var store = pion.reactors.config_store;
			store.fetch({
				query: {'@id': this.reactor.config.@id},
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
			var num_field_mappings = plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRowCount();
			for (var i = 0; i < num_field_mappings; ++i) {
				var row = plugins.reactors.DatabaseOutputReactorDialog.grid_model.getRow(i);
				console.debug('frag: <Field term="' + row[1] + '">' + row[0] + '</Field>');
				put_data += '<Field term="' + row[1] + '">' + row[0] + '</Field>';
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

plugins.reactors.DatabaseOutputReactorDialog.grid_model = new dojox.grid.data.Table(null, []);

plugins.reactors.DatabaseOutputReactorDialog.grid_layout = [{
	rows: [[
		{ name: 'Field Name', styles: '', width: 'auto', 
			editor: dojox.grid.editors.Input},
		{ name: 'Term', styles: '', 
			editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
			editorProps: {store: term_store, searchAttr: "id", keyAttr: "id" }, width: 'auto'},
		{ name: 'Delete', styles: 'align: center;', width: 3, 
		  value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
	]]
}];

