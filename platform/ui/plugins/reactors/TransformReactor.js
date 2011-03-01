dojo.provide("plugins.reactors.TransformReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("pion.widgets.TermTextBox");
dojo.require("pion.widgets.SimpleSelect");
dojo.require("pion.terms");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Tooltip");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");

dojo.declare("plugins.reactors.TransformReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function() {
			this.config.Plugin = 'TransformReactor';
			this.inherited("postCreate", arguments);
			this.special_config_elements.push('Transformation');

			// Create and populate a datastore for the Tranformation grid.
			this.transformation_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.transformation_store.next_id = 0;
			this.prepareToHandleLoadNotification();
			this._populateTransformationStore();
		},
		prepareToHandleLoadNotification: function() {
			this.transformation_store_is_ready = false;
			var h = this.connect(this, 'onDonePopulatingTransformationStore', function() {
				this.disconnect(h);
				this._updatePutDataIfGridStoresReady();
			});
		},
		_updatePutDataIfGridStoresReady: function() {
			if (this.transformation_store_is_ready) {
				this.updateNamedCustomPutData('custom_put_data_from_config');
				this.transformation_store_is_ready = false;
				this.onDonePopulatingGridStores();
			}
		},
		onDonePopulatingGridStores: function() {
		},
		reloadGridStores: function() {
			// Delete all items from this.transformation_store, then repopulate
			// it from the Reactor's configuration.
			var _this = this;
			this.transformation_store.fetch({
				onItem: function(item) {
					_this.transformation_store.deleteItem(item);
				},
				onComplete: function() {
					_this._populateTransformationStore();
				},
				onError: pion.handleFetchError
			});

			this.prepareToHandleLoadNotification();
		},
		_populateTransformationStore: function() {
			var _this = this;
			var store = pion.reactors.config_store;
			this.getConfigItem().addCallback(function(config_item) {
				dojo.forEach(store.getValues(config_item, 'Transformation'), function(t_item) {
					var new_t_item_object = {
						ID: _this.transformation_store.next_id++,
						Term: store.getValue(t_item, 'Term'),
						Type: store.getValue(t_item, 'Type')
					}
					if (new_t_item_object.Type == 'Lookup') {
						new_t_item_object.Value = '<button dojoType=dijit.form.Button class="edit">edit Lookup</button>';
						new_t_item_object.LookupTerm = store.getValue(t_item, 'LookupTerm');
						pion.initOptionalValue(store, t_item, new_t_item_object, 'Match');
						pion.initOptionalValue(store, t_item, new_t_item_object, 'Format');
						pion.initOptionalValue(store, t_item, new_t_item_object, 'DefaultAction', 'leave-undefined');
						pion.initOptionalValue(store, t_item, new_t_item_object, 'DefaultValue');
						new_t_item_object.Lookup = dojo.map(store.getValues(t_item, 'Lookup'), function(lookup) {
							var lookup_object = {
								Key: store.getValue(lookup, '@key').toString(),
								Value: store.getValue(lookup, 'text()').toString()
							};
							return lookup_object;
						});
					} else if (new_t_item_object.Type == 'Rules') {
						new_t_item_object.Value = '<button dojoType=dijit.form.Button class="edit">edit Rules</button>';
						new_t_item_object.StopOnFirstMatch = plugins.reactors.TransformReactor.getBool(store, t_item, 'StopOnFirstMatch');
						new_t_item_object.Rule = dojo.map(store.getValues(t_item, 'Rule'), function(rule) {
							var rule_object = {
								Term: store.getValue(rule, 'Term').toString(),
								Type: store.getValue(rule, 'Type').toString(),
								SetValue: store.getValue(rule, 'SetValue').toString()
							};
							if (store.hasAttribute(rule, 'Value'))
								rule_object.Value = store.getValue(rule, 'Value').toString();
							return rule_object;
						});
					} else if (new_t_item_object.Type == 'Regex') {
						new_t_item_object.Value = '<button dojoType=dijit.form.Button class="edit">edit Regex</button>';
						new_t_item_object.SourceTerm = store.getValue(t_item, 'SourceTerm');
						new_t_item_object.Regex = dojo.map(store.getValues(t_item, 'Regex'), function(regex) {
							var regex_object = {
								Format: store.getValue(regex, 'text()').toString(),
								Exp: store.getValue(regex, '@exp').toString()
							};
							return regex_object;
						});
					} else if (new_t_item_object.Type == 'JoinTerm') {
						var value = store.getValue(t_item, 'Value');
						new_t_item_object.Value = value;
						new_t_item_object.Sep = store.getValue(value, '@sep');
						if (store.getValue(value, '@uniq') == 'true')
							new_t_item_object.Type = 'JoinTerm (unique)';
					} else if (new_t_item_object.Type == 'SplitTerm') {
						var value = store.getValue(t_item, 'Value');
						new_t_item_object.Value = value;
						new_t_item_object.Sep = store.getValue(value, '@sep');
					} else {
						new_t_item_object.Value = store.getValue(t_item, 'Value');
					}
					_this.transformation_store.newItem(new_t_item_object);
				});
				_this.transformation_store_is_ready = true;
				_this.onDonePopulatingTransformationStore();
			});
		},
		onDonePopulatingTransformationStore: function() {
		},
		// _updateCustomData() is called after a successful PUT request.
		_updateCustomData: function() {
			this.custom_put_data_from_config = this.custom_put_data_from_grid_stores;
		},
		// _insertCustomData() is called when moving the Reactor.
		_insertCustomData: function() {
			this.put_data += this.custom_put_data_from_config;
		},
		updateNamedCustomPutData: function(property_to_update) {
			var put_data = '';
			var _this = this;
			var t_store = this.transformation_store;
			t_store.fetch({
				onItem: function(item) {
					put_data += '<Transformation>';
					put_data += '<Term>' + t_store.getValue(item, 'Term') + '</Term>';
					var type = t_store.getValue(item, 'Type');
					if (type == 'Lookup') {
						put_data += '<Type>Lookup</Type>';
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'LookupTerm');
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'Match');
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'Format');
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'DefaultAction');
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'DefaultValue');
						dojo.forEach(t_store.getValues(item, 'Lookup'), function(lookup) {
							put_data += '<Lookup key="' + pion.escapeXml(lookup.Key) + '">' + pion.escapeXml(lookup.Value) + '</Lookup>';
						});
					} else if (type == 'Rules') {
						put_data += '<Type>Rules</Type>';
						put_data += pion.makeXmlLeafElement('StopOnFirstMatch', plugins.reactors.TransformReactor.getBool(t_store, item, 'StopOnFirstMatch').toString());
						dojo.forEach(t_store.getValues(item, 'Rule'), function(rule) {
							put_data += '<Rule>';
							put_data += pion.makeXmlLeafElement('Term', rule.Term);
							put_data += pion.makeXmlLeafElement('Type', rule.Type);
							if ('Value' in rule)
								put_data += pion.makeXmlLeafElement('Value', rule.Value);
							put_data += pion.makeXmlLeafElement('SetValue', rule.SetValue);
							put_data += '</Rule>';
						});
					} else if (type == 'Regex') {
						put_data += '<Type>Regex</Type>';
						put_data += pion.makeXmlLeafElement('SourceTerm', t_store.getValue(item, 'SourceTerm'));
						dojo.forEach(t_store.getValues(item, 'Regex'), function(regex) {
							put_data += '<Regex exp="' + pion.escapeXml(regex.Exp) + '">' + pion.escapeXml(regex.Format) + '</Regex>';
						});
					} else if (type == 'JoinTerm') {
						put_data += '<Type>JoinTerm</Type>';
						put_data += '<Value sep="' + pion.escapeXml(t_store.getValue(item, 'Sep')) + '">' +
									pion.escapeXml(t_store.getValue(item, 'Value')) + '</Value>';
					} else if (type == 'JoinTerm (unique)') {
						put_data += '<Type>JoinTerm</Type>';
						put_data += '<Value sep="' + pion.escapeXml(t_store.getValue(item, 'Sep')) + '" uniq="true">' +
									pion.escapeXml(t_store.getValue(item, 'Value')) + '</Value>';
					} else if (type == 'SplitTerm') {
						put_data += '<Type>SplitTerm</Type>';
						put_data += '<Value sep="' + pion.escapeXml(t_store.getValue(item, 'Sep')) + '">' +
									pion.escapeXml(t_store.getValue(item, 'Value')) + '</Value>';
					} else {
						put_data += '<Type>' + type + '</Type>';
						put_data += pion.makeXmlLeafElement('Value', t_store.getValue(item, 'Value'));
					}
					put_data += '</Transformation>';
				},
				onComplete: function() {
					_this[property_to_update] = put_data;
				},
				onError: pion.handleFetchError
			});
		}
	}
);

