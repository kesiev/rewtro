# Code statements

_TODO - Reference to [getters](getters.md)_

## Changings variables

_TODO_

```
{ key:"set", values:OBJECTATTRIBUTESASSIGN },
{ key:"push", values:OBJECTATTRIBUTESASSIGN },
{ key:"invert", values:OBJECTATTRIBUTESASSIGN },
{ key:"sum", values:OBJECTATTRIBUTESASSIGN },									
{ key:"subtract", values:OBJECTATTRIBUTESASSIGN },
{ key:"multiply", values:OBJECTATTRIBUTESASSIGN },
{ key:"divide", values:OBJECTATTRIBUTESASSIGN },
{ key:"module", values:OBJECTATTRIBUTESASSIGN },
{ key:"pan", values:System.padWithUnused(debug,"pan",2,[
	{ key:"to", values:OBJECTATTRIBUTESASSIGN },
	{ key:"speed",values:GETTERS }
])},
```

## Spawn and remove sprites

_TODO_

```
{ key:"remove", flag:true },
{ key:"spawn", values:System.padWithUnused(debug,"spawn",2,[
	{ key:"at", values:GETTERS },
	{ key:"ids",values:GETTERS }
])},
{ key:"fillAreaWithPattern", gridString:SYMBOLS },
{ key:"outlineAreaWithPattern", gridString:SYMBOLS },
{ key:"placeAt", values:GETTERS },
```

## Manipulating sprite grids

_TODO_

```
{ key:"areaFlipX", flag:true },
{ key:"areaFlipY", flag:true },
{ key:"areaRotate", values:GETTERS },
{ key:"areaCounterclockwise", flag:true },
{ key:"areaCopy", values:System.padWithUnused(debug,"areaCopy",4,[
	{ key:"x", values:GETTERS },
	{ key:"y", values:GETTERS },
	{ key:"fromIds",string:SYMBOLS },
	{ key:"toIds",string:SYMBOLS }
])},
```

## Physics

_TODO_

```
{ key:"bounce", values:System.padWithUnused(debug,"bounce",4,[
	{ key:"speedX", values:GETTERS },
	{ key:"speedY", values:GETTERS },
	{ key:"restitutionX", values:GETTERS },
	{ key:"restitutionY", values:GETTERS }
])},
{
	key:"moveTo",
	values:VECTOR
},
{
	key:"speedTo",
	values:VECTOR
},
{
	key:"setSpeedTo",
	values:VECTOR
},
```

## Audio

_TODO_

```
// Audio - Sounds
{ key:"playAudio", values:GETTERS },
{ key:"stopAudio", flag:true },

// Audio - Music
{ key:"stopChannel", values:GETTERS },
{ key:"runSong", values:GETTERS },
{ key:"stopSong", flag:true },
{ key:"pauseSong", flag:true },
{ key:"playSong", flag:true },
{ key:"setSongTempo", values:GETTERS },
```

## Scene change and multiload

_TODO_

```
{ key:"runScene", values:GETTERS }, // Reset scene and load
{ key:"load", values:GETTERS }, // Keep scene and overwrite memory
```

## Events

_TODO_

```
{ key:"triggerEvent", value:EVENTS },
{ key:"forceEvent", flag:true },
```

## Calling sub-code and breaks

_TODO_

```
{ key:"code", values:"*CODE*" }, // Allow nested code
{ key:"break", flag:true }
```

## Logging

_TODO_

```
{ key:"log",string:SYMBOLS },
```

## Randomizer

_TODO_

```
{ key:"randomize", flag:true },
```
