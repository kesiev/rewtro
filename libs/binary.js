var Stream={
	FLOATPRECISION:10,	
	ENCODER:"ABCDEFGHIJKLMNOPQRSTUVXYZW1234567890abcdefghijklmnopqrstuvwxyz_.", // "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789?@{|}~,-./:;<=>[\]^_!\"#$%&'()*+,";
	BYTEENCODER:"",
	DETECT:{},
	initialize:function() {
		this.DETECT.iOS=(
			/iPad|iPhone|iPod/.test(navigator.platform) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
		) && !window.MSStream;
		for (var i=0;i<256;i++) this.BYTEENCODER+=String.fromCharCode(i);
	},
	slice:function(stream,piece) {
		return [stream[1].substr(0,piece),stream[1].substr(piece)];
	},
	numBits:function(number) { return number.toString(2).length; },
	listBits:function(list,ensureAllBits) {
		var bits=this.numBits(list.length-1);
		if (ensureAllBits&&(list.length-1).toString(2).indexOf(0)!=-1) {
			console.warn("Need more symbols for full encoding. Reducing symbols number",bits);
			bits--;
		}
		return bits;
	},
	fletcher16:function(buf) {
	  var sum1 = 0xff, sum2 = 0xff;
	  var i = 0;
	  var len = buf.length;

	  while (len) {
	    var tlen = len > 20 ? 20 : len;
	    len -= tlen;
	    do {
	      sum2 += sum1 += buf.charCodeAt(i++);
	    } while (--tlen);
	    sum1 = (sum1 & 0xff) + (sum1 >> 8);
	    sum2 = (sum2 & 0xff) + (sum2 >> 8);
	  }
	  /* Second reduction step to reduce sums to 8 bits */
	  sum1 = (sum1 & 0xff) + (sum1 >> 8);
	  sum2 = (sum2 & 0xff) + (sum2 >> 8);
	  return sum2 << 8 | sum1;
	},		
	getFile:function(file,cb) {
		var xmlhttp = new XMLHttpRequest();
		if (cb)
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4)
					if ((xmlhttp.status == 200)||(xmlhttp.status==0)) cb(xmlhttp.responseText);
					else cb();
			};
		xmlhttp.open("GET", file, true);
		xmlhttp.send();
	},
	downloadFile:function(filename,mimetype,content) {
      var a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display="none";
        var blob;
        if (typeof blob == "blob")
          blob=content;
        else
          blob = new Blob([content], {type: mimetype});
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}
Stream.initialize();

