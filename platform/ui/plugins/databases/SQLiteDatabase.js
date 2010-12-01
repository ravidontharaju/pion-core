dojo.provide("plugins.databases.SQLiteDatabase");
dojo.require("plugins.databases.Database");

plugins.databases.SQLiteDatabase.label = 'SQLite Database';

dojo.declare("plugins.databases.SQLiteDatabasePane",
	[ plugins.databases.DatabasePane ],
	{
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
		},
		getHeight: function() {
			return this.pane_end.offsetTop;
		}
	}
);
