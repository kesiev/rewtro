# Rewtromon

<div align="center" style="margin:60px 0">
    <p><img src="markdown/rewtromon-logo.png"></p>
</div>

---

<div align="center">
    <a href="markdown/qrcards-rewtromon-001-004.pdf">Print the cards</a> | <a href="markdown/game-k010-rewtromon.pdf">Print the game</a> | <a href="https://discord.gg/TeAWvnuGku">Discord</a>
</div>

---

**Rewtromon** is a Rewtro game that loads 2 creatures QR-Cards and let them auto-battle. The creature graphics, sounds, and moves data are stored in the QR-Card itself. There is no monsters database so you can freely ~~hack~~ create and share your Rewtromon creatures and share them as you want!

It can be used as a sample if you want to learn how to load QR data within a Rewtro game.

## Rewtrodex

These are the _official_ Rewtromon creatures stats. You can find their JSON files in the [carts](carts/) directory.

| File | ID | Name | Type | Move 1 | Move 2 | Move 3 | Move 4 |
|---|---|---|---|---|---|---|---|
| [JSON](carts/K-010-RWM-001-stampadian.json) | 001 | STAMPADIAN | `E` Earth | Tree Slice (10dmg / `T` 15dmg) | Cross Out (10dmg / `F` 5dmg) | Eraser (10dmg) | Reroll (+5HP) |
| [JSON](carts/K-010-RWM-002-rogue.json)| 002 | ROGUE | `T` Thunder | Bolt Bubble (10dmg / `W` 15dmg) | Pierce (10dmg / `E` 5dmg) | Waterfall (5dmg) | Snack (+10HP) |
| [JSON](carts/K-010-RWM-003-jin.json)| 003 | JIN | `W` Water | Splash (10dmg / `F` 15dmg) | Wave (10dmg / `T` 5dmg) | Squid Bump (15dmg) | Sadness (Nothing) |
| [JSON](carts/K-010-RWM-004-datamapsi.json)| 004 | DATAMAPS-I | `F` Fire | Burning Lie (10dmg / `E` 15dmg) | Burnt Proof (10dmg / `W` 5dmg) | False Truth (10dmg) | Plan (+5HP) |

## Rewtromon format

Rewtromon creatures are basically Rewtro carts with `RWM` header containing a single scene. To set the cart header, set `"metadata": { "cartPrefix": "RWM" }` in your QR-Cart JSON file.

```
"metadata": {
    "title": "RWM001 - Stampadian",
    "cartPrefix": "RWM",
    "cardTitle": "Stampadian",
    "cardNumber": "001",
    "cardNote": "Play with Rewtromon!"
}
```

### Sounds

The creature sounds in the standard Rewtro sound format. Sound `1` is the creature verse and IDs `3`, `4`, `5`, `6` are the matching moves sounds.

```
{
    "id": "1",
    "wave": "breaker",
    "attack": 43,
    "sustain": 127,
    "decay": 127,
    "release": 127,
    "frequencyJump1onset": 76,
    "frequencyJump1amount": 155,
    "frequencyJump2onset": 209,
    "frequencyJump2amount": 104
}
```

### Images

The single `graphics` image includes the whole creature spritesheet. You can find a GIMP source model [here](carts/graphics/sources/rewtromon.xcf). I suggest you to use the `monocolor` format as it uses less bytes.

```
{
    "id": "graphics",
    "image": {
        "data": {
            "_file": "graphics/rewtromon/001-stampadian.png"
        },
        "format": "monocolor"
    }
}
```

### Sprites

The creature name is in the `A` and `1` sprites. Customizable values are:

| Attribute | Meaning | Example |
|---|---|---|
|`text`| The uppercase creature name | `"STAMPADIAN"` |

```
{
    "id": "A",
    "textColor": 1,
    "text": "STAMPADIAN",
    "x": 0,
    "y": 0,
    "width": 160
},
{
    "id": "1",
    "textColor": 1,
    "text": "STAMPADIAN",
    "x": 80,
    "y": 64,
    "width": 160
}
```

The creature sprites are `B` (back facing) and `2` (front facing). The sprites in the example are usually OK for any creature - just set the its type in both sprites `value1`.