plugins.reactors.TransformReactor.label = 'Transformation Reactor';

dojo.declare("plugins.reactors.TransformReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/TransformReactor/TransformReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
			plugins.reactors.TransformReactor.outgoing_event_type_store = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: 'id',
					items: [{id: 'Same as input event'}]
				}
			});
		},
		widgetsInTemplate: true,
 		postCreate: function() {
			this.inherited("postCreate", arguments);
			this.attr('value', {CopyOriginal: 'if-not-defined', OutgoingEvent: 'Same as input event'});
			var _this = this;
			pion.terms.store.fetch({
				query: {Type: 'object'},
				onItem: function(item) {
					plugins.reactors.TransformReactor.outgoing_event_type_store.newItem({id: pion.terms.store.getIdentity(item)});
				},
				onComplete: function() {
					_this.outgoing_event_select.makeOptionList();
					if (_this.reactor.config.OutgoingEvent) {
						_this.attr('value', {OutgoingEvent: _this.reactor.config.OutgoingEvent});
					}
				}
			});
			var h = dojo.connect(this.reactor, 'onDonePopulatingGridStores', function() {
				_this._updateCustomPutDataFromGridStores();
				_this.connect(_this.reactor.transformation_store, 'onSet', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.transformation_store, 'onDelete', '_updateCustomPutDataFromGridStores');
				dojo.disconnect(h);
			});
			this.reactor.reloadGridStores();

			this.transformation_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Term', name: 'Term', width: 18, 
						type: pion.widgets.TermTextCell },
					{ field: 'Type', name: 'Transformation Type', width: 10, 
						type: dojox.grid.cells.Select, options: [ 'AssignTerm', 'AssignValue', 'JoinTerm', 'JoinTerm (unique)', 'Lookup', 'Regex', 'Rules', 'SplitTerm', 'URLDecode', 'URLEncode' ] },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter2 },
					{ field: 'Value', name: 'Value', width: 'auto',
						type: pion.widgets.TermTextCell },
					{ field: 'Sep', name: 'Sep', width: '2',
						formatter: pion.xmlCellFormatter },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false, formatter: pion.makeDeleteButton }
				]
			}];
			this.transformation_grid = new dojox.grid.DataGrid({
				store: this.reactor.transformation_store,
				structure: this.transformation_grid_layout,
				singleClickEdit: true
			}, document.createElement('div'));

			this.transformation_grid.term_column_index = 0;
			this.transformation_grid.value_text_column_index = 2;
			this.transformation_grid.value_term_column_index = 3;
			this.transformation_grid.layout.setColumnVisibility(this.transformation_grid.value_term_column_index, false);

			this.transformation_grid_node.appendChild(this.transformation_grid.domNode);
			this.transformation_grid.startup();
			this.transformation_grid.connect(this.transformation_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				} else if (e.cell.field == 'Value') {
					var type = this.store.getValue(this.getItem(e.rowIndex), 'Type').toString();
					if (type == 'Lookup') {
						var dialog = new plugins.reactors.TransformReactor.LookupConfigurationDialog({
							reactor: _this.reactor,
							transformation_store: this.store,
							transformation_item: this.getItem(e.rowIndex)
						});
						dialog.show();
						dialog.save_button.onClick = function() {
							return dialog.isValid();
						};
					} else if (type == 'Rules') {
						var dialog = new plugins.reactors.TransformReactor.RulesConfigurationDialog({
							reactor: _this.reactor,
							transformation_store: this.store,
							transformation_item: this.getItem(e.rowIndex)
						});
						dialog.show();
						dialog.save_button.onClick = function() {
							return dialog.isValid();
						};
					} else if (type == 'Regex') {
						var dialog = new plugins.reactors.TransformReactor.RegexConfigurationDialog({
							reactor: _this.reactor,
							transformation_store: this.store,
							transformation_item: this.getItem(e.rowIndex)
						});
						dialog.show();
						dialog.save_button.onClick = function() {
							return dialog.isValid();
						};
					}
				}
			});

			// This is a hack for overriding the behavior of dojox.grid.cells.Select so that when the user selects a Type,
			// the editor behaves as if the user hit 'Enter'.
			// We need to listen for 'change' events on the DOM node of the 'select' input, but the node isn't created until
			// the cell gets focus, so we need to wait for an 'onCellFocus' event before we can set up the 'change' listener. 
			this.transformation_grid.connect(this.transformation_grid, 'onCellFocus', function(cell, row_index) {
				if (cell.field == 'Type') {
					var _this = this;
					this.connect(cell.getEditNode(row_index), 'change', function() {
						_this.edit.apply();
					});
				}
			});

			this.transformation_grid.connect(this.transformation_grid, 'onStartEdit', function(cell, row_index) {
				switch (cell.field) {
					case 'Type':
						this.pre_edit_type = this.store.getValue(this.getItem(row_index), 'Type');
						break;

					default:
						// do nothing
				}
			});
			this.transformation_grid.connect(this.transformation_grid, 'onApplyCellEdit', function(value, row_index, attr_name) {
				switch (attr_name) {
					case 'Type':
						if (value != this.pre_edit_type) { // i.e. Type has changed
							var use_term_selector = (value == 'AssignTerm');
							this.layout.setColumnVisibility(this.value_text_column_index, ! use_term_selector);
							this.layout.setColumnVisibility(this.value_term_column_index, use_term_selector);

							var need_edit_button = (value == 'Lookup' || value == 'Rules' || value == 'Regex');
							if (need_edit_button) {
								this.store.setValue(this.getItem(row_index), 'Value', '<button dojoType=dijit.form.Button class="edit">edit ' + value + '</button>');
							} else {
								this.store.unsetAttribute(this.getItem(row_index), 'Value');
							}
						}
						break;

					default:
						// do nothing
				}
			});
			var _grid = this.transformation_grid;
			var h2 = _grid.connect(_grid.layout.cells[_grid.term_column_index], 'sizeWidget', function() {
				this.connect(this.layout.cells[_grid.term_column_index].widget, '_close', function(value) {
					_grid.edit.apply();
				});
				this.disconnect(h2);
			});
			var h3 = _grid.connect(_grid.layout.cells[_grid.value_term_column_index], 'sizeWidget', function() {
				this.connect(this.layout.cells[_grid.value_term_column_index].widget, '_close', function(value) {
					_grid.edit.apply();
				});
				this.disconnect(h3);
			});
			this.transformation_grid.canEdit = function(cell, row_index) {
				switch (cell.field) {
					// Disable editing of 'Value' cell if 'Type' is not 'AssignValue', 'AssignTerm', 'JoinTerm', 'JoinTerm (unique)', 'SplitTerm', 'URLEncode' or 'URLDecode'.
					// Otherwise, if the correct column is visible, enable editing, else make the correct column visible.
					case 'Value':
						var item = this.getItem(row_index);
						var type = this.store.getValue(item, 'Type').toString();
						if (type == 'AssignValue') {
							if (this.layout.cells[this.value_text_column_index].hidden) {
								this.layout.setColumnVisibility(this.value_text_column_index, true);
								this.layout.setColumnVisibility(this.value_term_column_index, false);
								return false;
							} else {
								return true;
							}
						} else if (type == 'AssignTerm' || type == 'JoinTerm' || type == 'JoinTerm (unique)' || type == 'SplitTerm' || type == 'URLEncode' || type == 'URLDecode') {
							if (this.layout.cells[this.value_term_column_index].hidden) {
								this.layout.setColumnVisibility(this.value_text_column_index, false);
								this.layout.setColumnVisibility(this.value_term_column_index, true);
								return false;
							} else {
								return true;
							}
						} else {
							return false;
						}

					case 'Sep':
						var item = this.getItem(row_index);
						var type = this.store.getValue(item, 'Type').toString();
						return (type == 'JoinTerm' || type == 'JoinTerm (unique)' || type == 'SplitTerm');

					default:
						return true;
				}
			}

			var showTooltip = function(e) {
				if (e.cell.name == 'Sep') {
					dijit.showTooltip('For type SplitTerm, a set of separator characters, and for type JoinTerm, a separator string.', e.cellNode);
				}
			}
			var hideTooltip = function(e) {
				dijit.hideTooltip(e.cellNode);
				dijit._masterTT._onDeck = null;
			}
			dojo.connect(this.transformation_grid, "onHeaderCellMouseOver", showTooltip);
			dojo.connect(this.transformation_grid, "onHeaderCellMouseOut", hideTooltip);
		},
		_handleAddNewTransformation: function() {
			this.reactor.transformation_store.newItem({
				ID: this.reactor.transformation_store.next_id++,
				MatchAllValues: false,
				Type: 'AssignValue',
				InPlace: true
			});
		},
		// _updateCustomPutDataFromGridStores() will be passed arguments related to the item which triggered the call, which we ignore.
		_updateCustomPutDataFromGridStores: function() {
			this.reactor.updateNamedCustomPutData('custom_put_data_from_grid_stores');
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save Reactor'.
		_insertCustomData: function() {
			this.put_data += this.reactor.custom_put_data_from_grid_stores;
		}
	}
);

