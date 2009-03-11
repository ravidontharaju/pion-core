dojo.provide("plugins.reactors.FissionReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("pion.terms");
dojo.require("pion.codecs");
dojo.require("pion.widgets.TermTextBox");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");

dojo.declare("plugins.reactors.FissionReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function() {
			this.config.Plugin = 'FissionReactor';
			this.inherited("postCreate", arguments);
		}
	}
);

plugins.reactors.FissionReactor.label = 'Fission Reactor';

dojo.declare("plugins.reactors.FissionReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/FissionReactor/FissionReactorInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.plugin = 'FissionReactor';
			console.debug('plugins.reactors.FissionReactorInitDialog.postCreate');
			this.inherited("postCreate", arguments);
		}
	}
);

dojo.declare("plugins.reactors.FissionReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/FissionReactor/FissionReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
		}
	}
);
