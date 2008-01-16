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

var STEP = 10;
var num_tabs = 3;

var latest_event = null;
var workspace_boxes = [];
var workspace_box = null;
var surfaces = [];
var surface = null;
var tracking = false;

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
		workspace_boxes[i].reactors = [];
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

function updateConnectionLine(poly, start_node, end_node) {
	// poly: the polyline to update
	// start_node: the node representing the reactor box at the start of the connection
	// end_node: the node representing the reactor box at the end of the connection

	// set (x1, y1) to the center of start_node
	var x1 = start_node.offsetLeft + start_node.offsetWidth / 2;
	var y1 = start_node.offsetTop + start_node.offsetHeight / 2;

	if (end_node.offsetTop > y1) {									// horiz line y = y1 passes above end_node
		var x2 = end_node.offsetLeft + end_node.offsetWidth / 2;
		var y2 = end_node.offsetTop;
		// add down arrow
		var a1 = {x: x2 - 5, y: y2 - 5};
		var a2 = {x: x2 + 5, y: y2 - 5};
	} else if (end_node.offsetTop + end_node.offsetHeight < y1) {	// horiz line y = y1 passes below end_node
		var x2 = end_node.offsetLeft + end_node.offsetWidth / 2;
		var y2 = end_node.offsetTop + end_node.offsetHeight;
		// add up arrow
		var a1 = {x: x2 - 5, y: y2 + 5};
		var a2 = {x: x2 + 5, y: y2 + 5};
	} else if (end_node.offsetLeft > x1) {							// horiz line y = y1 intersects end_node from the left
		var x2 = end_node.offsetLeft;
		var y2 = y1;
		// add right arrow
		var a1 = {x: x2 - 5, y: y2 - 5};
		var a2 = {x: x2 - 5, y: y2 + 5};
	} else {														// horiz line y = y1 intersects end_node from the right
		var x2 = end_node.offsetLeft + end_node.offsetWidth;
		var y2 = y1;
		// add left arrow
		var a1 = {x: x2 + 5, y: y2 - 5};
		var a2 = {x: x2 + 5, y: y2 + 5};
	}
	//console.debug("x1 = ", x1, ", y1 = ", y1, ', x2 = ', x2, ', y2 = ', y2);
	poly.setShape([{x: x1, y: y1}, {x: x2, y: y1}, {x: x2, y: y2}, a1, {x: x2, y: y2}, a2]).setStroke("black");
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
	//debugger;
	var reactor_type = nodes[0].getAttribute("reactor_type");
	new_div.setAttribute("class", "moveable " + reactor_type);
	new_div.innerHTML = reactor_type;
	new_div.setAttribute("reactor_type", reactor_type);
	new_div.reactor_inputs = [];
	new_div.reactor_outputs = [];
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

		//console.debug("new_div = ", new_div);
		for (var i = 0; i < new_div.reactor_inputs.length; ++i) {
			//console.debug("new_div.reactor_inputs[", i, "].node = ", new_div.reactor_inputs[i].node);
			//console.debug("new_div.reactor_inputs[", i, "].line.rawNode = ", new_div.reactor_inputs[i].line.rawNode);
			updateConnectionLine(new_div.reactor_inputs[i].line, new_div.reactor_inputs[i].node, new_div);
		}
		for (var i = 0; i < new_div.reactor_outputs.length; ++i) {
			//console.debug("new_div.reactor_outputs[", i, "] = ", new_div.reactor_outputs[i]);
			updateConnectionLine(new_div.reactor_outputs[i].line, new_div, new_div.reactor_outputs[i].node);
		}
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
	console.debug("target.targetState = ", target.targetState, ", tracking = ", tracking, ', target.node.lastChild = ', target.node.lastChild);

	// handleDropOnReactor will be called more than once for a single drop.  One of these times will be just
	// after a connector node was added to the reactor.  If this is that time, delete the connector node.
	// Note that this sometimes happens after tracking has started, i.e. when tracking == true. 
	if (target.node.lastChild.getAttribute && target.node.lastChild.getAttribute("dndType") == "connector") {
		console.debug("removing unneeded connector node");
		target.node.removeChild(target.node.lastChild);
	}

	// If we're already tracking a connector for this target, we're done.
	if (tracking) return;

	//debugger;
	console.debug('nodes[0].getAttribute("dndType") = ', nodes[0].getAttribute("dndType"));
	console.debug('nodes[0].getAttribute("reactor_type") = ', nodes[0].getAttribute("reactor_type"));

	if (nodes[0].getAttribute("dndType") != "connector") {
		// This should not be reached, since reactor targets are only supposed to accept connectors.
		console.debug('returning because nodes[0].getAttribute("dndType") != "connector"');
		return;
	}

	tracking = true;
	var x1 = target.node.offsetLeft + target.node.offsetWidth;
	var y1 = target.node.offsetTop  + target.node.offsetHeight / 2;
	console.debug("x1 = ", x1, ", y1 = ", y1);
	var trackLine = surface.createPolyline([{x: x1, y: y1}, {x: x1 + 10, y: y1}]).setStroke("black");
	var xOffset = dojo.byId("contentWide").offsetLeft;
	var yOffset = dojo.byId("contentWide").offsetTop;
	console.debug("xOffset = ", xOffset, ", yOffset = ", yOffset);
	mouseConnection = dojo.connect('onmousemove', function(event) {x2 = event.clientX - xOffset; y2 = event.clientY - yOffset; trackLine.setShape([{x: x1, y: y1}, {x: x2, y: y1}, {x: x2, y: y2}])});
	var line = surface.createPolyline().setStroke("black");
	console.debug("created mouseConnection");

	// the startpoint of the connection will be target.node, i.e. the node the connector was dropped on
	wrapperWithStartpoint = function(event) {
		dojo.disconnect(mouseConnection);
		console.debug("disconnected mouseConnection");
		trackLine.removeShape();
		handleSelectionOfConnectorEndpoint(event, target.node);
	}

	dojo.query(".moveable").filter(function(n) { return n != target.node; }).forEach("item.onclick = wrapperWithStartpoint");

	// TODO: disable everything except clicking on moveable's.
}

function handleSelectionOfConnectorEndpoint(event, startpointTarget)
{
	tracking = false;
	console.debug('handleSelectionOfConnectorEndpoint: event = ', event);
	console.debug('event.target = ', event.target);
	console.debug('startpointTarget = ', startpointTarget);	

	// Disable (single) clicking on all moveable's.
	dojo.query(".moveable").forEach("item.onclick = function () {}");

	var line = surface.createPolyline().setStroke("black");
	updateConnectionLine(line, startpointTarget, event.target);
	
	startpointTarget.reactor_outputs.push({node: event.target, line: line});
	event.target.reactor_inputs.push({node: startpointTarget, line: line});
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
