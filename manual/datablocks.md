# Data blocks

Data blocks are unsorted _bundles of assets_, like graphics, music, sounds, and more taped together and identified by a single letter identifier. When a Rewtro game is started the `A` data block is loaded and executed.

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      <the content of the data block A. It will be loaded when the game starts.>
   },{
      "id":"B",
      <the content of the data block B. It will be loaded on demand.>
   }]
}
```

We already met a working data block in our working [Hello, World!](rewtrocartridge.md) example:

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[{"id":"A","text":"HELLO,~WORLD!","textColor":3,"backgroundColor":2,"width":50,"height":16}],
      "tilemaps":[{"map":["A"]}]
   }]
}
```

This cartridge defines the `A` data block, which contains a single sprite in its `sprites` section and a single tilemap in its `tilemaps` section. Except for the `A` data block which is loaded when the game is started, all data blocks are loaded only when your code requires them and can be loaded multiple times at different times. Mixing data blocks and loading them at the right time you can create title and ending screens, games with multiple levels, multi-state scenes, and more.

## Images

Rewtro stores images into game binaries using different formats, none of them is standard. Good news: the Rewtro compiler can read and convert any PNG for you, so you don't need any external processor. Bad news: these formats have some limits since are thought to use a few bytes and to work well with the data compressor.

To add some images to a data block you have to set the `images` key:

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "images":[
         <add your images here>
      ]      
   }]
}
```

An image has the following mandatory keys:

  * `id`: How the image is referenced in code. It must be one of these values: `font`,`graphics`, `graphics0`, `graphics1`, `graphics2`, `graphics3`, `graphics4`, `graphics5`. The `font` image is used as custom font for your game. The `graphics` image is used as default spritesheet for sprites rendering.
  * `image`: The image data. It has two sub-keys:
    * `data`: The raw image data. Since you can't type in raw binary data you can load an external PNG file using the `_file` [special symbol](specialsymbols.md).
    * `format`: The image format. We're going to talk about them later.

We deserve an example. I've drawn this [sample.png](images/sample.png) 32x16 image and saved it into the `carts/` directory, just in the same place our cartridge JSON file is. It looks like this:

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-zoom.png"></p>
</div>

The following cartridge loads our `sample.png` image into the image `id` called `graphics`, which is the default image for sprites rendering. Then it creates a 16x16 sprite and draws the first face on the screen:

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "images":[{"id":"graphics","image":{"data":{"_file":"sample.png"},"format":"monocolor"}}],
      "sprites":[{"id":"A","graphicsX":0,"graphicsY":64,"width":16,"height":16}],
      "tilemaps":[{"map":["A"]}]
   }]
}
```

This cartridge output is this:

<div align="center" style="margin:60px 0">
    <p><img src="images/image-load.png"></p>
</div>

Why the image is colored while our `sample.png` is just in white and transparent? The secret sauce is into the `monocolor` image format. Rewtro supports up to 15 built-in image formats but just some of them are available. Each image format have its limits and perks.

### Monocolor format

The `monocolor` format reads an image that uses just a solid color and a fully transparent one. When loaded is turned into a multicolor one, replacing the black with all of the palette colors of your [system configuration](rewtrocartridge.md).

The `sample.png` image we used in our previous example was encoded using the `monocolor` format. That image is loaded this way instead:

<div align="center" style="margin:60px 0">
    <p><img src="images/image-monocolor.png"></p>
</div>

Why these colors are used? Because, since [no palette has been defined](rewtrocartridge.md) we're using the default Rewtro palette:

<div align="center" style="margin:60px 0">
    <p><img src="images/palette-default.png"></p>
</div>

See? The colors from the palette and `sample.png` are matching. We can also explain why there is a `graphicsY` set to 64: `graphicsX` and `graphicsY` decides where the sprite image is into a spritesheet image and, at that coordinates, there is that cyan face that appears on the screen.

### Indexed format

The `indexed` format reads an image that uses just colors from the [system palette](rewtrocartridge.md). The image is loaded as-is.

We need another example. Let's create a _very bad_ multicolor version of our `sample.png`. Say hello to [sample-colors.png](images/sample-colors.png):

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-colors-zoom.png"></p>
</div>

