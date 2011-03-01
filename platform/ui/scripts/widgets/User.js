dojo.provide("pion.widgets.User");
dojo.require("pion.users");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");

dojo.declare("pion.widgets.UserInitDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("pion", "widgets/UserInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true
	}
);

dojo.declare("pion.widgets.UserPane",
	[dijit.layout.ContentPane, dijit._Templated],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/UserPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited('postCreate', arguments);
			this.special_config_elements = ['@id', 'tab_check_boxes', 'workspace_check_box_group'];
			var _this = this;
			this.admin_check_box.onClick = function(e) {
				_this._onAdminCheckBoxChanged(e.target.checked);
				_this.form.attr('value', _this.config);
			}
			this._initReactorsCheckBoxes();
			this._initServicesCheckBoxes();
			dojo.query('input', this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
		},
		_onAdminCheckBoxChanged: function(checked) {
			this.config.tab_check_boxes = checked? ['Admin', 'Vocabularies', 'Codecs', 'Databases', 'Protocols'] : [];

			this._onReactorsUnrestrictedCheckBoxChanged(checked);
			this.reactors_unrestricted_check_box.attr('disabled', checked);

			this.vocabularies_check_box.attr('disabled', checked);
			this.codecs_check_box.attr('disabled', checked);
			this.databases_check_box.attr('disabled', checked);
			this.protocols_check_box.attr('disabled', checked);

			var _this = this;
			dojo.forEach(pion.services.restrictable_services, function(service) {
				var main_check_box = _this[service.plugin + '_main_check_box'];
				var unrestricted_check_box = _this[service.plugin + '_unrestricted_check_box'];
				if (main_check_box) {
					_this._onMainServiceCheckBoxChanged(checked, service);
					main_check_box.attr('disabled', checked);

					// disable all option check boxes for this service (since either admin is checked or main checkbox is unchecked)
					if (unrestricted_check_box)
						unrestricted_check_box.attr('disabled', true);
					var option_obj = _this[service.plugin + '_option_obj'];
					for (key in option_obj) {
						dojo.forEach(option_obj[key].check_boxes, function(check_box) {
							check_box.attr('disabled', true);
						});
					}
				} else if (unrestricted_check_box) {
					_this._onServiceUnrestrictedCheckBoxChanged(checked, service);
					unrestricted_check_box.attr('disabled', checked);
				} else {
					// if checked=true, check and disable all option check boxes for this service, else uncheck and enable them.
					var option_obj = _this[service.plugin + '_option_obj'];
					for (key in option_obj) {
						dojo.forEach(option_obj[key].check_boxes, function(check_box) {
							check_box.attr('disabled', checked);
						});
						_this.config[service.plugin + '_' + key + '_check_boxes'] = checked? option_obj[key].values : [];
					}
				}
			});
		},
		_initReactorsCheckBoxes: function() {
			this.reactors_unrestricted_check_box.onClick = function(e) {
				_this._onReactorsUnrestrictedCheckBoxChanged(e.target.checked);
				_this.form.attr('value', _this.config);
			}
			var _this = this;
			this.workspace_check_boxes = [];
			dojo.xhrGet({
				url: '/config/workspaces',
				preventCache: true,
				handleAs: 'xml',
				timeout: 1000,
				load: function(response, ioArgs) {
					var workspaces = response.getElementsByTagName('Workspace');
					dojo.forEach(workspaces, function(workspace) {
						var id = workspace.getAttribute('id');
						var name = dojox.xml.parser.textContent(workspace);
						var check_box_div = document.createElement('div');
						_this.reactors_unrestricted.appendChild(check_box_div);
						_this.workspace_check_boxes.push(new dijit.form.CheckBox({
							name: 'workspace_check_box_group',
							value: id,
							onClick: function() { _this.config = _this.form.attr('value'); }
						}, check_box_div));
						var label_div = dojo.create('label', {innerHTML: name});
						_this.reactors_unrestricted.appendChild(label_div);
						_this.reactors_unrestricted.appendChild(dojo.create('br'));
					});
				},
				error: pion.handleXhrGetError
			});
		},
		_setCheckBoxInConfig: function(check_box_group, value, checked) {
			if (checked)
				this.config[check_box_group].push(value);
			else
				this.config[check_box_group] = dojo.filter(this.config[check_box_group], function(v) { return v != value; });
		},
		_onReactorsUnrestrictedCheckBoxChanged: function(checked) {
			this.config.workspace_check_box_group = checked? ['Unrestricted'] : [];
			dojo.forEach(this.workspace_check_boxes, function(check_box) {
				check_box.attr('disabled', checked);
			});
		},
		_initServicesCheckBoxes: function() {
			var _this = this;
			dojo.forEach(pion.services.restrictable_services, function(service) {
				service.permission_subtypes = [];
				for (key in service.permission_layout) {
					if (key != 'Unrestricted' && key != 'top_level_checkbox' && key != 'top_level_label')
						service.permission_subtypes.push(key);
				}
				var check_box_group = service.plugin + '_check_boxes';
				_this.special_config_elements.push(check_box_group);
				var check_box_div = document.createElement('div');
				_this.service_permissions.appendChild(check_box_div);

				if ('top_level_checkbox' in service.permission_layout) {
					var main_check_box = new dijit.form.CheckBox({name: check_box_group, value: service.plugin}, check_box_div);
					main_check_box.onClick = function(e) {
						_this._onMainServiceCheckBoxChanged(e.target.checked, service);
						_this.form.attr('value', _this.config);
					}
					_this[service.plugin + '_main_check_box'] = main_check_box;
					var label_div = dojo.create('label', {innerHTML: service.permission_layout.top_level_checkbox});
				} else {
					var label = service.permission_layout.top_level_label? service.permission_layout.top_level_label : service.plugin;
					var label_div = dojo.create('label', {innerHTML: label});
					dojo.addClass(label_div, 'group_label');
				}
				_this.service_permissions.appendChild(label_div);
				_this.service_permissions.appendChild(dojo.create('br'));

				if ('Unrestricted' in service.permission_layout) {
					var check_box_div = document.createElement('div');
					var wrapper_div = document.createElement('div');
					dojo.addClass(wrapper_div, 'single_indent');
					_this.service_permissions.appendChild(wrapper_div);
					wrapper_div.appendChild(check_box_div);
					var unrestricted_check_box = new dijit.form.CheckBox({name: check_box_group, value: 'Unrestricted'}, check_box_div);
					unrestricted_check_box.onClick = function(e) {
						_this._onServiceUnrestrictedCheckBoxChanged(e.target.checked, service);
						_this.form.attr('value', _this.config);
					}
					_this[service.plugin + '_unrestricted_check_box'] = unrestricted_check_box;
					var label_div = dojo.create('label', {innerHTML: service.permission_layout.Unrestricted});
					wrapper_div.appendChild(label_div);
					wrapper_div.appendChild(dojo.create('br'));
				}

				var option_obj = {};
				dojo.forEach(service.permission_subtypes, function(key) {
					option_obj[key] = { check_boxes: [], values: [] };
					var check_box_group = service.plugin + '_' + key + '_check_boxes';
					_this.special_config_elements.push(check_box_group);
					dojo.forEach(service.permission_layout[key], function(option) {
						var check_box_div = document.createElement('div');
						var wrapper_div = document.createElement('div');
						dojo.addClass(wrapper_div, 'single_indent');
						_this.service_permissions.appendChild(wrapper_div);
						wrapper_div.appendChild(check_box_div);
						option_obj[key].values.push(option.value);
						option_obj[key].check_boxes.push(new dijit.form.CheckBox({
							name: check_box_group,
							value: option.value,
							onClick: function() { _this.config = _this.form.attr('value'); }
						}, check_box_div));
						var label_div = dojo.create('label', {innerHTML: option.label});
						wrapper_div.appendChild(label_div);
						wrapper_div.appendChild(dojo.create('br'));
					});
				});
				_this[service.plugin + '_option_obj'] = option_obj;
			});
		},
		_onMainServiceCheckBoxChanged: function(checked, service) {
			var check_box_group = service.plugin + '_check_boxes';
			this.config[check_box_group] = checked? [ service.plugin ] : [];
			var option_obj = this[service.plugin + '_option_obj'];
			if ('Unrestricted' in service.permission_layout) {
				this._onServiceUnrestrictedCheckBoxChanged(checked, service);
				var unrestricted_check_box = this[service.plugin + '_unrestricted_check_box'];
				unrestricted_check_box.attr('disabled', ! checked);

				// Disable all option check boxes for this service.
				for (key in option_obj) {
					dojo.forEach(option_obj[key].check_boxes, function(check_box) {
						check_box.attr('disabled', true);
					});
				}
			} else {
				// If checked=true, check and enable all option check boxes for this service, else uncheck and disable them.
				for (key in option_obj) {
					dojo.forEach(option_obj[key].check_boxes, function(check_box) {
						check_box.attr('disabled', ! checked);
					});
					this.config[service.plugin + '_' + key + '_check_boxes'] = checked? option_obj[key].values : [];
				}
			}
		},
		_onServiceUnrestrictedCheckBoxChanged: function(checked, service) {
			var check_box_group = service.plugin + '_check_boxes';
			if (! (check_box_group in this.config))
				this.config[check_box_group] = [];
			this._setCheckBoxInConfig(check_box_group, 'Unrestricted', checked);

			// Uncheck all option check boxes for this service.
			// Disable them iff checked=true.
			var option_obj = this[service.plugin + '_option_obj'];
			for (key in option_obj) {
				this.config[service.plugin + '_' + key + '_check_boxes'] = [];
				dojo.forEach(option_obj[key].check_boxes, function(check_box) {
					check_box.attr('disabled', checked);
				});
			}
		},
		getHeight: function() {
			return this.pane_end.offsetTop;
		},
		populateFromConfigItem: function(item) {
			var store = pion.users.config_store;
			this.config = {};
			var _this = this;
			dojo.forEach(store.getAttributes(item), function(attr) {
				if (attr != 'Permission' && attr != 'tagName' && attr != 'childNodes') {
					_this.config[attr] = store.getValue(item, attr).toString();
				}
			});
			this.config.tab_check_boxes = [];
			var is_admin = dojo.some(store.getValues(item, 'Permission'), function(p_item) {
				return store.hasAttribute(p_item, '@type') && store.getValue(p_item, '@type') == 'Admin';
			});
			if (is_admin) {
				this._onAdminCheckBoxChanged(true);
			} else {
				this._onAdminCheckBoxChanged(false);
				dojo.forEach(store.getValues(item, 'Permission'), function(p_item) {
					if (store.hasAttribute(p_item, '@type')) {
						var permission_type = store.getValue(p_item, '@type');
						if (permission_type == 'Reactors') {
							if (store.hasAttribute(p_item, 'Unrestricted') && store.getValue(p_item, 'Unrestricted') == 'true') {
								_this._onReactorsUnrestrictedCheckBoxChanged(true);
							} else {
								_this._onReactorsUnrestrictedCheckBoxChanged(false);
								var values = store.getValues(p_item, 'Workspace'); // Note that this could be empty, if reactors.xml was edited by hand.
								_this.config.workspace_check_box_group = dojo.map(values, function(v) {return v.toString();});
							}
						} else if (dojo.indexOf(['Vocabularies', 'Codecs', 'Databases', 'Protocols'], permission_type) != -1) {
							_this.config.tab_check_boxes.push(permission_type);
						} else {
							// Try to find a service corresponding to permission_type.  
							var matches = dojo.filter(pion.services.restrictable_services, function(service) { return service.plugin == permission_type; });
							if (matches.length == 0) {
								// Unknown Permission type: ignore it.
							} else {
								service = matches[0];
								if ('top_level_checkbox' in service.permission_layout) {
									_this._onMainServiceCheckBoxChanged(true, service);
								}
								var unrestricted = false;
								if (store.hasAttribute(p_item, 'Unrestricted')) {
									unrestricted = store.getValue(p_item, 'Unrestricted') == 'true';
								}
								if ('Unrestricted' in service.permission_layout) {
									_this._onServiceUnrestrictedCheckBoxChanged(unrestricted, service);
								}
								if (! unrestricted) {
									dojo.forEach(service.permission_subtypes, function(key) {
										var values = store.getValues(p_item, key);
										check_box_group = service.plugin + '_' + key + '_check_boxes';
										_this.config[check_box_group] = dojo.map(values, function(v) {return v.toString();});
									});
								}
							}
						}
					}
				});
			}
			this.form.attr('value', this.config);

			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		save: function() {
			var config = this.form.attr('value');

			if (this.uuid == pion.last_logged_in_user && dojo.indexOf(config.tab_check_boxes, 'Admin') == -1) {
				pion.doDeleteConfirmationDialog('You are about to delete your own permission to make further changes to your own configuration.  Proceed?',
												dojo.hitch(this, this.doSave));
			} else if (! dojo.some(dojo.query('input[type=checkbox]', this.form.domNode), function(n) { return n.checked; })) {
				pion.doDeleteConfirmationDialog('You are about to delete all permissions for user "' + this.uuid + '".  Proceed?',
												dojo.hitch(this, this.doSave));
			}
			else
				this.doSave();
		},
		doSave: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			var config = this.form.attr('value');
			var put_data = '<PionConfig><User>';
			for (var tag in config) {
				if (dojo.indexOf(this.special_config_elements, tag) == -1) {
					put_data += pion.makeXmlLeafElement(tag, config[tag]);
				}
			}
			if (dojo.indexOf(config.tab_check_boxes, 'Admin') != -1) {
				put_data += '<Permission type="Admin" />';
			} else {
				dojo.forEach(config.tab_check_boxes, function(tab_id) {
					put_data += '<Permission type="' + tab_id + '" />';
				});
				if (config.workspace_check_box_group.length > 0) {
					put_data += '<Permission type="Reactors">';
					if (dojo.indexOf(config.workspace_check_box_group, 'Unrestricted') != -1) {
						put_data += '<Unrestricted>true</Unrestricted>';
					} else {
						dojo.forEach(config.workspace_check_box_group, function(workspace_id) {
							put_data += '<Workspace>' + workspace_id + '</Workspace>';
						});
					}
					put_data += '</Permission>';
				}
				dojo.forEach(pion.services.restrictable_services, function(service) {
					var check_box_group = service.plugin + '_check_boxes';
					var check_box_array = config[check_box_group] || [];
					var service_has_something_selected = (check_box_array.length > 0) || dojo.some(service.permission_subtypes, function(key) {
						var subtype_check_box_group = service.plugin + '_' + key + '_check_boxes';
						var subtype_check_box_array = config[subtype_check_box_group] || [];
						return subtype_check_box_array.length > 0;
					});
					if (service_has_something_selected) {
						put_data += '<Permission type="' + service.plugin + '">';
						if (dojo.indexOf(check_box_array, 'Unrestricted') != -1) {
							put_data += '<Unrestricted>true</Unrestricted>';
						} else {
							dojo.forEach(service.permission_subtypes, function(key) {
								var subtype_check_box_group = service.plugin + '_' + key + '_check_boxes';
								var subtype_check_box_array = config[subtype_check_box_group] || [];
								dojo.forEach(subtype_check_box_array, function(option_value) {
									put_data += '<' + key + '>' + option_value + '</' + key + '>';
								});
							});
						}
						put_data += '</Permission>';
					}
				});
			}
			put_data += '</User></PionConfig>';
			_this = this;
			dojo.rawXhrPut({
				url: '/config/users/' + this.uuid,
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					// If the user just removed their own Admin permission, reload.
					if (_this.uuid == pion.last_logged_in_user && dojo.indexOf(config.tab_check_boxes, 'Admin') == -1) {
						location.replace('/');
					}

					// Yes, this is redundant, but unfortunately, 'response' is not an item.
					pion.users.config_store.fetch({
						query: {'@id': _this.uuid},
						onItem: function(item) {
							_this.config_item = item;
							_this.populateFromConfigItem(item);
						},
						onError: pion.handleFetchError
					});
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: put_data})
			});
		},
		cancel: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.populateFromConfigItem(this.config_item);
		},
		delete2: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete2: selected user is ', this.title);
			_this = this;
			dojo.xhrDelete({
				url: '/config/users/' + this.uuid,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					console.debug('xhrDelete for url = /config/users/' + this.uuid, '; HTTP status code: ', ioArgs.xhr.status);

					// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
					// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
					dijit.byId('user_config_accordion').forward();

					dijit.byId('user_config_accordion').removeChild(_this);
					pion.users._adjustAccordionSize();

					return response;
				},
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
			});
		},
		markAsChanged: function() {
			console.debug('markAsChanged');
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		user: ''
	}
);
