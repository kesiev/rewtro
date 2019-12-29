function ModuleLoadFromQR(label,mode,qrcart) {
	return [{
		id:"loadqr_"+mode,
		label:label[0],
		onSelect: function ($,gameConsole) {
			var dialog=gameConsole.getDialog();

			// --- Prepare UI

			var help=$("div",{ set:{className:"bottomoverlay"} },dialog);
			
			function stopReader() {
				ModuleLoadFromQR[mode].stop(scanner,dialog);
				dialog.close();
				clearInterval(resizeInterval);
				gameConsole.endOption();
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

			addButton(LOC._("button_close"),10,0,function(){ stopReader(); })

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

			ModuleLoadFromQR[mode].registerOnScan(scanner,function(content){

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
				        		stopReader();
								qrcart.readQRCartParts(qrcartparts,binary=>{gameConsole.run(binary); });
				        	} else gameConsole.playAudio("shutter");
				        }
			        	updateProgress();
			        }
			    }
			});

			ModuleLoadFromQR[mode].waitForCameras(scanner,(id,total,camera)=>{
				addButton(LOC._("button_cameraid",id+1),10+(id+1)*40,{camera:camera,position:id},function(){
					if (preview) preview.style.display="none";
					gameConsole.setStorage("CAM_"+mode,this._id.position);
					ModuleLoadFromQR[mode].start(scanner,this._id.camera,dialog);
				});
				if (
					(gameConsole.setStorage("CAM_"+mode)&&(gameConsole.getStorage("CAM_"+mode)==id))
					||
					(!gameConsole.setStorage("CAM_"+mode)&&(id==total-1))
				) ModuleLoadFromQR[mode].start(scanner,camera,dialog);
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
	},
	waitForCameras:function(scanner,callback) {
	      var constraints,self=this;
	      if (scanner.iOS) callback(0,1,"Fake camera");
	      else {
	        navigator.mediaDevices.enumerateDevices().then(function(devices) {
	        	var deviceIds = [];
	            devices.forEach(function(device) { if (device.kind === 'videoinput') deviceIds.push(device.deviceId) });
	            if (scanner.firefox	&& (deviceIds.length==0) && !scanner.firefoxOk) {
		      		scanner.firefoxOk=true;
		      		navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(function(){
		      			self.waitForCameras(scanner,callback);
		      		}).catch(function(){console.log("ko")});
	            }
	            deviceIds.forEach((camera,id)=>{ callback(id,deviceIds.length,camera); })
	         }).catch(function(){
	         	console.log("Error")
	         }); 
	      }    
	},
	registerOnScan:function(scanner,callback) {
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
	start:function(scanner,camera,dialog) {
		if (scanner.stream) {
			scanner.canvasElement.width=scanner.canvasElement.width;
			scanner.videoElement.pause();	     
			scanner.stream.getTracks().forEach(function (track) { track.stop(); });
			dialog.removeChild(scanner.canvasElement);
			scanner.running=false;
		}
		var query;
		if (scanner.iOS) query={ video: { facingMode: "environment" } };
		else query={ video: { 'optional': [{ 'sourceId': camera }] } };
		navigator.mediaDevices.getUserMedia(query).then(function(stream) {
			scanner.stream=stream;
			scanner.videoElement.srcObject = stream;
    		scanner.videoElement.play();
    		dialog.appendChild(scanner.canvasElement);
			scanner.running=true;
			requestAnimationFrame(scanner.onFrame);
	    });
	},
	stop:function(scanner,dialog) {		
		scanner.videoElement.pause();	     
		scanner.stream.getTracks().forEach(function (track) { track.stop(); });
		dialog.removeChild(scanner.canvasElement);
		scanner.running=false;
	}
}

// --- Old, alternative and partially not-working adapters

ModuleLoadFromQR.jsqr={
	previewClassName:"qrPreviewVideo",
	create:function(previewId) {
		var canvasElement=document.createElement("canvas");
		canvasElement.className="qrPreviewVideo";
		var videoElement=document.createElement("video");
		videoElement.setAttribute("playsinline",true);
		return {
			running:true,
			canvasElement:canvasElement,
			canvasCtx:canvasElement.getContext("2d"),
			videoElement:videoElement,
			jsqr:false
		};
	},
	toggleTorch:function(scanner,to,callback) {
		if ( scanner.stream ) {
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
	},
	waitForCameras:function(scanner,callback) {
		navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
			callback(0,1,stream);	      
	    });        
	},
	registerOnScan:function(scanner,callback) {
		scanner.onFrame=function() {
			if (scanner.running) {
				if (scanner.videoElement.readyState === scanner.videoElement.HAVE_ENOUGH_DATA) {
					scanner.canvasElement.height = scanner.videoElement.videoHeight;
			        scanner.canvasElement.width = scanner.videoElement.videoWidth;
			        scanner.canvasCtx.drawImage(scanner.videoElement, 0, 0, scanner.canvasElement.width, scanner.canvasElement.height);
			        var imageData = scanner.canvasCtx.getImageData(0, 0, scanner.canvasElement.width, scanner.canvasElement.height);
			        var code = jsQR(imageData.data, imageData.width, imageData.height, {
			          inversionAttempts: "dontInvert",
			        });
			        if (code) callback(code);		        
			      }
			      requestAnimationFrame(scanner.onFrame);
			    }
		}
		requestAnimationFrame(scanner.onFrame);
	},
	start:function(scanner,camera,dialog) {
		scanner.stream=camera;
		scanner.videoElement.srcObject = camera;
	    scanner.videoElement.play();	      
		dialog.appendChild(scanner.canvasElement);
		scanner.running=true;
	},
	stop:function(scanner,dialog) {
		scanner.videoElement.pause();	     
		scanner.stream.getTracks().forEach(function (track) { track.stop(); });
		dialog.removeChild(scanner.canvasElement);
		scanner.running=false;
	}
}

function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

ModuleLoadFromQR.instascan={
	create:function(previewId) {
		return {
			instascan:new Instascan.Scanner({ video: document.getElementById("preview") })
		};
	},
	toggleTorch:function(scanner,to,callback) {
		if (
			scanner.instascan&&
			scanner.instascan._camera&&
			scanner.instascan._camera._stream
		) {
			const track = scanner.instascan._camera._stream.getVideoTracks()[0];
		      const imageCapture = new ImageCapture(track)
		      const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
		      	try {
			      	track.applyConstraints({ advanced: [{torch: to}] })
						.then(e=>{callback()})
						.catch(e => {})
				} catch (e) {}
		      });
		}
	},
	waitForCameras:function(scanner,callback) {
        Instascan.Camera.getCameras().then(function (cameras) {
        	if (cameras.length) {
        		// Added a custom property to instascan cameras
		      	if (cameras[0].iOS) {
			      	// Stuck only to last camera for weird instascan iOS compatibility (?)
			      	callback(0,1,cameras[cameras.length-1]);
			    } else cameras.forEach((camera,id)=>{ callback(id,cameras.length,camera);	})
			}
	    }).catch(function (e) { console.error(e); });	    
	},
	registerOnScan:function(scanner,callback) {
		scanner.instascan.addListener('scan', function (content) { callback(content); });
	},
	start:function(scanner,camera) {
		scanner.instascan.start(camera);
	},
	stop:function(scanner) {
		scanner.instascan.stop();
	}
}

