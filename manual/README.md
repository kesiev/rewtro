# Rewtro developer manual

_NOTE: I'm writing this manual in random slices of spare time and it's far from being complete right now. Anyway, I hope you'll find this useful in the meanwhile._

Rewtro is a fantasy console/game engine thought to load games from a very small amount of data. While coding a game in Rewtro can be a little more difficult than other fantasy consoles and game engines due to its self-imposed limits, Rewtro allows you to distribute your games in unusual ways. Right now, the [Rewtro fake console](https://kesiev.com/rewtro) can load games from papercraft cartridges you can build using a computer, any printer, scissors, a cutter, and some foldings. The fake console is thought for mobile devices but it just works on desktop computers too.

To run the Rewtro SDK you just need to download the [Rewtro project](https://github.com/kesiev/rewtro), host its folder on an Apache/PHP server and then load the `carts/` folder in your browser. If everything works, open your favorite editor, create a new JSON file in that `carts/` folder and you're ready to go!

Rewtro origins are humble and it's not thought as a full-fledged project. It exists just because I needed some nice greeting cards for 2019 Christmas. Then I published the whole code as open-source as I usually do with all of my pet projects. Since my parents and friends liked the idea and few _internets_ were curious about how this works, I decided to write this tiny manual.

I hope it will help you a little on how to code a Rewtro game.

## Index

  * [The Rewtro cartridge](rewtrocartridges.md): It explains what a Rewtro cartridge is and how to set basic settings of your game.
  * [Data blocks](datablocks.md): Learn what you can put inside a Rewtro cartridge and how to do that.
    * [Sprite attributes](spriteattributes.md): Sprites are the _moving parts_ of your game. We are going to talk about how to define them!
    * [Code statements](codestatements.md): Time to add some code to your game!
  * [Compiler helpers](compilerhelpers.md): Make your game modular and write code a little faster!
