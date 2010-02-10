dojo.provide("plugins.protocols.HTTPProtocol");
dojo.require("plugins.protocols.Protocol");

plugins.protocols.HTTPProtocol.label = 'HTTP Protocol';

dojo.declare("plugins.protocols.HTTPProtocolPane",
	[ plugins.protocols.ProtocolPane ],
	{
		templatePath: dojo.moduleUrl("plugins", "protocols/HTTPProtocol/HTTPProtocolPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
		},
		populateWithDefaults: function() {
			this.inherited('populateWithDefaults', arguments);
			this.form.attr('value', {MaxRequestContentLength: 1048576, MaxResponseContentLength: 1048576});
		},
		getHeight: function() {
			// TODO: replace 525 with some computed value
			return 525;
		},
		_addCustomConfigValues: function(config, item) {
			var store = pion.codecs.config_store;
			config.options = []; // By default, RawRequestHeaders and RawResponseHeaders are both false.

			// Override defaults if options present in the configuration.
			if (store.hasAttribute(item, 'RawRequestHeaders')) {
				if (store.getValue(item, 'RawRequestHeaders').toString() == 'true') {
					config.options.push('RawRequestHeaders');
				}
			}
			if (store.hasAttribute(item, 'RawResponseHeaders')) {
				if (store.getValue(item, 'RawResponseHeaders').toString() == 'true') {
					config.options.push('RawResponseHeaders');
				}
			}
		},
		_makeCustomElements: function(config) {
			var put_data = '<RawRequestHeaders>';
			put_data += (dojo.indexOf(config.options, 'RawRequestHeaders') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</RawRequestHeaders><RawResponseHeaders>';
			put_data += (dojo.indexOf(config.options, 'RawResponseHeaders') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</RawResponseHeaders>';
			return put_data;
		}
	}
);
