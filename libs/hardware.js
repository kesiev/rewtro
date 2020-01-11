var  Hardware=function(parent,CFG) {

	function printEmoji(emoji) { return "<span style='font-family:Segoe UI Emoji;font-size:25px'>"+emoji+"</span>"; }
	function printKey(key) {
		return "<span style='font-size:12px;margin:0 2px;padding:1px 3px 1px 3px;border:2px solid #999;background-color:#fff;border-bottom:6px solid #333;border-radius:5px;color:#000'>"+key+"</span>";
	}

	// --- CONSTS

	var
		ISFIREFOX=navigator.userAgent.toLowerCase().indexOf("firefox") > -1,
		DEGTORAD=3.14/180,
		MSPF=Math.ceil(1000/CFG.fps),
		SCREENPOLICY=CFG.screenPolicy||{
			portrait:{
				marginLeft:0,marginRight:0,marginTop:0,marginBottom:0,
				atX:0.5,atY:0.5
			},landscape:{
				marginLeft:0,marginRight:0,marginTop:0,marginBottom:0,
				atX:0.5,atY:0.5
			}
		},
		TAPLABEL=CFG.tapLabel||("Tap "+printEmoji("&#x1F447;")),
		DRAGLABEL=CFG.dragLabel||("Drag "+printEmoji("&#x1F447;")),
		BACKLABEL=CFG.backLabel||"Back",
		ORLABEL=CFG.orLabel||" or ",
		MOVELABEL=CFG.moveLabel||"Move",
		BUTTONALABEL=CFG.buttonALabel||"Button A",
		BUTTONBLABEL=CFG.buttonBLabel||"Button B",
		BUTTONCLABEL=CFG.buttonCLabel||"Button C",
		BUTTONDLABEL=CFG.buttonDLabel||"Button D",
		PULLDOWNLABEL=CFG.pullDownLabel||("Pull down "+printEmoji("&#x1F447;")),
		UPLABEL=CFG.upLabel||"Up",
		DOWNLABEL=CFG.downLabel||"Down",
		LEFTLABEL=CFG.leftLabel||"Left",
		RIGHTLABEL=CFG.rightLabel||"Right",
		DEADZONE=0.3, PULLSIZE=3, PULLSIZE=0.2,
		ISTOUCH=!!('ontouchstart' in window || navigator.maxTouchPoints);

	// --- HELPERS

	function clone(a) { return JSON.parse(JSON.stringify(a)); }

	function addEventListener(node,evt,cb,rt) {
		if (node.addEventListener) node.addEventListener(evt,cb,rt);
		else node.attachEvent("on"+evt,cb)
	}

	function removeEventListener(node,evt,cb,rt) {
		if (node.removeEventListener) node.removeEventListener(evt,cb,rt);
		else node.detachEvent("on"+evt,cb)
	}

	function newCanvas(width,height) {
		var canvas=document.createElement("canvas");
		if (ISFIREFOX)
			canvas.style.imageRendering="-moz-crisp-edges";
		else {
			canvas.style.imageRendering="pixelated";
			canvas.style.fontSmoothing="none";
		}
		canvas.width=width;
		canvas.height=height;
		var ctx=canvas.getContext("2d");
		ctx.webkitImageSmoothingEnabled = ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.oImageSmoothingEnabled = ctx.msImageSmoothingEnabled= false;
		return {
			cnv:canvas,
			ctx:ctx,
			width:width,
			height:height,
			fix:function() {
				this.ctx.webkitImageSmoothingEnabled = this.ctx.imageSmoothingEnabled = this.ctx.mozImageSmoothingEnabled = this.ctx.oImageSmoothingEnabled = this.ctx.msImageSmoothingEnabled= false;
			},
			getData:function(){
				return this.ctx.getImageData(0,0,this.cnv.width, this.cnv.height)
			},
			putData:function(data){
				this.ctx.putImageData(data,0,0);
			}
		}
	}

	function isOnScreen(x,y,width,height) {
		return !((y+height<-height)||(x+width<-width)||(y>CFG.screenHeight+height)||(x>CFG.screenWidth+width));
	}

	// Screen resize

	var doResize=0,screenMode="landscape",screenWidth,screenHeight,screenHeight;

	function resize() {
		if (CFG.fullScreen) {
			var x,y,ratio,trim,newmode;
			screenWidth=parent.clientWidth;
			screenHeight=parent.clientHeight;
			if (screenWidth>screenHeight) newMode="landscape";
			else newMode="portrait";
			if (newMode!=screenMode) {
				screenMode=newMode;
				showInputHelp();
			} else resizeHelp();
			var trim=SCREENPOLICY[screenMode];
			var marginLeft=trim.marginLeft*screenWidth,
				marginRight=trim.marginRight*screenWidth,
				marginTop=trim.marginTop*screenHeight,
				marginBottom=trim.marginBottom*screenHeight;
			screenWidth-=marginRight+marginLeft;
			screenHeight-=marginBottom+marginTop;
			var xratio=Math.floor(screenWidth/CFG.renderWidth*10)/10, yratio=Math.floor(screenHeight/CFG.renderHeight*10)/10;
			if (xratio*CFG.renderHeight<screenHeight) ratio=xratio;
			else ratio=yratio;
			ratio=(Math.floor(ratio*100)/100);
			x=marginLeft+Math.floor(screenWidth*trim.atX-(ratio*CFG.renderWidth/2));
			y=marginTop+Math.floor(screenHeight*trim.atY-(ratio*CFG.renderHeight/2));
			screen.cnv.style.display="block";
			screen.cnv.style.transform="scale("+ratio+")";
			screen.cnv.style.left=x;
			screen.cnv.style.top=y;
			if (CFG.onResize) CFG.onResize(x,y,CFG.renderWidth*ratio,CFG.renderHeight*ratio,screenMode,ratio);
		}
	}

	function askResize() { doResize=10; }

	// --- AUDIO


	// --- INITIALIZATION

	// Initialize screen
	var screen=newCanvas(CFG.screenWidth,CFG.screenHeight);
	var blitCache=newCanvas(1,1);
	screen.cnv.className="gameScreen";
	if (CFG.zIndex!==undefined) screen.cnv.style.zIndex=CFG.zIndex;
	screen.cnv.tabIndex=1;
	screen.cnv.style.backgroundColor=CFG.background;
	screen.cnv.style.width=CFG.renderWidth;
	screen.cnv.style.height=CFG.renderHeight;
	if (CFG.fullScreen) {
		screen.cnv.style.position="absolute";
		screen.cnv.style.transformOrigin="0 0";
		screen.cnv.style.display="none";
		addEventListener(window,"resize",askResize);
		askResize();
	} else {
		screen.cnv.style.width=CFG.renderWidth*(CFG.scale||1);
		screen.cnv.style.height=CFG.renderHeight*(CFG.scale||1);
	}	

	// Initialize keyboard
	
	var touchAnalog={},addTouchButtons=[],keys={escape:27};
	CFG.controller.forEach(button=>{
		switch (button) {
			case "up":{
				touchAnalog.enabled=touchAnalog.up=keys.up=38;
				break;
			}
			case "down":{
				touchAnalog.enabled=touchAnalog.down=keys.down=40;
				break;
			}
			case "left":{
				touchAnalog.enabled=touchAnalog.left=keys.left=37;
				break;
			}
			case "right":{
				touchAnalog.enabled=touchAnalog.right=keys.right=39;
				break;
			}
			case "buttonA":{				
				addTouchButtons.unshift({label:TAPLABEL+" "+ORLABEL+" "+printKey("Z")+"<br>"+BUTTONALABEL,key:keys.buttonA=90});
				break;
			}
			case "buttonB":{
				addTouchButtons.unshift({label:TAPLABEL+" "+ORLABEL+" "+printKey("X")+"<br>"+BUTTONBLABEL,key:keys.buttonB=88});
				break;
			}
			case "buttonC":{
				addTouchButtons.unshift({label:TAPLABEL+" "+ORLABEL+" "+printKey("C")+"<br>"+BUTTONCLABEL,key:keys.buttonC=67});
				break;
			}
			case "buttonD":{
				addTouchButtons.unshift({label:TAPLABEL+" "+ORLABEL+" "+printKey("V")+"<br>"+BUTTONDLABEL,key:keys.buttonD=86});
				break;
			}
		}
	});

	// Control
	var rawKeyboard=[],keyboard={};
	function onMouseDown() {
		AudioEngine.request();
	}
	function keyDown(key) {
		AudioEngine.request();
		rawKeyboard[key]=1;
	};
	function keyUp(key) { rawKeyboard[key]=0; };
	function resetControls() {
		rawKeyboard=[];
		for (var i in keys) keyboard[i]=0;
		setAnalog(analogCurrent,analogIdle);
		touchLayout.forEach(button=>{
			button.id=button.pressed=0;
			delete button.center;
		});
	}

	var helpLayer,helpDisplayed,hideTimeout;
	function resizeHelp() {
		if (helpDisplayed) {
			touchLayout.forEach((button,id)=>{
				button=button[screenMode];
				var btn=helpLayer._buttons[id];
				var height=(screenHeight*(button.y2-button.y1)-10);
				var padding=(height/2-25);
				btn.style.left=(screenWidth*button.x1+5)+"px";
				btn.style.top=(screenHeight*button.y1+5)+"px";
				btn.style.width=(screenWidth*(button.x2-button.x1)-10)+"px";
				btn.style.height=(height-padding)+"px";
				btn.style.paddingTop=padding+"px";
			});
		}
	}
	function showInputHelp() {
		if (CFG.fullScreen) {
			if (!helpDisplayed) {
				if (!helpLayer) {
					helpLayer=document.createElement("div");
					helpLayer.style.position="absolute";			
					helpLayer.style.zIndex=(CFG.zIndex||0)+100;
					helpLayer.style.left=helpLayer.style.right=helpLayer.style.top=helpLayer.style.bottom=0;
					helpLayer.style.pointerEvents="none";
					helpLayer._buttons=[];
					touchLayout.forEach(button=>{
						button=button[screenMode];
						var btn=document.createElement("div");
						btn.style.textAlign="center";
						btn.style.backgroundColor="rgba(0,0,0,0.9)";
						btn.style.borderRadius="5px";
						btn.style.color="#fff";
						btn.style.position="absolute";
						btn.style.overflow="hidden";
						btn.innerHTML=button.label;
						btn.style.fontSize="12px";
						btn.style.lineHeight="25px";
						btn.style.fontFamily="sans-serif";
						helpLayer.appendChild(btn);
						helpLayer._buttons.push(btn);
					});
				}
				parent.appendChild(helpLayer);
				resizeHelp();
				helpDisplayed=true;
			}
			clearTimeout(hideTimeout);
			hideTimeout=setTimeout(hideInputHelp,3000);
		}
	}
	function hideInputHelp() {
		if (CFG.fullScreen) {
			if (helpDisplayed) parent.removeChild(helpLayer);
			helpDisplayed=false;
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout=0;
			}
		}
	}

	// Prepare touch controls
	var		
		touchLayout=[{
			portrait:{x1:0,y1:0,x2:1,y2:PULLSIZE,pull:27,label:PULLDOWNLABEL+" "+ORLABEL+" "+printKey("ESC")+"<br>"+BACKLABEL},
			landscape:{x1:0,y1:0,x2:1,y2:PULLSIZE,pull:27,label:PULLDOWNLABEL+" "+ORLABEL+" "+printKey("ESC")+"<br>"+BACKLABEL}
		}],
		analogMap=[
			{left:1,right:0,up:1,down:0},
			{left:1,right:0,up:0,down:0},
			{left:1,right:0,up:0,down:1},
			{left:0,right:0,up:0,down:1},
			{left:0,right:1,up:0,down:1},
			{left:0,right:1,up:0,down:0},
			{left:0,right:1,up:1,down:0},
			{left:0,right:0,up:1,down:0}
		],
		analogIdle={left:0,right:0,up:0,down:0},
		analogCurrent={left:0,right:0,up:0,down:0},
		keyState,buttonX=0.5,controllerLabel=DRAGLABEL+" "+ORLABEL+" "+printKey(UPLABEL)+printKey(DOWNLABEL)+printKey(LEFTLABEL)+printKey(RIGHTLABEL)+"<br>"+MOVELABEL
	if (touchAnalog.enabled) touchLayout.push({
		portrait:{x1:0,y1:0.5,x2:0.5,y2:1,analog:true,label:controllerLabel},
		landscape:{x1:0,y1:PULLSIZE,x2:0.5,y2:1,analog:true,label:controllerLabel}
	}); else buttonX=0;
	addTouchButtons.forEach((button,id)=>{
		touchLayout.push({
			portrait:{
				x1:buttonX,
				y1:0.5+(0.5/addTouchButtons.length)*id,
				x2:1,
				y2:0.5+(0.5/addTouchButtons.length)*(id+1),
				label:button.label,
				key:button.key
			},
			landscape:{
				x1:buttonX,
				y1:PULLSIZE+((1-PULLSIZE)/addTouchButtons.length)*id,
				x2:1,
				y2:PULLSIZE+((1-PULLSIZE)/addTouchButtons.length)*(id+1),
				label:button.label,
				key:button.key
			}
		})
	});
	function setAnalog(current,state) {
		for (var a in current) 
			if (touchAnalog[a]!==undefined) {
				keyState=!!state[a];
				if (current[a]!=keyState) {
					if (state[a]) keyDown(touchAnalog[a]); else keyUp(touchAnalog[a]);
					current[a]=keyState;
				}
			}
	}
	function onTouchStart(e) {
		var touch,x,y;
		AudioEngine.request();
		for (var a=0;a<e.changedTouches.length;a++) {
			touch=e.changedTouches[a];
			x=touch.clientX/parent.clientWidth;
			y=touch.clientY/parent.clientHeight;		
			touch=e.changedTouches[a];
			touchLayout.forEach(button=>{
				button=button[screenMode];
				if ((x>=button.x1)&&(x<=button.x2)&&(y>=button.y1)&&(y<=button.y2)) {
					button.pressed=1;
					button.id=touch.identifier;
					if (button.key) keyDown(button.key);
					else if (button.analog) {
						button.center={x:touch.clientX,y:touch.clientY};
						setAnalog(analogCurrent,analogIdle);
					} else if (button.pull)
						button.center={x:touch.clientX,y:touch.clientY};
				}
			});
		}
		e.preventDefault(); 
	}
	function onTouchMove(e) {
		var touch,pos,ang,dx,dy,dist;
		for (var a=0;a<e.changedTouches.length;a++) {
			touch=e.changedTouches[a];
			touchLayout.forEach(button=>{
				button=button[screenMode];
				if (button.pressed&&(button.id==touch.identifier)) {
					if (button.analog) {
						pos=analogIdle;
						dx=button.center.x-touch.clientX;
						dy=button.center.y-touch.clientY;
						dist=Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
						if (dist>DEADZONE) {
							ang=(Math.atan2(dx,dy)  * 180 / Math.PI)-22;
							if (ang < 0) ang = 360 + ang;
							pos=analogMap[Math.floor(ang/45)];
						}
						setAnalog(analogCurrent,pos);
					} else if (button.pull) {
						dy=touch.clientY-button.center.y;
						if (dy>PULLSIZE) {
							keyDown(button.pull);
							button.pressed=0;
						}						
					}
				}
			});
		}
		e.preventDefault();
	}
	function onTouchEnd(e) {
		var touch;
		for (var a=0;a<e.changedTouches.length;a++) {
			touch=e.changedTouches[a];
			touchLayout.forEach(button=>{
				button=button[screenMode];
				if (button.pressed&&(button.id==touch.identifier)) {
					button.id=button.pressed=0;
					if (button.key) keyUp(button.key);
					else if (button.analog) {
						setAnalog(analogCurrent,analogIdle);
						delete button.center;
					} else if (button.pull)
						delete button.center;
				}
			});
		}
		e.preventDefault(); 
	}
	function onMouseMove() {
		showInputHelp();
	}

	// Prepare keyboard controls
	function onKeyUp(e) { keyUp(e.keyCode); e.preventDefault(); }
	function onKeyDown(e) { keyDown(e.keyCode); e.preventDefault(); }

	// Controls
	function enableControls() {
		addEventListener(parent,"mousedown",onMouseDown);
		addEventListener(parent,"mousemove",onMouseMove);
		addEventListener(parent,"touchstart",onTouchStart);
		addEventListener(parent,"touchend",onTouchEnd);
		addEventListener(parent,"touchmove",onTouchMove);
		addEventListener(screen.cnv,"keydown", onKeyDown );
		addEventListener(screen.cnv,"keyup", onKeyUp );
	}
	function disableControls() {
		removeEventListener(parent,"mousedown",onMouseDown);
		removeEventListener(parent,"mousemove",onMouseMove);
		removeEventListener(parent,"touchstart",onTouchStart);
		removeEventListener(parent,"touchend",onTouchEnd);
		removeEventListener(parent,"touchmove",onTouchMove);
		removeEventListener(screen.cnv,"keydown", onKeyDown );
		removeEventListener(screen.cnv,"keyup", onKeyUp );
	}

	// Finalize
	parent.appendChild(screen.cnv);

	// --- MAIN LOOP

	var timeout,logicLoop,renderLoop,frameDone=1,playing=true;

	window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || 0;

    if (!window.requestAnimFrame) {
 		window.requestAnimFrame = function( callback ){ callback() };
 		MODE_benchmark=1;
    }

    function pause() {
    	playing=false;
    	disableControls();
    	resetControls();
    	AudioEngine.stopAudio();
    	CFG.onPause();
    }

    var focusTimeout;
    function resume() {
    	playing=true;
    	resize();
    	resetControls();
    	enableControls();
    	showInputHelp();
    	focusTimeout=setTimeout(function(){ screen.cnv.focus(); },100);
    }

	function getTimestamp() { return (new Date()).getTime(); };

	function scheduleNextLogicLoop(ts) {
		clearTimeout(timeout);
		var wait = MSPF - getTimestamp() + frameTimestamp;
		if (wait<=0) wait=1;
		timeout = setTimeout(doLogicLoop, wait);			
	};

	function doRenderLoop() {

		// Screen resize
		if (doResize) {
			resize();
			doResize--;
		}

		// Rendering
		renderLoop();

		frameDone=1;
	}

	function doLogicLoop() {

		if (playing) {

			var ts=getTimestamp();
			frameTimestamp=ts;

			// Keyboard handling
			for (var a in keys)
				if (rawKeyboard[keys[a]]) keyboard[a]++;
				else keyboard[a]=0;

			if (CFG.onPause&&keyboard.escape) pause();

			// Logic
			if (logicLoop) logicLoop(this);

			if (frameDone) {
				frameDone=0;
				window.requestAnimFrame(doRenderLoop);
			}
			
		}

		// Schedule next frame
		scheduleNextLogicLoop();

	}

	// Starts
	resume();
	doLogicLoop();

	// --- API - Audio

	this.keyboard=keyboard;

	this.pause=pause;
	this.resume=resume;

	this.stopChannel=function(ch) {
		if (playing) AudioEngine.stopChannel(ch);
	};
	this.playAudio=function(hwchannel,audio,channel) {
		if (playing) AudioEngine.playAudio(hwchannel,audio,channel);
	}
	this.stopAudio=function(ch) {
		if (playing) AudioEngine.stopAudio(ch);
	};
	this.generateNoise=function(parms,frequency) { return AudioEngine.generateNoise(parms,frequency) };
	this.createAudioChannel=function(volume) { return AudioEngine.createAudioChannel(volume) };

	// API - Screen

	this.setBackgroundColor=function(c) { screen.cnv.style.backgroundColor=c; }

	this.setMainLoop=function(logic,render) {
		logicLoop=logic;
		renderLoop=render;
	}

	this.screenClear=function() {
		screen.cnv.width=CFG.screenWidth;
		screen.fix();
	}

	this.rect=function(color,flipx,flipy,ang,opacity,scale,dx,dy,dw,dh) {
		if (isOnScreen(dx,dy,dw,dh)) {
			dx=Math.floor(dx);
			dy=Math.floor(dy);

			screen.ctx.fillStyle=color;

			if (flipx||flipy||ang||(opacity<1)||(scale!=1)) {

				var tx=dw/2,ty=dh/2,fx=flipx?-scale:scale,fy=flipy?-scale:scale;

				screen.ctx.save();
				screen.ctx.transform(fx,0,0,fy,dx+tx, dy+ty);
				screen.ctx.rotate(ang*DEGTORAD);
				screen.ctx.translate(-tx, -ty);
				screen.ctx.globalAlpha=opacity;

				screen.ctx.fillRect(0,0,dw,dh);
				screen.ctx.restore();

			} else {
				screen.ctx.fillRect(dx,dy,dw,dh);
			}
		}
	}

	this.blit=function(from,flipx,flipy,ang,opacity,scale,sx,sy,sw,sh,dx,dy,dw,dh) {
		if (isOnScreen(dx,dy,dw,dh)) {
			dx=Math.floor(dx);
			dy=Math.floor(dy);
			dw=Math.floor(dw);
			dh=Math.floor(dh);

			if (flipx||flipy||ang||(opacity<1)||(scale!=1)) {

				var tx=dw/2,ty=dh/2,fx=flipx?-scale:scale,fy=flipy?-scale:scale;

				if (ang||(scale!=1)) {
					blitCache.cnv.width=sw;
					blitCache.cnv.height=sh;
					blitCache.ctx.drawImage(from,sx,sy,sw,sh,0,0,sw,sh);
					from=blitCache.cnv;
					sx=sy=0;
				}

				screen.ctx.save();
				screen.ctx.transform(fx,0,0,fy,dx+tx, dy+ty);
				screen.ctx.rotate(ang*DEGTORAD);
				screen.ctx.translate(-tx, -ty);
				screen.ctx.globalAlpha=opacity;

				screen.ctx.drawImage(from,sx,sy,sw,sh,0,0,dw,dh);
				screen.ctx.restore();

			} else {
				screen.ctx.drawImage(from,sx,sy,sw,sh,dx,dy,dw,dh);
			}
		}
	}

	// API - Logic

	this.stop=function() {
		hideInputHelp();
		clearTimeout(timeout);
		clearInterval(focusTimeout);
		screen.cnv.blur();
		removeEventListener(window,"resize",askResize);
		AudioEngine.stopAudio();
		disableControls();
		parent.removeChild(screen.cnv);
	}
}