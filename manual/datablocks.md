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

We already met a working data block in our working [Hello, World!](README.md) example:

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

_TODO_

## Sounds

_TODO_

## Music and songs

_TODO_

## Sprites

_TODO_

## Tilemaps

_TODO_

## Game code

_TODO_
