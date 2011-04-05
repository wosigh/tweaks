var AddCommandAssistant = function() {
	this.Foundations = IMPORTS.foundations;
}

//

AddCommandAssistant.prototype.setup = function() {  
}

AddCommandAssistant.prototype.run = function(future) {
	future.nest(prefs.load());

	future.then(this, function(future) {
		var config = future.result;

		if(!this.controller.args.owner)
			future.result = { returnValue: false };	
		else if(!this.controller.args.prefs)
			future.result = { returnValue: false };	
		else if(!this.controller.args.prefs.length)
			future.result = { returnValue: false };	
		else if(!this.controller.args.category)
			future.result = { returnValue: false };	
		else if(!config[this.controller.args.category])
			future.result = { returnValue: false };	
		else {
			for(var i = 0; i < this.controller.args.prefs.length; i++) {
				if(this.controller.args.prefs[i].group) {
					var owner = this.controller.args.owner;
					
					var group = this.controller.args.prefs[i].group.toLowerCase();
				
					if(config[this.controller.args.category][group] == undefined)
						config[this.controller.args.category][group] = [];

					if(this.controller.args.prefs[i].key) {
						var key = this.controller.args.prefs[i].key;
					
						var label = "";
						var restart = "none";
					
						if(this.controller.args.prefs[i].label)
							label = this.controller.args.prefs[i].label;

						if(this.controller.args.prefs[i].restart)
							restart = this.controller.args.prefs[i].restart;

						if(this.controller.args.prefs[i].value != undefined) {
							var value = this.controller.args.prefs[i].value;

							// TODO: handle updating of the data or not?

							if(utils.findArray(config[this.controller.args.category][group], "key", key) == -1) {
								if(this.controller.args.prefs[i].type == "integer-picker") {
									var minValue = 0;
									var maxValue = 100;
							
									if(this.controller.args.prefs[i].min)
										minValue = this.controller.args.prefs[i].min;
							
									if(this.controller.args.prefs[i].max)
										maxValue = this.controller.args.prefs[i].max;

									config[this.controller.args.category][group].push({
										owner: owner, type: "integer-picker", 
										key: key, restart: restart,
										label: label, value: value,
										min: minValue, max: maxValue});
								}
								else if(this.controller.args.prefs[i].type == "list-selector") {
									if(this.controller.args.prefs[i].choices) {
										var choices = this.controller.args.prefs[i].choices;

										config[this.controller.args.category][group].push({
											owner: owner, type: "list-selector", 
											key: key, restart: restart,
											label: label, value: value,
											choices: choices});
									}
								}
								else if(this.controller.args.prefs[i].type == "toggle-button") {
									config[this.controller.args.category][group].push({
										owner: owner, type: "toggle-button", 
										key: key, restart: restart,
										label: label, value: value});
								}
							}
						}
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

AddCommandAssistant.prototype.cleanup = function() {  
}

