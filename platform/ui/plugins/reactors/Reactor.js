dojo.provide("plugins.reactors.Reactor");
dojo.require("dijit.Dialog");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.form.Button");
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
			this.name_div.innerHTML = pion.escapeXml(this.config.Name);
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

			// Add a context menu for the new reactor.
			var menu = new dijit.Menu({targetNodeIds: [this.domNode]});
			menu.addChild(new dijit.MenuItem({ label: "Edit reactor configuration", onClick: function(){pion.reactors.showReactorConfigDialog(_this);} }));
			menu.addChild(new dijit.MenuItem({ label: "Show XML", onClick: function(){pion.reactors.showXMLDialog(_this);} }));
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
		},
		_initOptions: function(config, option_defaults) {
			var store = pion.reactors.config_store;
			var _this = this;
			store.fetch({
				query: {'@id': config['@id']},
				onItem: function(item) {
					config.options = []; // used by pion.reactors.showReactorConfigDialog for checkboxes

					for (var option in option_defaults) {
						// Set option to default value.
						config[option] = option_defaults[option];

						// Override default if option present in the configuration.
						if (store.hasAttribute(item, option))
							config[option] = (store.getValue(item, option).toString() == 'true');

						// Add true options to list of checkboxes to check.
						if (config[option])
							config.options.push(option);
					}
				},
				onError: pion.handleFetchError
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
		changeWorkspace: function(new_workspace_name) {
			if (this.config.Workspace == new_workspace_name) {
				return;
			}
			this.config.Workspace = new_workspace_name;

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
							+ pion.makeXmlLeafElement('Workspace', workspace_box.my_content_pane.title)
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
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
		},
		reactor: '',
		execute: function(dialogFields) {
			dojo.mixin(this.reactor.config, dialogFields);
			this.reactor.name_div.innerHTML = pion.escapeXml(dialogFields.Name);

			this.put_data = '<PionConfig><Reactor>'
							+ pion.makeXmlLeafElement('Plugin', this.reactor.config.Plugin)
							+ pion.makeXmlLeafElement('Workspace', this.reactor.config.Workspace)
							+ '<X>' + this.reactor.config.X + '</X><Y>' + this.reactor.config.Y + '</Y>';
			for (var tag in dialogFields) {
				if (dojo.indexOf(this.reactor.special_config_elements, tag) == -1) {
					console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
					this.put_data += pion.makeXmlLeafElement(tag, dialogFields[tag]);
				}
			}
			if ('options' in dialogFields && plugins.reactors[this.reactor.config.Plugin].option_defaults) {
				for (var option in plugins.reactors[this.reactor.config.Plugin].option_defaults) {
					var option_val = (dojo.indexOf(dialogFields.options, option) != -1); // 'true' iff corresponding checkbox was checked
					this.put_data += '<' + option + '>' + option_val + '</' + option + '>';
					this.reactor.config[option] = option_val;
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