This cartridge loads the image and shows its first frame on the screen:

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"     
   },
   "data":[{
      "id":"A",
      "images":[{"id":"graphics","image":{"data":{"_file":"sample-colors.png"},"format":"indexed"}}],
      "sprites":[{"id":"A","graphicsX":0,"graphicsY":0,"width":16,"height":16}],
      "tilemaps":[{"map":["A"]}]
   }]
}
```

Like this:

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-colors-load.png"></p>
</div>

### Rewtro format

You may wonder why there are multiple image formats in Rewtro. The `monocolor` uses less bytes to store an image but you can use one color at a time. The `indexed` format uses more bytes but you can create more detailed sprites. As it usually happens in low-data environments you have to make a trade-off.

The `rewtro` format creates something _in the middle_ between the `monocolor` and the `indexed` format. Images are loaded as-is like the `monocolor` format but just supports _transparency and up to 2 different colors for every 8x8 area of your image_.

That means that it can encode our `sample.png` image keeping just the white color...

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "images":[{"id":"graphics","image":{"data":{"_file":"sample.png"},"format":"rewtro"}}],
      "sprites":[{"id":"A","graphicsX":0,"graphicsY":0,"width":16,"height":16}],
      "tilemaps":[{"map":["A"]}]
   }]
}
```

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-rewtro-load.png"></p>
</div>

...but it's a little inefficient: you can just use the `monocolor` format using fewer bytes and giving you more color options. But this new [sample-2colors.png](images/sample-2colors.png) image...

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-2colors-zoom.png"></p>
</div>

...while it can be encoded by the `indexed` format...

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "images":[{"id":"graphics","image":{"data":{"_file":"sample-2colors.png"},"format":"indexed"}}],
      "sprites":[{"id":"A","graphicsX":0,"graphicsY":0,"width":16,"height":16}],
      "tilemaps":[{"map":["A"]}]
   }]
}
```

...giving this result...

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-2colors-load.png"></p>
</div>

...since in our image we've transparency and up to 2 colors for each 8x8 area, we can just use the `rewtro` format...

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "images":[{"id":"graphics","image":{"data":{"_file":"sample-2colors.png"},"format":"rewtro"}}],
      "sprites":[{"id":"A","graphicsX":0,"graphicsY":0,"width":16,"height":16}],
      "tilemaps":[{"map":["A"]}]
   }]
}
```

...for the same result but saving ~115 bytes, which is _a huge amount of data_ in Rewtro. For the more nerdy of you out there, the `rewtro` format limitations were loosely inspired by the [ZX Spectrum 48K](https://en.wikipedia.org/wiki/ZX_Spectrum#ZX_Spectrum_16K/48K).

### Custom fonts

As I promised [before](rewtrocartridge.md) you can add custom fonts in your game cartridges. All you need is to create an image using any supported format which contains all the letters in all the palette colors into the `font` id image. Something like this:

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-font-sample.png"></p>
</div>

All the letters must have the same size but they don't have to be strictly 8x8 pixels. The fastest way to get this image done is to make your pixel font using a single color, like in our [sample-font.png](images/sample-font.png)...

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-font.png"></p>
</div>

...and load this image using the `monocolor` format...

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "images":[{"id":"font","image":{"data":{"_file":"sample-font.png"},"format":"monocolor"}}],
      "sprites":[{"id":"A","text":"HELLO,~WORLD!","textColor":3,"backgroundColor":2,"width":50,"height":16}],
      "tilemaps":[{"map":["A"]}]
   }]
}
```

This cartridge gives you this:

<div align="center" style="margin:60px 0">
    <p><img src="images/sample-font-load.png"></p>
</div>

Notice that the blue background doesn't cover the full text as it did in our _Hello, World!_ code since this time our font is taller.

## Sounds

Old computers and gaming consoles had different sound chips, each one with its signature sound. Like most of us _old euro gamers_, I've fond memories of the Commodore 64's [SID 6581](https://en.wikipedia.org/wiki/MOS_Technology_6581) but most of you out there will recognize how a [NES](https://en.wikipedia.org/wiki/Nintendo_Entertainment_System) sounds.

Rewtro uses a very simple retro-inspired sound synthesizer which tries to sound _old_ but breaks some limits to make game development a little easier. You can add sounds in a data block with the `sounds` key:

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sounds":[
         <add your sounds here>
      ]      
   }]
}
```

