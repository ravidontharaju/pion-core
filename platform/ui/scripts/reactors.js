dojo.provide("pion.reactors");
dojo.require("pion.login");
dojo.require("pion.plugins");
dojo.require("plugins.reactors.Reactor");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo.dnd.move");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.Menu");
dojo.require("dojox.data.XmlStore");
dojo.require("dojox.gfx");
dojo.require("dojox.grid.DataGrid");

// Reactors don't have to be listed here to be usable, but they do to be included in pion-dojo.js.
dojo.require("plugins.reactors.LogInputReactor");
dojo.require("plugins.reactors.LogOutputReactor");
dojo.require("plugins.reactors.FilterReactor");
dojo.require("plugins.reactors.TransformReactor");
dojo.require("plugins.reactors.ScriptReactor");
dojo.require("plugins.reactors.DatabaseOutputReactor");
dojo.require("plugins.reactors.FissionReactor");
dojo.require("plugins.reactors.PythonReactor");

// configuration parameters
var STEP = 10;
var minimum_workspace_width = 2000;
var minimum_workspace_height = 2000;

var latest_event = null;
var workspace_boxes = [];
var surface = null;
var new_workspace_tab_clicked = false;
var workspaces_by_name = {};
var reactor_config_store;

pion.reactors.workspace_box = null;
pion.reactors.reactors_by_id = {};
pion.reactors.config_store = null;
pion.reactors.comparison_type_store = new dojo.data.ItemFileWriteStore({data: { identifier: 'name', items: [] }});
pion.reactors.comparison_type_xml_store = new dojox.data.XmlStore({url: '/config/comparisons'});
pion.reactors.arity_by_comparison_name = {};
pion.reactors.categories = {};

pion.reactors.getHeight = function() {
	// TODO: replace 150 with some computed value
	return dojo.byId('outer').clientHeight - 150;
}

pion.reactors.init = function() {
	dijit.byId('main_stack_container').resize({h: pion.reactors.getHeight()});

	var ops_toggle_button = dijit.byId('ops_toggle_button');
	dojo.connect(ops_toggle_button.domNode, 'click', function() {
		if (ops_toggle_button.checked) {
			dojo.addClass(dojo.byId('counterBackground'), 'mostly_hidden');
		} else {
			dojo.removeClass(dojo.byId('counterBackground'), 'mostly_hidden');
		}
	});

	var dndSourceReactorCreator = function(item, hint) {
		var node = dojo.doc.createElement("div");
		node.id = dojo.dnd.getUniqueId();
		node.className = "dojoDndItem";
		node.setAttribute('reactor_type', item.reactor_type);
		var img_node = dojo.doc.createElement("img");
		node.appendChild(img_node);
		img_node.setAttribute('src', item.src);
		img_node.setAttribute('width', 148);
		img_node.setAttribute('height', 25);
		img_node.setAttribute('alt', item.alt);
		return {node: node, data: item, type: ["reactor"]};
	}

	// 'collectionReactors', 'processingReactors', and 'storageReactors' are objects of type dojo.dnd.Source,
	// defined via markup in index.html.  Here we'll index them by their category and override each one's creator method.
	var reactor_buckets = {collection: collectionReactors, processing: processingReactors, storage: storageReactors};
	for (var category in reactor_buckets) {
		reactor_buckets[category].creator = dndSourceReactorCreator;
	}

	// Add classes for the accordion buttons, so default.css can assign each its own color.
	// Since the buttons are created by dijit.layout.AccordionContainer from scratch, there's nowhere in the
	// sidebar markup in index.html to put these classes.
	var accordion_buttons = dojo.query('.dijitAccordionTitle', dojo.byId('sidebarMain')).map(dijit.byNode);
	dojo.forEach(accordion_buttons, function(button) {
		dojo.addClass(button.domNode, button.contentWidget['class'] + 'Header');
	});

	// Copy all items in pion.reactors.comparison_type_xml_store to pion.reactors.comparison_type_store.
	// We can't use pion.reactors.comparison_type_xml_store directly due to http://trac.dojotoolkit.org/ticket/9216.
	var json_store = pion.reactors.comparison_type_store;
	var xml_store = pion.reactors.comparison_type_xml_store;
	xml_store.fetch({
		onItem: function(item) {
			var comparison_item = {
				name: xml_store.getValue(item, '@id').toString(),
				arity: parseInt(xml_store.getValue(item, 'Arity'))
			};
			pion.reactors.arity_by_comparison_name[comparison_item.name] = comparison_item.arity;
			var xml_elements = xml_store.getValues(item, 'Category');
			comparison_item.category = dojo.map(xml_elements, function(e) { return e.toString(); });
			json_store.newItem(comparison_item);
		}
	});

	pion.reactors.getAllReactorsInUIDirectory = function() {
		var d = new dojo.Deferred();
		var store = new dojox.data.XmlStore({url: '/config/reactors/plugins'});
		store.fetch({
			onComplete: function(items) {
				var reactors_in_ui_dir = dojo.map(items, function(item) {
					var plugin = store.getValue(item, 'Plugin').toString();
					var category = store.getValue(item, 'ReactorType').toString();
					return {plugin: plugin, category: category};
				});
				d.callback(reactors_in_ui_dir);
			}
		});
		return d;
	}

	// reactors_in_ui_dir: all Reactors for which a UI was found in the UI directory 
	//                     (as specified in services.xml, in PlatformService "config-service").
	var initUsableReactorPlugins = function(reactors_in_ui_dir) {
		var d = new dojo.Deferred();
		dojo.forEach(reactors_in_ui_dir, function(reactor) {
			var reactor_name = reactor.plugin;
			// Skip plugins that can't be found on any of the configured plugin paths.
			if (dojo.indexOf(pion.plugins.available_plugins, reactor_name) != -1) {
				var prototype = pion.plugins.getPluginPrototype('plugins.reactors', reactor_name, '/plugins/reactors/' + reactor.category);
				pion.reactors.categories[reactor_name] = reactor.category;
				var icon = reactor.category + '/' + reactor_name + '/icon.png';
				var icon_url = dojo.moduleUrl('plugins.reactors', icon);
				console.debug('icon_url = ', icon_url);
				reactor_buckets[reactor.category].insertNodes(false, [{reactor_type: reactor_name, src: icon_url, alt: prototype['label']}]);
			}
		});
		d.callback();
		return d;
	}

	pion.plugins.initAvailablePluginList()
		.addCallback(pion.reactors.getAllReactorsInUIDirectory)
		.addCallback(initUsableReactorPlugins)
		.addCallback(pion.reactors._initConfiguredReactors);

	// Assign an id for the 'add new workspace' tab (at this point the only tab), so it can get special styling.
	dojo.query(".dijitTab")[0].id = 'create_new_workspace_tab';

	dojo.connect(window, 'onresize', expandWorkspaceIfNeeded);
	dojo.connect(document, 'onkeypress', handleKeyPress);

	// This is a workaround for something that may or may not be a bug in dojo, but is definitely not the behavior
	// we want.  The problem is that the tab that's clicked will always look as if it's selected, even if clicking it
	// triggers another tab to actually be selected, as is the case with the 'add new workspace' tab.
	dojo.connect(dijit.byId("mainTabContainer").tablist, 'onButtonClick', 
					function() {
						if (new_workspace_tab_clicked) {
							pion.reactors.reselectCurrentWorkspace();

							// Reset this since the workaround is only needed when the 'add new workspace' tab is clicked. 
							new_workspace_tab_clicked = false;
						}
					});

	var prev_global_ops = 0;
	var prev_events_in_for_workspace = 0;
	setInterval(function() {
		if (!ops_toggle_button.checked && pion.current_page == 'Reactors') {
			dojo.xhrGet({
				url: '/config/reactors/stats',
				preventCache: true,
				handleAs: 'xml',
				timeout: 1000,
				load: function(response, ioArgs) {
					var node = response.getElementsByTagName('TotalOps')[0];
					var global_ops = parseInt(dojo.isIE? node.xml.match(/.*>(\d*)<.*/)[1] : node.textContent);
					var delta = global_ops - prev_global_ops;
					dojo.byId('global_ops').innerHTML = delta > 0? delta : 0; // Avoids negative value when server is restarted.
					prev_global_ops = global_ops;
					var events_in_for_workspace = 0;
					var reactors = response.getElementsByTagName('Reactor');
					dojo.forEach(reactors, function(n) {
						var id = n.getAttribute('id');
						var reactor = pion.reactors.reactors_by_id[id];
						if (reactor) {
							if (reactor.workspace == pion.reactors.workspace_box) {
								var events_in_node = n.getElementsByTagName('EventsIn')[0];
								var events_in_str = dojo.isIE? events_in_node.xml.match(/.*>(\d*)<.*/)[1] : events_in_node.textContent;
								var events_in = parseInt(events_in_str);
								reactor.ops_per_sec.innerHTML = events_in - reactor.prev_events_in;
								reactor.prev_events_in = events_in;
								events_in_for_workspace += events_in;
							}
							var is_running_node = n.getElementsByTagName('Running')[0];
							var is_running_string = dojo.isIE? is_running_node.xml.match(/.*>(\w*)<.*/)[1] : is_running_node.textContent;
							var is_running = (is_running_string == 'true');
							//console.debug(reactor.config.Name, is_running? ' is ' : ' is not ', 'running.');
							reactor.run_button.attr('checked', is_running);
							reactor.config.Running = is_running;
						}
					});
					delta = events_in_for_workspace - prev_events_in_for_workspace;
					dojo.byId('workspace_ops').innerHTML = delta > 0? delta : 0; // Avoids negative value when server is restarted.
					prev_events_in_for_workspace = events_in_for_workspace;
					return response;
				},
				error: pion.handleXhrGetError
			});
		}
	}, 1000);
}

