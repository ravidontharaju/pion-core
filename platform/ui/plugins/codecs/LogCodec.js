dojo.provide("plugins.codecs.LogCodec");
dojo.require("plugins.codecs.Codec");
dojo.require("pion.widgets.TermTextBox");

plugins.codecs.LogCodec = {
	custom_post_data: '<Flush>false</Flush><Headers>false</Headers>'
					+ '<Events split="\\r\\n" join="\\n" comment="#"/>'
					+ '<Fields split=" \\t" join="\\_" consume="true"/>'
}

dojo.declare("plugins.codecs.LogCodecPane",
	[ plugins.codecs.CodecPane ],
	{
		templatePath: dojo.moduleUrl("plugins", "codecs/LogCodec/LogCodecPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.special_config_elements.push('Events');
			this.special_config_elements.push('Fields');
			this.populateWithDefaults();
		},
		populateWithDefaults: function() {
			this.inherited('populateWithDefaults', arguments);
			this.form.attr('value', {TimeOffset: 0});

			// TODO: Is this the right thing to do, or should the default values be used, as in custom_post_data?
			this.form.attr('value', {
				'@event_split_set': '',
				'@event_join_string': '',
				'@comment_prefix': '',
				'@field_split_set': '',
				'@field_join_string': '',
				'@consec_field_delims': 'true'
			});
		},
		_initFieldMappingGridLayout: function() {
			this.field_mapping_grid_layout = [{
				defaultCell: { editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: left;' },
				rows: [
					{ field: 'FieldName', name: 'Field Name', width: 15,
						formatter: pion.xmlCellFormatter },
					{ field: 'Term', name: 'Term', width: 15, 
						type: pion.widgets.TermTextCell },
					// TODO: restore validation.
					{ field: 'StartChar', name: 'Start Char', styles: 'text-align: center', width: 3 },
					// TODO: restore validation.
					{ field: 'EndChar', name: 'End Char', styles: 'text-align: center', width: 3 },
					{ field: 'StartEndOptional', name: 'Start/End Optional', width: 4, 
						type: dojox.grid.cells.Bool },
					{ field: 'URLEncode', name: 'URL Encode', width: 4, 
						type: dojox.grid.cells.Bool },
					// TODO: restore validation.
					{ field: 'EscapeChar', name: 'Escape Char', styles: 'text-align: center', width: 3 },
					{ field: 'EmptyString', name: 'Empty String', width: 3,
						formatter: pion.xmlCellFormatter },
					{ field: 'Order', name: 'Order', width: 'auto',
						widgetClass: "dijit.form.NumberSpinner" },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false, formatter: pion.makeDeleteButton }
				]
			}];
		},
 		getHeight: function() {
			// TODO: replace 610 with some computed value
			return 610;
		},
		_addCustomConfigValues: function(config, item) {
			var store = pion.codecs.config_store;
			config.options = []; // By default, Flush and Headers are both false.

			// Override defaults if options present in the configuration.
			if (store.hasAttribute(item, 'Flush')) {
				if (store.getValue(item, 'Flush').toString() == 'true') {
					config.options.push('Flush');
				}
			}
			var headers = false;
			if (store.hasAttribute(item, 'Headers')) {
				if (store.getValue(item, 'Headers').toString() == 'true') {
					config.options.push('Headers');
					this.disableAndClearFieldSeparatorFields();
					headers = true;
				}
			}

			var events_item = store.getValue(item, 'Events');
			if (events_item) {
				config['@event_split_set'] = store.getValue(events_item, '@split');
				config['@event_join_string'] = store.getValue(events_item, '@join');
				config['@comment_prefix'] = store.getValue(events_item, '@comment');
			}
			if (! headers) {
				var fields_item = store.getValue(item, 'Fields');
				if (fields_item) {
					config['@field_split_set'] = store.getValue(fields_item, '@split');
					config['@field_join_string'] = store.getValue(fields_item, '@join');
					config['@consec_field_delims'] = store.getValue(fields_item, '@consume');
				}
			}
		},
		_makeCustomElements: function(config) {
			var put_data = '<Flush>';
			put_data += (dojo.indexOf(config.options, 'Flush') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</Flush><Headers>';
			put_data += (dojo.indexOf(config.options, 'Headers') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</Headers><Events';
			if (config['@event_split_set']) {
				put_data += ' split="' + pion.escapeXml(config['@event_split_set']) + '"';
			}
			if (config['@event_join_string']) {
				put_data += ' join="' + pion.escapeXml(config['@event_join_string']) + '"';
			}
			if (config['@comment_prefix']) {
				put_data += ' comment="' + pion.escapeXml(config['@comment_prefix']) + '"';
			}
			put_data += '/><Fields';
			if (config['@field_split_set']) {
				put_data += ' split="' + pion.escapeXml(config['@field_split_set']) + '"';
			}
			if (config['@field_join_string']) {
				put_data += ' join="' + pion.escapeXml(config['@field_join_string']) + '"';
			}
			if (config['@consec_field_delims']) {
				put_data += ' consume="' + pion.escapeXml(config['@consec_field_delims']) + '"';
			}
			put_data += '/>';
			return put_data;
		},

		// Overrides CodecPane._repopulateFieldMappingStore().
		_repopulateFieldMappingStore: function(codec_config_item) {
			var _this = this;
			var store = pion.codecs.config_store;
			_this.order_map = [];
			var order = 1;
			dojo.forEach(store.getValues(codec_config_item, 'Field'), function(field_mapping) {
				var field_mapping_item = {
					ID: _this.field_mapping_store.next_id++,
					FieldName: store.getValue(field_mapping, 'text()'),
					Term: store.getValue(field_mapping, '@term'),
					StartChar: store.getValue(field_mapping, '@start'),
					EndChar: store.getValue(field_mapping, '@end'),
					StartEndOptional: store.getValue(field_mapping, '@optional'),
					URLEncode: store.getValue(field_mapping, '@urlencode'),
					EscapeChar: store.getValue(field_mapping, '@escape'),
					EmptyString: store.getValue(field_mapping, '@empty'),
					Order: order
				};
				_this.field_mapping_store.newItem(field_mapping_item);

				_this.order_map.push(order++);
			});
		},
		_handleCellEdit: function(inValue, inRowIndex, attr_name) {
			console.debug('LogCodecPane._handleCellEdit inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', attr_name = ', attr_name);
			dojo.addClass(this.domNode, 'unsaved_changes');
			if (attr_name == 'Order') {
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
				for (var i = 0; i < order_map.length; ++i) {
					var item = this.field_mapping_grid.getItem(i);
					this.field_mapping_store.setValue(item, 'Order', order_map[i]);
				}
			}
		},
		// Overrides CodecPane._makeFieldElements().
		_makeFieldElements: function(items) {
			var num_field_mappings = items.length;
			var inverse_order_map = [];
			for (var i = 0; i < num_field_mappings; ++i) {
				if (this.order_map.length == num_field_mappings) {
					inverse_order_map[this.order_map[i] - 1] = i;
				} else {
					// TODO: This block is temporary, until ordering implementation is finished.
					// The order might be wrong, but at least it won't crash.
					inverse_order_map[i] = i;
				}
			}
			console.debug('this.order_map = ', this.order_map);
			console.debug('inverse_order_map = ', inverse_order_map);
			var put_data = '';
			var store = this.field_mapping_store;
			for (var i = 0; i < num_field_mappings; ++i) {
				var item = items[inverse_order_map[i]];
				put_data += '<Field term="' + store.getValue(item, 'Term') + '"';
				if (store.getValue(item, 'StartChar')) {
					put_data += ' start="' + pion.escapeXml(store.getValue(item, 'StartChar')) + '"';
				}
				if (store.getValue(item, 'EndChar')) {
					put_data += ' end="' + pion.escapeXml(store.getValue(item, 'EndChar')) + '"';
				}
				if (store.getValue(item, 'StartEndOptional')) {
					put_data += ' optional="true"';
				}
				if (store.getValue(item, 'URLEncode')) {
					put_data += ' urlencode="true"';
				}
				if (store.getValue(item, 'EscapeChar')) {
					put_data += ' escape="' + pion.escapeXml(store.getValue(item, 'EscapeChar')) + '"';
				}
				if (store.getValue(item, 'EmptyString')) {
					put_data += ' empty="' + pion.escapeXml(store.getValue(item, 'EmptyString')) + '"';
				}
				put_data += '>' + pion.escapeXml(store.getValue(item, 'FieldName')) + '</Field>';
			}
			return put_data;
		},
		disableAndClearFieldSeparatorFields: function() {
			dojo.query('input.disable_for_ELF', this.separators).forEach(function(n) { n.setAttribute('disabled', true); });
			dojo.query('select', this.separators).forEach(function(n) {
				dijit.byNode(n).attr('disabled', true);

				// TODO: change pion.widgets.SimpleSelect to make this work, i.e. so that nothing is selected.
				//dijit.byNode(n).attr('value', null);
			});
			dojo.query('label.disable_for_ELF', this.separators).forEach(function(n) { dojo.addClass(n, 'disabled'); });
			var form_values = this.form.attr('value');
			form_values['@field_split_set'] = '';
			form_values['@field_join_string'] = '';
			this.form.attr('value', form_values);
		},
		updateDisabling: function(e) {
			if (e.target.checked) {
				this.disableAndClearFieldSeparatorFields();
			} else {
				dojo.query('input.disable_for_ELF', this.separators).forEach(function(n) { n.removeAttribute('disabled'); });
				dojo.query('select', this.separators).forEach(function(n) { dijit.byNode(n).attr('disabled', false); });
				dojo.query('label.disable_for_ELF', this.separators).forEach(function(n) { dojo.removeClass(n, 'disabled'); });
			}
		}
	}
);
