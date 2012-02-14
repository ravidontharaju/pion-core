dojo.provide("plugins.protocols.Protocol");
dojo.require("pion.protocols");
dojo.require("pion.widgets.TermTextBox");
dojo.require("pion.widgets.SimpleSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");

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
	[dijit.layout.ContentPane, dijit._Templated],
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
			this.populateWithDefaults();
			var _this = this;

			if ('add_new_rule_button' in this)
				this.add_new_rule_button.onClick = function(e) { _this._handleAddNewRule(); return false; }

			this.has_extraction_rules = 'extraction_rule_grid_node' in this;
			if (this.has_extraction_rules) {
				this.extraction_rule_store = new dojo.data.ItemFileWriteStore({
					data: { identifier: 'ID', items: [] }
				});
				this.extraction_rule_store.next_id = 0;
	
				this.extraction_rule_grid_layout = [{
					defaultCell: { editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: left;' },
					rows: [
						{ field: 'Term', name: 'Term', relWidth: 3, 
							type: pion.widgets.TermTextCell },
						{ field: 'Source', name: 'Source', styles: '', relWidth: 1, 
							type: dojox.grid.cells.Select, options: plugins.protocols.source_options },
						{ field: 'Name', name: 'Name', relWidth: 1,
							formatter: pion.xmlCellFormatter },
						{ field: 'Match', name: 'Match', relWidth: 1,
							formatter: pion.xmlCellFormatter },
						{ field: 'Format', name: 'Format', relWidth: 1,
							formatter: pion.xmlCellFormatter },
						{ field: 'ContentType', name: 'ContentType', relWidth: 1,
							formatter: pion.xmlCellFormatter },
						{ field: 'MaxSize', name: 'MaxSize', relWidth: 1,
							formatter: pion.xmlCellFormatter },
						{ field: 'MaxExtracts', name: 'MaxExtracts', relWidth: 1,
							formatter: pion.xmlCellFormatter },
						{ name: 'Delete', classes: 'delete button', editable: false, formatter: pion.makeDeleteButton }
					]
				}];
				this.extraction_rule_grid = new dojox.grid.DataGrid({
					store: this.extraction_rule_store,
					structure: this.extraction_rule_grid_layout,
					escapeHTMLInData: false,
					singleClickEdit: true
				}, document.createElement('div'));
				this.extraction_rule_grid_node.appendChild(this.extraction_rule_grid.domNode);
				this.extraction_rule_grid.startup();
				this.extraction_rule_grid.connect(this.extraction_rule_grid, 'onCellClick', function(e) {
					if (e.cell.name == 'Delete') {
						this.store.deleteItem(this.getItem(e.rowIndex));
						_this.markAsChanged();
						dojo.stopEvent(e); // Prevent UI from reloading.
					}
				});
				dojo.connect(this.extraction_rule_grid, 'onApplyCellEdit', this, _this._handleCellEdit);
			}

			dojo.query("input", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
			dojo.query("textarea", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
			dojo.query("select", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); }); // Includes pion.widgets.SimpleSelect widgets, even when inside an <input> element in the markup.
		},
		populateWithDefaults: function() {
		},
		getHeight: function() {
			return this.pane_end.offsetTop;
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
			this.form.set('value', config);
			if (this.has_extraction_rules)
				this._reloadExtractionRuleStore(item);

			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		_reloadExtractionRuleStore: function(item) {
			// First empty this.extraction_rule_store.
			var _this = this;
			this.extraction_rule_store.fetch({
				onItem: function(item) {
					_this.extraction_rule_store.deleteItem(item);
				},
				onComplete: function() {
					// Then repopulate this.extraction_rule_store from the Protocol's configuration.
					var store = pion.protocols.config_store;
					dojo.forEach(store.getValues(item, 'Extract'), function(extraction_rule) {
						var extraction_rule_item = {
							ID: _this.extraction_rule_store.next_id++,
							Term: store.getValue(extraction_rule, '@term')
						};

						// This will pull in things beyond what extraction_rule_grid_layout knows about, but they will be ignored.
						dojo.forEach(store.getAttributes(extraction_rule), function(attr) {
							extraction_rule_item[attr] = store.getValue(extraction_rule, attr).toString();
						});

						_this.extraction_rule_store.newItem(extraction_rule_item);
					});
				},
				onError: pion.handleFetchError
			});
		},
		_handleCellEdit: function(inValue, inRowIndex, inFieldIndex) {
			console.debug('ProtocolPane._handleCellEdit inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', inFieldIndex = ', inFieldIndex);
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		_handleAddNewRule: function() {
			this.markAsChanged();
			this.extraction_rule_store.newItem({ID: this.extraction_rule_store.next_id++});

			// Once the grid has finished adding the new row, scroll to the bottom and focus on the first cell of the new row.
			var h = this.extraction_rule_grid.connect(this.extraction_rule_grid, 'endUpdate', function() {
				this.focus.setFocusIndex(this.rowCount - 1, 0);
				this.disconnect(h);
			});
		},
		save: function() {
			if (this.has_extraction_rules) {
				var _this = this;
				var put_data = '';
				var store = this.extraction_rule_store;
				store.fetch({
					onItem: function(item) {
						put_data += '<Extract term="' + store.getValue(item, 'Term') + '">';
						put_data += pion.makeXmlLeafElement('Source', store.getValue(item, 'Source'));
						if (store.getValue(item, 'Name'))
							put_data += pion.makeXmlLeafElement('Name', store.getValue(item, 'Name'));
						if (store.getValue(item, 'Match'))
							put_data += pion.makeXmlLeafElement('Match', store.getValue(item, 'Match'));
						if (store.getValue(item, 'Format'))
							put_data += pion.makeXmlLeafElement('Format', store.getValue(item, 'Format'));
						if (store.getValue(item, 'ContentType'))
							put_data += pion.makeXmlLeafElement('ContentType', store.getValue(item, 'ContentType'));
						if (store.getValue(item, 'MaxSize'))
							put_data += pion.makeXmlLeafElement('MaxSize', store.getValue(item, 'MaxSize'));
						if (store.getValue(item, 'MaxExtracts'))
							put_data += pion.makeXmlLeafElement('MaxExtracts', store.getValue(item, 'MaxExtracts'));
						put_data += '</Extract>';
					},
					onComplete: function() {
						_this.extraction_rule_put_data = put_data;
						_this.doPutRequest();
						dojo.removeClass(_this.domNode, 'unsaved_changes');
					},
					onError: pion.handleFetchError
				});
			} else {
				this.extraction_rule_put_data = '';
				this.doPutRequest();
			}
		},
		doPutRequest: function() {
			var config = this.form.get('value');
			var put_data = '<PionConfig><Protocol>';
			for (var tag in config) {
				if (tag.charAt(0) != '@' && tag != 'options') {
					console.debug('config[', tag, '] = ', config[tag]);
					put_data += pion.makeXmlLeafElement(tag, config[tag]);
				}
			}
			if (this._makeCustomElements) {
				put_data += this._makeCustomElements(config);
			}
			put_data += this.extraction_rule_put_data;
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
		protocol: ''
	}
);

plugins.protocols.source_options = ['query', 'cookie', 'cs-cookie', 'sc-cookie', 'cs-header', 'sc-header', 'cs-content', 'sc-content', 'cs-raw-content', 'sc-raw-content'];
