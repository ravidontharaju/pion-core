dojo.provide("pion.widgets.CrossWorkspaceConnection");
dojo.require("dijit._Widget");
dojo.require("dijit.Tooltip");
dojo.require("dojo.dnd.Source");

dojo.declare("pion.widgets.CrossWorkspaceConnection",
	[dijit._Widget],
	{
		postCreate: function() {
			this.inherited("postCreate", arguments);

			// Save the currently selected workspace tab.
			var selected_pane = pion.reactors.workspace_box.my_content_pane;

			dijit.byId("mainTabContainer").selectChild(this.source_reactor.workspace.my_content_pane);
			var sink_node = document.createElement('div');
			this.source_reactor.workspace.node.appendChild(sink_node);
			this.sink = new pion.widgets.SinkReactorProxy(
				{
					local_reactor: this.source_reactor,
					external_reactor: this.sink_reactor,
					connection_id: this.connection_id,
					cross_workspace_connection: this
				},
				sink_node
			);
			pion.reactors.updateConnectionLine(this.sink.line, this.source_reactor.domNode, this.sink.domNode);

			dijit.byId("mainTabContainer").selectChild(this.sink_reactor.workspace.my_content_pane);
			var source_node = document.createElement('div');
			this.sink_reactor.workspace.node.appendChild(source_node);
			this.source = new pion.widgets.SourceReactorProxy(
				{
					local_reactor: this.sink_reactor,
					external_reactor: this.source_reactor,
					connection_id: this.connection_id,
					cross_workspace_connection: this
				},
				source_node
			);
			pion.reactors.updateConnectionLine(this.source.line, this.source.domNode, this.sink_reactor.domNode);

			// Reselect the workspace tab that was originally selected.
			dijit.byId("mainTabContainer").selectChild(selected_pane);
		},
		deleteConnection: function() {
			// If in Lite mode and this reactor or the selected incoming reactor is an Enterprise Reactor, display an error message and don't delete the connection.
			var _this = this;
			pion.reactors.doConnectionChangeIfAllowed(this.source_reactor, this.sink_reactor, function() {
				dojo.xhrDelete({
					url: '/config/connections/' + _this.connection_id,
					handleAs: 'xml',
					timeout: 5000,
					load: function(response, ioArgs) {
						// remove connection from outputs of source reactor
						for (var j = 0; j < _this.source_reactor.reactor_outputs.length; ++j) {
							if (_this.source_reactor.reactor_outputs[j].id == _this.connection_id) {
								_this.source_reactor.reactor_outputs.splice(j, 1);
								break;
							}
						}

						// remove connection from inputs of sink reactor
						for (var j = 0; j < _this.sink_reactor.reactor_inputs.length; ++j) {
							if (_this.sink_reactor.reactor_inputs[j].id == _this.connection_id) {
								_this.sink_reactor.reactor_inputs.splice(j, 1);
								break;
							}
						}

						_this.destroy();

						return response;
					},
					error: pion.getXhrErrorHandler(dojo.xhrDelete)
				});
			});
		},
		destroy: function() {
			this.sink.destroy();
			this.source.destroy();
			this.inherited(arguments);
		}
	}
);

pion.widgets.CrossWorkspaceConnection.default_x_offset = 40;
pion.widgets.CrossWorkspaceConnection.default_y_offset = 40;

// See .reactor_proxy rule in default.css.
pion.widgets.CrossWorkspaceConnection.icon_width = 30;
pion.widgets.CrossWorkspaceConnection.icon_height = 30;

// See .moveable rule in default.css.
pion.widgets.CrossWorkspaceConnection.reactor_width = 150;
pion.widgets.CrossWorkspaceConnection.reactor_height = 50;

