function ModuleInstaller(label) {
	return  [{
		id:"installer",
		hidden:true,
		label:label[0],
		promptTriggered:false,
		deferredInstall:false,
		install:function(gameConsole) {
			var self=this;
			if (self.deferredInstall) {
				self.deferredInstall.prompt().then(function() {
					return self.deferredInstall.userChoice;
				}).then(function(choice) {
					gameConsole.hideIcon("installer");
				}).catch(function(reason) {
					gameConsole.hideIcon("installer");
				});
			}
		},
		onStart:function($,gameConsole) {
			if (document.location.href.indexOf("user_mode=app")==-1) {
				if ('serviceWorker' in navigator) {
					if (!navigator.serviceWorker.controller) {
					  navigator.serviceWorker.register('worker.php', { scope: './'}).then(function(reg) {
					    console.log('Service worker has been registered for scope: '+ reg.scope);
					  });
					}
				}
				var self=this;
				window.addEventListener('beforeinstallprompt', function(e) {
					self.promptTriggered = true;
					e.preventDefault();
					self.deferredInstall = e;
					gameConsole.showIcon("installer");
				});
			}
		},
		onSelect: function ($,gameConsole) {
			this.install(gameConsole);
			gameConsole.endOption();
		}
	}]
}