Each sound has a one-letter `id` that's used as a reference when you need to play it and some attributes that instruct the synthesizer on how to play that sound. The Rewtro synthesizer has 8 wave generators you can select with the `wave` key. Its allowed values are: `whitenoise`, `square`, `sine`, `saw`, `triangle`, `tangent`, `whistle`, and `breaker`.

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sounds":[{"id":"A","wave":"square"}],
      "tilemaps":[{"playAudio":"A"}]
   }]
}
```

This cartridge starts with a short _beep_, made using the `sine` wave generator. You can modulate a wave using the keys `bitCrush`, `bitCrushSweep`, `attack`, `sustain`, `limit`, `decay`, `release`, `frequency`, `tremoloFrequency`, `tremoloDepth`, `frequencyJump1onset`, `frequencyJump1amount`, `frequencyJump2onset`, `frequencyJump2amount`, and `pitch`, which accepts values from 0 to 255.

I don't want to annoy you with an in-depth explanation of each of these values. Even I got _super sick_ of fiddling with these values, so I added a super simple _sound editor_ to the SDK. Just select the _note_ icon from the home.

<div align="center" style="margin:60px 0">
    <p><img src="images/sound-editor.png"></p>
</div>

Yeah. It's kinda scary but it does very little - it's just ugly. Changing the _Wave_ combo box and moving all the sliders, the sound editor will play a sound. You can hear the last sound again without changing it hitting the _Play_ button. The _Randomize_ button will randomize all the combo and slider values every time it's hit. You can lock/unlock values to be randomized selecting the checkbox on the left of each option. For now, just skip the _Play note C4_ button and the _Piano_ section. The _Paste this in your resource loader_ contains the JSON you need to put the sound you've just built in a data block.

I've moved some sliders and made an explosion sound.

<div align="center" style="margin:60px 0">
    <p><img src="images/sound-explosion.png"></p>
</div>

To use that sound in a game, I've to give that an `id` and kick it in a data block.

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sounds":[{"id":"A","wave":"whitenoise","attack":17,"sustain":127,"decay":61,"release":127,"frequency":124,"pitch":25}],
      "tilemaps":[{"playAudio":"A"}]
   }]
}
```

This time our cartridge will start with an _EXPLOSION_!

### Channels

Rewtro plays sounds in _virtual channels_ in which only a single sound at a time can be played. By default all `sounds` are played in their _virtual channel_: this means that if the _same sound_ is played _multiple times_ the previous one is stopped. Why? If your game wants to play a _jump_ and _explosion_ sound at the same time it will work since they are played in different channels, but playing the _explosion_ sound ten times will result in a single _explosion_ sound instead, saving you from an unpleasant cacophony.

You are not probably going to set _virtual channels_ to sounds very often but it's good to know that you can set single sounds channels with the `channelId` key. You can set the channel using a single letter.

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sounds":[{"id":"A","channelId":"A","wave":"triangle"}],
      "tilemaps":[{"playAudio":"A"}]
   }]
}
```

Just remember that sounds with the same `channelId` will stop each other when played.

## Music and songs

Rewtro implements a super basic sequencer to play songs in your games. Songs are split into two parts: the `music` part that contains the notes and the instruments to be used to play them and the `song` part that describes a sequence of `music` parts and its tempo. Long story short, your game is going to play `song`s made by different parts of `music`.

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "music":[
         <add your music here>
      ],
      "song":[
         <add your song here>
      ]
   }]
}
```

