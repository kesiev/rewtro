function GameConsole(parent,CFG) {
	var self=this;

	// --- SOUNDS
	
	var sounds={
		click:AudioEngine.generateNoise({"wave":"breaker","attack":0.009,"sustain":0.012,"decay":0.048,"release":0.072,"frequency":295,"frequencyJump1onset":0.26,"frequencyJump1amount":0.24,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0}),
		shutter:AudioEngine.generateNoise({"wave":"sine","attack":0.009,"sustain":0.02,"decay":0.015,"release":0.2,"frequencyJump1onset":0.36,"frequencyJump1amount":0.5,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"frequency":850,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0})
	};
	var audioChannel=AudioEngine.createAudioChannel(0.9);

	function playAudio(id) {
		if (sounds[id]) AudioEngine.playAudio(audioChannel,sounds[id],"_system");
	}

	// --- HELPERS

	function $(a,attr,add) {
		if (typeof a == "string") a=document.createElement(a);
		if (attr) {
			for (var k in attr.css) a.style[k]=attr.css[k];
			for (var k in attr.set) a[k]=attr.set[k];
		}
		if (add) add.appendChild(a);
		return a;
	}

	// --- WAVES

	var waves;
	function setWaves(enabled) {
		if (enabled) {
			if (!waves) {
				waves=$("div",{ set:{className:"wavebox"}},configPanel);
				$("div",{ set:{className:"wave one"}},waves);
				$("div",{ set:{className:"wave two"}},waves);
				$("div",{ set:{className:"wave three"}},waves);
			}
		} else if (waves) {
			configPanel.removeChild(waves);
			waves=0;
		}
	}

	// --- CODE

	document.title=CFG.title;

	$(parent,{ set:{className:"GAMECONSOLE"}, css:{ overflow:"hidden" } });

	var configPanel=$("div",{ set:{ className:"configPanel" } },parent);
	var configSwapButton=$("div",{
		set:{			
			onclick:function(){
				AudioEngine.request();
				self.toggleMode();
			}
		}
	},configPanel);
	$("div",{set:{className:"title"}},configPanel);
	
	var playPanel=$("div",{set:{className:"playPanel"}});
	var vectors=[
		{
			set:{className:"inset"},
			portrait: { x:0, y:0, width:1, height:1, borderRadius:0 },
			landscape: { x:0, y:0, width:1, height:1, borderRadius:0 }
		},
		{
			set:{className:"screenFrame"},
			portrait: { x:-0.07, y:-0.05, width:1.14, height:1.2, borderRadius:10 },
			landscape: { x:-0.05, y:-0.05, width:1.1, height:1.2, borderRadius:10 }
		},
		{
			set:{className:"darkBorder"},
			portrait: { x:-0.01, y:-0.01, width:1.02, height:1.02, borderRadius:0 },
			landscape: { x:-0.01, y:-0.01, width:1.02, height:1.02, borderRadius:0 }
		},
		{
			set:{className:"hole"},
			portrait:{ x:-0.2, y:-0.12, width:1.4,height:0.01, borderRadius:0 },
			landscape:{ x:-0.7, y:-0.12, width:2.4,height:0.01, borderRadius:0 },
		},
		{
			set:{className:"shield"},
			portrait:{ x:-0.2, y:-0.2, width:1.4, height:2.7, borderRadius:5 },
			landscape:{ x:-0.7, y:-0.2, width:2.4, height:1.44, borderRadius:5 }
		},
		{			
			set: { className:"label", innerHTML:CFG.consoleLabel},
			portrait:{  x:0, y:1.04, width:1, height:0.09, borderRadius:0, fontSize:0.04 },
			landscape:{  x:0, y:1.04, width:1, height:0.09, borderRadius:0, fontSize:0.04 }
		}
	];
	vectors.forEach(vector=>{ vector._node=$("div",vector,playPanel); });

	// --- MENU

	var optionsEnabled,options=[];
	var iconsPanel=$("div",{set:{className:"iconsPanel"}},configPanel);
	CFG.options.forEach(optionset=>{
		optionset.forEach(option=>{
			var icon=$("div",{set:{className:"icon",_option:option}},iconsPanel)
			if (option.hidden) icon.style.display="none";
			var label=$("div",{set:{className:"iconlabel",innerHTML:option.label.label}},icon);
			icondock=$("div",{set:{className:"iconimagedock"}},icon);
			var image=$("div",{set:{className:"iconimage",innerHTML:option.label.icon}},icondock);
			icon.onclick=function() {
				AudioEngine.request();
				if (optionsEnabled) {
					playAudio("click");
					var option=this;
					optionsEnabled=false;
					iconsPanel.className="iconsPanel loaded disabled";
					setTimeout(function() {
						option._option.onSelect($,self);	
					},500);
				}
			}
			options.push({icon:icon,option:option});	
		})
	});
	
	setTimeout(function(){ self.endOption(); },500);

	function broadcastEvent(event,data) {
		options.forEach(option=>{
			if (option.option[event])
				option.option[event].apply(option.option,data);
		});
	}

	// --- MENU DIALOG

	this.createButton=function(label,into,onclick) {
		return $("div",{set:{className:"hudbutton",innerHTML:label,onclick:function(){
			playAudio("click");
			onclick.apply(this);
		}}},into);
	}

	this.toggleMode=function(play) { setMode(!play); }

	this.endOption=function() {
		optionsEnabled=true;
		if (dialog) dialog.close();
		iconsPanel.className="iconsPanel loaded";
		if (lastGame) {
			configSwapButton.className="gotogame";
			configSwapButton.innerHTML=LOC._("console_paused");
		} else {
			configSwapButton.className="gotogame disabled";
			configSwapButton.innerHTML=LOC._("console_nogame");
		}
	}

	var dialog;
	this.getDialog=function() {
		if (!dialog) {
			setWaves(false);
			dialog=$("div",{set:{className:"dialog"}});
			dialog.close=function() {
				setWaves(true);
				configPanel.removeChild(dialog);
				dialog=0;
			}
			configPanel.appendChild(dialog);
		}
		dialog.innerHTML="";
		return dialog;
	}

	this.getAlert=function(message,buttons) {
		var dialog=this.getDialog();
		var alertcontent=$("div",{
			set:{className:"alert",innerHTML:message}
		},dialog);
		$("div",{set:{className:"separator"}},alertcontent);
		buttons.forEach(button=>{
			var btn=this.createButton(button.label,alertcontent,0);
			btn._button=button;
			btn.onclick=function(){
				playAudio("click");				
				this._button.onclick(dialog);
			}
		});
		return dialog;
	}

	// --- FUNCTIONS

	var mode=false,animation,animationPct;
	function setMode(play) {
		if ((play&&!lastGame)||!optionsEnabled) play=false;
		setWaves(!play);
		if (play!=mode) {
			mode=play;
			// I've tried using CSS Transforms but didn't work on iOS. Oh, well.
			animationPct=1;			
			animation=setInterval(function(){
				animationPct*=0.8;
				var cAnimationPct=1-animationPct;
				if (!animationPct) {
					if (play&&lastGame) lastGame.resume();
					clearInterval(animation);
					animation=0;
				} else {
					if (!configPanel.parentNode) parent.appendChild(configPanel);
					if (!playPanel.parentNode) parent.appendChild(playPanel);
					if (animationPct<0.001) animationPct=0;
					if (animationPct) {
						if (mode) {
							$(configPanel,{css:{top:(-parent.clientHeight*cAnimationPct)+"px"}});
							$(playPanel,{css:{top:(parent.clientHeight-parent.clientHeight*cAnimationPct)+"px"}});
						} else {
							$(configPanel,{css:{top:(-parent.clientHeight*animationPct)+"px"}});
							$(playPanel,{css:{top:(parent.clientHeight-parent.clientHeight*animationPct)+"px"}});
						}	
					} else {
						if (mode) {
							$(playPanel,{css:{top:0}});
							parent.removeChild(configPanel);
						} else {
							$(configPanel,{css:{top:0}});
							parent.removeChild(playPanel);
						}
					}
				}
			},20);
		}
	}

	this.$=$;

	this.node=parent;

	// Storage management

	this._storage={};

	this.setStorage=function(key,value) {
		if (window&&window.localStorage) window.localStorage["_CRT_"+key]=value;
		else this._storage[key]=value;
	}

	this.getStorage=function(key,value) {
		if (window&&window.localStorage) return window.localStorage["_CRT_"+key];
		else return this._storage[key];
	}

	this.hasStorage=function(key) {
		if (window&&window.localStorage) return window.localStorage["_CRT_"+key]!==undefined;
		else return this._storage[key] !== undefined;
	}

	this.removeStorage=function(key) {
		if (window&&window.localStorage) delete window.localStorage["_CRT_"+key];
		else delete this._storage[key];
	}

	// System sounds

	this.playAudio=playAudio;

	// Home icons

	this.hideIcon=function(id) {
		options.forEach(option=>{ if (option.option.id==id) option.icon.style.display="none"; });
	}

	this.showIcon=function(id) {
		options.forEach(option=>{ if (option.option.id==id) option.icon.style.display=""; });
	}

	// System status

	this.reboot=function() {
		if (lastGame) lastGame.stop();
		setMode(false);
		this.endOption();
		configPanel.innerHTML="";
		waves=0;
		setWaves(true);
		setTimeout(function(){
			document.location.href=document.location.href;
		});
	}

	// Game running

	var lastGame;
	this.run=function(binary) {
		if (lastGame) {
			lastGame.stop();
			lastGame=0;
		}
		System.unpack(binary,model=>{
			broadcastEvent("onRun",[$,self,binary]);
			lastGame=new window[model.system.ENGINE](playPanel,{
				model:model,
				audioEnabled:CFG.audioEnabled,
				scale:1,
				fullScreen:true,
				zIndex:100,
				tapLabel:LOC._("console_tap"),
				dragLabel:LOC._("console_drag"),
				backLabel:LOC._("console_backtomenu"),
				orLabel:LOC._("console_or"),
				moveLabel:LOC._("console_move"),
				buttonALabel:LOC._("console_buttonalabel"),
				buttonBLabel:LOC._("console_buttonblabel"),
				buttonCLabel:LOC._("console_buttonclabel"),
				buttonDLabel:LOC._("console_buttondlabel"),
				buttonUpLabel:LOC._("console_buttonuplabel"),
				buttonDownLabel:LOC._("console_buttondownlabel"),
				buttonLeftLabel:LOC._("console_buttonleftlabel"),
				buttonRightLabel:LOC._("console_buttonrightlabel"),
				pullDownLabel:LOC._("console_pulldown"),
				upLabel:LOC._("console_up"),
				downLabel:LOC._("console_down"),
				leftLabel:LOC._("console_left"),
				rightLabel:LOC._("console_right"),
				screenPolicy:{
					portrait:{
						marginLeft:0.1,marginRight:0.1,marginTop:0,marginBottom:0,
						atX:0.5,atY:0.39
					},landscape:{
						marginLeft:0.2,marginRight:0.2,marginTop:0.1,marginBottom:0.1,
						atX:0.5,atY:0.5
					}
				},
				onReady:function() {
					self.endOption();
					setMode(true);
				},
				onPause:function() {
					if (!animation) setMode(false);
				},
				onResize:function(x,y,width,height,mode,ratio) {
					vectors.forEach(vector=>{
						var coord=vector[mode];
						var ox=x+(coord.x*width),oy=y+(coord.y*height);
						$(vector._node,{
							css:{
								width:width*coord.width+"px",
								height:height*coord.height+"px",
								lineHeight:height*coord.height+"px",
								fontSize:coord.fontSize*height+"px",
								top:oy+"px",
								left:ox+"px",
								borderRadius:(coord.borderRadius*ratio)+"px"
							}
						});
					});
				}
			});
		});
	}

	// --- INITIALIZE
	
	setMode(false);
	broadcastEvent("onStart",[$,self]);

}