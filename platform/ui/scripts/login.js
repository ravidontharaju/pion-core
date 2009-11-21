dojo.provide("pion.login");
dojo.require("dojo.cookie");
dojo.require("dijit.Dialog");

pion.login.logout = function() {
	dojo.cookie("logged_in", "", {expires: -1}); // deletes the cookie
	dojo.xhrGet({
		url: '/logout',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			console.debug('logout response: ', response);
			return response;
		},
		error: function(response, ioArgs) {
			console.error('logout error: HTTP status code = ', ioArgs.xhr.status);
			return response;
		}
	});
}

// this is just for simulating a timeout by the server
pion.login.expire = function() {
	dojo.xhrGet({
		url: '/logout',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			console.debug('logout response: ', response);
			return response;
		},
		error: function(response, ioArgs) {
			console.error('logout error: HTTP status code = ', ioArgs.xhr.status);
			return response;
		}
	});
}

dojo.declare("pion.login.LoginDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("pion", "../resources/LoginDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);

			// This is needed to work correctly in all of the following cases:
			// 1) when dijit.Dialog and pion.login.LoginDialog are both built (e.g. when using pion-dojo.js),
			// 2) when dijit.Dialog is built but pion.login.LoginDialog is not (e.g. when using dojo-for-pion.js), and
			// 3) when neither is built (e.g. when using dojo-src/dojo/dojo.js and pion.js).
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true
	}
);

pion.login.ops_temporarily_suppressed = false;

pion.login.login_pending = false;

pion.login.onLoginSuccess = function() {
	dojo.cookie("logged_in", "true", {expires: 1}); // 1 day
	dojo.byId('current_user_menu_section').style.visibility = 'visible';
	dojo.byId('current_user').innerHTML = dojo.cookie('user');
}

pion.login.doLoginDialog = function(kw_args) {
	dojo.byId('current_user_menu_section').style.visibility = 'hidden';
	pion.login.login_pending = true;
	var ops_toggle_button = dijit.byId('ops_toggle_button');
	if (!ops_toggle_button.checked) {
		ops_toggle_button.attr('checked', true);
		//dojo.addClass(dojo.byId('counterBackground'), 'hidden');
		pion.login.ops_temporarily_suppressed = true;
	}
	var dialog = new pion.login.LoginDialog({});
	dialog.attr('value', {Username: dojo.cookie('user')});
	dojo.connect(dialog.domNode, 'onkeypress', 
		function(event) {
			if (event.keyCode == dojo.keys.ENTER) {
				dialog.execute(dialog.attr('value')); 
				dialog.destroyRecursive();
			}
		}
	);
	dialog.show();
	dialog.execute = function(dialogFields) {
		if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
		this.execute_already_called = true;

		// Same as in login.html.  Note that dojo.cookie also uses encodeURIComponent().
		document.cookie = 'user=' + encodeURIComponent(dialogFields.Username);

		dojo.xhrGet({
			url: '/login?user=' + dialogFields.Username + '&pass=' + dialogFields.Password,
			preventCache: true,
			handleAs: 'xml',
			//timeout: 5000,
			load: function(response, ioArgs) {
				pion.login.login_pending = false;
				pion.login.onLoginSuccess();
				console.debug('login response: ioArgs.xhr = ', ioArgs.xhr);
				if (pion.login.ops_temporarily_suppressed) {
					// turn ops back on
					ops_toggle_button.attr('checked', false);
					//dojo.removeClass(dojo.byId('counterBackground'), 'hidden');
					pion.login.ops_temporarily_suppressed = false;
				}
				if (kw_args.suppress_default_key_status_check) {
					if (kw_args.success_callback)
						kw_args.success_callback();
				} else {
					pion.about.checkKeyStatus({always_callback: kw_args.success_callback});
				}
				return response;
			},
			error: function(response, ioArgs) {
				pion.login.login_pending = false;
				if (ioArgs.xhr.status == 401) {
					// name and/or password was incorrect, so try again
					pion.login.doLoginDialog(kw_args);
					
					return;
				}
				console.error('login error: HTTP status code = ', ioArgs.xhr.status);
				console.error('ioArgs = ', ioArgs);
				return response;
			}
		});
	}
}
