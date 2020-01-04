# Advanced Rewtro

I'm collecting here some advanced details on how Rewtro works and some tips I collected during game development. Hope you'll find them useful!

## Preloaded data blocks

When a Rewtro cartridge is loaded all the `music` and `sounds` from any [data block](datablocks.md) is preloaded. That means that you can't overwrite sounds and music loading different data blocks during your game. That's not true for `sprites`, `images`, `tilemaps`, `songs`, and `code`: when loaded they overwrite previous data, so you can make stages with different graphics, tilemaps, sprites, code, and songs _recycling_ the same `id`s loading different data blocks.

## Audio and SDK

HTML5 specs say that sound in browsers must be enabled during user interaction. On fake game console audio is enabled as soon as the user selects any of the dashboard icons and on SDK audio is enabled when the user clicks any of its buttons, so the audio is enabled _before_ the game is started and you won't notice anything. But the SDK _remembers_ your last screen when reloaded and, when you're debugging a game, it will run it immediately without enabling audio. To enable audio _manually_ that just click the game screen.

## Sound editor and paste in code

The sound editor has a _Paste this in code_ section that shows a more verbose JSON for each sound. You can paste that JSON in Rewtro JavaScript code to create _system sounds_. That's how the `shutter` and `click` sounds of the fake console dashboard [were made](https://github.com/kesiev/rewtro/blob/master/libs/gameconsole.js).