pion.reactors.updateRunButtons = function() {
	if (dijit.byId('ops_toggle_button').checked) { // Else the buttons are already getting updated every second.
		dojo.xhrGet({
			url: '/config/reactors/stats',
			preventCache: true,
			handleAs: 'xml',
			timeout: 1000,
			load: function(response, ioArgs) {
				var reactors = response.getElementsByTagName('Reactor');
				dojo.forEach(reactors, function(n) {
					var id = n.getAttribute('id');
					var reactor = pion.reactors.reactors_by_id[id];
					if (reactor) {
						var is_running_node = n.getElementsByTagName('Running')[0];
						var is_running_string = dojo.isIE? is_running_node.xml.match(/.*>(\w*)<.*/)[1] : is_running_node.textContent;
						var is_running = (is_running_string == 'true');
						reactor.run_button.attr('checked', is_running);
						reactor.config.Running = is_running;
					}
				});
				return response;
			},
			error: pion.handleXhrGetError
		});
	}
}

pion.reactors._initConfiguredReactors = function() {
	reactor_config_store = new dojox.data.XmlStore({url: '/config/reactors'});
	pion.reactors.config_store = reactor_config_store;
	reactor_config_store.fetch({
		query: {tagName: 'Reactor'},
		onItem: function(item, request) {
			console.debug('fetched Reactor with id = ', reactor_config_store.getValue(item, '@id'));

			var config = {};
			var attributes = reactor_config_store.getAttributes(item);
			for (var i = 0; i < attributes.length; ++i) {
				if (attributes[i] != 'tagName' && attributes[i] != 'childNodes') {
					config[attributes[i]] = reactor_config_store.getValue(item, attributes[i]).toString();
				}
			}
			//console.dir(config);

			pion.reactors.createReactorInConfiguredWorkspace(config);
		},
		onComplete: function(items, request) {
			console.debug('done fetching Reactors');
			pion.reactors.updateRunButtons();
			reactor_config_store.fetch({
				query: {tagName: 'Connection'},
				onItem: function(item, request) {
					var start_reactor = pion.reactors.reactors_by_id[reactor_config_store.getValue(item, 'From')];
					var end_reactor   = pion.reactors.reactors_by_id[reactor_config_store.getValue(item, 'To')];

					// TODO: handle the case where start_reactor.workspace != end_reactor.workspace
					pion.reactors.workspace_box = start_reactor.workspace;
					surface = pion.reactors.workspace_box.my_surface;
					dijit.byId("mainTabContainer").selectChild(pion.reactors.workspace_box.my_content_pane);

					var connection_id = reactor_config_store.getValue(item, '@id').toString();
					pion.reactors.createConnection(start_reactor, end_reactor, connection_id);
				},
				onComplete: function(items, request) {
					console.debug('done fetching Connections');
					if (workspace_boxes.length == 0) {
						addWorkspace();
					}
					pion.reactors.workspace_box = workspace_boxes[0];
					surface = pion.reactors.workspace_box.my_surface;
					dijit.byId("mainTabContainer").selectChild(pion.reactors.workspace_box.my_content_pane);

					// Now that all workspaces have been added, call layout() in case there are enough to require more than one row of tabs.
					dijit.byId('main_stack_container').layout();
				},
				onError: pion.handleFetchError
			});
		},
		onError: pion.handleFetchError
	});
	pion.reactors.connection_store = new dojox.data.XmlStore({url: '/config/connections'});
}

