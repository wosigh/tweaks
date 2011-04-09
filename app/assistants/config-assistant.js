/*
 *    ConfigAssistant - Mode Launcher's Mode Edition Scene
*/

function ConfigAssistant(category, widgets, config, prefs, list, restartRequired) {
	/* This is the creator function for your scene assistant object. It will be passed all the 
	 * additional parameters (after the scene name) that were passed to pushScene. The reference
	 * to the scene controller (this.controller) has not be established yet, so any initialization
	 * that needs the scene controller should be done in the setup function below. 
	 */

	this.restartRequired = restartRequired;

	this.category = category;
	this.widgets = widgets;
	this.config = config;
	this.prefs = prefs;
	this.list = list;
}    

ConfigAssistant.prototype.setup = function() {
	this.helpItemTapped = this.handleHelpItemTapped.bind(this);

	var category = this.category.charAt(0).toUpperCase() + this.category.slice(1);

	this.controller.get("config-title").innerHTML = $L(category + " Tweaks");

	this.itemsCommandMenu = [{},{'label': $L("Luna Restart Required"), 'command': "restart", 'width': 320},{}];

	this.modelCommandMenu = {'visible': this.restartRequired, 'items': this.itemsCommandMenu};

	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.modelCommandMenu);

	this.modelCategoriesList = {items: this.list, disabled: true};
	
	this.controller.setupWidget("GroupsList", {
		itemTemplate: 'templates/groups-item',
		swipeToDelete: false,
		autoconfirmDelete: false,
		reorderable: false},
		this.modelCategoriesList);

	for(var i = 0; i < this.widgets.integerPickers; i++) {
		this.controller.setupWidget("IntegerPicker" + i, {
			min: this.widgets.lowLimits[i], max: this.widgets.highLimits[i],
			'label': this.widgets.pickerLabels[i],
			'modelProperty': "valueIntegerPicker" + i});
	}

	for(var i = 0; i < this.widgets.listSelectors; i++) {
		this.controller.setupWidget("ListSelector" + i, {
			'choices': this.widgets.listChoices[i],
			'labelPlacement': "left",
			'label': this.widgets.listLabels[i],
			'swipeToDelete': false, 'reorderable': false, 
			'modelProperty': "valueListSelector" + i});
	}

	for(var i = 0; i < this.widgets.toggleButtons; i++) {
		this.controller.setupWidget("ToggleButton" + i, {
			falseValue: false, falseLabel: $L("No"), 
			trueValue: true, trueLabel: $L("Yes"),
			'modelProperty': "valueToggleButton" + i});
	}

	this.controller.listen(this.controller.get("GroupsList"), Mojo.Event.propertyChange, this.saveTweaksConfig.bind(this));

	this.controller.listen(this.controller.get('help-toggle'), Mojo.Event.tap, this.handleHelpButtonTapped.bindAsEventListener(this));
}

ConfigAssistant.prototype.handleHelpButtonTapped = function(event)
{
	if (this.controller.get('main').hasClassName('help')) {
		this.controller.get('main').removeClassName('help');
		event.target.removeClassName('selected');

		this.controller.stopListening(this.controller.get("GroupsList"), Mojo.Event.listTap, this.helpItemTapped);
	}
	else {
		this.controller.get('main').addClassName('help');
		event.target.addClassName('selected');

		this.controller.listen(this.controller.get("GroupsList"), Mojo.Event.listTap, this.helpItemTapped);
	}
}

ConfigAssistant.prototype.handleHelpItemTapped = function(event) {
	var id = event.originalEvent.target.id.slice(4);

	var helpText = "No help text available for this item!";

	if(this.prefs[id].help.length > 0)
		helpText = this.prefs[id].help;
	
	this.controller.showAlertDialog({
		title: this.prefs[id].label,
		message: "<div style='text-align:justify;'>" + helpText + "</div>",
		choices:[{"label": "Close", "command": "close"}],
		preventCancel: false,
		allowHTMLMessage: true,
		});
}

ConfigAssistant.prototype.saveTweaksConfig = function(event) {
	var id = event.property.slice(5);

	if(this.prefs[id].restart == "luna") {
		this.modelCommandMenu.visible = true;
		
		this.controller.modelChanged(this.modelCommandMenu, this);
	}
	
	this.prefs[id].value = event.value;

	this.controller.serviceRequest("palm://com.palm.db", {method: "merge", parameters: {
		objects: [this.config]},
		onSuccess: this.handleTweaksConfig.bind(this)});
}

ConfigAssistant.prototype.handleTweaksConfig = function(response) {
	this.config._rev = response.rev;
}

ConfigAssistant.prototype.handleCommand = function(event) {
	if(event.type == Mojo.Event.back) {
		event.stop();

		this.controller.stageController.popScene({restartRequired: this.modelCommandMenu.visible});
	}
	else if(event.command == "restart") {
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

ConfigAssistant.prototype.activate = function(event) {
	/* Put in event handlers here that should only be in effect when this scene is active. 
	 *	For  example, key handlers that are observing the document. 
	 */
}
	
ConfigAssistant.prototype.deactivate = function(event) {
	/* Remove any event handlers you added in activate and do any other cleanup that should 
	 * happen before this scene is popped or another scene is pushed on top. 
	 */
}

ConfigAssistant.prototype.cleanup = function(event) {
	/* This function should do any cleanup needed before the scene is destroyed as a result
	 * of being popped off the scene stack.
	 */
}

