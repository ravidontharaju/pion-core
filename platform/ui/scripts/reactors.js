dojo.require("dojo.dnd.move");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dojox.gfx");
dojo.require("dojo.parser");	// scan page for widgets and instantiate them

var STEP = 16;
var num_tabs = 3;

var latest_event = null;
var workspace_boxes = [];
var workspace_box = null;
var surfaces = [];
var surface = null;

var init = function(){
	workspace_boxes.push(workspace_box_1);
	workspace_boxes.push(workspace_box_2);
	workspace_boxes.push(workspace_box_3);
	var wrappers = [];
	wrappers[0] = function(source, nodes, copy, target){
		handleDropOnWorkspace(source, nodes, copy, workspace_boxes[0]);
	}
	wrappers[1] = function(source, nodes, copy, target){
		handleDropOnWorkspace(source, nodes, copy, workspace_boxes[1]);
	}
	wrappers[2] = function(source, nodes, copy, target){
		handleDropOnWorkspace(source, nodes, copy, workspace_boxes[2]);
	}
	var box = dojo.marginBox(workspace_boxes[0].node);
	for (var i = 0; i < num_tabs; ++i) {
		dojo.connect(workspace_boxes[i], "onDndDrop", wrappers[i]);
		dojo.connect(workspace_boxes[i].node, "onmouseup", updateLatestMouseUpEvent);
		surfaces.push(dojox.gfx.createSurface(workspace_boxes[i].node, box.w, box.h));
	}

	workspace_box = workspace_boxes[0];
	surface = surfaces[0];
};

dojo.addOnLoad(init);

function updateLatestMouseUpEvent(e){
	latest_event = e;
	console.debug("e = ", e);
}

function getNearbyGridPointInBox(constraintBox, currentLeftTop) {
	//console.debug("In getNearbyGridPointInBox, constraintBox: ", constraintBox);
	var c = constraintBox;
	//console.debug("constraintBox: ", constraintBox);
	c.l += STEP - 1; c.l -= c.l % STEP;
	c.t += STEP - 1; c.t -= c.t % STEP;
	//console.debug("constraintBox: ", constraintBox);
	var newLeftTop = {};
	newLeftTop.l = currentLeftTop.l < c.l ? c.l : c.r < currentLeftTop.l ? c.r : currentLeftTop.l;
	newLeftTop.t = currentLeftTop.t < c.t ? c.t : c.b < currentLeftTop.t ? c.b : currentLeftTop.t;
	newLeftTop.l -= newLeftTop.l % STEP;
	newLeftTop.t -= newLeftTop.t % STEP;
	//console.debug("currentLeftTop: ", currentLeftTop);
	//console.debug("newLeftTop: ", newLeftTop);

	return newLeftTop;
}

function handleDropOnWorkspace(source, nodes, copy, target){
	console.debug("handleDropOnWorkspace called, target.node.id = ", target.node.id, ", workspace_box.node.id = ", workspace_box.node.id);
	if (target != workspace_box){
		// So why was handleDropOnWorkspace called?  Because the manager is using a global canDrop flag.
		// I added 
		//		if(this.targetState == "Disabled"){ break; }
		// to onDndDrop(), but that's too late to prevent handleDropOnWorkspace from getting called.
		//alert("huh?");
		return;
	}
	//console.debug("nodes[0]: ", nodes[0]);
	//console.debug("nodes[0].getAttribute('dndType'): ", nodes[0].getAttribute('dndType'));
	if (nodes[0].getAttribute("dndType") != "reactor") {
		// This should not be reached, since the workspace targets are only supposed to accept reactors, but it is.
		console.debug("dropped object is not a reactor");
		return;
	}
	//debugger;
	console.debug(copy ? "Copying from" : "Moving from", source);
	console.debug("nodes: ", nodes);
	var new_div = document.createElement("div");
	var reactor_target = new dojo.dnd.Target(new_div, {accept: ["connector"]});
	dojo.connect(reactor_target, "onDndDrop", handleDropOnReactor);
	new_div.setAttribute("class", "moveable");
	//debugger;
	var reactor_type = nodes[0].getAttribute("reactor_type");
	new_div.innerHTML = reactor_type;
	new_div.setAttribute("reactor_type", reactor_type);
	//debugger;
	console.debug("workspace_box.node.lastChild = ", workspace_box.node.lastChild);
	workspace_box.node.replaceChild(new_div, workspace_box.node.lastChild);
	var m5 = new dojo.dnd.move.parentConstrainedMoveable(new_div, {area: "padding", within: true});
	var c = m5.constraints();
	// Since parts of the constraintBox are not calculated until onFirstMove() is called,
	// calculate them here.
	c.r = c.l + c.w - new_div.offsetWidth;
	c.b = c.t + c.h - new_div.offsetHeight;
	console.debug("latest_event: ", latest_event);
	var cw = dojo.byId("contentWide"); // Move to init()?
	/*
	console.debug("cw.offsetLeft: ", cw.offsetLeft, ", cw.offsetTop: ", cw.offsetTop);
	var cw2 = cw.parentNode;
	console.debug("cw2.offsetLeft: ", cw2.offsetLeft, ", cw2.offsetTop: ", cw2.offsetTop);
	var cw3 = cw2.parentNode;
	console.debug("cw3.offsetLeft: ", cw3.offsetLeft, ", cw3.offsetTop: ", cw3.offsetTop);
	*/
	// This is a hack.  Note that iterating through node.offsetParent or node.parentNode and accumulating the offsets does not work right.
	// (oddly, 0 seems to work now, but it keeps changing, so leave it for now)
	offsetTopHack = 0;

	var mouseLeftTop = {l: latest_event.clientX - cw.offsetLeft, t: latest_event.clientY - cw.offsetTop - offsetTopHack};
	console.debug("mouseLeftTop: ", mouseLeftTop);
	var newLeftTop = getNearbyGridPointInBox(c, mouseLeftTop);
	//var newLeftTop = getNearbyGridPointInBox(c, {l: latest_event.clientX, t: latest_event.clientY});
	new_div.style.top  = newLeftTop.t + "px";
	new_div.style.left = newLeftTop.l + "px";
	new_div.style.position = "absolute";

	new_div.ondblclick = function(a){
		//console.debug("a: ", a);
		//for (key in a) { console.debug(key + ": " + a[key]); }
		var id = reactor_type + "_dialog";
		var dialog = dijit.byId(id);
		//debugger;
		//dijit.byId(id).setContent({"name": "qwerty"});
		// This makes the first field have a blue border, but doesn't put the cursor there, so it's pretty useless.
		dijit.focus(dojo.query('input', this.domNode)[0]);
		dijit.byId(id).show();
		dijit.byId(id).execute = function(dialogFields) { updateName(dialogFields, new_div); }
	}

	// Since this overrides the constrained onMove, we have to enforce the boundary constraints (in addition to the grid constraints).
	// getNearbyGridPointInBox() takes care of both.  Note that parts of this.constraintBox are not calculated until
	// onFirstMove() is called.
	m5.onMove = function(mover, leftTop){
		//console.debug("In m5.onMove, this.constraintBox = ", this.constraintBox);
		//console.debug("leftTop = ", leftTop);
		var newLeftTop = getNearbyGridPointInBox(this.constraintBox, leftTop);
		//console.debug("newLeftTop = ", newLeftTop);
		dojo.marginBox(mover.node, newLeftTop);
	};
/*
	// This doesn't do anything, because the constrained onMove doesn't call onMoving.
	dojo.connect(m5, "onMoving", function(mover, leftTop){
		console.debug("m5 is moving");
		leftTop.l -= leftTop.l % STEP;
		leftTop.t -= leftTop.t % STEP;
	});
/**/
}