pion.reactors.createReactorInConfiguredWorkspace = function(config) {
	pion.reactors.workspace_box = workspaces_by_name[config.Workspace];
	if (!pion.reactors.workspace_box) {
		addWorkspace(config.Workspace);
	}
	var workspace_box = pion.reactors.workspace_box;
	dijit.byId("mainTabContainer").selectChild(workspace_box.my_content_pane);

	var reactor_node = document.createElement("div");
	workspace_box.node.appendChild(reactor_node);
	var reactor = pion.reactors.createReactor(config, reactor_node);
	pion.reactors.reactors_by_id[config['@id']] = reactor;
	reactor.workspace = workspace_box;
	workspace_box.reactors.push(reactor);
	console.debug('X, Y = ', config.X, ', ', config.Y);
}

pion.reactors.createConnection = function(start_reactor, end_reactor, connection_id) {
	var line = surface.createPolyline().setStroke("black");

	var removeConnection = function() {
		// If in Lite mode and either Reactor is an Enterprise Reactor, display an error message and don't delete the connection.
		pion.reactors.doConnectionChangeIfAllowed(start_reactor, end_reactor, function() {
			dojo.xhrDelete({
				url: '/config/connections/' + connection_id,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					// Find index of end_reactor in outputs of start_reactor.
					for (var i1 = 0; i1 < start_reactor.reactor_outputs.length; ++i1) {
						if (start_reactor.reactor_outputs[i1].id == connection_id) break;
					}

					// Find index of start_reactor in inputs of end_reactor.
					for (var i2 = 0; i2 < end_reactor.reactor_inputs.length; ++i2) {
						if (end_reactor.reactor_inputs[i2].id == connection_id) break;
					}

					// Get the connection line.  (Same as end_reactor.reactor_inputs[i2].line.)
					var line = start_reactor.reactor_outputs[i1].line;

					// Remove the divs associated with the line and tell the line to erase itself.
					pion.reactors.removeLine(line);

					// Remove end_reactor from outputs of start_reactor and vice versa.
					start_reactor.reactor_outputs.splice(i1, 1);
					end_reactor.reactor_inputs.splice(i2, 1);

					return response;
				},
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
			});
		});
	}

	line.div1 = document.createElement('div');
	line.div1.style.position = 'absolute';
	line.div1.onclick = function() { pion.doDeleteConfirmationDialog("Delete this connection?", removeConnection); }
	line.div1.onmouseover = function() {
		line.div1.className = 'glowing_horiz';
		line.div2.className = 'glowing_vert';
	};
	line.div1.onmouseout = function() {
		line.div1.className = 'normal';
		line.div2.className = 'normal';
	};
	pion.reactors.workspace_box.node.appendChild(line.div1);

	line.div2 = document.createElement('div');
	line.div2.style.position = 'absolute';
	line.div2.onclick = function() { pion.doDeleteConfirmationDialog("Delete this connection?", removeConnection); }
	line.div2.onmouseover = function() {
		line.div1.className = 'glowing_horiz';
		line.div2.className = 'glowing_vert';
	};
	line.div2.onmouseout = function() {
		line.div1.className = 'normal';
		line.div2.className = 'normal';
	};
	pion.reactors.workspace_box.node.appendChild(line.div2);

	pion.reactors.updateConnectionLine(line, start_reactor.domNode, end_reactor.domNode);

	start_reactor.reactor_outputs.push({sink: end_reactor, line: line, id: connection_id});
	end_reactor.reactor_inputs.push({source: start_reactor, line: line, id: connection_id});
}

pion.reactors.removeLine = function(line) {
	pion.reactors.workspace_box.node.removeChild(line.div1);
	pion.reactors.workspace_box.node.removeChild(line.div2);
	line.removeShape();
}

pion.reactors.reselectCurrentWorkspace = function() {
	// Without this, the following call to selectChild() won't do anything, since the current workspace is already selected.
	dijit.byId("mainTabContainer").selectedChildWidget = undefined;

	dijit.byId("mainTabContainer").selectChild(pion.reactors.workspace_box.my_content_pane);
}

