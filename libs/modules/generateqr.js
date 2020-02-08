function ModuleGenerateQR(label,qrcart) {
	return  [{
		id:"datasette",
		label:label[0],
		runDatasette:function($,gameConsole) {

			var dialog=gameConsole.getDialog();

			qrcart.createQRCart({
				model:"screen",
				name:LOC._("label_sharedgame")
			},gameConsole.getStorage("LASTGAME"),cart=>{

				var interval,lastcode,cache=[];

				function stopAuto() {
					if (interval) {
						clearInterval(interval);
						interval=0;
					}
				}

				function togglePlayStop() {
					if (interval) stopAuto();
					else {
						interval=setInterval(function(){
							showQR((lastcode+1)%cart.qrCount());
						}, qrcart.QRCARTSPEED);
					}
					showQR(lastcode);
				}

				function showQR(id) {
					lastcode=id;
					if (!cache[id]) cache[id]=cart.createDataURL(id);
					$(viewer,{css:{backgroundImage:"url('"+cache[id]+"')"}});
					$(footerbar,{set:{innerHTML:""}});
					for (var i=0;i<cart.qrCount();i++) {
						var button=gameConsole.createButton(i+1,footerbar,function(){
							stopAuto();
							showQR(this._qr)
						});	
						button._qr=i;
						if (i==id) button.className+=" selected";
					}
					var button=gameConsole.createButton(interval?"<i class='fas fa-stop'></i>":"<i class='fas fa-play'></i>",footerbar,togglePlayStop);
					if (interval) button.className+=" selected";
				}

				var viewer=$("div",{set:{className:"qrviewer"},css:{backgroundSize:"contain"}},dialog);
				var footerbar=$("div",{set:{className:"qrviewerfooterbar"}},dialog);
				var topbar=$("div",{set:{className:"qrviewertopbar"}},dialog);
				gameConsole.createButton("<i class='fas fa-times-circle'></i>",topbar,function(){
					stopAuto();
					dialog.close();
					gameConsole.endOption();
				});
				gameConsole.createButton("<i class='fas fa-search-minus'></i>",topbar,function(){
					$(viewer,{css:{backgroundSize:""}});
				});
				gameConsole.createButton("<i class='fas fa-search'></i>",topbar,function(){
					$(viewer,{css:{backgroundSize:"75%"}});
				});
				gameConsole.createButton("<i class='fas fa-search-plus'></i>",topbar,function(){
					$(viewer,{css:{backgroundSize:"contain"}});
				});
				showQR(0);
				togglePlayStop();
			
			});	
		},
		onSelect: function ($,gameConsole) {
			if (!gameConsole.hasStorage("DATASETTE_TUTORIAL")) {
				gameConsole.setStorage("DATASETTE_TUTORIAL",1);
				var self=this;
				gameConsole.getAlert(LOC._("datasette_tutorial"),[
					{label:LOC._("button_ok"),onclick:function(dialog){
						dialog.close();
						self.runDatasette($,gameConsole);
					}}
				]);
			} else this.runDatasette($,gameConsole);
		}
	}]
}
