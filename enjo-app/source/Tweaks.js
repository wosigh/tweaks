enyo.kind({
	name: "Tweaks",
	kind: enyo.VFlexBox,
	
	_config: null,

	_defaults: {
		version: "0.0.0"
	},
		
	components: [{
		name: "srvRestartLuna", kind: "PalmService", 
			service: "palm://org.webosinternals.ipkgservice", method: "restartLuna"
	}, { 
		name: "ctrDialog", kind: "DialogPrompt", title: "Luna Restart", 
			acceptButtonCaption: "Yes", cancelButtonCaption: "No", onAccept: "handleAccept", 
				message: "You have made changes that require restarting of Luna which will " +
					"close all your open applications. Do you want to restart Luna now?"
	}, {	
		kind: "SlidingPane", flex: 1, style: "background: #666666;", components: [{
			name: "left", width: "320px", components: [{
				name: "pane", kind: "Pane", flex: 1, components: [{
					kind: "Main", className: "enyo-bg", onParsed: "handleInfo", onSelect: "handleCategory"
				}, {
					name: "clsStartup", kind: "Startup", className: "enyo-bg", onDone: "handleStartupDone"
				}]
			}]
		}, {
			name: "middle", fixedWidth: true, peekWidth: 64, width: "704px", dragAnywhere: false, className: "blank-slider", components: [{
				name: "empty", layoutKind: "VFlexLayout", flex: 1, align: "center", pack: "center", style: "background: #666666;", components: [{
					kind: "Image", src: "images/empty-icon.png"
				}, {
					name: "tweaks", content: "Scanning available tweaks...", style: "margin-top: -20px; font-size: 0.7em; color: #999999;"
				}]
			}, {
				name: "content", layoutKind: "VFlexLayout", flex: 1, components: [{
					name: "clsConfig", kind: "Config", className: "enyo-bg", onSelect: "handleGroup", onChange: "handleSettings"
				}, {
					kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [{
						style: "width: 60px;"
					}, {
						kind: "Spacer", flex: 1
					}, {
						name: "restart", content: "Luna restart required (click here to restart)", onclick: "handleRestart"
					}, {
						kind: "Spacer", flex: 1
					}, {
						kind: "Button", caption: "Help", toggling: true, slidingHandler: true, style: "margin-right: 8px;"
					}]
				}]
			}]
		}, {
			name: "right", fixedWidth: true, peekWidth: 768, width: "256px", dragAnywhere: false, className: "blank-slider", components: [{
				name: "clsHelp", kind: "Help", className: "enyo-bg"
			}]
		}]
	}],
	
	rendered: function() {
		this.inherited(arguments);
		
		this.$.content.hide();
		this.$.empty.show();

		this.$.restart.hide();

		if((localStorage) && (localStorage["prefs"])) {
			prefs = enyo.mixin(this._defaults, enyo.json.parse(localStorage["prefs"]));

			if(prefs.version != enyo.fetchAppInfo().version) {
				this.$.clsStartup.hideWelcome();

				this.$.pane.selectViewByIndex(1);
			}
		}
		else {
			this.$.pane.selectViewByIndex(1);

			prefs = this._defaults;
		}
		
		prefs.version = enyo.fetchAppInfo().version;

		localStorage["prefs"] = enyo.json.stringify(prefs);

		this.adjustSliding();
	},

	resizeHandler: function() {
		this.adjustSliding();

		this.$.clsStartup.adjustScroller();
	},

	adjustSliding: function() {
		var s = enyo.fetchControlSize(this);

		this.$.middle.applyStyle("width", (s.w - 320) + "px");
		
		this.$.right.setPeekWidth(s.w - 320 + 64);
	},

	handleStartupDone: function() {
		this.$.pane.selectViewByIndex(1);
	},

	handleInfo: function(inSender, inNewTotal, inOldTotal) {
		if(inNewTotal == 0)
			this.$.tweaks.setContent("There are no tweaks available");		
		else if((inNewTotal - inOldTotal) < 0)
			this.$.tweaks.setContent("There was " + (inOldTotal - inNewTotal) + " tweak(s) removed");		
		else if((inNewTotal - inOldTotal) > 0)
			this.$.tweaks.setContent("There is " + (inNewTotal - inOldTotal) + " new tweak(s) available");
		else 
			this.$.tweaks.setContent("There are " + inNewTotal + " tweak(s) available");
	},	

	handleCategory: function(inSender, inMarker, inCategory, inGroups) {
		this.$.empty.hide();
		this.$.content.show();
		
		this.$.middle.removeClass("blank-slider");

		this.$.clsHelp.updateHelp();
		
		this.$.clsConfig.updateGroups(inMarker, inCategory, inGroups);
	},
	
	handleGroup: function(inSender, inGroup, inHelp) {
		this.$.clsHelp.updateHelp(inGroup, inHelp);
	},

	handleSettings: function(inSender) {
	  this.$.restart.show();	
	},
	
	handleRestart: function() {
		this.$.ctrDialog.open();
	},
	
	handleAccept: function() {
		this.$.srvRestartLuna.call();
	}
});

