# Sprite attributes

_TODO_

## ID and Flags

_TODO_

```
{ key:"id", character:SYMBOLS },
{ key:"flags", string:SYMBOLS, defaultValue:"" },
```

## Background color and graphic

_TODO_

```
{ key:"graphic", value:GRAPHICS, defaultValue:GRAPHICS[0] },
{ key:"x",integer:RANGES.COORD, defaultValue:0 },
{ key:"y",integer:RANGES.COORD, defaultValue:0 },
{ key:"width",integer:RANGES.SIZE, defaultValue:8 },
{ key:"height",integer:RANGES.SIZE, defaultValue:8 },
{ key:"graphicsX",integer:RANGES.SIZE },
{ key:"graphicsY",integer:RANGES.SIZE },
{ key:"graphicsWidth",integer:RANGES.SIZE },
{ key:"graphicsHeight",integer:RANGES.SIZE },
{ key:"backgroundColor", integer:RANGES.COLOR, defaultValue:0 },
```

## Effects

_TODO_

```
{ key:"rotate", integer:RANGES.ANGLE, defaultValue:0 },
{ key:"flipX", bool:true, defaultValue:false },
{ key:"flipY", bool:true, defaultValue:false },
{ key:"scale", float:RANGES.SCALE, defaultValue:1 },
{ key:"visible", bool:true, defaultValue:true },
{ key:"opacity", integer:RANGES.OPACITY, defaultValue:RANGES.OPACITY[1] },
```

## Auto-effects

_TODO_

```
{ key:"aim", integer:RANGES.ANGLE, defaultValue:0 },
{ key:"rotateToAim", bool:true, defaultValue:false },
{ key:"flipXtoSpeedX", bool:true, defaultValue:false },
{ key:"flipYtoSpeedY", bool:true, defaultValue:false },
```

## Animations

_TODO_

```
{ key:"animation", integer:RANGES.SMALLNUMBER },
{ key:"animations", values:System.padWithUnused(debug,"animations",8,[
	{ key:"frames", listNumbers:RANGES.SMALLNUMBER },
	{ key:"mode", value:System.padWithUnused(debug,"mode",4,["loop","once","bounce"]) },
	{ key:"speed", integer:RANGES.SMALLNUMBER }
])}
```

## Text

_TODO_

```
{ key:"font", value:GRAPHICS, defaultValue:GRAPHICS[1] },
{ key:"text", string:SYMBOLS },
{ key:"textColor", integer:RANGES.COLOR, defaultValue:8 },
{ key:"textAlignment", value:System.padWithUnused(debug,"textAlignment",4,["left","right","center"]) },
```

## Physics

_TODO_

```
{ key:"speedX",float:RANGES.SPEED, defaultValue:0 },
{ key:"speedY",float:RANGES.SPEED, defaultValue:0 },
{ key:"speedLimitXTop", float:RANGES.SPEED, defaultValue:4 },
{ key:"speedLimitXBottom", float:RANGES.SPEED, defaultValue:-4 },
{ key:"speedLimitYTop", float:RANGES.SPEED, defaultValue:4 },
{ key:"speedLimitYBottom", float:RANGES.SPEED, defaultValue:-4 },
{ key:"gravityX", float:RANGES.SPEED, defaultValue:0 },
{ key:"gravityY", float:RANGES.SPEED, defaultValue:0 },
{ key:"applyRestitutionX", bool:true, defaultValue:true },
{ key:"applyRestitutionY", bool:true, defaultValue:true },
{ key:"restitutionX", float:RANGES.SPEED },
{ key:"restitutionY", float:RANGES.SPEED },
```

## Collisions

_TODO_

```
{ key:"collisionsEnabled", bool:true, defaultValue:true },
{ key:"touchDown", bool:true, defaultValue:false },
{ key:"touchUp", bool:true, defaultValue:false },
{ key:"touchLeft", bool:true, defaultValue:false },
{ key:"touchright", bool:true, defaultValue:false },
```

## Z-index

_TODO_

```
{ key:"zIndex", integer:RANGES.ZINDEX, defaultValue:0 },
```

## Camera

_TODO_

```
{ key:"noCamera", bool:true, defaultValue: false },
```

## Sprite timer

_TODO_

```
{ key:"timer", integer:RANGES.TIME, defaultValue:0 },
```

## Local variables

_TODO_

```
{ key:"value0", float:RANGES.FLOAT, defaultValue:0 },
{ key:"value1", float:RANGES.FLOAT, defaultValue:0 },
{ key:"value2", float:RANGES.FLOAT, defaultValue:0 },
{ key:"value3", float:RANGES.FLOAT, defaultValue:0 },
{ key:"value4", float:RANGES.FLOAT, defaultValue:0 },
{ key:"value5", string:SYMBOLS, defaultValue:"" },
{ key:"value6", string:SYMBOLS, defaultValue:"" },
{ key:"value7", string:SYMBOLS, defaultValue:"" },
{ key:"value8", string:SYMBOLS, defaultValue:"" },
{ key:"value9", string:SYMBOLS, defaultValue:"" },
```
