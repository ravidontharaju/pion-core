dojo.provide("plugins.reactors.DatabaseOutputReactor");
dojo.require("plugins.reactors.Reactor");

dojo.declare("plugins.reactors.DatabaseOutputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'DatabaseOutputReactor';
			this.inherited("postCreate", arguments);
		}
	}
);
