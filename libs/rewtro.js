function RewtroEngine(parent,CFG) {

	// --- CONSTS

	function getHtmlColor(color) { return "rgba("+color[0]+","+color[1]+","+color[2]+","+color[3]+")"; }

	var
		CART=CFG.model.cart,
		DEFAULTCOLOR=CFG.model.system.DEFAULTCOLOR,
		NOTENOOP=CFG.model.system.NOTENOOP,
		NOTEMUTE=CFG.model.system.NOTEMUTE,
		DEFAULTFONT=CFG.model.system.DEFAULTFONT,
		FONTLETTERS=CFG.model.system.FONTLETTERS,
		NOTES=CFG.model.system.NOTES,
		PALETTE=CFG.model.system.PALETTE,
		LOADINGTIME=CFG.model.system.LOADINGTIME,
		PRECISION=CFG.model.system.PRECISION,
		AUDIORANGE=CFG.model.system.AUDIORANGE,
		NOISERANGES=CFG.model.system.NOISERANGES,
		NOISEDEFAULTS=CFG.model.system.NOISEDEFAULTS,
		SPRITEATTRIBUTES=CFG.model.system.SPRITEATTRIBUTES,
		OPACITYRANGE=CFG.model.system.OPACITYRANGE,
		DEBUGGER=CFG.debugger,
		AUDIOENABLED=CFG.audioEnabled,
		ANGLETOLLERANCE=45;

	var
		DEGTORAD=3.14/180;
		HTMLPALETTE=PALETTE.map(color=>getHtmlColor(color));

	// --- HELPERS

	function fix(val) { return (val>-PRECISION)&&(val<PRECISION)?0:val }

	function clone(a) { return JSON.parse(JSON.stringify(a)); }

	function sortZindex(a,b) { return a.zIndex-b.zIndex; }

	function limit(val,min,max) { return val<min?min:val>max?max:val; }

	function applyAssign(othis,othat,otarget,operator,key,value,randomNumber) {
		var prev=othis[key];
		switch (operator) {
			case "push":{ othis[key].push(value); break; }
			case "set":{ othis[key]=value; break; }
			case "sum":{ othis[key]+=value; break; }
			case "subtract":{ othis[key]-=value; break; }
			case "multiply":{ othis[key]*=value; break; }
			case "divide":{ othis[key]/=value; break; }
			case "module":{ othis[key]=othis[key]%value; break; }
			case "invert":{ if (!!value) othis[key]=!othis[key]; break; }
		}
		if (prev!=othis[key])
			switch (key) {
				case "flags":
				case "id":{
					// If sprite id or flags are changed, the sprites index is updated
					updateIndex(othis,key,prev,othis[key]);
					break;
				}
				case "animation":{
					// If animation is changed, the animation timer is reset
					resetAnimation(othis);
					break;
				}
			}
	}

	function applyAssignValue(othis,othat,otarget,operator,line,randomNumber) {
		var linevalues;
		line.forEach(line=>{
			for (var key in line) {
				line[key].forEach(linekey=>{
					linevalues=evaluateGetter(othis,othat,otarget,linekey,randomNumber);
					linevalues.forEach(linevalue=>{
						applyAssign(othis,othat,otarget,operator,key,linevalue);
					})
				})
				
			}
		});
	}

	function calculateVector(angle,len) {
		angle*=DEGTORAD;
		return {
			x:angle == 180 ? 0 : fix(len * Math.sin(angle)),
			y:angle == 270 ? 0 : fix(-len * Math.cos(angle))
		}
	}

	function intersect(a,b) {
		if (!a||!b) return false;
		else for (var i=0;i<a.length;i++) if (b.indexOf(a[i])!=-1) return true;
		return false;
	}

	function distance(a,b) { return Math.hypot(a.x-b.x,a.y-b.y); }

	function angle(sprite1,sprite2) {
		var dx = sprite2.x+(sprite2.width/2)-sprite1.x-(sprite1.width/2),
			dy = sprite1.y+(sprite1.height/2)-sprite2.y-(sprite2.height/2);
		var ang = (Math.atan2(dx, dy) * 180 / Math.PI);
		if (ang < 0) ang = 360 + ang;
		return ang;
	}

	function applyDefaults(subject,defaults,nodefaults) {
		defaults.forEach(attr=>{
			if (!nodefaults||!nodefaults[attr.key])
				if (subject[attr.key]==undefined) subject[attr.key]=attr.defaultValue;
		});
	}

	// --- UID MANAGEMENT
	
	var uids;
	function resetUid() { uids={}; }
	function giveUid(obj) {
		var uid;
		do {
			uid = Math.floor(Math.random() * 100000000);
		} while (uids[uid]);
		uids[uid]=obj;
		obj._uid=uid;
	};
	function releaseUid(obj) { delete uids[obj._uid]; };

	// --- SPRITE INDEXING

	var index;

	function resetIndex() { index={id:{},flags:{}}; }

	function getFromIndex(key,values,toset) {
		var done={};
		for (var i=0;i<values.length;i++)
			if (index[key][values[i]])
				for (var k in index[key][values[i]])
					if (!done[k]) {
						done[k]=1;
						toset.push(index[key][values[i]][k]);
					}
	}

	function updateIndex(obj,key,previds,newids) {
		if (previds!=newids) {
			removeFromIndex(key,previds,obj);
			addToIndex(key,newids,obj);
		}
	}

	function removeFromIndex(key,ids,obj) {
		if (ids)
			for (var i=0;i<ids.length;i++) delete index[key][ids[i]][obj._uid];
	}
	
	function addToIndex(key,ids,obj) {
		if (ids)
			for (var i=0;i<ids.length;i++) {
				if (!index[key][ids[i]]) index[key][ids[i]]={};
				index[key][ids[i]][obj._uid]=obj;
			}
	}

	function removeObjectFromIndex(obj) {
		removeFromIndex("id",obj.id,obj);
		removeFromIndex("flags",obj.flags,obj);
	}

	function addObjectToIndex(obj) {
		addToIndex("id",obj.id,obj);
		addToIndex("flags",obj.flags,obj);
	}

	// --- HARDWARE INITIALIZATION

	var HW=new Hardware(parent,{
		// System configuration
		fps:CFG.model.system.FPS,		
		controller:CFG.model.system.CONTROLLER,
		screenWidth:CFG.model.system.RESOLUTION.screenWidth,
		screenHeight:CFG.model.system.RESOLUTION.screenHeight,
		renderWidth:CFG.model.system.RESOLUTION.renderWidth,
		renderHeight:CFG.model.system.RESOLUTION.renderHeight,
		background:HTMLPALETTE[DEFAULTCOLOR],
		// Instance configuration
		backLabel:CFG.backLabel,
		tapLabel:CFG.tapLabel,
		dragLabel:CFG.dragLabel,
		orLabel:CFG.orLabel,
		moveLabel:CFG.moveLabel,
		buttonALabel:CFG.buttonALabel,
		buttonBLabel:CFG.buttonBLabel,
		buttonCLabel:CFG.buttonCLabel,
		buttonDLabel:CFG.buttonDLabel,
		pullDownLabel:CFG.pullDownLabel,
		upLabel:CFG.upLabel,
		downLabel:CFG.downLabel,
		leftLabel:CFG.leftLabel,
		rightLabel:CFG.rightLabel,
		onPause:CFG.onPause,
		screenPolicy:CFG.screenPolicy,
		zIndex:CFG.zIndex,
		onResize:CFG.onResize,
		audioEnabled:AUDIOENABLED,
		scale:CFG.scale,
		fullScreen:CFG.fullScreen
	});

	// --- CART INITIALIZATION

	function prepareFont(font) {
		if (font) {
			font.tileWidth=font.image.data.width/FONTLETTERS.length;
			font.tileHeight=font.image.data.height/PALETTE.length;
		}
	}
	// Prerender system font
	prepareFont(DEFAULTFONT);

	// Media prerendering and data indexing (audio, images)
	var sounds={},effectsChannels={},tapeIndex={},autoChannel=0;
	CART.data.forEach(line=>{
		if (line.id) tapeIndex[line.id]=line;
		if (line.sounds) line.sounds.forEach(audio=>{
			var data={wave:audio.wave};
			if (audio.channelId) channel=audio.channelId;
			else {					
				channel="_"+autoChannel;
				autoChannel++;
			}
			for (var k in NOISERANGES)
				if (audio[k]===undefined) data[k]=NOISEDEFAULTS[k];
				else data[k]=NOISERANGES[k][0]+((audio[k]/AUDIORANGE[1])*(NOISERANGES[k][1]-NOISERANGES[k][0]));
			sounds[audio.id]={channel:channel,data:generateNoise(data),config:data};
			effectsChannels[channel]=1;
		});
		if (line.images)
			line.images.forEach(image=>{ prepareFont(image); });
	});

	// Music preparation
	var musics={},songChannels={};	
	CART.data.forEach(line=>{
		if (line.music) 
			line.music.forEach(line=>{
				var note,channelId,sequencer=[];
				for (var k=0;k<line.notes[0].length;k++) {
					var row={};
					for (var ch=0;ch<line.notes.length;ch++) {
						newnote=note=line.notes[ch][k];
						channelId="M"+ch;
						songChannels[channelId]=1;
						if (note!=NOTENOOP) {
							if (NOTES[note]) {
								var instrument=sounds[line.instruments[ch]];
								var newnote=line.instruments[ch]+note;
								if (!sounds[newnote])
									sounds[newnote]={
										data:generateNoise(instrument.config,NOTES[note])
									}
							}
							row[channelId]=newnote;
						}							
					}
					sequencer.push(row);
				}
				musics[line.id]=sequencer;
			});		
	});

	// --- AUDIO WRAPPERS

	function playAudio(hwchannel,audio,channel) {
		if (AUDIOENABLED) return HW.playAudio(hwchannel,audio,channel);
		else return 0;
	}

	function stopChannel(ch) {
		if (AUDIOENABLED) return HW.stopChannel(ch);
		else return 0;
	};

	function stopAudio(ch) {
		if (AUDIOENABLED) return HW.stopAudio(ch);
		else return 0;
	};

	function createAudioChannel(volume) {
		if (AUDIOENABLED) return HW.createAudioChannel(volume);
		else return 0;
	}

	function generateNoise(parms,frequency) {
		if (AUDIOENABLED) return HW.generateNoise(parms,frequency);
		else return 0;
	}

	// --- MUSIC PLAYER
	var lastSong="",song,songTempo,songRow,songRowEmpty={},songPlay,songTimer,songMusic,songMusicPosition,songPosition;
	var musicChannel=createAudioChannel(CFG.model.system.MUSICVOLUME),
		effectsChannel=createAudioChannel(CFG.model.system.EFFECTSVOLUME);

	function stopSong(nomute) {
		songPosition=0;
		songMusicPosition=0;
		songTimer=0;
		if (song) songMusic=musics[song.music[songPosition]];
		pauseSong(nomute);
	}

	function pauseSong(nomute) {
		if (!nomute) stopAudio(songChannels);
		songRow=songRowEmpty;
		songPlay=false;
	}

	function playSong() {
		//if (songPlay) stopSong();
		songPlay=true;
	}

	function loadSong(newsong) {
		lastSong=newsong;
		song=memory.songs[newsong];
		songTempo=song.tempo;
		stopSong();
	}

	function runSongPlayer() {
		songRow=songRowEmpty;
		if (song&&songPlay)
			if (songTimer>=songTempo) {
				songTimer=0;
				songRow=songMusic[songMusicPosition];
				for (var ch in songRow)
					if (songRow[ch]===NOTEMUTE) stopChannel(ch);
					else playAudio(musicChannel,sounds[songRow[ch]].data,ch);
				songMusicPosition++;
				if (songMusicPosition>=songMusic.length) {
					songMusicPosition=0;
					songPosition++;
					if (songPosition>=song.music.length)
						if (song.loopTo===undefined) stopSong(true);
						else songPosition=song.loopTo||0;
					songMusic=musics[song.music[songPosition]];
				}
			} else songTimer++;
	}

	// --- DATA MANAGEMENT

	var memory;

	function loadBlocks(blocks,mem) {
		if (!mem)			
			mem={				
				images:{font:DEFAULTFONT},
				sprites:{},
				songs:{}
			};
		mem.tilemaps=[];
		mem.code=[];

		var block;
		for (var i=0;i<blocks.length;i++) {
			block=tapeIndex[blocks[i]];
			if (block)
				for (var a in block) {
					switch (a) {
						case "sprites":{
							var sprite;
							block[a].forEach(sprite=>{ mem[a][sprite.id]=clone(sprite); });
							break;
						}
						case "images":{
							block[a].forEach(image=>{ mem.images[image.id]=image;});
							break;
						}
						case "tilemaps":{
							mem[a]=mem[a].concat(block[a]);
							break;
						}
						case "songs":{
							block[a].forEach(song=>{ mem[a][song.id]=song; });
							break;
						}
						case "code":{
							mem[a]=mem[a].concat(block[a]);
							break;	
						}
					}
				}
		}
		return mem;
	}

	function runBlocks(blocks,mem) {
		
		memory = loadBlocks(blocks,mem);

		// Load tilemaps
		var sprite;
		memory.tilemaps.forEach(tilemap=>{
			if (tilemap.backgroundColor) scene.backgroundColor=tilemap.backgroundColor;
			if (tilemap.song) {
				lastSong=tilemap.song;
				loadSong(tilemap.song);
				playSong();
			}
			if (tilemap.playAudio) {
				var sound=sounds[tilemap.playAudio];	
				if (sound) playAudio(effectsChannel,sound.data,sound.channel);
			}
			if (tilemap.set) {
				tilemap.set.forEach(set=>{
					for (var k in set) scene[k]=set[k];
				});
			}
			if (tilemap.map)
				tilemap.map.forEach((row,y)=>{
					for (var x=0;x<row.length;x++) {
						sprite=addSprite(row[x],{x:1,y:1});
						if (sprite.x==undefined) sprite.x=(tilemap.x||0)+x*(tilemap.tileWidth||8);
						if (sprite.y==undefined) sprite.y=(tilemap.y||0)+y*(tilemap.tileHeight||8);
					}
				})
		});
		memory.tilemaps=[];

		return memory;
	}

	// --- SCENE MANAGEMENT

	var scene,game,memory;

	function newGame() {
		memory=0;
		game={};
		applyDefaults(game,SPRITEATTRIBUTES);
		newScene();		
	}

	function newScene() {
		stopSong();
		resetIndex();
		resetUid();
		sprites=[];
		scene={
			x:0,
			y:0,
			width:CFG.model.system.RESOLUTION.screenWidth,
			height:CFG.model.system.RESOLUTION.screenHeight,
			timer:0,
			backgroundColor:DEFAULTCOLOR,
			_uid:-1,
			_alive:true
		};
		HW.setBackgroundColor(HTMLPALETTE[DEFAULTCOLOR]);
		applyDefaults(scene,SPRITEATTRIBUTES);
	}

	// --- SPRITES MANAGEMENT

	var sprites=[];

	function addSprite(model,nodefaults) {
		if (memory.sprites[model]) return cloneSprite(memory.sprites[model],nodefaults);
		else return {}
	}

	function removeSprite(sprite) {
		if (sprite._alive) {
			sprite._alive=false;
			removeObjectFromIndex(sprite);
			releaseUid(sprite);
			executeCode(memory.code,sprite,"isRemoved");
		}
	}

	function resetAnimation(sprite) {
		sprite._animationFrame=0;
		sprite._animationTimer=0;
		sprite._animationSide=1;
		sprite._frame=0;
	}

	function cloneSprite(model,nodefaults) {
		var sprite=clone(model);
		sprite._events={};
		sprite._alive=true;
		sprites.push(sprite);	
		resetAnimation(sprite);
		giveUid(sprite);
		addObjectToIndex(sprite);
		applyDefaults(sprite,SPRITEATTRIBUTES,nodefaults);
		executeCode(memory.code,sprite,"isSpawn");
		return sprite;
	}

	// --- SPRITE COLLISIONS

	function getSpriteHitbox(sprite) {
		if (sprite.noCamera) return sprite;
		else return { x:sprite.x-scene.x, y:sprite.y-scene.y, width:sprite.width, height:sprite.height }
	}

	function checkCollision(sprite,sprite2,ignoreenabled,dx,dy) {
		if (
			(sprite!=sprite2)&&
			sprite._alive&&sprite2._alive&&
			(ignoreenabled||(sprite.collisionsEnabled&&sprite2.collisionsEnabled))
		) {
			var hitbox=getSpriteHitbox(sprite),hitbox2=getSpriteHitbox(sprite2);
			dx+=hitbox.x;
			dy+=hitbox.y;
			return !(
					(dx>hitbox2.x+hitbox2.width-1)||
					(dx+hitbox.width-1<hitbox2.x)||
					(dy>hitbox2.y+hitbox2.height-1)||
					(dy+hitbox.height-1<hitbox2.y)
				);
		} else return false;
	}

	function getArea(othis,othat,subject,randomNumber,area) {
		var out={_alive:true};
		for (var k in area)
			out[k]=evaluateGetter(othis,othat,subject,area[k][0],randomNumber)[0];
		return out;
	}

	// --- CODE EXECUTION

	function evaluateGetter(othis,othat,otarget,line,randomNumber,defaultValue) {
		// Prepare subjects
		var subjects=[];
		if (randomNumber==-1) randomNumber=Math.random();
		if (!line) subjects.push(othis);
		else {
			// --- Basic values
			if (line.emptyList!==undefined) subjects.push([]);
			else if (line.integer!==undefined) subjects.push(line.integer);
			else if (line.smallInteger!==undefined) subjects.push(line.smallInteger);
			else if (line.number!==undefined) subjects.push(line.number);
			else if (line.smallNumber!==undefined) subjects.push(line.smallNumber);
			else if (line.float!==undefined) subjects.push(line.float);
			else if (line.largeNumber!==undefined) subjects.push(line.largeNumber);
			else if (line.list!==undefined) subjects.push(line.list);
			// ---
			else if (line.string!==undefined) subjects.push(line.string);
			else if (line.character!==undefined) subjects.push(line.character);
			else if (line.numbers!==undefined) subjects=line.numbers;
			else if (line.undefined!==undefined) subjects.push(undefined);
			else if (line.ids||line.id) getFromIndex("id",line.ids||line.id,subjects);
			else if (line.flags) getFromIndex("flags",line.flags,subjects);
			else if (line.idsByName) {
				var ids=evaluateGetter(othis,othat,otarget,line.idsByName[0],randomNumber,defaultValue);
				getFromIndex("id",ids,subjects);
			} else if (line.flagsByName) {
				var flags=evaluateGetter(othis,othat,otarget,line.flagsByName[0],randomNumber,defaultValue);
				getFromIndex("flags",flags,subjects);
			} else {
				switch (line.as) {
					case "that":{ for (var k in othat) subjects.push(othat[k]); break; }
					case "game":{ subjects.push(game); break; }
					case "scene":{ subjects.push(scene); break; }
					case "keyboard":{ subjects.push(HW.keyboard); break; }				
					case "songRow":{ subjects.push(songRow); break; }				
					case "target":{ subjects.push(otarget); break; }				
					case "allSprites":{ subjects=subjects.concat(sprites); break; }
					default:{
						// If omitted use default...
						if (defaultValue!==undefined) subjects=defaultValue;
						// ...or the "this" object this as context
						else subjects.push(othis);						
						break;
					}
				}
			}
			// Subject replacement
			if (line.distanceTo) {
				var to=evaluateGetter(othis,othat,otarget,line.distanceTo[0],randomNumber,defaultValue);
				subjects=[distance(subjects[0],to[0])];
			}
			if (line.angleTo) {
				var to=evaluateGetter(othis,othat,otarget,line.angleTo[0],randomNumber,defaultValue);
				subjects=[angle(subjects[0],to[0])];
			}
			if (line.nearest||line.farthest) {
				var newdist,dist,found;
				var to=evaluateGetter(othis,othat,otarget,(line.nearest||line.farthest)[0],randomNumber,defaultValue);
				for (var i=0;i<to.length;i++) {
					newdist=distance(subjects[0],to[i]);
					if ((found==undefined)||(line.nearest?newdist<dist:newdist>dist)) {
						dist=newdist;
						found=to[i];
					}
				}
				if (found!==undefined) subjects=[found];
				else subjects=[];
			}
			if (line.inArea) {
				var out=[];
				var rect=getArea(othis,othat,otarget,randomNumber,line.inArea[0]);
				subjects.forEach(subject=>{
					if (checkCollision(subject,rect,true,0,0)) out.push(subject);
				});
				subjects=out;
			}
			if (line.oneRandom) subjects=[subjects[Math.floor(subjects.length*randomNumber)]];
			// Subject post-processing
			if (line.sublist) subjects=subjects[0][line.sublist];
			if (line.attribute) subjects=subjects.map(subject=>subject[line.attribute]);
			if (line.randomValue) subjects=subjects.map(subject=>subject[Math.floor(subject.length*randomNumber)]);
			if (line.randomNumber) subjects=subjects.map(subject=>subject[0]+Math.round((subject[1]-subject[0])*randomNumber));
			if (line.index) {
				var pos=evaluateGetter(othis,othat,otarget,line.index[0],randomNumber,defaultValue);
				subjects=subjects.map(subject=>subject[pos]);
			}
			if (line.sqrt) subjects=subjects.map(subject=>Math.sqrt(subject));
			if (line.sin) subjects=subjects.map(subject=>Math.sin(subject));
			if (line.cos) subjects=subjects.map(subject=>Math.cos(subject));
			if (line.acos) subjects=subjects.map(subject=>Math.acos(subject));
			if (line.limit) subjects=subjects.map(subject=>limit(subject,line.limit[0],line.limit[1]));
			if (line.negate) subjects=subjects.map(subject=>!subject?1:0);
			if (line.abs) subjects=subjects.map(subject=>Math.abs(subject));
			if (line.floor) subjects=subjects.map(subject=>Math.floor(subject));
			if (line.ceil) subjects=subjects.map(subject=>Math.ceil(subject));
			if (line.round) subjects=subjects.map(subject=>Math.round(subject));
			if (line.max) {
				var out=subjects[0];
				subjects.forEach(subject=>{ if (subject>out) out=subject; });
				subjects=[out];
			}
			if (line.min) {
				var out=subjects[0];
				subjects.forEach(subject=>{ if (subject<out) out=subject; });
				subjects=[out];
			}
			if (line.count) subjects=[subjects.length||0];
			// Decorators
			if (line.prefix) subjects=subjects.map(subject=>line.prefix+subject);
			if (line.suffix) subjects=subjects.map(subject=>subject+line.suffix);
			// Debug
			if (line._DEBUG) {
				console.warn(subjects);
				if (line._DEBUG=="DEBUGGER") debugger;
			}
		}
		return subjects;
	}

	function evaluateCondition(condition,subject,that,allcollisions,event,randomNumber) {
		var istrue=true,ignoreCollision,linetrue,collisionTrue,codeThis;

		condition.forEach(line=>{

			linetrue=false;
			collisionTrue=false;
			ignoreCollision=true;

			// Evaluate only lines defining the current event
			if ((!event&&!line.event)||(event&&(line.event==event))) {

				// Check if the condition is about an event...
				if (event) {

					codeThis=[subject];
					if (line.ids||line.id) linetrue=intersect(subject.id,line.ids||line.id);
					else if (line.flags) linetrue=intersect(subject.flags,line.flags);

				} else {

					// Event conditions are skipped if no subject
					if (!line.event) {
						linetrue=true;
						codeThis=evaluateGetter(subject,that,subject,line,randomNumber);
					}

				}

				if (linetrue) {

					if (codeThis.length) {

						codeThis.forEach(othis=>{

							// Logic
							if (line.if) {
								var ofsubjects;
								if (line.if.length)
									line.if.forEach(condition=>{
										ofsubjects=evaluateGetter(othis,that,subject,condition,randomNumber);
										var fromvalue=othis,value=ofsubjects[0];
										if (fromvalue&&condition.itsAttribute) fromvalue=fromvalue[condition.itsAttribute];
										switch (condition.is) {
											case "existing":{ linetrue=linetrue&&(!!fromvalue&&(fromvalue.length===undefined||fromvalue.length)); break; }
											case ">":{ linetrue=linetrue&&(fromvalue>value); break; }
											case ">=":{ linetrue=linetrue&&(fromvalue>=value); break; }
											case "<":{ linetrue=linetrue&&(fromvalue<value); break; }
											case "<=":{ linetrue=linetrue&&(fromvalue<=value); break; }
											case "==":{ linetrue=linetrue&&(fromvalue==value); break; }
											case "%%":{ linetrue=linetrue&&(fromvalue%value==0); break; }
											case "!=":{ linetrue=linetrue&&(fromvalue!=value); break; }
											case "down": { linetrue=linetrue&&(value>0); break; }
											case "up": { linetrue=linetrue&&(value==0); break; }
											case "hit": { linetrue=linetrue&&(value==1); break; }											
											case "under":{
												var p=angle(fromvalue,value);
												linetrue=linetrue&&((p<ANGLETOLLERANCE)||(p>360-ANGLETOLLERANCE));
												break;
											}
											case "over":{
												var p=angle(fromvalue,value);
												linetrue=linetrue&&((p<(180+ANGLETOLLERANCE))&&(p>(180-ANGLETOLLERANCE)));
												break;
											}
											case "onLeftOf":{
												var p=angle(fromvalue,value);
												linetrue=linetrue&&((p<(90+ANGLETOLLERANCE))&&(p>(90-ANGLETOLLERANCE)));
												break;
											}
											case "onRightOf":{
												var p=angle(fromvalue,value);
												linetrue=linetrue&&((p<(270+ANGLETOLLERANCE))&&(p>(270-ANGLETOLLERANCE)));
												break;
											}
											case "collidingWith":{												
												var collided=false;
												var dx=condition.deltaX?evaluateGetter(othis,that,subject,condition.deltaX[0],randomNumber)[0]:0;
												var dy=condition.deltaY?evaluateGetter(othis,that,subject,condition.deltaY[0],randomNumber)[0]:0;
												ofsubjects.forEach(dest=>{
													if (checkCollision(fromvalue,dest,false,dx,dy)) {
														allcollisions[dest._uid]=that[dest._uid]=dest;
														collided=true;
													}
												});
												// If a valid collision happens, collisions will be always true.
												// New colliding objects are merged to "that".
												ignoreCollision=false;
												collisionTrue=collisionTrue||collided;
												break;
											}
											default:{ // also "inScene"
												linetrue=linetrue&&!!value;
											}
										}
									});
								// Empty ifs just check if the current object is true-ish (i.e. checking touchDown and keep object in context)
								else linetrue=linetrue&&!!othis;
							}

							// Keyboard conditions
							if (line.key)
								line.key.forEach(key=>{
									switch (key.is) {
										case "up":{
											linetrue=linetrue&&(HW.keyboard[key.id]==0);
											break;
										}
										case "down":{
											linetrue=linetrue&&(HW.keyboard[key.id]!=0);
											break;
										}
										case "hit":{
											linetrue=linetrue&&(HW.keyboard[key.id]==1);
											break;
										}
									}
								});

							// Rectangular area conditions
							if (line.bounds) {
								var x,y,width,height,collided;
								line.bounds.forEach(rect=>{
									collided=false;
									x=evaluateGetter(0,that,subject,rect.x[0],randomNumber)[0];
									y=evaluateGetter(0,that,subject,rect.y[0],randomNumber)[0];
									width=evaluateGetter(0,that,subject,rect.width[0],randomNumber)[0];
									height=evaluateGetter(0,that,subject,rect.height[0],randomNumber)[0];
									if (othis.x+othis.width>x+width) {
										if (rect.modeRight=="warp") othis.x=x;
										else if (rect.modeRight=="bound") {
											othis.x=x+width-othis.width;
											collided=true;
										}
									}
									if (othis.x<x) {
										if (rect.modeLeft=="warp") othis.x=x+width-othis.width;
										else if (rect.modeLeft=="bound") {
											othis.x=x;												
											collided=true;
										}
									}
									if (othis.y+othis.height>y+height) {
										if (rect.modeBottom=="warp") othis.y=y;
										else if (rect.modeBottom=="bound") {
											othis.y=y+height-othis.height;
											collided=true;
										}
									}
									if (othis.y<y) {
										if (rect.modeTop=="warp") othis.y=y+height-othis.height;
										else if (rect.modeTop=="bound") {
											othis.y=y;												
											collided=true;
										}
									}
								});
								ignoreCollision=false;
								collisionTrue=collisionTrue||collided;
							}

						});

					} else linetrue=false;

				}
				if (line.not) {
					if (ignoreCollision) linetrue=!linetrue;
					else collisionTrue=!collisionTrue;
				}
				istrue=istrue&&linetrue&&(ignoreCollision||collisionTrue);


			} else istrue=false;
		});

		return istrue?codeThis:false;
	}

	function executeInstructions(instructions,subject,codeThat,codeThis,speed,restitution,restitutionSpeed,randomNumber) {

		var lineThis, newLineThis, lineThat, isBreaking=false;

		if (instructions&&codeThis) instructions.forEach(line=>{

			if (!isBreaking) {

				if (line.randomize) randomNumber=-1;
				else randomNumber=Math.random();

				lineThis=evaluateGetter(0,codeThat,subject,line,randomNumber,codeThis);

				// If this is explicit in line, local that is the global that
				if (lineThis===codeThis) lineThat=codeThat;
				// ...else local that the same of the global this.
				else lineThat=codeThis;

				var inArea=0;
				if (line.inArea) inArea=getArea(0,codeThat,subject,randomNumber,line.inArea[0]);

				// --- STATEMENTS THAT UPDATES LOCALTHIS
				if (line.spawn) {

					newLineThis=[];
					lineThat=codeThis;

					var x,y,newsprite,at;

					lineThis.forEach(othis=>{
						line.spawn.forEach(spawn=>{
							var at;
							if (spawn.at!==undefined) at=spawn.at;
							else at=[0];
							at.forEach(coord=>{
								at=evaluateGetter(othis,lineThat,subject,coord,randomNumber);
								at.forEach(pos=>{
									spawn.ids.forEach(ids=>{
										var ids=evaluateGetter(othis,lineThat,subject,ids,randomNumber)[0];
										for (var j=0;j<ids.length;j++) {
											newsprite=addSprite(ids[j]);
											if (pos)
												if (pos.x!==undefined) { // Allow spawn:[{ids:"A"}]
													if (newsprite.width==undefined) newsprite.x=pos.x;
													else newsprite.x=pos.x-(newsprite.width-pos.width)/2;
													if (newsprite.height==undefined) newsprite.y=pos.y;
													else newsprite.y=pos.y-(newsprite.height-pos.height)/2;
												} else if (pos[0]!==undefined) { // Allow spawn:[{at:[{list:[10,20]}]}]
													newsprite.x=pos[0];
													newsprite.y=pos[1];
												}
											newLineThis.push(newsprite);
										}										
									})								
								})
							})						
						});
					});

					lineThis=newLineThis;

				} else if ((line.fillAreaWithPattern||line.outlineAreaWithPattern)&&inArea) {

					lineThis=[];
					lineThat=codeThis;

					var newsprite;
					var pattern=line.fillAreaWithPattern||line.outlineAreaWithPattern;
					var tileWidth=memory.sprites[pattern[0][0]].width||8,tileHeight=memory.sprites[pattern[0][0]].height||8;
					var cols=Math.floor(inArea.width/tileWidth);
					var rows=Math.floor(inArea.height/tileHeight);
					for (var x=0;x<cols;x++)
						for (var y=0;y<rows;y++) {
							var tile=pattern[y%pattern.length][x%pattern[0].length];
							if (memory.sprites[tile]&&(line.fillAreaWithPattern||!x||(x==cols-1)||!y||(y==rows-1))) {
								newsprite=addSprite(tile);
								newsprite.x=inArea.x+x*tileWidth;
								newsprite.y=inArea.y+y*tileHeight;
								lineThis.push(newsprite);
							}
						}

				} else if (line.areaCopy&&inArea) {

					newLineThis=[];
					lineThat=codeThis;

					lineThis.forEach(othis=>{
						line.areaCopy.forEach(area=>{
							var fromids=area.fromIds,toids=area.toIds;
							var spawnId=fromids.indexOf(othis.id);
							if ((spawnId!=-1)&&(toids[spawnId])) {
								var dx=evaluateGetter(othis,lineThat,subject,area.x[0],randomNumber)[0];
								var dy=evaluateGetter(othis,lineThat,subject,area.y[0],randomNumber)[0];
								var newsprite=addSprite(toids[spawnId]);
								newsprite.x=othis.x-inArea.x+dx;
								newsprite.y=othis.y-inArea.y+dy;
								newLineThis.push(newsprite);
							}
						})						
					});

					lineThis=newLineThis;

				}


				lineThis.forEach(othis=>{

					// Remove/add objects
					if (line.remove) {
						removeSprite(othis);
						// Cleanup "lineThat" context
						delete lineThat[othis._uid];
					}

					// Wall actions
					if (line.bounce)
						line.bounce.forEach(bounce=>{
							if (bounce[speed]) {
								othis[speed]*=evaluateGetter(othis,lineThat,subject,bounce[speed][0],randomNumber)[0];
								if (bounce[restitution]) othis[restitutionSpeed]*=evaluateGetter(othis,lineThat,subject,bounce[restitution][0],randomNumber)[0];
							}
						});

					// Area
					if (line.areaFlipX) othis.x=inArea.x*2+inArea.width-othis.x-othis.width;
					if (line.areaFlipY) othis.y=inArea.y*2+inArea.height-othis.y-othis.height;
					if (line.areaRotate!==undefined) {
						var times=evaluateGetter(othis,lineThat,subject,line.areaRotate[0],randomNumber)[0]%4;
						if (times<0) times+=4;
						if (line.areaCounterclockwise) times=4-times;
						for (var i=0;i<times;i++) {
							var ox=(othis.x-inArea.x)/othis.width,oy=(othis.y-inArea.y)/othis.height;
							othis.x=inArea.x+inArea.width-othis.width-(oy*othis.width);
							othis.y=inArea.y+(ox*othis.height);
						}
					}
					
					// Placement
					if (line.placeAt) {
						var pos=evaluateGetter(othis,lineThat,subject,line.placeAt[0],randomNumber)[0];
						if (pos)
							if (pos.x!==undefined) {
								if (othis.width==undefined) othis.x=pos.x;
								else othis.x=pos.x-(othis.width-pos.width)/2;
								if (othis.height==undefined) othis.y=pos.y;
								else othis.y=pos.y-(othis.height-pos.height)/2;
							} else {
								othis.x=pos[0];
								othis.y=pos[1];
							}
					}

					// Assignments (set, invert, sum, subtract, multiply, divide)
					if (line.set) applyAssignValue(othis,lineThat,subject,"set",line.set,randomNumber);
					if (line.invert) applyAssignValue(othis,lineThat,subject,"invert",line.invert,randomNumber);
					if (line.subtract) applyAssignValue(othis,lineThat,subject,"subtract",line.subtract,randomNumber);
					if (line.sum) applyAssignValue(othis,lineThat,subject,"sum",line.sum,randomNumber);
					if (line.divide) applyAssignValue(othis,lineThat,subject,"divide",line.divide,randomNumber);
					if (line.multiply) applyAssignValue(othis,lineThat,subject,"multiply",line.multiply,randomNumber);
					if (line.module) applyAssignValue(othis,lineThat,subject,"module",line.module,randomNumber);
					if (line.pan) {
						line.pan.forEach(line=>{
							var speed=evaluateGetter(othis,lineThat,subject,line.speed[0],randomNumber)[0];
							line.to.forEach(toLine=>{
								for (var key in toLine) {
									var from=othis[key],to=evaluateGetter(othis,lineThat,subject,toLine[key][0],randomNumber)[0];
									applyAssign(othis,lineThat,subject,"set",key,from+fix((to-from)/speed),randomNumber);
								}
							})
						});
					}
					if (line.push) applyAssignValue(othis,lineThat,subject,"push",line.push,randomNumber);
					
					
					// Vectors (may be changed by math before)
					if (line.moveTo) line.moveTo.forEach(attr=>{
						var vec=calculateVector(
							evaluateGetter(othis,lineThat,subject,attr.angle[0],randomNumber)[0],
							evaluateGetter(othis,lineThat,subject,attr.by[0],randomNumber)[0]
						);								
						othis.x+=vec.x;
						othis.y+=vec.y;
					});
					if (line.speedTo) line.speedTo.forEach(attr=>{
						var vec=calculateVector(
							evaluateGetter(othis,lineThat,subject,attr.angle[0],randomNumber)[0],
							evaluateGetter(othis,lineThat,subject,attr.by[0],randomNumber)[0]
						);
						othis.speedX+=vec.x;
						othis.speedY+=vec.y;
					});
					if (line.setSpeedTo) line.setSpeedTo.forEach(attr=>{
						var vec=calculateVector(
							evaluateGetter(othis,lineThat,subject,attr.angle[0],randomNumber)[0],
							evaluateGetter(othis,lineThat,subject,attr.by[0],randomNumber)[0]
						);
						othis.speedX=vec.x;
						othis.speedY=vec.y;
					});

					// Audio
					if (line.stopChannel) {
						var channel;
						line.stopChannel.forEach(channel=>{
							channel=evaluateGetter(othis,lineThat,subject,channel,randomNumber);	
							stopChannel(channel);
						});
					}
					if (line.stopAudio) stopAudio(effectsChannels);
					if (line.playAudio) {
						var sound;
						line.playAudio.forEach(audio=>{
							sound=sounds[evaluateGetter(othis,lineThat,subject,audio,randomNumber)[0]];	
							if (sound) playAudio(effectsChannel,sound.data,sound.channel);
						});				
					}

					// Music
					if (line.stopSong) stopSong();
					if (line.pauseSong) pauseSong();
					if (line.runSong) {
						loadSong(evaluateGetter(othis,lineThat,subject,line.runSong[0],randomNumber)[0]);
						playSong();
					}
					if (line.playSong) playSong();
					if (line.setSongTempo) songTempo=evaluateGetter(othis,lineThat,subject,line.setSongTempo[0],randomNumber)[0];

					// --- Object events and scene changes --- KEEP AT LAST

					// Events
					if (line.triggerEvent&&(line.forceEvent||!othis._events[line.triggerEvent])) {
						othis._events[line.triggerEvent]=1;
						executeCode(memory.code,othis,line.triggerEvent);
					}

					// Load scene/data
					if (line.runScene) {
						loadNextScene=true;
						nextBlocks=evaluateGetter(othis,lineThat,subject,line.runScene[0],randomNumber)[0]+"";
					}
					if (line.load) {
						line.load.forEach(load=>{
							memory=runBlocks(evaluateGetter(othis,lineThat,subject,load,randomNumber)[0]+"",memory);
						});
					}

					if (line.break) isBreaking=true;

					// --- Subcode --- KEEP AT VERY LAST
					
					// Nested code
					if (line.code) executeCode(line.code,othis);

				});
			}

		});				

		return isBreaking;
	}

	function executeCode(code,subject,event,size,coord,speed,restitution,restitutionSpeed) {
		
		var times,codeThat,codeThis,randomNumber,allcollisions={},run,isBreaking=false;

		code.forEach(statement=>{

			if (!isBreaking) {

				istrue=true;
				codeThis=0;
				codeThat={};
				randomNumber=Math.random();
				run=statement.then;

				if (statement.times) times=evaluateGetter(subject,0,subject,statement.times[0],randomNumber)[0];
				else times=1;

				// Evaluate condition
				if (statement.when) codeThis=evaluateCondition(statement.when,subject,codeThat,allcollisions,event,randomNumber);
				else if (!event) codeThis=[subject]; // Conditions without subject are executed at least once on subject
				// For non-event executions, if the condition is not true executes the else statement
				if (!event&&!codeThis&&statement.else) {
					run=statement.else;
					codeThis=[subject];
				}

				if (run)
					// Execute code
					for (var t=0;t<times;t++) {
						randomNumber=Math.random();
						isBreaking=executeInstructions(run,subject,codeThat,codeThis,speed,restitution,restitutionSpeed,randomNumber);
						if (isBreaking) break;
					}
			}
			
		});
		
		return allcollisions;
	}

	// --- PHYSICS

	function handleSpeed(sprite,size,coord,speed,restitution,restitutionSpeed,touchUp,touchDown) {
		var collided=false;
		var oldspeed=sprite[speed];
		if (oldspeed) {
			var side,otherdelta,delta=sprite[size]*(oldspeed>0);
			sprite[coord]+=oldspeed;

			var collisions=executeCode(memory.code,sprite,"hitWall",size,coord,speed,restitution,restitutionSpeed);

			sprite[touchDown]=[];
			sprite[touchUp]=[];

			for (var j in collisions) {
				collided=true;
				otherdelta=collisions[j][size]*(oldspeed<0);				
				if (oldspeed>0) {
					if (side===undefined) side=collisions[j][coord]+otherdelta;
					else side=Math.min(side,collisions[j][coord]+otherdelta);
					sprite[touchUp].push(collisions[j]);
				} else {
					if (side===undefined) side=collisions[j][coord]+otherdelta;
					else side=Math.max(side,collisions[j][coord]+otherdelta);
					sprite[touchDown].push(collisions[j]);
				}
			}
			if (collided) sprite[coord]=side-delta;

		}
		return collided;
	}

	// --- MAIN LOOP

	// Load the first block
	var lastBlocks=nextBlocks="A",loadingTimer=0,loadNextScene=true;

	// Initialize the game
	newGame();

	HW.setMainLoop(
		// --- LOGIC LOOP
		function(){

			if (CFG.onReady) {
				CFG.onReady();
				delete CFG.onReady;
			}
			if (loadNextScene) {
				loadingTimer=LOADINGTIME;
				loadNextScene=false;
				newScene();
			} else if (loadingTimer) {
				loadingTimer--;
			} else {

				if (nextBlocks) {
					memory.code=[];
					lastBlocks=nextBlocks;
					memory=runBlocks(nextBlocks,memory);
					nextBlocks=0;
				}

				var sprite,lastSprite=sprites.length;

				// Play song
				runSongPlayer();

				// Apply game logic
				executeCode(memory.code);

				// Apply logic/physics
				for (var i=0;i<lastSprite;i++) {
					sprite=sprites[i];
					sprite.speedX=limit(sprite.speedX+sprite.gravityX,sprite.speedLimitXBottom,sprite.speedLimitXTop);
					sprite.speedY=limit(sprite.speedY+sprite.gravityY,sprite.speedLimitYBottom,sprite.speedLimitYTop);
					handleSpeed(sprite,"width","x","speedX","restitutionY","speedY","touchRight","touchLeft");
					handleSpeed(sprite,"height","y","speedY","restitutionX","speedX","touchDown","touchUp");
					if ((sprite.restitutionX!==undefined)&&sprite.applyRestitutionX) sprite.speedX*=sprite.restitutionX;
					if ((sprite.restitutionY!==undefined)&&sprite.applyRestitutionY) sprite.speedY*=sprite.restitutionY;
					sprite.speedX=fix(sprite.speedX);
					sprite.speedY=fix(sprite.speedY);
				}

				// Cleanup sprites
				var animation,nextframe, newSprites=[];
				sprites.forEach((sprite,j)=>{
					if (sprite._alive) {

						// Reset triggered events
						sprite._events={};

						// Reset restitution				
						sprite.applyRestitutionX=true;
						sprite.applyRestitutionY=true;

						// Frame animation
						sprite._frame=0;
						if (sprite.rotateToAim) sprite.rotate=sprite.aim;
						if (sprite.flipXtoSpeedX)
							if (sprite.speedX<0) sprite.flipX=true; else
							if (sprite.speedX>0) sprite.flipX=false;
						if (sprite.flipYtoSpeedY)
							if (sprite.speedY<0) sprite.flipY=false; else
							if (sprite.speedY>0) sprite.flipY=true;
						if ((sprite.animation!==undefined)&&sprite.animations&&sprite.animations[sprite.animation]) {
							animation=sprite.animations[sprite.animation];
							if (sprite._animationTimer>=(animation.speed||0)) {
								nextframe=sprite._animationFrame+sprite._animationSide;
								if (animation.frames[nextframe]===undefined) {
									switch (animation.mode) {
										case "once":{ break; }
										case "bounce":{
											sprite._animationSide*=-1;
											sprite._animationFrame+=sprite._animationSide;
											break;
										}
										default:{
											// Loop
											sprite._animationFrame=0;
										}
									}
								} else sprite._animationFrame=nextframe;
								sprite._animationTimer=0;
							} else sprite._animationTimer++;
							sprite._frame=animation.frames[sprite._animationFrame];
						}

						// Update sprite timer
						sprite.timer++;

						newSprites.push(sprite);
					}
				});			
				sprites=newSprites;

				// Update timer
				scene.timer++;	

			}

			if (DEBUGGER) DEBUGGER(sprites,songRow,lastBlocks,lastSong,scene,game);
		},
		// --- RENDER LOOP
		function() {

			HW.screenClear();
			if (loadingTimer) HW.setBackgroundColor(HTMLPALETTE[DEFAULTCOLOR]);
			else if (scene) {

				// Draw sprites
				var width;
				sprites.sort(sortZindex);
				sprites.forEach(sprite=>{
					
					if (sprite.visible) {
						width=sprite.graphicsWidth||sprite.width;
						if (sprite.backgroundColor)
							HW.rect(
								HTMLPALETTE[sprite.backgroundColor],
								sprite.flipX,sprite.flipY,sprite.rotate,sprite.opacity/OPACITYRANGE[1],sprite.scale,
								sprite.noCamera?sprite.x:sprite.x-scene.x,
								sprite.noCamera?sprite.y:sprite.y-scene.y,
								sprite.width,sprite.height
							);
						if (memory.images.graphics&&(sprite.graphicsX!==undefined))
							HW.blit(
								memory.images[sprite.graphic].image.data,
								sprite.flipX,sprite.flipY,sprite.rotate,sprite.opacity/OPACITYRANGE[1],sprite.scale,								
								sprite.graphicsX+(sprite._frame*width),sprite.graphicsY,width,sprite.graphicsHeight||sprite.height,
								sprite.noCamera?sprite.x:sprite.x-scene.x,
								sprite.noCamera?sprite.y:sprite.y-scene.y,
								sprite.width,sprite.height
							);
						if (memory.images[sprite.font]&&(sprite.text!==undefined)) {
							var font=memory.images[sprite.font];
							var letterWidth=font.tileWidth*sprite.scale;
							var letterHeight=font.tileHeight*sprite.scale;
							var lines=(sprite.text+"").split("~");
							lines.forEach((text,line)=>{
								var dx=(letterWidth-font.tileWidth)/2;
								var dy=(letterHeight-font.tileHeight)/2;
								var xgap=((sprite.scale-1)*0.5)*sprite.width;
								var ygap=((sprite.scale-1)*0.5)*sprite.height;
								dy-=ygap;
								switch (sprite.textAlignment) {
									case "right":{ dx-=text.length*letterWidth-sprite.width-xgap; break; }
									case "center":{ dx-=(text.length*letterWidth-sprite.width)/2; break; }
									default:{ dx-=xgap; }
								}
								for (var i=0;i<text.length;i++) {								
									HW.blit(
										memory.images[sprite.font].image.data,
										sprite.flipX,sprite.flipY,sprite.rotate,sprite.opacity/OPACITYRANGE[1],sprite.scale,
										FONTLETTERS.indexOf(text[i])*font.tileWidth,sprite.textColor*font.tileHeight,
										font.tileWidth,font.tileHeight,
										(sprite.noCamera?sprite.x:sprite.x-scene.x)+i*letterWidth+dx,
										line*letterHeight+(sprite.noCamera?sprite.y:sprite.y-scene.y)+dy,
										font.tileWidth,font.tileHeight
									);
								}	
							});
						}
					}				
				});

				HW.setBackgroundColor(HTMLPALETTE[scene.backgroundColor]);

			}

		}
	);

	// Finalize

	this.stop=function() {
		HW.stop();
	}

	this.pause=HW.pause;
	this.resume=HW.resume;

};