var ImageCodecs={
	findColorInPalette:function(r,g,b,a,palette) {
		if (a==0) r=g=b=0;			
		for  (var i=0;i<palette.length;i++)
			if (
				(palette[i][0]==r)&&
				(palette[i][1]==g)&&
				(palette[i][2]==b)&&
				(palette[i][3]==a)
			) return i;		
		return -1;
	},
	codecs:[
		{
			name:"rewtro",		
			CHARSIZE:8,
			encode:function(system,width,height,ctx) {

				var done=true,out="";
	    		var palettebits=Stream.listBits(system.PALETTE);
	    		var charsX=Math.ceil(width/this.CHARSIZE),charsY=Math.ceil(height/this.CHARSIZE);
	    		var tiles=[];
	    		var p,reqcolor,localcolor,localpalette,trim=0;

	    		for (var y=0;y<charsY;y++)
	    			for (var x=0;x<charsX;x++) {
						var tile={pixels:"",mask:"",useMask:false,palette:[]};
						tiles.push(tile);
						localpalette=[];
						data=ctx.getImageData(x*this.CHARSIZE,y*this.CHARSIZE,this.CHARSIZE,this.CHARSIZE).data;
						for (var py=0;py<this.CHARSIZE;py++)
							for (var px=0;px<this.CHARSIZE;px++) {
								p=py*this.CHARSIZE*4+(px*4);
								reqcolor=ImageCodecs.findColorInPalette(data[p],data[p+1],data[p+2],data[p+3],system.PALETTE);
								if (reqcolor==-1) {
									console.warn("Color not found",data[p],data[p+1],data[p+2],data[p+3],"at",px,",",py);
									reqcolor=0;
									done=false;
								}
								localcolor=tile.palette.indexOf(reqcolor);
								if (localcolor==-1)
									if (tile.palette.length==3) {
										localcolor=0;
										done=false;
										console.warn("Can't encode tile",x,",",y,": too many colors (",system.PALETTE,")");
									} else {
										localcolor=tile.palette.length;										
										tile.palette.push(reqcolor);
									}
								if (localcolor==2) {
									// The third color is in mask
									tile.mask+="1";
									tile.pixels+="0";
								} else {
									// Is one color from the palette
									tile.mask+="0";
									tile.pixels+=localcolor
								}
							}
						while (tile.palette.length<2) tile.palette.push(0);
						if ((tile.palette[0]!=0)||(tile.palette[1]!=0)) trim=tiles.length;
					}

				tiles=tiles.splice(0,trim);

				// Check if there is at least one tile with mask
				var hasMask=false;
				tiles.forEach(tile=>hasMask=hasMask||(tile.palette[2]!==undefined));
				if (hasMask)
					console.warn("The encoded image has masks (ie. 3 colors). Encoded data may be a little larger...");

				out+=Encode.binary.integer(charsX,8)+Encode.binary.integer(charsY,8)+Encode.binary.integer(tiles.length,16);
				if (hasMask) out+="1"; else out+="0";
				tiles.forEach(tile=>{
					out+=Encode.binary.integer(tile.palette[0],palettebits);
					out+=Encode.binary.integer(tile.palette[1],palettebits);
					out+=tile.pixels;
					if (hasMask)
						if (tile.palette[2]) {
							out+="1";
							out+=Encode.binary.integer(tile.palette[2],palettebits);
							out+=tile.mask;
						} else out+="0";
				});

				return [done,out];
			},
			decode:function(system,stream,canvas,ctx) {

				var palettebits=Stream.listBits(system.PALETTE);

	    		stream=Decode.binary.integer(stream,8);
	    		var charsX=stream[0];
	    		stream=Decode.binary.integer(stream,8);
	    		var charsY=stream[0];
	    		stream=Decode.binary.integer(stream,16);
	    		var tiles=stream[0];
	    		stream=Decode.binary.bool(stream);
	    		var hasMask=stream[0];

		    	canvas.width=charsX*this.CHARSIZE;
		    	canvas.height=charsY*this.CHARSIZE;
		    	var data=ctx.getImageData(0,0,canvas.width,canvas.height);

		    	var palette,color,pixel,p;
		    	for (var i=0;i<tiles;i++) {
		    		palette=[];
		    		for (var j=0;j<2;j++) {
		    			stream=Decode.binary.integer(stream,palettebits);
	    				palette.push(system.PALETTE[stream[0]]);
		    		}
		    		for (var y=0;y<this.CHARSIZE;y++)
		    			for (var x=0;x<this.CHARSIZE;x++) {
				    		p=((i%charsX)*this.CHARSIZE+x)*4+
							   canvas.width*4*((Math.floor(i/charsX)*this.CHARSIZE)+y);

		    				stream=Decode.binary.integer(stream,1);
		    				color=palette[stream[0]];
		    				data.data[p]=color[0];
		    				data.data[p+1]=color[1];
		    				data.data[p+2]=color[2];
		    				data.data[p+3]=color[3];
		    			}
		    		if (hasMask) {
			    		stream=Decode.binary.bool(stream);
			    		// If includes a third color...
			    		if (stream[0]) {
			    			// Get the mask color...
			    			stream=Decode.binary.integer(stream,palettebits);
			    			color=system.PALETTE[stream[0]];
			    			for (var y=0;y<this.CHARSIZE;y++)
			    			 for (var x=0;x<this.CHARSIZE;x++) {
			    			 	p=((i%charsX)*this.CHARSIZE+x)*4+
								   canvas.width*4*((Math.floor(i/charsX)*this.CHARSIZE)+y);
			    			 	stream=Decode.binary.bool(stream);
			    			 	if (stream[0]) {
			    			 		data.data[p]=color[0];
				    				data.data[p+1]=color[1];
				    				data.data[p+2]=color[2];
				    				data.data[p+3]=color[3];
			    			 	}
			    			 }
			    		}
		    		}

		    	}

		    	ctx.putImageData(data,0,0);

		    	return stream;
			}
		},
		{
			name:"indexed",
			encode:function(system,width,height,ctx) {
				var done=true,out=Encode.binary.integer(width,16)+Encode.binary.integer(height,16);
				var reqcolor,p,data=ctx.getImageData(0,0,width,height).data;
				var palettebits=Stream.listBits(system.PALETTE);
				for (var py=0;py<height;py++)
					for (var px=0;px<width;px++) {
						p=((py*width)+px)*4;
						reqcolor=ImageCodecs.findColorInPalette(data[p],data[p+1],data[p+2],data[p+3],system.PALETTE,"at "+px+","+py);
						if (reqcolor==-1) {
							console.warn("Color not found",data[p],data[p+1],data[p+2],data[p+3],"at",px,",",py);
							reqcolor=0;
							done=false;
						}
						out+=Encode.binary.integer(reqcolor,palettebits);
					}
				return [done,out];
			},
			decode:function(system,stream,canvas,ctx) {
				var color,palettebits=Stream.listBits(system.PALETTE);
	    		stream=Decode.binary.integer(stream,16);
	    		var width=stream[0];
	    		stream=Decode.binary.integer(stream,16);
	    		var height=stream[0];
	    		canvas.width=width;
		    	canvas.height=height;
		    	var data=ctx.getImageData(0,0,width,height);
	    		for (var py=0;py<height;py++)
					for (var px=0;px<width;px++) {
						p=((py*width)+px)*4;
						stream=Decode.binary.integer(stream,palettebits);
	    				color=system.PALETTE[stream[0]];
	    				data.data[p]=color[0];
	    				data.data[p+1]=color[1];
	    				data.data[p+2]=color[2];
	    				data.data[p+3]=color[3];
					}
				ctx.putImageData(data,0,0);
		    	return stream;
			}
		},
		{
			name:"monocolor",
			encode:function(system,width,height,ctx) {
				var data=ctx.getImageData(0,0,width,height).data;
				var out="";
				for (var py=0;py<height;py++)
					for (var px=0;px<width;px++) {
						p=((py*width)+px)*4;
						if (data[p+3]==0) out+="0";
						else out+="1";
					}
				out=
					Encode.binary.integer(width,16)+
					Encode.binary.integer(height,16)+
					out;
				return [true,out];
			},
			decode:function(system,stream,canvas,ctx) {
				var p;
				stream=Decode.binary.integer(stream,16);
	    		var width=stream[0];
	    		stream=Decode.binary.integer(stream,16);
	    		var height=stream[0];	    		
	    		// ---
	    		canvas.width=width;
		    	canvas.height=height*system.PALETTE.length;
		    	var data=ctx.getImageData(0,0,width,canvas.height);		    	
	    		for (var py=0;py<height;py++)
					for (var px=0;px<width;px++) {
						stream=Decode.binary.integer(stream,1);
						if (stream[0])
							system.PALETTE.forEach((color,id)=>{
								p=(((py+(id*height))*width)+px)*4;						
			    				data.data[p]=color[0];
			    				data.data[p+1]=color[1];
			    				data.data[p+2]=color[2];
			    				data.data[p+3]=color[3];
							});
					}
				ctx.putImageData(data,0,0);
		    	return stream;
			}
		}
	]
}

