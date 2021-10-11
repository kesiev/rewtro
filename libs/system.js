
var System={
	SYMBOLS:" ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?!@,-.:;<=>[\\]/_#$%&'()*+\"~",	         
	versions:{},
	COMPRESSMETHODS:[
		// Best first

		{label:"Sequence packed",SEQUENCERECTANGLE:false,SEQUENCEPACKER:true,BINARYPACKER:"none"},
		{label:"Sequence packed, zipped",SEQUENCERECTANGLE:false,SEQUENCEPACKER:true,BINARYPACKER:"zip"},

		{label:"Unchanged",SEQUENCERECTANGLE:false,SEQUENCEPACKER:false,BINARYPACKER:"none"},
		{label:"Unchanged, zipped",SEQUENCERECTANGLE:false,SEQUENCEPACKER:false,BINARYPACKER:"zip"},

		// Rectangled can help zip comprssion but can create bad data...		
		{label:"Sequence rectangled and packed",SEQUENCERECTANGLE:true,SEQUENCEPACKER:true,BINARYPACKER:"none"},
		{label:"Sequence rectangled and packed, zipped",SEQUENCERECTANGLE:true,SEQUENCEPACKER:true,BINARYPACKER:"zip"},

		{label:"Sequence rectangled",SEQUENCERECTANGLE:true,SEQUENCEPACKER:false,BINARYPACKER:"none"},
		{label:"Sequence rectangled, zipped",SEQUENCERECTANGLE:true,SEQUENCEPACKER:false,BINARYPACKER:"zip"}
		
	],
	pack:function(cart,root,cb,cycle,result,metadata) {

		if (!cycle) cycle={
			method:0,
			methodData:0,
			best:-1,
			assembled:false
		};

		if (!cycle.assembled) {
			console.log("PACK: First assembling the cartige...");
			this.assemble(cart,root,assembled=>{
				cycle.assembled=true;
				this.pack(assembled,root,cb,cycle,result)
			})
		} else {

			if (result!==undefined) {
				result=String.fromCharCode(cycle.method)+result;
				console.log("PACK: Method "+cycle.method+": "+result.length+" byte(s)");
				if ((cycle.best==-1)||(cycle.data.length>result.length)) {
					cycle.bestMethod=this.COMPRESSMETHODS[cycle.method];
					cycle.best=cycle.method;
					cycle.data=result;
				}
				cycle.method++;
			}

			if (cycle.method<this.COMPRESSMETHODS.length) {

				var method=this.COMPRESSMETHODS[cycle.method];
				this.compile(cart,method,function(binary,metadata) {

					if (metadata) cycle.metadata=metadata;

					switch (method.BINARYPACKER) {
						case "zip":{
							var zip=new JSZip();				
							zip.file("x",binary);
							zip.generateAsync({type:"uint8array",compression:"DEFLATE",compressionOptions:{level:9}}).then(compressed=>{
								var out="";
								// Strips the "PK" header
								for (var i = 2; i < compressed.length; ++i) out+=String.fromCharCode(compressed[i]);
								System.pack(cart,root,cb,cycle,out,metadata);
							})
							break;
						}
						default:{
							System.pack(cart,root,cb,cycle,Encode.string.bitStream([0,binary],Stream.BYTEENCODER),metadata);						
							break;
						}
					}

				},root);

			} else {
				console.log("PACK: Done. Used",cycle.bestMethod.label,"for",cycle.data.length,"byte(s)");
				cb(cycle);
			}
		}
	},
	unpack:function(data,cb) {
		var method=this.COMPRESSMETHODS[data.charCodeAt(0)];
		data=data.substr(1);
		console.log("UNPACK: Unpacking as",method.label);
		switch (method.BINARYPACKER) {
			case "zip":{
				data="PK"+data;
				var zip=new JSZip();
				zip.loadAsync(data).then(x=>{
					zip.file("x").async("string").then(unpacked=>{
						this.decompile(unpacked,method,function(cart) {
							cb(cart);							
						});
					})
				})
				break;
			}
			default:{
				this.decompile(Decode.string.bitStream([0,data],Stream.BYTEENCODER),method,function(cart) {
					cb(cart);							
				});
				break;
			}
		}
	},
	constructSystem:function(version,debug) {
		return this.versions[version].constructor(debug,version);
	},
	assemble:function(cart,root,cb,debug) {
		cart=this.clone(cart);
		this._solvePlaceHolders(root,cart,cart=>{
			var systemModel=this.versions[cart.systemVersion];	
			if (systemModel) {
				var system=this.constructSystem(cart.systemVersion,debug);
				console.log("ASSEMBLE: Assembling cartridge...");
				cart=this._assembleEntities(cart,system);
				console.log("ASSEMBLE: Assembled!");
				cb(cart);
			} else {
				console.error("ASSEMBLE: Can't find system version",cart.systemVersion);
				onready();
			}
		});
	},
	decompile:function(data,compileConfig,onready,debug) {
		var cart={};
		var stream=Decode.binary.string([0,data],this.SYMBOLS);
		cart.systemVersion=stream[0];
		var systemModel=this.versions[cart.systemVersion];
		if (systemModel) {
			var system=this.constructSystem(cart.systemVersion,debug);
			stream=Decode.binary.structure(stream,system,system.SYSTEMPROTOCOL,compileConfig);
			for (var k in stream[0]) cart[k]=stream[0][k];
			system.configure(cart);
			stream=Decode.binary.structure(stream,system,system.DATAPROTOCOL,compileConfig);
			for (var k in stream[0]) cart[k]=stream[0][k];
			if (debug) console.log("DECOMPILE: Decompiled rest:",stream[1]);
			onready({
				cart:cart,
				system:system
			});
		} else {
			console.error("DECOMPILE: Can't find system version",cart.systemVersion);
			onready();
		}
	},
	compile:function(cart,compileConfig,onready,root,debug) {
		var metadata=cart.metadata;
		delete cart.metadata;
		console.log("COMPILE: Preparing cartridge for system",cart.systemVersion,"as",compileConfig.label);
		var systemModel=this.versions[cart.systemVersion];
		if (systemModel) {
			var system=this.constructSystem(cart.systemVersion,debug);
			// Encode system version
			var out=Encode.binary.string(cart.systemVersion,this.SYMBOLS);
			// Encode system configuration
			out+=Encode.binary.structure(cart,system,system.SYSTEMPROTOCOL,compileConfig);
			// Encode cartridge data
			system.configure(cart);
			out+=Encode.binary.structure(cart,system,system.DATAPROTOCOL,compileConfig);
			console.log("COMPILE: Done!",Math.ceil(out.length/8),"byte(s). Validating...");
			System.decompile(out,compileConfig,decompiled=>{
				System._check(cart,decompiled.cart,0,debug);
				onready(out,metadata);
			})
		}
	},
	// ---
	inRange:function(value,range){
		return (value>=range[0])&&(value<=range[1]);
	},
	_check:function(a,b,h,debug) {
		if (!h) h="";
		if (typeof a == "object") {
			if (b === undefined) {
				console.error("CHECK:",h,":",a,"vs",b);
			} else if (b.getContext) {
				if (debug) {
					a.style.border="1px solid green";
					b.style.border="1px solid red";
					document.body.appendChild(a);
					document.body.appendChild(b);
					document.body.appendChild(document.createElement("hr"));
				}
			} else
				for (var k in a) {
					this._check(a[k],b[k],h+"."+k,debug)
				}
		} else {
			if (a!=b) {
				console.error("CHECK:",h,":","["+a+"]","vs","["+b+"]");
			}
		}
	},
	_loadPlaceholders:function(root,model,ondone,resources,fullmodel) {		
		var replace;
		if (resources.length) {
			var load=resources.pop();
			var file=root+load.config._file;
			delete load.config._file;

			if (load.config._replace) {
				replace=load.config._replace;
				delete load.config._replace;
			}
			console.log("PLACEHOLDERS: Loading",file,"...");

			var extension=file.substr(file.lastIndexOf(".")+1).toLowerCase();

			switch (extension) {
				case "json":{
					Stream.getFile(file,json=>{
						json=JSON.parse(json);
						if (json instanceof Array) {
							var pos=load.parent.indexOf(load.parent[load.key]);
							json.forEach((item,id)=>load.parent.splice(pos+1+id,0,item));
							load.parent.splice(pos,1);
							System._solvePlaceHolders(root,{key:json},ondone,replace,resources,fullmodel);
						} else {
							for (var k in json)
								if (load.parent[load.key][k]===undefined) load.parent[load.key][k]=json[k];
							System._solvePlaceHolders(root,load.parent[load.key],ondone,replace,resources,fullmodel);
						}
					});
					break;
				}
				case "jpeg":
				case "jpg":
				case "gif":
				case "png":{
					var img = new Image();
				    img.onload = function () {			    	
				        load.parent[load.key]=img;
					    System._loadPlaceholders(root,model,ondone,resources,fullmodel);
				    };
				    img.src = file;
					break;
				}
				default:{
					console.error("Extension",extension,"is not supported");
					System._loadPlaceholders(root,model,ondone,resources,fullmodel);
				}
			}
		} else ondone(fullmodel._);
	},
	_solvePlaceHolders:function(root,model,ondone,replace,resources,fullmodel,sub) {
		if (!fullmodel) model=fullmodel={_:model};
		if (!resources) resources=[];
		for (var k in model) {
			if (typeof model[k]=="object") {
				if (model[k]._placeholder) {
					var newvalue=replace[model[k]._placeholder];
					if (model[k]._default&&(newvalue==undefined)) newvalue=model[k]._default;
					if (newvalue==undefined)
						console.warn("PLACEHOLDERS: Can't find placeholder",model[k]._placeholder);
					else {
						if (model[k]._default&&(newvalue==undefined)) newvalue=model[k]._default;
						if (model[k]._multiply) newvalue*=model[k]._multiply;
						if (model[k]._sum) newvalue+=model[k]._sum;
						model[k]=newvalue;
					}
				} else this._solvePlaceHolders(root,model[k],ondone,replace,resources,fullmodel,true);	
			}
		}
		if (!sub) this._gatherSubPlaceholders(root,model,ondone,replace,resources,fullmodel,sub);		
	},
	_gatherSubPlaceholders:function(root,model,ondone,replace,resources,fullmodel,sub) {
		for (var k in model) {
			if (typeof model[k]=="object") {
				if (model[k]._file) {
					resources.push({parent:model,key:k,config:model[k]});
				} else this._gatherSubPlaceholders(root,model[k],ondone,replace,resources,fullmodel,true);	
			}
		}
		if (!sub) this._loadPlaceholders(root,model,ondone,resources,fullmodel);
	},
	_assembleEntities:function(model,system) {
		for (var k in model) {
			if (typeof model[k]=="object") {
				if (model[k]._!==undefined) {
					system.assembleEntity(model[k]);
					delete model[k]._;
				} else if (!model[k].tagName) this._assembleEntities(model[k],system);
			}
		}
		return model;
	},
	clone:function(a) { return JSON.parse(JSON.stringify(a)); },
	patch:function(patch,org){
		if (patch) patch.forEach(getter=>org.push(getter));
		return org
	},
	solveReferences:function(struct,map,done) {
		if (!done) done=[]
		if (done.indexOf(struct)==-1) {
			done.push(struct);
			if (typeof struct=="object") {
				if (map[struct.values]) struct.values=map[struct.values];
				else for (var k in struct) this.solveReferences(struct[k],map,done)
			}
		}
		return struct;
	},
	padWithUnused:function(debug,label,qty,set) {		
		if (set.length>qty) {
			if (debug) console.error("MODEL: The set [",label,"] is too large by",set.length-qty,". (",qty,")");
		} else {
			var id=0;
			while (set.length<qty) {
				set.push({key:"UNUSED-"+id, unused:true});
				id++;
			}
			if (debug) 
				if (!id) console.log("MODEL: You have NO VALUES left values in",label,".");
				else if (id>20) console.log("MODEL: You *still* have",id,"unused values in",label,".");
				else if (id<5) console.log("MODEL: You just have",id," left values in",label,".");
		}
		return set;
	}
};


