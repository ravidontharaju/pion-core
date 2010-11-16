dojo.provide("pion.util.ParentConstrainedFloatingPane");

dojo.require("dojox.layout.FloatingPane");

dojo.declare("pion.util.ParentConstrainedFloatingPane",
	dojox.layout.FloatingPane,
	{
		//	summary:
		//		Modifies FloatingPane so that it can't be dragged to a place where the controls are inaccessible.

		_className: "pion.util.ParentConstrainedFloatingPane",

		postCreate: function(){
			this.setTitle(this.title);
			this.inherited(arguments);

			// This is the only change from the original.
			var move = new dojo.dnd.move.parentConstrainedMoveable(this.domNode, {handle: this.focusNode});
			//var move = new dojo.dnd.Moveable(this.domNode,{ handle: this.focusNode });

			if(!this.dockable){ this.dockNode.style.display = "none"; } 
			if(!this.closable){ this.closeNode.style.display = "none"; } 
			if(!this.maxable){
				this.maxNode.style.display = "none";
				this.restoreNode.style.display = "none";
			}
			if(!this.resizable){
				this.resizeHandle.style.display = "none"; 	
			}else{
				var foo = dojo.marginBox(this.domNode); 
				this.domNode.style.width = foo.w+"px"; 
			}		
			this._allFPs.push(this);
			this.domNode.style.position = "absolute";

			this.bgIframe = new dijit.BackgroundIframe(this.domNode);
		}
	}
);
