dojo.provide("plugins.reactors.Reactor");
dojo.require("dijit.Dialog");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.form.Button");
dojo.require("dojox.grid.Grid");
dojo.require("pion.reactors");

dojo.declare("plugins.reactors.Reactor",
	[dijit._Widget],
	// [dijit._Widget, dijit._Templated], // TODO: make a template
	{
		postCreate: function(){
			this.inherited("postCreate", arguments); 
			//console.debug('Reactor.postCreate: ', this.domNode);
			this.special_config_elements = ['@id', 'options'];
			this.reactor_inputs = [];
			this.reactor_outputs = [];
			this.prev_events_in = 0;
			var reactor_target = new dojo.dnd.Target(this.domNode, {accept: ["connector"]});
			dojo.connect(reactor_target, "onDndDrop", pion.reactors.handleDropOnReactor);

			this.name_div = document.createElement('div');
			this.name_div.innerHTML = this.config.Name;
			dojo.addClass(this.name_div, 'name');
			this.domNode.appendChild(this.name_div);

			var _this = this;

			this.run_button = new dijit.form.ToggleButton();
			var button_node = this.run_button.domNode;
			dojo.connect(button_node, 'click', function() {
				dojo.xhrPut({
					url: '/config/reactors/' + _this.config['@id'] + (_this.run_button.checked? '/start' : '/stop'),
					error: pion.getXhrErrorHandler(dojo.xhrPut)
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
				this.run_button.setAttribute('checked', true); // all reactors except collectors start out running
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

			// Add a context menu for the new reactor.
			if (!firefox_on_mac) {
				var menu = new dijit.Menu({targetNodeIds: [this.domNode]});
				menu.addChild(new dijit.MenuItem({ label: "Edit reactor configuration", onClick: function(){pion.reactors.showReactorConfigDialog(_this);} }));
				menu.addChild(new dijit.MenuItem({ label: "Delete reactor", onClick: function(){pion.reactors.deleteReactorIfConfirmed(_this);} }));
			}
			
			dojo.connect(this.domNode, 'dblclick', function(event) {
				event.stopPropagation(); // so the workspace configuration dialog won't also pop up
				pion.reactors.showReactorConfigDialog(_this);
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
					console.debug('dialogFields[', tag, '] = ', this.config[tag]);
					this.put_data += '<' + tag + '>' + this.config[tag] + '</' + tag + '>';
				}
			}
			if (this._insertCustomData) {
				this._insertCustomData();
			}
			this.put_data += '</Reactor></PionConfig>';
			console.debug('put_data: ', this.put_data);

			dojo.rawXhrPut({
				url: '/config/reactors/' + this.config['@id'],
				contentType: "text/xml",
				handleAs: "xml",
				putData: this.put_data,
				load: function(response){
					console.debug('response: ', response);
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: this.put_data})
			});
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
		widgetsInTemplate: true,
		execute: function(dialogFields) {
			console.debug(dialogFields);
			console.debug('this.plugin = ', this.plugin);
			var workspace_box = pion.reactors.workspace_box;
			var dc = dojo.coords(workspace_box.node);
			var X = Math.floor(pion.reactors.last_x - dc.x);
			var Y = Math.floor(pion.reactors.last_y - dc.y);
			this.post_data = '<PionConfig><Reactor><Plugin>' + this.plugin 
						   + '</Plugin><Workspace>' + workspace_box.my_content_pane.title 
						   + '</Workspace><X>' + X + '</X><Y>' + Y + '</Y>';
			for (var tag in dialogFields) {
				console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
				this.post_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
			}
			if (this._insertCustomData) {
				this._insertCustomData(dialogFields);
			}
			this.post_data += '</Reactor></PionConfig>';
			console.debug('post_data: ', this.post_data);
			
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
					pion.reactors.reactors_by_id[config['@id']] = reactor;
					reactor.workspace = workspace_box;
					workspace_box.reactors.push(reactor);
				},
				error: pion.getXhrErrorHandler(
					dojo.rawXhrPost,
					{postData: this.post_data},
					function() {
						// Remove the dnd reactor.
						workspace_box.node.removeChild(workspace_box.node.lastChild);
					}
				)
			});
		}
	}
);

dojo.declare("plugins.reactors.ReactorDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/ReactorDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			setTimeout(function(){
				// ensures _position() gets called after this.domNode gets its final size
				_this._position();
			}, 200);
		},
		reactor: '',
		_position: function(){
			// copied from: http://trac.dojotoolkit.org/ticket/5286
			// summary: position modal dialog in center of screen
			
			if(dojo.hasClass(dojo.body(),"dojoMove")){ return; }
			var viewport = dijit.getViewport();
			var mb = dojo.marginBox(this.domNode);

			var style = this.domNode.style;
			style.left = Math.floor((viewport.l + (viewport.w - mb.w)/2)) + "px";
			
			// Change to avoid the dialog being outside the viewport
			var top = Math.floor((viewport.t + (viewport.h - mb.h)/2));
			
			// A standard margin is nice to have for layout reasons
			// I think it should be proportional to the page height
			var margin = Math.floor(viewport.h/30);
			
			// The top can't be less than viewport top
			if (top - margin < viewport.t)
			{
				top = viewport.t + margin;
			}
			
			// If the height of the box is the same or bigger than the viewport
			// it means that the box should be made scrollable and a bottom should be set
			if (mb.h + margin*2 >= viewport.h){
				style.overflow = "auto";
				// The bottom is margin - the scroll of the page
				style.bottom = (margin - viewport.t) + "px";
			}
			style.top = top + "px";
			viewport = dijit.getViewport();
			mb = dojo.marginBox(this.domNode);
		},
		execute: function(dialogFields) {
			dojo.mixin(this.reactor.config, dialogFields);
			this.reactor.name_div.innerHTML = dialogFields.Name;

			this.put_data = '<PionConfig><Reactor><Plugin>' + this.reactor.config.Plugin
						  + '</Plugin><Workspace>' + this.reactor.config.Workspace 
						  + '</Workspace><X>' + this.reactor.config.X + '</X><Y>' + this.reactor.config.Y + '</Y>';
			for (var tag in dialogFields) {
				if (dojo.indexOf(this.reactor.special_config_elements, tag) == -1) {
					console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
					this.put_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
				}
			}
			if (this._insertCustomData) {
				// dialogFields.options can and should be undefined for Reactors without dialog options.
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