dojo.declare("pion.widgets.ReactorProxy",
	[dijit._Widget],
	{
		postCreate: function() {
			this.inherited("postCreate", arguments);

			this.local_workspace = this.local_reactor.workspace;
			this.external_workspace = this.external_reactor.workspace.my_content_pane;
			// Is config.Name being used any more?
			this.config = {Name: '[' + this.external_workspace.title + '] ' + this.external_reactor.config.Name};

			dojo.addClass(this.domNode, 'reactor_proxy');
			var category = pion.reactors.categories[this.external_reactor.config.Plugin];
			dojo.addClass(this.domNode, category);

			this.moveable_box = new dojo.dnd.move.parentConstrainedMoveable(this.domNode, {area: "padding", within: true});

			this.proxy_x_tag = 'Proxy_X_' + this.connection_id;
			this.proxy_y_tag = 'Proxy_Y_' + this.connection_id;
			this.initCoords();

			this.domNode.style.left = this.config.X + "px";
			this.domNode.style.top  = this.config.Y + "px";
			this.domNode.style.position = "absolute";
			this.domNode.style.background = 'url(../plugins/reactors/' + category + '/' + this.external_reactor.config.Plugin + '/proxy.png) repeat-x';
			this.domNode.style.zIndex = 300;

			var line = this.local_workspace.my_surface.createPolyline().setStroke("black");
			line.div1 = document.createElement('div');
			line.div1.style.position = 'absolute';
			this.local_workspace.node.appendChild(line.div1);
			line.div2 = document.createElement('div');
			line.div2.style.position = 'absolute';
			this.local_workspace.node.appendChild(line.div2);
			this.line = line;

			var _this = this;

			// Add a context menu for the icon.
			var menu = new dijit.Menu({targetNodeIds: [this.domNode]});
			menu.addChild(new dijit.MenuItem({
				label: 'Switch to workspace ' + this.external_workspace.title,
				onClick: function() { dijit.byId("mainTabContainer").selectChild(_this.external_workspace); }
			}));
			menu.addChild(new dijit.MenuItem({
				label: 'Delete connection',
				onClick: function() { _this.cross_workspace_connection.deleteConnection(); }
			}));
		},
		initCoords: function() {
			if (this.proxy_x_tag in this.external_reactor.config) {
				this.config.X = this.external_reactor.config[this.proxy_x_tag];
				this.config.Y = this.external_reactor.config[this.proxy_y_tag];	
			} else {
				this.computeInitialCoords();
				this.external_reactor.config[this.proxy_x_tag] = this.config.X;
				this.external_reactor.config[this.proxy_y_tag] = this.config.Y;
				this.updateExternalReactorConfig();
			}
		},
		makeTooltip: function(initial_text) {
			var tooltip_text = initial_text + '<b>' + this.external_reactor.config.Name + '</b>'
								+ ' in workspace <b>' + this.external_workspace.title + '</b>';
			new dijit.Tooltip({label: tooltip_text, connectId: [this.id]});
		},
		handleMoveStop: function(mover) {
			if (this.config.X == mover.host.node.offsetLeft && this.config.Y == mover.host.node.offsetTop) {
				return;
			}
			this.config.X = mover.host.node.offsetLeft;
			this.config.Y = mover.host.node.offsetTop;
			this.external_reactor.config[this.proxy_x_tag] = this.config.X;
			this.external_reactor.config[this.proxy_y_tag] = this.config.Y;
			this.updateExternalReactorConfig();
		},
		updateExternalReactorConfig: function() {
			var put_data = '<PionConfig><Reactor>';
			for (var tag in this.external_reactor.config) {
				if (dojo.indexOf(this.external_reactor.special_config_elements, tag) == -1) {
					put_data += pion.makeXmlLeafElement(tag, this.external_reactor.config[tag]);
				}
			}
			if (this.external_reactor._insertCustomData) {
				this.external_reactor._insertCustomData();
			}
			put_data += '</Reactor></PionConfig>';

			dojo.rawXhrPut({
				url: '/config/reactors/' + this.external_reactor.config['@id'] + '/move',
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response) {},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: put_data})
			});
		},
		destroy: function() {
			// If the external reactor still exists, update its proxy location.
			// It might not exist, because its deletion might be what triggered this destructor.
			if (this.external_reactor.config['@id'] in pion.reactors.reactors_by_id) {
				delete this.external_reactor.config[this.proxy_x_tag];
				delete this.external_reactor.config[this.proxy_y_tag];
				this.updateExternalReactorConfig();
			}

			this.local_workspace.node.removeChild(this.domNode);

			var selected_pane = pion.reactors.workspace_box.my_content_pane;
			dijit.byId("mainTabContainer").selectChild(this.local_workspace.my_content_pane);
			pion.reactors.removeLine(this.line);
			dijit.byId("mainTabContainer").selectChild(selected_pane);

			this.inherited(arguments);
		}
	}
);

