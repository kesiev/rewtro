# Code commands

In order to make a _working game_, you'll need to write some `code` soon enough. Code is used to define your game _logic and rules_: heroes have to follow the button presses, enemies have to fire bullets and, well... the player may have to win or lose.

All of your code is stored in `code` [data blocks](datablocks.md) and it's a sequence of objects containing a `then` key that collects the [statements](codestatements.md) you want to execute, a facultative `when` key with a [condition](conditions.md) that rules the `then` command, and an `else` key that works like the `then` command but it's triggered when the conditions in `when` are _not_ met.

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sounds":[
         {"id":"A","wave":"whitenoise"},
         {"id":"B","wave":"saw","attack":2,"sustain":10,"decay":17,"release":127,"pitch":57}
      ],
      "sprites":[
         {"id":"A","x":72,"y":120,"backgroundColor":3,"rotate":45},
         {"id":"B","speedY":3,"backgroundColor":5,"y":150},
         {"id":"C","x":0,"y":0,"width":160,"backgroundColor":2},
         {"id":"D","width":4,"height":4,"backgroundColor":8,"speedY":-4,"zIndex":2}
      ],
      "tilemaps":[{"map":["ABC"]}],
      "code":[
         {
            "when":[{"as":"keyboard","attribute":"left","if":[{"is":"down"}]}],
            "then":[{"id":"A","subtract":[{"x":[{"smallNumber":3}]}]}]
         },
         {
            "when":[{"as":"keyboard","attribute":"right","if":[{"is":"down"}]}],
            "then":[{"id":"A","sum":[{"x":[{"smallNumber":3}]}]}]
         },
         {
            "when":[{"as":"keyboard","attribute":"buttonA","if":[{"is":"hit"}]}],
            "then":[{"playAudio":[{"character":"B"}],"id":"A","spawn":[{"ids":[{"character":"D"}]}]}]
         },
         {
            "when":[{"id":"D"}],
            "then":[{"code":[
               {
                  "when":[{"if":[{"itsAttribute":"y","is":"<","smallNumber":0}]}],
                  "then":[{"remove":true}]
               },{
                  "when":[{"if":[{"is":"collidingWith","id":"B"}]}],
                  "then":[
                     {"playAudio":[{"character":"A"}],"remove":true},
                     {"id":"B","set":[{"x":[{"list":[0,144],"randomNumber":true}],"y":[{"smallNumber":0}]}]},
                     {"id":"C","sum":[{"value0":[{"smallNumber":1}]}]}
                  ]
               }
            ]}]
         },{
            "when":[{"id":"A","if":[{"is":"collidingWith","id":"B"}]}],
            "then":[{"remove":true,"playAudio":[{"character":"A"}]}]
         },{
            "when":[{"id":"B","if":[{"itsAttribute":"y","is":">","number":160}]}],
            "then":[{"set":[{"x":[{"list":[0,144],"randomNumber":true}],"y":[{"smallNumber":0}]}]}]
         },{
            "then":[
               {"id":"C","set":[{"text":[{"attribute":"value0","prefix":"SCORE: "}]}]},
               {"id":"B","sum":[{"rotate":[{"smallNumber":10}]}]}
            ]
         }
      ]
   }]
}
```

This cartridge is a very basic shooter game! Move the green diamond left and right and use the A button to fire a bullet. Shoot the red square to earn a point but get hit and you lose.

<div align="center" style="margin:60px 0">
    <p><img src="images/commands.png"></p>
</div>

The loaded `code` blocks are executed _before_ updating the screen so, since the [default frame rate](rewtrocartirdge.md) is 25 frames per second, the following actions will _keep happening_ 25 times per second.

The first three lines of `code` handle the player controller, moving the ship sprite `A` when the player holds down `left` and `right`, and firing the bullet sprite `D` from the ship when the `buttonA` is `hit`.

Then an iterator executes the same `code` block on the player bullets `D`: it removes them when off-screen and handles the collision with the `B` enemy.

The following line kills the `A` player when is hit by the `B` enemy. Then the `B enemy is respawned in a random position to the top when it's out of the screen.

The last line doesn't have any `when` condition so it will _always_ run its code: the player score is printed on the screen and the `B` enemy sprite is rotated.

### Every line is a getter

In Rewtro [getters](getters.md) are the most important part of its programming language. Getters are used to _pick_ a game object or its [attributes](spriteattributes.md) in order to check or manipulate it.