var Encode={
	binary:{
		image:function(system,image) {
			var out="";
			var canvas=document.createElement("canvas");
	    	canvas.width=image.data.width;
	    	canvas.height=image.data.height;
	    	var ctx=canvas.getContext("2d");
	        ctx.drawImage(image.data, 0, 0);

	        if (image.format) {
	        	ImageCodecs.codecs.forEach((codec,id)=>{
	        		if (codec.name==image.format) {
	        			var encode=codec.encode(system,canvas.width,canvas.height,ctx);
	        			if (encode[0]) out+=this.integer(id,4)+encode[1];
	        		}
	        	});
	        } else {
	        	// Tries with "rewtro" encoder...
	        	var attempt=ImageCodecs.codecs[0].encode(system,canvas.width,canvas.height,ctx);
	        	// if it can't be compressed, tries with indexed
	        	if (attempt[0]) {
	        		out=this.integer(0,4)+attempt[1];
	        	} else {
	        		console.warn("Can't encode with rewtro encoder. Trying with palette...");
	        		attempt=ImageCodecs.codecs[1].encode(system,canvas.width,canvas.height,ctx);
	        		out=this.integer(1,4)+attempt[1];
	        	}
	        }

	        return out;
		},
		sequence:function(sequence,symbols,mode) {
			if (!mode) mode={};
			var out="";
			var subsymbols=[],sublist=[];
			var idx;

			var pad;
			if (symbols) pad=Stream.listBits(symbols);
			else pad=Stream.numBits(mode.max-mode.min);

			if (mode.single) sequence=[sequence];
			else out+=this.integer(sequence.length,8);

			var cols;
			sequence.forEach((row,id)=>{
				var sublistrow=[];
				sublist.push(sublistrow);
				if (mode.rectangle) {
					if (id==0) out+=this.integer(row.length,8);
					cols=sequence[0].length;
				} else {
					out+=this.integer(row.length,8);
					cols=row.length;
				}
				for (var i=0;i<cols;i++) {
					// Classic list
					if (row[i]===undefined) idx=0;
					else if (symbols) idx=symbols.indexOf(row[i]);
					else idx=row[i]-mode.min;

					if (idx==-1) {
						idx=0;
						console.warn("Undefined symbol:",row[i],"in",symbols);
					}
					out+=this.integer(idx,pad);
					// Packed list
					var pos=subsymbols.indexOf(idx);
					if (pos==-1) {
						pos=subsymbols.length;
						subsymbols.push(idx)					
					}
					sublistrow.push(pos);
				}
			});

			// Write symbol index
			var packout=this.integer(subsymbols.length,pad);
			subsymbols.forEach(symbol=>{ packout+=this.integer(symbol,pad); });

			// Write content
			if (!mode.single) packout+=this.integer(sublist.length,8);
			var subpad=Stream.listBits(subsymbols);
			sublist.forEach((row,id)=>{
				if (!mode.rectangle||(id==0)) packout+=this.integer(row.length,8);
				row.forEach(symbol=>packout+=this.integer(symbol,subpad));
			});

			if (mode.sequencePacker) {
				if (out.length<packout.length) return "0"+out;
				else return "1"+packout;
			} else return out;
		},
		integer:function(number,pad) {
			var out=number.toString(2);
			if (out.length>pad) {
				console.error("Not enough bits:",number,"=>",out,"( >",pad,")");
				debugger;
			}
			else while (out.length<pad) out="0"+out;
			return out;
		},
		float:function(float,pad) {
			return this.integer(Math.floor(float*Stream.FLOATPRECISION),pad);
		},
		string:function(string,symbols,sequencePacker) {
			return this.sequence(string,symbols,{single:true,string:true,sequencePacker:sequencePacker});
		},		
		bool:function(value) {
			if (!!value) return "1"; else return "0";
		},
		structure:function(data,system,struct,config,sub){
			var out="";
			var pad=Stream.listBits(struct);
			var value,subpad;
			var hits=0;
			struct.forEach((line,i)=>{
				value=data[line.key];
				if (value !== undefined) {
					hits++;
					out+=this.integer(i,pad);
					if (line.values) {
						out+=this.integer(value.length,8);
						value.forEach(sub=>out+=this.structure(sub,system,line.values,config,true));
					} else if (line.integer) {
						var range=line.integer[1]-line.integer[0];
						subpad=Stream.numBits(range);
						out+=this.integer(value-line.integer[0],subpad);
					} else if (line.float) {
						var range=(line.float[1]-line.float[0])*Stream.FLOATPRECISION;
						subpad=Stream.numBits(range);
						out+=this.float(value-line.float[0],subpad);
					} else if (line.string) {
						out+=this.string(value,line.string,config.SEQUENCEPACKER);
					} else if (line.character) {
						subpad=Stream.listBits(line.character);
						out+=this.integer(line.character.indexOf(value),subpad);
					} else if (line.gridString) {
						out+=this.sequence(value,line.gridString,{string:true,sequencePacker:config.SEQUENCEPACKER,rectangle:config.SEQUENCERECTANGLE});						
					} else if (line.gridNumbers) {
						out+=this.sequence(value,0,{min:line.gridNumbers[0],max:line.gridNumbers[1],sequencePacker:config.SEQUENCEPACKER,rectangle:config.SEQUENCERECTANGLE});	
					} else if (line.listNumbers) {
						out+=this.sequence(value,0,{single:true,min:line.listNumbers[0],max:line.listNumbers[1],sequencePacker:config.SEQUENCEPACKER,rectangle:config.SEQUENCERECTANGLE});	
					} else if (line.gridValue) out+=this.sequence(value,line.gridValue,{sequencePacker:config.SEQUENCEPACKER,rectangle:config.SEQUENCERECTANGLE});
					else if (line.bool) out+=this.bool(value);
					else if (line.flag); // Flag are marked by its presence only
					else if (line.image) out+=this.image(system,value)
					else {
						var pos=line.value.indexOf(value);
						if (pos==-1)
							console.warn(line,": Can't encode",value,"using",line.value);
						else {
							subpad=Stream.listBits(line.value);
							out+=this.integer(pos,subpad);
						}
					}
				}			
			});
			// Reduce data size counter for more common sizes (1,2,3). If 0 or other, uses a full byte.
			if (hits&&hits<4) out=this.integer(hits,2)+out;
			else out=this.integer(0,2)+this.integer(hits,8)+out;
			return out;
		}
	},
	string:{
		bitStream:function(stream,symbols) {
			var out="";
			var pad=Stream.listBits(symbols,true);
			var len=Math.ceil(stream[1].length/pad);
			for (var i=0;i<len;i++) {
				stream=Decode.binary.integer(stream,pad);
				out+=symbols[stream[0]];
			}
			return out;
		}
	}
}

