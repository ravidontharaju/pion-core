dojo.provide("plugins.reactors.Reactor");
dojo.require("dijit.Dialog");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.form.Button");
dojo.require("pion.reactors");

dojo.declare("plugins.reactors.Reactor",
	[dijit._Widget],
	// [dijit._Widget, dijit._Templated], // TODO: make a template
	{
		postCreate: function() {
			this.inherited("postCreate", arguments); 
			this.special_config_elements = ['@id', 'options'];
			this.reactor_inputs = [];
			this.reactor_outputs = [];
			this.prev_events_in = 0;
			this.class_info = plugins.reactors[this.config.Plugin];
			if ('init_defaults' in this.class_info)
				this.class_info.init_defaults();
			if ('option_defaults' in this.class_info)
				this._initOptions(this.config, this.class_info.option_defaults);
			this.requires_license = 'edition' in this.class_info && this.class_info.edition == 'Enterprise';
			var reactor_target = new dojo.dnd.Target(this.domNode, {accept: ["connector"]});
			dojo.connect(reactor_target, "onDndDrop", pion.reactors.handleDropOnReactor);

			this.name_div = document.createElement('div');
			this.name_div.innerHTML = pion.escapeXml(this.config.Name);
			dojo.addClass(this.name_div, 'name');
			this.domNode.appendChild(this.name_div);

			var _this = this;

			this.run_button = new dijit.form.ToggleButton();
			var button_node = this.run_button.domNode;
			dojo.connect(button_node, 'click', function() {
				dojo.xhrPut({
					url: '/config/reactors/' + _this.config['@id'] + (_this.run_button.checked? '/start' : '/stop'),
					load: function() {
						_this.config.Running = _this.run_button.checked;
					},
					error: function(response, ioArgs) {
						pion.handleXhrError(response, ioArgs, dojo.xhrPut, pion.reactors.updateRunButtons);
					}
				});
			});
			this.domNode.appendChild(button_node);

			this.ops_per_sec = document.createElement('span');
			dojo.addClass(this.ops_per_sec, 'ops_per_sec');
			this.ops_per_sec.innerHTML = '0';
			this.domNode.appendChild(this.ops_per_sec);
			this.domNode.setAttribute("reactor_type", this.config.Plugin);

			var category = pion.reactors.categories[this.config.Plugin];
			dojo.addClass(this.domNode, category);
			if (category != 'collection') {
				this.run_button.attr('checked', true); // all reactors except collectors start out running
			}

			dojo.addClass(this.domNode, 'moveable');
			dojo.addClass(this.domNode, 'reactor');
			dojo.addClass(this.domNode, this.config.Plugin);

			var m5 = new dojo.dnd.move.parentConstrainedMoveable(this.domNode, {area: "padding", within: true});
			var c = m5.constraints();
			// Since parts of the constraintBox are not calculated until onFirstMove() is called,
			// calculate them here.
			c.r = c.l + c.w - this.offsetWidth;
			c.b = c.t + c.h - this.offsetHeight;

			var mouseLeftTop = {l: this.config.X, t: this.config.Y};
			console.debug("mouseLeftTop: ", mouseLeftTop);
			var newLeftTop = pion.reactors.getNearbyGridPointInBox(c, mouseLeftTop);
			this.domNode.style.top  = newLeftTop.t + "px";
			this.domNode.style.left = newLeftTop.l + "px";
			this.domNode.style.position = "absolute";
			this.domNode.style.background = 'url(../plugins/reactors/' + category + '/' + this.config.Plugin + '/bg-moveable.png) repeat-x';
			this.domNode.style.zIndex = 300;

			// Add a context menu for the new reactor.
			this.context_menu = new dijit.Menu({targetNodeIds: [this.domNode]});
			var menu = this.context_menu;
			menu.addChild(new dijit.MenuItem({ label: "Edit reactor configuration", onClick: function(){pion.reactors.showReactorConfigDialog(_this);} }));
			menu.addChild(new dijit.MenuItem({ label: "Edit reactor connections", onClick: function(){pion.reactors.showReactorConnectionsDialog(_this);} }));
			menu.addChild(new dijit.MenuItem({ label: "Show configuration", onClick: function(){pion.reactors.showXMLDialog(_this);} }));
			menu.addChild(new dijit.MenuItem({ label: "Show stats", onClick: function(){_this.showQueryResult();} }));
			menu.addChild(new dijit.MenuItem({ label: "Delete reactor", onClick: function(){pion.reactors.deleteReactorIfConfirmed(_this);} }));

			dojo.connect(this.domNode, 'dblclick', function(event) {
				event.stopPropagation(); // so the workspace configuration dialog won't also pop up
				if (event.shiftKey) {
					_this.showQueryResult();
				} else {
					pion.reactors.showReactorConfigDialog(_this);
				}
			});

			// Since this overrides the constrained onMove, we have to enforce the boundary constraints (in addition to the grid constraints).
			// getNearbyGridPointInBox() takes care of both.  Note that parts of this.constraintBox are not calculated until
			// onFirstMove() is called.
			m5.onMove = function(mover, leftTop) {
				//console.debug("In m5.onMove, this.constraintBox = ", this.constraintBox);
				//console.debug("leftTop = ", leftTop);
				var newLeftTop = pion.reactors.getNearbyGridPointInBox(this.constraintBox, leftTop);
				//console.debug("newLeftTop = ", newLeftTop);
				dojo.marginBox(mover.node, newLeftTop);

				for (var i = 0; i < _this.reactor_inputs.length; ++i) {
					pion.reactors.updateConnectionLine(_this.reactor_inputs[i].line, _this.reactor_inputs[i].source.domNode, _this.domNode);
				}
				for (var i = 0; i < _this.reactor_outputs.length; ++i) {
					pion.reactors.updateConnectionLine(_this.reactor_outputs[i].line, _this.domNode, _this.reactor_outputs[i].sink.domNode);
				}
			};
			/*
			// This doesn't do anything, because the constrained onMove doesn't call onMoving.
			dojo.connect(m5, "onMoving", function(mover, leftTop){
				console.debug("m5 is moving");
				leftTop.l -= leftTop.l % STEP;
				leftTop.t -= leftTop.t % STEP;
			});
			*/
			dojo.connect(m5, "onMoveStop", this, this.handleMoveStop);

			dojo.publish("AddReactor", [this]);
		},
		getConfigItem: function() {
			var dfd = new dojo.Deferred();
			if (this.config_item) {
				dfd.callback(this.config_item);
			} else {
				if (! this.pending_fetch_dfd) {
					this.pending_fetch_dfd = new dojo.Deferred();
					var store = pion.reactors.config_store;
					var _this = this;
					store.fetch({
						query: {'@id': this.config['@id']},
						onComplete: function(items) {
							if (items.length == 0)
								throw new Error("No configuration was found for the specified Reactor: " + _this.config['@id']);
							_this.config_item = items[0];
							_this.pending_fetch_dfd.callback(_this.config_item);
							delete _this.pending_fetch_dfd;
						},
						onError: pion.handleFetchError
					});
				}
				this.pending_fetch_dfd.addCallback(function(config_item) {dfd.callback(config_item)});
			}
			return dfd;
		},
		_initOptions: function(config, option_defaults) {
			var store = pion.reactors.config_store;
			this.getConfigItem().addCallback(function(config_item) {
				config.options = []; // used by pion.reactors.showReactorConfigDialog for checkboxes

				for (var option in option_defaults) {
					// Set option to default value.
					config[option] = option_defaults[option];

					// Override default if option present in the configuration.
					if (store.hasAttribute(config_item, option))
						config[option] = (store.getValue(config_item, option).toString() == 'true');

					// Add true options to list of checkboxes to check.
					if (config[option])
						config.options.push(option);
				}
			});
		},
		showQueryResult: function() {
			window.open('/query/reactors/' + this.config['@id']);
			/*
			 TODO: restore this once I figure out how to pretty print the XML.  Also, it should at least have a refresh button, if not auto-refreshing.
			dojo.xhrGet({
				url: '/query/reactors/' + this.config['@id'],
				preventCache: true,
				handleAs: 'text',
				timeout: 5000,
				load: function(response, ioArgs) {
					var html = '<pre>' + response.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
					console.debug('html = ', html);
					var dialog = new dijit.Dialog({title: 'Reactor Diagnostics'});
					dialog.attr('content', html);
					dialog.show();
					return response;
				},
				error: pion.handleXhrGetError
			});
			*/
/*
			// Doesn't work: treats response as HTML, and only shows the contents of the elements inside the (unknown) tags.
			var dialog = new dijit.Dialog({title: 'Reactor Diagnostics'});
			dialog.setHref('http://localhost:8888/query/reactors/' + this.config['@id']);
			dialog.show();
*/
		},
		handleMoveStop: function(mover) {
			if (this.config.X == mover.host.node.offsetLeft && this.config.Y == mover.host.node.offsetTop) {
				return;
			}
			this.config.X = mover.host.node.offsetLeft;
			this.config.Y = mover.host.node.offsetTop;

			this.put_data = '<PionConfig><Reactor>';
			for (var tag in this.config) {
				if (dojo.indexOf(this.special_config_elements, tag) == -1) {
					console.debug('this.config[', tag, '] = ', this.config[tag]);
					this.put_data += pion.makeXmlLeafElement(tag, this.config[tag]);
				}
			}
			if (this._insertCustomData) {
				this._insertCustomData();
			}
			this.put_data += '</Reactor></PionConfig>';
			console.debug('put_data: ', this.put_data);

			dojo.rawXhrPut({
				url: '/config/reactors/' + this.config['@id'] + '/move',
				contentType: "text/xml",
				handleAs: "xml",
				putData: this.put_data,
				load: function(response){
					console.debug('response: ', response);
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: this.put_data})
			});
		},
		getOptionalBool: function(store, item, attribute) {
			// Read.js stipulates that if an attribute is not present, getValue() should return undefined,
			// but XmlStore.getValue() returns null (and XmlStore.hasAttribute() incorrectly returns true).
			// See http://bugs.dojotoolkit.org/ticket/9419
			// Once this is fixed, the following two lines can be replaced with 
			// if (store.hasAttribute(item, attribute))
			var temp = store.getValue(item, attribute);
			if (temp !== undefined && temp !== null)
				// convert XmlItem to string and then to boolean
				return store.getValue(item, attribute).toString() == 'true';
			else
				return plugins.reactors[this.config.Plugin].grid_option_defaults[attribute];
		}
	}
);

