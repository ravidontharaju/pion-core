dojo.provide("plugins.services.MonitorService");
dojo.require("plugins.services.Service");
dojo.require("pion._base");
dojo.require("pion.util.XMLQueryReadStore");
dojo.require("pion.terms");
dojo.require("pion.reactors");
dojo.require("dijit.Tooltip");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.CheckBox");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.layout.FloatingPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.xml.parser");

dojo.declare("plugins.services.MonitorService",
	[ plugins.services.Service ],
	{
		constructor: function(kwargs) {
			var _this = this;
			dojo.subscribe("AddReactor", function(reactor) {
				reactor.context_menu.addChild(new dijit.MenuItem({ label: "Monitor events", onClick: function(){_this.startMonitor(reactor);} }));
			});
		},
		init: function() {
			pion.loadCss(dojo.moduleUrl("plugins.services", "MonitorService/MonitorService.css"));
			pion.loadCss(dojo.moduleUrl("dojox", "layout/resources/FloatingPane.css"));
			pion.loadCss(dojo.moduleUrl("dojox", "layout/resources/ResizeHandle.css"));
		},
		startMonitor: function(reactor) {
			if (! this.initialized) {
				this.init();
				this.initialized = true;
			}

			var _this = this;
			dojo.xhrGet({
				url: _this.resource + '/start/' + reactor.config['@id'] + '?opt=in',
				preventCache: true,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					var slot_node = response.getElementsByTagName('MonitorService')[0];
					var slot = dojox.xml.parser.textContent(slot_node);
					_this.makeFloatingPane(slot, reactor);
					return response;
				},
				error: pion.handleXhrGetError
			});
		},
		makeFloatingPane: function(slot, reactor) {
			var node = document.createElement('div');
			dojo.body().appendChild(node);
			var floating_pane = new plugins.services.MonitorServiceFloatingPane({
				resource: this.resource,
				slot: slot,
				title: 'Events for Reactor <i>' + reactor.config.Name + '</i>',
				dockable: true,
				maxable: false,
				closable: true,
				resizable: true
			}, node);
			floating_pane.domNode.style.top = '30px';
			floating_pane.domNode.style.left = '30px';
			var category = pion.reactors.categories[reactor.config.Plugin];
			dojo.addClass(floating_pane.domNode, category);
			floating_pane.startup();
			floating_pane.bringToTop();
		}
	}
);

plugins.services.MonitorService.label = 'Monitor';

//plugins.services.MonitorService.requiresPermission = function(service) {
//	service.permission_layout = {};
//	return true;
//}

