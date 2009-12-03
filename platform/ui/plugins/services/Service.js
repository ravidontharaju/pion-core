dojo.provide("plugins.services.Service");
dojo.require("dijit.layout.BorderContainer");

dojo.declare("plugins.services.Service",
	[ dijit.layout.BorderContainer, dijit._Templated ],
	{
		postCreate: function() {
			this.inherited("postCreate", arguments);
			dijit.byId('main_stack_container').addChild(this, 0);
			pion.services.labels_by_tab_id[this.id] = this.title;
		},
		onSelect: function() {
			dijit.byId('main_stack_container').resize({h: this.height});
			if (! this.initialized) {
				this.initialized = true;
				this.init();
			}
		}
	}
);
