/*
 *    MainAssistant - Mode Launcher's Default Configuration Scene
 */

function MainAssistant(params) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */

	this.DB_KIND = "org.webosinternals.tweaks:1";

	this.appControl = Mojo.Controller.getAppController();
	this.appAssistant = this.appControl.assistant;

	this.params = params;

	this.categories = [];
}    

MainAssistant.prototype.setup = function() {
	/* This function is for setup tasks that have to happen when the scene is first created
	 * Use Mojo.View.render to render view templates and add them to the scene, if needed.
    * Setup widgets and add event handlers to listen to events from widgets here. 
    */

	if(this.appAssistant.isNewOrFirstStart)
		this.controller.get("subTitle").innerHTML = "Have you already <a href=\"https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DCSMTCCGMH5NA\">donated</a>?";

	this.controller.get("version").innerHTML = "v" + Mojo.Controller.appInfo.version;

	this.itemsCommandMenu = [{},{'label': $L("Luna Restart Required"), 'command': "restart"},{}];

	this.modelCommandMenu = {'visible': false, 'items': this.itemsCommandMenu};

	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.modelCommandMenu);

	this.modelCategoriesList = {items: this.categories, disabled: true};
	
	this.controller.setupWidget("CategoriesList", {
		itemTemplate: 'templates/categories-item',
		swipeToDelete: false,
		autoconfirmDelete: false,
		reorderable: false},
		this.modelCategoriesList);

	this.controller.listen(this.controller.get('CategoriesList'), Mojo.Event.listTap, 
		this.handleCategoryListTap.bind(this));
}

//

MainAssistant.prototype.updatePreferences = function(response) {
}

//

MainAssistant.prototype.handleCategoryListTap = function(event) {
	var category = event.item.name.toLowerCase();
	
	var widgets = {listSelectors: 0, toggleButtons: 5, integerPickers: 0, 
		listChoices:[], listLabels: [], pickerLabels: [], lowLimits: [], highLimits: []};
	
	var prefs = [];
	var keys = {};
	
	if(this.config[category] != undefined) {
		for(var group in this.config[category]) {
			prefs.push({group: group, elements: ""});
		
			for(var i = 0; i < this.config[category][group].length; i++) {
				if(this.config[category][group][i].deleted != undefined)
					continue;
			
				if((i == 0) && (this.config[category][group].length == 1))
					prefs[prefs.length - 1].elements += "<div class='palm-row single'>";
				else if(i == 0)
					prefs[prefs.length - 1].elements += "<div class='palm-row first'>";
				else if(i == (this.config[category][group].length - 1))
					prefs[prefs.length - 1].elements += "<div class='palm-row last'>";
				else
					prefs[prefs.length - 1].elements += "<div class='palm-row'>";

				if(this.config[category][group][i].type == "toggle-button") {
					var id = widgets.toggleButtons++;
				
					keys["valueToggleButton" + id] = this.config[category][group][i];
									
					prefs[prefs.length - 1].elements += "<div name='ToggleButton" + id + "' x-mojo-element='ToggleButton'></div>" + 
						"<div class='title left'>" + this.config[category][group][i].label + "</div></div>";		
						
					prefs[prefs.length - 1]["valueToggleButton" + id] = this.config[category][group][i].value;
				}
				else if(this.config[category][group][i].type == "list-selector") {
					var id = widgets.listSelectors++;

					keys["valueListSelector" + id] = this.config[category][group][i];
									
					widgets.listChoices.push(this.config[category][group][i].choices);
					widgets.listLabels.push(this.config[category][group][i].label);

					prefs[prefs.length - 1].elements += "<div name='ListSelector" + id + "' x-mojo-element='ListSelector'></div></div>";	

					prefs[prefs.length - 1]["valueListSelector" + id] = this.config[category][group][i].value;
				}
				else if(this.config[category][group][i].type == "integer-picker") {
					var id = widgets.integerPickers++;

					keys["valueIntegerPicker" + id] = this.config[category][group][i];

					widgets.pickerLabels.push(this.config[category][group][i].label);
					widgets.lowLimits.push(this.config[category][group][i].min);
					widgets.highLimits.push(this.config[category][group][i].max);

					prefs[prefs.length - 1].elements += "<div name='IntegerPicker" + id + "' x-mojo-element='IntegerPicker'></div></div>";	
					
					prefs[prefs.length - 1]["valueIntegerPicker" + id] = this.config[category][group][i].value;
				}
			}
			
			if(prefs[prefs.length - 1].elements == "")
				prefs.pop();
		}
	}

	this.controller.stageController.pushScene("config", event.item.name, widgets, this.config, prefs, keys, this.modelCommandMenu.visible);
}

MainAssistant.prototype.loadTweaksConfig = function() {
	this.controller.serviceRequest("palm://com.palm.db", {method: "find", parameters: {
		query: {from: this.DB_KIND, limit: 2 }},
		onSuccess: this.handleTweaksConfig.bind(this)});
}

MainAssistant.prototype.handleTweaksConfig = function(response) {
	if (response.results.length === 0)
		Mojo.Log.error("Errr no config");
	else if (response.results.length > 1)
		Mojo.Log.error("More than 1 preferences object found");
	else {
		this.config = response.results[0];

		var categories = ["browser", "calendar", "contacts", "email", "messaging", "phone", "system"];

		this.categories.clear();

		var totalCount = 0;

		for(var i = 0; i < categories.length; i++) {
			var count = 0;
			var category = categories[i];

			if(this.config[category] != undefined) {
				for(var group in this.config[category]) {
					for(var j = 0; j < this.config[category][group].length; j++) {
						if((this.config[category][group][j].deleted == undefined) && 
							((this.config[category][group][j].type == "toggle-button") ||
							(this.config[category][group][j].type == "list-selector") ||
							(this.config[category][group][j].type == "integer-picker")))
						{
							count++;
							totalCount++;
						}
					}
				}
			}

			this.categories.push({name: category, count: count});
		}
		
		if(totalCount == 0) {
			this.controller.showAlertDialog({
				title: $L("No tweaks available"),
				message: "<div style='text-align:justify;'>There are no tweaks available. " +
					"The reason for this is that you don't have any tweaks patches installed.</div>",
				choices:[
					{label:$L("Ok"), value:"ok", type:'default'}],
				preventCancel: false,
				allowHTMLMessage: true
			});
		}
		
		this.controller.modelChanged(this.modelCategoriesList, this);
	}
}

//

MainAssistant.prototype.handleCommand = function(event) {
	if(event.command == "restart") {
		this.controller.showAlertDialog({
			title: $L("Luna restart required"),
			message: "You have made changes that require Luna restart.",
			choices:[
				{label:$L("Restart Luna"), value:"restart", type:'default'},
				{label:$L("Cancel"), value:"cancel", type:'default'}],
			preventCancel: false,
			allowHTMLMessage: true,
			onChoose: function(value) {
				if(value == "restart") {
					this.modelCommandMenu.visible = false;
		
					this.controller.modelChanged(this.modelCommandMenu, this);

					this.controller.serviceRequest("palm://org.webosinternals.ipkgservice", {
						method: "restartLuna", parameters: {}});
				}
				else if(value == "cancel") {
					this.modelCommandMenu.visible = false;
		
					this.controller.modelChanged(this.modelCommandMenu, this);
				}
			}.bind(this)});
	}
}

//

MainAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document. 
	 */

	if((event) && (event.restartRequired)) {
		this.modelCommandMenu.visible = true;
		
		this.controller.modelChanged(this.modelCommandMenu, this);
	}

	this.loadTweaksConfig();
}
	
MainAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

MainAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */ 
}

