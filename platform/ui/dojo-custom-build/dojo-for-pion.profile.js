dependencies = {
	layers:  [
		{
		name: "dojo-for-pion.js",
		dependencies: [
			"dojo.parser",
			"dojo.data.ItemFileReadStore",
			"dojo.data.ItemFileWriteStore",
			"dojo.dnd.move",
			"dojo.dnd.Source",
			"dijit.Dialog",
			"dijit.form.FilteringSelect",
			"dijit.form.Form",
			"dijit.form.TextBox",
			"dijit.form.Textarea",
			"dijit.form.ValidationTextBox",
			"dijit.form.Button",
			"dijit.form.CheckBox",
			"dijit.layout.ContentPane",
			"dijit.layout.BorderContainer",
			"dijit.layout.AccordionContainer",
			"dijit.layout.StackContainer",
			"dijit.layout.TabContainer",
			"dijit.Menu",
			"dijit.Tree",
			"dojox.data.XmlStore",
			"dojox.gfx",
			"dojox.grid.DataGrid",
			"dojox.grid.cells.dijit",
			"dojox.xml.DomParser",
			"dojox.dtl",
			"dojox.dtl.filter.strings",
		]
		}
	],
	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
};