function addWorkspace(name) {
	var i = workspace_boxes.length;
	if (name) {
		var title = name;
	} else {
		var title = 'Workspace ' + (i + 1);
		for (var j = i + 2; isDuplicateWorkspaceName(null, title); ++j) {
			title = 'Workspace ' + j;
		};
	}
	var workspace_pane = new dijit.layout.ContentPane({ "class": "workspacePane", title: title, style: "overflow: auto" });
	var tab_container = dijit.byId("mainTabContainer");
	var margin_box = dojo.marginBox(tab_container.domNode);
	console.debug('margin_box = dojo.marginBox(tab_container.domNode) = ', margin_box);
	var shim = document.createElement("div");
	if (margin_box.w < minimum_workspace_width) {
		shim.style.width = minimum_workspace_width + "px";
	} else {
		// keeps scroll bars from appearing unnecessarily in IE and Firefox on Mac OS X
		shim.style.width = (margin_box.w - 4) + "px";
	}
	if (margin_box.h < minimum_workspace_height) {
		shim.style.height = minimum_workspace_height + "px";
	}
	workspace_pane.domNode.appendChild(shim);
	tab_container.addChild(workspace_pane, i);
	var new_workspace = new dojo.dnd.Target(shim, { accept: ["reactor"] });
	dojo.addClass(new_workspace.node, "workspaceTarget");
	dojo.connect(new_workspace, "onDndDrop", function(source, nodes, copy, target){ pion.reactors.handleDropOnWorkspace(source, nodes, copy, new_workspace); });
	dojo.connect(new_workspace.node, "onmouseup", updateLatestMouseUpEvent);
	new_workspace.my_content_pane = workspace_pane;
	new_workspace.onEmpty = function(workspace_pane){};
	workspace_pane.my_workspace_box = new_workspace;
	workspaces_by_name[title] = new_workspace;
	workspace_boxes[i] = new_workspace;

	// Need to do this now so that the dimensions of new_workspace are calculated.
	tab_container.selectChild(workspace_pane);

	new_workspace.node.style.width = new_workspace.node.offsetWidth + "px"; // This will keep it from automatically changing on resize.
	var surface_box = dojo.marginBox(new_workspace.node);
	surface_box.h -= 6; // We need some decrement even when there's no horizontal scroll bar, to avoid a vertical scroll bar.
						// This is enough for Firefox on both Windows XP and Mac OS X, and for IE.
	/*
	surface_box.h -= 20; // If there's a horiz scroll bar, we need to additionally decrement by its height to avoid a vertical scroll bar.
						 // TODO: figure out whether there's a scroll bar, and if so get its height h and decrement by h, else no (add'l) decrement. 
	*/
	console.debug('surface_box = ', surface_box);
	new_workspace.my_surface = dojox.gfx.createSurface(new_workspace.node, surface_box.w, surface_box.h);
	new_workspace.reactors = [];
	new_workspace.isTracking = false;

	// Add a context menu, for both the workspace content pane and the tab button.
	var menu = new dijit.Menu({targetNodeIds: [workspace_pane.controlButton.domNode, new_workspace.node]});
	menu.addChild(new dijit.MenuItem({ label: "Edit workspace configuration", onClick: function(){showWorkspaceConfigDialog(workspace_pane);} }));
	menu.addChild(new dijit.MenuItem({ label: "Delete workspace", onClick: function(){deleteWorkspaceIfConfirmed(workspace_pane);} }));

	new_workspace.node.ondblclick = function(){showWorkspaceConfigDialog(workspace_pane);}
	workspace_pane.controlButton.domNode.ondblclick = function(){showWorkspaceConfigDialog(workspace_pane);}
/*
This scroll handling is kind of buggy, and not a high priority feature, so disable it for now.

	// Handle scroll events so that scrolling always occurs in multiples of STEP pixels.
	workspace_pane.isScrolling = false;
	workspace_pane.prevScrollTop = 0;
	workspace_pane.prevScrollLeft = 0;
	dojo.connect(workspace_pane.domNode, "scroll", makeScrollHandler(workspace_pane));
*/
}

// Return a scroll event handler for a specific workspace pane.  The handler waits until all pending
// scroll events are handled by the browser, then quantizes the scroll values.
function makeScrollHandler(workspace_pane) {
	var _pane = workspace_pane;
	var _node = workspace_pane.domNode;
	return function() {
		if (_pane.isScrolling) return;
		_pane.isScrolling = true;
		var callback = function() {
			_pane.isScrolling = false;

			// Round scroll positions to the nearest multiple of STEP in the direction of scrolling.
			if (_node.scrollLeft > _pane.prevScrollLeft) {
				_node.scrollLeft += STEP - _node.scrollLeft % STEP;
			} else {
				_node.scrollLeft -= _node.scrollLeft % STEP;
			}
			if (_pane.prevScrollTop > _node.scrollTop) {
				_node.scrollTop += STEP - _node.scrollTop % STEP;
			} else if (_node.scrollTop <= STEP) {
				_node.scrollTop = 0; // For some reason, the vertical scroll sometimes gets stuck just below the top.
			} else {
				_node.scrollTop -= _node.scrollTop % STEP;
			}

			// Save the scroll positions so that the direction of scrolling can be determined.
			_pane.prevScrollLeft = _node.scrollLeft;
			_pane.prevScrollTop  = _node.scrollTop;
		};

		// We're calling setTimeout with a value of 0, so that the callback will be called
		// as soon as all pending events are handled.  This avoids the problem that with IE,
		// even a minimal scroll sets off a bunch of onscroll events, often with just one
		// pixel difference between them.  (Note: this is not for efficiency reasons, it's
		// to make the quantization work in a reasonable way.)
		setTimeout(callback, 0);
	};
}

function updateLatestMouseUpEvent(e) {
	latest_event = e;
	console.debug("e = ", e);
	pion.reactors.last_x = e.clientX;
	pion.reactors.last_y = e.clientY;
}

pion.reactors.getNearbyGridPointInBox = function(constraintBox, currentLeftTop) {
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

pion.reactors.updateConnectionLine = function(poly, start_node, end_node) {
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

	var radius = 6;
	poly.div1.style.top = (y1 - radius) + "px";
	poly.div1.style.height = (2 * radius) + "px";
	if (x1 < x2) {
		poly.div1.style.left = x1 + "px";
		poly.div1.style.width = (x2 - x1) + "px";
	} else {
		poly.div1.style.left = x2 + "px";
		poly.div1.style.width = (x1 - x2) + "px";
	}
	poly.div2.style.left = (x2 - radius) + "px";
	poly.div2.style.width = (2 * radius) + "px";
	if (y1 < y2) {
		poly.div2.style.top = y1 + "px";
		poly.div2.style.height = (y2 - y1) + "px";
	} else {
		poly.div2.style.top = y2 + "px";
		poly.div2.style.height = (y1 - y2) + "px";
	}
}

pion.reactors.createReactor = function(config, node) {
	plugin_class_name = "plugins.reactors." + config.Plugin;
	var plugin_class = dojo.getObject(plugin_class_name);
	if (plugin_class) {
		console.debug('found class ', plugin_class_name);
		var reactor = new plugin_class({config: config}, node);
	} else {
		console.debug('class ', plugin_class_name, ' not found; using plugins.reactors.Reactor instead.');
		var reactor = new plugins.reactors.Reactor({config: config}, node);
	}
	return reactor;
}

pion.reactors.handleDropOnWorkspace = function(source, nodes, copy, target) {
	console.debug("handleDropOnWorkspace called, target.node = ", target.node, ", workspace_box.node = ", pion.reactors.workspace_box.node);

	// Remove connectors that are added to the workspace as a consequence of being dropped on a reactor.
	// They shouldn't be added, because the workspace is disabled as a target when a connector is being moved, but
	// there is a bug in dojo.dnd.Source.onDndDrop.  Alternatively, this can be avoided by adding 
	//		if(this.targetState == "Disabled"){ break; }
	// near the beginning of dojo.dnd.Source.onDndDrop.
	dojo.query('.dojoDndItem', pion.reactors.workspace_box.node).forEach(function(n) {
		if (n.getAttribute("dndType") == "connector") {
			console.debug('Removing ', n);
			pion.reactors.workspace_box.node.removeChild(n);
		}
	});

	// We need to duplicate the acceptance check that was done in onDndDrop(), since handleDropOnWorkspace() is called 
	// whenever onDndDrop() is called.
	// TODO: see if it would make more sense to have
	//		new_workspace.creator = handleDropOnWorkspace  (appropriately rewritten)
	// rather than
	//		dojo.connect(new_workspace, "onDndDrop", function(source, nodes, copy, target){ handleDropOnWorkspace(source, nodes, copy, new_workspace); })
	if (!target.checkAcceptance(source, nodes))
		return;

	// If not the current workspace, ignore the drop.
	// TODO: once the problems with disabling targets are fixed, this should be handled by disabling all but the current workspace.
	if (target != pion.reactors.workspace_box)
		return;

	var reactor_type = nodes[0].getAttribute("reactor_type");

	pion.reactors.showReactorInitDialog(reactor_type);
}

pion.reactors.showReactorInitDialog = function(reactor_type) {
	//if (pion.key_service_running && plugins.reactors[reactor_type].edition == 'Enterprise') {
	//	pion.about.checkKeyStatus({success_callback: function() {pion.reactors._showReactorInitDialog(reactor_type)}});
	//} else {
	//	pion.reactors._showReactorInitDialog(reactor_type);
	//}
	pion.reactors._showReactorInitDialog(reactor_type);
}

pion.reactors._showReactorInitDialog = function(reactor_type) {
	var dialog_class_name = 'plugins.reactors.' + reactor_type + 'InitDialog';
	console.debug("dialog_class_name: ", dialog_class_name);
	var dialog_class = dojo.getObject(dialog_class_name);
	if (dialog_class) {
		var dialog = new dialog_class({plugin: reactor_type});
	} else {
		var dialog = new plugins.reactors.ReactorInitDialog({title: plugins.reactors[reactor_type].label + ' Initialization', plugin: reactor_type});
	}

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', dialog, 'onCancel')
	});
	dialog.show();
}

