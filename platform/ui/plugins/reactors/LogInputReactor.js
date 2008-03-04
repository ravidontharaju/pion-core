dojo.provide("plugins.reactors.LogInputReactor");
dojo.require("plugins.reactors.Reactor");

dojo.declare("plugins.reactors.LogInputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'LogInputReactor';
			console.debug('LogInputReactor.postCreate: ', this.domNode);
			this.inherited("postCreate", arguments); 
		}
	}
);

dojo.declare("plugins.reactors.LogInputReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/LogInputReactor/LogInputReactorInitDialog.html"),
		templateString: "",       // Necessary to keep Dijit from using templateString in dijit.Dialog
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.reactors.LogInputReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/LogInputReactor/LogInputReactorDialog.html"),
		templateString: "",
		widgetsInTemplate: true
	}
);

