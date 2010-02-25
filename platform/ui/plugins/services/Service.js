dojo.provide("plugins.services.Service");
dojo.require("pion.services");
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

				// Get the names from the name=value pairs in the query of the URL and look for 'id'.
				var query = window.location.search.substring(1);
				var names = dojo.map(query.split('&'), function(piece) { return piece.split('=')[0]; });
				var idx = dojo.indexOf(names, 'id');

				if (idx == -1) {
					// No 'id' found in query, so ignore it.
					this.init();
				} else {
					// Id found: what value does it have?
					var pairs = dojo.map(query.split('&'), function(piece) { return piece.split('='); });
					var value_of_id = pairs[idx][1];

					// If it's the id of this Service, then send the query info in a callback, else ignore it.
					if (value_of_id == this.id) {
						var _this = this;
						this.init().addCallback(function() { _this.handleQueryFromUrl(names, pairs); });
					} else {
						this.init();
					}
				}
			}
		}
	}
);
