function ModuleLoadFromQR(label,mode,qrcart) {
	return [{
		id:"loadqr_"+mode,
		label:label[0],
		onSelect: function ($,gameConsole) {
			var dialog=gameConsole.getDialog();

			// --- Prepare UI

			var help=$("div",{ set:{className:"bottomoverlay"} },dialog);
			
			function stopReader(endoption) {
				ModuleLoadFromQR[mode].stop(scanner,dialog);
				dialog.close();
				clearInterval(resizeInterval);
				if (endoption) gameConsole.endOption();
			}

			function abort() {
				stopReader(false);
				gameConsole.getAlert(LOC._("loadqr_permissions"),[
					{label:LOC._("button_ok"),onclick:function(dialog){
						dialog.close();
						gameConsole.endOption();
					}}
				]);
			}

			var readingSignature,partsloaded=0,partstoload=0,qrcartparts=[],lastqrcartpart=0;

			function updateProgress() {
				if (partstoload) {
					var html=LOC._("loadqr_scanning",partstoload);
					for (var i=0;i<partstoload;i++) {
						html+="<span class='";
						if (i==lastqrcartpart) html+="qrcode-last";
						else if (qrcartparts[i]) html+="qrcode-ready";
						else html+="qrcode-missing";
						html+="'><i class='fas fa-camera'></i></span>&nbsp;";
					}
					html+=LOC._("loadqr_progress",partstoload-partsloaded);
				} else html=LOC._("loadqr_tutorial");
				help.innerHTML=html;
			}
			updateProgress();

			function addButton(label,top,id,onclick) {
				var button=gameConsole.createButton(label,dialog,onclick);
				var div=$(button,{
					css:{
						position:"absolute",
						left:"10px",
						top:top+"px",
					},
					set:{
						_id:id,
					}
				},dialog);
				return div;
			}

			// --- Prepare camera and resize

			addButton(LOC._("button_close"),10,0,function(){ stopReader(true); })

			// --- Prepare scanner

			var view,preview=0;
			if (!ModuleLoadFromQR[mode].previewClassName)
				$("video",{set:{"playsinline":true,id:"preview"}},dialog);
			var scanner = ModuleLoadFromQR[mode].create();
			resizeInterval=setInterval(function(){
				if (ModuleLoadFromQR[mode].previewClassName) view=document.getElementsByClassName(ModuleLoadFromQR[mode].previewClassName)[0];
				else view=preview;
				if (view) {
					$(view,{
						css:{
							position:"absolute",
							transformOrigin:"0 0",
							zIndex:5,
							left:0,
							top:0
						}}
					);
					if (view) {					
						var
							width=view.clientWidth,
							height=view.clientHeight,
							dialogWidth=dialog.clientWidth,
							dialogHeight=dialog.clientHeight,
							scalex=dialogWidth/width,
							scaley=dialogHeight/height,
							scale;

						if (scalex*height<dialogHeight) scale=scalex;
						else scale=scaley;
						$(view,{
							css:{
								display:"block",
								transform:"translate("+((dialogWidth-(scale*width))/2)+"px,"+((dialogHeight-(scale*height))/2)+"px) scale("+scale+")"
							}}
						);
					}
				}
			},500);

			ModuleLoadFromQR[mode].registerOnScan(scanner,abort,function(content){

				// Read only QR-Cart
				if (content.substr(0,3)=="CRT") {
					var qrcartdata =qrcart.decodeQRCartPart(content);

			        // If it's the first cart that is reading...
					if (!partsloaded) {
						partstoload=qrcartdata.total;
						readingSignature=qrcartdata.signature;
					}
					// Read only the carts coming from the first set
					if (readingSignature==readingSignature) {
			        	lastqrcartpart=qrcartdata.id;
				        if (!qrcartparts[qrcartdata.id]) {				        	
				        	qrcartparts[qrcartdata.id]=qrcartdata;
				        	partsloaded++;
				        	if (partsloaded==partstoload) {
				        		stopReader(true);
								qrcart.readQRCartParts(qrcartparts,binary=>{gameConsole.run(binary); });
				        	} else gameConsole.playAudio("shutter");
				        }
			        	updateProgress();
			        }
			    }
			});

			ModuleLoadFromQR[mode].waitForCameras(scanner,abort,(id,total,camera)=>{
				addButton(LOC._("button_cameraid",id+1),10+(id+1)*40,{camera:camera,position:id},function(){
					if (preview) preview.style.display="none";
					gameConsole.setStorage("CAM_"+mode,this._id.position);
					ModuleLoadFromQR[mode].start(scanner,abort,this._id.camera,dialog);
				});
				if (
					(gameConsole.setStorage("CAM_"+mode)&&(gameConsole.getStorage("CAM_"+mode)==id))
					||
					(!gameConsole.setStorage("CAM_"+mode)&&(id==total-1))
				) ModuleLoadFromQR[mode].start(scanner,abort,camera,dialog);
			});

			// -- Prepare torch

			if (ModuleLoadFromQR[mode].toggleTorch) {
				var torchState=true;
				var torchbutton=addButton(LOC._("button_lightonoff"),10,0,function(){ ModuleLoadFromQR[mode].toggleTorch(scanner,torchState,function(){torchState=!torchState}); })
				$(torchbutton,{css:{left:"auto",right:"10px"}});
			}

		}
	}]
}

