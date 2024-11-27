var QRCart=function(cfg){
  if(!cfg) cfg={};
  if (cfg.QRCARTSPEED===undefined) cfg.QRCARTSPEED=1000;
  if (cfg.QRCARTHEADERSIZE===undefined) cfg.QRCARTHEADERSIZE=10;
  if (cfg.QRHEADERSIZE===undefined) cfg.QRHEADERSIZE=12;
  if (cfg.ASSETROOT === undefined) cfg.ASSETROOT="qrcart/";

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
      {id:"svg-qrcart",url:cfg.ASSETROOT+"qrcart.svg",type:"text"},
      {id:"svg-qrbooklet",url:cfg.ASSETROOT+"qrbooklet.svg",type:"text"},
      {id:"svg-qrcard",url:cfg.ASSETROOT+"qrcard.svg",type:"text"},
      {id:"logo",url: cfg.ASSETROOT +"logo.png",type:"image"}
    ],
    MODELS={
      qrcart:{
        type:"print",
        template:"svg-qrcart",
        extension:"svg",
        qr:{
          suggestedCount:3,
          typeWarning:17,
          typeThreshold:19
        },
        qrslots:["qr-right","qr-left","qr-bottom"],
        layers:[
          {label:"Default cover",flag:"hideDefaultCover"},
          {label:"Instructions",flag:"hideInstructions"},
          {label:"Cartridge name",flag:"hideName"},
        ],
        replaces:[
          {replace:/>Cart name</g,using:"title"},
          {replace:/>Upper Title</g,using:"upperTitle"},
          {replace:/>Center Title</g,using:"centerTitle"},
          {replace:/>Lower Title</g,using:"lowerTitle"},
          {replace:/>Legal Text</g,using:"legalText"},
          {replace:/>Sz_DT</g,using:"sizeData"}
        ]
      },
      qrbooklet:{
        type:"print",
        template:"svg-qrbooklet",
        extension:"svg",
        qr:{
          suggestedCount:6,
          typeWarning:17,
          typeThreshold:19
        },
        qrslots:["qr-1","qr-2","qr-3","qr-4","qr-5","qr-6"],
        layers:[
          {label:"Default cover",flag:"hideDefaultCover"},
          {label:"Instructions",flag:"hideInstructions"}
        ],
        replaces:[
          {replace:/>Cart name</g,using:"title"},
          {replace:/>Upper Title</g,using:"upperTitle"},
          {replace:/>Center Title</g,using:"centerTitle"},
          {replace:/>Lower Title</g,using:"lowerTitle"},
          {replace:/>Legal Text</g,using:"legalText"},
          {replace:/>Sz_DT</g,using:"sizeData"},
          {replace:/>Title-A</g,using:"page1Title"},
          {replace:/>Text-A</g,using:"page1Text"},
          {replace:/>Title-B</g,using:"page2Title"},
          {replace:/>Text-B</g,using:"page2Text"},
          {replace:/>Title-C</g,using:"page3Title"},
          {replace:/>Text-C</g,using:"page3Text"},
          {replace:/>Title-D</g,using:"page4Title"},
          {replace:/>Text-D</g,using:"page4Text"},
          {replace:/>Title-E</g,using:"page5Title"},
          {replace:/>Text-E</g,using:"page5Text"},
          {replace:/>Title-F</g,using:"page6Title"},
          {replace:/>Text-F</g,using:"page6Text"}
        ]
      },
      gif:{
        type:"gif",
        extension:"gif",
        cellSize:2,
        notesSize:15,
        footerSize:30,
        logoSize:10,
        notes:"kesiev.com/rewtro",
        qr:{
          suggestedCount:4,
          typeWarning:17,
          typeThreshold:19
        }
      },
      qrcard:{
        type:"print",
        template:"svg-qrcard",
        extension:"svg",
        qr:{
          suggestedCount:2,
          typeWarning:17,
          typeThreshold:19
        },
        qrslots:["qr-1","qr-2"],
        layers:[
        ],
        replaces:[
          {replace:/>CardTitle</g,using:"cardTitle"},
          {replace:/>001</g,using:"cardNumber"},
          {replace:/>CardNote</g,using:"cardNote"}
        ]
      },
      screen:{
        type:"screen",
        extension:"scr",
        qr:{
          suggestedCount:4,
          typeWarning:17,
          typeThreshold:19
        }
      }
    },

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
  			content=content.replace(new RegExp("<image[^>]+?id=\""+id+"\"[^>]*>","m"),function(a,b){
          var parts=a.split("\n");
          var map={};
          parts.forEach(row=>{
            row=row.trim().split("=");
            if (row[1]) map[row[0]]=row[1].split("\"")[1];
          });
          var svg=createQRSvg(data,map.x*1,map.y*1,map.width,map.height);
          return svg;
        });
  		} else {
  			content=content.replace(new RegExp("<image[^>]+?id=\""+id+"\"[^>]*>","m"),function(a,b){
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

  	function createSVG(qrs,gencfg,model,cb){
      getCache(cache=>{
        var content=cache[model.template];
        model.qrslots.forEach((slot,id)=>{
          content=replaceImage(content,slot,qrs[id]?qrs[id]:0);
        });
        model.replaces.forEach(replace=>{
          content=content.replace(replace.replace,">"+(gencfg[replace.using]||"")+"<");
        });
        model.layers.forEach(layer=>{
          content=content.replace(new RegExp("label=\""+layer.label+"\"([^style]*)style=\"display:([^\"]+)\"","m"),function(m,a){
            return "label=\""+layer.label+"\""+a+"style=\"display:"+(gencfg[layer.flag]?"none":"inline")+"\"";
          });
        });
        cb(content);
      });
  	};

    // GIF Generator

    function createGIF(qrs,gencfg,model,cb){
      getCache(cache=>{
          var cellSize=gencfg.cellSize||model.cellSize;
          var label=gencfg.title;
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
                    canvas.height = size + model.footerSize + model.notesSize;
                    var context=canvas.getContext("2d");
                    context.fillStyle = 'white';
                    context.fillRect(0,0,canvas.width,canvas.height);
                    context.fillStyle = '#00adb5';
                    context.strokeStyle = '#00adb5';
                    context.beginPath();
                    context.moveTo(margin, size+0.5);
                    context.lineTo(canvas.width-margin, size+0.5);
                    context.stroke();
                    if (model.footerSize) {
                      context.fillRect(0,size+model.footerSize,canvas.width,canvas.height);
                      context.drawImage(
                        cache.logo,
                        0,0,cache.logo.width,cache.logo.height,
                        margin, size + ((model.footerSize - model.logoSize ) / 2),
                        cache.logo.width*(model.logoSize/cache.logo.height),model.logoSize
                      );
                      context.textBaseline = "middle";
                        context.textAlign = "right";
                        context.font = "10px Helvetica";
                      context.fillText(label, canvas.width - margin, size + (model.footerSize/2));
                      context.textAlign = "center";
                      context.fillStyle = 'white';
                      context.fillText(model.notes, canvas.width / 2, size + model.footerSize + (model.notesSize / 2));
                      }
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

    // PNG Generator

    function createPNG(qrs,gencfg,model,cb) {
      var 
          cellSize=gencfg.cellSize||model.cellSize,
          margin=cellSize*4,
          frame = qrs[0],
          size=frame.getModuleCount() * cellSize + margin * 2,
          canvas=document.createElement("canvas"),
          context=canvas.getContext("2d");

        canvas.width=size;
        canvas.height =size;
        frame.renderTo2dContext(context,cellSize);
        canvas.toBlob((blob) => {
          cb(blob);
        });
    }

    // General

  	function pad(num,pad) {
  		var num=num+"";
  		while (num.length<pad) num="0"+num;
  		return num;
  	}

    function suggestConfiguration(code,qr) {
      var codesize=code.length;
      var headersize=cfg.QRHEADERSIZE+cfg.QRCARTHEADERSIZE;

      var best;
      CAPACITY.forEach((cap,type)=>{
        if (type < qr.typeThreshold)
          CORRECTIONLEVEL.forEach((label,cid)=>{
            // Calculate chunkSize
            var chunkSize=cap[cid]-headersize;            
            // Calculate number of carts
            var carts=Math.ceil(codesize/chunkSize);           
            // Calculate score
            var score = Math.abs(((qr.suggestedCount-carts)*1000)+cid*100)+type;
            if ((chunkSize>0)&&(!best||(score<best.score))) best={
              type:type+1,
              typeWarning:qr.typeWarning,
              typeLimit:qr.typeThreshold,
              correctionLevel:label,
              chunkSize:chunkSize,
              fullSpace:chunkSize*carts,
              occupied:codesize,
              free:chunkSize-(codesize%chunkSize),
              carts:carts,
              cartsWarning:qr.suggestedCount,
              cartsLimit:qr.suggestedCount,
              score:score
            }
          })
      });
      return best;
    }

    // Basic QR

    this.getQrConfiguration = function(gencfg,compressed){
      var model=MODELS[gencfg.model]||MODELS.qrcart;
      return suggestConfiguration(compressed,model.qr);
    }

  	function generateQR(data,config,cartconfig) {
  		var chunks=Math.ceil(data.length/config.chunkSize);
  		var checkSum=Stream.fletcher16(data);
  		var qrs=[];
  		for (var i=0;i<chunks;i++) {
  			var qr = qrcode(config.type, config.correctionLevel);
  			qr.addData(
  				(cartconfig.cartPrefix || "CRT")+
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
        var file;
        var model=MODELS[gencfg.model]||MODELS.qrcart;
        var config=suggestConfiguration(compressed,model.qr);
        var file=gencfg.title+"."+model.extension;

        console.log("COMPILE: Generating QRs...")
        console.log("COMPILE:",config);
        var qrs=generateQR(compressed,config,gencfg);
        // Create a QR-Cart object
        cb({
          createDataURL:function(id) { return qrs[id].createDataURL(); },
          qrCount:function() { return qrs.length; },
          download:function(asfile) {
            if (!asfile) asfile=file;
            switch (model.type) {
              case "gif":{
                createGIF(qrs,gencfg,model,function(gif){ Stream.downloadFile(asfile,0,gif); });
                break;
              }
              case "print":{
                createSVG(qrs,gencfg,model,function(svg){ Stream.downloadFile(asfile,"image/svg+xml",svg); });
                break;
              }
            }
          }                  
      })    
    }
}