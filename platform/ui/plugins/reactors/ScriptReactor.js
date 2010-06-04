dojo.provide("plugins.reactors.ScriptReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("pion.widgets.SimpleSelect");

dojo.declare("plugins.reactors.ScriptReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'ScriptReactor';
			this.inherited("postCreate", arguments); 
		}
	}
);

plugins.reactors.ScriptReactor.label = 'Script Reactor';

dojo.declare("plugins.reactors.ScriptReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/ScriptReactor/ScriptReactorInitDialog.html"),
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

dojo.declare("plugins.reactors.ScriptReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/ScriptReactor/ScriptReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
		}
	}
);