// Instascan with custom code for camera access.

ModuleLoadFromQR.instascanng={
	previewClassName:"qrPreviewVideo",
	create:function(previewId) {
		var canvasElement=document.createElement("canvas");
		canvasElement.className="qrPreviewVideo";
		var videoElement=document.createElement("video");
		videoElement.setAttribute("playsinline",true);
		return {
			iOS:Stream.DETECT.iOS,
			firefox:Stream.DETECT.firefox,
			running:true,
			instascan:new Instascan.Scanner({ video: videoElement, continuous:false, backgroundScan:false, captureImage:false }),
			canvasElement:canvasElement,
			canvasCtx:canvasElement.getContext("2d"),
			videoElement:videoElement,
			jsqr:false
		};
	},
	toggleTorch:function(scanner,to,callback) {
		try {
			if ( scanner.stream ) {
				if (window.ImageCapture) {
				const track =scanner.stream.getVideoTracks()[0];
			      const imageCapture = new ImageCapture(track)
			      const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
			      	try {
				      	track.applyConstraints({ advanced: [{torch: to}] })
							.then(e=>{callback()})
							.catch(e => {})
					} catch (e) {}
			      });
			  }
			}
		} catch (e) {

		}
	},
	waitForCameras:function(scanner,abort,callback) {
	      var constraints,self=this;
	      if (scanner.iOS) callback(0,1,"Fake camera");
	      else {
	        navigator.mediaDevices.enumerateDevices().then(function(devices) {
	        	var deviceIds = [];
	            devices.forEach(function(device) { if (device.kind === 'videoinput') deviceIds.push(device.deviceId) });
	            if (scanner.firefox	&& (deviceIds.length==0) && !scanner.firefoxOk) {
		      		scanner.firefoxOk=true;
		      		navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(function(){
		      			self.waitForCameras(scanner,abort,callback);
		      		}).catch(function(){abort()});
	            }
	            deviceIds.forEach((camera,id)=>{ callback(id,deviceIds.length,camera); })
	         }).catch(function(){
	         	abort()
	         }); 
	      }    
	},
	registerOnScan:function(scanner,abort,callback) {
		scanner.onFrame=function() {
			if (scanner.running) {
				if (scanner.videoElement.readyState === scanner.videoElement.HAVE_ENOUGH_DATA) {
					scanner.canvasElement.height = scanner.videoElement.videoHeight;
			        scanner.canvasElement.width = scanner.videoElement.videoWidth;
			        scanner.canvasCtx.drawImage(scanner.videoElement, 0, 0, scanner.canvasElement.width, scanner.canvasElement.height);
			        var result = scanner.instascan.scan();
			        if (result&&result.content) callback(result.content);		        
			      }
			      requestAnimationFrame(scanner.onFrame);
			    }
		}		
	},
	start:function(scanner,abort,camera,dialog) {
		if (scanner.stream) {
			scanner.canvasElement.width=scanner.canvasElement.width;
			scanner.videoElement.pause();	     
			scanner.stream.getTracks().forEach(function (track) { track.stop(); });
			dialog.removeChild(scanner.canvasElement);
			scanner.running=false;
		}
		var query;
		if (scanner.iOS) query={ video: { facingMode: "environment" } };
		else query={ video: { 'deviceId': camera } };
		navigator.mediaDevices.getUserMedia(query).then(function(stream) {
			scanner.stream=stream;
			scanner.videoElement.srcObject = stream;
    		scanner.videoElement.play();
    		dialog.appendChild(scanner.canvasElement);
			scanner.running=true;
			requestAnimationFrame(scanner.onFrame);
	    }).catch(function(){
         	abort()
         }); 
	},
	stop:function(scanner,dialog) {		
		scanner.videoElement.pause();
		if (scanner.stream) scanner.stream.getTracks().forEach(function (track) { track.stop(); });
		if (scanner.canvasElement.parentNode) dialog.removeChild(scanner.canvasElement);
		scanner.running=false;
	}
}
