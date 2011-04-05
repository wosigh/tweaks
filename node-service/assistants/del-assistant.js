var DelCommandAssistant = function() {
}

//

DelCommandAssistant.prototype.setup = function() {  
}

DelCommandAssistant.prototype.run = function(future) {
	future.nest(prefs.load());

	future.then(this, function(future) {
		var config = future.result;

		if(!this.controller.args.owner)
			future.result = { returnValue: false };	
		else {
			for(var category in config) {
				for(var group in config[category]) {
					for(var i = 0; i < config[category][group].length; i++) {
						if(config[category][group][i].owner == this.controller.args.owner)
							config[category][group].splice(i--, 1);
					}
					
					if(config[category][group].length == 0) {
						delete config[category][group];
					}
				}
			}
	
			future.nest(prefs.save(config));

			future.then(this, function(future) {
				future.result = { returnValue: true };
			});
		}
	});
}

DelCommandAssistant.prototype.cleanup = function() {  
}

