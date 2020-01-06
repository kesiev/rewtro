# Conditions

_TODO_

## Sub-attributes

_TODO_

```
{
	key:"itsAttribute",
	value:OBJECTATTRIBUTESLIST
}
```

## Values comparison

_TODO_

```
{ key:"is", value:System.padWithUnused(debug,"is",16,[
	"existing", // Existence
	">", ">=", "<", "<=", "!=", "==", "%%", // Logic
])},
```

## Game controller state

_TODO_

```
{ key:"is", value:System.padWithUnused(debug,"is",16,[
	"up", "down", "hit", // Keyboard
])},
```

## Sprite positions

_TODO_

```
{ key:"is", value:System.padWithUnused(debug,"is",16,[
	"under", "over", "onRightOf", "onLeftOf" // Relative position
])},
```

## Sprite collisions

_TODO_

```
{ key:"is", value:System.padWithUnused(debug,"is",16,[
	"collidingWith", // Scene (to check object, just use {ids:"A"} as when clause)
])},{
	key:"deltaX",
	values:GETTERS
},{
	key:"deltaY",
	values:GETTERS
}
```

## Negate

_TODO_

```
{ key:"not", flag:true },
```

## Physics

_TODO_

```
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

## Custom events

```
{
	key:"event", value:EVENTS
}
```

