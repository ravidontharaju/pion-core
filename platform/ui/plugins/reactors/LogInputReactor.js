dojo.provide("plugins.reactors.LogInputReactor");
dojo.require("plugins.reactors.Reactor");

dojo.declare("plugins.reactors.LogInputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'LogInputReactor';
			//console.debug('LogInputReactor.postCreate: ', this.domNode);
			this.inherited("postCreate", arguments); 
		}
	}
);

plugins.reactors.LogInputReactor.label = 'Log File Input Reactor';

dojo.declare("plugins.reactors.LogInputReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "collection/LogInputReactor/LogInputReactorInitDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.plugin = 'LogInputReactor';
			console.debug('plugins.reactors.LogInputReactorInitDialog.postCreate');
			this.inherited("postCreate", arguments);
		}
	}
);

dojo.declare("plugins.reactors.LogInputReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "collection/LogInputReactor/LogInputReactorDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			if (this.reactor.config.JustOne != 'true') {
				this.reactor.config.JustOne = 'false';
			}
		}
	}
);