pion.reactors.handleDropOnReactor = function(source, nodes, copy, target) {
	var workspace_box = pion.reactors.workspace_box;
	console.debug('handleDropOnReactor called, target.node.getAttribute("reactor_type") = ', target.node.getAttribute("reactor_type"));
	//console.debug("target.targetState = ", target.targetState, ", isTracking = ", workspace_box.isTracking, ', target.node.lastChild = ', target.node.lastChild);

	// If target is not a reactor, return.  This happens when dropping reactors on the workspace, and seems to be a dnd bug. 
	if (!target.node.getAttribute('reactor_type')) return;

	// handleDropOnReactor will be called more than once for a single drop.  One of these times will be just
	// after a connector node was added to the reactor.  If this is that time, delete the connector node.
	// Note that this sometimes happens after tracking has started, i.e. when isTracking == true.
	dojo.query('.dojoDndItem', target.node).forEach(function(n) {
		target.node.removeChild(n);
	});

	// If we're already tracking a connector for this target, we're done.
	if (workspace_box.isTracking) return;

	//debugger;
	console.debug('nodes[0].getAttribute("dndType") = ', nodes[0].getAttribute("dndType"));
	console.debug('nodes[0].getAttribute("reactor_type") = ', nodes[0].getAttribute("reactor_type"));

	if (nodes[0].getAttribute("dndType") != "connector") {
		// This should not be reached, since reactor targets are only supposed to accept connectors.
		console.debug('returning because nodes[0].getAttribute("dndType") != "connector"');
		return;
	}

	workspace_box.isTracking = true;
	var x1 = target.node.offsetLeft + target.node.offsetWidth;
	var y1 = target.node.offsetTop  + target.node.offsetHeight / 2;
	console.debug("x1 = ", x1, ", y1 = ", y1);
	workspace_box.trackLine = surface.createPolyline([{x: x1, y: y1}, {x: x1 + 20, y: y1}, {x: x1 + 15, y: y1 - 5}, {x: x1 + 20, y: y1}, {x: x1 + 15, y: y1 + 5}]).setStroke("black");
	var xOffset = dojo.byId("reactor_config_content").offsetLeft;
	var yOffset = dojo.byId("reactor_config_content").offsetTop;
	yOffset += dojo.byId("main_stack_container").offsetTop;
	console.debug("xOffset = ", xOffset, ", yOffset = ", yOffset);
	mouseConnection = dojo.connect(workspace_box.node, 'onmousemove', 
		function(event) {
			var x2 = event.clientX - xOffset;
			var y2 = event.clientY - yOffset;
			workspace_box.trackLine.setShape([{x: x1, y: y1}, {x: x2, y: y1}, {x: x2, y: y2}])
		});
	console.debug("created mouseConnection");

	// the startpoint of the connection will be the widget at target.node, i.e. the reactor the connector was dropped on
	wrapperWithStartpoint = function(event) {
		dojo.disconnect(mouseConnection);
		console.debug("disconnected mouseConnection");
		workspace_box.trackLine.removeShape();
		handleSelectionOfConnectorEndpoint(event, target.node);
	}

	dojo.query(".moveable").filter(function(n) { return n != target.node; }).forEach("item.onClickHandler = dojo.connect(item, 'click', wrapperWithStartpoint)");

	// TODO: disable everything except clicking on moveable's.
}

