dojo.provide("plugins.reactors.TransformReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("pion.widgets.TermTextBox");
dojo.require("pion.terms");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");

dojo.declare("plugins.reactors.TransformReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function() {
			this.config.Plugin = 'TransformReactor';
			this.inherited("postCreate", arguments);
			this._initOptions(this.config, plugins.reactors.TransformReactor.option_defaults);
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
			store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					dojo.forEach(store.getValues(item, 'Transformation'), function(t_item) {
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
							pion.initOptionalValue(store, t_item, new_t_item_object, 'DefaultAction', 'undefined');
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
						} else {
							new_t_item_object.Value = store.getValue(t_item, 'Value');
						}
						_this.transformation_store.newItem(new_t_item_object);
					});
				},
				onComplete: function() {
					_this.transformation_store_is_ready = true;
					_this.onDonePopulatingTransformationStore();
				},
				onError: pion.handleFetchError
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
					put_data += '<Type>' + t_store.getValue(item, 'Type') + '</Type>';
					var type = t_store.getValue(item, 'Type');
					if (type == 'Lookup') {
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'LookupTerm');
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'Match');
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'Format');
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'DefaultAction');
						put_data += pion.makeXmlLeafElementFromItem(t_store, item, 'DefaultValue');
						dojo.forEach(t_store.getValues(item, 'Lookup'), function(lookup) {
							put_data += '<Lookup key="' + pion.escapeXml(lookup.Key) + '">' + pion.escapeXml(lookup.Value) + '</Lookup>';
						});
					} else if (type == 'Rules') {
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
						put_data += pion.makeXmlLeafElement('SourceTerm', t_store.getValue(item, 'SourceTerm'));
						dojo.forEach(t_store.getValues(item, 'Regex'), function(regex) {
							put_data += '<Regex exp="' + pion.escapeXml(regex.Exp) + '">' + pion.escapeXml(regex.Format) + '</Regex>';
						});
					} else {
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
			this.reactor._initOptions(this.reactor.config, plugins.reactors.TransformReactor.option_defaults);
			var _this = this;
			pion.terms.store.fetch({
				query: {Type: 'object'},
				onItem: function(item) {
					plugins.reactors.TransformReactor.outgoing_event_type_store.newItem({id: pion.terms.store.getIdentity(item)});
				},
				onComplete: function() {
					if (_this.reactor.config.OutgoingEvent) {
						_this.attr('value', {OutgoingEvent: _this.reactor.config.OutgoingEvent});
					}
				}
			});
			var h = dojo.connect(this.reactor, 'onDonePopulatingGridStores', function() {
				_this._updateCustomPutDataFromGridStores();
				_this.connect(_this.reactor.transformation_store, 'onNew', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.transformation_store, 'onSet', '_updateCustomPutDataFromGridStores');
				_this.connect(_this.reactor.transformation_store, 'onDelete', '_updateCustomPutDataFromGridStores');
				dojo.disconnect(h);
			});
			this.reactor.reloadGridStores();

			this.transformation_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Term', name: 'Term', width: 14, 
						type: pion.widgets.TermTextCell },
					{ field: 'Type', name: 'Transformation Type', width: 12, 
						widgetClass: "dijit.form.FilteringSelect", 
						widgetProps: {store: plugins.reactors.TransformReactor.transform_type_store, searchAttr: "description"} },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter2 },
					{ field: 'Value', name: 'Value', width: 'auto',
						type: pion.widgets.TermTextCell },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]
			}];
			this.value_text_column_index = 2;
			this.value_term_column_index = 3;
			this.transformation_grid = new dojox.grid.DataGrid({
				store: this.reactor.transformation_store,
				structure: this.transformation_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));

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
							this.layout.setColumnVisibility(_this.value_text_column_index, ! use_term_selector);
							this.layout.setColumnVisibility(_this.value_term_column_index, use_term_selector);

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

			this.transformation_grid.canEdit = function(cell, row_index) {
				switch (cell.field) {
					// Disable editing of 'Value' cell if 'Type' is not 'AssignValue' or 'AssignTerm'.
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
						} else if (type == 'AssignTerm') {
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

					// Disable editing of 'Set Term' cell if 'In Place' cell is set to true.
					case 'SetTerm':
						var item = this.getItem(row_index);
						var in_place = this.store.getValue(item, 'InPlace');
						return ! in_place;

					default:
						return true;
				}
			}
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

