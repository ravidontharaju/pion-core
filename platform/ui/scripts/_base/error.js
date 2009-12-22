dojo.provide("pion._base.error");

pion.handleXhrError = function(response, ioArgs, xhrFunc, finalErrorHandler) {
	console.error('In pion.handleXhrError: response = ', response, ', ioArgs.args = ', ioArgs.args);
	if (ioArgs.xhr.status == 401) {
		if (pion.login.login_pending) {
			// redo the request when the login succeeds
			var h = dojo.connect(pion.login, "onLoginSuccess", function(){ dojo.disconnect(h); xhrFunc(ioArgs.args)});
		} else {
			// if user logged out, exit and go to main login page
			if (!dojo.cookie("logged_in")) {
				location.replace('login.html');
			}

			// make user log in, then redo the request
			pion.login.doLoginDialog({success_callback: function(){xhrFunc(ioArgs.args)}});
		}
		return;
	} else {
		if (ioArgs.xhr.status == 500) {
			var dialog = new dijit.Dialog({title: 'Pion Server Error'});
			dialog.attr('content', response.responseText.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
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
				location.replace('login.html');
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
