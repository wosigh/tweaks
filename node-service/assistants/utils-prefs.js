var prefs = (function() {
	var that = {};

	var Foundations = IMPORTS.foundations;

	var DB = Foundations.Data.DB;

	var DB_KIND = "org.webosinternals.tweaks:1";
	
//	var subscriptions = {};
	
	var defaultPrefs = function() {
		return {
			_kind: DB_KIND,
			browser: {},
			calendar: {},
			camera: {},
			clock: {},
			contacts: {},
			email: {},
			messaging: {},
			phone: {},
			system: {},
			topbar: {}
		};
	};

//

	var loadPrefs = function() {
		var future = DB.find({ from: DB_KIND, limit: 2 });

		future.then(this, function(future) {
			var result = future.result;
			
			var len = result.results ? result.results.length : 0;
			
			if (len === 0)
				future.result = defaultPrefs();
			else if (len > 1)
				throw new Error("More than 1 preferences object found");
			else
				future.result = result.results[0];
		});

		return future;
	};

	var savePrefs = function(prefs) {
		var future = DB.put([prefs]);

		future.then(this, function(future) {
			var result = future.result;
		
			future.result = { returnValue: true };
		});

		return future;
	};

//

/*	var notifySubscribers = function(prefs) {
		for(var id in subscriptions) {
			var notifyKeys = null;

			for(var key in prefs) {
				if(subscriptions[id].keys.indexOf(key) != -1) {
					if(!notifyKeys)
						notifyKeys = {};
				
					notifyKeys[key] = prefs[key];
				}
			}

			if(notifyKeys) {
				var future = subscriptions[id].factory.get();
				
				future.result = notifyKeys;
			}
		}
	};
*/

// Public functions...

	that.load = function() {
		var future = loadPrefs();
		
		future.then(this, function(future) {
			console.log("WebOS Tweaks preferences loaded");

			var result = future.result;

			future.result = result;
		});
		
		return future;
	};

	that.save = function(prefs) {
		var future = loadPrefs(future);
		
		future.then(this, function(future) {
			var result = future.result;
			
			future.nest(savePrefs(prefs));
			
			future.then(this, function(future) {
				console.log("WebOS Tweaks preferences saved");

//				notifySubscribers(prefs);

				future.result = { returnValue: true };
			});
		});

		return future;
	};

//
	
/*	that.addSubscription = function(id, keys, factory) {
		subscriptions[id] = {'keys': keys, 'factory': factory};
	};

	that.delSubscription = function(id) {
		if(subscriptions[id])
			delete subscriptions[id];
	};
*/
	return that;
}());

