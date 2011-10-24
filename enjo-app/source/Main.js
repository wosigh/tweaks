enyo.kind({
	name: "Main",
	kind: enyo.VFlexBox,
	className: "basic-back",
	flex: 1,
	
	_defaults: {total: 0},
	
	_groups: [],
	_categories: [],
	
	events: {
		onSelect: "",
		onParsed: ""
	},
	
	components: [
		{name: "srvGetPrefs", kind: "DbService", 
			dbKind: "org.webosinternals.tweaks:1",
			method: "find", onSuccess: "handlePrefs", onFailure: "serviceError"}, 
		
		{name: "srvScanTweaks", kind: "PalmService", 
			service: "palm://org.webosinternals.tweaks.prefs/",
			method: "scan", onSuccess: "handleTweaks", onFailure: "serviceError"},
		
		{name: "dlgServiceError", kind: "ModalDialog", caption: "Unknown Service Error", components: [
			{content: "Configuration could not be loaded since the service returned an error!", className: "enyo-text-error"},
			{kind: "Button", caption: "OK", onclick: "handlePopup", style: "margin-top: 10px;"}
		]}, 
		
		{kind: "wi.Header", random: [{weight: 100, tagline: "Tweak the hell out of webOS!"}]}, 
		
		{name: "empty", layoutKind: "HFlexLayout", flex: 1, align: "center", pack: "center", components: [
			{name: "spinner", kind: "SpinnerLarge"}
		]}, 
	
		{name: "mainScroller", kind: "Scroller", height: "613px", components: [
			{name: "categories", kind: "VirtualRepeater", onSetupRow: "setupCategory", components: [
				{kind: "Item", layoutKind: "HFlexLayout", flex: 1, align: "center", tapHighlight: true, 
					onclick: "handleCategory", components: [
						{name: "icon", kind: "Image", src: "images/icon-generic.png", style: "margin: -10px 18px -8px 5px;"}, 
						{name: "category", flex: 1, style: "text-transform: capitalize; margin-top: -1px;"},
						{name: "count", className: "enyo-label", style: "padding-right: 20px;"}
				]}
			]}
		]}
	],
	
	rendered: function() {
		this.inherited(arguments);

		this.$.empty.show();

		this.$.spinner.show();

		this.$.mainScroller.hide();
		
		this.loadPreferences();
	},

	adjustScroller: function() {
		var s = enyo.fetchControlSize(this);

		this.$.mainScroller.applyStyle("height", (s.h - 87) + "px");
	},
	
	loadPreferences: function() {
		if((localStorage) && (localStorage["data"]))
			data = enyo.mixin(this._defaults, enyo.json.parse(localStorage["data"]));
		else
			data = this._defaults;
		
		this.$.srvScanTweaks.call();		
	},
	
	handleTweaks: function(inSender, inResponse) {
		this.$.srvGetPrefs.call();
	},

	handlePrefs: function(inSender, inResponse) {
		this.$.empty.hide();
	
		this.$.spinner.hide();

		this.$.mainScroller.show();
	
		this.owner._config = inResponse.results[0];
	
		this._groups = [];		
		this._categories = [];
		
//		var selected = false;
		var totalCount = 0;
		
		for(var category in inResponse.results[0]) {
			if(category.slice(0,1) == "_")
				continue;

			var count = 0;

			if(inResponse.results[0][category] != undefined) {
				for(var group in inResponse.results[0][category]) {
					for(var j = 0; j < inResponse.results[0][category][group].length; j++) {
						if((inResponse.results[0][category][group][j].deleted == undefined) && 
						((inResponse.results[0][category][group][j].type == "TextField") ||
						(inResponse.results[0][category][group][j].type == "ToggleButton") ||
						(inResponse.results[0][category][group][j].type == "ListSelector") ||
						(inResponse.results[0][category][group][j].type == "IntegerPicker") ||
						(inResponse.results[0][category][group][j].type == "FilePicker")))
						{
							count++;
							totalCount++;
						}
					}
				}
			}

			this._groups.push(inResponse.results[0][category]);
			
			this._categories.push({category: category, count: count});
			
/*			if((count > 0) && (!selected)) {
				selected = true;
				
		      var list = this.$.categories.getOffset();				
				
				this.doSelect(list.top + ((this._categories.length - 1) * 45), this._categories[this._categories.length - 1].category, this._groups[this._groups.length - 1]);
			} */
		}

/*		if(!selected)
			this.doSelect(); */

		this.$.categories.render();
		
/*		if((totalCount - data.total) < 0)
			enyo.windows.addBannerMessage("There was " + (data.total - totalCount) + " tweak(s) removed...", "{}");		
		else if((totalCount - data.total) > 0)
			enyo.windows.addBannerMessage("There is " + (totalCount - data.total) + " new tweak(s) available...", "{}"); */

		this.doParsed(totalCount, data.total);

		data = {total: totalCount};

		localStorage["data"] = enyo.json.stringify(data);
	},
	
	setupCategory: function(inSender, inIndex) {
		if((this._categories.length > 0) && (this._categories.length > inIndex) && (inIndex >= 0)) {
			this.$.category.setContent(this._categories[inIndex].category);
			this.$.count.setContent(this._categories[inIndex].count);
			
			if((this._categories[inIndex].category == "browser") ||
				(this._categories[inIndex].category == "calendar") ||
				(this._categories[inIndex].category == "camera") ||
				(this._categories[inIndex].category == "clock") ||
				(this._categories[inIndex].category == "contacts") ||
				(this._categories[inIndex].category == "email") ||
				(this._categories[inIndex].category == "messaging") ||
				(this._categories[inIndex].category == "phone"))
			{
				this.$.icon.setSrc("images/icon-" + this._categories[inIndex].category + ".png");
			}
			
			if(this._categories[inIndex].count == 0) {
				this.$.icon.applyStyle("opacity", 0.4);
				
				this.$.category.applyStyle("color", "#666666");
			}
					
			return true;
		}
	},

	handleCategory: function(inSender, inEvent) {
		if(this._categories[inEvent.rowIndex].count > 0) {
	      var list = this.$.categories.getOffset();
		
			this.doSelect(list.top + (inEvent.rowIndex * 45), this._categories[inEvent.rowIndex].category, this._groups[inEvent.rowIndex]);
		}
	},

	handlePopup: function(inSender, inEvent) {
		this.$.dlgServiceError.close();
	},
	
	serviceError: function(inSender, inResponse) {
		this.$.empty.hide();

		this.$.spinner.hide();

		this.$.mainScroller.show();

		this.$.dlgServiceError.openAtCenter();	
	}	
});