function handleDropOnReactor(source, nodes, copy, target){
	console.debug('handleDropOnReactor called, target.node.getAttribute("reactor_type") = ', target.node.getAttribute("reactor_type"));
	console.debug("target.targetState = ", target.targetState, ", target.processed = ", target.processed, ', target.node.lastChild = ', target.node.lastChild);

	// handleDropOnReactor will be called more than once for a single drop.  One of these times will be just
	// after a connector node was added to the reactor.  If this is that time, delete the connector node.
	if (target.node.lastChild.getAttribute && target.node.lastChild.getAttribute("dndType") == "connector") {
		target.node.removeChild(target.node.lastChild);
	}

	// If we've already set up a connector for this target, we're done.  (When we're ready to allow
	// adding another connector, this will have to be redone.) 
	if (target.processed) return;

	//debugger;
	console.debug('nodes[0].getAttribute("dndType") = ', nodes[0].getAttribute("dndType"));
	console.debug('nodes[0].getAttribute("reactor_type") = ', nodes[0].getAttribute("reactor_type"));

	if (nodes[0].getAttribute("dndType") != "connector") {
		// This should not be reached, since reactor targets are only supposed to accept connectors.
		console.debug('nodes[0].getAttribute("dndType") != "connector"');
		return;
	}

	console.debug("I'm connecting to " + target.node.getAttribute("reactor_type"));
	var x1 = target.node.offsetLeft + target.node.offsetWidth;
	var y1 = target.node.offsetTop  + target.node.offsetHeight / 2;
	console.debug("x1 = ", x1, ", y1 = ", y1);

	var children = workspace_box.node.childNodes;
	for (var i = 0; i < children.length; ++i) {
		console.debug('children[', i, '] = ', children[i]);
		if (children[i] == target.node) {
			console.debug('myself');
			continue;
		}
		if (children[i].getAttribute && children[i].getAttribute("reactor_type")) {
			var x2 = children[i].offsetLeft;
			var y2 = children[i].offsetTop + children[i].offsetHeight / 2;
			console.debug('x2 = ', x2, ', y2 = ', y2, ', children[', i, '].getAttribute("reactor_type") = ', children[i].getAttribute("reactor_type"));
			var shape = surface.createLine({x1: x1, y1: y1, x2: x2, y2: y2}).setStroke("black");
		}
	}

	target.processed = true;
}

function updateName(dialogFields, node) {
	node.innerHTML = dialogFields.name;
}

function selected(page){
	var result = page.title.match(/Workspace (\d+)/);
	var index = result[1] - 1;
	console.debug("selected " + page.title + ", page.id = " + page.id + ", index = " + index);
	workspace_box = workspace_boxes[index];
	surface = surfaces[index];
}

dojo.subscribe("mainTabContainer-selectChild", selected);