System.versions["0.3"]={
	constructor:function(debug,version) {
		return System.versions["0.1"].constructor(debug,version,{
			WARNING:"This is a development version of Rewtro. Please *do not* distribute games using this version.",
			GETTERS:[
				{ key:"idsByName", values:"*GETTERS*" },
				{ key:"flagsByName", values:"*GETTERS*" },
				{ key:"ceil", flag:true },
				{ key:"round", flag:true }
			],
			QUIRKS:{
				unshift:true
			}
		});
	}
};

System.versions["0.2"]={
	constructor:function(debug,version) {
		return System.versions["0.1"].constructor(debug,version,{
			GETTERS:[
				{ key:"idsByName", values:"*GETTERS*" },
				{ key:"flagsByName", values:"*GETTERS*" }
			],
			QUIRKS:{
				unshift:true
			}
		});
	}
};

System.versions["0.1"]={
	constructor:function(debug,version,mods) {

		if (!mods) mods={};
		if (!mods.QUIRKS) mods.QUIRKS={};

		var sys={
			VERSION:version,
			WARNING:mods.WARNING||""
		};

		sys.FONTENCODER=Stream.ENCODER;

		sys.DEFAULTS={
			FPS:25,
			MUSICVOLUME:0.5,
			EFFECTSVOLUME:0.9,
			LOADINGTIME:13,
			DEFAULTCOLOR:1,
			FONT:[
				// default.png
				"ICAAAIAB8yPH8_60nCOARCQEJCPHmy6DnyQaJCQaRyOBAuOA8yHHmuODmQPAAAAAAACAA7OIAuA7AaEAAmBA7QEAAaAAAaQaJEQEBCQ8AEREBcZaJCQaJCEEJCQaJEBEQmREQZQCAERERCEEIAAAAAABAAECBACAQAJDn9SA7QCFQQJAAAQaJAQaBAQEIQBE8AXbJCQaJCQBBCQaIaRA8MUAQEKH8ACEREBBBKAAAAEBA76A77IA7IAHvQWE7QIAQuECQAAHvyQEJu5Ev_EARmQEJKQdnC6DmQQaJCGD7QVBAIGE7E5BAuPA7QV7AAAAAAQAAEIBAIEAAaOA7mACAEEHmAM7BCQaBCQEBCQ8AESEBCRaJASa7CEEJCX9QQIGQQMARyBEQ7RAQIAEmA6AAAACByCCAICCAA68QQS7A7BD7QAEmAQaJCREBAQaIQRERAQaJCQEREQ8BCJGWCEEBEEEBECEREIEQIAABACAAAEBAQABA7BA8AACRuJaQAEA8UEAAAAEJyPH8_QDnCOD8C6aJCPEAwQ0mQPB8CQ8ByOHnyOA7uOCAu3A7QPA7AEAAQCAA7OAIu7HmaEEZwAA7QEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
				// spectrum.png
				"ICAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABu_H0m.Pnu8HmE9ICE8H0u5P8u.eSE8IUE.H7m5H7Q.H0y5H8uEH7AAAAAAAAAABmAuAAASBDEIBAIQAAASAAA8ISE9ICA8IQQBJCApMSE8ISE7BCE8IRI9A9MUISEMICABISE8BCUAAAAABAQAEAQ7CAIAPnyoFA7ECBQIE7AAITu7ITu_IDyEAT77LSa8ISE8H7Q8ISEMFAQbBAEGFDu_A8u8A7QhAAAABAAIP77EEA7EABIUBA7ABA7ICAAKADy8ICE7IC38BCEaICEbITufP7EEISE8DA7IKQQ5ASQBIQQ8HmQELmA_AAAAEAAEBA7ICAASHm7VAAQIP0uAFAA8ISE9ICA8IQQ8I9A8IoE7JSI8BCESLRIIEDEEICE.ISEIIQEAACAEAAmABA7_CAQECBAAPmUTI7AECA7IAAAAITu5PDy7H9E6H9E.ISE5IBu8H7Q5DBI8CDy5Hpy5BBu5CBu5BAQ5BAAMBAQEABAHA077PzI6InqAA8AUCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7AAAAIAAAAAAAAAAAABAAAAAAAAAAAAA",
				// c64.png
				"ICAAAIAB8yPH8_60ncPBvcZGNcPHmy6Dn_WcW0WcW_5DBu5Apy5Pnu5DmZPAAAAAAAHAD7PABuAABcGMRuDAn7AABcAAAyWcWiZGBcW87M2GBt4cWcWcWcGGWcZsWcBimmpMm3mMpMpMncGGZAAAAAADAAMDDAGAZAW0xMpB7ZMGZZW7AAWcW7WcB7ZGZZDH876tvcWcWcZB8cWcMyW7p33AmMPP0AGMpMB88kAAAAMB87.B7mZB7MAPz7GH7mMB7yGGZpAHvyZGWu5Gv_GAnmZGj_Wdnc6DmZWcWhGDmZxDAZOMmM_DBu6AmZ27DyAAAAmAAMMDAZGABcPDBmADAZ.tuA.mBcWcBcZGBcW87M5GB02cW7Wd7GGGWc6pmZMMmmZAp_DMmmpAmZAGAAAAAAAGDyGDAZGDAA.mW7p7AmGDmZAMmAWcWc2GB7WcZZ2Gn7ZsWcZDniW88cPH4cGGDMMMDMDMpMMMpMAAB9GAAZMB7mADAmDB87AGWypMmAGDBcGAAAAGWyPH8_ZDncPD8c6cNcPGAOW0mZPB80W88_5Ppy5Anu5DBu5B7ZPB7AGAAZHAD7PAWumPvcGIn_AAn7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAA",
				// gameboy.png
				"ICAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH7u6AAAAAAAGAB75MAyB7BiMABuDB87GABiAABu_H0u.Pnu0H7ypMCM0H0u5P8u.IoM0IpM.H7m5P8u_H0y5H93OMZAAAAAMDByMGD7DAuA2Hn9pB7mMFem2AAAdMpMdMDApImmGN0AtMpMpMTMmDCM0InZpBpM3Jm3sMDADJo3HD0GAAAAMDB76B873Am3APwmWMmmZB7yMCQoAJpumJpumMDyMB0mmPpipMpEpH7m0IoiMH7upDA35J0u_B8udD7ur7AAADAAmAAMZD7MOABi5A8wAGAZ6lmA67DypMC3mP030DDZyMCilMpurP73MIoM.HAm3Mmm5Bo3HMmmdHmmONuZ6AAAMGByGGA3DHAA.0QQpAB7GDpyAEmAdMpMdMDApImmsN0A0JpMmM0QdDC3XNpIMODMMOA3.JpM3Jm3AADAGAAmMDAm6DB7D7p7AGpuJimAMDB1MAAAAJpu5P0ymHoM5HDM.IoM5MBqpH7m5DCM8DDy5H0y_B8u5HBu5DAu6A7AMDAQGAB75AZymHniMEWwAB87GDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAA",
				// arcade.png
				"ICAAAIAD0yPP8_.0xG672GZM2G6Pny.H8_ni2Gnc2_OB8y68pyPPvu6Hm3PAAAAAAAGAB75MAyB7AaEABmGB7mEABiAABinc2MZMB7n87GpGDkvi2Gni2MGM2GnkvcDamun7mymGDGnM2_HEIAAAAmMDAAMGD7DAuAJDn9oB7mGFQQ2AAAni2AncDAmMZZBj87.l2Gni2GmB0GnjWyJBpGGAuZ2PpADOTGn8mCAAAAMDB76B873Am3AHvQWM7I3AmuECQoAM2ymMWy.Mx_GA2mZPx_ni2GpdmZnkx_ODmun87yPMmG.B8u67mZ37ByAAAAmAAMZD7MOAAaOA8mEHAMEHnI67D_niDGZMDGn87G_GDXti2ytl7GGMWy.dmZ3MZZ5A2_BiZmd7ZuEJIZ6AAAMGByGGA3DHAA68QQo7BmDD7QAEmAniWcpGDAWiZZnjn7nixGmMp3n80GOGpkGOBaGODGDM2GMIZMAACSGAAmMDAmADB7D7p7ACRuJiQAMB8UEAAAAM2yPP8_mDxG6dpO6i2G6MBwpdmZ6BBEn80_OHx_6Any6DBy5D7m6A7AMDAQGAB75AZymHmaEEWwAB7mEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAuMAAQAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAA"
			],
			CONTROLLER:[
				{type:"drag",buttons:["up","down","left","right","buttonA"]}, // Drag mode, Basic 1-button controller
				{type:"drag",buttons:["up","down","left","right","buttonA","buttonB"]}, // Drag mode, 2 buttons controller
				{type:"drag",buttons:["up","down","left","right","buttonA","buttonB","buttonC"]}, // Drag mode, 3 buttons controller
				{type:"drag",buttons:["up","down","left","right","buttonA","buttonB","buttonC","buttonD"]}, // Drag mode, 4 buttons controller
				{type:"drag",buttons:["up","down","left","right","buttonA"]}, // Drag mode, Single button controller
				{type:"keys",buttons:["up","down","left","right","buttonA"]}, // Keyboard mode, 1 action button
				{type:"keys",buttons:["up","down","left","right","buttonA","buttonB"]}, // Keyboard mode, 2 action buttons
				{type:"keys",buttons:["up","down","left","right","buttonA","buttonB","buttonC"]}, // Keyboard mode, 3 action buttons
				{type:"keys",buttons:["up","down","left","right","buttonA","buttonB","buttonC","buttonD"]}, // Keyboard mode, 4 action buttons
			],
			RESOLUTION:[
				{ screenWidth:160, screenHeight:144, renderWidth:160, renderHeight:144 }, // Gameboy inspired
				{ screenWidth:256, screenHeight:192, renderWidth:256, renderHeight:192 }, // ZX-Spectrum inspired
				{ screenWidth:320, screenHeight:200, renderWidth:320, renderHeight:200 }, // C64 inspired
			],
			PALETTE:[
				[ // ZX-Spectrum inspired
					[  0,  0,  0,  0],
					[  0,  0,  0,255],
					[  0,  0,255,255],
					[  0,255,  0,255],
					[  0,255,255,255],
					[255,  0,  0,255],
					[255,  0,255,255],
					[255,255,  0,255],
					[255,255,255,255],
					[  0,  0,128,255],
					[  0,128,  0,255],
					[  0,128,128,255],
					[128,  0,  0,255],
					[128,  0,128,255],
					[128,128,  0,255],
					[128,128,128,255]					
				],
				[ // Gameboy inspired
					[  0,  0,  0,  0],
					[202,220,159,255],
					[ 15, 56, 15,255],
					[ 48, 98, 48,255],
					[139,172, 15,255],
					[155,188, 15,255]
				],
				[ // C64 inspired
					[  0,  0,  0,  0],
					[  0,  0,  0,255],
					[255,255,255,255],
					[136,  0,  0,255],
					[170,255,238,255],
					[204, 68,204,255],
					[  0,204, 85,255],
					[  0,  0,170,255],
					[238,238,119,255],
					[221,136, 85,255],
					[102, 68,  0,255],
					[255,119,119,255],
					[ 51, 51, 51,255],
					[119,119,119,255],
					[170,255,102,255],
					[  0,136,255,255],
					[187,187,187,255]
				]
			]
		};

		sys.configure=function(model) {
			// System defaults
			sys.DEFAULTCOLOR=sys.DEFAULTS.DEFAULTCOLOR,
			sys.PALETTE=sys.DEFAULTS.PALETTE[0],
			sys.LOADINGTIME=sys.DEFAULTS.LOADINGTIME,
			sys.RESOLUTION=System.clone(sys.DEFAULTS.RESOLUTION[0]),
			sys.FPS=sys.DEFAULTS.FPS,
			sys.CONTROLLER=sys.DEFAULTS.CONTROLLER[0];
			sys.MUSICVOLUME=sys.DEFAULTS.MUSICVOLUME;
			sys.EFFECTSVOLUME=sys.DEFAULTS.EFFECTSVOLUME;
			fontData=sys.DEFAULTS.FONT[0];

			if (model&&model.systemConfiguration) {
				model.systemConfiguration.forEach(cfg=>{
					if (cfg.resolutionModel!==undefined) sys.RESOLUTION=System.clone(sys.DEFAULTS.RESOLUTION[cfg.resolutionModel]);
					if (cfg.screenWidth!==undefined) sys.RESOLUTION.screenWidth=cfg.screenWidth;
					if (cfg.screenHeight!==undefined) sys.RESOLUTION.screenHeight=cfg.screenHeight;
					if (cfg.renderWidth!==undefined) sys.RESOLUTION.renderWidth=cfg.renderWidth;
					if (cfg.renderHeight!==undefined) sys.RESOLUTION.renderHeight=cfg.renderHeight;
					if (cfg.paletteModel!==undefined) sys.PALETTE=sys.DEFAULTS.PALETTE[cfg.paletteModel];
					if (cfg.palette!==undefined) sys.PALETTE=cfg.palette;
					if (cfg.defaultColor!==undefined) sys.DEFAULTCOLOR=cfg.defaultColor;
					if (cfg.musicVolume!==undefined) sys.MUSICVOLUME=cfg.musicVolume/sys.VOLUMERANGE[1];
					if (cfg.effectsVolume!==undefined) sys.EFFECTSVOLUME=cfg.effectsVolume/sys.VOLUMERANGE[1];
					if (cfg.loadingTime!==undefined) sys.LOADINGTIME=cfg.loadingTime;
					if (cfg.fps!==undefined) sys.FPS=cfg.fps;
					if (cfg.controllerModel!==undefined) sys.CONTROLLER=sys.DEFAULTS.CONTROLLER[cfg.controllerModel];
					if (cfg.fontModel!==undefined) fontData=sys.DEFAULTS.FONT[cfg.fontModel];
				});				
			}

			// Render chosen default font
			if (fontData) {
				var fontBinary=Decode.string.bitStream([0,fontData],sys.FONTENCODER);
				sys.DEFAULTFONT={id:"font",image:Decode.binary.image([0,fontBinary],sys)[0]};
			} else sys.DEFAULTFONT=0;
		}

		// Translates the "_" key to the fitting variable type.
		sys.assembleEntity=function(entity) {
			var value=entity._,compiled=true;

			if (typeof value == "number") {

				if (Math.floor(value)!=value) entity.float=value;
				else if (System.inRange(value,RANGES.SMALLNUMBER)) entity.smallNumber=value;
				else if (System.inRange(value,RANGES.NUMBER)) entity.number=value;
				else if (System.inRange(value,RANGES.SMALLINTEGER)) entity.smallInteger=value;
				else if (System.inRange(value,RANGES.INTEGER)) entity.integer=value;
				else if (System.inRange(value,RANGES.LARGENUMBER)) entity.largeNumber=value;
				else {
					console.error("Can't compile number",value)
					compiled=false;
				}

			} else if (typeof value == "string") {

				if (value.length==1) entity.character=value;
				else entity.string=value;
				compiled=true;

			} else compiled=false;

			return compiled;
		}

		// --- GAME ENGINE

		sys.ENGINE="RewtroEngine";

		// --- SYMBOLS

		var SYMBOLS=System.SYMBOLS;

		// --- PRECISION

		sys.PRECISION=0.001;

		// --- FONT

		sys.FONTLETTERS=SYMBOLS;

		// --- GRAPHICS

		var GRAPHICS=["graphics","font","graphics0","graphics1","graphics2","graphics3","graphics4","graphics5"];

		// --- AUDIO

		sys.VOLUMERANGE=[0,127];
		sys.NOTEMUTE="   ";
		sys.NOTENOOP="---",
		sys.AUDIORANGE=[0,255];
		sys.NOISERANGES={
			"attack":[0,0.3],
			"sustain":[0,0.4],
			"limit":[0.2,0.6],
			"decay":[0,0.3],
			"release":[0,0.4],
			"frequency":[100,1600],
			"tremoloFrequency":[0,50],
			"tremoloDepth":[0,1],
			"pitch":[-0.002,0.002],
			"frequencyJump1onset":[0,1],
			"frequencyJump1amount":[-1,1],
			"frequencyJump2onset":[0,1],
			"frequencyJump2amount":[-1,1],
			"bitCrush":[0,16],
			"bitCrushSweep":[-16,16]
		};
		sys.NOISEDEFAULTS={
			bitCrush:0, // 1-16
			bitCrushSweep:0, // -16 16
			attack:0, // 0-0.3
			sustain:0, // 0-0.4
			limit:0.6, // .2-.6
			decay:0.1, // 0-0.3
			release:0, // 0-0.4
			frequency:850, // 100-1600
			tremoloFrequency:0, // 0-50
			tremoloDepth:0, // 0-1
			frequencyJump1onset:0, // 0-1
			frequencyJump1amount:0, // -1-1
			frequencyJump2onset:0, // 0-1
			frequencyJump2amount:0, // -1-1
			pitch:0 // 0-.002
		};
		var NOTESLIST=[sys.NOTENOOP,sys.NOTEMUTE];
		sys.NOTES={};
		sys.OCTAVES=[2,7];

		// Music and notes notations
		var _notes={'C':261.63,'C#':277.18,'D':293.66,'D#':311.13,'E':329.63,'F':349.23,'F#':369.99,'G':392.00,'G#':415.30,'A':440.00,'A#':466.16,'B':493.88};
		for (var oct=sys.OCTAVES[0];oct<=sys.OCTAVES[1];oct++)
			for (var note in _notes) {
				var noteid=note[0]+oct+(note[1]||"-");
				sys.NOTES[noteid]=_notes[note] * Math.pow(2,oct-4);
				NOTESLIST.push(noteid);
			}
		System.padWithUnused(debug,"notes",128,NOTESLIST);

		// --- COLORS

		sys.OPACITYRANGE=[0,127];

		// --- DATA PROTOCOL

		var AREA=System.padWithUnused(debug,"system",4,[
			{ key:"x", values:"*GETTERS*" },
			{ key:"y", values:"*GETTERS*" },
			{ key:"width", values:"*GETTERS*" },
			{ key:"height", values:"*GETTERS*" }
		]);

		// Default ranges
		var RANGES={
			RGB:[0,255],
			SIZE:[0,255],
			TIME:[0,255],
			COLOR:[0,255],
			AUDIORANGE:[0,255],
			SPEED:[-25,26.1],
			SCALE:[-25,26.1],
			COORD:[-511,512],
			ANGLE:[0,511],
			ZINDEX:[0,255],
			RESOLUTION:[0,2047],
			// --- General ranges
			SMALLNUMBER:[0,127],
			NUMBER:[0,255],
			SMALLINTEGER:[-127,128],
			INTEGER:[-511,512],
			FLOAT:[-25,26.1],
			LARGENUMBER:[0,2047],
			// --- Public ranges
			OPACITY:sys.OPACITYRANGE,
			VOLUME:sys.VOLUMERANGE
		};

		// Sprite events
		var EVENTS=System.padWithUnused(debug,"events",8,[
			// Custom events					
			"event0","event1","event2","event3","event4",
			// Engine events
			"hitWall","isSpawn","isRemoved",
		]);

		// Bounds modes
		var BOUNDSMODES=System.padWithUnused(debug,"boundsmodes",2,[ "bound", "warp" ]);

		// Sprite attributes
		sys.SPRITEATTRIBUTES=[

			{ key:"id", character:SYMBOLS },
			{ key:"flags", string:SYMBOLS, defaultValue:"" },
			{ key:"timer", integer:RANGES.TIME, defaultValue:0 }, // PRIVATE: Used in timer conditions

			{ key:"value0", float:RANGES.FLOAT, defaultValue:0 }, // General purpose numbers
			{ key:"value1", float:RANGES.FLOAT, defaultValue:0 },
			{ key:"value2", float:RANGES.FLOAT, defaultValue:0 },
			{ key:"value3", float:RANGES.FLOAT, defaultValue:0 },
			{ key:"value4", float:RANGES.FLOAT, defaultValue:0 },
			{ key:"value5", string:SYMBOLS, defaultValue:"" },
			{ key:"value6", string:SYMBOLS, defaultValue:"" },
			{ key:"value7", string:SYMBOLS, defaultValue:"" },
			{ key:"value8", string:SYMBOLS, defaultValue:"" },
			{ key:"value9", string:SYMBOLS, defaultValue:"" },

			{ key:"zIndex", integer:RANGES.ZINDEX, defaultValue:0 },

			{ key:"graphic", value:GRAPHICS, defaultValue:GRAPHICS[0] },
			{ key:"x",integer:RANGES.COORD, defaultValue:0 },
			{ key:"y",integer:RANGES.COORD, defaultValue:0 },
			{ key:"width",integer:RANGES.SIZE, defaultValue:8 },
			{ key:"height",integer:RANGES.SIZE, defaultValue:8 },
			{ key:"graphicsX",integer:RANGES.SIZE },
			{ key:"graphicsY",integer:RANGES.SIZE },
			{ key:"graphicsWidth",integer:RANGES.SIZE },
			{ key:"graphicsHeight",integer:RANGES.SIZE },

			{ key:"backgroundColor", integer:RANGES.COLOR, defaultValue:0 },

			{ key:"speedX",float:RANGES.SPEED, defaultValue:0 },
			{ key:"speedY",float:RANGES.SPEED, defaultValue:0 },
			{ key:"speedLimitXTop", float:RANGES.SPEED, defaultValue:4 },
			{ key:"speedLimitXBottom", float:RANGES.SPEED, defaultValue:-4 },
			{ key:"speedLimitYTop", float:RANGES.SPEED, defaultValue:4 },
			{ key:"speedLimitYBottom", float:RANGES.SPEED, defaultValue:-4 },
			{ key:"gravityX", float:RANGES.SPEED, defaultValue:0 },
			{ key:"gravityY", float:RANGES.SPEED, defaultValue:0 },
			{ key:"applyRestitutionX", bool:true, defaultValue:true },
			{ key:"applyRestitutionY", bool:true, defaultValue:true },
			{ key:"restitutionX", float:RANGES.SPEED },
			{ key:"restitutionY", float:RANGES.SPEED },
			{ key:"touchDown", bool:true, defaultValue:false },
			{ key:"touchUp", bool:true, defaultValue:false },
			{ key:"touchLeft", bool:true, defaultValue:false },
			{ key:"touchRight", bool:true, defaultValue:false },

			{ key:"aim", integer:RANGES.ANGLE, defaultValue:0 },
			{ key:"rotate", integer:RANGES.ANGLE, defaultValue:0 },

			{ key:"flipX", bool:true, defaultValue:false },
			{ key:"flipY", bool:true, defaultValue:false },
			{ key:"scale", float:RANGES.SCALE, defaultValue:1 },
			{ key:"visible", bool:true, defaultValue:true },
			{ key:"rotateToAim", bool:true, defaultValue:false },
			{ key:"flipXtoSpeedX", bool:true, defaultValue:false },
			{ key:"flipYtoSpeedY", bool:true, defaultValue:false },
			{ key:"noCamera", bool:true, defaultValue: false },

			{ key:"collisionsEnabled", bool:true, defaultValue:true },
			{ key:"font", value:GRAPHICS, defaultValue:GRAPHICS[1] },
			{ key:"text", string:SYMBOLS },
			{ key:"textColor", integer:RANGES.COLOR, defaultValue:8 },
			{ key:"textAlignment", value:System.padWithUnused(debug,"textAlignment",4,["left","right","center"]) },

			{ key:"opacity", integer:RANGES.OPACITY, defaultValue:RANGES.OPACITY[1] },

			{ key:"animation", integer:RANGES.SMALLNUMBER },
			{ key:"animations", values:System.padWithUnused(debug,"animations",8,[
				{ key:"frames", listNumbers:RANGES.SMALLNUMBER },
				{ key:"mode", value:System.padWithUnused(debug,"mode",4,["loop","once","bounce"]) },
				{ key:"speed", integer:RANGES.SMALLNUMBER }
			])}
		];

		// All object attributes
		var OBJECTATTRIBUTESLIST=[
			"up", "down", "left", "right", "buttonA", "buttonB", "buttonC", "buttonD", // Keyboard keys
			"M0","M1","M2","M3","M4","M5","M6","M7","M8","M9" // songRow Channel
		];
		sys.SPRITEATTRIBUTES.forEach(attr=>OBJECTATTRIBUTESLIST.push(attr.key));
		System.padWithUnused(debug,"spriteattributes",64,sys.SPRITEATTRIBUTES);
		System.padWithUnused(debug,"objectattributes",128,OBJECTATTRIBUTESLIST);

		// Sprite getters
		var SPRITEGETTERS=[
			{ key:"ids",string:SYMBOLS },
			{ key:"id",character:SYMBOLS },
			{ key:"flags",string:SYMBOLS }
		];

		// General getters (sprites, global objects, numbers etc.)
		var GETTERS=System.patch(mods.GETTERS,[
			{ key:"as", value:System.padWithUnused(debug,"as",16,["this","that","target","scene","game","keyboard","songRow","allSprites"])},
			{ key:"list", listNumbers:RANGES.INTEGER },
			{ key:"numbers", listNumbers:RANGES.INTEGER },
			{ key:"emptyList", flag:true },
			{ key:"_DEBUG", string:SYMBOLS },
			// --- General values
			{ key:"number", integer:RANGES.NUMBER },
			{ key:"smallNumber", integer:RANGES.SMALLNUMBER },
			{ key:"integer", integer:RANGES.INTEGER },
			{ key:"smallInteger", integer:RANGES.SMALLINTEGER },
			{ key:"float", float:RANGES.FLOAT },
			{ key:"largeNumber", integer:RANGES.LARGENUMBER },
			{ key:"undefined", flag:true },
			{ key:"string", string:SYMBOLS },
			{ key:"character", character:SYMBOLS },
			// --- Specific values
			{ key:"attribute", value:OBJECTATTRIBUTESLIST},
			{ key:"sublist", value:OBJECTATTRIBUTESLIST},
			{ key:"index", values:"*GETTERS*" },
			{ key:"randomNumber", flag:true },
			{ key:"randomValue", flag:true },
			{ key:"floor", flag:true },
			{ key:"angleTo", values:"*GETTERS*" },
			{ key:"distanceTo", values:"*GETTERS*" },
			{ key:"nearest", values:"*GETTERS*" },
			{ key:"farthest", values:"*GETTERS*" },
			{ key:"inArea", values:AREA },
			// --- Processing
			{ key:"abs", flag:true },
			{ key:"sqrt", flag:true },
			{ key:"sin", flag:true },
			{ key:"cos", flag:true },
			{ key:"acos", flag:true },
			{ key:"limit", listNumbers:RANGES.INTEGER },
			{ key:"oneRandom", flag:true },
			{ key:"prefix", string:SYMBOLS },
			{ key:"suffix", string:SYMBOLS },
			{ key:"negate", flag:true },
			{ key:"max", flag:true },
			{ key:"min", flag:true },
			{ key:"count", flag:true },
		]);
		if (mods.QUIRKS.unshift)
			SPRITEGETTERS.forEach(attr=>GETTERS.unshift(attr));
		else
			SPRITEGETTERS.forEach(attr=>GETTERS.push(attr));
		var GETTERS_UNPADDED=System.clone(GETTERS);
		System.padWithUnused(debug,"getters",64,GETTERS);

		// Used for assign
		var OBJECTATTRIBUTESASSIGN=[];
		sys.SPRITEATTRIBUTES.forEach(attr=>OBJECTATTRIBUTESASSIGN.push({ key:attr.key, values: GETTERS } ));
		// Objectattributes is the same size of spriteattributes, which is already padded

		// --- VECTOR

		var VECTOR=System.padWithUnused(debug,"vector",2,[
			{ key:"angle", values:GETTERS },
			{ key:"by", values:GETTERS }
		]);

		// --- AREA		

		var THEN,CODE;

		sys.SYSTEMPROTOCOL=[{
			key:"systemConfiguration",
			values:System.padWithUnused(debug,"system",16,[
				// Pre-defined resolution
				{ key:"resolutionModel", integer:RANGES.SMALLNUMBER },
				// Custom resolution
				{ key:"screenWidth", integer:RANGES.RESOLUTION },
				{ key:"screenHeight", integer:RANGES.RESOLUTION },
				{ key:"renderWidth", integer:RANGES.RESOLUTION },
				{ key:"renderHeight", integer:RANGES.RESOLUTION },
				// Pre-defined palettes
				{ key:"paletteModel", integer:RANGES.SMALLNUMBER },
				// Custom palette
				{ key:"palette", gridNumbers: RANGES.RGB },
				{ key:"defaultColor", integer:RANGES.SMALLNUMBER },
				// Pre-defined font
				{ key:"fontModel", integer:RANGES.SMALLNUMBER },
				// Audio
				{ key:"musicVolume", integer: RANGES.VOLUME },
				{ key:"effectsVolume", integer: RANGES.VOLUME },
				// Loading time
				{ key:"loadingTime", integer: RANGES.NUMBER },
				// Frame rate
				{ key:"fps", integer: RANGES.SMALLNUMBER },
				// Controller
				{ key:"controllerModel", integer:RANGES.SMALLNUMBER },
			])
		}];

		sys.DATAPROTOCOL=System.solveReferences([
			{
				key:"data",
				values:System.padWithUnused(debug,"data",8,[
					{ key:"id", character:SYMBOLS },
					{
						key:"music",
						values:System.padWithUnused(debug,"music",4,[
							{ key:"id", character:SYMBOLS },
							{ key:"notes", gridValue:NOTESLIST },
							{ key:"instruments", string:SYMBOLS }								
						])
					},
					{
						key:"songs",
						values:System.padWithUnused(debug,"songs",4,[
							{ key:"id", character:SYMBOLS },
							{ key:"music", string:SYMBOLS },
							{ key:"loopTo", integer:RANGES.SMALLNUMBER },
							{ key:"tempo", integer:RANGES.SMALLNUMBER }
						])
					},
					{
						key:"sounds",
						values:System.padWithUnused(debug,"sounds",32,[
							{ key:"id", character:SYMBOLS },
							{ key:"channelId", character:SYMBOLS },
							{ key:"wave", value:["whitenoise","square","sine","saw","triangle","tangent","whistle","breaker"]},
							{ key:"bitCrush", integer:RANGES.AUDIORANGE },
							{ key:"bitCrushSweep", integer:RANGES.AUDIORANGE },
							{ key:"attack", integer:RANGES.AUDIORANGE },
							{ key:"sustain", integer:RANGES.AUDIORANGE },
							{ key:"limit", integer:RANGES.AUDIORANGE },
							{ key:"decay", integer:RANGES.AUDIORANGE },
							{ key:"release", integer:RANGES.AUDIORANGE },
							{ key:"frequency", integer:RANGES.AUDIORANGE },
							{ key:"tremoloFrequency", integer:RANGES.AUDIORANGE },
							{ key:"tremoloDepth", integer:RANGES.AUDIORANGE },
							{ key:"frequencyJump1onset", integer:RANGES.AUDIORANGE },
							{ key:"frequencyJump1amount", integer:RANGES.AUDIORANGE },
							{ key:"frequencyJump2onset", integer:RANGES.AUDIORANGE },
							{ key:"frequencyJump2amount", integer:RANGES.AUDIORANGE },
							{ key:"pitch", integer:RANGES.AUDIORANGE }
						])
					},
					{

						key:"code",
						values:CODE=System.padWithUnused(debug,"code",32,[
							{ key:"times", values:GETTERS },
							{
								key:"when",
								values:System.padWithUnused(debug,"when",64,GETTERS_UNPADDED.concat([
									{ key:"not", flag:true },
									{
										key:"event", value:EVENTS
									},
									{
										key:"if",
										values:System.padWithUnused(debug,"if",64,GETTERS_UNPADDED.concat([
											{ key:"is", value:System.padWithUnused(debug,"is",16,[
												"existing", // Existence
												">", ">=", "<", "<=", "!=", "==", "%%", // Logic
												"collidingWith", // Scene (to check object, just use {ids:"A"} as when clause)
												"up", "down", "hit", // Keyboard
												"under", "over", "onRightOf", "onLeftOf" // Relative position												
											])},
											{
												key:"itsAttribute",
												value:OBJECTATTRIBUTESLIST
											},{
												key:"deltaX",
												values:GETTERS
											},{
												key:"deltaY",
												values:GETTERS
											}
										]))
									},
									{
										key:"bounds",
										values:System.padWithUnused(debug,"bounds",16,[
											{ key:"modeTop", value:BOUNDSMODES},
											{ key:"modeRight", value:BOUNDSMODES},
											{ key:"modeBottom", value:BOUNDSMODES},
											{ key:"modeLeft", value:BOUNDSMODES},
											{ key:"x", values:GETTERS },
											{ key:"y", values:GETTERS },
											{ key:"width", values:GETTERS },
											{ key:"height", values:GETTERS }
										])
									}
								]))
							},{
								key:"then",
								values:THEN=System.padWithUnused(debug,"then",128,GETTERS_UNPADDED.concat([
									{ key:"code", values:"*CODE*" }, // Allow nested code
									{ key:"log",string:SYMBOLS },

									// Random
									{ key:"randomize", flag:true },
									
									// Walls
									{ key:"bounce", values:System.padWithUnused(debug,"bounce",4,[
										{ key:"speedX", values:GETTERS },
										{ key:"speedY", values:GETTERS },
										{ key:"restitutionX", values:GETTERS },
										{ key:"restitutionY", values:GETTERS }
									])},

									// Assign
									{ key:"set", values:OBJECTATTRIBUTESASSIGN },
									{ key:"push", values:OBJECTATTRIBUTESASSIGN },
									{ key:"invert", values:OBJECTATTRIBUTESASSIGN },
									{ key:"sum", values:OBJECTATTRIBUTESASSIGN },									
									{ key:"subtract", values:OBJECTATTRIBUTESASSIGN },
									{ key:"multiply", values:OBJECTATTRIBUTESASSIGN },
									{ key:"divide", values:OBJECTATTRIBUTESASSIGN },
									{ key:"module", values:OBJECTATTRIBUTESASSIGN },
									{ key:"pan", values:System.padWithUnused(debug,"pan",2,[
										{ key:"to", values:OBJECTATTRIBUTESASSIGN },
										{ key:"speed",values:GETTERS }
									])},

									// Area
									{ key:"areaFlipX", flag:true },
									{ key:"areaFlipY", flag:true },
									{ key:"areaRotate", values:GETTERS },
									{ key:"areaCounterclockwise", flag:true },
									{ key:"areaCopy", values:System.padWithUnused(debug,"areaCopy",4,[
										{ key:"x", values:GETTERS },
										{ key:"y", values:GETTERS },
										{ key:"fromIds",string:SYMBOLS },
										{ key:"toIds",string:SYMBOLS }
									])},

									// Sprite add/remove
									{ key:"remove", flag:true },
									{ key:"spawn", values:System.padWithUnused(debug,"spawn",2,[
										{ key:"at", values:GETTERS },
										{ key:"ids",values:GETTERS }
									])},
									{ key:"fillAreaWithPattern", gridString:SYMBOLS },
									{ key:"outlineAreaWithPattern", gridString:SYMBOLS },
									{ key:"placeAt", values:GETTERS },
									

									// Vectors
									{
										key:"moveTo",
										values:VECTOR
									},
									{
										key:"speedTo",
										values:VECTOR
									},
									{
										key:"setSpeedTo",
										values:VECTOR
									},

									// Events
									{ key:"triggerEvent", value:EVENTS },
									{ key:"forceEvent", flag:true },

									// Audio - Sounds
									{ key:"playAudio", values:GETTERS },
									{ key:"stopAudio", flag:true },

									// Audio - Music
									{ key:"stopChannel", values:GETTERS },
									{ key:"runSong", values:GETTERS },
									{ key:"stopSong", flag:true },
									{ key:"pauseSong", flag:true },
									{ key:"playSong", flag:true },
									{ key:"setSongTempo", values:GETTERS },

									// Scene
									{ key:"runScene", values:GETTERS }, // Reset scene and load
									{ key:"load", values:GETTERS }, // Keep scene and overwrite memory

									// Code flow
									{ key:"break", flag:true }

								]))
							},
							{
								key:"else",
								values:"*THEN*"
							}
						])
					},
					{
						key:"images",
						values:System.padWithUnused(debug,"images",2,[
							{ key:"id", value:GRAPHICS },
							{ key:"image", image:true }
						])
					},
					{
						key:"tilemaps",
						values:System.padWithUnused(debug,"tilemaps",16,[
							{ key:"tileWidth", integer:RANGES.SIZE },
							{ key:"tileHeight", integer:RANGES.SIZE },
							{ key:"backgroundColor", integer:RANGES.COLOR },
							{ key:"x", integer:RANGES.COORD },
							{ key:"y", integer:RANGES.COORD },
							{ key:"map", gridString:SYMBOLS },
							{ key:"song", character:SYMBOLS },
							{ key:"playAudio", character:SYMBOLS },
							{ key:"set", values:sys.SPRITEATTRIBUTES }
						])
					},
					{
						key:"sprites",
						values:sys.SPRITEATTRIBUTES
					}
				])
			}
		],{
			"*THEN*":THEN,
			"*CODE*":CODE,
			"*GETTERS*":GETTERS
		});

		return sys;

	}
}