function handleSelectionOfConnectorEndpoint(event, source_target) {
	pion.reactors.workspace_box.isTracking = false;
	console.debug('handleSelectionOfConnectorEndpoint: event = ', event);
	var source_reactor = dijit.byNode(source_target);
	console.debug('source_reactor = ', source_reactor);
	var sink_reactor = dijit.byNode(event.target);
	if (!sink_reactor) {
		// This will happen, e.g., when clicking on the name div of the reactor.
		sink_reactor = dijit.byNode(event.target.parentNode);
	}
	console.debug('sink_reactor = ', sink_reactor);

	// Disconnect the click handlers on all moveable's.
	dojo.query(".moveable").forEach("dojo.disconnect(item.onClickHandler)");

	// If in Lite mode and either Reactor is an Enterprise Reactor, display an error message and don't add the connection.
	pion.reactors.doConnectionChangeIfAllowed(source_reactor, sink_reactor, function() {
		var post_data = '<PionConfig><Connection><Type>reactor</Type>'
					  + '<From>' + source_reactor.config['@id'] + '</From>'
					  + '<To>' + sink_reactor.config['@id'] + '</To>'
					  + '</Connection></PionConfig>';
		dojo.rawXhrPost({
			url: '/config/connections',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response){
				var node = response.getElementsByTagName('Connection')[0];
				var id = node.getAttribute('id');
				console.debug('connection id (from server): ', id);
				pion.reactors.createConnection(source_reactor, sink_reactor, id);
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	});
}

pion.reactors.doConnectionChangeIfAllowed = function(source_reactor, sink_reactor, callback) {
	if (pion.license_state == 'lite' && (source_reactor.requires_license || sink_reactor.requires_license)) {
		// Check key status, in case someone recently copied a key to the config directory. 
		pion.about.checkKeyStatusDfd()
		.addCallback(function() {
			if (pion.license_state == 'lite') {
				var offending_reactor_label = source_reactor.requires_license? source_reactor.class_info.label : sink_reactor.class_info.label;
				var dialog = new dijit.Dialog({title: 'Action Not Allowed'});
				var content = 'You must have a commercial license to modify the connections of a ' + offending_reactor_label + '.<br/>'
							+ '<a href="http://www.atomiclabs.com/pion-web-analytics/trial-license.php" target="_blank" style="color:#0033CC; text-decoration:underline">'
							+ 'Click here to obtain a free trial license.</a>'
				dialog.attr('content', content);
				dialog.show();
			} else {
				callback();
			}
		});
	} else {
		callback();
	}
}

pion.reactors.showReactorConfigDialog = function(reactor) {
	//if (pion.key_service_running && plugins.reactors[reactor.config.Plugin].edition == 'Enterprise') {
	//	pion.about.checkKeyStatus({success_callback: function() {pion.reactors._showReactorConfigDialog(reactor)}});
	//} else {
	//	pion.reactors._showReactorConfigDialog(reactor);
	//}
	pion.reactors._showReactorConfigDialog(reactor);
}

pion.reactors._showReactorConfigDialog = function(reactor) {
	var dialog_class_name = 'plugins.reactors.' + reactor.config.Plugin + 'Dialog';
	console.debug('dialog_class_name = ', dialog_class_name);
	var dialog_class = dojo.getObject(dialog_class_name);
	if (dialog_class) {
		var dialog = new dialog_class({reactor: reactor});
	} else {
		var dialog = new plugins.reactors.ReactorDialog({title: reactor.config.Plugin + ' Configuration', reactor: reactor});
	}
	dialog.attr('value', reactor.config);

	var reactor_inputs_store = new dojo.data.ItemFileWriteStore({
		data: { identifier: 'ID', items: [] }
	});
	dojo.forEach(reactor.reactor_inputs, function(reactor_input) {
		reactor_inputs_store.newItem({
			ID: reactor_input.id,
			Source: reactor_input.source.config.Name,
			DeleteButton: 'yes'
		});
	});
	pion.reactors.connection_store.fetch({
		query: {'To': reactor.config['@id'], 'Type': 'input'},
		onItem: function(item) {
			var source = pion.reactors.connection_store.getValue(item, 'From');
			var connection_id = pion.reactors.connection_store.getValue(item, '@id');
			reactor_inputs_store.newItem({
				ID: connection_id,
				Source: source
			});
		},
		onError: pion.handleFetchError
	});
	var makeDeleteButtonIfNeeded = function(v) {
		if (v == 'yes') {
			return '<button dojoType=dijit.form.Button class="delete_row"></button>';
		} else {
			return '';
		}
	}
	var reactor_inputs_grid_layout = [{
		rows: [
			{ field: 'Source', name: 'From', styles: '', width: 'auto' },
			{ field: 'ID', name: 'Connection ID', styles: '', width: 'auto' },
			{ field: 'DeleteButton', name: 'Delete', styles: 'align: center;', width: 3, formatter: makeDeleteButtonIfNeeded }
		]
	}];
	var reactor_inputs_grid = new dojox.grid.DataGrid({
		store: reactor_inputs_store,
		structure: reactor_inputs_grid_layout,
		singleClickEdit: true,
		autoHeight: true
	}, document.createElement('div'));
	dialog.reactor_inputs_grid_node.appendChild(reactor_inputs_grid.domNode);
	reactor_inputs_grid.startup();
	reactor_inputs_grid.connect(reactor_inputs_grid, 'onCellClick', function(e) {
		if (e.cell.name == 'Delete') {
			// If in Lite mode and this reactor or the selected incoming reactor is an Enterprise Reactor, display an error message and don't delete the connection.
			var reactor_input = reactor.reactor_inputs[e.rowIndex];
			var incoming_reactor = reactor_input.source;
			var _this = this;
			pion.reactors.doConnectionChangeIfAllowed(incoming_reactor, reactor, function() {
				var item = _this.getItem(e.rowIndex);
				if (_this.store.hasAttribute(item, 'DeleteButton')) {
					_this.store.deleteItem(item);
					dojo.xhrDelete({
						url: '/config/connections/' + reactor_input.id,
						handleAs: 'xml',
						timeout: 5000,
						load: function(response, ioArgs) {
							pion.reactors.removeLine(reactor_input.line);
							reactor.reactor_inputs.splice(e.rowIndex, 1);

							// remove reactor from the outputs of incoming_reactor
							for (var j = 0; j < incoming_reactor.reactor_outputs.length; ++j) {
								if (incoming_reactor.reactor_outputs[j].sink == reactor) {
									incoming_reactor.reactor_outputs.splice(j, 1);
									break;
								}
							}
							return response;
						},
						error: pion.getXhrErrorHandler(dojo.xhrDelete)
					});
				}
			});
		}
	});

	var reactor_outputs_store = new dojo.data.ItemFileWriteStore({
		data: { identifier: 'ID', items: [] }
	});
	dojo.forEach(reactor.reactor_outputs, function(reactor_output) {
		reactor_outputs_store.newItem({
			ID: reactor_output.id,
			Sink: reactor_output.sink.config.Name,
			DeleteButton: 'yes'
		});
	});
	pion.reactors.connection_store.fetch({
		query: {'From': reactor.config['@id'], 'Type': 'output'},
		onItem: function(item) {
			var sink = pion.reactors.connection_store.getValue(item, 'To');
			var connection_id = pion.reactors.connection_store.getValue(item, '@id');
			reactor_outputs_store.newItem({
				ID: connection_id,
				Sink: sink
			});
		},
		onError: pion.handleFetchError
	});
	var reactor_outputs_grid_layout = [{
		rows: [
			{ field: 'Sink', name: 'To', styles: '', width: 'auto' },
			{ field: 'ID', name: 'Connection ID', styles: '', width: 'auto' },
			{ field: 'DeleteButton', name: 'Delete', styles: 'align: center;', width: 3, formatter: makeDeleteButtonIfNeeded }
		]
	}];
	var reactor_outputs_grid = new dojox.grid.DataGrid({
		store: reactor_outputs_store,
		structure: reactor_outputs_grid_layout,
		singleClickEdit: true,
		autoHeight: true
	}, document.createElement('div'));
	dialog.reactor_outputs_grid_node.appendChild(reactor_outputs_grid.domNode);
	reactor_outputs_grid.startup();
	reactor_outputs_grid.connect(reactor_outputs_grid, 'onCellClick', function(e) {
		if (e.cell.name == 'Delete') {
			// If in Lite mode and this reactor or the selected outgoing reactor is an Enterprise Reactor, display an error message and don't delete the connection.
			var reactor_output = reactor.reactor_outputs[e.rowIndex];
			var outgoing_reactor = reactor_output.sink;
			var _this = this;
			pion.reactors.doConnectionChangeIfAllowed(reactor, outgoing_reactor, function() {
				var item = _this.getItem(e.rowIndex);
				if (_this.store.hasAttribute(item, 'DeleteButton')) {
					_this.store.deleteItem(item);
					dojo.xhrDelete({
						url: '/config/connections/' + reactor_output.id,
						handleAs: 'xml',
						timeout: 5000,
						load: function(response, ioArgs) {
							pion.reactors.removeLine(reactor_output.line);
							reactor.reactor_outputs.splice(e.rowIndex, 1);

							// remove reactor from the inputs of outgoing_reactor
							for (var j = 0; j < outgoing_reactor.reactor_inputs.length; ++j) {
								if (outgoing_reactor.reactor_inputs[j].source == reactor) {
									outgoing_reactor.reactor_inputs.splice(j, 1);
									break;
								}
							}
							return response;
						},
						error: pion.getXhrErrorHandler(dojo.xhrDelete)
					});
				}
			});
		}
	});

	// The following use forEach to allow either zero or multiple matches.
	dojo.query(".dijitButton.delete", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() { dialog.onCancel(); pion.reactors.deleteReactorIfConfirmed(reactor); })
	});
	dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', dialog, 'onCancel')
	});
	dojo.query(".dijitButton.save", dialog.domNode).forEach(function(n) {
		dijit.byNode(n).onClick = function() { return dialog.isValid(); };
	});

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	// Need a delay here for the dialog to have time to figure out how big it should be,
	// based on how many items end up being loaded into any grids it contains.
	setTimeout(function() { dialog.show(); }, 1000);
}

