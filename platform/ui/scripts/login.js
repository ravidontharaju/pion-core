dojo.provide("pion.login");
dojo.require("dijit.Dialog");

pion.login.logout = function() {
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
		widgetsInTemplate: true
	}
);

pion.login.ops_temporarily_suppressed = false;

pion.login.login_pending = false;

pion.login.onLoginSuccess = function() {}

pion.login.doLogin = function(login_success_callback) {
	pion.login.login_pending = true;
	var ops_toggle_button = dijit.byId('ops_toggle_button');
	if (!ops_toggle_button.checked) {
		ops_toggle_button.setAttribute('checked', true);
		//dojo.addClass(dojo.byId('counterBackground'), 'hidden');
		pion.login.ops_temporarily_suppressed = true;
	}
	var dialog = new pion.login.LoginDialog({});
	dialog.show();
	dialog.execute = function(dialogFields) {
		console.debug('dialogFields = ', dialogFields);
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
					ops_toggle_button.setAttribute('checked', false);
					//dojo.removeClass(dojo.byId('counterBackground'), 'hidden');
					pion.login.ops_temporarily_suppressed = false;
				}
				if (login_success_callback) {
					login_success_callback();
				}
				return response;
			},
			error: function(response, ioArgs) {
				pion.login.login_pending = false;
				if (ioArgs.xhr.status == 401) {
					// name and/or password was incorrect, so try again
					pion.login.doLogin(login_success_callback);
					
					return;
				}
				console.error('login error: HTTP status code = ', ioArgs.xhr.status);
				console.error('ioArgs = ', ioArgs);
				return response;
			}
		});
	}
}