This time we need to start from a _much complex_ example. Ready?

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sounds":[
         {"id":"A","wave":"square"},
         {"id":"B","wave":"whitenoise"}
      ],
      "music":[
         {
            "id":"A",
            "notes":[
               ["C4-","---","---","C4-","---","---","B3-","---","---","B3-","---","---"],
               ["C4-","   ","   ","G7-","   ","   ","C4-","   ","   ","G7-","   ","   "]
            ],"instruments":"AB"
         },
         {
            "id":"B",
            "notes":[
               ["A3-","   ","B3-","A3-","   ","B3-","---","---","   ","   ","   ","   "],
               ["C4-","   ","G7-","G7-","   ","C4-","   ","   ","G7-","G7-","   ","G7-"]
            ],"instruments":"AB"
         },
         {
            "id":"C",
            "notes":[
               ["A3-","   ","B3-","A3-","   ","G3-","---","---","G3-","A3-","   ","B3-"],
               ["C4-","   ","G7-","G7-","   ","C4-","   ","   ","G7-","G7-","   ","G7-"]
            ],"instruments":"AB"
         }
      ],
      "songs":[{"id":"A","music":"ABAC","loopTo":0,"tempo":2}],
      "tilemaps":[{"song":"A"}]
   }]
}
```

This cartridge starts playing the looping title song from the Flappy Bird clone I did for my 2019 christmas greeting cards. Ready to dive in?

### Music

A `music` block is identified by a single letter `id`, a grid of `note`s and a definition of the `instruments` to be used. This is a `music` block from our complex example.

```
{
  "id":"A",
  "notes":[
     ["C4-","---","---","C4-","---","---","B3-","---","---","B3-","---","---"],
     ["C4-","   ","   ","G7-","   ","   ","C4-","   ","   ","G7-","   ","   "]
  ],"instruments":"AB"
}
```

The `notes` are arranged in rows of the same length of notes called _track_ and each one is played by an instrument, defined by the `instrument` key. The first row is played by the `A` `instrument` and the second row is played by the `B` `instrument`. The instruments are just the `sounds` we talked about before: they are played modulating the `frequency` according to the note to be played. The notes in the rows are played simultaneously and at the same speed, so notes in different rows at the same position are played at the same time.

```
"sounds":[
   {"id":"A","wave":"square"},
   {"id":"B","wave":"whitenoise"}
]
```

These are the instruments our example is going to use. The `A` instrument is a default square wave and will be used to play the main theme (the first row of the `notes` grid) and the `B` instrument is a default white noise wave that's used as drums (the second row of the `noted` grid). When a sound is used as instruments its `channelId` and `frequency` attributes are ignored. 

All of the `notes` are 3 symbols long and there are 3 types of them:

  * You can play a sound specifying the note using [letter notation](https://en.wikipedia.org/wiki/Letter_notation) (using `C`, `D`, `E`, `F`, `G`, `A`, or `B`), the octave using a number from `2` to `7`, and an optional half-step raise (using `#` or `-`). Valid notes are `C4-`, `B3-`, `G7#`.
  * You can do nothing and let the previous note keep going using three minus symbols like this `---`.
  * You can silence the previous note using three spaces.

A `music` block may contain your full song or parts of them: you can arrange multiple `music` blocks, loop them, and change their tempo using `songs`.

### The piano

You can sketch some notes using the piano function in the SDK _sound editor_ we mentioned before. To go there, just select the _note_ icon from the home.

<div align="center" style="margin:60px 0">
    <p><img src="images/sound-piano.png"></p>
</div>

Once you've set up your sound moving sliders and changing combos you can hear how its `C4-` note sounds hitting the _Play note C4_ button. Selecting the _Piano_ input box you can press your QWERTY keyboard keys to play a virtual piano. The notes you can play will range from the previous octave you selected from the _Octave_ selector to the next one and its symbol will appear into the _Piano_ input box once played. The last notes sequence you played will appear into the _Notes book_ text area in an array format: it will be played the same way when pasted into `notes`, so it's a good way to start working on simple music.

### Songs

A song is a sequence of `music` blocks played at a given `tempo` and identified by a single letter `id`. You can optionally define a looping part using the `loopTo` key, otherwise the song music sequence is played just once and then stopped. There is no way to play a `music` block in your game: even if your song is just one `music` block long, you've to create a song with a single music block.

From our music example...

```
"songs":[{"id":"A","music":"ABAC","loopTo":0,"tempo":2}]
```

...here we're defining the song `A` that will play the sequence `A`, `B`, `A` again and then `C` of `music` blocks with a delay of `2` frames between each note as defined by the `tempo` key. The `loopTo` key set to `0` says that the song will loop from the first `music` block of the sequence - removing that key the song will be played just once. The song is played by the `tilemap` statement...

```
"tilemaps":[{"song":"A"}]
```

...but we will talk about `tilemaps` data block later.

## Sprites

_Right now_ there is no way to draw a thing on the screen in Rewtro without sprites. This is one of the strongest limitations of Rewtro since most of the fantasy consoles offer raw commands to draw lines and filled shapes to create vector and even 3D games. Luckily sprites are the key element of most of the classic retrogames and, well... you can get creative and use sprites in unconventional ways.

Describing sprites takes a little more so I've reserved [a manual chapter](spriteattributes.md) to them. Anyway, since we've already seen different sprites in our examples, let's talk about the basics here. Sprites can be added to data blocks using the `sprites` key.

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[
         <add your sprites here>
      ]
   }]
}
```

The `sprites` you're going to add to a data block are more _sprite templates_ than actual moving things on the screen: in your game you can spawn the `sprites` you defined in data blocks multiple times, describe their behavior using [code](codecommands.md), and manipulate them singularly or in groups.

Sprites have an `id` that is used as a reference to spawn, remove, and manipulate them. Do you remember the _Hello, world!_ example?

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[{"id":"A","text":"HELLO,~WORLD!","textColor":3,"backgroundColor":2,"width":50,"height":16}],
      "tilemaps":[{"map":["A"]}]
   }]
}
```

