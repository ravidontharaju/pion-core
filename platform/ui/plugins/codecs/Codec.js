dojo.provide("plugins.codecs.Codec");
dojo.require("pion.codecs");
dojo.require("pion.terms");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.dtl.filter.htmlstrings");

dojo.declare("plugins.codecs.CodecInitDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "codecs/CodecInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.codecs.CodecPane",
	[ dijit.layout.AccordionPane ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "codecs/CodecPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);

			// This is needed to work correctly in all of the following cases:
			// 1) when dijit.layout.AccordionPane and plugins.codecs.CodecPane are both built (e.g. when using pion-dojo.js),
			// 2) when dijit.layout.AccordionPane is built but plugins.codecs.CodecPane is not (e.g. when using dojo-for-pion.js), and
			// 3) when neither is built (e.g. when using dojo-src/dojo/dojo.js and pion.js).
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.special_config_elements = ['Field', 'tagName', 'childNodes'];
			this.attributes_by_column = ['text()', '@term'];
			this.delete_col_index = 2;
			var _this = this;
			dojo.connect(this.codec_grid, 'onCellClick', this, _this._handleCellClick);
			dojo.connect(this.codec_grid, 'onApplyCellEdit', this, _this._handleCellEdit);

			dojo.query("input", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
			dojo.query("textarea", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });			
		},
		getHeight: function() {
			// TODO: replace 475 with some computed value
			return 475;
		},
		populateFromConfigItem: function(item) {
			var store = pion.codecs.config_store;
			var config = {};
			var attributes = store.getAttributes(item);
			for (var i = 0; i < attributes.length; ++i) {
				if (dojo.indexOf(this.special_config_elements, attributes[i]) == -1) {
					config[attributes[i]] = store.getValue(item, attributes[i]).toString();
				}
			}
			if (this._addCustomConfigValues) {
				this._addCustomConfigValues(config, item);
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

			var field_table = this._makeFieldTable(item);
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
			this._setGridStructure(grid);
			setTimeout(function(){
				grid.update();
				grid.resize();
			}, 200);
			
			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		_makeFieldTable: function(item) {
			var store = pion.codecs.config_store;
			var field_attrs = store.getValues(item, 'Field');
			var field_table = [];
			for (var i = 0; i < field_attrs.length; ++i) {
				var field_table_row = [];
				for (var j = 0; j < this.attributes_by_column.length; ++j) {
					field_table_row[j] = store.getValue(field_attrs[i], this.attributes_by_column[j]);
				}
				field_table.push(field_table_row);
			}
			return field_table;
		},
		_setGridStructure: function(grid) {
			if (!plugins.codecs.CodecPane.default_grid_layout) {
				plugins.codecs.initGridLayouts();
			}
			grid.setStructure(plugins.codecs.CodecPane.default_grid_layout);
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
			console.debug('CodecPane._handleCellEdit inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', inFieldIndex = ', inFieldIndex);
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		_handleAddNewField: function() {
			console.debug('_handleAddNewField');
			this.markAsChanged();
			this.codec_grid.addRow([]);
		},
		save: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			var config = this.form.getValues();

			// see comment in populateFromConfigItem about comment field
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			config.Comment = comment_node.value;

			var put_data = '<PionConfig><Codec>';
			for (var tag in config) {
				if (tag.charAt(0) != '@' && tag != 'options') {
					console.debug('config[', tag, '] = ', config[tag]);
					put_data += '<' + tag + '>' + config[tag] + '</' + tag + '>';
				}
			}
			if (this._makeCustomElements) {
				put_data += this._makeCustomElements(config);
			}
			put_data += this._makeFieldElements();
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
						},
						onError: pion.handleFetchError
					});
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: put_data})
			});
		},
		_makeFieldElements: function() {
			var num_field_mappings = plugins.codecs.CodecPane.grid_model.getRowCount();
			var put_data = '';
			for (var i = 0; i < num_field_mappings; ++i) {
				var row = plugins.codecs.CodecPane.grid_model.getRow(i);
				put_data += '<Field term="' + row[1] + '"';
				put_data += '>' + row[0] + '</Field>';
			}
			return put_data;
		},
		cancel: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.populateFromConfigItem(this.config_item);
		},
		delete2: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete2: selected codec is ', this.title);
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
					pion.codecs._adjustAccordionSize();

					return response;
				},
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
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

plugins.codecs.initGridLayouts = function() {
	plugins.codecs.CodecPane.log_codec_grid_layout = [{
		rows: [[
			{ name: 'Field Name', styles: '', width: 'auto', 
				editor: dojox.grid.editors.Input },
			{ name: 'Term', styles: '', 
				editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
				editorProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" }, width: 'auto' },
			{ name: 'Start Char', width: 3, styles: 'text-align: center;', 
				editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.ValidationTextBox", editorProps: {regExp: ".?"} },
			{ name: 'End Char', width: 3, styles: 'text-align: center;', 
				editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.ValidationTextBox", editorProps: {regExp: ".?"} },
			{ name: 'Start/End Optional', width: 4, styles: 'text-align: center;',
				editor: dojox.grid.editors.Bool},
			{ name: 'Escape Char', width: 3, styles: 'text-align: center;', 
				editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.ValidationTextBox", editorProps: {regExp: ".?"} },
			{ name: 'Empty String', width: 3, styles: 'text-align: center;', 
				editor: dojox.grid.editors.AlwaysOn },
			{ name: 'Order', 
				editor: dojox.grid.editors.Dijit,
				editorClass: "dijit.form.NumberSpinner", width: 4 },
			{ name: 'Delete', styles: 'align: center;', width: 3, 
			  value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>' },
		]]
	}];

	plugins.codecs.CodecPane.default_grid_layout = [{
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
}