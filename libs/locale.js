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
	credits_people:"...and these great people's support:",
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
	lastplayed_discard_confirm:"Do you want to discard your last played game?<br>To play it again, you must load it from QR-Carts or other media.",
	button_yesdiscard:"<i class='fas fa-trash-alt'></i> Yes, discard the game.",
	button_nokeep:"<i class='fas fa-undo'></i> No, keep it.",
	lastplayed_discard_discarded:"Saved game discarded.",
	// --- QR-Cart scanner
	button_lightonoff:"<i class='fas fa-lightbulb'></i> ON/OFF",
	button_cameraid:"<i class='fas fa-camera'></i> CAM {1}",
	loadqr_tutorial:"Point the camera at a <i class='fas fa-qrcode'></i> QR-Cart to load it.",
	scanqr_tutorial:"Point the camera at a <i class='fas fa-qrcode'></i> QR-Code to scan it.",
	loadqr_progress:"<br>Scan <b>{1}</b> QR-Carts to go!",
	loadqr_scanning:"Scanning a <b>{1}</b> QR-Cart game.<br>",
	loadqr_permissions:"Hey! It looks like Rewtro can't access your camera. Make sure you've given the right permissions from your web browser and try selecting <i class='fas fa-camera'></i> Load QR-Cart again.",
	// --- Installer
	installer_install:"Install Rewtro",
	// --- Datasette
	datasette_tutorial:"With the <i class='fas fa-tape'></i> Datasette, you can share your last played game with a friend without using a QR-Cart.<br><br>Open Rewtro on his device, choose <i class='fas fa-camera'></i> Load QR-Cart and keep framing the animated code in the center of this screen until the game is started.<br><br>If the game is not loading, try changing this device's screen brightness or the QR-Code size using the buttons on the top of the screen.",
	// --- SDK
	sdk:"SDK",
	// --- Console
	console_backtomenu:"Go to menu",
	console_paused:"Game paused. <i class='fas fa-gamepad'></i> Hit here to play!",
	console_nogame:"Load a game using <i class='fas fa-camera'></i> Load QR-Cart",
	console_tap:"Tap <i class='fas faa-pulse animated fa-hand-pointer'></i>",
	console_drag:"Drag <i class='fas faa-wrench animated fa-hand-pointer'></i>",
	console_or:"/",
	console_move:"Move",
	console_buttonalabel:"Button A",
	console_buttonblabel:"Button B",
	console_buttonclabel:"Button C",
	console_buttondlabel:"Button D",
	console_buttonuplabel:"Up",
	console_buttondownlabel:"Down",
	console_buttonleftlabel:"Left",
	console_buttonrightlabel:"Right",
	console_pulldown:"Pull down <i class='fas faa-bounce animated fa-hand-pointer'></i>",
	console_up:"<i class='fas fa-arrow-up'></i>",
	console_down:"<i class='fas fa-arrow-down'></i>",
	console_left:"<i class='fas fa-arrow-left'></i>",
	console_right:"<i class='fas fa-arrow-right'></i>"
}

LocaleManager.languages.IT={
	LABEL:"Italian",
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
	scanqr_tutorial:"Inquadra un <i class='fas fa-qrcode'></i> QR-Code per scansionarlo.",
	loadqr_progress:"<br>Ancora <b>{1}</b> QR-Cart da scansionare!",
	loadqr_scanning:"Stai caricando un gioco da <b>{1}</b> QR-Cart.<br>",
	loadqr_permissions:"Hey! Sembra che Rewtro non riesca ad accedere alla telecamera. Assicurati di aver dato i giusti permessi dal tuo browser web e prova a selezionare <i class='fas fa-camera'></i> Carica QR-Cart di nuovo.",
	// --- Installer
	installer_install:"Installa Rewtro",
	// --- Datasette
	datasette_tutorial:"Il <i class='fas fa-tape'></i> Registratore ti permette di condividere con un amico l'ultimo gioco al quale hai giocato senza usare alcuna QR-Cart.<br><br>Apri Rewtro sul suo dispositivo, seleziona <i class='fas fa-camera'></i> Carica QR-Cart e continua ad inquadrare il codice animato al centro di questo schermo finch&egrave; il gioco non viene avviato.<br><br>Se il gioco non viene caricato prova a cambiare la luminosit&agrave; di questo schermo o la grandezza del QR-Code usando i bottoni in alto.",
	// --- SDK
	sdk:"SDK",
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
	console_buttonuplabel:"Su",
	console_buttondownlabel:"Gi&ugrave;",
	console_buttonleftlabel:"Sinistra",
	console_buttonrightlabel:"Destra",
	console_pulldown:"Trascina gi&ugrave; <i class='fas faa-bounce animated fa-hand-pointer'></i>",
	console_up:"<i class='fas fa-arrow-up'></i>",
	console_down:"<i class='fas fa-arrow-down'></i>",
	console_left:"<i class='fas fa-arrow-left'></i>",
	console_right:"<i class='fas fa-arrow-right'></i>"
}