plugins.reactors.TransformReactor.option_defaults = {
}

plugins.reactors.TransformReactor.grid_option_defaults = {
	StopOnFirstMatch: true,
	InPlace: false,
	MatchAllValues: false
};

plugins.reactors.TransformReactor.getBool = function(store, item, attribute) {
	if (store.hasAttribute(item, attribute))
		// convert XmlItem to string and then to boolean
		return store.getValue(item, attribute).toString() == 'true';
	else
		return plugins.reactors.TransformReactor.grid_option_defaults[attribute];
}

dojo.declare("plugins.reactors.TransformReactor.KeyValuePairImportDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/TransformReactor/KeyValuePairImportDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		enableApply: function() {
			this.apply_button.attr('disabled', false);
		},
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.reactors.TransformReactor.LookupConfigurationDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/TransformReactor/LookupConfigurationDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
 		postCreate: function() {
			this.inherited("postCreate", arguments);

			if (! this.transformation_item.DefaultAction)
				this.transformation_item.DefaultAction = 'leave-undefined';
			if (this.transformation_item.DefaultAction == 'fixedvalue') {
				this.default_value.attr('disabled', false);
				this.default_value.domNode.style.visibility = 'visible';
			}
			this.attr('value', this.transformation_item);

			// Create and populate a datastore for the Lookup grid.
			this.lookup_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.lookup_store.next_id = 0;
			this.connect(this.lookup_store, 'onNew', function() {
				this.export_xml_button.attr('disabled', false);
				this.export_csv_button.attr('disabled', false);
			});
			this._populateLookupStore();

			this.lookup_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Key', name: 'Key', width: 14 },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false, formatter: pion.makeDeleteButton }
				]
			}];
			this.lookup_grid = new dojox.grid.DataGrid({
				store: this.lookup_store,
				structure: this.lookup_grid_layout,
				rowsPerPage: 1000,
				singleClickEdit: true
			}, document.createElement('div'));
			this.lookup_grid_node.appendChild(this.lookup_grid.domNode);
			this.lookup_grid.startup();
			this.lookup_grid.connect(this.lookup_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				}
			});
		},
		execute: function(dialogFields) {
			if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
			this.execute_already_called = true;

			var t_store = this.transformation_store;
			var t_item = this.transformation_item;
			var r_store = this.lookup_store;
			var lookup_objects = [];
			for (var i = 0; i < this.lookup_grid.rowCount; ++i) {
				var item = this.lookup_grid.getItem(i);
				var lookup_object = {
					Key: r_store.getValue(item, 'Key'),
					Value: r_store.getValue(item, 'Value')
				};
				lookup_objects.push(lookup_object);
			}
			t_store.setValues(t_item, 'Lookup', lookup_objects);
			for (var tag in dialogFields) {
				t_store.setValue(t_item, tag, dialogFields[tag]);
			}
			this.reactor.updateNamedCustomPutData('custom_put_data_from_grid_stores');
		},
		_populateLookupStore: function() {
			var _this = this;
			dojo.forEach(this.transformation_store.getValues(this.transformation_item, 'Lookup'), function(lookup) {
				_this.lookup_store.newItem(dojo.mixin(lookup, {ID: _this.lookup_store.next_id++}));
			});
		},
		_regexChanged: function(value) {
			if (value) {
				this.format_text_box.attr('disabled', false);
				//this.format_text_box.domNode.style.visibility = 'visible';
				this.output_radio_button.attr('disabled', false);
			} else {
				this.format_text_box.attr('disabled', true);
				this.format_text_box.attr('value', '');
				//this.format_text_box.domNode.style.visibility = 'hidden';
				this.output_radio_button.attr('disabled', true);
				this.attr('value', {DefaultAction: 'leave-undefined'});
			}
		},
		_onDefaultActionChanged: function(e) {
			if (e.target.value == 'fixedvalue') {
				this.default_value.attr('disabled', false);
				this.default_value.domNode.style.visibility = 'visible';
			} else {
				this.default_value.attr('disabled', true);
				this.default_value.attr('value', '');
				this.default_value.domNode.style.visibility = 'hidden';
			}
		},
		_onImportXmlKeyValuePairs: function(e) {
			var _this = this;
			var dialog = new plugins.reactors.TransformReactor.KeyValuePairImportDialog({
				title: 'Key Value Pairs in XML Format to Import',
				instructions: 'Enter key value pairs in the following format, using standard escape sequences:',
				example: '&lt;Lookup key="index-1"&gt;NASDAQ&lt;/Lookup&gt\n...\n&lt;Lookup key="index-n"&gt;S&amp;amp;P 500&lt;/Lookup&gt'
			});
			dialog.show();
			dialog.execute = function(dialogFields) {
				if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
				this.execute_already_called = true;

				var wrapped_XML = '<PionConfig>' + this.XML_text_area.value + '</PionConfig>';
				var trimmed_XML = wrapped_XML.replace(/>\s*/g, '>');
				if (dojo.isIE) {
					var XML_doc = dojox.data.dom.createDocument();
					XML_doc.loadXML(trimmed_XML);
				} else {
					var parser = new DOMParser();
					var XML_doc = parser.parseFromString(trimmed_XML, "text/xml");
				}
				dojo.forEach(XML_doc.getElementsByTagName('Lookup'), function(lookup) {
					var lookup_key = lookup.getAttribute('key');
					var lookup_value = dojo.isIE? lookup.childNodes[0].nodeValue : lookup.textContent;
					_this.lookup_store.newItem({
						ID: _this.lookup_store.next_id++,
						Key: lookup_key,
						Value: lookup_value
					});
				})
			}
		},
		_onExportXmlKeyValuePairs: function() {
			var r_store = this.lookup_store;
			var content = '';
			for (var i = 0; i < this.lookup_grid.rowCount; ++i) {
				var item = this.lookup_grid.getItem(i);
				var key = r_store.getValue(item, 'Key');
				var value = r_store.getValue(item, 'Value');
				var element = '<Lookup key="' + pion.escapeXml(key) + '">' + pion.escapeXml(value) + '</Lookup>';
				content += pion.escapeXml(element) + '<br />';
			}
			var dialog = new dijit.Dialog({title: 'Exported Key Value Pairs in XML Format', style: 'width: 600px'});
			dialog.attr('content', content);
			dialog.show();
		},
		_onImportCsvKeyValuePairs: function(e) {
			var _this = this;
			var dialog = new plugins.reactors.TransformReactor.KeyValuePairImportDialog({
				title: 'Key Value Pairs in CSV Format to Import',
				instructions: 'Enter key value pairs in CSV format.  Example:',
				example: 'A,yes & no\nB,"X, Y and Z"\nC,"the one with a ""D"" in it"\nD," quoting optional here "\n...'
			});
			dialog.show();
			dialog.execute = function(dialogFields) {
				if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
				this.execute_already_called = true;

				var lines = this.XML_text_area.value.split('\n');
				dojo.forEach(lines, function(line) {
					if (results = line.match(/^"(.*)","(.*)"$/)) {
						var lookup_key = results[1].replace(/""/g, "\"");
						var lookup_value = results[2].replace(/""/g, "\"");
					} else if (results = line.match(/^([^,"]*),"(.*)"$/)) {
						var lookup_key = results[1];
						var lookup_value = results[2].replace(/""/g, "\"");
					} else if (results = line.match(/^"(.*)",([^,"]*)$/)) {
						var lookup_key = results[1].replace(/""/g, "\"");
						var lookup_value = results[2];
					} else if (results = line.match(/^([^,"]*),([^,"]*)$/)) {
						var lookup_key = results[1];
						var lookup_value = results[2];
					} else
						return;  // ignore lines that don't fit any of the above four patterns (see RFC 4180)
					_this.lookup_store.newItem({
						ID: _this.lookup_store.next_id++,
						Key: lookup_key,
						Value: lookup_value
					});
				})
			}
		},
		_onExportCsvKeyValuePairs: function() {
			var r_store = this.lookup_store;
			var content = '';
			for (var i = 0; i < this.lookup_grid.rowCount; ++i) {
				var item = this.lookup_grid.getItem(i);
				var key = r_store.getValue(item, 'Key').toString();
				var value = r_store.getValue(item, 'Value').toString();
				var element = '"' + key.replace(/"/g, "\"\"") + '","' + value.replace(/"/g, "\"\"") + '"';
				content += pion.escapeXml(element) + '<br />';
			}
			var dialog = new dijit.Dialog({title: 'Exported Key Value Pairs in CSV Format', style: 'width: 600px'});
			dialog.attr('content', content);
			dialog.show();
		},
		_handleAddNewLookup: function() {
			this.lookup_store.newItem({
				ID: this.lookup_store.next_id++
			});
		}
	}
);

dojo.declare("plugins.reactors.TransformReactor.RulesConfigurationDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/TransformReactor/RulesConfigurationDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
 		postCreate: function() {
			this.inherited("postCreate", arguments);

			if (plugins.reactors.TransformReactor.getBool(this.transformation_store, this.transformation_item, 'StopOnFirstMatch'))
				this.attr('value', {options: ['StopOnFirstMatch']});

			// Create and populate a datastore for the Rule grid.
			this.rule_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.rule_store.next_id = 0;
			this._populateRuleStore();

			this.rule_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Term', name: 'Term', width: 14, 
						type: pion.widgets.TermTextCell },
					{ field: 'Type', name: 'Comparison', width: 10, 
						widgetClass: pion.widgets.SimpleSelect, 
						widgetProps: {store: pion.reactors.comparison_type_store, query: {category: 'generic'}} },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ field: 'SetValue', name: 'Set Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ name: 'Insert Above', styles: 'align: center;', width: 3, editable: false, formatter: pion.makeInsertAboveButton },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false, formatter: pion.makeDeleteButton }
				]
			}];
			this.rule_grid = new dojox.grid.DataGrid({
				store: this.rule_store,
				structure: this.rule_grid_layout,
				rowsPerPage: 1000,
				singleClickEdit: true
			}, document.createElement('div'));
			this.rule_grid._prev_term_type_category = this.rule_grid.structure[0].rows[1].widgetProps.query.category;
			this.rule_grid.term_column_index = 0;
			this.rule_grid_node.appendChild(this.rule_grid.domNode);
			this.rule_grid.startup();
			this.rule_grid.connect(this.rule_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				} else if (e.cell.name == 'Insert Above') {
					// Save items from selected row to bottom.
					var items_to_restore = [];
					var items_to_delete = [];
					for (var i = e.rowIndex; i < this.rowCount; ++i) {
						var item = this.getItem(i);
						var item_object = {
							Term: this.store.getValue(item, 'Term'),
							Type: this.store.getValue(item, 'Type'),
							SetValue: this.store.getValue(item, 'SetValue')
						};
						if (this.store.hasAttribute(item, 'Value'))
							item_object.Value = this.store.getValue(item, 'Value');
						items_to_restore.push(item_object);
						items_to_delete.push(item);
					}

					// Delete items from selected row to bottom.
					var _this = this;
					dojo.forEach(items_to_delete, function(item) { _this.store.deleteItem(item); });

					// Insert new empty item.
					this.store.newItem({
						ID: this.store.next_id++
					});

					// Add back the deleted items.
					dojo.forEach(items_to_restore, function(item) {
						_this.store.newItem(dojo.mixin(item, {ID: _this.store.next_id++}));
					});
				} else if (e.cell.field == 'Type') {
					var item = this.getItem(e.rowIndex);
					var term = this.store.getValue(item, 'Term').toString();
					if (pion.terms.categories_by_id[term] != this._prev_term_type_category) {
						this._prev_term_type_category = pion.terms.categories_by_id[term];
						if (e.cell.widget) {
							e.cell.widget.setQuery({category: pion.terms.categories_by_id[term]});
						} else {
							// Since the widget hasn't been created yet, we can just change widgetProps.query. 
							// (Note that with FilteringSelect, setting widgetProps.query has the desired effect even
							// when the widget already exists.)
							this.structure[0].rows[e.cell.index].widgetProps.query.category = pion.terms.categories_by_id[term];
						}
					}
				}
			});
			var _grid = this.rule_grid;
			var h = _grid.connect(_grid.layout.cells[_grid.term_column_index], 'sizeWidget', function() {
				this.connect(this.layout.cells[_grid.term_column_index].widget, '_close', function(value) {
					_grid.edit.apply();
				});
				this.disconnect(h);
			});
		},
		execute: function(dialogFields) {
			if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
			this.execute_already_called = true;

			var t_store = this.transformation_store;
			var t_item = this.transformation_item;
			var r_store = this.rule_store;
			var rule_objects = [];
			/*
			// This works, but we need to get the items in the order they appear in the grid.
			var reactor = this.reactor;
			r_store.fetch({
				onItem: function(item) {
					var rule_object = {
						Term: r_store.getValue(item, 'Term'),
						Type: r_store.getValue(item, 'Type'),
						SetValue: r_store.getValue(item, 'SetValue')
					};
					pion.initOptionalValue(r_store, item, rule_object, 'Value');
					rule_objects.push(rule_object);
				},
				onComplete: function() {
					t_store.setValue(t_item, 'StopOnFirstMatch', dojo.indexOf(dialogFields.options, 'StopOnFirstMatch') != -1);
					t_store.setValues(t_item, 'Rule', rule_objects);
					reactor.updateNamedCustomPutData('custom_put_data_from_grid_stores');
				},
				onError: pion.handleFetchError
			});
			*/
			for (var i = 0; i < this.rule_grid.rowCount; ++i) {
				var item = this.rule_grid.getItem(i);
				var rule_object = {
					Term: r_store.getValue(item, 'Term'),
					Type: r_store.getValue(item, 'Type'),
					SetValue: r_store.getValue(item, 'SetValue')
				};
				pion.initOptionalValue(r_store, item, rule_object, 'Value');
				rule_objects.push(rule_object);
			}
			t_store.setValue(t_item, 'StopOnFirstMatch', dojo.indexOf(dialogFields.options, 'StopOnFirstMatch') != -1);
			t_store.setValues(t_item, 'Rule', rule_objects);
			this.reactor.updateNamedCustomPutData('custom_put_data_from_grid_stores');
		},
		_populateRuleStore: function() {
			var _this = this;
			dojo.forEach(this.transformation_store.getValues(this.transformation_item, 'Rule'), function(rule) {
				_this.rule_store.newItem(dojo.mixin(rule, {ID: _this.rule_store.next_id++}));
			});
		},
		_handleAddNewRule: function() {
			this.rule_store.newItem({
				ID: this.rule_store.next_id++
			});
		}
	}
);

