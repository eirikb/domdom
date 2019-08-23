## domdom

The proactive web framework for the unprofessional

domdom is an alternative to React + Redux or Vue + Vuex, with support for routing.  
There's no virtual dom.

## Install

```bash
npm i @eirikb/domdom
```

## Run with parcel

index.html
```html
<body><script src="app.jsx"></script></body>
```

app.jsx
```jsx harmony
import domdom from '@eirikb/domdom'

const dd = domdom()

const view = ({on}) => <div>Hello, {on('a', a => a)}</div>

dd.append(document.body, view)

dd.set('a', 'world!')
```

Run
```bash
npx parcel index.html
```

## The domdom object


The domdom object (from `domdom()`, called `dd` above) extends from [@eirikb/data](https://www.npmjs.com/package/@eirikb/data).  
All data functions are available, 
`on` `off` `get` `set` `unset` `trigger` `alias` `unalias`, so it's possible to do things like:
```javascript
dd.on('!+* a', a => console.log(a))
dd.set('a', 'yes')
```

The only function in addition is `append`, which is for appending a view to a parent element.

```jsx harmony
const viewFunction = () => <div></div>
const parentElement = document.querySelector('#app')
dd.append(parentElement, viewFunction)
```

## Views

All functions below are passed into views. All views are either elements (from jsx) or functions.

### Elements from jsx

All elements created with jsx, in the context of domdom, are elements which can be instantly referenced.
```jsx harmony
const element = <div>Behold!</div>
element.style.color = 'red'
```

### "Components"

By creating a function you create a component.  

```jsx harmony
function MyComponent({on}) {
  return <ul>
    {on('players.$id.name', name=> <li>Player {name}</li>}
</ul>
}
```

### on(path, callback, [sort])

Similar to `data.on`, except without flags.

Note that `on` triggers on change in accordance with `data.on`, and it's not "truey"/"falsey", in order
for elements to be removed one must use `dd.unset`.

```jsx harmony
const view = ({on}) => <ul>
  {on('players.$id.name', name => <li>Player {name}</li>)}
</ul>
}
```

### when(path, oddEvenArrayOfCheckAndResult)

Heard of pattern matching? This isn't it

```jsx harmony
const view = ({when}) => <div>
  {when('route', [
    'home', <div>Home!</div>,
    'away', () => <div>Away!</div>,
     route => (route || '').startsWith('eh'), () => <div>Eh?</div>,
     false, () => <div>Route is literally boolean false</div>
  ])}
</div>
```

### or

Neither `on` or `when` will trigger unless there is a value on the path, in order to show something at all
until some value is set `or` must be used.

```jsx harmony
const view = ( {when}) => <div>
  {when('routing', [
    'home', <div>Home!</div>
  ]).or(<div>Loading app in the fastest possible way...</div>)}
</div>
```
