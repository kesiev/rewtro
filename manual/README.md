# Rewtro Cartridges

_NOTE: I'm writing this manual in random slices of spare time and it's far from being complete right now. Anyway, I hope you'll find this useful in the meanwhile._

## Introduction

Rewtro can be scripted using a monolithic or multi-part JSON file that describes the virtual machine configuration, your music, sound effects, graphics, and the game code. When distributed this JSON is assembled, converted to binary data, compressed, and then split and enveloped in simple protocols depending on the distribution format. Right now Rewtro supports papercraft cartridges and animated GIFs that use QR-Codes to store and load data. In this case, the binarized and compressed JSON is split into parts, one for each QR-Code, each part is labeled with an ID, a progressive number and the total number of parts and then converted to QR-Codes.

When Rewtro loads a game, it repeats the process in reverse: the data is loaded from QR-Codes, sorted using the progressive ID, converted to a compressed binary, unpacked and then converted back to your original JSON file and run.

I'm not going to dwell into this nerdy protocol part: what I'd like you to know is that to make a Rewtro game you're going to put together a JSON file and that very file _is run mainly as-is by the Rewtro engine_. The compile, compress, encode part is up to the Rewtro compiler and is done just for the sake of data transfer, so you're not going to fiddle with bit and bytes. _Probably._

## The JSON backbone.

Let's start making an _empty cartridge_.

  * Rewtro supports multiple _versions_ which are a combination of a game engine and its configuration. Right now the latest version of Rewtro is `0.2`, which uses the custom `RewtroEngine` with extended commands set.
  * Then there is a `metadata` section, which includes several extra details of your game. This part is never encoded in cartridges data but is useful to configure text printed on QR-Carts and more. The only mandatory key of `metadata` is your game name, which is used as file name in exports and displayed by the debugger.
  * There is the `data` section, which is the content of your game and, unsurprisingly, it's mandatory too. Since we're creating a minimal cartridge, let's keep that empty.

That's all. Our minimal cartridge is this one:

```
{
   "systemVersion":"0.2",
   "metadata":{
     "title":"My first game"
   },
   "data":[]
}
```

Which displays a blank screen and a controller with a single button.
