# Getters

_TODO_

## Direct getters

_TODO_

```
{ key:"as", value:System.padWithUnused(debug,"as",16,["this","that","target","scene","game","keyboard","songRow","allSprites"])},
```

## Constructors

_TODO_

```
{ key:"list", listNumbers:RANGES.INTEGER },
{ key:"numbers", listNumbers:RANGES.INTEGER },
{ key:"emptyList", flag:true },
// --- General values
{ key:"number", integer:RANGES.NUMBER },
{ key:"smallNumber", integer:RANGES.SMALLNUMBER },
{ key:"integer", integer:RANGES.INTEGER },
{ key:"smallInteger", integer:RANGES.SMALLINTEGER },
{ key:"float", float:RANGES.FLOAT },
{ key:"largeNumber", integer:RANGES.LARGENUMBER },
{ key:"undefined", flag:true },
{ key:"string", string:SYMBOLS },
{ key:"character", character:SYMBOLS },
{ key:"coordinates", listNumbers:RANGES.INTEGER },
```

## Subvalues

_TODO_

```
{ key:"index", values:"*GETTERS*" },
{ key:"attribute", value:OBJECTATTRIBUTESLIST},
{ key:"sublist", value:OBJECTATTRIBUTESLIST},
{ key:"randomNumber", flag:true },
{ key:"randomValue", flag:true },
```

```
OBJECTATTRIBUTESLIST are sprites attributes +
"up", "down", "left", "right", "buttonA", "buttonB", "buttonC", "buttonD", // Keyboard keys
"M0","M1","M2","M3","M4","M5","M6","M7","M8","M9" // songRow Channel
```

## Sprite getters

_TODO_

```
{ key:"angleTo", values:"*GETTERS*" },
{ key:"distanceTo", values:"*GETTERS*" },
{ key:"nearest", values:"*GETTERS*" },
{ key:"farthest", values:"*GETTERS*" },
{ key:"inArea", values:AREA },
```

## Math and logic

_TODO_

```
{ key:"abs", flag:true },
{ key:"sqrt", flag:true },
{ key:"sin", flag:true },
{ key:"cos", flag:true },
{ key:"acos", flag:true },
{ key:"limit", listNumbers:RANGES.INTEGER },
{ key:"oneRandom", flag:true },
{ key:"prefix", string:SYMBOLS },
{ key:"suffix", string:SYMBOLS },
{ key:"negate", flag:true },
{ key:"max", flag:true },
{ key:"min", flag:true },
{ key:"count", flag:true },
```