dojo.declare("plugins.reactors.ReactorIcon",
	[ ],
	{
	}
);

dojo.declare("plugins.reactors.ReactorInitDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/ReactorInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited('postCreate', arguments);
			this.class_info = plugins.reactors[this.plugin];
			if ('init_defaults' in this.class_info)
				this.class_info.init_defaults();
			if ('option_defaults' in this.class_info) {
				var options = [];
				for (var option in this.class_info.option_defaults) {
					// Add true options to list of checkboxes to check.
					if (this.class_info.option_defaults[option])
						options.push(option);
				}
				this.attr('value', {options: options});
			}
			if ('value_defaults' in this.class_info)
				this.attr('value', this.class_info.value_defaults);
		},
		tryConfig: function() {
			var dialogFields = this.attr('value');
			console.debug(dialogFields);
			console.debug('this.plugin = ', this.plugin);
			var workspace_box = pion.reactors.workspace_box;
			var dc = dojo.coords(workspace_box.node);
			var X = Math.floor(pion.reactors.last_x - dc.x);
			var Y = Math.floor(pion.reactors.last_y - dc.y);
			this.post_data = '<PionConfig><Reactor>'
							+ pion.makeXmlLeafElement('Plugin', this.plugin)
							+ pion.makeXmlLeafElement('Workspace', workspace_box.my_content_pane.uuid)
							+ '<X>' + X + '</X><Y>' + Y + '</Y>';
			for (var tag in dialogFields) {
				if (tag != 'options') {
					console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
					this.post_data += pion.makeXmlLeafElement(tag, dialogFields[tag]);
				}
			}
			if ('options' in dialogFields && plugins.reactors[this.plugin].option_defaults) {
				for (var option in plugins.reactors[this.plugin].option_defaults) {
					this.post_data += '<' + option + '>';
					this.post_data += (dojo.indexOf(dialogFields.options, option) != -1); // 'true' iff corresponding checkbox was checked
					this.post_data += '</' + option + '>';
				}
			}
			if (this._insertCustomData) {
				this._insertCustomData(dialogFields);
			}
			var other_defaults = plugins.reactors[this.plugin].other_defaults;
			if (other_defaults) {
				for (var key in other_defaults) {
					this.post_data += '<' + key + '>' + other_defaults[key] + '</' + key + '>';
				}
			}
			this.post_data += '</Reactor></PionConfig>';
			console.debug('post_data: ', this.post_data);

			var _this = this;
			dojo.rawXhrPost({
				url: '/config/reactors',
				contentType: "text/xml",
				handleAs: "xml",
				postData: this.post_data,
				load: function(response){
					var node = response.getElementsByTagName('Reactor')[0];
					var config = { '@id': node.getAttribute('id') };
					var attribute_nodes = node.childNodes;
					//console.debug('attribute_nodes: ', attribute_nodes);
					//console.dir(attribute_nodes);
					for (var i = 0; i < attribute_nodes.length; ++i) {
						if (attribute_nodes[i].firstChild) {
							config[attribute_nodes[i].tagName] = attribute_nodes[i].firstChild.nodeValue;
						}
					}
					//console.debug('config (from server): ', config);
					//console.dir(config);
					var reactor_node = document.createElement("div");

					// Replace the dnd reactor with the new reactor node.
					workspace_box.node.replaceChild(reactor_node, workspace_box.node.lastChild);

					var reactor = pion.reactors.createReactor(config, reactor_node);
					pion.reactors.updateRunButtons();
					pion.reactors.reactors_by_id[config['@id']] = reactor;
					reactor.workspace = workspace_box;
					workspace_box.reactors.push(reactor);

					_this.hide();
				},
				error: pion.getXhrErrorHandler(
					dojo.rawXhrPost,
					{postData: this.post_data}
				)
			});
		}
	}
);

