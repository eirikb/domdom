<h1 align="center">domdom</h1>
<p align="center">The proactive web front-end framework for the unprofessional</p>
<p align="center">

  <a href="https://npmjs.org/package/@eirikb/domdom">
    <img src="https://img.shields.io/npm/v/@eirikb/domdom.svg">
  </a>
  <a href="https://github.com/eirikb/domdom/actions?query=workflow%3ABuild">
    <img src="https://github.com/eirikb/domdom/workflows/Build/badge.svg">
  </a>
  <a href="https://bundlephobia.com/result?p=@eirikb/domdom">
    <img src="https://badgen.net/bundlephobia/minzip/@eirikb/domdom">
  </a>
</p>
<p align="center">
	<a href="https://www.npmjs.com/package/@eirikb/domdom">npm</a> ·
	<a href="https://deno.land/x/domdom">Deno</a>
</p>
<p align="center">
<a target="_blank" rel="noopener noreferrer"
     href="https://user-images.githubusercontent.com/241706/83919341-b0a9fb00-a77a-11ea-9965-beea17502fdd.gif"><img
    src="https://user-images.githubusercontent.com/241706/83919341-b0a9fb00-a77a-11ea-9965-beea17502fdd.gif"
    style=""></a>
</p>

---

**Facts** - not highlights, just facts:

- Alternative to React + Redux or Vue + Vuex
- Written in TypeScript
- No virtual dom
- Support for Deno (without jspm or pika)
- Nothing reactive - totally unreactive - fundamentally different from React
- One global observable state
    - Support for re-usable components (with partition of global state)
    - No local state
- JSX return pure elements