ModuleLoadFromQR.zxing={
	create:function(previewId) {
		return {
			zxing:new ZXing.BrowserQRCodeReader()
		}
	},
	waitForCameras:function(scanner,callback) {
		scanner.zxing.getVideoInputDevices().then((cameras) => {
        	cameras.forEach((camera,id)=>{ callback(id,cameras.length,camera.deviceId);})
        })
        .catch((err) => { console.error(err) });
	},
	registerOnScan:function(scanner,callback) {
		scanner.onscan=callback;
	},
	start:function(scanner,camera) {
		scanner.zxing.reset();
		scanner.zxing.decodeFromInputVideoDeviceContinuously(camera, 'preview', (result, err) => {
			if (result) {
				var code,content="";

				var bytes=toUTF8Array(result.text);
				bytes.forEach(byte=>content+=String.fromCharCode(byte));
				alert(content);
				scanner.onscan(content);
				/*
				content=result.text;
				scanner.onscan(content);
				*/
			}
		});
	},
	stop:function(scanner) {
		scanner.zxing.reset();
	}
}

ModuleLoadFromQR.jsscanner={
	previewClassName:"qrPreviewVideo",
	create:function(previewId) { return { jbScanner:0 } },
	toggleTorch:function(scanner,to,callback) {
		if (
			scanner.jbScanner&&
			scanner.jbScanner.g&&
			scanner.jbScanner.g.a&&
			scanner.jbScanner.g.a.n
		) {
			const track = scanner.jbScanner.g.a.n.getVideoTracks()[0];
		      const imageCapture = new ImageCapture(track)
		      const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
		      	try {
			      	track.applyConstraints({ advanced: [{torch: to}] })
						.then(e=>{callback()})
						.catch(e => {})
				} catch (e) {}
		      });
		}
	},
	waitForCameras:function(scanner,callback) {
		navigator.mediaDevices.enumerateDevices().then(function(devices) {
            var exCameras = [];
            devices.forEach(function(device) { if (device.kind === 'videoinput')exCameras.push(device.deviceId) });
            exCameras.forEach((camera,id)=>{ callback(id,exCameras.length,camera); })
         });       
	},
	registerOnScan:function(scanner,callback) {
		scanner.onscan=callback;
	},
	start:function(scanner,camera,dialog) {
		if (scanner.jbScanner) {
			scanner.jbScanner.removeFrom(dialog)
			scanner.jbScanner.stopScanning();
		}
		var jbScanner=new JsQRScanner(text=>{
			alert(text);
			scanner.onscan(text);
		},function(){
			return navigator.mediaDevices.getUserMedia({
	            video: {
	              'optional': [{
	                'sourceId': camera
	                }]
	            }
	        }); 
		});
		//jbScanner.setSnapImageMaxSize(300);
		jbScanner.appendTo(dialog);
		scanner.jbScanner=jbScanner;
	},
	stop:function(scanner,dialog) {
		scanner.jbScanner.removeFrom(dialog)
		scanner.jbScanner.stopScanning();
	}
}