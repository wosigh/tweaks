/*
 *    AppAssistant - App Assistant for Mode Launcher
 */

function AppAssistant(appController) {
	/* This is the creator function for your app assistant object (the first created scene). */
}

//

AppAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created. */
}

AppAssistant.prototype.cleanup = function() {
	/* This function should do any cleanup needed before the execution is interrupted. */
}

//

AppAssistant.prototype.handleLaunch = function(params) {
	this.isNewOrFirstStart = this.checkVersion();
	
	if(this.isNewOrFirstStart == 1) {
		var setupRequest = new Mojo.Service.Request("palm://org.webosinternals.tweaks.prefs", {
			method: 'setup', parameters: {}, 
			onComplete: function(params, response) {
				if((response) && (response.returnValue)) {
					var cookie = new Mojo.Model.Cookie('version');
					cookie.put({'version': Mojo.appInfo.version});
				}
				
				this.executeLaunch(params);
			}.bind(this, params)});
			
	}
	else
		this.executeLaunch(params);
}

AppAssistant.prototype.executeLaunch = function(params) {
	var stageController = this.controller.getStageController("main");

	if(stageController) {
		Mojo.Log.info("Main stage card already exists");
		
		stageController.activate();
	}
	else {
		Mojo.Log.info("Creating new main stage card");

		var mainScene = function(stageController) {
			if(this.isNewOrFirstStart)
				stageController.pushScene("startup");
			else
				stageController.pushScene("main", params);
		};
			
		var stageArgs = {name: "main", lightweight: true};
		
		this.controller.createStageWithCallback(stageArgs, 
			mainScene.bind(this), "card");
	}
}

//

AppAssistant.prototype.checkVersion = function() {
	var isNewOrFirstStart = false;

	var cookie = new Mojo.Model.Cookie('version');

//	cookie.remove();

	var data = cookie.get();
	
	if(!data)
		isNewOrFirstStart = 1;	
	else if(data.version !=  Mojo.appInfo.version) {
		isNewOrFirstStart = 2;
		
		cookie.put({'version': Mojo.appInfo.version});
	}

	return isNewOrFirstStart;
}

AppAssistant.prototype.getNotifications = function() {
	var cookie = new Mojo.Model.Cookie('preferences');

//	cookie.remove();

	var data = cookie.get();
	
	if(!data)
		return true;
	else
		return data.notifications;
}

