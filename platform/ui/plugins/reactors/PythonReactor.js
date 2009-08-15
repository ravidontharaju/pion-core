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
		},
		uninitialize: function() {
			this.inherited("uninitialize", arguments);
		},
		// _insertCustomData() is called (indirectly) when the user clicks 'Save Reactor'.
		_insertCustomData: function(dialogFields) {
			var python_line = this.python_text_area.value.replace(/\n/g, ' ').replace(/\s+/g, ' ');
			var put_data = pion.makeXmlLeafElement('PythonSource', python_line);
			this.put_data += put_data;
			this.reactor.custom_put_data_from_config = put_data;
		}
	}
);
