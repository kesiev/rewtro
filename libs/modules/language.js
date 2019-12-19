function ModuleLanguage(label) {
	return  [{
		id:"language",
		label:label[0],
		onSelect: function ($,gameConsole) {
			var buttons=[];
			var langs=LOC.getLanguages();
			langs.forEach(lang=>{
				buttons.push({
					label:lang.label,
					id:lang.id,
					onclick:function(dialog) {
						if (LOC.setLanguage(this.id)) gameConsole.reboot();
						else {
							dialog.close();
							gameConsole.endOption();
						}
					}
				})
			});
			gameConsole.getAlert("<i class='fas fa-language'></i>",buttons);			
		}
	}]
}
