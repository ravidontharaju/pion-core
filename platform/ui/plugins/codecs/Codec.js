dojo.provide("plugins.codecs.Codec");
dojo.require("pion.codecs");
dojo.require("pion.widgets.TermTextBox");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");

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
		postCreate: function() {
			this.inherited("postCreate", arguments);
			this.special_config_elements = ['Field', 'tagName', 'childNodes'];
			var _this = this;
			this.field_mapping_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.field_mapping_store.next_id = 0;
			this._initFieldMappingGridLayout();
			this.field_mapping_grid = new dojox.grid.DataGrid({
				store: this.field_mapping_store,
				structure: this.field_mapping_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
			this.field_mapping_grid_node.appendChild(this.field_mapping_grid.domNode);
			this.field_mapping_grid.startup();
			this.field_mapping_grid.connect(this.field_mapping_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
					_this.markAsChanged();
				}
			});
			this.connect(this.field_mapping_grid, 'onApplyCellEdit', _this._handleCellEdit);

			dojo.query("input", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
			dojo.query("textarea", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
		},
		_initFieldMappingGridLayout: function() {
			this.field_mapping_grid_layout = [{
				defaultCell: { editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: left;' },
				rows: [
					{ field: 'FieldName', name: 'Field Name', width: 15,
						formatter: pion.xmlCellFormatter },
					{ field: 'Term', name: 'Term', width: 'auto', 
						type: pion.widgets.TermTextCell },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]
			}];
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
			this.form.attr('value', config);

			// The comment field needs to be set separately, because dijit.form.Form.setValues doesn't handle <textarea> elements.
			// It would be great if the comment could be an <input> with dojoType="dijit.form.Textarea", but for some reason, this
			// doesn't work inside a template.  The comment field can't be assigned an id, because that would cause an error if
			// there were multiple codecs.  That suggests using a dojoAttachPoint, but that doesn't work.  So, I have to do a query.
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			comment_node.value = config.Comment;

			this.title = config.Name;
			var title_node = dojo.query('.dijitAccordionTitle .dijitAccordionText', this.domNode)[0];
			title_node.firstChild.nodeValue = this.title;

			this._reloadFieldMappingStore(item);

			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		_reloadFieldMappingStore: function(codec_config_item) {
			// First empty this.field_mapping_store.
			var _this = this;
			this.field_mapping_store.fetch({
				onItem: function(field_mapping_item) {
					_this.field_mapping_store.deleteItem(field_mapping_item);
				},
				onComplete: function() {
					// Then repopulate this.field_mapping_store from the Codec's configuration.
					_this._repopulateFieldMappingStore(codec_config_item);
				},
				onError: pion.handleFetchError
			});
		},
		// _repopulateFieldMappingStore() is intended to be overridden, e.g. in LogCodecPane.
		_repopulateFieldMappingStore: function(codec_config_item) {
			var _this = this;
			var store = pion.codecs.config_store;
			dojo.forEach(store.getValues(codec_config_item, 'Field'), function(field_mapping) {
				var field_mapping_item = {
					ID: _this.field_mapping_store.next_id++,
					FieldName: store.getValue(field_mapping, 'text()'),
					Term: store.getValue(field_mapping, '@term')
				};
				_this.field_mapping_store.newItem(field_mapping_item);
			});
		},
		_handleCellEdit: function(inValue, inRowIndex, inFieldIndex) {
			console.debug('CodecPane._handleCellEdit inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', inFieldIndex = ', inFieldIndex);
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		_handleAddNewField: function() {
			this.markAsChanged();
			this.field_mapping_store.newItem({ID: this.field_mapping_store.next_id++});
		},
		onFieldMappingPutDataReady: function() {
		},
		save: function() {
			var _this = this;
			this.field_mapping_store.fetch({
				onComplete: function(items) {
					dojo.removeClass(_this.domNode, 'unsaved_changes');
					_this.field_mapping_put_data = _this._makeFieldElements(items);
					_this.doPutRequest();
				},
				onError: pion.handleFetchError
			});
		},
		// _makeFieldElements() is intended to be overridden, e.g. in LogCodecPane.
		_makeFieldElements: function(items) {
			var put_data = '';
			var store = this.field_mapping_store;
			dojo.forEach(items, function(item) {
				put_data += '<Field term="' + store.getValue(item, 'Term') + '">';
				put_data += pion.escapeXml(store.getValue(item, 'FieldName')) + '</Field>';
			})
			return put_data;
		},
		doPutRequest: function() {
			var config = this.form.getValues();

			// see comment in populateFromConfigItem about comment field
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			config.Comment = comment_node.value;

			var put_data = '<PionConfig><Codec>';
			for (var tag in config) {
				if (tag.charAt(0) != '@' && tag != 'options') {
					console.debug('config[', tag, '] = ', config[tag]);
					put_data += pion.makeXmlLeafElement(tag, config[tag]);
				}
			}
			if (this._makeCustomElements) {
				put_data += this._makeCustomElements(config);
			}
			put_data += this.field_mapping_put_data;
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
		markAsChanged: function(e) {
			console.debug('markAsChanged: e = ', e);
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		codec: ''
	}
);
