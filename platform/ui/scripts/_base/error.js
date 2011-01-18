dojo.provide("pion._base.error");
dojo.require("dijit.Dialog");

dojo.declare("pion._base.error.ServerErrorDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/ServerErrorDialog.html"),
		widgetsInTemplate: true,
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
			var _this = this;
			dojo.query('p.message_text_area', this.domNode).forEach(function(n) {
				n.innerHTML = _this.response_text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
			});
		},
		openKB: function() {
			// TODO: This won't get the full description when the description itself has a colon in it.
			// But extracting the text up to the last colon won't work either, because some error
			// parameters, such as term ids, have colons in them.
			var error_description = this.response_text.split(':')[0];

			var encoded_quoted_message = encodeURIComponent('"' + error_description + '"');
			window.open('http://pion.org/search/node/' + encoded_quoted_message + '%20type%3Akb');
			this.onCancel();
		}
	}
);

pion.handleXhrError = function(response, ioArgs, xhrFunc, finalErrorHandler) {
	console.error('In pion.handleXhrError: response = ', response, ', ioArgs.args = ', ioArgs.args);
	if (ioArgs.xhr.status == 401) {
		if (pion.login.login_pending) {
			// redo the request when the login succeeds
			var h = dojo.connect(pion.login, "onLoginSuccess", function(){ dojo.disconnect(h); xhrFunc(ioArgs.args)});
		} else {
			// if user logged out, exit and go to main login page
			if (!dojo.cookie("logged_in")) {
				location.replace('login.html' + window.location.search);
			}

			// make user log in, then redo the request
			pion.login.doLoginDialog({success_callback: function(){xhrFunc(ioArgs.args)}});
		}
		return;
	} else {
		if (ioArgs.xhr.status == 500) {
			var dialog = new pion._base.error.ServerErrorDialog({response_text: response.responseText});
			dialog.show();
		} else {
			var dialog = new dijit.Dialog({
				title: 'Error',
				content: ioArgs.xhr.responseText
			});
			dialog.show();
		}
		if (finalErrorHandler) {
			finalErrorHandler();
		}
	}
	return response;
}

pion.handleXhrGetError = function(response, ioArgs) {
	console.error('In pion.handleXhrGetError: response = ', response, ', ioArgs.args = ', ioArgs.args);
	return pion.handleXhrError(response, ioArgs, dojo.xhrGet);
}

pion.getXhrErrorHandler = function(xhrFunc, args_mixin, finalErrorHandler) {
	return function(response, ioArgs) {
		dojo.mixin(ioArgs.args, args_mixin);
		return pion.handleXhrError(response, ioArgs, xhrFunc, finalErrorHandler);
	}
}

pion.handleFetchError = function(errorData, request) {
	console.debug('In pion.handleFetchError: request = ', request, ', errorData = ' + errorData);
	if (errorData.status == 401) {
		if (pion.login.login_pending) {
			// redo the request when the login succeeds
			var h = dojo.connect(pion.login, "onLoginSuccess", function(){ dojo.disconnect(h); request.store.fetch(request); });
		} else {
			// if user logged out, exit and go to main login page
			if (!dojo.cookie("logged_in")) {
				location.replace('login.html' + window.location.search);
			}

			// make user log in, then redo the request
			pion.login.doLoginDialog({success_callback: function(){request.store.fetch(request)}});
		}
		return;
	}
}

pion.getFetchErrorHandler = function(msg) {
	return function(errorData, request) {
		console.error(msg);
		return pion.handleFetchError(errorData, request);
	}
}
