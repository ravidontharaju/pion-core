dojo.provide("plugins.reactors.FilterReactor");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojox.grid.Grid");

dojo.declare("plugins.reactors.FilterReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.plugin = 'FilterReactor';
			console.debug('FilterReactor.postCreate: ', this.domNode);
			this.inherited("postCreate", arguments); 
			this.comparisons = [];
		}
	}
);

dojo.declare("plugins.reactors.FilterReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/FilterReactor/FilterReactorDialog.html"),
		templateString: "",
		widgetsInTemplate: true
	}
);

