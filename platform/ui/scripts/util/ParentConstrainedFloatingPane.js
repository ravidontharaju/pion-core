dojo.provide("pion.util.ParentConstrainedFloatingPane");

dojo.require("dojox.layout.FloatingPane");

dojo.declare("pion.util.ParentConstrainedFloatingPane",
	dojox.layout.FloatingPane,
	{
		//	summary:
		//		Modifies FloatingPane so that it can't be dragged to a place where the controls are inaccessible.

		_className: "pion.util.ParentConstrainedFloatingPane",

		postCreate: function(){
			this.inherited(arguments);
			new dojo.dnd.move.boxConstrainedMoveable(this.domNode, {handle: this.focusNode, box: {l: 0, t: 0}});

/*
			// Unfortunately, this only works if the FloatingPane is a direct child of the node it should be
			// confined in, which is not the case with, e.g., plugins.reactors.ChartFloatingPane.

			new dojo.dnd.move.parentConstrainedMoveable(this.domNode, {handle: this.focusNode});
*/
		}
	}
);
