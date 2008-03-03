dojo.provide("plugins.reactors.Reactor");
dojo.require("dijit.Dialog");
dojo.require("dojo.dnd.Source");
dojo.require("dijit.form.Button");
dojo.require("dojox.grid.Grid");

dojo.declare("plugins.reactors.Reactor",
	[dijit._Widget],
	// [dijit._Widget, dijit._Templated], // TODO: make a template
	{
		constructor: function(args, new_div) {
			this.name = args.name;
			this.plugin = args.plugin;
			this.uuid = args.uuid;
		},
		postCreate: function(){
			this.inherited("postCreate", arguments); 
			console.debug('Reactor.postCreate: ', this.domNode);
			this.reactor_inputs = [];
			this.reactor_outputs = [];
			this.prev_events_in = 0;
			var reactor_target = new dojo.dnd.Target(this.domNode, {accept: ["connector"]});
			dojo.connect(reactor_target, "onDndDrop", handleDropOnReactor);

			this.name_div = document.createElement('div');
			this.name_div.innerHTML = this.name;
			dojo.addClass(this.name_div, 'name');
			this.domNode.appendChild(this.name_div);

			var _this = this;

			var run_button = new dijit.form.ToggleButton();
			var button_node = run_button.domNode;
			dojo.connect(button_node, 'click', function() {
				dojo.xhrPut({
					url: '/config/reactors/' + _this.uuid + (run_button.checked? '/start' : '/stop'),
					error: function(response, ioArgs) {
						console.error('HTTP status code: ', ioArgs.xhr.status);
						return response;
					}
				});
			});
			this.domNode.appendChild(run_button.domNode);

			this.ops_per_sec = document.createElement('span');
			dojo.addClass(this.ops_per_sec, 'ops_per_sec');
			this.ops_per_sec.innerHTML = '12345';
			this.domNode.appendChild(this.ops_per_sec);
			this.domNode.setAttribute("reactor_type", this.plugin);

			var store = pion.reactors.plugin_data_store;
			store.fetchItemByIdentity({
				identity: this.plugin,
				onItem: function(item) {
					_this.label = store.getValue(item, 'label');
					_this.category = store.getValue(item, 'category');

					if (_this.category != 'collection') {
						run_button.setChecked(true); // all reactors except collectors start out running
					}
				}
			});

			dojo.addClass(this.domNode, 'moveable');
			dojo.addClass(this.domNode, this.plugin);
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
		templateString: "",       // Necessary to keep Dijit from using templateString in dijit.Dialog
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.reactors.ReactorDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "reactors/ReactorDialog.html"),
		templateString: "",       // Necessary to keep Dijit from using templateString in dijit.Dialog
		widgetsInTemplate: true
	}
);