dojo.declare("plugins.services.MonitorServiceFloatingPane",
	[ dojox.layout.FloatingPane ],
	{
		templatePath: dojo.moduleUrl("plugins.services", "MonitorService/MonitorServiceFloatingPane.html"),
		widgetsInTemplate: true,
		postMixInProperties: function(){
			this.inherited('postMixInProperties', arguments);

			// This is needed to work correctly when using dijit.FloatingPane as built into pion-dojo.js 
			// (since plugins.reactors.MonitorServiceFloatingPane is not supposed to be built into pion-dojo.js.)
			this.templateString = "";
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
			this.no_status_response_seen = true;
			this.no_events_seen = true;

			this.status_url = this.resource + '/status/' + this.slot;

			this.event_xml_store = new pion.util.XMLQueryReadStore({
				url: this.status_url,
				rootItem: 'Event',
				doClientPaging: true, // to avoid sending 'start' and 'count' in queries
				requestMethod: 'GET'
			});
			this.event_xml_store._filterResponse = dojo.hitch(this, 'updateLayout')

			this.event_grid = new dojox.grid.DataGrid({
				store: this.event_xml_store,

				// TODO: This is temporary, until I figure out a better way.
				// Note that event_buffer_size in the template is currently constrained to <= 1000, to avoid exceeding rowsPerPage.
				rowsPerPage: 1000,

				onFetchError: pion.handleFetchError,
				autoWidth: true,
				autoHeight: true
			}, document.createElement('div'));
			this.event_grid_node.appendChild(this.event_grid.domNode);
			this.event_grid.startup();

			var showTooltip = function(e) {
				var msg = e.cell.id;
				if (pion.terms.term_comments_by_id[e.cell.id]) {
					msg += '<br/><i>' + pion.terms.term_comments_by_id[e.cell.id] + '</i>';
				}
				dijit.showTooltip(msg, e.cellNode);
			}
			var hideTooltip = function(e) {
				dijit.hideTooltip(e.cellNode);
				dijit._masterTT._onDeck = null;
			}
			dojo.connect(this.event_grid, "onHeaderCellMouseOver", showTooltip);
			dojo.connect(this.event_grid, "onHeaderCellMouseOut", hideTooltip);

			this.update_interval = 5;
			this.event_buffer_size = 15;
			this.settings_form.attr('value', {
				update_interval: this.update_interval,
				event_buffer_size: this.event_buffer_size
			});
			this.startPolling({events: this.event_buffer_size});
		},
		startPolling: function(initial_query_params) {
			this.poll(initial_query_params);

			// TODO: this helped in some situations where the grid got screwed up.
			// (Note that pausing and resuming is required to reach this point.)
			// However, it might not be needed if the rowsPerPage issue is fixed.  
			this.event_grid.update();

			var _this = this;
			this.interval_handle = window.setInterval(function() {
				_this.poll();
			}, this.update_interval * 1000);
		},
		poll: function(initial_query_params) {
			var query_object = initial_query_params? initial_query_params : {};

			if (this.no_events_seen) {
				this.event_grid.filter(query_object);
				return;
			}

			var _this = this;

			// set query.filter and query.unfilter, based on changes in the Event Types selected
			var event_type_check_box_group_value = this.event_type_form.attr('value').event_type_check_box_group;
			var newly_unchecked_types = dojo.filter(this.prev_event_type_check_box_group_value, function(type) {
				return dojo.indexOf(event_type_check_box_group_value, type) == -1;
			});
			var newly_checked_types = dojo.filter(event_type_check_box_group_value, function(type) {
				return dojo.indexOf(_this.prev_event_type_check_box_group_value, type) == -1;
			});
			delete query_object.filter;
			if (newly_unchecked_types.length > 0)
				query_object.filter = newly_unchecked_types.join(',');
			delete query_object.unfilter;
			if (newly_checked_types.length > 0)
				query_object.unfilter = newly_checked_types.join(',');

			this.prev_event_type_check_box_group_value = event_type_check_box_group_value;

			// set query.show and query.unshow, based on changes in the columns (Terms) selected
			var column_check_box_group_value = this.column_form.attr('value').column_check_box_group;
			var newly_checked_columns = dojo.filter(column_check_box_group_value, function(type) {
				return dojo.indexOf(_this.prev_column_check_box_group_value, type) == -1;
			});
			var newly_unchecked_columns = dojo.filter(this.prev_column_check_box_group_value, function(type) {
				return dojo.indexOf(column_check_box_group_value, type) == -1;
			});
			delete query_object.show;
			if (newly_checked_columns.length > 0)
				query_object.show = newly_checked_columns.join(',');
			delete query_object.unshow;
			if (newly_unchecked_columns.length > 0)
				query_object.unshow = newly_unchecked_columns.join(',');

			this.prev_column_check_box_group_value = column_check_box_group_value;

			// Send any query parameters that the user changed since the last query.
			var settings_form_data = this.settings_form.attr('value');
			if (settings_form_data.truncation_length != this.truncation_length) {
				this.truncation_length = settings_form_data.truncation_length;
				query_object.truncate = this.truncation_length;
			}
			if (settings_form_data.event_buffer_size != this.event_buffer_size) {
				this.event_buffer_size = settings_form_data.event_buffer_size;
				query_object.events = this.event_buffer_size;
			}

			this.event_grid.filter(query_object);
		},
		changeUpdateInterval: function(val) {
			if (this.update_interval == val)
				return;
			this.update_interval = val;
			window.clearInterval(this.interval_handle);
			this.startPolling();
		},
		my_hide: function(e) {
			// Note that using hide instead of my_hide in MonitorServiceFloatingPane.html doesn't work right, because the specified
			// function gets called with an event argument, and FloatingPane.hide() thinks any argument it gets is a callback function.
			this.hide();
			window.clearInterval(this.interval_handle);
		},
		togglePolling: function(e) {
			if (e.target.checked) {
				this.startPolling();
			} else {
				window.clearInterval(this.interval_handle);
			}
		},
		updateLayout: function(data) {
			if (this.no_status_response_seen) {
				this.no_status_response_seen = false;
				var truncating_node = data.getElementsByTagName('Truncating')[0];
				this.truncation_length = dojox.xml.parser.textContent(truncating_node);
				this.settings_form.attr('value', {
					truncation_length: this.truncation_length
				});
			}

			var num_events = data.getElementsByTagName('Event').length;
			if (num_events == 0)
				return data;
			this.events_message.innerHTML = num_events == 1? '1 Event in buffer.' : num_events + ' Events in buffer.';
			if (this.no_events_seen) {
				this.no_events_seen = false;

				// Add show Event Type checkbox, with special behavior since Events will always contain <C0>
				this.event_type_check_box.onClick = function(e) {
					_this.event_grid.layout.setColumnVisibility(0, e.target.checked);
				}

				this.event_type_object = {};
				this.event_type_check_box_group_value = [];
				this.column_object = {EventType: this.event_type_check_box};

				this.event_type_block.domNode.style.visibility = 'visible';
				this.column_block.domNode.style.visibility = 'visible';
				this.prev_event_type_check_box_group_value = [];
				this.prev_column_check_box_group_value = [];
			}

			var _this = this;
			var event_types_seen_node = data.getElementsByTagName('EventsSeen')[0];
			var event_types_seen = dojox.xml.parser.textContent(event_types_seen_node).split(',');
			dojo.forEach(event_types_seen, function(event_type) {
				if (! (event_type in _this.event_type_object)) {
					var check_box_div = document.createElement('div');
					_this.event_type_form.domNode.appendChild(check_box_div);
					_this.event_type_object[event_type] = new dijit.form.CheckBox({
						name: 'event_type_check_box_group',
						value: event_type,
						checked: true
					}, check_box_div);
					var label_div = dojo.create('label', {innerHTML: event_type});
					_this.event_type_form.domNode.appendChild(label_div);
					_this.event_type_form.domNode.appendChild(dojo.create('br'));
					_this.prev_event_type_check_box_group_value.push(event_type);
				}
			});

			var terms_seen_node = data.getElementsByTagName('TermsSeen')[0];
			var terms_seen_string = dojox.xml.parser.textContent(terms_seen_node);
			if (terms_seen_string != this.prev_terms_seen_string) {
				this.prev_terms_seen_string = terms_seen_string;

				// Remove all term checkboxes.
				while (this.column_form.domNode.firstChild) {
					this.column_form.domNode.removeChild(this.column_form.domNode.firstChild);
				}

				// Sort the new list of terms and add checkboxes for them.
				var terms_seen = terms_seen_string.split(',');
				terms_seen.sort();
				this.column_object = {EventType: this.event_type_check_box};
				dojo.forEach(terms_seen, function(term) {
					var check_box_div = document.createElement('div');
					_this.column_form.domNode.appendChild(check_box_div);
					_this.column_object[term] = new dijit.form.CheckBox({
						name: 'column_check_box_group',
						value: term
					}, check_box_div);
					var label_div = dojo.create('label', {innerHTML: term});
					_this.column_form.domNode.appendChild(label_div);
					_this.column_form.domNode.appendChild(dojo.create('br'));
				});

				// Restore the checkmarks.
				this.column_form.attr('value', {column_check_box_group: this.prev_column_check_box_group_value});
			}

			// Done changing the sidebar, so update the layout.
			this.left_sidebar.resize();

			var col_tags = {};
			var col_set = data.getElementsByTagName('ColSet')[0];
			dojo.forEach(col_set.childNodes, function(node) {
				if (node.nodeType == 1 /* ELEMENT_NODE */) {
					var term = node.firstChild.nodeValue;
					col_tags[term] = node.tagName;
				}
			});
			var changed = false;
			if (this.prev_col_tags) {
				for (var key in col_tags) {
					if (col_tags[key] != this.prev_col_tags[key])
						changed = true;
				}
				for (var key in this.prev_col_tags) {
					if (col_tags[key] != this.prev_col_tags[key])
						changed = true;
				}
			} else {
				changed = true;
			}
			this.prev_col_tags = col_tags;

			if (changed) {
				this.event_grid_layout = {rows: []};
				for (var key in col_tags) {
					var name = (key == 'Event Type')? key : key.split('#')[1];
					var row = { field: col_tags[key], name: name, id: 'urn:vocab:' + key, styles: '', width: 12 };
					this.event_grid_layout.rows.push(row);
				}
				this.event_grid_layout.rows.sort(function(a, b) {
					if (a.name == 'Event Type')
						return -1;
					return a.id < b.id? -1 : 1;
				});
				this.event_grid.attr("structure", this.event_grid_layout);
				this.event_grid.layout.setColumnVisibility(0, this.event_type_check_box.checked);
			}

			var event_counter_node = data.getElementsByTagName('EventCounter')[0];
			var event_count = dojox.xml.parser.textContent(event_counter_node);
			if (event_count != this.prev_event_count) {
				var _this = this;
				setTimeout(function() {
					// This sets the focus to the last row, causing the grid to scroll to the bottom (so the user can see the newly arrived events).
					_this.event_grid.focus.setFocusIndex(_this.event_grid.rowCount - 1, 0);

					// However, we don't want to leave the focus there, because then the grid will keep scrolling to 
					// the last row even if the user scrolls away, until they focus somewhere else (e.g. by clicking in a cell).
					// The following makes nothing have the focus.
					_this.event_grid.focus.setFocusIndex(-1, 0);
				}, 1000);
			}
			this.prev_event_count = event_count;

			this.events_div.style.visibility = 'visible';

			return data;
		}
	}
);