dojo.declare("plugins.reactors.ReactorDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/ReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);

			// Invalidate this.reactor.config_item, so that the next call to getConfigItem() will query the server.
			delete this.reactor.config_item;

			if ('option_defaults' in this.reactor.class_info)
				this.reactor._initOptions(this.reactor.config, this.reactor.class_info.option_defaults);
			if ('value_defaults' in this.reactor.class_info)
				this.attr('value', this.reactor.class_info.value_defaults);
		},
		reactor: '',
		execute: function(dialogFields) {
			if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
			this.execute_already_called = true;

			dojo.mixin(this.reactor.config, dialogFields);
			this.reactor.name_div.innerHTML = pion.escapeXml(dialogFields.Name);

			// dialogFields.options can and should be undefined for Reactors without dialog options, e.g. LogOutputReactor.
			if ('options' in dialogFields && plugins.reactors[this.reactor.config.Plugin].option_defaults) {
				for (var option in plugins.reactors[this.reactor.config.Plugin].option_defaults) {
					var option_val = (dojo.indexOf(dialogFields.options, option) != -1); // 'true' iff corresponding checkbox was checked
					this.reactor.config[option] = option_val;
				}
			}

			this.put_data = '<PionConfig><Reactor>';
			for (var tag in this.reactor.config) {
				if (dojo.indexOf(this.reactor.special_config_elements, tag) == -1) {
					this.put_data += pion.makeXmlLeafElement(tag, this.reactor.config[tag]);
				}
			}
			if (this._insertCustomData) {
				this._insertCustomData(dialogFields);
			}
			this.put_data += '</Reactor></PionConfig>';
			console.debug('put_data: ', this.put_data);

			var _this = this;
			dojo.rawXhrPut({
				url: '/config/reactors/' + this.reactor.config['@id'],
				contentType: "text/xml",
				handleAs: "xml",
				putData: this.put_data,
				load: function(response){
					console.debug('response: ', response);
					if (_this.reactor._updateCustomData) {
						_this.reactor._updateCustomData();
					}
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: this.put_data})
			});
		}
	}
);