pion.reactors.showXMLDialog = function(reactor) {
	window.open('/config/reactors/' + reactor.config['@id']);
	/*
	 TODO: restore this once I figure out how to pretty print the XML.  Also, it should at least have a refresh button, if not auto-refreshing.
	dojo.xhrGet({
		url: '/config/reactors/' + reactor.config['@id'],
		preventCache: true,
		handleAs: 'text',
		timeout: 5000,
		load: function(response, ioArgs) {
			var html = '<pre>' + response.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre><br/>';
			console.debug('html = ', html);
			var dialog = new dijit.Dialog({title: reactor.config.Name + ' Configuration', style: 'width: 600px'});
			dialog.attr('content', html);
			dialog.show();
			return response;
		},
		error: pion.handleXhrGetError
	});
	*/
}

pion.reactors.deleteReactorIfConfirmed = function(reactor) {
	pion.doDeleteConfirmationDialog("Are you sure you want to delete this reactor?", deleteReactor, reactor);
}

function deleteReactor(reactor) {
	console.debug('deleting ', reactor.config.Name);

	dojo.xhrDelete({
		url: '/config/reactors/' + reactor.config['@id'],
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			console.debug('xhrDelete for url = /config/reactors/', reactor.config['@id'], '; HTTP status code: ', ioArgs.xhr.status);

			// Remove the reactor from the outputs of incoming reactors and the inputs of
			// incoming reactors, and remove the lines connecting them.
			for (var i = 0; i < reactor.reactor_inputs.length; ++i) {
				var incoming_reactor = reactor.reactor_inputs[i].source;
				pion.reactors.removeLine(reactor.reactor_inputs[i].line);

				// remove reactor from the outputs of incoming_reactor
				for (var j = 0; j < incoming_reactor.reactor_outputs.length; ++j) {
					if (incoming_reactor.reactor_outputs[j].sink == reactor) {
						incoming_reactor.reactor_outputs.splice(j, 1);
					}
				}
			}
			for (var i = 0; i < reactor.reactor_outputs.length; ++i) {
				var outgoing_reactor = reactor.reactor_outputs[i].sink;
				pion.reactors.removeLine(reactor.reactor_outputs[i].line);

				// remove reactor from the inputs of outgoing_reactor
				for (var j = 0; j < outgoing_reactor.reactor_inputs.length; ++j) {
					if (outgoing_reactor.reactor_inputs[j].source == reactor) {
						outgoing_reactor.reactor_inputs.splice(j, 1);
					}
				}
			}

			// Remove the reactor's node from the DOM tree, and finally, remove the reactor
			// itself from the list of reactors.
			var workspace_box = pion.reactors.workspace_box;
			workspace_box.node.removeChild(reactor.domNode);
			for (var j = 0; j < workspace_box.reactors.length; ++j) {
				if (workspace_box.reactors[j] == reactor) {
					workspace_box.reactors.splice(j, 1);
				}
			}
			if (workspace_box.reactors.length == 0) {
				workspace_box.onEmpty(workspace_box.my_content_pane);
			}

			return response;
		},
		error: pion.getXhrErrorHandler(dojo.xhrDelete)
	});
}

function selected(page) {
	if (page.title == "Add new workspace") {
		console.debug("'Add new workspace' tab was selected");
		if (new_workspace_tab_clicked) {
			console.debug('redundant call');
			return;
		}
		new_workspace_tab_clicked = true;
		addWorkspace();
		return;
	}
	console.debug("selected " + page.title + ", page.id = " + page.id);
	pion.reactors.workspace_box = page.my_workspace_box;
	surface = pion.reactors.workspace_box.my_surface;

	// in case the window was resized since the workspace was last selected
	expandWorkspaceIfNeeded();
}

dojo.subscribe("mainTabContainer-selectChild", selected);

