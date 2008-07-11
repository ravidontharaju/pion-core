dojo.provide("plugins.reactors.SnifferReactor");
dojo.require("plugins.reactors.Reactor");

dojo.declare("plugins.reactors.SnifferReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'SnifferReactor';
			console.debug('SnifferReactor.postCreate: ', this.domNode);
			this.inherited("postCreate", arguments); 
		}
	}
);

dojo.declare("plugins.reactors.SnifferReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/SnifferReactor/SnifferReactorInitDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.plugin = 'SnifferReactor';
			this.inherited("postCreate", arguments);
		}
	}
);

dojo.declare("plugins.reactors.SnifferReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "processing/SnifferReactor/SnifferReactorDialog.html"),
		widgetsInTemplate: true
	}
);

