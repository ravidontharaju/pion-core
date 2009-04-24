dojo.provide("plugins.protocols.HTTPProtocol");
dojo.require("plugins.protocols.Protocol");

plugins.protocols.HTTPProtocol.label = 'HTTP Protocol';

dojo.declare("plugins.protocols.HTTPProtocolPane",
	[ plugins.protocols.ProtocolPane ],
	{
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
		},
		getHeight: function() {
			// TODO: replace 525 with some computed value
			return 525;
		}
	}
);