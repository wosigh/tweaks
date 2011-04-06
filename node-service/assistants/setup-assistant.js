var SetupCommandAssistant = function() {
}

//

SetupCommandAssistant.prototype.setup = function() {  
}

SetupCommandAssistant.prototype.run = function(future) {
	future.nest(prefs.load());

	future.then(this, function(future) {
		var config = future.result;	

		future.nest(prefs.save(config));

		future.then(this, function(future) {
			future.result = { returnValue: true };
		});
	});

}

SetupCommandAssistant.prototype.cleanup = function() {  
}

