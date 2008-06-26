dojo.provide("plugins.codecs.LogCodec");
dojo.require("plugins.codecs.Codec");

dojo.declare("plugins.codecs.LogCodec",
	[ plugins.codecs.Codec ],
	{
		postCreate: function(){
			this.config.Plugin = 'LogCodec';
			this.inherited("postCreate", arguments);
		}
	}
);

dojo.declare("plugins.codecs.LogCodecPane",
	[ plugins.codecs.CodecPane ],
	{
		templatePath: dojo.moduleUrl("plugins", "codecs/LogCodec/LogCodecPane.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.attributes_by_column = ['text()', '@term', '@start', '@end'];
			this.order_col_index = 4;
			this.delete_col_index = 5;
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
				put_data += '>' + row[0] + '</Field>';
			}
			return put_data;
		}
	}
);
