dojo.provide("plugins.reactors.SQLiteOutputReactor");
dojo.require("plugins.reactors.Reactor");

dojo.declare("plugins.reactors.SQLiteOutputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'SQLiteOutputReactor';
			this.inherited("postCreate", arguments);
		}
	}
);