dojo.declare("plugins.reactors.TransformReactor.RegexConfigurationDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/TransformReactor/RegexConfigurationDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
 		postCreate: function() {
			this.inherited("postCreate", arguments);

			this.attr('value', {SourceTerm: this.transformation_item.SourceTerm});

			// Create and populate a datastore for the Regex grid.
			this.regex_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.regex_store.next_id = 0;
			this._populateRegexStore();

			this.regex_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Exp', name: 'Regex', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ field: 'Format', name: 'Format', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ name: 'Insert Above', styles: 'align: center;', width: 3, editable: false, formatter: pion.makeInsertAboveButton },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false, formatter: pion.makeDeleteButton }
				]
			}];
			this.regex_grid = new dojox.grid.DataGrid({
				store: this.regex_store,
				structure: this.regex_grid_layout,
				rowsPerPage: 1000,
				singleClickEdit: true
			}, document.createElement('div'));
			this.regex_grid_node.appendChild(this.regex_grid.domNode);
			this.regex_grid.startup();
			this.regex_grid.connect(this.regex_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				} else if (e.cell.name == 'Insert Above') {
					// Save items from selected row to bottom.
					var items_to_restore = [];
					var items_to_delete = [];
					for (var i = e.rowIndex; i < this.rowCount; ++i) {
						var item = this.getItem(i);
						var item_object = {
							Exp: this.store.getValue(item, 'Exp'),
							Format: this.store.getValue(item, 'Format')
						};
						items_to_restore.push(item_object);
						items_to_delete.push(item);
					}

					// Delete items from selected row to bottom.
					var _this = this;
					dojo.forEach(items_to_delete, function(item) { _this.store.deleteItem(item); });

					// Insert new empty item.
					this.store.newItem({
						ID: this.store.next_id++
					});

					// Add back the deleted items.
					dojo.forEach(items_to_restore, function(item) {
						_this.store.newItem(dojo.mixin(item, {ID: _this.store.next_id++}));
					});
				}
			});
		},
		execute: function(dialogFields) {
			if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
			this.execute_already_called = true;

			var t_store = this.transformation_store;
			var t_item = this.transformation_item;
			var r_store = this.regex_store;
			var regex_objects = [];
			for (var i = 0; i < this.regex_grid.rowCount; ++i) {
				var item = this.regex_grid.getItem(i);
				var regex_object = {
					Exp: r_store.getValue(item, 'Exp'),
					Format: r_store.getValue(item, 'Format')
				};
				regex_objects.push(regex_object);
			}
			t_store.setValue(t_item, 'SourceTerm', dialogFields.SourceTerm);
			t_store.setValues(t_item, 'Regex', regex_objects);
			this.reactor.updateNamedCustomPutData('custom_put_data_from_grid_stores');
		},
		_populateRegexStore: function() {
			var _this = this;
			dojo.forEach(this.transformation_store.getValues(this.transformation_item, 'Regex'), function(regex) {
				_this.regex_store.newItem(dojo.mixin(regex, {ID: _this.regex_store.next_id++}));
			});
		},
		_handleAddNewRegex: function() {
			this.regex_store.newItem({
				ID: this.regex_store.next_id++
			});
		}
	}
);