This defines the `A` sprite, which is `50` pixels wide and `16` pixels tall, have the `2`nd color of the [system palette](rewtrocartridge.md) as `backgroundColor`, and displays the `text` `HELLO, WORLD!` in two lines (`~` acts as new line) using the `3`rd color of the palette as `textColor`.

<div align="center" style="margin:60px 0">
    <p><img src="images/helloworld-basic.png"></p>
</div>

You can create multiple sprites and places them around the screen using the `x` and `y` attributes, like this:

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[
        {"id":"A","width":32,"height":64,"backgroundColor":3,"x":16,"y":16},
        {"id":"B","width":64,"height":32,"backgroundColor":6,"x":64,"y":80}
      ],
      "tilemaps":[{"map":["AB"]}]
   }]
}
```

<div align="center" style="margin:60px 0">
    <p><img src="images/sprites-multiple.png"></p>
</div>

As you probably expect, there is [way more to learn about sprites](spriteattributes.md) but we just need to know how to draw _fancy rectangles_ to learn everything about `tilemaps`.

## Tilemaps

You can store a tilemap in a data block using the `tilemaps` key.

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "tilemaps":[
         <add your tilemaps here>
      ]
   }]
}
```

Tilemaps are _way too much flexible_ in Rewro. In our examples, tilemaps were used to spawn sprites...

```
"tilemaps":[{"map":["AB"]}]
```

...play sounds...

```
"tilemaps":[{"playAudio":"A"}]
```

...and songs...

```
"tilemaps":[{"song":"A"}]
```

Well. Rewtro uses `tilemaps` both to create _actual grids of sprites_ as you expected using the `map` key but also to do many of the things a game does when initializing a new scene, such a title screen, a new game level, and so on. You can use just what you need since all of its keys are optional, so you can think about `tilemaps` as a _scene initializer_.

### Grid of sprites

Let's first talk about the most obvious function of `tilemaps`: making grids of sprites. Using the `map` key to define an _ASCII art_ tilemap you can spawn a grid of sprites on the screen, arranging their `id`s in rows and columns of the same length. The spacing between sprites can be defined using the `tileWidth` and `tileHeight` keys and the grid position can be changed using the `x` and `y` attributes.

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[
        {"id":"A","width":16,"height":16,"backgroundColor":3},
        {"id":"B","width":16,"height":16,"backgroundColor":6}
      ],
      "tilemaps":[{
         "tileWidth":16,
         "tileHeight":16,
         "x":16,
         "y":48,
         "map":[
            "AAAA BBB",
            "ABBA BAB",
            "AAAA BBB"
         ]}]
   }]
}
```

This cartridge shows the famous painting [Differences but friendship](https://www.youtube.com/watch?v=dQw4w9WgXcQ) in glorious _developer colors_:

<div align="center" style="margin:60px 0">
    <p><img src="images/tilemaps-sprites.png"></p>
</div>

By default, a `map` is spawned at the top left corner of the screen and has `tileWidth` and `tileHeight` of 8 pixels.

#### Anchor effect

Sprites spawned by `tilemaps` have _lazy coordinates_: if the `x` or `y` keys are set in the sprite definition it will be spawned at that position and the tilemap coordinate will be ignored. This logic is applied to the single coordinates so you can _anchor_ a coordinate and let the tilemap decide the other one position or _anchor_ both of them. This way you can both make a grid of sprites or spawn your game HUD when a new scene is started without code.

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[
        {"id":"A","textColor":3,"text":"A"},
        {"id":"B","textColor":3,"text":"B","y":136},
        {"id":"C","textColor":3,"text":"C","x":0},
        {"id":"D","textColor":3,"text":"D","x":152,"y":136}
      ],
      "tilemaps":[{
         "map":[
            "  BBBBBBBBB",
            "     A    C",
            "    AAA   C",
            "   AADAA  C",
            "  AAAAAAA C"
         ]}]
   }]
}
```

Looking at the `map` grid you are expecting this output...

<div align="center" style="margin:60px 0">
    <p><img src="images/tilemaps-anchorsno.png"></p>
