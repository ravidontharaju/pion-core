dojo.provide("plugins.codecs.Codec");
dojo.require("pion.codecs");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.dtl.filter.htmlstrings");

dojo.declare("plugins.codecs.Codec",
	[],
	{
		constructor: function(uuid, args) {
			this.uuid = uuid;
			dojo.mixin(this, args);
			plugins.codecs.codecs_by_id[uuid] = this;
			var store = pion.codecs.plugin_data_store;
			var _this = this;
			store.fetchItemByIdentity({
				identity: this.Plugin,
				onItem: function(item) {
					_this.label = store.getValue(item, 'label');
				}
			});
		}
	}
);

plugins.codecs.codecs_by_id = {};

dojo.declare("plugins.codecs.CodecInitDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "codecs/CodecInitDialog.html"),
		templateString: "",       // Necessary to keep Dijit from using templateString in dijit.Dialog
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.codecs.CodecPane",
	[ dijit.layout.AccordionPane ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "codecs/CodecPane.html"),
		templateString: "",       // Necessary to keep Dijit from using templateString in dijit.Dialog
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.attributes_by_column = ['text()', '@term', '@start', '@end'];
			this.order_col_index = 4;
			this.delete_col_index = 5;
			var _this = this;
			dojo.connect(this.codec_grid, 'onCellClick', this, _this._handleCellClick);
			dojo.connect(this.codec_grid, 'onApplyCellEdit', this, _this._handleCellEdit);

			dojo.query("input", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
			dojo.query("textarea", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });			
		},
		populateFromConfigItem: function(item) {
			var store = pion.codecs.config_store;
			var config = {};
			var attributes = store.getAttributes(item);
			for (var i = 0; i < attributes.length; ++i) {
				if (attributes[i] != 'Field' && attributes[i] != 'tagName' && attributes[i] != 'childNodes') {
					config[attributes[i]] = store.getValue(item, attributes[i]).toString();
				}
			}
			console.dir(config);
			this.form.setValues(config);

			// The comment field needs to be set separately, because dijit.form.Form.setValues doesn't handle <textarea> elements.
			// It would be great if the comment could be an <input> with dojoType="dijit.form.Textarea", but for some reason, this
			// doesn't work inside a template.  The comment field can't be assigned an id, because that would cause an error if
			// there were multiple codecs.  That suggests using a dojoAttachPoint, but that doesn't work.  So, I have to do a query.
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			comment_node.value = config.Comment;

			console.debug('config = ', config);
			this.title = config.Name;
			var title_node = dojo.query('.dijitAccordionTitle .dijitAccordionText', this.domNode)[0];
			title_node.firstChild.nodeValue = this.title;

			var field_attrs = store.getValues(item, 'Field');
			var field_table = [];
			this.order_map = [];
			for (var i = 0; i < field_attrs.length; ++i) {
				var field_table_row = [];
				for (var j = 0; j < this.attributes_by_column.length; ++j) {
					field_table_row[j] = store.getValue(field_attrs[i], this.attributes_by_column[j]);
				}
				/*
				field_table_row[0] = store.getValue(field_attrs[i], 'text()');
				field_table_row[1] = store.getValue(field_attrs[i], '@term');
				field_table_row[2] = store.getValue(field_attrs[i], '@start');
				field_table_row[3] = store.getValue(field_attrs[i], '@end');
				*/
				field_table_row[this.order_col_index] = i + 1;
				field_table.push(field_table_row);

				this.order_map[i] = i + 1;
			}
			plugins.codecs.CodecPane.grid_model.setData(field_table);
			var grid = this.codec_grid;

			// This would be nice and simple, but I can't make it work.
			//grid.setCellWidth(this.order_col_index, 0);
			//grid.updateStructure();

			/*
			// Build codec_grid_layout_no_order if it's needed and hasn't been built yet.
			// Alas, cloning codec_grid_layout doesn't work.
			if (form_data.plugin_type != 1 && !codec_grid_layout_no_order) {
				var codec_grid_layout_no_order = dojo.clone(codec_grid_layout);
				codec_grid_layout_no_order[0].rows[0].splice(this.order_col_index, 1);
			}
			*/
			if (config.Plugin == 'LogCodec') {
				grid.setStructure(plugins.codecs.CodecPane.grid_layout);
				this.delete_col_index = 5;
			} else {
				grid.setStructure(plugins.codecs.CodecPane.grid_layout_no_order);
				this.delete_col_index = 4;
			}
			setTimeout(function(){
				grid.update();
				grid.resize();
			}, 200);
			
			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		_handleCellClick: function(e) {
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			if (e.cellIndex == this.delete_col_index) {
				dojo.addClass(this.domNode, 'unsaved_changes');
				console.debug('Removing row ', e.rowIndex); 
				this.codec_grid.removeSelectedRows();
			}
		},
		_handleCellEdit: function(inValue, inRowIndex, inFieldIndex) {
			console.debug('inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', inFieldIndex = ', inFieldIndex);
			dojo.addClass(this.domNode, 'unsaved_changes');
			if (inFieldIndex == this.order_col_index) {
				var old_order = this.order_map[inRowIndex];
				var order_map = this.order_map;
				console.debug('1: order_map = ', order_map);
				order_map[inRowIndex] = inValue;
				if (inValue > old_order) {
					for (var i = 0; i < order_map.length; ++i) {
						if (order_map[i] > old_order && order_map[i] <= inValue && i != inRowIndex) {
							order_map[i]--;
						}
					}
				} else {
					for (var i = 0; i < order_map.length; ++i) {
						if (order_map[i] >= inValue && order_map[i] < old_order && i != inRowIndex) {
							order_map[i]++;
						}
					}
				}
				console.debug('2: order_map = ', order_map);
				var field_table = [];
				for (var i = 0; i < order_map.length; ++i) {
					var row = plugins.codecs.CodecPane.grid_model.getRow(i);
					row[this.order_col_index] = order_map[i];
					field_table.push(row);

					// The problem with using setDatum here is that if the table is currently 
					// sorted by order, it will sort after each update, messing up the ordering.
					//model.setDatum(order_map[i], i, this.order_col_index);
				}
				plugins.codecs.CodecPane.grid_model.setData(field_table);
			}
		},
		_handleAddNewField: function() {
			console.debug('_handleAddNewField');
			this.markAsChanged();
			this.codec_grid.addRow([]);
		},
		save: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			var config = this.form.getValues();

			// see comment in populateFromConfigItem about comment field
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			config.Comment = comment_node.value;

			var put_data = '<PionConfig><Codec>';
			for (var tag in config) {
				if (tag != '@id') {
					console.debug('config[', tag, '] = ', config[tag]);
					put_data += '<' + tag + '>' + config[tag] + '</' + tag + '>';
				}
			}
			var num_field_mappings = plugins.codecs.CodecPane.grid_model.getRowCount();
			var inverse_order_map = [];
			for (var i = 0; i < num_field_mappings; ++i) {
				if (config.Plugin == 'LogCodec') {
					if (this.order_map.length == num_field_mappings) {
						inverse_order_map[this.order_map[i] - 1] = i;
					} else {
						// TODO: This block is temporary, until ordering implementation is finished.
						// The order might be wrong, but at least it won't crash.
						inverse_order_map[i] = i;
					}
				} else {
					inverse_order_map[i] = i;
				}
			}
			console.debug('this.order_map = ', this.order_map);
			console.debug('inverse_order_map = ', inverse_order_map);
			for (var i = 0; i < num_field_mappings; ++i) {
				var row = plugins.codecs.CodecPane.grid_model.getRow(inverse_order_map[i]);
				put_data += '<Field term="' + row[1] + '"';
				if (row[2]) {
					put_data += ' start="' + dojox.dtl.filter.htmlstrings.escape(row[2]) + '"';
				}
				if (row[3]) {
					put_data += ' end="' + dojox.dtl.filter.htmlstrings.escape(row[3]) + '"';
				}
				put_data += '>' + row[0] + '</Field>';
			}
			put_data += '</Codec></PionConfig>';
			console.debug('put_data: ', put_data);
			_this = this;
			dojo.rawXhrPut({
				url: '/config/codecs/' + this.uuid,
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					console.debug('response: ', response);

					// Yes, this is redundant, but unfortunately, 'response' is not an item.
					pion.codecs.config_store.fetch({
						query: {'@id': _this.uuid},
						onItem: function(item) {
							_this.config_item = item;
							_this.populateFromConfigItem(item);
						}
					});
				},
				error: function(response, ioArgs) {
					console.error('Error from rawXhrPut to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		},
		cancel: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.populateFromConfigItem(this.config_item);
		},
		delete: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete: selected codec is ', this.title);
			_this = this;
			dojo.xhrDelete({
				url: '/config/codecs/' + this.uuid,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					console.debug('xhrDelete for url = /config/codecs/' + this.uuid, '; HTTP status code: ', ioArgs.xhr.status);

					// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
					// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
					dijit.byId('codec_config_accordion').forward();
					
					dijit.byId('codec_config_accordion').removeChild(_this);
					adjustCodecAccordionSize();

					return response;
				},
				error: function(response, ioArgs) {
					console.error('HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		},
		markAsChanged: function() {
			console.debug('markAsChanged');
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		codec: ''
	}
);

plugins.codecs.CodecPane.grid_model = new dojox.grid.data.Table(null, []);

plugins.codecs.CodecPane.grid_layout = [{
	rows: [[
		{ name: 'Field Name', styles: '', width: 'auto', 
			editor: dojox.grid.editors.Input },
		{ name: 'Term', styles: '', 
			editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
			editorProps: {store: term_store, searchAttr: "id", keyAttr: "id" }, width: 'auto' },
		{ name: 'Start Char', width: 3, styles: 'text-align: center;', 
			editor: dojox.grid.editors.Input },
		{ name: 'End Char', width: 3, styles: 'text-align: center;', 
			editor: dojox.grid.editors.Input },
		{ name: 'order', 
			editor: dojox.grid.editors.Dijit,
			editorClass: "dijit.form.NumberSpinner", width: 5 },
		{ name: 'Delete', styles: 'align: center;', width: 3, 
		  value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>' },
	]]
}];

// This is very redundant, but dojo.clone can't seem to handle cloning grid_layout.
plugins.codecs.CodecPane.grid_layout_no_order = [{
	rows: [[
		{ name: 'Field Name', styles: '', width: 'auto', 
			editor: dojox.grid.editors.Input},
		{ name: 'Term', styles: '', 
			editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
			editorProps: {store: term_store, searchAttr: "id", keyAttr: "id" }, width: 'auto'},
		{ name: 'Start Char', width: 3, styles: 'text-align: center;', 
			editor: dojox.grid.editors.Input},
		{ name: 'End Char', width: 3, styles: 'text-align: center;', 
			editor: dojox.grid.editors.Input},
		{ name: 'Delete', styles: 'align: center;', width: 3, 
		  value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
	]]
}];
