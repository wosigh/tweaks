enyo.kind({
	name: "Config",
	kind: enyo.VFlexBox,
	className: "basic-back",
	flex: 1,
	
	_help: {},
	_category: null,

	_matchNumeric: /^[0-9]*$/,
	_matchFreeText: /^[-_a-zA-Z0-9 /.:@%~,'{}]*$/,
	
	events: {
		onChange: "",
		onSelect: ""
	},
	
	components: [{
		name: "srvSetPrefs", kind: "DbService", 
			dbKind: "org.webosinternals.tweaks:1", method: "merge", onSuccess: "handlePrefs", onFailure: "serviceError"
	}, {
		name: "dlgServiceError", kind: "ModalDialog", caption: "Unknown Service Error", components: [{
			content: "Configuration could not be saved since the service returned an error!", className: "enyo-text-error"
		}, {
			kind: "Button", caption: "OK", onclick: "handlePopup", style: "margin-top: 10px;"
		}]
	}, {
		name: "dlgNumericError", kind: "ModalDialog", caption: "Unallowed Characters Used", components: [{
			content: "The value you inputted for the numeric text field contains unallowed characters. Allowed characters are: " +
				"0-9", className: "enyo-text-error"
		}, {
			kind: "Button", caption: "OK", onclick: "handlePopup", style: "margin-top: 10px;"
		}]
	}, {
		name: "dlgFreeTextError", kind: "ModalDialog", caption: "Unallowed Characters Used", components: [{
			content: "The value you inputted for the free text field contains unallowed characters. Allowed characters are: " +
				"a-z A-Z 0-9 -_/.:@%~,\'{}", className: "enyo-text-error"
		}, {
			kind: "Button", caption: "OK", onclick: "handlePopup", style: "margin-top: 10px;"
		}]
	}, {	 
		name: 'tag', style: "position: absolute; z-index: 3; background: url(images/sliding-tag.png) right center no-repeat;" +
			"height: 50px; width: 26px; left: -26px; margin-top: -2px;"
	}, {
		kind: "PageHeader", layoutKind: "VFlexLayout", components: [{
			name: "title", style: "text-transform: capitalize;", content: "Scanning Available Tweaks..."
		}]
	}, {
		name: "empty", layoutKind: "VFlexLayout", flex: 1, pack: "center", align: "center", components: [{
			content: "You should install some patches that have tweaks support."
		}]
	}, {
		name: "groups", layoutKind: "HFlexLayout", style: "padding-top: 10px;", width: "100%", components: []
	}],
	
	rendered: function() {
		this.inherited(arguments);
		
		this.$.tag.hide();

		this.$.empty.hide();
	},
	
	updateGroups: function(inMarker, inCategory, inGroups) {
		if(inMarker == undefined) {
			this.$.title.setContent("No Available Tweaks");

			this.$.empty.show();
				
			return;
		}
	
		this._category = inCategory;
		
		this.$.tag.applyStyle('top', inMarker + 'px');

		this.$.tag.show();
		
		this.$.title.setContent("Available " + inCategory + " Tweaks");

		if(this.$.groupsList)
			this.$.groupsList.destroy();

		this.$.groups.createComponent({
			name: "groupsList", kind: "Scroller", autoHorizontal: false, horizontal: false, width: "100%", style: "height:800px;", components: [{
				name: "groupItems", layoutKind: "VFlexLayout", style: "padding: 0px 20px 0px 20px;", components: []
			}]
		}, {owner: this});
		
		for(var group in inGroups) {
			if(inGroups[group].length > 0) {
				var help = [];
				var items = [];
				
				for(var i = 0; i < inGroups[group].length; i++) {
					if(inGroups[group][i].deleted != undefined)
						continue;
				
					if(inGroups[group][i].type == "IntegerPicker") {
						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						items.push({kind: "Item", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
							{content: inGroups[group][i].label, flex: 1, className: "enyo-label"},
							{name: inGroups[group][i].key, kind: "IntegerPicker", label: "", value: inGroups[group][i].value, 
							min: inGroups[group][i].min, max: inGroups[group][i].max , onChange: "handlePicker"}]});
					}
					else if(inGroups[group][i].type == "ListSelector") {
						var choices = [];
						
						for(var j = 0; j < inGroups[group][i].choices.length; j++)
							choices.push({caption: inGroups[group][i].choices[j].label, value: inGroups[group][i].choices[j].value});

						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						items.push({kind: "Item", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
							{content: inGroups[group][i].label, flex: 1, className: "enyo-label"},
							{name: inGroups[group][i].key, kind: "ListSelector", value: inGroups[group][i].value, onChange: "handleList", items: choices}]});
					}
					else if(inGroups[group][i].type == "TextField") {
						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						items.push({kind: "Item", layoutKind: "VFlexLayout", components: [
							{layoutKind: "HFlexLayout", pack: "left", components: [
							{content: inGroups[group][i].label, className: "enyo-label"}]},
							{layoutKind: "HFlexLayout", components: [
							{name: inGroups[group][i].key, kind: "Input", flex: 1, alwaysLooksFocused: true, value: inGroups[group][i].value, 
								onkeypress: "handleChars", onchange: "handleInput"}]}]});
					}
					else if(inGroups[group][i].type == "ToggleButton") {
						help.push({label: inGroups[group][i].label, help: inGroups[group][i].help});

						items.push({kind: "Item", layoutKind: "HFlexLayout", align: "center", pack: "center", components: [
							{content: inGroups[group][i].label, flex: 1, className: "enyo-label"},
							{name: inGroups[group][i].key, kind: "ToggleButton", onLabel: "Yes", offLabel: "No", state: inGroups[group][i].value, onChange: "handleToggle"}]});
					}
				}

				this._help[group] = help;
				
				this.$.groupItems.createComponent({name: group, kind: "RowGroup", caption: group, components: items, onclick: "handleHelp"}, {owner: this});
			}
		}

		this.$.groups.render();
	},
	
	handleHelp: function(inSender, inEvent) {
		this.doSelect(inSender.name, this._help[inSender.name]);
	},

	handlePicker: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					this.owner._config[this._category][group][i].value = this.$[inSender.name].getValue();
		
					if(this.owner._config[this._category][group][i].restart == "luna")
						this.doChange();
					
					this.saveConfig();
					
					break;
				}
			}
		}
	},

	handleList: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					this.owner._config[this._category][group][i].value = this.$[inSender.name].getValue();
		
					if(this.owner._config[this._category][group][i].restart == "luna")
						this.doChange();

					this.saveConfig();
					
					break;
				}
			}
		}
	},

	handleChars: function(inSender, inEvent) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					if((!String.fromCharCode(inEvent.keyCode).match(this._matchNumeric)) &&
						((this.owner._config[this._category][group][i].input == "numeric") || 
						(!String.fromCharCode(inEvent.keyCode).match(this._matchFreeText))))
					{
						enyo.stopEvent(inEvent);
						
						break;
					}
				}
			}
		}
	},
	
	handleInput: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					if((!this.$[inSender.name].getValue().match(this._matchNumeric)) &&
						((this.owner._config[this._category][group][i].input == "numeric") || 
						(!this.$[inSender.name].getValue().match(this._matchFreeText))))
					{
						if(this.owner._config[this._category][group][i].input == "numeric") 
							this.$.dlgNumericError.openAtCenter();
						else
							this.$.dlgFreeTextError.openAtCenter();
					}
					else {
						this.owner._config[this._category][group][i].value = this.$[inSender.name].getValue();
	
						if(this.owner._config[this._category][group][i].restart == "luna")
							this.doChange();

						this.saveConfig();
					}
										
					break;
				}
			}
		}
	},
	
	handleToggle: function(inSender) {
		for(var group in this.owner._config[this._category]) {
			for(var i = 0; i < this.owner._config[this._category][group].length; i++) {
				if(this.owner._config[this._category][group][i].key == inSender.name) {
					this.owner._config[this._category][group][i].value = this.$[inSender.name].getState();
		
					if(this.owner._config[this._category][group][i].restart == "luna")
						this.doChange();

					this.saveConfig();
					
					break;
				}
			}
		}
	},
	
	handlePopup: function(inSender, inEvent) {
		this.$.dlgServiceError.close();
		this.$.dlgNumericError.close();
		this.$.dlgFreeTextError.close();
	},
	
	saveConfig: function() {
		this.$.srvSetPrefs.call({objects: [this.owner._config]});
	},
	
	handlePrefs: function(inSender, inResponse) {
		this.owner._config._rev = inResponse.results[0].rev;
	},
	
	serviceError: function() {
		this.$.dlgServiceError.openAtCenter();
	}
});
