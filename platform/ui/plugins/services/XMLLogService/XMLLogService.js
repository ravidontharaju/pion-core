dojo.provide("plugins.services.XMLLogService");
dojo.require("plugins.services.Service");
dojo.require("pion._base");
dojo.require("pion.util.XMLQueryReadStore");
dojo.require("dijit.Tooltip");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.xml.parser");

dojo.declare("plugins.services.XMLLogService",
	[ dijit.layout.ContentPane, dijit._Templated, plugins.services.Service ],
	{
		templatePath: dojo.moduleUrl("plugins.services", "XMLLogService/XMLLogServiceTab.html"),
		widgetsInTemplate: true,
		dir: 'ltr',
		postCreate: function() {
			this.inherited("postCreate", arguments);
			this.alert_status = 'off';
			this.last_update_time = 0;
			this.last_fatal_error_dialog_time = 0;

			// Add 'this' after all existing tabs in the main stack, then save a reference to the corresponding tab button.
			// Note that main stack is rtl, so the rightmost tab has index 0.
			dijit.byId('main_stack_container').addChild(this, 0);
			var tab_buttons = dijit.byId('main_stack_container').tablist.getChildren();
			this.tab_button = tab_buttons[0].domNode;
			dojo.addClass(this.tab_button, 'log_service');
			plugins.services.num_rightmost_tabs_added = (plugins.services.num_rightmost_tabs_added || 0) + 1;

			// This needs to be here (instead of in init()) so that this.log_grid_node.offsetHeight will be ready when onSelect() calls this.getHeight().
			pion.loadCss(dojo.moduleUrl("plugins.services", "XMLLogService/XMLLogService.css"));
		},
		getHeight: function() {
			return this.containerNode.offsetHeight + 100;
		},
		init: function() {
			var _this = this;
			setInterval(function() {
				if (pion.current_page.id != _this.id) {
					dojo.xhrGet({
						url: _this.resource,
						preventCache: true,
						handleAs: 'xml',
						timeout: 5000,
						load: function(response, ioArgs) {
							_this.updateStatus(response);
							return response;
						},
						error: pion.handleXhrGetError
					});
				}
			}, 2000);
			setInterval(function() {
				if (_this.alert_status == 'flashing') {
					dojo.addClass(_this.tab_button, 'alert');
					var flash_on = dojo.hasClass(_this.tab_button, 'flash_on');
					dojo.removeClass(_this.tab_button, flash_on? 'flash_on' : 'flash_off');
					dojo.addClass(_this.tab_button, flash_on? 'flash_off' : 'flash_on');
				} else if (_this.alert_status == 'steady') {
					dojo.addClass(_this.tab_button, 'alert');
					dojo.removeClass(_this.tab_button, 'flash_on');
					dojo.removeClass(_this.tab_button, 'flash_off');
				} else {
					dojo.removeClass(_this.tab_button, 'alert');
					dojo.removeClass(_this.tab_button, 'flash_on');
					dojo.removeClass(_this.tab_button, 'flash_off');
				}
			}, 1000);

			this.log_xml_store = new pion.util.XMLQueryReadStore({
				url: this.resource,
				rootItem: 'Event',
				attributeMap: {'Event.id': '@id'},
				doClientPaging: true, // to avoid sending 'start' and 'count' in queries
				requestMethod: 'GET'
			});
			this.log_grid_layout = [{
				defaultCell: { editable: true, type: dojox.grid.cells._Widget },
				rows: [
					//{ field: 'id', name: 'ID', width: 10,
					//	formatter: pion.xmlCellFormatter },
					{ field: 'LogLevel', name: 'Severity', width: '55px' },
					{ field: 'Timestamp', name: 'Time', width: 11,
						formatter: pion.localDatetimeCellFormatter },
					{ field: 'LoggerName', name: 'Module', width: 10 },
					{ field: 'Message', name: 'Message', relWidth: 1 },
					{ name: 'Help', styles: 'text-align: center;', width: 4, editable: false, formatter: pion.makeSearchButton },
					{ name: 'Remove', styles: 'text-align: center;', width: 4, editable: false, formatter: pion.makeDeleteButton }
				]
			}];
			this.log_grid = new dojox.grid.DataGrid({
				store: this.log_xml_store,
				structure: this.log_grid_layout,
				singleClickEdit: true, // Without this, the column alignment tends to get screwed up.
				rowsPerPage: 20
			}, document.createElement('div'));
			while (this.log_grid_node.firstChild) {
				this.log_grid_node.removeChild(this.log_grid_node.firstChild);
			}
			this.log_grid_node.appendChild(this.log_grid.domNode);
			this.log_grid.startup();

			// Every time the grid is updated, update this.last_update_time and the alert status.
			this.log_xml_store._filterResponse = function(data) {
				dojo.forEach(data.getElementsByTagName('Timestamp'), function (node) {
					var timestamp = dojox.xml.parser.textContent(node);
					if (timestamp > _this.last_update_time)
						_this.last_update_time = timestamp;
				});

				_this.updateStatus(data);

				return data;
			}

			this.log_grid.connect(this.log_grid, 'onCellClick', function(e) {
				if (e.cell.name == 'Help') {
					var item = this.getItem(e.rowIndex);
					var message = _this.log_xml_store.getValue(item, 'Message').toString();
					var error_description = message.split(':')[0];

					// Handle special case where pion::net::HTTPServer::handleRequest() catches an exception.
					if (error_description == 'HTTP request handler') {
						error_description = message.split(':')[1];
					}

					var encoded_quoted_message = encodeURIComponent('"' + error_description + '"');
					window.open('http://pion.org/search/node/' + encoded_quoted_message + '%20type%3Akb');
				} else if (e.cell.name == 'Remove') {
					var item = this.getItem(e.rowIndex);
					var id = _this.log_xml_store.getValue(item, '@id');
					dojo.xhrDelete({
						url: _this.resource + '?ack=' + id,
						handleAs: 'xml',
						timeout: 5000,
						load: function(response, ioArgs) {
							_this.log_grid.filter();
							return response;
						},
						error: pion.getXhrErrorHandler(dojo.xhrDelete)
					});
				}
			});

			var showTooltip = function(e) {
				if (e.cell.name == 'Help') {
					dijit.showTooltip('Click to search Pion Knowledge Base for more information.', e.cellNode);
				} else if (e.cell.name == 'Remove') {
					dijit.showTooltip('Click to stop displaying this log entry.  (It will remain in the log file.)', e.cellNode);
				}
			}
			var hideTooltip = function(e) {
				dijit.hideTooltip(e.cellNode);
				dijit._masterTT._onDeck = null;
			}
			dojo.connect(this.log_grid, "onHeaderCellMouseOver", showTooltip);
			dojo.connect(this.log_grid, "onHeaderCellMouseOut", hideTooltip);
		},
		updateStatus: function(response) {
			var new_fatal = false;
			var new_error = false;
			var num_new_errors_and_fatals = 0;
			var num_errors_and_fatals = 0;

			var _this = this;
			var events = response.getElementsByTagName('Event');
			dojo.forEach(events, function(event) {
				var node = event.getElementsByTagName('LogLevel')[0];
				var type = dojox.xml.parser.textContent(node);
				if (type == 'FATAL') {
					num_errors_and_fatals++;
					node = event.getElementsByTagName('Timestamp')[0];
					var timestamp = dojox.xml.parser.textContent(node);
					if (timestamp > _this.last_update_time) {
						new_fatal = true;
						num_new_errors_and_fatals++;

						if (! _this.fatal_error_dialog_open) {
							var now = new Date();
							var one_minute_ago = now.getTime() - 1000 * 60;
							if (_this.last_fatal_error_dialog_time < one_minute_ago) {
								_this.last_fatal_error_dialog_time = now.getTime();
								node = event.getElementsByTagName('LoggerName')[0];
								var logger = dojox.xml.parser.textContent(node);
								var content = 'A fatal error has been reported by ' + logger + '.  Pion may now be in an unstable or unusable state.';
								var dialog = new dijit.Dialog({title: 'Fatal Error', style: 'width: 400px'});
								dialog.attr('content', content);
								dialog.show();
								_this.fatal_error_dialog_open = true;
								dialog.connect(dialog, 'hide', function () {
									_this.fatal_error_dialog_open = false;
								});
							}
						}

						// A little hack to deal with the fact that the grid doesn't render properly if there's a dialog open. 
						_this.connect(dialog, 'onCancel', function() { this.log_grid.resize(); });
					}
				}
				else if (type == 'ERROR') {
					num_errors_and_fatals++;
					node = event.getElementsByTagName('Timestamp')[0];
					var timestamp = dojox.xml.parser.textContent(node);
					if (timestamp > _this.last_update_time) {
						new_error = true;
						num_new_errors_and_fatals++;
					}
				}
			});

			if (new_fatal) {
				_this.alert_status = 'steady'; // not 'flashing', because at this point, the XMLLogService tab is selected.
				var label = (num_errors_and_fatals == 1)? '1 Error' : num_errors_and_fatals + ' Errors';
				dijit.byId('main_stack_container').selectChild(_this);
			} else if (new_error) {
				_this.alert_status = 'flashing';
				var label = (num_new_errors_and_fatals == 1)? '1 New Error' : num_new_errors_and_fatals + ' New Errors';

				// Handle the special case where the XMLLogService tab has never been selected (since loading the UI):
				// we still want the label to flash, but the errors aren't necessarily 'new'.
				if (this.last_update_time == 0) {
					label = (num_new_errors_and_fatals == 1)? '1 Error' : num_new_errors_and_fatals + ' Errors';
				}
			} else if (num_errors_and_fatals > 0) {
				_this.alert_status = 'steady';
				var label = (num_errors_and_fatals == 1)? '1 Error' : num_errors_and_fatals + ' Errors';
			} else {
				var label = 'Log';
				_this.alert_status = 'off';
			}
			_this.controlButton.containerNode.innerHTML = label;
		},
		onSelect: function() {
			this.inherited('onSelect', arguments);
			this.log_grid.filter();

			if (this.alert_status == 'flashing')
				this.alert_status = 'steady';

			this.log_grid.resize(); // Straightens up the button columns.
		},
		initSessionsGridLayout: function(col_set) {
			var session_query_type_id = this.search_form.attr('value').SessionQueryType;
			this.updateSessionsGridLayout(session_query_type_id, col_set);
		},
		removeAll: function() {
			var _this = this;
			dojo.xhrDelete({
				url: this.resource + '?ack=*',
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					_this.log_grid.filter();
					return response;
				},
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
			});
		}
	}
);

plugins.services.XMLLogService.label = 'Log';

plugins.services.XMLLogService.tab_id = 'log_service_tab';

plugins.services.XMLLogService.requiresPermission = function(service) {
	service.permission_layout = {
		top_level_checkbox: 'Log Service'
	}
	return true;
}
