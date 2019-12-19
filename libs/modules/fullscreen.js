function ModuleFullscreen(label) {
	return  [{
		id:"fullscreentoggle",
		label:label[0],
		onStart:function($,gameConsole) {
			var div=document.createElement('div');
			this.fullScreen=false;
			// Hide icon in PWA mode
			if (!(
				(window.matchMedia('(display-mode: standalone)').matches) ||
				(window.navigator.standalone) ||
				document.referrer.includes('android-app://') ||
				(document.location.href.indexOf("user_mode=app")!=-1)
			)) {
				if (div.requestFullscreen) this.fullScreen={request:"requestFullscreen",exit:"exitFullscreen",is:"fullscreen",on:"fullscreenchange",error:"fullscreenerror"};
				else if (div.webkitRequestFullscreen) this.fullScreen={request:"webkitRequestFullScreen",exit:"webkitExitFullscreen",is:"webkitIsFullScreen",on:"webkitfullscreenchange",error:"webkitfullscreenerror"};
				else if (div.mozRequestFullScreen) this.fullScreen={request:"mozRequestFullScreen",exit:"mozCancelFullScreen",is:"mozFullScreenElement",on:"mozfullscreenchange",error:"mozfullscreenerror"};
				else if (div.msRequestFullscreen) this.fullScreen={request:"msRequestFullscreen",exit:"msExitFullscreen",is:"msFullscreenElement",on:"MSFullscreenChange",error:"msfullscreenerror"};
			}
			if (!this.fullScreen) gameConsole.hideIcon("fullscreentoggle")
		},
		onSelect: function ($,gameConsole) {
			gameConsole.endOption();			
			if (!!document[this.fullScreen.is]) document[this.fullScreen.exit]();
			else gameConsole.node[this.fullScreen.request]();			
		}
	}]
}