LocaleManager.languages.FR={
	LABEL:"French",
	// --- Credits
	credits:"Cr&eacute;dits",
	credits_techs:"Rewtro existe gr&acirc;ce &agrave; ces technologies :",
	credits_people:"...et gr&acirc;ce au support de ces personnes :",
	// --- Global
	button_ok:"<i class='fas fa-thumbs-up'></i> OK",
	button_close:"<i class='fas fa-times-circle'></i> Fermer",
	// --- Language
	language_change:"Changer la langue",
	// --- Main menu
	qrcart_load:"Charger QR-Cart{1}",
	qrcart_datasette:"Datasette",
	lastplayed_run:"Rejouer avec le dernier jeu",
	lastplayed_discard:"Effacer l'ancien jeu",
	fullscreen_toggle:"Plein &eacute;cran",
	label_sharedgame:"Jeu partag&eacute;",
	// --- Last played management
	lastplayed_discard_confirm:"Voulez-vous effacer ce jeu?<br>Pour y rejouer, vous devrez le recharger depuis un QR-code ou par un autre moyen.",
	button_yesdiscard:"<i class='fas fa-trash-alt'></i> Oui, effacer le jeu.",
	button_nokeep:"<i class='fas fa-undo'></i> Non, le garder chargé.",
	lastplayed_discard_discarded:"Le jeu sauvegard&eacute; est effac&eacute;.",
	// --- QR-Cart scanner
	button_lightonoff:"<i class='fas fa-lightbulb'></i> ON/OFF",
	button_cameraid:"<i class='fas fa-camera'></i> CAM {1}",
	loadqr_tutorial:"Pointer la camera vers le <i class='fas fa-qrcode'></i> QR-Cart pour le charger.",
	scanqr_tutorial:"Pointer la camera vers le <i class='fas fa-qrcode'></i> QR-Code pour le scanner.",
	loadqr_progress:"<br>Encore <b>{1}</b> QR-Carts à charger !",
	loadqr_scanning:"Scan d'un jeu de <b>{1}</b> QR-Carts.<br>",
	loadqr_permissions:"Hey! Il semble que Rewtro ne puisse pas acc&eacute;der &agrave; votre appareil photo. Assurez-vous que vous avez donn&eacute; les bonnes autorisations &agrave; partir de votre navigateur Web et essayez &agrave; nouveau de s&eacute;lectionner <i class='fas fa-camera'></i> Charger QR-Cart.",
	// --- Installer
	installer_install:"Installer Rewtro",
	// --- Datasette
	datasette_tutorial:"Avec la <i class='fas fa-tape'></i> Datasette vous pouvez partager le dernier jeu jou&eacute; avec un ami sans utiliser de QR-Cart.<br><br>Ouvrez Rewtro sur cet appareil, choisissez <i class='fas fa-camera'></i> Charger QR-Cart et continuer &agrave; viser le code anim&eacute; au centre de l'&eacute;cran jusqu'au d&eacute;marrage du jeu.<br><br>Si le jeu ne se charge pas, essayer de changer la luminosit&eacute; de l'&eacute;cran ou la taille du QR-Code en utilisant les boutons en haut de l'&eacute;cran.",
	// --- SDK
	sdk:"SDK",
	// --- Console
	console_backtomenu:"Retourner au menu",
	console_paused:"Pause. <i class='fas fa-gamepad'></i> Appuyer ici pour jouer!",
	console_nogame:"Chargez un jeu en utilisant <i class='fas fa-camera'></i> Charger QR-Cart",
	console_tap:"Appuyer sur <i class='fas faa-pulse animated fa-hand-pointer'></i>",
	console_drag:"Faire glisser <i class='fas faa-wrench animated fa-hand-pointer'></i>",
	console_or:"/",
	console_move:"D&eacute;placer",
	console_buttonalabel:"Bouton A",
	console_buttonblabel:"Bouton B",
	console_buttonclabel:"Bouton C",
	console_buttondlabel:"Bouton D",
	console_buttonuplabel:"Haut", // TODO Are these translations right?
	console_buttondownlabel:"Bas",
	console_buttonleftlabel:"Gauche",
	console_buttonrightlabel:"Droite",	
	console_pulldown:"Tirer vers le bas <i class='fas faa-bounce animated fa-hand-pointer'></i>",
	console_up:"<i class='fas fa-arrow-up'></i>",
	console_down:"<i class='fas fa-arrow-down'></i>",
	console_left:"<i class='fas fa-arrow-left'></i>",
	console_right:"<i class='fas fa-arrow-right'></i>"
}

