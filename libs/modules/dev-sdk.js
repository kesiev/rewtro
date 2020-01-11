function ModuleDevSdk(label,qrcart) {
	return  [{
		id:"dev-sdk",
		hidden:true,
		label:label[0],
		onStart:function($,gameConsole) {
			if (gameConsole.hasStorage("DEVMODE")) gameConsole.showIcon("dev-sdk");
		},
		onSelect: function ($,gameConsole) {
			gameConsole.endOption();
			var url=window.location.protocol+"//"+window.location.host+window.location.pathname;
			if (url[url.length-1]!="/") url+="/";
			url+="carts/";
			document.location.href=url;
		}
	}]
}
