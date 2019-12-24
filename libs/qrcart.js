var QRCart=function(cfg){
  if(!cfg) cfg={};
  if (cfg.QRCARTSPEED===undefined) cfg.QRCARTSPEED=1000;
  if (cfg.QRHEADERSIZE===undefined) cfg.QRHEADERSIZE=12;
  if (cfg.QRCARTHEADERSIZE===undefined) cfg.QRCARTHEADERSIZE=10;
  if (cfg.QRGIFFOOTERSIZE === undefined) cfg.QRGIFFOOTERSIZE=30;
  if (cfg.QRGIFLOGOSIZE === undefined) cfg.QRGIFLOGOSIZE=10;
  if (cfg.ASSETROOT === undefined) cfg.ASSETROOT="qrcart/";
  if (cfg.QRGIFNOTES === undefined) cfg.QRGIFNOTES="kesiev.com/rewtro";
  if (cfg.QRGIFNOTESSIZE === undefined) cfg.QRGIFNOTESSIZE=15;
  if (cfg.QRTYPETHRESHOLD === undefined) cfg.QRTYPETHRESHOLD = 19;
  if (cfg.QRCOUNT === undefined) cfg.QRCOUNT = 3;

  this.QRCARTSPEED = cfg.QRCARTSPEED;

  var
    self=this,
    CORRECTIONLEVEL=['L','M','Q','H'],
  	CAPACITY=[
  		[  19,   16,   13,	9],[  34,   28,   22,   16],[  55,   44,   34,   26],[  80,   64,   48,   36],
  		[ 108,   86,   62,   46],[ 136,  108,   76,   60],[ 156,  124,   88,   66],[ 194,  154,  110,   86],
  		[ 232,  182,  132,  100],[ 274,  216,  154,  122],[ 324,  254,  180,  140],[ 370,  290,  206,  158],
  		[ 428,  334,  244,  180],[ 461,  365,  261,  197],[ 523,  415,  295,  223],[ 589,  453,  325,  253],
  		[ 647,  507,  367,  283],[ 721,  563,  397,  313],[ 795,  627,  445,  341],[ 861,  669,  485,  385],
  		[ 932,  714,  512,  406],[1006,  782,  568,  442],[1094,  860,  614,  464],[1174,  914,  664,  514],
  		[1276, 1000,  718,  538],[1370, 1062,  754,  596],[1468, 1128,  808,  628],[1531, 1193,  871,  661],
  		[1631, 1267,  911,  701],[1735, 1373,  985,  745],[1843, 1455, 1033,  793],[1955, 1541, 1115,  845],
  		[2071, 1631, 1171,  901],[2191, 1725, 1231,  961],[2306, 1812, 1286,  986],[2434, 1914, 1354, 1054],
  		[2566, 1992, 1426, 1096],[2702, 2102, 1502, 1142],[2812, 2216, 1582, 1222],[2956, 2334, 1666, 1276]
    ],
    CACHEFILES=[
      {id:"svg",url:cfg.ASSETROOT+"qrcart.svg",type:"text"},
      { id: "logo", url: cfg.ASSETROOT +"logo.png",type:"image"}
    ],
    CACHE={};

    function getCache(cb) {
      if (CACHEFILES.length) {
        var file=CACHEFILES.pop();
        switch (file.type) {
          case "text":{
            Stream.getFile(file.url,content=>{
              CACHE[file.id]=content;
              getCache(cb);
            });
            break;
          }
          case "image":{
            var img = new Image();
            img.onload = function () {  
              CACHE[file.id]=img;          
              getCache(cb);
            };
            img.src = file.url;
            break;
          }
        }
      } else cb(CACHE);
    };

    this.decodeQRCartPart=function(content) {
  		return {
  			signature:content.substr(3,2),
  			id:content.substr(5,2)*1,
  			total:content.substr(7,2)*1,
  			data:content.substr(9)
  		};
  	}

  	this.readQRCartParts=function(carts,cb) {
  		var data="";
  		carts.forEach(cart=>data+=cart.data);
      cb(data);
  	};

    // SVG Generator

    function replaceImage(content,id,data) {
  		if (data) {
  			content=content.replace(new RegExp("<image[^id]*id=\""+id+"\"[^>]*>","s"),function(a,b){
          var parts=a.split("\n");
          var map={};
          parts.forEach(row=>{
            row=row.trim().split("=");
            if (row[1]) map[row[0]]=row[1].substr(1,row[1].length-2);
          });
          var svg=createQRSvg(data,map.x*1,map.y*1,map.width,map.height);
          return svg;
        });
  		} else {
  			content=content.replace(new RegExp("<image[^id]*id=\""+id+"\"[^>]*>","s"),function(a,b){
  				return "";
  			});
  		}
  		return content
  	}

    function createQRSvg(qr,x,y,width,height) {      
      var mc,mr;
      var moduleCount=qr.getModuleCount();
      var cells=moduleCount+8;
      var cellSize=Math.min(width/cells,height/cells);
      var margin = cellSize*4;
      var rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';
      var qrSvg = '<path d="';

      for (r = 0; r < moduleCount; r += 1) {
        mr = y+(r * cellSize + margin);
        for (c = 0; c < moduleCount; c += 1) {
          if (qr.isDark(r, c) ) {
            mc = x+(c*cellSize+margin);
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>'
      return qrSvg;
    }

  	function createSVG(qrs,gencfg,cb){
      getCache(cache=>{
        var content=replaceImage(cache.svg,"qr-right",qrs[0]?qrs[0]:0);
        content=replaceImage(content,"qr-left",qrs[1]?qrs[1]:0);
        content=replaceImage(content,"qr-bottom",qrs[2]?qrs[2]:0);
        content=content.replace(/>Cart name</g,">"+gencfg.title+"<");
        content=content.replace(/>Upper Title</g,">"+(gencfg.upperTitle||"")+"<");
        content=content.replace(/>Center Title</g,">"+(gencfg.centerTitle||"")+"<");
        content=content.replace(/>Lower Title</g,">"+(gencfg.lowerTitle||"")+"<");
        content=content.replace(/>Legal Text</g,">"+(gencfg.legalText||"")+"<");
        content=content.replace(/>Sz_DT</g,">"+(gencfg.sizeData||"")+"<");
        content=content.replace(/label="Default cover"([^style]*)style="display:([^"]+)"/s,function(m,a){ //=
          return "label=\"Default Cover\""+a+"style=\"display:"+(gencfg.hideDefaultCover?"none":"inline")+"\"";
        });
        content=content.replace(/label="Instructions"([^style]*)style="display:([^"]+)"/s,function(m,a){ //=
          return "label=\"Instructions\""+a+"style=\"display:"+(gencfg.hideInstructions?"none":"inline")+"\"";
        });
        content=content.replace(/label="Cartridge name"([^style]*)style="display:([^"]+)"/s,function(m,a){ //=
          return "label=\"Cartridge name\""+a+"style=\"display:"+(gencfg.hideName?"none":"inline")+"\"";
        });
        cb(content);
      });
  	};

    // GIF Generator

    function createGIF(qrs,label,cellSize,cb){
      getCache(cache=>{        
          var margin=cellSize*4;
          var size=qrs[0].getModuleCount() * cellSize + margin * 2;              
          var gif = new GIF({
            workers: 2,
            quality: 10,
            workerScript:"../libs/external/gif.worker.js"
          });
          var imgs=[],imgtogo=qrs.length;
          qrs.forEach((frame,id)=>{
              var img=document.createElement("img");
              img.src=frame.createDataURL(cellSize,margin);
              img._id=id;
              img.onload=function() {
                imgs[this._id]=this;
                imgtogo--;
                if (!imgtogo) {
                  imgs.forEach(img=>{
                     var canvas=document.createElement("canvas");
                      canvas.width=size;
                    canvas.height = size + cfg.QRGIFFOOTERSIZE + cfg.QRGIFNOTESSIZE;
                      var context=canvas.getContext("2d");
                    var logoy = 
                      context.fillStyle = 'white';
                      context.fillRect(0,0,canvas.width,canvas.height);
                      context.fillStyle = '#00adb5';
                      context.strokeStyle = '#00adb5';
                      context.beginPath();
                      context.moveTo(margin, size+0.5);
                      context.lineTo(canvas.width-margin, size+0.5);
                      context.stroke();
                      context.fillRect(0,size+cfg.QRGIFFOOTERSIZE,canvas.width,canvas.height);
                      context.drawImage(
                        cache.logo,
                        0,0,cache.logo.width,cache.logo.height,
                        margin, size + ((cfg.QRGIFFOOTERSIZE - cfg.QRGIFLOGOSIZE ) / 2),
                        cache.logo.width*(cfg.QRGIFLOGOSIZE/cache.logo.height),cfg.QRGIFLOGOSIZE
                      );
                    context.textBaseline = "middle";
                      context.textAlign = "right";
                      context.font = "10px Helvetica";
                    context.fillText(label, canvas.width - margin, size + (cfg.QRGIFFOOTERSIZE/2));
                    context.textAlign = "center";
                    context.fillStyle = 'white';
                    context.fillText(cfg.QRGIFNOTES, canvas.width / 2, size + cfg.QRGIFFOOTERSIZE + (cfg.QRGIFNOTESSIZE / 2));
                      context.drawImage(img,0,0);
                      gif.addFrame(canvas,{delay: cfg.QRCARTSPEED});
                  });
                  gif.on('finished', function(blob) { cb(blob) });
                  gif.render();
                }
              }
          });

          
          
      });
    }

    // General

    
  	function pad(num,pad) {
  		var num=num+"";
  		while (num.length<pad) num="0"+num;
  		return num;
  	}

    // Basic QR

  this.suggestConfiguration = function(code,qrcount) {
    if (!qrcount) qrcount = cfg.QRCOUNT;
  		var codesize=code.length;
  		var headersize=cfg.QRHEADERSIZE+cfg.QRCARTHEADERSIZE;

  		var best;
  		CAPACITY.forEach((cap,type)=>{
        if (type < cfg.QRTYPETHRESHOLD)
          CORRECTIONLEVEL.forEach((label,cid)=>{
            // Calculate optimal carts number without headers
            var carts=Math.ceil(codesize/cap[cid]);
            // Add headers
            carts=Math.ceil(((carts*headersize)+codesize)/cap[cid]);
            // Calculate score
            var score = Math.abs(((qrcount-carts)*1000)+cid*100)+type;
            // Calculate chunkSize
            var chunkSize=cap[cid]-headersize;
            if (!best||(score<best.score)) best={
              type:type+1,
              correctionLevel:label,
              chunkSize:chunkSize,
              fullSpace:chunkSize*carts,
              occupied:codesize,
              free:chunkSize-(codesize%chunkSize),
              carts:carts,
              score:score
            }
          })
  		});
  		return best;
  	}

  	function generateQR(data,config) {
  		var chunks=Math.ceil(data.length/config.chunkSize);
  		var checkSum=Stream.fletcher16(data);
  		var qrs=[];
  		for (var i=0;i<chunks;i++) {
  			var qr = qrcode(config.type, config.correctionLevel);
  			qr.addData(
  				"CRT"+
  				String.fromCharCode(Math.floor(checkSum/256))+
  				String.fromCharCode(checkSum%256)+
  				pad(i,2)+
  				pad(chunks,2)+
  				data.substr(i*config.chunkSize,config.chunkSize)
  			);
  			qr.make();
  			qrs.push(qr)
      }
      return qrs;

  }

  // Cart generator


    this.createQRCart=function(gencfg,compressed,cb) {

        var config,file;
        switch (gencfg.media) {
          case "screen":
          case "gif":{
            config=self.suggestConfiguration(compressed);
            file=gencfg.title+".gif";            
            break;
          }
          case "svg":{
            config=self.suggestConfiguration(compressed,Math.min(3,cfg.QRCOUNT));
            file=gencfg.title+".svg";
            break;
          }
        }
        console.log("COMPILE: Generating QRs...")
        console.log("COMPILE:",config);
        var qrs=generateQR(compressed,config);
        // Create a QR-Cart object
        cb({
          createDataURL:function(id) { return qrs[id].createDataURL(); },
          qrCount:function() { return qrs.length; },
          download:function(asfile) {
            if (!asfile) asfile=file;
            switch (gencfg.media) {
              case "gif":{
                createGIF(qrs,gencfg.title,gencfg.cellSize||2,function(gif){ Stream.downloadFile(asfile,0,gif); });
                break;
              }
              case "svg":{
                createSVG(qrs,gencfg,function(svg){ Stream.downloadFile(asfile,"image/svg+xml",svg); });
                break;
              }
            }
          }                  
      })    
    }
}