LocaleManager.languages.ES={
	LABEL:"Espa&ntilde;ol",
	// --- Credits
	credits:"Cr&eacute;ditos",
	credits_techs:"Rewtro existe gracias a estas tecnolog&iacute;as:",
	credits_people:"...y el apoyo de estas personas:",
	// --- Global
	button_ok:"<i class='fas fa-thumbs-up'></i> OK",
	button_close:"<i class='fas fa-times-circle'></i> Cerrar",
	// --- Language
	language_change:"Cambiar idioma",
	// --- Main menu
	qrcart_load:"Descarga QR-Cart{1}",
	qrcart_datasette:"Datasette",
	lastplayed_run:"Repetir el &uacute;ltimo juego",
	lastplayed_discard:"Descartar el &uacute;ltimo juego",
	fullscreen_toggle:"Alternar pantalla completa",
	label_sharedgame:"Juego compartido",
	// --- Last played management
	lastplayed_discard_confirm:"&iquest;Quieres descartar tu &uacute;ltimo juego jugado? Para reproducirlo nuevamente, debe cargarlo desde QR-Carts u otros medios.",
	button_yesdiscard:"<i class='fas fa-trash-alt'></i> S&iacute;, descarta el juego.",
	button_nokeep:"<i class='fas fa-undo'></i> No, qu&eacute;datelo.",
	lastplayed_discard_discarded:"Partida guardada descartada.",
	// --- QR-Cart scanner
	button_lightonoff:"<i class='fas fa-lightbulb'></i> ON/OFF",
	button_cameraid:"<i class='fas fa-camera'></i> CAM {1}",
	loadqr_tutorial:"Apunte la c&aacute;mara a un <i class='fas fa-qrcode'></i> QR-Cart para descargar.",
	scanqr_tutorial:"Apunte la cc&aacute;mara a un <i class='fas fa-qrcode'></i> QR-Code para escanearlo.",
	loadqr_progress:"<br>Exploraci&oacute;n <b>{1}</b> QR-Carts restante!",
	loadqr_scanning:"Escaniando <b>{1}</b> juegos QR-Cart.<br>",
	loadqr_permissions:"&iexcl;Oye! Parece que Rewtro no puede acceder a su c&aacute;mara. Aseg&uacute;rese de haber otorgado los permisos correctos desde su navegador web e intente seleccionar <i class='fas fa-camera'></i> Cargar QR-Cart nuevamente.",
	// --- Installer
	installer_install:"Instalar Rewtro",
	// --- Datasette
	datasette_tutorial:"Con el <i class='fas fa-tape'></i> Datasette, puedes compartir tu &uacute;ltimo juego con un amigo sin usar un QR-Cart.<br><br>Abre Rewtro en su dispositivo, elige <i class='fas fa-camera'></i> Cargar QR-Cart y siga enmarcando el c&oacute;digo animado en el centro de esta pantalla hasta que comience el juego.<br><br>Si el juego no se est&aacute; cargando, intente ajustar el brillo de la pantalla de este dispositivo o el tama&ntilde;o QR-Code con los botones en la parte superior de la pantalla.",
	// --- SDK
	sdk:"SDK",
	// --- Console
	console_backtomenu:"Volver al men&uacute;",
	console_paused:"Juego pausado. <i class='fas fa-gamepad'></i> Haga clic aqu&iacute; para jugar!",
	console_nogame:"Descargar un juego usando <i class='fas fa-camera'></i> Descarga QR-Cart",
	console_tap:"Pulsa <i class='fas faa-pulse animated fa-hand-pointer'></i>",
	console_drag:"Arrastra <i class='fas faa-wrench animated fa-hand-pointer'></i>",
	console_or:"/",
	console_move:"Mueve",
	console_buttonalabel:"Bot&oacute;n A",
	console_buttonblabel:"Bot&oacute;n B",
	console_buttonclabel:"Bot&oacute;n C",
	console_buttondlabel:"Bot&oacute;n D",
	console_buttonuplabel:"Hasta", // TODO Are these translations right?
	console_buttondownlabel:"Abajo",
	console_buttonleftlabel:"Izquierda",
	console_buttonrightlabel:"Derecha",	
	console_pulldown:"Bajar <i class='fas faa-bounce animated fa-hand-pointer'></i>",
	console_up:"<i class='fas fa-arrow-up'></i>",
	console_down:"<i class='fas fa-arrow-down'></i>",
	console_left:"<i class='fas fa-arrow-left'></i>",
	console_right:"<i class='fas fa-arrow-right'></i>"
}