plugins.reactors.TransformReactor.transform_type_store = new dojo.data.ItemFileReadStore(
	{data: {identifier: 'name', items: [{name: 'AssignValue', description: 'Assign Value'},
										{name: 'AssignTerm',  description: 'Assign Term'},
										{name: 'Lookup',      description: 'Lookup'},
										{name: 'Rules',       description: 'Rules'},
										{name: 'Regex',       description: 'Regex'}]}}
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

			if (! this.transformation_itemDefaultAction)
				this.transformation_item.DefaultAction = 'undefined';
			this.attr('value', this.transformation_item);

			// Create and populate a datastore for the Lookup grid.
			this.lookup_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.lookup_store.next_id = 0;
			this._populateLookupStore();

			this.lookup_grid_layout = [{
				defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;' },
				rows: [
					{ field: 'Key', name: 'Key', width: 14 },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ name: 'Insert Above', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="insert_row"><img src="images/arrowUp.png" alt="INSERT ABOVE" border="0" /></button>'},
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]
			}];
			this.lookup_grid = new dojox.grid.DataGrid({
				store: this.lookup_store,
				structure: this.lookup_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
			this.lookup_grid_node.appendChild(this.lookup_grid.domNode);
			this.lookup_grid.startup();
			this.lookup_grid.connect(this.lookup_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
				} else if (e.cell.name == 'Insert Above') {
					// Save items from selected row to bottom.
					var items_to_restore = [];
					var items_to_delete = [];
					for (var i = e.rowIndex; i < this.rowCount; ++i) {
						var item = this.getItem(i);
						var item_object = {
							Key: this.store.getValue(item, 'Key'),
							Value: this.store.getValue(item, 'Value')
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
				this.format_text_box.setValue('');
				//this.format_text_box.domNode.style.visibility = 'hidden';
				this.output_radio_button.attr('disabled', true);
				this.attr('value', {DefaultAction: 'undefined'});
			}
		},
		_onDefaultActionChanged: function(e) {
			if (e.target.value == 'fixedvalue') {
				this.default_value.attr('disabled', false);
				this.default_value.domNode.style.visibility = 'visible';
			} else {
				this.default_value.attr('disabled', true);
				this.default_value.setValue('');
				this.default_value.domNode.style.visibility = 'hidden';
			}
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
				this.setValues({options: ['StopOnFirstMatch']});

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
						widgetClass: "dijit.form.FilteringSelect", 
						widgetProps: {store: pion.reactors.comparison_type_store, query: {category: 'generic'}} },
					{ field: 'Value', name: 'Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ field: 'SetValue', name: 'Set Value', width: 'auto',
						formatter: pion.xmlCellFormatter },
					{ name: 'Insert Above', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="insert_row"><img src="images/arrowUp.png" alt="INSERT ABOVE" border="0" /></button>'},
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]
			}];
			this.rule_grid = new dojox.grid.DataGrid({
				store: this.rule_store,
				structure: this.rule_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
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
					this.structure[0].rows[e.cell.index].widgetProps.query.category = pion.terms.categories_by_id[term];
				}
			});
		},
		execute: function(dialogFields) {
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
					{ name: 'Insert Above', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="insert_row"><img src="images/arrowUp.png" alt="INSERT ABOVE" border="0" /></button>'},
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]
			}];
			this.regex_grid = new dojox.grid.DataGrid({
				store: this.regex_store,
				structure: this.regex_grid_layout,
				singleClickEdit: true,
				autoHeight: true
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