And getters are _so important_ that _every line of code is a getter_. Let's have a look to a slice of our tiny shooter game code:

```
{
   "when":[{"id":"A","if":[{"is":"collidingWith","id":"B"}]}],
   "then":[{"playAudio":[{"character":"A"}],"remove":true}]
}
```

That's how the `when` part...

```
"when":[{"id":"A","if":[{"is":"collidingWith","id":"B"}]}],
```

....works this way:

  * The [getter](getters.md) picks all of the spawned sprites having `A` `id`, which is just the player spaceship
  * We're going to describe some logic that rules this picked object and to do that we need an `if` key:
    * The [getter](getters.md) picks all of the spawned sprites having `B` `id`, which is the enemy
    * The `is` [condition](conditions.md) is true when the first picked objects (the player spaceship) is `collidingWith` the locally picked object (the enemy)

Long story short, this `when` command is checking if the spaceship is hitting the enemy. Keys order doesn't matter in Rewtro so you can mix getters, conditions, and statements the way you like the most. These `when` commands all do the same thing:

```
"when":[{"id":"A","if":[{"is":"collidingWith","id":"B"}]}]

"when":[{"if":[{"id":"B","is":"collidingWith"}],"id":"A"}]

"when":[{"if":[{"is":"collidingWith","id":"B"}],"id":"A"}]
```

Code is more readable if you try to arrange it in a natural way_:

```
"when":[{"id":"A","if":[{"is":"collidingWith","id":"B"}]}]
```

This line can be easily read as: `when` the `id` `A` `is` `collidingWith` the `id` `B`.

The same goes for the `then` command, even if it's a little harder to guess. When a `when` command is true the picked objects of the condition are the _default objects_ of the `then` command statements. Moreover, if no getter is defined the _default objects_ are the picked objects. So...

```
"then":[{"remove":true,"playAudio":[{"character":"A"}]}]
```

...works this way:

  * The previous `when` conditions set the `A` sprites as the _default objects_, that is the player spaceship
  * There is no [getter](getters.md) here, so the picked objects are the _default_ ones, so the player spaceship
  * The `remove` [statement](codestatements.md) will remove the current line picked objects from the game scene, that's the player spaceship
  * The `playAudio` [statement](codestatements.md) accepts another getter and plays the sound with its picked `id`:
    * It picks the single `character` `A`
  * So `playAudio` will play the `A` sound, that's the explosion sound.

That's a nerdy way to say: remove the player spaceship and play the explosion sound. The keys order doesn't matter on `then` lines too:

```
"then":[{"remove":true,"playAudio":[{"character":"A"}]}]

"then":[{"playAudio":[{"character":"A"}],"remove":true}]
```

These do the same thing in the same order. If you want to know more about the execution order have a look at its paragraph of the [code statements](codestatements.md) chapter.

Joining the `when` and `when` short versions we have:

  * `when` the player spaceship `A` hits the enemy `B`...
  * `then` remove it and play the `A` explosion sound.

That's why the player spaceship explodes and disappears when hit by the enemy. See? _Every line is a getter_. Keep it in mind and let's move on.

## When

The `when` command is the way you're going to create:

  * Rules: executes the `then` commands only `if` a condition on the picked objects is verified.
  * Iterators: executes the `then` commands on every single picked object.

In our shooter example, we've used `when` in both ways. If you want to create a rule add the `if` key with an `is` [condition](conditions.md):

```
{
   "when":[{"id":"A","if":[{"is":"collidingWith","id":"B"}]}],
   "then":[{"remove":true,"playAudio":[{"character":"A"}]}]
}
```

You can read this line this way: `when` the sprite with `id` `A` `is` `collidingWith` the sprite with `id` `B` `then` `remove` it and play the sound `A`.

If you want to use `when` as iterator you've just to omit the `if` part.

```
 {
   "when":[{"id":"D"}],
   "then":[...]
}
```

This time you can read this line this way: for every single sprite with `id` `B` execute this `then` code.

### Multiple conditions

