dojo.provide("plugins.reactors.LogOutputReactor");
dojo.require("plugins.reactors.Reactor");

dojo.declare("plugins.reactors.LogOutputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'LogOutputReactor';
			console.debug('LogOutputReactor.postCreate: ', this.domNode);
			this.inherited("postCreate", arguments); 
		}
	}
);

dojo.declare("plugins.reactors.LogOutputReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/LogOutputReactor/LogOutputReactorInitDialog.html"),
		templateString: "",
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.reactors.LogOutputReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/LogOutputReactor/LogOutputReactorDialog.html"),
		templateString: "",
		widgetsInTemplate: true
	}
);