| Attribute | Meaning | Example |
|---|---|---|
|`value1`| The creature type (`1` for Earth, `2` for Thunder, `3` for Water, `4` for Fire) | `1` |

```
{
    "id": "B",
    "graphicsX": 0,
    "graphicsY": 60,
    "x": 104,
    "y": 16,
    "width": 32,
    "height": 20,
    "scale": 2,
    "value0": 2,
    "value1": 1
},
{
    "id": "2",
    "graphicsX": 0,
    "graphicsY": 40,
    "x": 24,
    "y": 74,
    "width": 32,
    "height": 20,
    "scale": 2,
    "value0": 4,
    "value1": 1
}
```

The creature moves are sprites `3`, `4`, `5`, and `6`. Customizable values are:

| Attribute | Meaning | Example |
|---|---|---|
|`animations`| The move animation, if any | _See Rewtro sprites documentation_ |
|`animation`| The move animation ID to be played | _See Rewtro sprites documentation_ |
|`value0`| `0` targets the enemy (i.e., attacking), `1` targets itself (i.e., healing) | `0` |
|`value1`| Target shake animation duration in (1 = 2 frames). Use 0-26 even numbers | `5` |
|`value2`| Health change (negative for attacking, positive for healing) | `-5` |
|`value3`| Target element for using special health change instead (`0` for no special health change, `1` for Earth, `2` for Thunder, `3` for Water, `4` for Fire) | `1` |
|`value4`| Special health change (negative for attacking, positive for healing) | `-10` |
|`value5`| Text displayed when the move is performed. The creature name is automatically prepended | `"PACKS A~PUNCH!"` |

```
{
    "id": "3",
    "graphicsX": 32,
    "graphicsY": 240,
    "width": 8,
    "height": 8,
    "animations": [
        {
            "frames": [
                0,
                1,
                2,
                3,
                4
            ],
            "speed": 2,
            "mode": "once"
        }
    ],
    "animation": 0,
    "value0": 0,
    "value1": 5,
    "value2": -10,
    "value3": 2,
    "value4": -15,
    "value5": "ATTACKS WITH~TREE SLICE!"
},{
    "id": "6",
    "graphicsX": 32,
    "graphicsY": 144,
    "width": 8,
    "height": 8,
    "animations": [
        {
            "frames": [
                0,
                1,
                2,
                3
            ],
            "speed": 2,
            "mode": "bounce"
        }
    ],
    "animation": 0,
    "value0": 1,
    "value1": 0,
    "value2": 5,
    "value5": "REROLL FOR~BETTER RESULTS!"
}
```

### Testing

You can test your creature sounds and animations temporarily adding these `tilemaps` and `code` sections to your cart JSON. Remember to remove them before finalizing it!