## Menu

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Deno](#deno)
- [Getting started](#getting-started)
- [APIsh](#apish)
  - [Initialize domdom](#initialize-domdom)
  - [Elements](#elements)
  - ["Domponents"](#domponents)
    - [Children / Composition](#children--composition)
  - [Events](#events)
  - [on(path)](#onpath)
    - [Standalone `on`](#standalone-on)
    - [Child path lookup](#child-path-lookup)
  - [or](#or)
  - [dd-model](#dd-model)
  - [Attributes](#attributes)
    - [Pathifier](#pathifier)
- [Recipes](#recipes)
  - [Routing](#routing)
  - [Login form](#login-form)
  - [Split view and data](#split-view-and-data)
  - [Animation (garbage collection)](#animation-garbage-collection)
- [TypeScript](#typescript)
  - [GodMode](#godmode)
    - [Example](#example)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Deno

domdom has full support for Deno!  
See https://github.com/eirikb/domdom-deno and https://deno.land/x/domdom .

## Getting started

```bash
npm i @eirikb/domdom
```

index.html:

```html

<body>
<script src="app.jsx"></script>
</body>
```

app.jsx:

```jsx
import domdom from '@eirikb/domdom';

const { React, init, on, set } = domdom();

const view = <div>Hello, {on('name')}</div>;

init(document.body, view);

set('name', 'world!');
```

Run:

```bash
npx parcel index.html
```

## APIsh

### Initialize domdom

```jsx
import domdom from '@eirikb/domdom';

const dd = domdom(parentElement, view);
```

### Elements

All elements created with jsx, in the context of domdom, are elements which can be instantly referenced.

```jsx
const element = <div>Behold!</div>;
element.style.color = 'red';
```

### "Domponents"

By creating a function you create a Domponent (component).

```jsx
function MyComponent() {
  return (
    <ul>
      {on('players.$id.name').map(name => (
        <li>Player {name}</li>
      ))}
    </ul>
  );
}
```

#### Children / Composition

Content of a component will be passed as `children`.

```jsx
function Button({}, { children }) {
  return <button>{children}</button>;
}

const view = (
  <div>
    <Button>
      <b>Hello</b>
    </Button>
  </div>
);
```

In TypeScript (TSX):

```tsx
import {Opts} from '@eirikb/domdom';

const Button = ({something}: { something: string }, {children}: Opts) => (
    <button>{children}</button>
);

const view = (
    <div>
        <Button something=":)">
            <b>Hello</b>
        </Button>
    </div>
);
```

### Events

All attributes starting with 'on' are added to `addEventListener` on the element.

```jsx
function MyButton() {
  return <button onClick={() => trigger('Clicked!')}>Click me!</button>;
}
```

### on(path)

```jsx
const view = (
  <ul>
    {on('players.$id.name').map(name => (
      <li>Player {name}</li>
    ))}
    {on('info')}
  </ul>
);
```

This will match on `players.p1.name` and `players.p2.name` etc. The `$id` is a **path modifier**. domdom supports these
modifiers:

```
     $x   Named wildcard
     *    Wildcard
     **   Recursive wildcard (can only be put at the end)
```

`path` can contain wildcards, either names with `$` or any with `*`. Named wildcards can be resolved in the callback:

```jsx
on('players.$id').map((player, { $id }) => console.log(`Id is ${$id}`));
```

You can have multiple wildcards: `players.$id.items.$itemId.size`.

#### Standalone `on`

`on` inside JSX will be attached to the element so listeners are turned on/off based on elements present in the DOM.  
Calling `on` outside of JSX will _not_ automatically start the listener.  
If you want a global forever call `globalOn()`. This returns a string reference you can use to remove the listener,
using `off`:

```js
const ref = globalOn('!+* test', console.log);
// ... later
off(ref);
```

The `!+*` above are flags. These only apply to `globalOn`. They state when the listener should trigger. You can have one
or several of these. The space separate flags and path. Supported flags are:

```
     *   Value changed
     !   Immediate callback if value exists
     +   Value added
     -   Value removed
     =   Trigger only (no value set)
```

If you have an element you should `attach` it to that, like this:

```jsx
const element = <div></div>;
element.attach(
  on('!*+ test', x => element.textContent = x)
);
```

`attach` is added to elements created by domdom (`Domode` in TSX).

#### Child path lookup

By using `child` it's possible to listen to relative paths "from parent".  
This is how it's possible to make re-usable "detached" components.  
They have data in global state, but don't rely on the parent path.

```jsx
const view = (
  <div>
    {on('players.$id').map((player, { child }) => (
      <div>
        Player name: (won't update on change): {player.name} <br/>
        {on(child('name')).map(name => (
          <span>Player name: {name}</span>
        ))}
      </div>
    ))}
  </div>
);
```

### or

Neither `on` will trigger unless there is a value on the path, in order to show something at all until some value is
set `or` must be used.

```jsx
const view = (
  <div>
    {on('ready').map(() => 'Ready!').or(
      <div>Loading app in the fastest possible way...</div>
    )}
  </div>
);
```

### dd-model

This is a convenience hack for putting data into and out of a data path from an input.  
Similar to v-model and ng-model.  
Suggest not using this if possible, using forms directly like in recipes is much better.

```jsx
globalOn('= search', event => {
  event.preventDefault();
  set('result', `Data for ${get('text')} here...`);
});

const view = (
  <form onSubmit={e => trigger('search', e)}>
    <input type="search" dd-model="text"/>
    <input type="checkbox" dd-model="more"/>
    {on('more').map(() => 'This is more')}
    Current text: {on('text')}
    <button type="submit">Search</button>
    {on('result')}
  </form>
);
```

### Attributes

It's possible to use `on` directly on attributes.  
It might feel and look a bit quirky, but there it is.

```jsx
const view = (
  <div>
    <button onClick={() => set('toggle', !get('toggle'))}>Toggle</button>
    <button disabled={on('toggle').or(true)}>A</button>
    <button disabled={on('toggle').map(res => !res)}>B</button>
  </div>
);
```

#### Pathifier

Every time you call `on` you always get a `pathifier`. With support for `map`, `filter`, `sort`, `slice` and `aggregate`
.

E.g.,

```jsx
const view = (
  <ul>
    {on('users')
      .map(user => <li>{user.name}</li>)
      .filter(user => user.name !== 'Mr. B')
      .sort((a, b) => b.id.localeCompare(a.id))}
  </ul>
);
```

Will render as:

```html

<ul>
  <li>Mr. C</li>
  <li>Mr. A</li>
</ul>
```

There's also `mapOn`, `filterOn`, `sortOn` and `sliceOn`. Use these if you want to listen for another path for changes,
and then map/filter/sort/slice when these changes.  
This will listen both for changes on the given path, and the path provided to the method.

E.g.,

```jsx
const view = (
  <ul>
    {on('users')
      .map(user => <li>{user.name}</li>)
      .filterOn('test', (user, { onValue }) => user.name !== onValue)}
  </ul>
);
set('test', 'Mr. C');
// Add users as above
```

Will render as:

```html

<ul>
  <li>Mr. A</li>
  <li>Mr. B</li>
</ul>
```

## Recipes

How to handle common tasks with domdom

### Routing

```jsx
const view = (
  <div>
    {on('route').map(route => {
      switch (route) {
        case 'login':
          return <Login/>;

        case 'welcome':
          return <Welcome/>;

        default:
          return 'Loading app...';
      }
    })}
  </div>
);

function gotoRoute(route) {
  window.location.hash = route;
}

window.addEventListener('hashchange', () =>
  set('route', window.location.hash.slice(1))
);
```

### Login form

```jsx
function login(event) {
  event.preventDefault();
  fetch('/login', {
    method: 'post',
    body: new URLSearchParams(new FormData(event.target)),
  });
}

const view = (
  <form onSubmit={login}>
    <input name="username"/>
    <input name="password" type="password"/>
    <button type="submit">Login</button>
  </form>
);
```

### Split view and data

_domdom.js_

```js
import domdom from '@eirikb/domdom';

const dd = domdom();
export const React = dd.React;
export const init = dd.init;
export const on = dd.on;
export const globalOn = dd.globalOn;
export const get = dd.get;
export const set = dd.set;
export const trigger = dd.trigger;
```

_data.js_

```js
import { on, globalOn, set } from './domdom';

globalOn('= search', event => {
  event.preventDefault();
  const searchText = event.target.search.value;
  set('result', `Data for ${searchText} here...`);
});
```

_index.jsx_

```jsx
import data from './data';
import { on, init, trigger } from './domdom';

const view = (
  <form onSubmit={e => trigger('search', e)}>
    <input type="search" name="search"/>
    <button type="submit">Search</button>
    {on('result')}
  </form>
);

init(document.body, view);
```

### Animation (garbage collection)

At writing moment domdom doesn't have any unmount callback.  
I'm not a big fan of destructors, unmounted, dispose or similar.  
This might seem silly, and it might not be obvious how to use say `setInterval`, without this preventing the element
from ever being cleaned up by garbage collector.

```jsx
const view = <div>
  <img src="https://i.imgur.com/rsD0RUq.jpg" style={
    on('tick').map(time => ({ rotate: `${time % 180}deg` }
    ))
  }/>
  <button onClick={() => set('run', !get('run'))}>Start/Stop</button>
</div>;

(function loop(time) {
  if (get('run')) {
    set('tick', time);
  }
  requestAnimationFrame(loop);
})(0);
```

## TypeScript

domdom has full TypeScript support, it's written in TypeScript.

### GodMode

An experimental mode. Creates
a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). When properties are
modified `set`/`unset` will be called automatically.  
This makes it much easier to work with TypeScript and types.  
Note: Does **not** support IE11.

`godMode` has:

* `data: T`
  Single big data object as previously interacted with through `get` and `set`.
* `path<X = T>(o?: X): X`
  Helper function to create a path from a type. `on`, `globalOn` and `trigger` accept this.
* `pathOf<X = T>(o: X, cb: (o: X) => any): string`
  Helper function to return path as a string. This is required for `dd-model`.
* `init(parent: HTMLElement, child?: HTMLElement)`
  For initialization.
* `globalOn <T = any>(flags: string, path: any, listener: ListenerCallbackWithType<T> ): string`
  Same as `on`, but flag and path is split up to support `path` (from above). Note that object in callback is also a
  proxy, supporting change.
* `trigger(path: any, value?: any)`
  Same as `trigger`, but flag and path is split up to support `path` (from above).
* `on(path: any): Pathifier`
  Same as `on`, but flag and path is split up to support `path` (from above). Note that object in callback is also a
  proxy, supporting change.

#### Example

```tsx
import {godMode} from '@eirikb/domdom';

interface User {
    name: string;
    edit: boolean;
}

interface Data {
    users: User[]
}

const {React, init, data, on, path, pathOf} = godMode<Data>();

data.users = ['eirik', 'steffen', 'frank'].map(name => ({name, edit: false}));

init(document.body, <div>
    <button onclick={() => data.users.push({name: 'eh', edit: false})}>Add</button>

    <ul>
        {on(path().users.$).map<User>(user => {
            return <li>
                <button onclick={() => user.edit = !user.edit}>Edit?</button>
                {on(path(user).name)}
                {on(path(user).edit).map(edit => edit ?
                    <input type="text" dd-model={pathOf(user, u => u.name)}/> : null)}
            </li>;
        })}
    </ul>
</div>);
```

Note: When changing arrays (replace, `pop`, `splice`, etc.) `godMode` will first clear the array. This is a workaround to
make it easier to work with arrays.
