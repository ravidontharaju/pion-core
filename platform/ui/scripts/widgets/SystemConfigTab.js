dojo.provide("pion.widgets.SystemConfigTab");
dojo.require("dojo.cache");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.form.Button");

dojo.declare("pion.widgets.SystemConfigTab",
	[dijit.layout.ContentPane, dijit._Templated],
	{
		templateString: dojo.cache('pion.widgets', 'templates/SystemConfigTab.html'),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited('postCreate', arguments);
		}
	}
);