```
"tilemaps":[
    { "map":[ "A1B2"], "backgroundColor":8 }
],
"code":[
    {
        "when":[{"as":"scene","if":[{"itsAttribute":"value5","is":">","_":0}]}],
        "then":[
            {
                "code":[{
                    "when":[{"if":[{"itsAttribute":"value5","is":"%%","_":2}]}],
                    "then":[{
                        "code":[{
                            "when":[{"ids":"B2"}],
                            "then":[{"sum":[{"x":[{"_":1}]}]}]
                        }]
                    }],
                    "else":[{
                        "code":[{
                            "when":[{"ids":"B2"}],
                            "then":[{"subtract":[{"x":[{"_":1}]}]}]
                        }]
                    }]
                }]
            },
            {"subtract":[{"value5":[{"_":1}]}]}
        ]
    },
    {
        "when":[{"as":"scene","if":[{"itsAttribute":"timer","is":"==","_":0}]}],
        "then":[
            {"flags":"A","remove":true,"playAudio":[{"_":"3"}]},
            {
                "code":[
                    {
                        "when":[{"id":"B"}],
                        "then":[
                            {
                                "spawn":[{"ids":[{"_":"3"}]}],
                                "set":[{
                                    "scale":[{"as":"that","attribute":"value0"}],
                                    "flags":[{"_":"A"}]
                                }]
                            },{
                                "as":"scene",
                                "set":[{
                                    "value5":[{"id":"3","attribute":"value1"}]
                                }],
                                "multiply":[{
                                    "value5":[{"_":2}]
                                }]
                            }
                        ]
                    },{
                        "when":[{"id":"2"}],
                        "then":[{
                            "spawn":[{"ids":[{"_":"3"}]}],
                            "set":[{
                                "scale":[{"as":"that","attribute":"value0"}],
                                "flags":[{"_":"A"}]
                            }]
                        }]
                    }
                ]
            }
        ]
    },
    {
        "when":[{"as":"scene","if":[{"itsAttribute":"timer","is":"==","_":50}]}],
        "then":[
            {"flags":"A","remove":true,"playAudio":[{"_":"4"}]},
            {
                "code":[
                    {
                        "when":[{"id":"B"}],
                        "then":[
                            {
                                "spawn":[{"ids":[{"_":"4"}]}],
                                "set":[{
                                    "scale":[{"as":"that","attribute":"value0"}],
                                    "flags":[{"_":"A"}]
                                }]
                            },{
                                "as":"scene",
                                "set":[{
                                    "value5":[{"id":"4","attribute":"value1"}]
                                }],
                                "multiply":[{
                                    "value5":[{"_":2}]
                                }]
                            }
                        ]
                    },{
                        "when":[{"id":"2"}],
                        "then":[
                            {
                                "spawn":[{"ids":[{"_":"4"}]}],
                                "set":[{
                                    "scale":[{"as":"that","attribute":"value0"}],
                                    "flags":[{"_":"A"}]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "when":[{"as":"scene","if":[{"itsAttribute":"timer","is":"==","_":100}]}],
        "then":[
            {"flags":"A","remove":true,"playAudio":[{"_":"5"}]},
            {
                "code":[
                    {
                        "when":[{"id":"B"}],
                        "then":[
                            {
                                "spawn":[{"ids":[{"_":"5"}]}],
                                "set":[{
                                    "scale":[{"as":"that","attribute":"value0"}],
                                    "flags":[{"_":"A"}]
                                }]
                            },{
                                "as":"scene",
                                "set":[{
                                    "value5":[{"id":"5","attribute":"value1"}]
                                }],
                                "multiply":[{
                                    "value5":[{"_":2}]
                                }]
                            }
                        ]
                    },{
                        "when":[{"id":"2"}],
                        "then":[
                            {
                                "spawn":[{"ids":[{"_":"5"}]}],
                                "set":[{
                                    "scale":[{"as":"that","attribute":"value0"}],
                                    "flags":[{"_":"A"}]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "when":[{"as":"scene","if":[{"itsAttribute":"timer","is":"==","_":150}]}],
        "then":[
            {"flags":"A","remove":true,"playAudio":[{"_":"6"}]},                    
            {
                "code":[
                    {
                        "when":[{"id":"B"}],
                        "then":[
                            {
                                "spawn":[{"ids":[{"_":"6"}]}],
                                "set":[{
                                    "scale":[{"as":"that","attribute":"value0"}],
                                    "flags":[{"_":"A"}]
                                }]
                            },{
                                "as":"scene",
                                "set":[{
                                    "value5":[{"id":"6","attribute":"value1"}]
                                }],
                                "multiply":[{
                                    "value5":[{"_":2}]
                                }]
                            }
                        ]
                    },{
                        "when":[{"id":"2"}],
                        "then":[
                            {
                                "spawn":[{"ids":[{"_":"6"}]}],
                                "set":[{
                                    "scale":[{"as":"that","attribute":"value0"}],
                                    "flags":[{"_":"A"}]
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "when":[{"as":"scene","if":[{"itsAttribute":"timer","is":"==","_":200}]}],
        "then":[
            {"set":[{"timer":[{"_":-1}]}]}
        ]
    }
]
```

### Creating the QR-Card

Once you're happy with your creature JSON file, place it in the `carts/` directory, open the SDK page, select _QR-Card: Default_ format from the combo box, and hit the print icon on your creature JSON file. It will download the card `SVG` file to be opened, pimped, and printed with your favorite SVG editor (I suggest you [Inkscape](https://inkscape.org/)).

Make sure to have the the [Jost](https://indestructibletype.com/Jost.html) free font (Jost-500-Medium.otf) installed.

