dojo.provide("plugins.reactors.PythonReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("dijit.form.TextBox");

dojo.declare("plugins.reactors.PythonReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function() {
			this.config.Plugin = 'PythonReactor';
			this.inherited("postCreate", arguments);
			//this._initOptions(this.config, plugins.reactors.PythonReactor.option_defaults);
			this.special_config_elements.push('PythonSource');
			var _this = this;
			var r_store = pion.reactors.config_store;
			r_store.fetch({
				query: {'@id': this.config['@id']},
				onItem: function(item) {
					if (r_store.hasAttribute(item, 'PythonSource')) {
						var python_code = r_store.getValue(item, 'PythonSource');
						var put_data = pion.makeXmlLeafElement('PythonSource', python_code);
						_this.custom_put_data_from_config = put_data;
					} else {
						_this.custom_put_data_from_config = '';
					}
				},
				onError: pion.handleFetchError
			});
		},
		// _insertCustomData() is called when moving the Reactor.
		_insertCustomData: function() {
			this.put_data += this.custom_put_data_from_config;
		}
	}
);

plugins.reactors.PythonReactor.label = 'Python Reactor';

dojo.declare("plugins.reactors.PythonReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/PythonReactor/PythonReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			var r_store = pion.reactors.config_store;
			r_store.fetch({
				query: {'@id': this.reactor.config['@id']},
				onItem: function(item) {
					if (r_store.hasAttribute(item, 'Filename')) {
						_this.attr('value', {Filename: r_store.getValue(item, 'Filename')});
					}
					if (r_store.hasAttribute(item, 'PythonSource')) {
						_this.python_text_area.value = r_store.getValue(item, 'PythonSource');
					}
				},
				onError: pion.handleFetchError
			});
			this.connect(this.python_text_area, 'onkeydown', function(e) {
				if (e.keyCode === dojo.keys.TAB){
					// We need to insert a tab, then stop the event, because the normal behavior is to tab to the next field. 
					if (dojo.isIE) {
						// Get the current selection.
						var range = document.selection.createRange();
						// We'll use this as a 'dummy'.
						var stored_range = range.duplicate();
						// Select all text.
						stored_range.moveToElementText(this.python_text_area);
						// Now move 'dummy' end point to end point of original range.
						stored_range.setEndPoint('EndToEnd', range);
						// Calculate the end point of the substring after which the tab should be appended.
						var p1 = stored_range.text.length - range.text.length;
						if (range.text.length == 0) {
							// This hack deals with the fact that a zero length selection (i.e. a cursor) at the end of
							// a line is indistinguishable from one at the beginning of the next line in terms of text.
							// For some reason, in the latter case, the endpoint of the range is before the CRLF.
							// So, we have to look at the actual pixel offset (!) to see if the range starts at the
							// beginning of a line, and compensate if it does.
							var text_area_contents = this.python_text_area.createTextRange();
							if (range.boundingLeft == text_area_contents.boundingLeft)
								p1 += 2; // move position to after the CRLF
						}
						// Calculate the starting point of the substring to be copied and appended after the tab.
						var p2 = p1 + range.text.length;
						this.python_text_area.value = this.python_text_area.value.substring(0, p1) + '\t'
													+ this.python_text_area.value.substring(p2);
						with (range) {
							var first_part = this.python_text_area.value.substring(0, p1 + 1);
							var offset_from_start = first_part.replace(/\r/g, "").length + 1; // +1 due to inserted tab
							var cur_pos = offset_from_start;
							moveStart("character", cur_pos);
							var temp = this.python_text_area.value.replace(/\r/g, "");
							var offset_from_end = (cur_pos - temp.length) - 1;
							moveEnd("character", offset_from_end);
							select();
						}
					} else {
						var p1 = this.python_text_area.selectionStart;
						var p2 = this.python_text_area.selectionEnd;
						this.python_text_area.value = this.python_text_area.value.substring(0, p1) + '\t'
													+ this.python_text_area.value.substring(p2);
						this.python_text_area.setSelectionRange(p1 + 1, p1 + 1);
					}
					dojo.stopEvent(e); // Prevent tab from moving focus away from this.python_text_area.
				}
			});
		},
		uninitialize: function() {
			this.inherited("uninitialize", arguments);
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save Reactor'.
		_insertCustomData: function(dialogFields) {
			var python_source = this.python_text_area.value;
			var put_data = pion.makeXmlLeafElement('PythonSource', python_source);
			this.put_data += put_data;
			this.reactor.custom_put_data_from_config = put_data;
		}
	}
);
