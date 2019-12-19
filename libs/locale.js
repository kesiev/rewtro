function LocaleManager(language) {

	this.getLanguages=function() {
		var ret=[];
		for (var k in LocaleManager.languages)
			ret.push({id:k,label:LocaleManager.languages[k].LABEL});
		return ret;
	}

	this.setLanguage=function(lang) {
		if (LocaleManager.languages[lang]) {
			if (window&&window.localStorage) {
				if (window.localStorage["_CRT_LANGUAGE"]!=lang) {
					window.localStorage["_CRT_LANGUAGE"]=lang;
					return true;
				} else return false;
			} else return false;
		} else return false;
	}

	this._=function(key) {
		if (!language) {
			language="EN";
			if (window&&window.localStorage) language=window.localStorage["_CRT_LANGUAGE"];
			if (!LocaleManager.languages[language]) {
				var userLang = navigator.language || navigator.userLanguage;
				if (userLang) {
					userLang=userLang.split("-")[0].toUpperCase();
					if (LocaleManager.languages[userLang]) language=userLang;
				}
			}
		}
		var data=LocaleManager.languages[language];
		var string=data&&data[key]?data[key]:"{"+key+"}";
		string=string.replace(/\{([0-9]+)\}/g,(a,b)=>{
			if (arguments[b]!==undefined) return arguments[b]
			else return "";
		});
		return string;
	}

}

LocaleManager.languages={};

LocaleManager.languages.EN={
	LABEL:"English",
	// --- Credits
	credits:"Credits",
	credits_techs:"Rewtro exists thanks to these techs:",
	credits_people:"...and this great people support:",
	// --- Global
	button_ok:"<i class='fas fa-thumbs-up'></i> OK",
	button_close:"<i class='fas fa-times-circle'></i> Close",
	// --- Language
	language_change:"Change language",
	// --- Main menu
	qrcart_load:"Load QR-Cart{1}",
	qrcart_datasette:"Datasette",
	lastplayed_run:"Run last played game",
	lastplayed_discard:"Discard last played game",
	fullscreen_toggle:"Toggle fullscreen",
	label_sharedgame:"Shared game",
	// --- Last played management
	lastplayed_discard_confirm:"Do you want to discard your last played game?<br>To play it again you've to load id from QR-Carts and other media.",
	button_yesdiscard:"<i class='fas fa-trash-alt'></i> Yes, discard the game.",
	button_nokeep:"<i class='fas fa-undo'></i> No, keep it.",
	lastplayed_discard_discarded:"Saved game discarded.",
	// --- QR-Cart scanner
	button_lightonoff:"<i class='fas fa-lightbulb'></i> ON/OFF",
	button_cameraid:"<i class='fas fa-camera'></i> CAM {1}",
	loadqr_tutorial:"Point the camera to a <i class='fas fa-qrcode'></i> QR-Cart to load it.",
	loadqr_progress:"<br>Scan <b>{1}</b> QR-Carts to go!",
	loadqr_scanning:"Scanning a <b>{1}</b> QR-Cart game.<br>",
	// --- Installer
	installer_install:"Install Rewtro",
	// --- Datasette
	datasette_tutorial:"With the <i class='fas fa-tape'></i> Datasette you can share your last played game with a friend without using a QR-Cart.<br><br>Open Rewtro on his device, choose <i class='fas fa-camera'></i> Load QR-Cart and keep framing the animated code in the center of this screen until the game is started.<br><br>If the game is not loading try changing this screen brightness or the QR-Code size using the buttons on the top of the screen.",
	// --- Console
	console_backtomenu:"Go to menu",
	console_paused:"Game paused. <i class='fas fa-gamepad'></i> Hit here to play!",
	console_nogame:"Load a game using <i class='fas fa-camera'></i> Load from QR-Cart",
	console_tap:"Tap <i class='fas faa-pulse animated fa-hand-pointer'></i>",
	console_drag:"Drag <i class='fas faa-wrench animated fa-hand-pointer'></i>",
	console_or:"/",
	console_move:"Move",
	console_buttonalabel:"Button A",
	console_buttonblabel:"Button B",
	console_buttonclabel:"Button C",
	console_buttondlabel:"Button D",
	console_pulldown:"Pull down <i class='fas faa-bounce animated fa-hand-pointer'></i>",
	console_up:"<i class='fas fa-arrow-up'></i>",
	console_down:"<i class='fas fa-arrow-down'></i>",
	console_left:"<i class='fas fa-arrow-left'></i>",
	console_right:"<i class='fas fa-arrow-right'></i>"
}

