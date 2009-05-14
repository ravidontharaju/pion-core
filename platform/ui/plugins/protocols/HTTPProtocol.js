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
		}
	}
);