function expandWorkspaceIfNeeded() {
	if (!surface) return; // the workspace isn't ready yet

	var workspace_box = pion.reactors.workspace_box;
	//console.debug('workspace_box.node.offsetWidth = ', workspace_box.node.offsetWidth);
	//console.debug('workspace_box.node.offsetHeight = ', workspace_box.node.offsetHeight);

	// If the window was resized, the dimensions of the workspace's contentPane probably changed.
	// new_width and new_height are the new width and height of the viewing area.
	var new_width = workspace_box.my_content_pane.domNode.offsetWidth;
	var new_height = workspace_box.my_content_pane.domNode.offsetHeight;

	// keeps scroll bars from appearing unnecessarily in IE
	new_width -= 2;

	new_height -= 6; // We need some decrement even when there's no horizontal scroll bar, to avoid a vertical scroll bar.
					 // This is enough for Firefox on both Windows XP and Mac OS X, and for IE.

	// We can get the current workspace size from the surface.  (We can't use workspace_box.node.offsetWidth
	// and workspace_box.node.offsetHeight, because in certain situations they will have already been updated, 
	// namely, if the original width or height was > minimum and this is the first resize.)
	var surface_dims = surface.getDimensions();
	var old_width = parseInt(surface_dims.width);
	var old_height = parseInt(surface_dims.height);
	console.debug('old_width = ', old_width, ', new_width = ', new_width, ', old_height = ', old_height, ', new_height = ', new_height);

	// If the viewing area is larger than the workspace, expand the workspace to fill it.
	// We never decrease it; if the viewing area is smaller than the workspace, scroll bars will appear.
	if (new_width > old_width) {
		console.debug('expanding workspace width to ', new_width, "px");
		workspace_box.node.style.width = new_width + "px";
		surface_dims.width = new_width;
	}
	if (new_height > old_height) {
		console.debug('expanding workspace height to ', new_height, "px");
		workspace_box.node.style.height = new_height + "px";
		surface_dims.height = new_height;
	}
	if (new_width > old_width || new_height > old_height) {
		surface.setDimensions(parseInt(surface_dims.width) + "px", parseInt(surface_dims.height) + "px");
	}
}

function handleKeyPress(e) {
	var workspace_box = pion.reactors.workspace_box;
	if (e.keyCode == dojo.keys.ESCAPE) {
		if (workspace_box.isTracking) {
			dojo.disconnect(mouseConnection);
			workspace_box.trackLine.removeShape();
			workspace_box.isTracking = false;
		}
	}
}

function showWorkspaceConfigDialog(workspace_pane) {
	var dialog = pion.reactors.workspace_dialog;
	if (!dialog) {
		dialog = new pion.reactors.WorkspaceDialog({title: "Workspace Configuration"});
		dialog.workspace_name.isValid = function(isFocused) {
			if (!this.validator(this.textbox.value, this.constraints)) {
				this.invalidMessage = "Invalid Workspace name";
				console.debug('validationTextBox.isValid returned false');
				return false;
			}
			if (isDuplicateWorkspaceName(workspace_pane, this.textbox.value)) {
				this.invalidMessage = "A Workspace with this name already exists";
				console.debug('In validationTextBox.isValid, isDuplicateWorkspaceName returned true');
				return false;
			}
			console.debug('validationTextBox.isValid returned true');
			return true;
		};
		dialog.save_button.onClick = function() { return dialog.isValid(); };

		// Save for future use.
		pion.reactors.workspace_dialog = dialog;
	}
	dialog.attr('value', {name: workspace_pane.title, comment: workspace_pane.comment});
	dialog.workspace_pane = workspace_pane;

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dialog.show();
	dialog.execute_already_called = false;
	dialog.execute = function(dialogFields) {
		if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
		this.execute_already_called = true;

		updateWorkspaceConfig(dialogFields, workspace_pane);
	}
}

function updateWorkspaceConfig(dialogFields, workspace_pane) {
	var new_workspace_name = dialogFields.name;
	if (new_workspace_name != workspace_pane.title) {
		workspace_pane.title = new_workspace_name;
		dojo.byId(workspace_pane.controlButton.id).innerHTML = new_workspace_name;
		dojo.forEach(workspace_pane.my_workspace_box.reactors, function(reactor) {
			reactor.changeWorkspace(new_workspace_name);
		});
	}
	workspace_pane.comment = dialogFields.comment;
}

// Returns true if there is another workspace with the given name.
function isDuplicateWorkspaceName(workspace_pane, name) {
	for (var i = 0; i < workspace_boxes.length; ++i) {
		if (workspace_boxes[i].my_content_pane != workspace_pane && workspace_boxes[i].my_content_pane.title == name) {
			 return true;
		}
	}
	return false;
}

function deleteWorkspaceIfConfirmed(workspace_pane) {
	// If workspace is empty, don't bother with a confirmation dialog.
	if (workspace_pane.my_workspace_box.reactors.length == 0) {
		_deleteEmptyWorkspace(workspace_pane);
		return;
	}

	pion.doDeleteConfirmationDialog("Are you sure you want to delete workspace '" + workspace_pane.title + "' and all the reactors it contains?",
									deleteWorkspace, workspace_pane);
}

function deleteWorkspace(workspace_pane) {
	var copy_of_reactor_array = [];
	for (var i = 0; i < workspace_pane.my_workspace_box.reactors.length; ++i) {
		copy_of_reactor_array[i] = workspace_pane.my_workspace_box.reactors[i];
	}
	for (i = 0; i < copy_of_reactor_array.length; ++i) {
		deleteReactor(copy_of_reactor_array[i]);
	}

	// Wait until all the reactors have been deleted, then remove the workspace.
	dojo.connect(workspace_pane.my_workspace_box, 'onEmpty', _deleteEmptyWorkspace);
}

function _deleteEmptyWorkspace(workspace_pane) {
	console.debug('deleting ', workspace_pane.title);
	delete workspaces_by_name[workspace_pane.title];
	for (var j = 0; j < workspace_boxes.length; ++j) {
		if (workspace_boxes[j] == workspace_pane.my_workspace_box) {
			workspace_boxes.splice(j, 1);
		}
	}
	dijit.byId("mainTabContainer").removeChild(workspace_pane);
}

dojo.declare("pion.reactors.WorkspaceDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("pion", "../resources/WorkspaceDialog.html"),
		postMixInProperties: function() {
			// See pion.login.LoginDialog for explanation of why this is needed..
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		_handleDelete: function() {
			this.onCancel();
			deleteWorkspaceIfConfirmed(this.workspace_pane);
		}
	}
);
