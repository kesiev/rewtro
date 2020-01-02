function ModuleCredits(label) {
	return  [{
		id:"credits",
		label:label[0],
		url:"https://github.com/kesiev/rewtro",
		year:"2019-2020",
		by:{
			name:"KesieV",
			url:"https://www.kesiev.com"
		},
		techs:[
			{name:"Font Awesome", url:"https://fontawesome.com/"},
			{name:"Jost font",url:"https://indestructibletype.com/Jost.html"},
			{name:"JSZip", url:"https://stuk.github.io/jszip/"},
			{name:"Instascan",url:"https://github.com/schmich/instascan"},
			{name:"QR-Code generator",url:"https://github.com/kazuhikoarase/qrcode-generator"},
			{name:"Gif.js",url:"https://github.com/jnordberg/gif.js"},
			{name:"Color Hunt",url:"https://colorhunt.co/palette/2763"}
		],
		people:[
			{name:"Bianca", url:"http://www.linearkey.net/"},
			{name:"Frulla",url:"https://www.instagram.com/mogliagiovanni/"},
			{name:"Stefano Caroli"},
			{name:"Rosy/Damiano"},
			{name:"All Rewtro contributors",url:"https://github.com/kesiev/rewtro/graphs/contributors"}
		],
		onSelect: function ($,gameConsole) {
			var label="<b><a href='"+this.url+"'>Rewtro</a></b> ("+this.year+") by <a href='"+this.by.url+"'>"+this.by.name+"</a><br><br> "+LOC._("credits_techs")+"</b><br>";
			this.techs.forEach(tech=>label+="<a target='_blank' href='"+tech.url+"'>"+tech.name+"</a>, ");
			label=label.substr(0,label.length-2)+"<br><br>"+LOC._("credits_people")+"<br>";
			this.people.forEach(person=>label+=(person.url?"<a target='_blank' href='"+person.url+"'>"+person.name+"</a>":person.name)+", ");
			label=label.substr(0,label.length-2);
			gameConsole.getAlert(label,[
				{label:LOC._("button_ok"),onclick:function(dialog){
					dialog.close();
					gameConsole.endOption();
				}}
			]);
		}
	}]
}
