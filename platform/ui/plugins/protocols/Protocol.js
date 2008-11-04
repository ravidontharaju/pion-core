dojo.provide("plugins.protocols.Protocol");
dojo.require("pion.protocols");
dojo.require("pion.terms");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.dtl");

dojo.declare("plugins.protocols.ProtocolInitDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "protocols/ProtocolInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.protocols.ProtocolPane",
	[ dijit.layout.AccordionPane ],
	{
		templatePath: dojo.moduleUrl("plugins", "protocols/ProtocolPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);

			// This is needed to work correctly in all of the following cases:
			// 1) when dijit.layout.AccordionPane and plugins.protocols.ProtocolPane are both built (e.g. when using pion-dojo.js),
			// 2) when dijit.layout.AccordionPane is built but plugins.protocols.ProtocolPane is not (e.g. when using dojo-for-pion.js), and
			// 3) when neither is built (e.g. when using dojo-src/dojo/dojo.js and pion.js).
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.special_config_elements = ['Extract', 'tagName', 'childNodes'];
			this.attributes_by_column = ['@term'];
			var _this = this;
			dojo.connect(this.protocol_grid, 'onCellClick', this, _this._handleCellClick);
			dojo.connect(this.protocol_grid, 'onApplyCellEdit', this, _this._handleCellEdit);

			dojo.query("input", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
			dojo.query("textarea", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });			
		},
		getHeight: function() {
			// TODO: replace 470 with some computed value
			return 470;
		},
		populateFromConfigItem: function(item) {
			var store = pion.protocols.config_store;
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
			// there were multiple protocols.  That suggests using a dojoAttachPoint, but that doesn't work.  So, I have to do a query.
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			comment_node.value = config.Comment;

			console.debug('config = ', config);
			this.title = config.Name;
			var title_node = dojo.query('.dijitAccordionTitle .dijitAccordionText', this.domNode)[0];
			title_node.firstChild.nodeValue = this.title;

			var extraction_rule_table = this._makeExtractionRuleTable(item);
			plugins.protocols.ProtocolPane.grid_model.setData(extraction_rule_table);
			var grid = this.protocol_grid;
			this._setGridStructure(grid);
			setTimeout(function(){
				grid.update();
				grid.resize();
			}, 200);

			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		_makeExtractionRuleTable: function(item) {
			var store = pion.protocols.config_store;
			return dojo.map(store.getValues(item, 'Extract'), function(item) {
				var row = [];
				row.push(store.getValue(item, '@term'));
				row.push(store.getValue(item, 'Source'));
				row.push(store.getValue(item, 'Name'));
				if (store.hasAttribute(item, 'Match')) {
					row.push(store.getValue(item, 'Match').toString());
				} else {
					row.push('');
				}
				row.push(store.getValue(item, 'Format'));
				row.push(store.getValue(item, 'ContentType'));
				row.push(store.getValue(item, 'MaxSize'));
				return row;
			});
		},
		_setGridStructure: function(grid) {
			if (! this.default_grid_layout) {
				this.initGridLayouts();
			}
			grid.setStructure(this.default_grid_layout);
		},
		_handleCellClick: function(e) {
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			if (e.cellIndex == this.protocol_grid.delete_column_index) {
				dojo.addClass(this.domNode, 'unsaved_changes');
				console.debug('Removing row ', e.rowIndex); 
				this.protocol_grid.removeSelectedRows();
			}
		},
		_handleCellEdit: function(inValue, inRowIndex, inFieldIndex) {
			console.debug('ProtocolPane._handleCellEdit inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', inFieldIndex = ', inFieldIndex);
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		_handleAddNewRow: function() {
			this.markAsChanged();
			this.protocol_grid.addRow([]);
		},
		save: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			var config = this.form.getValues();

			// see comment in populateFromConfigItem about comment field
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			config.Comment = comment_node.value;

			var put_data = '<PionConfig><Protocol>';
			for (var tag in config) {
				if (tag.charAt(0) != '@' && tag != 'options') {
					console.debug('config[', tag, '] = ', config[tag]);
					put_data += '<' + tag + '>' + config[tag] + '</' + tag + '>';
				}
			}
			if (this._makeCustomElements) {
				put_data += this._makeCustomElements(config);
			}
			put_data += this._makeExtractionRuleElements();
			put_data += '</Protocol></PionConfig>';
			console.debug('put_data: ', put_data);
			_this = this;
			dojo.rawXhrPut({
				url: '/config/protocols/' + this.uuid,
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					console.debug('response: ', response);

					// Yes, this is redundant, but unfortunately, 'response' is not an item.
					pion.protocols.config_store.fetch({
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
		_makeExtractionRuleElements: function() {
			var num_extraction_rules = plugins.protocols.ProtocolPane.grid_model.getRowCount();
			var put_data = '';
			for (var i = 0; i < num_extraction_rules; ++i) {
				var row = plugins.protocols.ProtocolPane.grid_model.getRow(i);
				put_data += '<Extract term="' + row[this.protocol_grid.term_column_index] + '">';
				put_data += '<Source>' + row[this.protocol_grid.source_column_index] + '</Source>';
				if (row[this.protocol_grid.name_column_index])
					put_data += '<Name>' + row[this.protocol_grid.name_column_index] + '</Name>'
				if (row[this.protocol_grid.match_column_index])
					put_data += '<Match>' + dojox.dtl._base.escape(row[this.protocol_grid.match_column_index]) + '</Match>'
				if (row[this.protocol_grid.format_column_index])
					put_data += '<Format>' + row[this.protocol_grid.format_column_index] + '</Format>'
				if (row[this.protocol_grid.content_type_column_index])
					put_data += '<ContentType>' + row[this.protocol_grid.content_type_column_index] + '</ContentType>'
				if (row[this.protocol_grid.max_size_column_index])
					put_data += '<MaxSize>' + row[this.protocol_grid.max_size_column_index] + '</MaxSize>'
				put_data += '</Extract>';
			}
			return put_data;
		},
		cancel: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.populateFromConfigItem(this.config_item);
		},
		delete2: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete2: selected protocol is ', this.title);
			_this = this;
			dojo.xhrDelete({
				url: '/config/protocols/' + this.uuid,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					console.debug('xhrDelete for url = /config/protocols/' + this.uuid, '; HTTP status code: ', ioArgs.xhr.status);

					// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
					// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
					dijit.byId('protocol_config_accordion').forward();
					
					dijit.byId('protocol_config_accordion').removeChild(_this);
					pion.protocols._adjustAccordionSize();

					return response;
				},
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
			});
		},
		markAsChanged: function() {
			console.debug('markAsChanged');
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		initGridLayouts: function() {
			this.protocol_grid.term_column_index         = 0;
			this.protocol_grid.source_column_index       = 1;
			this.protocol_grid.name_column_index         = 2;
			this.protocol_grid.match_column_index        = 3;
			this.protocol_grid.format_column_index       = 4;
			this.protocol_grid.content_type_column_index = 5;
			this.protocol_grid.max_size_column_index     = 6;
			this.protocol_grid.delete_column_index       = 7;
			this.default_grid_layout = [{
				rows: [[
					{ name: 'Term', styles: '', 
						editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
						editorProps: {store: pion.terms.store, searchAttr: "id", keyAttr: "id" }, width: 12 },
					{ name: 'Source', styles: '', width: 'auto', 
						editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
						editorProps: {store: plugins.protocols.source_store, searchAttr: "description" } },
					{ name: 'Name', styles: '', width: 'auto', 
						editor: dojox.grid.editors.Input },
					{ name: 'Match', styles: '', width: 'auto', 
						editor: dojox.grid.editors.AlwaysOn },
					{ name: 'Format', styles: '', width: 'auto', 
						editor: dojox.grid.editors.Input },
					{ name: 'ContentType', styles: '', width: 'auto', 
						editor: dojox.grid.editors.Input },
					{ name: 'MaxSize', styles: '', width: 'auto', 
						editor: dojox.grid.editors.Input },
					{ name: 'Delete', styles: 'align: center;', width: 3, 
					  value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>' },
				]]
			}];
		},
		protocol: ''
	}
);

plugins.protocols.ProtocolPane.grid_model = new dojox.grid.data.Table(null, []);

plugins.protocols.source_store = new dojo.data.ItemFileReadStore(
	{data: {identifier: 'name', items: [{name: 'query',      description: 'query'},
										{name: 'cookie',     description: 'cookie'},
										{name: 'cs-header',  description: 'cs-header'},
										{name: 'sc-header',  description: 'sc-header'},
										{name: 'cs-content', description: 'cs-content'},
										{name: 'sc-content', description: 'sc-content'}]}}
);
