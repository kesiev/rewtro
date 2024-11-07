# Rewtro

<div align="center" style="margin:60px 0">
    <p><img src="markdown/logo.png"></p>
</div>

---

<div align="center">
    <a href="markdown/game-k001-stetris.pdf">Print the launch title cartridge</a> | <a href="https://www.kesiev.com/rewtro/">Load the game using your mobile</a> |  <a href="manual/README.md">Manual</a> | <a href="https://discord.gg/TeAWvnuGku">Discord</a>
</div>

---

**Rewtro** is a weird retro game engine inspired by fantasy consoles and [code golfing](https://en.wikipedia.org/wiki/Code_golf) that runs games encoded in a very small amount of data (2kB/3kB). This way is possible to share games using exoteric and usually data inefficient ways: i.e. sticking some PWA magic and a QR-Code reader to [the engine](https://www.kesiev.com/rewtro/) I've made a fake gaming console for mobile devices...

<div align="center" style="margin:60px 0">
    <p><img src="markdown/rewtro-console.png"></p>
</div>

...that loads games from [papercraft game cartridges](markdown/game-k001-stetris.pdf)...

<div align="center" style="margin:60px 0">
    <p><img src="markdown/photo-papercraft.png"></p>
</div>

...or animated GIFs...

<div align="center" style="margin:60px 0">
    <p><img src="markdown/game-k004-eatman.gif"></p>
</div>

...simply framing them!

<div align="center" style="margin:60px 0">
    <p><img src="markdown/rewtro-scan.gif"></p>
</div>

All the game data (graphic, sound, music, and code) is encoded _into the QR-Codes_ and no data is stored online - and the same goes for the game console code too, once installed on your device - so scrap the paper cartridge and the game is _gone_. But hey... you can produce _your game cartridges_ using just a plain printer and you can _still pirate games_ using a copy machine like we used to do with cassette duplicators in the 80s. I hope it will bring back that retro vibes.

## The game engine

The game engine implements:

  * A super simple physics engine
  * A sprites renderer that supports rotation and scaling
  * A text renderer based on pixel fonts
  * A simple event manager
  * A scene loader and manager
  * A sound synthesizer and basic music sequencer
  * Some commands for doing the math and basic logic
  * Some tilemap handling commands
  * Several custom graphics encoder/decoders
  * Some data packers, from old good zipping to custom algorithms suited for small data

And that's all. No game-specific code has been coded inside the engine. Making an actual game with these few things it's up to you.

## The development tools

Games are coded using JSON structures and I've built some (pretty raw) tools you can use to code your games - together with some sample games. You can find them in the <tt>carts/</tt> subfolder: there is a viewer for built-in color palettes, screen resolutions, controls and fonts you can use in your games.

<div align="center" style="margin:60px 0">
    <p><img src="markdown/rewtro-cartstabs.png"></p>
</div>

To avoid cheating or being _influenced_ by specific games, all presets are based on actual gaming systems form the past (Gameboy, ZX-Spectrum and Commodore 64) and most of them can be overridden by custom ones encoding them into your game code. You can also find a noise generator you can use to create sound effects that feature a pretty simple piano keyboard for sketching some music for your games.

But what you are going to use the most is the game debugger...

<div align="center" style="margin:60px 0">
    <p><img src="markdown/rewtro-cartsdebugger.png"></p>
</div>

...and the game compiler and packager, that generates a foldable cartridge in SVG format to be customized and printed or an animated GIF you can show anywhere you want. Sorry for the _thin_ toolchain: I survived with that but I'm going to improve it if there is some kind of interest.

While both the game console and the SDK tools run client-side, I've added a pinch of PHP for reading the games file list to be displayed on SDK main screen. Feel free to replace that PHP with any alternative you can think about (or suggest one).

You can have a look at a read-only version of the SDK [here](https://www.kesiev.com/rewtro/carts). Hit random buttons, test games, generate SVGs, etc. To play games in debugger use arrow keys and Z/X/C/V as action buttons.

## The developer manual

There is a developer [manual](manual/README.md) with explanations and a lot of code examples that cover everything Rewtro! See you there!

## Released games

In the <tt>carts/</tt> folder, you'll find the SDK and all the games I've developed for Rewtro till now. I've made 2 series of games, split by its initial:

  * The <tt>V-</tt> series contains customizable greeting card games: they include a title screen, a briefing screen, a short and relatively easy gameplay, and a debriefing screen displayed once the game is cleared. Games are customizable in text, gameplay parameters, graphics and - if you feel brave - music and sounds. You can make your cartridges making a copy and renaming a <tt>V-</tt> series JSON file into the same folder, changing the data as you want with any text editor and testing and printing the games within the SDK. That's what I did in November/December 2019.
  * The <tt>K-</tt> series contains short but more complete games, mostly inspired by classics. They are harder to change but you can print them as-is and customize the printed cartridge writing a dedication or a silly doodle on the front, more like a classic greeting card.

Remember that a QR-Cart contains _the whole game code, music, graphics, AND customizations_ so, once the game is printed, you can't change _anything_. If you want to update your game, fixing a bug or a typo, you've to _print the cartridge again_. The previous one will be a _rare bugged version_ of your game to be collected jealously. Welcome to the 80s!

## Why?

It's Christmas time, I needed some greeting cards and decided to make some original ones this year. I liked the idea of hiding the actual greetings at the end of a customized videogame but implementing a browser game lacked the _perishability_ of a greeting card: you want to keep them because it contains _the whole experience_, that is the stock message _and_ the handwritten message. Moreover, the game itself _is part of the message_ so why keeping that _outside the greeting card_?

Then, building physical retro games for specific persons and hiding messages in them gives you that [Petscop's Rainer](https://en.wikipedia.org/wiki/Creepypasta#Petscop) chills that's both cool and frightening.

You can also use these paper cartridges as hints in treasure hunts, put them in [geocaches](https://en.wikipedia.org/wiki/Geocaching), spread its parts as collectible stickers, on video advertising, for fancy business cards, etc.

Rewtro QR-Carts are cheap to print and contain the _whole_ game data, are _physically shareable_, fun to copy and can be easily unique. Take the best of that.

## FAQs

*Q: I want to make a Rewtro game too!*

A: Have a look to the developer [manual](manual/README.md) to learn how to setup your development environment and start developing!

*Q: Which browser I can use for running Rewtro games?*

A: On mobile, you can use Safari on iOS and Firefox or Chrome on Android. I just have an old iMac and a Windows 10 laptop and everything seems working on both Firefox and Chrome...

*Q: Can I run a QR-Cart on a desktop computer?*

A: While it's quite hard to frame a tiny QR-Code printed on paper or displayed on a mobile with a desktop cam, I managed to load a game easily running the Datasette on a tablet and displaying the code full screen (hit the buttons on top of the Datasette screen).

*Q: I've created an SVG cartridge but it looks like I'm missing a font...*

A: I've used the [Jost](https://indestructibletype.com/Jost.html) free font (Jost-500-Medium.otf). Download, install, restart your favorite vector editor and open the SVG again.

*Q: I received a QR-Cart from a friend but I've lost/ruined it. Can I reprint that exact copy using these source files?*

A: Probably not, sorry. QR-Carts are not a reference to a database of games or customizations: they contain the _full game data_ so, if they are lost, they can't be recovered anymore. You may try asking your friend if he can print the cartridge again... it's a great reason to meet him again!

*Q: Can Rewtro load games just from a binary file?*

A: Yes, it's doable, game files should be _very small_ and this way you could make larger games but no, I don't think that the feature fits the project. Rewtro tries to store tiny games in the smallest amount of data possible (at least, that's what I tried to do) and, for that very reason, it has a limited number of commands that are thought to be _easy to be encoded_ instead of being _easy to use_. This self-limitation was key to make something that loads games fast from offline low-storage systems, like QR-Codes and - maybe in the future - audio. Other fantasy consoles and game engines don't have such limitations and, for this reason, are easier to code, they can load larger games from the internet or files. For these reasons, they can handle more complex games. So: if you have a reason to share tiny games using files, feel free to tell me your idea. Otherwise, if you want something that shares larger games in a _digital way_, there are several easier alternatives out there!

*Q: Why the <tt>V-PESCOP-Basic</tt> game looks glitched, features quite disturbing graphics and has cryptic gameplay?*

A: If you know what [Petscop](https://en.wikipedia.org/wiki/Creepypasta#Petscop) is, you already have your answer.

## Disclaimer

Consider Rewtro in beta _right now_. I've not so much time to work on pet projects but I'll try to evolve the game engine a little more without breaking it. There is some kind of engine version tracking in the Rewtro code and encoded in cartridges but, If you want to be extra cautious, make a snapshot of the engine and host it elsewhere - there is no URL encoded in game cartridges so you're safe.

## News and contacts

I use [Twitter](https://twitter.com/kesiev) as my main social. It's probably the best place to be updated about Rewtro and to contact me.

## Credits

Rewtro exists thanks to these techs:

  * [Font Awesome]("https://fontawesome.com/)
  * [Jost Font](https://indestructibletype.com/Jost.html)
  * [JSZip](https://stuk.github.io/jszip/)
  * [LZMA-JS](https://github.com/LZMA-JS/LZMA-JS/)
  * [Instascan](https://github.com/schmich/instascan)
  * [QR-Code generator]("https://github.com/kazuhikoarase/qrcode-generator)
  * [Gif.js](https://github.com/jnordberg/gif.js)
  * [Color Hunt](https://colorhunt.co/palette/276)

...and the great support of these people:

  * [Bianca](http://www.linearkey.net/)
  * [Frulla](https://www.instagram.com/mogliagiovanni/)
  * Stefano Caroli
  * Rosy/Damiano