var Decode={
	binary:{
		image:function(stream,system) {
			var canvas=document.createElement("canvas");
			ctx=canvas.getContext("2d");
			stream=this.integer(stream,4);
			var codec=ImageCodecs.codecs[stream[0]];
			stream=codec.decode(system,stream,canvas,ctx);			
			return [{data:canvas,format:codec.name},stream[1]];
		},
		integer:function(stream,pad) {
			var parts=Stream.slice(stream,pad);
			while (parts[0].length<pad) parts[0]=parts[0]+"0";
			return [parseInt(parts[0], 2), parts[1]];
		},
		float:function(stream,pad) {
			stream=this.integer(stream,pad);
			stream[0]/=Stream.FLOATPRECISION;
			return stream;
		},
		sequence:function(stream,symbols,mode) {
			if (!mode) mode={};

			if (symbols) pad=Stream.listBits(symbols);
			else pad=Stream.numBits(mode.max-mode.min);

			var out=[],rows=1,len=-1;

			if (mode.sequencePacker) {
				stream=this.bool(stream);
				var packed=stream[0];
			} else packed=false;

			if (packed) {

				// Load symbols
				stream=this.integer(stream,pad);
				var subsymbollen=stream[0];
				var subsymbols=[];
				for (var i=0;i<subsymbollen;i++) {
					stream=this.integer(stream,pad);
					if (symbols) subsymbols.push(symbols[stream[0]]);
					else subsymbols.push(mode.min+stream[0]);
				}
				var subpad=Stream.listBits(subsymbols);

				// Load data
				if (!mode.single) {
					stream=this.integer(stream,8);
					rows=stream[0];
				}

				for (var r=0;r<rows;r++) {
					if (!mode.rectangle||(len==-1)) {
						stream=this.integer(stream,8);
						len=stream[0];
					}
					var row=[];
					out.push(row);
					for (var i=0;i<len;i++) {
						stream=this.integer(stream,subpad);
						row.push(subsymbols[stream[0]]);
					}
				}

			} else {

				// Load data
				if (!mode.single) {
					stream=this.integer(stream,8);
					rows=stream[0];
				}

				for (var r=0;r<rows;r++) {
					if (!mode.rectangle||(len==-1)) {
						stream=this.integer(stream,8);
						len=stream[0];
					}
					var row=[];
					out.push(row);
					for (var i=0;i<len;i++) {
						stream=this.integer(stream,pad);
						if (symbols) row.push(symbols[stream[0]]);
						else row.push(mode.min+stream[0]);
					}
				}

			}

			// Format data
			if (mode.string) out=out.map(row=>row.join(""));
			if (mode.single) out=out[0];

			return [out,stream[1]];
		},
		string:function(stream,symbols,sequencePacker) {
			return this.sequence(stream,symbols,{single:true,string:true,sequencePacker:sequencePacker});
		},		
		bool:function(stream) {
			stream=this.integer(stream,1);
			return [stream[0]==1,stream[1]]
		},
		structure:function(stream,system,struct,config,out,sub){
			if (out===undefined) out={};
			var subpad;

			var pad=Stream.listBits(struct);

			var keys;
			stream=this.integer(stream,2);
			if (stream[0]) keys=stream[0];
			else {
				stream=this.integer(stream,8);	
				keys=stream[0];
			}
			for (var j=0;j<keys;j++) {

				stream=this.integer(stream,pad);
				var line=struct[stream[0]];
				if (line.values) {					
					out[line.key]=[];
					stream=this.integer(stream,8);
					var count=stream[0];
					for (var i=0;i<count;i++) {
						stream=this.structure(stream,system,line.values,config,undefined,true);
						out[line.key].push(stream[0]);
					}
				} else if (line.integer) {
					var range=line.integer[1]-line.integer[0];
					subpad=Stream.numBits(range);
					stream=this.integer(stream,subpad);
					out[line.key]=stream[0]+line.integer[0];
				} else if (line.float) {
					var range=(line.float[1]-line.float[0])*Stream.FLOATPRECISION;
					subpad=Stream.numBits(range);
					stream=this.float(stream,subpad);
					// Floating point number fix
					out[line.key]=(stream[0]*Stream.FLOATPRECISION+line.float[0]*Stream.FLOATPRECISION)/Stream.FLOATPRECISION;
				} else if (line.string) {
					stream=this.string(stream,line.string,config.SEQUENCEPACKER);
					out[line.key]=stream[0];
				} else if (line.character) {
					subpad=Stream.listBits(line.character);
					stream=this.integer(stream,subpad);
					out[line.key]=line.character[stream[0]];
				} else if (line.gridString) {
					stream=this.sequence(stream,line.gridString,{string:true,sequencePacker:config.SEQUENCEPACKER,rectangle:config.SEQUENCERECTANGLE});
					out[line.key]=stream[0];
				} else if (line.gridNumbers) {
					stream=this.sequence(stream,0,{min:line.gridNumbers[0],max:line.gridNumbers[1],sequencePacker:config.SEQUENCEPACKER,rectangle:config.SEQUENCERECTANGLE});
					out[line.key]=stream[0];
				} else if (line.listNumbers) {
					stream=this.sequence(stream,0,{single:true,min:line.listNumbers[0],max:line.listNumbers[1],sequencePacker:config.SEQUENCEPACKER,rectangle:config.SEQUENCERECTANGLE});
					out[line.key]=stream[0];
				} else if (line.gridValue) {
					stream=this.sequence(stream,line.gridValue,{sequencePacker:config.SEQUENCEPACKER,rectangle:config.SEQUENCERECTANGLE});
					out[line.key]=stream[0];
				} else if (line.bool) {
					stream=this.bool(stream);
					out[line.key]=stream[0];
				} else if (line.flag) out[line.key]=true;
				else if (line.image) {
					stream=this.image(stream,system); // The image format is encoded within image data
					out[line.key]=stream[0];
				} else {
					subpad=Stream.listBits(line.value);
					stream=this.integer(stream,subpad);
					out[line.key]=line.value[stream[0]];
				}

			}
			return [out,stream[1]];
		}
	},
	string:{
		bitStream:function(stream,symbols) {
			var value,out="";
			var pad=Stream.listBits(symbols,true);
			for (var i=0;i<stream[1].length;i++) {
				value=symbols.indexOf(stream[1][i]);
				out+=Encode.binary.integer(value,pad);
			}
			return out;
		}
	}
}