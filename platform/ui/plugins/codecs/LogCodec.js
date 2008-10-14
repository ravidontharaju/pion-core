dojo.provide("plugins.codecs.LogCodec");
dojo.require("plugins.codecs.Codec");

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
			this.attributes_by_column = ['text()', '@term', '@start', '@end', '@strict', '@escape', '@empty'];
			this.order_col_index = 7;
			this.delete_col_index = 8;
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
			if (store.hasAttribute(item, 'Headers')) {
				if (store.getValue(item, 'Headers').toString() == 'true') {
					config.options.push('Headers');
					dojo.query('input', this.separators).forEach(function(n) { n.setAttribute('disabled', true); });
				}
			}

			var events_item = store.getValue(item, 'Events');
			if (events_item) {
				config['@event_split_set'] = store.getValue(events_item, '@split');
				config['@event_join_string'] = store.getValue(events_item, '@join');
				config['@comment_prefix'] = store.getValue(events_item, '@comment');
			}
			var fields_item = store.getValue(item, 'Fields');
			if (fields_item) {
				config['@field_split_set'] = store.getValue(fields_item, '@split');
				config['@field_join_string'] = store.getValue(fields_item, '@join');
				config['@consec_field_delims'] = store.getValue(fields_item, '@consume');
			}
		},
		_makeCustomElements: function(config) {
			var put_data = '<Flush>';
			put_data += (dojo.indexOf(config.options, 'Flush') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</Flush><Headers>';
			put_data += (dojo.indexOf(config.options, 'Headers') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</Headers><Events';
			if (config['@event_split_set']) {
				put_data += ' split="' + config['@event_split_set'] + '"';
			}
			if (config['@event_join_string']) {
				put_data += ' join="' + config['@event_join_string'] + '"';
			}
			if (config['@comment_prefix']) {
				put_data += ' comment="' + config['@comment_prefix'] + '"';
			}
			put_data += '/><Fields';
			if (config['@field_split_set']) {
				put_data += ' split="' + config['@field_split_set'] + '"';
			}
			if (config['@field_join_string']) {
				put_data += ' join="' + config['@field_join_string'] + '"';
			}
			if (config['@consec_field_delims']) {
				put_data += ' consume="' + config['@consec_field_delims'] + '"';
			}
			put_data += '/>';
			return put_data;
		},
		_makeFieldTable: function(item) {
			var store = pion.codecs.config_store;
			var field_attrs = store.getValues(item, 'Field');
			var field_table = [];
			this.order_map = [];
			for (var i = 0; i < field_attrs.length; ++i) {
				var field_table_row = [];
				for (var j = 0; j < this.attributes_by_column.length; ++j) {
					field_table_row[j] = store.getValue(field_attrs[i], this.attributes_by_column[j]);
				}
				field_table_row[this.order_col_index] = i + 1;
				field_table.push(field_table_row);

				this.order_map[i] = i + 1;
			}
			return field_table;
		},
		_setGridStructure: function(grid) {
			if (!plugins.codecs.CodecPane.log_codec_grid_layout) {
				plugins.codecs.initGridLayouts();
			}
			grid.setStructure(plugins.codecs.CodecPane.log_codec_grid_layout);
		},
		_handleCellEdit: function(inValue, inRowIndex, inFieldIndex) {
			console.debug('LogCodecPane._handleCellEdit inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', inFieldIndex = ', inFieldIndex);
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
		_makeFieldElements: function() {
			var num_field_mappings = plugins.codecs.CodecPane.grid_model.getRowCount();
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
			for (var i = 0; i < num_field_mappings; ++i) {
				var row = plugins.codecs.CodecPane.grid_model.getRow(inverse_order_map[i]);
				put_data += '<Field term="' + row[1] + '"';
				if (row[2]) {
					put_data += ' start="' + dojox.dtl.filter.htmlstrings.escape(row[2]) + '"';
				}
				if (row[3]) {
					put_data += ' end="' + dojox.dtl.filter.htmlstrings.escape(row[3]) + '"';
				}
				if (row[4]) {
					put_data += ' strict=true"';
				}
				if (row[5]) {
					put_data += ' escape="' + dojox.dtl.filter.htmlstrings.escape(row[5]) + '"';
				}
				if (row[6]) {
					put_data += ' empty="' + dojox.dtl.filter.htmlstrings.escape(row[6]) + '"';
				}
				put_data += '>' + row[0] + '</Field>';
			}
			return put_data;
		},
		updateDisabling: function(e) {
			if (e.target.checked) {
				dojo.query('input', this.separators).forEach(function(n) { n.setAttribute('disabled', true); });
				var form_values = this.form.getValues();
				form_values['@event_split_set'] = '\\r\\n';
				form_values['@event_join_string'] = '\\n';
				form_values['@comment_prefix'] = '#';
				form_values['@field_split_set'] = ' \\t';
				form_values['@field_join_string'] = ' ';
				form_values['@consec_field_delims'] = 'true';
				this.form.setValues(form_values);
			} else {
				dojo.query('input', this.separators).forEach(function(n) { n.removeAttribute('disabled'); });
			}
		}
	}
);
