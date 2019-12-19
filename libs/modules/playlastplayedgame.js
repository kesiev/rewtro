function ModulePlayLastPlayedGame(label) {
	return [{
		id:"lastplayed_play",
		label:label[0],
		onStart:function($,gameConsole) {
			if (!gameConsole.hasStorage("LASTGAME")) {
				gameConsole.hideIcon("lastplayed_play");
				gameConsole.hideIcon("lastplayed_discard");
				gameConsole.hideIcon("datasette");
			}
		},
		onRun: function ($,gameConsole,data) {
			gameConsole.setStorage("LASTGAME",data);
			gameConsole.showIcon("lastplayed_play");
			gameConsole.showIcon("lastplayed_discard");
			gameConsole.showIcon("datasette");
		},
		onSelect: function ($,gameConsole) {			
			gameConsole.run(gameConsole.getStorage("LASTGAME"));
		}
	},{
		id:"lastplayed_discard",
		label:label[1],
			onSelect: function ($,gameConsole) {	
				gameConsole.getAlert(LOC._("lastplayed_discard_confirm"),[
					{label:LOC._("button_yesdiscard"),onclick:function(dialog){
						gameConsole.removeStorage("LASTGAME");
						gameConsole.hideIcon("lastplayed_play");
						gameConsole.hideIcon("lastplayed_discard");
						gameConsole.hideIcon("datasette");
						gameConsole.getAlert(LOC._("lastplayed_discard_discarded"),[
							{label:LOC._("button_ok"),onclick:function(dialog){
								dialog.close();
								gameConsole.endOption();
							}}
						]);
					}},
					{label:LOC._("button_nokeep"),onclick:function(dialog){
						dialog.close();
						gameConsole.endOption();
					}}
				]);
		}
	}]
}