You can specify multiple lines in a `when` command. All the [conditions](conditions.md) have to be true to trigger the relative `then` command. It will run with the _last picked object_ as the _default object_.

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[
         {"id":"A","textAlignment":"center","x":75,"y":64,"width":16,"height":16,"backgroundColor":3},
         {"id":"B","y":64,"width":16,"height":16,"backgroundColor":5}
      ],
      "tilemaps":[{"map":["AB"]}],
      "code":[
         {
            "when":[
               {"as":"keyboard","attribute":"buttonA","if":[{"is":"down"}]},
               {"id":"A","if":[{"is":"collidingWith","id":"B"}]}
            ],
            "then":[{"set":[{"text":[{"string":"~~~HIT"}]}]}],
            "else":[{"id":"A","set":[{"text":[{"string":""}]}]}]
         },
         {
            "then":[
               {
                  "id":"B",
                  "set":[{"x":[{"attribute":"timer"}]}],
                  "multiply":[{"x":[{"smallNumber":3}]}],
                  "module":[{"x":[{"number":160}]}]
               }
            ]
         }
      ]
   }]
}
```

This cartridge shows a red square moving right and warping. It eventually pass over a green one waiting in the middle of the screen. Holding down the A button the `HIT` message will appear when the two squares collides.

<div align="center" style="margin:60px 0">
    <p><img src="images/commands-multiple.png"></p>
</div>

The first line of `code` has a `when` command with two [conditions](conditions.md): the first one checks if the `keyboard` `buttonA` is `down` and the second one checks `if` the `A` green square sprite `is` `collidingWith` the `A` red moving square. They have to be _both true_ to trigger the `then` command and that's why the `HIT` message will appear just when the two square touches _and_ the A button is held down.

Notice that the `set` command will work on the _default object_ and that's the last picked object by the `when` command. Since it was the `A` sprite the text will appear under the green square.

### Negate

You can negate a condition setting the `not` key to `true` in `when` lines.

```
{
   "systemVersion":"0.2",
   "metadata":{
      "title":"My first game"
   },
   "data":[{
      "id":"A",
      "sprites":[
         {"id":"A","x":64,"width":32,"height":16,"backgroundColor":3},
         {"id":"B","width":32,"height":16,"backgroundColor":5,"y":8,"speedX":1,"text":"TEST"},
         {"id":"C","x":0,"y":40},
         {"id":"D","x":0,"y":48}
      ],
      "tilemaps":[{"map":["ABCD"]}],
      "code":[
         {
            "when":[{"id":"B","if":[{"is":"collidingWith","id":"A"}]}],
            "then":[{"id":"C","set":[{"text":[{"as":"that","attribute":"text"}]}]}],
            "else":[{"id":"C","set":[{"text":[{"string":"----"}]}]}]
         },
         {
            "when":[{"id":"B","not":true,"if":[{"is":"collidingWith","id":"A"}]}],
            "then":[{"id":"D","set":[{"text":[{"as":"that","attribute":"text"}]}]}],
            "else":[{"id":"D","set":[{"text":[{"string":"----"}]}]}]
         }
      ]
   }]
}
```

This cartridge shows a `B` red moving rectangle with the word `TEXT` on it and a `A` green one in the middle of the screen. A label labels displays the same while another one displays `----`. When the two rectangles touches the two labels content is reversed.

<div align="center" style="margin:60px 0">
    <p><img src="images/commands-not.png"></p>
</div>

The two lines of code are checking if the `B` and `A` sprites are colliding with each other and printing the colliding sprite text on a label or a strip of `-` otherwise.

The first line prints the text on the `C` sprite and the second one on the `D` sprite so you can see both of them on the screen. Since the second line has a `not` key set to `true` the two lines logic will work in _reverse_ and that's why when the two sprites collide the two labels the _look_ reversed: when the first condition is true the second one is false and vice versa.

### Events

_TODO_

#### Sprite lifecycle events

_TODO_

```
"isSpawn","isRemoved",
{
   key:"event", value:EVENTS
},
```

#### Physics events

_TODO - Reference to collidingWith_

```
"hitWall"
{
   key:"event", value:EVENTS
},
{
   key:"bounds",
   values:System.padWithUnused(debug,"bounds",16,[
      { key:"modeTop", value:BOUNDSMODES},
      { key:"modeRight", value:BOUNDSMODES},
      { key:"modeBottom", value:BOUNDSMODES},
      { key:"modeLeft", value:BOUNDSMODES},
      { key:"x", values:GETTERS },
      { key:"y", values:GETTERS },
      { key:"width", values:GETTERS },
      { key:"height", values:GETTERS }
   ])
}
```

#### Custom events

```
"event0","event1","event2","event3","event4",
{
   key:"event", value:EVENTS
}
```

## Then and Else

_TODO - Reference to [code statements](codestatements.md) - Mention that else picked object is the one from the current code block. On root code note is undefined._