dojo.declare("pion.widgets.SinkReactorProxy",
	[pion.widgets.ReactorProxy],
	{
		postCreate: function() {
			this.inherited("postCreate", arguments);

			this.makeTooltip('Connection to Reactor ');

			// Since this overrides the constrained onMove, we have to enforce the boundary constraints (in addition to the grid constraints).
			// getNearbyGridPointInBox() takes care of both.  Note that parts of this.constraintBox are not calculated until
			// onFirstMove() is called.
			var _this = this;
			this.moveable_box.onMove = function(mover, leftTop) {
				var newLeftTop = pion.reactors.getNearbyGridPointInBox(this.constraintBox, leftTop);
				dojo.marginBox(mover.node, newLeftTop);
				pion.reactors.updateConnectionLine(_this.line, _this.local_reactor.domNode, _this.domNode);
			};
			dojo.connect(this.moveable_box, "onMoveStop", this, this.handleMoveStop);
		},
		computeInitialCoords: function() {
			// Does the source reactor have any preexisting outgoing cross workspace connections?
			var max_X = -1;
			var max_Y = -1;
			for (var j = 0; j < this.local_reactor.reactor_outputs.length; ++j) {
				if (this.local_reactor.reactor_outputs[j].cross_workspace_connection) {
					var config = this.local_reactor.reactor_outputs[j].sink.config;
					max_X = Math.max(config.X, max_X);
					max_Y = Math.max(config.Y, max_Y);
				}
			}

			// If so, place the new icon so it doesn't hide them, otherwise place it to the right of the source reactor.
			if (max_X >= 0) {
				this.config.X = max_X + 10;
				this.config.Y = max_Y + 10;
			} else {
				var pwc = pion.widgets.CrossWorkspaceConnection;
				this.config.X = parseInt(this.local_reactor.config.X) + pwc.reactor_width + pwc.default_x_offset;
				this.config.Y = parseInt(this.local_reactor.config.Y) + (pwc.reactor_height - pwc.icon_height) / 2;
			}
		}
	}
);

dojo.declare("pion.widgets.SourceReactorProxy",
	[pion.widgets.ReactorProxy],
	{
		postCreate: function() {
			this.inherited("postCreate", arguments);

			this.makeTooltip('Connection from Reactor ');

			// Since this overrides the constrained onMove, we have to enforce the boundary constraints (in addition to the grid constraints).
			// getNearbyGridPointInBox() takes care of both.  Note that parts of this.constraintBox are not calculated until
			// onFirstMove() is called.
			var _this = this;
			this.moveable_box.onMove = function(mover, leftTop) {
				var newLeftTop = pion.reactors.getNearbyGridPointInBox(this.constraintBox, leftTop);
				dojo.marginBox(mover.node, newLeftTop);
				pion.reactors.updateConnectionLine(_this.line, _this.domNode, _this.local_reactor.domNode);
			};
			dojo.connect(this.moveable_box, "onMoveStop", this, this.handleMoveStop);
		},
		computeInitialCoords: function() {
			// Does the sink reactor have any preexisting incoming cross workspace connections?
			var max_X = -1;
			var max_Y = -1;
			for (var j = 0; j < this.local_reactor.reactor_inputs.length; ++j) {
				if (this.local_reactor.reactor_inputs[j].cross_workspace_connection) {
					var config = this.local_reactor.reactor_inputs[j].source.config;
					max_X = Math.max(config.X, max_X);
					max_Y = Math.max(config.Y, max_Y);
				}
			}

			// If so, place the new icon so it doesn't hide them, otherwise place it relative to the sink reactor.
			if (max_X >= 0) {
				this.config.X = max_X + 10;
				this.config.Y = max_Y + 10;
			} else {
				var pwc = pion.widgets.CrossWorkspaceConnection;
				this.config.X = parseInt(this.local_reactor.config.X) - pwc.default_x_offset - pwc.icon_width;
				if (this.config.X >= 0) {
					this.config.Y = parseInt(this.local_reactor.config.Y) + (pwc.reactor_height - pwc.icon_height) / 2;
				} else {
					this.config.X = parseInt(this.local_reactor.config.X);
					this.config.Y = parseInt(this.local_reactor.config.Y) - pwc.default_y_offset - pwc.icon_height;
					if (this.config.Y < 0) {
						this.config.Y = parseInt(this.local_reactor.config.Y) + pwc.reactor_height + pwc.default_y_offset;
					}
				}
			}
		}
	}
);
