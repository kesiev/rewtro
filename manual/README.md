# Rewtro developer manual

_NOTE: I'm writing this manual in random slices of spare time and it's far from being complete right now. Anyway, I hope you'll find this useful in the meanwhile. Some chapters are quite long so I'll split them once the manual is nearing completion._

Rewtro is a fantasy console inspired game engine thought to load games from a very small amount of data. While coding a game in Rewtro can be a little more difficult than other fantasy consoles and game engines due to its self-imposed limits, Rewtro allows you to distribute your games in unusual ways. Right now, the [Rewtro fake console](https://kesiev.com/rewtro) can load games from papercraft cartridges you can build using a computer, any printer, scissors, a cutter, and some foldings. The fake console is thought for mobile devices but it just works on desktop computers too.

To run the Rewtro SDK you just need to download the [Rewtro project](https://github.com/kesiev/rewtro), host its folder on an Apache/PHP server and then load the `carts/` folder in your browser. If everything works, open your favorite editor, create a new JSON file in that `carts/` folder and you're ready to go!

Rewtro origins are humble and it's not thought as a full-fledged project. It exists just because I needed some nice greeting cards for 2019 Christmas. Then I published the whole code as open-source as I usually do with all of my pet projects. Since my parents and friends liked the idea and few _internets_ were curious about how this works, I decided to write this tiny manual.

I'm a little verbose, sorry, but I also love examples-filled documentation too. I hope that this manual will help you a little on how to code a Rewtro game without annoying you _too much_.

## Index

  * _Quickstart_: Let's make a Rewtro game from the code to the paper!
  * [The Rewtro cartridge](rewtrocartridge.md): It explains what a Rewtro cartridge is and how to set basic settings of your game.
  * [Data blocks](datablocks.md): Learn what you can put inside a Rewtro cartridge and how to do that.
    * [Sprite attributes](spriteattributes.md): Sprites are the _moving parts_ of your game. We are going to talk about how to define them!
    * [Code commands](codecommands.md): Time to add some code to your game! Learn how to create conditions and execute actions!
        * [Getters](getters.md): Getters are _the_ most important part of Rewtro. Learn how to select sprites and music notes, create numbers and text, and more!
        * [Conditions](conditions.md): When this stuff happens...
        * [Statements](codestatements.md): ...do that.
    * [Special objects](specialobjects.md): Move the virtual camera, save data across your game scenes and more!
  * [Compiler helpers](compilerhelpers.md): Make your game modular and write code a little faster!
  * Extras: A collection of in-depth articles.
    * [Lists and iterators](listiterators.md): You can make most of your games without knowing how these works but one day you'll want _more_...
    * [Advanced Rewtro](advanced.md): Know Rewtro even better and learn some development tricks.
    * _SDK Manual_: How to use the Rewtro SDK software.
    * _Printing and folding_: A collection of tips on how to print and fold Rewtro QR-Carts.
    * _Physics_: How to work with the tiny Rewtro physics engine.
    * [Neat ideas for the future](ideas.md): A collection of ideas I've collected from people around the _internet_ to make Rewtro better.
    * [Rewtro changelog](rewtrochangelog.md): Differences between different Retro core versions.