LocaleManager.languages.IT={
	LABEL:"Italiano",
	// --- Credits
	credits:"Crediti",	
	credits_techs:"Rewtro esiste grazie a queste tecnologie:",
	credits_people:"...ed il supporto di queste persone:",
	// --- Global
	button_ok:"<i class='fas fa-thumbs-up'></i> OK",
	button_close:"<i class='fas fa-times-circle'></i> Chiudi",
	// --- Language
	language_change:"Cambia lingua",
	// --- Main menu
	qrcart_load:"Carica QR-Cart{1}",
	qrcart_datasette:"Registratore",
	lastplayed_run:"Rigioca all'ultimo gioco",
	lastplayed_discard:"Cancella l'ultimo gioco giocato",
	fullscreen_toggle:"Vai/esci da schermo intero",
	label_sharedgame:"Gioco condiviso",
	// --- Last played management
	lastplayed_discard_confirm:"Vuoi davvero eliminare l'ultimo gioco al quale hai giocato?<br>Per giocarci di nuovo dovrai caricarlo da una QR-Cart o da altre parti.",
	button_yesdiscard:"<i class='fas fa-trash-alt'></i> Si, eliminalo.",
	button_nokeep:"<i class='fas fa-undo'></i> No, tienilo.",
	lastplayed_discard_discarded:"Gioco eliminato.",
	// --- QR-Cart scanner
	button_lightonoff:"<i class='fas fa-lightbulb'></i> SI/NO",
	button_cameraid:"<i class='fas fa-camera'></i> CAM {1}",
	loadqr_tutorial:"Inquadra una <i class='fas fa-qrcode'></i> QR-Cart per caricarla.",
	loadqr_progress:"<br>Ancora <b>{1}</b> QR-Cart da scansionare!",
	loadqr_scanning:"Stai caricando un gioco da <b>{1}</b> QR-Cart.<br>",
	// --- Installer
	installer_install:"Installa Rewtro",
	// --- Datasette
	datasette_tutorial:"Il <i class='fas fa-tape'></i> Registratore ti permette di condividere con un amico l'ultimo gioco al quale hai giocato senza usare alcuna QR-Cart.<br><br>Apri Rewtro sul suo dispositivo, seleziona <i class='fas fa-camera'></i> Carica QR-Cart e continua ad inquadrare il codice animato al centro di questo schermo finch&egrave; il gioco non viene avviato.<br><br>Se il gioco non viene caricato prova a cambiare la luminosit&agrave; di questo schermo o la grandezza del QR-Code usando i bottoni in alto.",
	// --- Console
	console_backtomenu:"Torna al menu",
	console_paused:"Gioco in pausa. <i class='fas fa-gamepad'></i> Premi qui per riprendere!",
	console_nogame:"Carica un gioco usando <i class='fas fa-camera'></i> Carica QR-Cart",
	console_tap:"Tocca <i class='fas faa-pulse animated fa-hand-pointer'></i>",
	console_drag:"Muovi <i class='fas faa-wrench animated fa-hand-pointer'></i>",
	console_or:"/",
	console_move:"Muovi",
	console_buttonalabel:"Bottone A",
	console_buttonblabel:"Bottone B",
	console_buttonclabel:"Bottone C",
	console_buttondlabel:"Bottone D",
	console_pulldown:"Trascina gi&ugrave; <i class='fas faa-bounce animated fa-hand-pointer'></i>",
	console_up:"<i class='fas fa-arrow-up'></i>",
	console_down:"<i class='fas fa-arrow-down'></i>",
	console_left:"<i class='fas fa-arrow-left'></i>",
	console_right:"<i class='fas fa-arrow-right'></i>"
}