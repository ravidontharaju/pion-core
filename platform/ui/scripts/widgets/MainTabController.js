dojo.provide("pion.widgets.MainTabController");
dojo.require("dijit.layout.ScrollingTabController");

dojo.declare("pion.widgets.MainTabController",
	dijit.layout.ScrollingTabController,
	{
	buildRendering: function(){
		this.dir = 'rtl';
		this.inherited(arguments);
	}
});