</div>

...but it's not the right one due to _anchors_. The `B` sprite has a `y` anchor, the `C` has an `x` anchor and `D` has both `x` and `y` anchors. Only the `A` sprite don't have any anchor, so the right output is:

<div align="center" style="margin:60px 0">
    <p><img src="images/tilemaps-anchorsyes.png"></p>
</div>

See? A lot of stuff on the screen with a tiny tilemap.

#### Multiple grids

You can define multiple `map`s in a single tilemap data block, each one with its configuration. So...

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[
        {"id":"A","text":"A"},
        {"id":"B","text":"B"},
        {"id":"C","backgroundColor":7,"width":16},
        {"id":"D","backgroundColor":2,"width":16}
      ],
      "tilemaps":[
         {
            "x":56,
            "y":62,
            "map":[
               "A A B ",
               " A B B"
            ]
         },
         {
            "x":40,
            "y":54,
            "tileWidth":16,
            "map":[
               "CDCDC",
               "D   D",
               "C   C",
               "DCDCD"
            ]
         }]
   }]
}
```

...will display two `map`s at different positions and different spacings.

<div align="center" style="margin:60px 0">
    <p><img src="images/tilemaps-multiple.png"></p>
</div>

### Prepare your scene

Using `tilemaps` you can do stuff you usually want to do when a new scene appears: playing a sound effect or a song or changing the screen background color. All these actions can be done [code](codecommands.md) but since they are very common, I decided to put a shortcut here to shrink game size a little bit more.

  * The `backgroundColor` key changes the screen background color. Every time a scene is changed, the screen background color is reversed to the `defaultColor` defined in your [system configuration](rewtrocartridge.md). Setting this key you can have scenes with different background colors.
  * The `song` key plays one of the defined `songs` by its `id`.
  * The `playAudio` key plays one of the defined `sounds` by its `id`.

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sounds":[
         {"id":"A","wave":"triangle"},
         {"id":"B","wave":"whitenoise"}
      ],
      "music":[
         {"id":"A","notes":[["C4-","D4-","E4-","F4-","G4-"]],"instruments":"A"}
      ],
      "songs":[
         {"id":"A","music":"A","tempo":4}
      ],
      "tilemaps":[{
         "backgroundColor":7,
         "song":"A",
         "playAudio":"B"
       }]
   }]
}
```

This cartridge sets the background color to yellow (that's the `7`th color of the default palette), plays the sound with `id` `B` using `playAudio`, which is a short clip of `whitenoise` and, at the same time, it plays the `song` with `id` `A`, which is a short music scale played with the `A` instrument, that's a `triangle` `wave`.

### Set the scene configuration

There is an object that's available in every scene of your Rewtro games that's called `scene` that acts like a [special sprite](specialobjects.md) you can use to move the virtual camera, store global variables and more. You can initialize its values in `tilemaps` using the `set` key. One of the things managed by this `scene` object is the virtual camera position.

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[
        {"id":"A","width":32,"height":64,"backgroundColor":3,"x":0,"y":0}
      ],
      "tilemaps":[{
         "map":["A"],
         "set":[{
            "x":-30,
            "y":-50
         }]
      }]
   }]
}
```

While this object has been spawned at `x` `0` and `y` `0`, so on the top left corner of the screen, it appears very far from that angle. That's because we moved the camera up by `50` pixels and left by `30` pixels.

<div align="center" style="margin:60px 0">
    <p><img src="images/tilemaps-camera.png"></p>
</div>

## Game code

In `code` data blocks you can describe the logic of your game. Time to code!

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "code":[
         <add your code here>
      ]      
   }]
}
```

There is a [whole chapter](codecommands.md) about coding. Coding in Rewtro is pretty weird, so I'm leaving here a tiny example to show you how a `code` data block looks like:

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[{"id":"A","text":"0"}],
      "tilemaps":[{"map":["A"]}],
      "code":[
         {
            "when":[{"as":"keyboard","attribute":"buttonA","if":[{"is":"hit"}]}],
            "then":[
               {"id":"A","sum":[{"value1":[{"smallNumber":1}]}]},
               {"id":"A","set":[{"text":[{"attribute":"value1"}]}]}
            ]
         }
      ]
   }]
}
```

This cartridge shows a counter on the top left of the screen: hit the virtual _A button_ to increase that.

<div align="center" style="margin:60px 0">
    <p><img src="images/code-counter.png"></p>
</div>