# QR Reader

From version 0.3, Rewtro games can read extra text and data from QR Codes too! This feature is not restricted to a specific print format, so they can read QR-Carts, QR-Booklets, QR animated GIFs, and even standard text QR codes from Rewtro games.

The QR-Card print format has been thought to share Rewtro games extra data: it's a poker card sized sheet that hosts 2 QR codes.

## Read text QR codes

The easiest way to read QR codes from Rewtro games is using standard text QR codes.

The `scanCode` statement stops the code execution and opens the Rewtro QR code reader. You must set the `scanCode` to a `string` to be used as a code value prefix: the QR code reader will only allow QR codes containing a string value that starts with that prefix.

The read value (excluding the prefix) will be stored in the `scene` `value9` attribute and it can be read on the following frame. If the user closes the QR reader, the  `scene` `value9` will be `0`.

```
{
"systemVersion":"0.3",
	"metadata":{
		"title":"QR READER"
	},
	"data":[{
		"id":"A",
		"sprites":[
			{"id":"A","backgroundColor":2,"text":"PRESS (A) AND~SCAN A QR CONTAINING~'COD' + STRING","textColor":3,"x":0,"y":0,"textAlignment":"center","width":160,"height":24},
			{"id":"B","textColor":8,"x":0,"y":76,"textAlignment":"center","width":160,"height":8}
		],
		"tilemaps":[{"map":["AB"]}],
		"code":[
			{
				"when":[{"as":"keyboard","attribute":"buttonA","if":[{"is":"down"}]}],
				"then":[{"scanCode":"COD"}]
			},{"then":[
				{ "id":"B","set":[{"text":[{"as":"scene","attribute":"value9"}]}]}
			]}
		]
	}]
}
```

This example will read text QR codes starting with `COD` ignoring any other code. So, this QR code that encodes the `CODIT WORKS!` text will be loaded:

<div align="center" style="margin:60px 0">
	<p><img src="images/qrcode-itworks.png"></p>
</div>

...but this QR code that encodes the `IT DOESNT WORK` text will be ignored:

<div align="center" style="margin:60px 0">
	<p><img src="images/qrcode-itdoesntwork.png"></p>
</div>

This way you can create codes that work with specific Rewtro games.

## Import extra Rewtro data

Rewtro games can also import extra Rewtro data by reading QR codes... Even from other Rewtro games! You must set the `scanCode` to a 3-letters `string` to be used as the allowed QR code value prefix and set the `scanCodeMap` attribute to pick which assets to import from the imported data.

  * `fromScene` sets from which imported data scene you want to import assets.
  * `toScene` sets to which local scene you want to import assets.
  * `sounds` maps the `sounds` to import as a sequence of letter pairs: for each pair, the first letter is the `fromScene` sound ID and the second letter is the `toScene` sound ID to be replaced/added.
  * `music` maps the `music` to import as a sequence of letter pairs: for each pair, the first letter is the `fromScene` music ID and the second letter is the `toScene` music ID to be replaced/added. The music `instruments` will be automatically adjusted following the `sounds` map.
  * `songs` maps the `songs` to import as a sequence of letter pairs: for each pair, the first letter is the `fromScene` song ID and the second letter is the `toScene` song ID to be replaced/added. The song `music` will be automatically adjusted following the `music` map.
  * `images` maps the `images` to import as an array of graphic ID pairs: the `from` ID is the `fromScene` image ID and the `to` ID is the `toScene` image ID to be replaced/added.
  * `sprites` maps the `sprites` to import as a sequence of letter pairs: for each pair, the first letter is the `fromScene` sprite ID and the second letter is the `toScene` sprite ID to be replaced/added. The sprite `graphic` will be automatically adjusted following the `images` map.
  * `tilemaps` maps the `tilemaps` to import as an array of tilemap position pairs: the `from` ID is the `fromScene` tilemap position and the `to` ID is the `toScene` tilemap position to be replaced. The tilemap `map` will be automatically adjusted following the `sprites` map.

You can import assets from/to multiple scenes defining more `scanCodeMap` elements.

If valid data have been read and imported, the  `scene` `value9` will be `1`. Otherwise, it will be `0`.

```
{
	"systemVersion":"0.3",
	"metadata":{
		"title":"Stetris Stealer"
	},
	"systemConfiguration":[{"paletteModel":1,"controllerModel":3}],
	"data":[{
		"id":"A",
		"sprites":[
			{"id":"A","backgroundColor":2,"text":"PRESS (A) AND~SCAN THE STETRIS~GAME QR CODES","textColor":1,"x":0,"y":0,"textAlignment":"center","width":160,"height":24}
		],
		"tilemaps":[{"map":["ABC"],"backgroundColor":8,"playAudio":"C","song":"Z"}],
		"code":[
			{
				"when":[{"as":"keyboard","attribute":"buttonA","if":[{"is":"hit"}]}],
				"then":[{
					"scanCode":"CRT",
					"scanCodeMap":[{
						"fromScene":"A",
						"toScene":"B",
						"sounds":"ABBAXC",
						"images":[
							{
							"from":"graphics",
							"to":"graphics0"
							}
						],
						"sprites":"AC",
						"tilemaps":[
							{
							"from":0,
							"to":0
							}
						],
						"music":"AEBFCGDH",
						"songs":"AZ"
					}]
				}]
			},{
				"when":[{"as":"keyboard","attribute":"buttonB","if":[{"is":"hit"}]}],
				"then":[{"playAudio":[{"_":"A"}]}]
			},{
				"when":[{"as":"keyboard","attribute":"buttonC","if":[{"is":"hit"}]}],
				"then":[{"playAudio":[{"_":"B"}]}]
			},{
				"when":[{"as":"keyboard","attribute":"buttonD","if":[{"is":"hit"}]}],
				"then":[{"playAudio":[{"_":"C"}]}]
			},{
				"when":[{"as":"scene","attribute":"value9","if":[{"is":"==","_":1}]}],
					"then":[
					{"runScene":[{"_":"AB"}]}
				]
			}
		]
	},{
		"id":"B",
		"sprites":[],
		"images":[],
		"sounds":[],
		"tilemaps":[],
		"songs":[],
		"music":[]
	}]
}
```

This example will load the [Stetris](../markdown/game-k001-stetris.pdf) game data to show the game title screen logo, play the game's main theme, and play some of the game sound effects when hitting the B/C/D buttons.

Rewtro games start with the `CRT` string, hence the `"scanCode":"CRT"` statement. You can create Rewtro games with different headers setting the `cartPrefix` attribute in your JSON.

```
"metadata": {
	"title": "RWM001 - Stampadian",
	"cartPrefix": "RWM",
	"cardTitle": "Stampadian",
	"cardNumber": "001",
	"cardNote": "Play with Rewtromon!"
}
```

For example, the [Rewtromon](../REWTROMON.md) game creature cards are Rewtro games with a single scene starting with a `RWM` header, so they are ignored by the Rewtro cart loader and read by the Rewtromon game.

Long story short, Rewtro extra data QR codes contain Rewtro games with a different header from which a game can cherry-pick resources.