dojo.declare("plugins.reactors.ReactorBoilerplate",
	[dijit._Widget, dijit._Templated],
	{
		label: '???',
		name: '???',
		category: '???',
		description: '???',
		help_label: '',
		templatePath: dojo.moduleUrl("plugins", "reactors/ReactorBoilerplate.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			dojo.mixin(this, dojo.i18n.getLocalization("pion", "general"));
			if (this.help_label.length == 0)
				this.help_label = this.default_reactor_help_label;
			this.icon = '/plugins/reactors/' + this.category.toLowerCase() + '/' + this.name + '/dialog-icon.png';
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
		}
	}
);

dojo.declare("plugins.reactors.ReactorConnectionsDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/ReactorConnectionsDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);

			// Won't work: this.reactor.reactor_connections not defined yet.
			//this.reactor_connections.makeMenuOfInputs(reactor);
			//this.reactor_connections.makeMenuOfOutputs(reactor);
		},
		reactor: '',
		execute: function(dialogFields) {
		}
	}
);

dojo.declare("plugins.reactors.ReactorConnections",
	[dijit._Widget, dijit._Templated],
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/ReactorConnections.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
		},
		makeMenuOfInputs: function(sink_reactor) {
			var subMenus = {};
			for (var uuid in pion.reactors.workspaces_by_id) {
				var workspace_name = pion.reactors.workspaces_by_id[uuid].config.Name;
				subMenus[uuid] = new dijit.Menu({parentMenu: this.add_input_reactor_menu});
				this.add_input_reactor_menu.addChild(new dijit.PopupMenuItem({label: workspace_name, popup: subMenus[uuid]}));
			}
			var existing_inputs = [];
			for (var i = 0; i < sink_reactor.reactor_inputs.length; ++i) {
				var reactor_input = sink_reactor.reactor_inputs[i];
				var is_cross_workspace = 'cross_workspace_connection' in reactor_input;
				existing_inputs.push(is_cross_workspace? reactor_input.source.external_reactor : reactor_input.source);
			}
			for (var uuid in pion.reactors.reactors_by_id) {
				var source_reactor = pion.reactors.reactors_by_id[uuid];
				var menu_item = new dijit.MenuItem({label: source_reactor.config.Name});
				if (source_reactor == sink_reactor || dojo.indexOf(existing_inputs, source_reactor) != -1)
					menu_item.attr('disabled', true);
				else
					menu_item.attr('onClick', this.makeCallback(source_reactor, sink_reactor, 'input'));
				var workspace_id = source_reactor.workspace.my_content_pane.uuid;
				subMenus[workspace_id].addChild(menu_item);
			}
		},
		makeMenuOfOutputs: function(source_reactor) {
			var subMenus = {};
			for (var uuid in pion.reactors.workspaces_by_id) {
				var workspace_name = pion.reactors.workspaces_by_id[uuid].config.Name;
				subMenus[uuid] = new dijit.Menu({parentMenu: this.add_output_reactor_menu});
				this.add_output_reactor_menu.addChild(new dijit.PopupMenuItem({label: workspace_name, popup: subMenus[uuid]}));
			}
			var existing_outputs = [];
			for (var i = 0; i < source_reactor.reactor_outputs.length; ++i) {
				var reactor_output = source_reactor.reactor_outputs[i];
				var is_cross_workspace = 'cross_workspace_connection' in reactor_output;
				existing_outputs.push(is_cross_workspace? reactor_output.sink.external_reactor : reactor_output.sink);
			}
			for (var uuid in pion.reactors.reactors_by_id) {
				var sink_reactor = pion.reactors.reactors_by_id[uuid];
				var menu_item = new dijit.MenuItem({label: sink_reactor.config.Name});
				if (source_reactor == sink_reactor || dojo.indexOf(existing_outputs, sink_reactor) != -1)
					menu_item.attr('disabled', true);
				else
					menu_item.attr('onClick', this.makeCallback(source_reactor, sink_reactor, 'output'));
				var workspace_id = sink_reactor.workspace.my_content_pane.uuid;
				subMenus[workspace_id].addChild(menu_item);
			}
		},
		makeCallback: function(source_reactor, sink_reactor, connection_type) {
			var _this = this;
			return function() {
				var this_menu_item = this;
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
							pion.reactors.createConnection(source_reactor, sink_reactor, id);
							if (connection_type == 'input') {
								pion.reactors.addInputConnectionItem(_this.reactor_inputs_store, id);
							} else {
								pion.reactors.addOutputConnectionItem(_this.reactor_outputs_store, id);
							}

							// Disable the menu item that was selected, since it's now an existing connection.
							this_menu_item.attr('disabled', true);
						},
						error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
					});
				});
			}
		}
	}
);
