dojo.provide("pion.widgets.ReactorConfigTab");
dojo.require("dojo.cache");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.ToggleButton");

dojo.declare("pion.widgets.ReactorConfigTab",
	[dijit.layout.ContentPane, dijit._Templated],
	{
		templateString: dojo.cache('pion.widgets', 'templates/ReactorConfigTab.html'),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited('postCreate', arguments);
		}
	}
);
