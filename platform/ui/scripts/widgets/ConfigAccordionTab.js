dojo.provide("pion.widgets.ConfigAccordionTab");
dojo.require("dijit.layout.ContentPane");
dojo.require("pion.widgets.ConfigAccordion");

dojo.declare("pion.widgets.ConfigAccordionTab",
	[dijit.layout.ContentPane, dijit._Templated],
	{
		templateString: dojo.cache('pion.widgets', 'templates/ConfigAccordionTab.html'),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited('postCreate', arguments);
		}
	}
);
