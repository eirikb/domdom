import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import { React, init, don } from '../src/domdom';
import { Domponent } from '../src/types';

browserEnv();

let element: HTMLElement;

function createElement() {
  try {
    document.body.removeChild(element);
  } catch (e) {}
  element = document.createElement('div');
  document.body.appendChild(element);
}

async function html() {
  // Force update of Observables
  await Promise.resolve();
  return element.innerHTML;
}

test.beforeEach(() => {
  createElement();
});

test('Component', async t => {
  const Test = () => {
    return <div>{don('test')}</div>;
  };

  const data = init(element, <Test />);
  data.set('test', 'Hello, world!');
  t.is(await html(), '<div>Hello, world!</div>');
});

test('Component on don', async t => {
  const Test = () => {
    return <div>{don('test')}</div>;
  };

  const data = init(
    element,
    <div>
      {don('test', () => (
        <Test />
      ))}
    </div>
  );
  data.set('test', 'Hello, world!');
  t.is(await html(), '<div><div>Hello, world!</div></div>');
});

test('Array of results from don', async t => {
  const data = init(element, <div>{don('test', () => ['yes', 'no'])}</div>);
  data.set('test', 'yes');
  t.is(await html(), '<div>yesno</div>');
});

test('Array of results from don with component', async t => {
  function Yes() {
    return <div>Yes!</div>;
  }
  const data = init(element, <div>{don('test', () => ['no', <Yes />])}</div>);
  data.set('test', 'yes');
  t.is(await html(), '<div>no<div>Yes!</div></div>');
  t.pass();
});

test('Double on', async t => {
  const div = (
    <div>
      {don('test', test => (
        <div>
          {test}
          {don('testing', test => (
            <span>eh {test}</span>
          ))}
        </div>
      ))}
    </div>
  );
  const data = init(element, div);
  t.is(await html(), '<div></div>');

  data.set('test', 'hello');
  t.is(await html(), '<div><div>hello</div></div>');

  data.set('testing', 'world');
  t.is(await html(), '<div><div>hello<span>eh world</span></div></div>');

  data.unset('test');
  t.is(await html(), '<div></div>');
  data.set('test', 'hello');
  t.is(await html(), '<div><div>hello<span>eh world</span></div></div>');
});

test('on without callback', async t => {
  const div = <div>{don('test')}</div>;
  const data = init(element, div);

  data.set('test', 'hello');
  t.is(await html(), '<div>hello</div>');

  data.set('test', 'world');
  t.is(await html(), '<div>world</div>');

  data.unset('test');
  t.is(await html(), '<div></div>');
});

test('Multiple paths', async t => {
  const div = (
    <div>
      {don('players.$id', player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  const data = init(element, div);
  t.is(await html(), '<div></div>');

  data.set('players.aone', { name: 'Mr. one' });
  t.is(await html(), '<div><p>Mr. one</p></div>');

  data.set('players.btwo', { name: 'Mr. two' });
  t.is(await html(), '<div><p>Mr. one</p><p>Mr. two</p></div>');

  data.set('players.aone', { name: 'Hello' });
  t.is(await html(), '<div><p>Mr. two</p><p>Hello</p></div>');

  data.unset('players.aone');
  t.is(await html(), '<div><p>Mr. two</p></div>');
});

test('Multiple paths map', async t => {
  const div = (
    <div>
      {don('players.*').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  const data = init(element, div);
  t.is(await html(), '<div></div>');

  data.set('players.aone', { name: 'Mr. one' });
  t.is(await html(), '<div><p>Mr. one</p></div>');

  data.set('players.btwo', { name: 'Mr. two' });
  t.is(await html(), '<div><p>Mr. one</p><p>Mr. two</p></div>');

  data.set('players.aone', { name: 'Hello' });
  t.is(await html(), '<div><p>Hello</p><p>Mr. two</p></div>');

  data.unset('players.aone');
  t.is(await html(), '<div><p>Mr. two</p></div>');
});

test('on Sort - default sort by key', async t => {
  const div = (
    <div>
      {don('players.*').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  const data = init(element, div);
  data.set('players.aone', { name: '1' });
  data.set('players.btwo', { name: '2' });
  data.set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('on Sort - sort method', async t => {
  const div = (
    <div>
      {don('players.*')
        .map(player => <p>{player.name}</p>)
        .sort((a, b) => b.name.localeCompare(a.name))}
    </div>
  );
  const data = init(element, div);
  data.set('players.aone', { name: '1' });
  data.set('players.btwo', { name: '2' });
  data.set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');
});

test('on Sort - sort method2', async t => {
  const div = (
    <div>
      {don('players.*')
        .map(player => <p>{player.name}</p>)
        .sort((a, b) => a.name.localeCompare(b.name))}
    </div>
  );
  const data = init(element, div);
  data.set('players.aone', { name: '1' });
  data.set('players.btwo', { name: '2' });
  data.set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('Multiple on-siblings', async t => {
  const div = (
    <div>
      {don('b', test => (
        <div>{test}</div>
      ))}
      {don('a', ing => (
        <div>{ing}</div>
      ))}
    </div>
  );
  const data = init(element, div);
  data.set('a', 'World');
  data.set('b', 'Hello');
  t.is(await html(), '<div><div>Hello</div><div>World</div></div>');
});

test('on Sort - keep order', async t => {
  const div = (
    <div>
      {don('players.*').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  const data = init(element, div);
  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');

  data.unset('players.1');
  t.is(await html(), '<div><p>2</p><p>3</p></div>');

  data.set('players.1', { name: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('on Sort - custom order', async t => {
  const div = (
    <div>
      {don('players.*')
        .map(player => <p>{player.name}</p>)
        .sort((a, b) => b.name.localeCompare(a.name))}
    </div>
  );
  const data = init(element, div);
  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  data.unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  data.set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('on Sort - remove $first - with sort', async t => {
  const div = (
    <div>
      {don('players.*')
        .map(player => <p>{player.name}</p>)
        .sort((_, __, aPath, bPath) => aPath.localeCompare(bPath))}
    </div>
  );
  const data = init(element, div);
  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');

  data.unset('players.1');
  t.is(await html(), '<div><p>2</p><p>3</p></div>');

  data.set('players.1', { name: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('Child listener', async t => {
  const div = (
    <main>
      {don('players.$id', () => (
        <article>{don('>.name', name => name)}</article>
      ))}
    </main>
  );
  const data = init(element, div);
  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  t.is(
    await html(),
    '<main><article>1</article><article>2</article><article>3</article></main>'
  );
});

test('Simple when', async t => {
  const Test = () => <div>It is {don('test', t => t)}</div>;

  const div = (
    <div>
      {don('test', t => {
        switch (t) {
          case 'yes':
            return <Test />;
          default:
            return `t is ${t}`;
        }
      })}
    </div>
  );
  const data = init(element, div);
  data.set('test', 'no');
  t.is(await html(), '<div>t is no</div>');
  data.set('test', 'yes');
  t.is(await html(), '<div><div>It is yes</div></div>');
});

test('Quirk on + when', async t => {
  const div = (
    <div>
      {don('test', t => t)}

      {don('test', t => {
        switch (t) {
          case 'yes':
            return 'Yes';
          default:
            return 'No';
        }
      })}
    </div>
  );
  const data = init(element, div);
  data.set('test', 'yes');
  t.is(await html(), '<div>yesYes</div>');
  data.set('test', 'no');
  t.is(await html(), '<div>noNo</div>');
  data.set('test', 'yes');
  t.is(await html(), '<div>yesYes</div>');
  data.set('test', 'no');
  t.is(await html(), '<div>noNo</div>');
});

test('Simple or', async t => {
  const div = <div>{don('test', t => <div>{t}</div>).or(<div>Nope</div>)}</div>;
  const data = init(element, div);
  t.is(await html(), '<div><div>Nope</div></div>');
  data.set('test', 'ing');
  t.is(await html(), '<div><div>ing</div></div>');
  data.set('test', '');
  t.is(await html(), '<div><div></div></div>');
  data.unset('test');
  t.is(await html(), '<div><div>Nope</div></div>');
});

test('on empty res', async t => {
  const div = <div>{don('test')}</div>;
  const data = init(element, div);
  data.set('test', 'Hello');
  t.is(await html(), '<div>Hello</div>');
  data.set('test', '');
  t.is(await html(), '<div></div>');
});

test('Multiple child paths', async t => {
  const div = (
    <div>
      {don('a', () => (
        <div>
          {don('>.text')}
          test
          {don('>.text')}
        </div>
      ))}
    </div>
  );
  const data = init(element, div);
  data.set('a', { text: 'ok' });
  t.is(await html(), '<div><div>oktestok</div></div>');
});

test('Have some path with flags', async t => {
  const div = () => {
    const e = <div />;
    e.on('!+* wat', wat => (e.innerHTML = wat));
    return e;
  };
  const data = init(element, div());
  data.set('wat', 'ok');
  t.is(await html(), '<div>ok</div>');
});

test('Listeners are cleared', async t => {
  const data = init(element);

  let i = 0;

  function Child() {
    const e = <div />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', true);
  const div = (
    <div>
      {don('show', () => (
        <Child />
      ))}
    </div>
  );
  element.appendChild(div);
  await html();
  data.set('test', 'b');
  t.is(i, 1);

  data.unset('show');
  await html();
  data.set('test', 'c');
  t.is(i, 1);
});

test('Listeners are not overcleared', async t => {
  const data = init(element);
  let i = 0;

  function Child() {
    const e = <div />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', 'yes');
  const div = (
    <div>
      {don('show', () => (
        <Child />
      ))}
    </div>
  );
  element.appendChild(div);
  await html();
  data.set('test', 'b');
  t.is(1, i);

  data.set('show', 'yesyes');
  await html();
  data.set('test', 'c');
  t.is(2, i);

  data.set('show', 'yesyesyes');
  await html();
  data.set('test', 'd');
  t.is(3, i);
});

test('Listeners are support change of parent', async t => {
  const data = init(element);

  let i = 0;

  function Child() {
    const e = <p />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', 'yes');
  const div = (
    <div>
      {don('show', () => (
        <Child />
      ))}
    </div>
  );
  element.appendChild(div);

  data.set('show', 'yesyes');
  await html();
  data.set('test', 'c');
  t.is(1, i);

  data.unset('show');
  await html();
  data.set('test', 'd');
  t.is(1, i);
});

test('Listeners in when', async t => {
  const data = init(element);
  let i = 0;

  function Child() {
    const e = <div />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', true);
  const div = <div>{don('show', show => (show ? <Child /> : null))}</div>;
  element.appendChild(div);
  await html();
  data.set('test', 'b');
  t.is(1, i);

  data.set('show', false);
  await html();
  data.set('test', 'c');
  t.is(1, i);
});

test('Listener in when 2', async t => {
  const data = init(element);
  let i = 0;

  function Child() {
    const e = <div />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', true);
  const div = <div>{don('show', show => (show ? <Child /> : null))}</div>;
  element.appendChild(div);
  await html();
  data.set('test', 'b');
  t.is(1, i);

  data.set('show', false);
  await html();
  data.set('test', 'c');
  t.is(1, i);

  data.set('show', true);
  await html();
  data.set('test', 'd');
  t.is(2, i);
});

test('Mounted', async t => {
  t.plan(1);

  const Hello: Domponent = ({ mounted }) => {
    mounted!(() => t.pass());
    return <div />;
  };

  const div = (
    <div>
      <div>
        <Hello />
      </div>
    </div>
  );
  init(element, div);
});

test('Mounted on/off', async t => {
  t.plan(2);

  const Hello: Domponent = ({ mounted }) => {
    mounted!(() => t.pass());
    return <div />;
  };

  const div = (
    <div>
      {don('test', () => (
        <Hello />
      ))}
    </div>
  );
  const data = init(element, div);

  data.set('test', true);
  await html();
  data.unset('test');
  await html();
  data.set('test', true);
});

test('When with initial false value', async t => {
  const div = (
    <div>
      {don('test', t => {
        switch (t) {
          case false:
            return <div>Hello</div>;
          default:
            return <div>No!</div>;
        }
      })}
    </div>
  );
  const data = init(element, div);
  data.set('test', false);
  t.is(await html(), '<div><div>Hello</div></div>');
});

test('Do not remove listener on same level', async t => {
  function Test() {
    return <p>test</p>;
  }

  const div = (
    <div>
      {don('test', () => (
        <Test />
      ))}
      {don('hello')}
    </div>
  );
  const data = init(element, div);
  data.set('test', true);
  data.set('hello', 'world');
  t.is(await html(), '<div><p>test</p>world</div>');
  data.set('test', false);
  data.unset('test');
  data.set('hello', 'there');
  t.is(await html(), '<div>there</div>');
});

test('Whole objects should be populated', async t => {
  const div = (
    <div>
      {don('hello.world', world => (
        <div>{world.test}</div>
      ))}
    </div>
  );
  const data = init(element, div);

  data.set('hello', {
    world: {
      test: ':)',
    },
  });

  t.is(await html(), '<div><div>:)</div></div>');
});

test('Update array', async t => {
  const div = (
    <div>
      {don('path', path => (
        <div>{JSON.stringify(path)}</div>
      ))}
    </div>
  );
  const data = init(element, div);

  data.set('path', ['hello', 'world']);
  t.is(await html(), '<div><div>{"0":"hello","1":"world"}</div></div>');

  data.set('path', ['hello']);
  t.is(await html(), '<div><div>{"0":"hello"}</div></div>');
});

test('Update array without element', async t => {
  const view = <div>{don('x')}</div>;
  const data = init(element, view);

  data.set('x', ['hello', 'world']);
  t.is(await html(), '<div>{"0":"hello","1":"world"}</div>');

  data.set('x', ['hello']);
  t.is(await html(), '<div>{"0":"hello"}</div>');
});

test('Containment', async t => {
  const Button: Domponent = ({ children }) => <button>{children}</button>;

  init(element, <Button>Test</Button>);
  t.is(await html(), '<button>Test</button>');

  createElement();
  init(
    element,
    <Button>
      <span>Test</span>
    </Button>
  );
  t.is(await html(), '<button><span>Test</span></button>');

  createElement();
  init(
    element,
    <Button>
      <span>Test</span>
      <i>in</i>g
    </Button>
  );
  t.is(await html(), '<button><span>Test</span><i>in</i>g</button>');
});

test('Rendering types', async t => {
  init(
    element,
    <div>
      {'a'}
      {1}
      {3.6}
      {{ hello: 'world' }}
      {undefined}
      {null}
      {true}
      {false}
    </div>
  );
  t.is(await html(), '<div>a13.6{"hello":"world"}truefalse</div>');
});

test('Remove or on on', async t => {
  const view = <div>{don('test.$id', t => t.name).or('Loading...')}</div>;
  const data = init(element, view);
  t.is(await html(), '<div>Loading...</div>');
  data.set('test', { 0: { name: 'hello' } });
  t.is(await html(), '<div>hello</div>');
});

test('on attributes', async t => {
  const view = (
    <div>
      <button disabled={don('disable', res => res)} />
    </div>
  );
  const data = init(element, view);

  t.is(await html(), '<div><button></button></div>');
  data.set('disable', true);
  t.is(await html(), '<div><button disabled=""></button></div>');
});

test('on on attributes', async t => {
  const view = (
    <div>
      <button disabled={don('canClick', res => !res).or(true)} />
      <button disabled={don('canNotClick').or(true)} />
    </div>
  );
  const data = init(element, view);

  t.is(
    await html(),
    '<div><button disabled=""></button><button disabled=""></button></div>'
  );

  data.set('canClick', true);
  data.set('canNotClick', false);
  t.is(await html(), '<div><button></button><button></button></div>');

  data.set('canClick', false);
  data.set('canNotClick', true);
  t.is(
    await html(),
    '<div><button disabled=""></button><button disabled=""></button></div>'
  );
});

test('on on attributes or', async t => {
  const view = (
    <div>
      <button disabled={don('canNotClick').or(true)} />
    </div>
  );
  const data = init(element, view);

  t.is(await html(), '<div><button disabled=""></button></div>');

  data.set('canNotClick', false);
  t.is(await html(), '<div><button></button></div>');

  data.unset('canNotClick');
  t.is(await html(), '<div><button disabled=""></button></div>');
});

test('On on object attributes', async t => {
  const view = (
    <div>
      <p style={don('style')}>Test</p>
    </div>
  );
  const data = init(element, view);

  data.set('style', { color: 'red' });
  t.is(await html(), '<div><p style="color: red;">Test</p></div>');
});

test('Filter array', async t => {
  const view = (
    <div>
      {don('users')
        .map(user => <span>{user.name}</span>)
        .filter(user => user.name !== 'One!')}
    </div>
  );
  const data = init(element, view);

  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filter on update filter', async t => {
  const view = (
    <div>
      {don('users')
        .map(user => <span>{user.name}</span>)
        .filter(user => user.name !== 'One!')}
    </div>
  );
  const data = init(element, view);

  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update filter', async t => {
  const view = (
    <div>
      {don('users')
        .map(user => <span>{user.name}</span>)
        .filterOn('test', (_, user) => user.name !== 'One!')}
    </div>
  );
  const data = init(element, view);

  data.set('test', { search: 'it' });
  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update filter refresh', async t => {
  const view = (
    <div>
      {don('users')
        .map(user => <span>{user.name}</span>)
        .filterOn('test', (_, user) => user.name !== 'One!')}
    </div>
  );
  const data = init(element, view);

  data.set('test', { search: 'it' });
  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update after data is set', async t => {
  const view = (
    <div>
      {don('users')
        .map(user => <b>{user.name}</b>)
        .filterOn('test', (filter, user) =>
          new RegExp(filter, 'i').test(user.name)
        )}
    </div>
  );
  const data = init(element, view);

  data.set('test', '');
  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><b>One!</b><b>Two!</b></div>');
  data.set('test', 'two');
  t.is(await html(), '<div><b>Two!</b></div>');
});

test('on sortOn - custom order', async t => {
  const div = (
    <div>
      {don('players.*')
        .map(player => <p>{player.name}</p>)
        .sortOn('test', (_, a, b) => b.name.localeCompare(a.name))}
    </div>
  );
  const data = init(element, div);
  data.set('test', 'yes');
  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  data.unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  data.set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('on sortOn - custom order update', async t => {
  const div = (
    <div>
      {don('players.*')
        .map(player => <p>{player.name}</p>)
        .sortOn('test', (_, a, b) => b.name.localeCompare(a.name))}
    </div>
  );
  const data = init(element, div);
  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  data.set('test', 'yes');
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  data.unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  data.set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('onFilter and onSort', async t => {
  const div = (
    <div>
      {don('players.*')
        .map(player => <p>{player.name}</p>)
        .sortOn('filter.by', (val, a, b) => a[val].localeCompare(b[val]))}
    </div>
  );
  const data = init(element, div);
  data.set('filter.by', 'name');
  data.set('players.1', { name: '1', age: '3' });
  data.set('players.2', { name: '2', age: '2' });
  data.set('players.3', { name: '3', age: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
  data.set('filter.by', 'age');
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');
});

test('Function context', async t => {
  function App() {
    return <div>:)</div>;
  }

  const div = (
    <div>
      <App />
    </div>
  );
  init(element, div);
  t.is(await html(), '<div><div>:)</div></div>');
});

test('filterOn and back', async t => {
  const view = (
    <div>
      {don('users')
        .map(user => <b>{user.name}</b>)
        .filterOn('test', (filter, user) =>
          new RegExp(filter, 'i').test(user.name)
        )}
      <p>Because</p>
    </div>
  );
  const data = init(element, view);
  data.set('test', '');
  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><b>One!</b><b>Two!</b><p>Because</p></div>');
  data.set('test', 'two');
  t.is(await html(), '<div><b>Two!</b><p>Because</p></div>');
  data.set('test', '');
  t.is(await html(), '<div><b>One!</b><b>Two!</b><p>Because</p></div>');
});

test('When + change', async t => {
  const view = (
    <div>
      {don('yes', t => {
        switch (t) {
          case true:
            return <p>{don('ok')}</p>;
        }
      })}
    </div>
  );
  const data = init(element, view);
  data.set('yes', true);
  data.set('yes', false);
  data.set('yes', true);
  data.set('ok', 'OK!');
  t.is(await html(), '<div><p>OK!</p></div>');
});

test('When + change 2', async t => {
  const view = (
    <div>
      {don('yes', t => {
        switch (t) {
          case true:
            return <p>{don('ok')}</p>;
        }
      })}
    </div>
  );
  const data = init(element, view);
  data.set('yes', true);
  data.set('yes', false);
  data.set('ok', 'OK!');
  data.set('yes', true);
  t.is(await html(), '<div><p>OK!</p></div>');
});

test('When + filterOn', async t => {
  const view = (
    <div>
      {don('yes', t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users')
                  .map(user => <b>{user.name}</b>)
                  .filterOn('test', (filter, user) =>
                    new RegExp(filter, 'i').test(user.name)
                  )}
                <p>Because</p>
              </div>
            );
        }
      })}
    </div>
  );
  const data = init(element, view);
  data.set('test', 'two');
  data.set('yes', true);
  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><div><b>Two!</b><p>Because</p></div></div>');
  data.set('yes', false);
  t.is(await html(), '<div></div>');
  data.set('yes', true);
  data.set('test', '');
  t.is(
    await html(),
    '<div><div><b>One!</b><b>Two!</b><p>Because</p></div></div>'
  );
});

test('Re-add', async t => {
  const view = (
    <div>
      {don('yes', t => (
        <p>
          {t} {don('no')}
        </p>
      ))}
    </div>
  );
  const data = init(element, view);
  data.set('yes', 'Yes!');
  data.set('no', 'No!');
  t.is(await html(), '<div><p>Yes! No!</p></div>');
  data.unset('yes');
  data.set('no', 'Well!');
  data.set('yes', 'OK!');
  t.is(await html(), '<div><p>OK! Well!</p></div>');
});

test('Something something filter and add', async t => {
  const view = (
    <div>
      {don('users')
        .map(u => (
          <p>
            {u} {don('yes')}
          </p>
        ))
        .filterOn('filter', f => f)}
    </div>
  );
  const data = init(element, view);
  data.set('filter', true);
  data.set('yes', 'y');
  data.set('users', {
    one: 'o',
    two: 't',
  });
  t.is(await html(), '<div><p>o y</p><p>t y</p></div>');
  data.set('filter', false);
  t.is(await html(), '<div></div>');
  data.set('yes', 'n');
  data.set('filter', true);
  t.is(await html(), '<div><p>o n</p><p>t n</p></div>');
});

test('Simplest', async t => {
  const view = (
    <div>
      {don('yes', () => (
        <p>{don('no')}</p>
      ))}
    </div>
  );
  const data = init(element, view);

  data.set('yes', true);
  data.set('no', 'n');
  t.is(await html(), '<div><p>n</p></div>');
  data.set('no', 'n');
});

test('filterOn mounted destroy mounted', async t => {
  const view = (
    <div>
      {don('yes', t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users')
                  .map(u => u.name)
                  .filterOn('filter', (f, u) => f === u.name)}
              </div>
            );
        }
      })}
    </div>
  );
  const data = init(element, view);

  data.set('yes', true);
  data.set('filter', 'one');
  data.set('users.1', { name: 'one', test: 'yes' });
  data.set('users.2', { name: 'two' });

  t.is(await html(), '<div><div>one</div></div>');

  data.set('yes', false);
  t.is(await html(), '<div></div>');

  data.set('yes', true);
  t.is(await html(), '<div><div>one</div></div>');
});

test('When + filterOn const element', async t => {
  const view = (
    <div>
      {don('show', t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users')
                  .map(task => <p>{task.name}</p>)
                  .filterOn('filter', (filter, row) => row.name === filter)}
              </div>
            );
        }
      })}
    </div>
  );

  const data = init(element, view);

  data.set('users', { 1: { name: 'a' }, 2: { name: 'b' } });
  data.set('show', true);
  data.set('filter', 'a');
  data.set('show', false);
  data.set('show', true);
  t.deepEqual(await html(), '<div><div><p>a</p></div></div>');
});

test('When + filterOn const text', async t => {
  const view = (
    <div>
      {don('show', t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users')
                  .map(task => task.name)
                  .filterOn('filter', (filter, row) => row.name === filter)}
              </div>
            );
        }
      })}
    </div>
  );
  const data = init(element, view);
  data.set('users', { 1: { name: 'a' }, 2: { name: 'b' } });
  data.set('show', true);
  data.set('filter', 'a');
  data.set('show', false);
  data.set('show', true);
  t.deepEqual(await html(), '<div><div>a</div></div>');
});

test('On child attribute listener', async t => {
  const Yes = () => {
    return <a href={don!('>.link')}>test</a>;
  };

  const view = (
    <div>
      {don('yes', ok => (
        <div>
          {ok.text} <Yes />
        </div>
      ))}
    </div>
  );
  const data = init(element, view);
  data.set('yes', {
    link: 'https://nrk.no',
    text: 'Some link:',
  });
  t.is(
    await html(),
    '<div><div>Some link: <a href="https://nrk.no">test</a></div></div>'
  );
});

test('Same listener twice no problem', async t => {
  const view = (
    <div>
      {don('test', t1 => (
        <div>
          {t1} and {don('test')}
        </div>
      ))}
    </div>
  );
  const data = init(element, view);
  data.set('test', 'yes');
  t.is(await html(), '<div><div>yes and yes</div></div>');
});

test('Same listener twice no problem on when', async t => {
  const Yes = () => {
    return <div>{don('test')}</div>;
  };

  const view = (
    <div>
      {don('test', () => (
        <Yes />
      ))}
    </div>
  );
  const data = init(element, view);
  data.set('test', 'OK!');
  t.is(await html(), '<div><div>OK!</div></div>');
});

test('Function in on', async t => {
  const Yes = () => {
    return (
      <div>
        {don!('yes', () => (
          <p>A</p>
        ))}
        {don!('yes', () => (
          <p>B</p>
        ))}
        {don!('yes', () => (
          <p>C</p>
        ))}
      </div>
    );
  };

  const data = init(element);
  data.set('yes', 'ok');
  const view = (
    <div>
      {don('yes', () => (
        <Yes />
      ))}
    </div>
  );
  element.append(view);
  t.is(await html(), '<div><div><p>A</p><p>B</p><p>C</p></div></div>');
  t.pass();
});

test('When and on no duplicated', async t => {
  const Yes = () => {
    return (
      <div>
        {don!('myse.type', () => (
          <p>A</p>
        ))}
        {don!('myse.type', () => (
          <p>B</p>
        ))}
        {don!('myse.type', () => (
          <p>C</p>
        ))}
      </div>
    );
  };

  const view = (
    <div>
      {don('route', route => {
        switch (route) {
          case 'ready':
            return <Yes />;
        }
      })}
    </div>
  );
  const data = init(element, view);
  data.set('route', 'login1');
  data.set('myse', {
    type: 'proppgave',
  });
  data.set('route', 'ready');
  t.is(await html(), '<div><div><p>A</p><p>B</p><p>C</p></div></div>');
});

test('when + or', async t => {
  const view = (
    <div>
      {don('test', t => {
        switch (t) {
          case false:
            return '+';
          default:
            return '-';
        }
      }).or('+')}
    </div>
  );
  const data = init(element, view);
  t.is(await html(), '<div>+</div>');
  data.set('test', true);
  t.is(await html(), '<div>-</div>');
  data.set('test', false);
  t.is(await html(), '<div>+</div>');
});

test('When + pathifier', async t => {
  const view = (
    <div>
      {don('test', t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('players').map(p => (
                  <p>{p}</p>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
  const data = init(element, view);
  data.set('test', true);
  data.set('players', ['a']);
  data.set('test', false);
  data.set('test', true);
  t.pass();
});

test('on + pathifier', async t => {
  const view = (
    <div>
      {don('test', test =>
        test ? (
          <div>
            {don('players').map(p => (
              <p>{p}</p>
            ))}
          </div>
        ) : (
          'no!'
        )
      )}
    </div>
  );
  const data = init(element, view);
  data.set('test', true);
  data.set('players', ['a']);
  data.set('test', false);
  data.set('test', true);
  t.pass();
});

test('on + on', async t => {
  const view = (
    <div>
      {don('test', test =>
        test ? (
          <div>
            {don('players.$id', p => (
              <p>{p}</p>
            ))}
          </div>
        ) : (
          'no!'
        )
      )}
    </div>
  );
  const data = init(element, view);
  data.set('test', true);
  data.set('players', ['a']);
  data.set('test', false);
  data.set('test', true);
  t.pass();
});

test('dd-model select before options are set', async t => {
  const view = (
    <div>
      <select dd-model="yes">
        {don('test').map(t => (
          <option value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
  const data = init(element, view);
  data.set('yes', 'hello');
  data.set('test', ['', 'hello', 'world']);
  await html();
  const select = document.querySelector('select');
  return Promise.resolve().then(() => {
    t.is(select!.value, 'hello');
  });
});

test('Convenience', async t => {
  const data = init(element, <div>Hello {don('test')}</div>);
  data.set('test', 'world!');
  t.pass();
});

test('Convenience view before domdom', async t => {
  const view = <div>Hello {don('test')}</div>;
  const data = init(element, view);
  data.set('test', 'world!');
  t.pass();
});

test('Flags in components are work and cleared', async t => {
  let counter = 0;

  const Hello = () => {
    const e = <div>Hello!</div>;
    e.on('!+* tast', test => {
      counter++;
      e.textContent = test;
    });
    return e;
  };

  const view = (
    <div>
      {don('test', test => (
        <div>
          Test is {test}. <Hello />
        </div>
      ))}
    </div>
  );
  const data = init(element, view);

  t.is(await html(), '<div></div>');
  data.set('test', 'world!');
  t.is(await html(), '<div><div>Test is world!. <div>Hello!</div></div></div>');
  t.is(counter, 0);

  data.set('tast', 'ing');
  t.is(await html(), '<div><div>Test is world!. <div>ing</div></div></div>');
  t.is(counter, 1);

  data.unset('test');
  t.is(await html(), '<div></div>');
  t.is(counter, 1);

  data.set('tast', 'uhm');
  t.is(await html(), '<div></div>');
  t.is(counter, 1);

  data.set('test', 'yo');
  t.is(await html(), '<div><div>Test is yo. <div>uhm</div></div></div>');
  t.is(counter, 2);
});

test('Element with event but not added via domdom', async t => {
  const el = <button onClick={t.pass}>Click me!</button>;
  element.appendChild(el);
  el.click();
});

test('Hodor as a child', async t => {
  const Parent: Domponent = ({ children }) => {
    return <div>{children}</div>;
  };

  const data = init(
    element,
    <div>
      <Parent>{don('test')}</Parent>
    </div>
  );
  data.set('test', 'OK!');
  t.is(await html(), '<div><div>OK!</div></div>');
  t.pass();
});

test('Re-usable domdom', async t => {
  const data = init(element);

  const Hello = () => {
    return <div>Hello {don!('test')}</div>;
  };

  data.set('test', 'World!');
  element.appendChild(
    <main>
      <Hello />
    </main>
  );
  t.is(await html(), '<main><div>Hello World!</div></main>');
});

test('Element with hodor but not added via domdom', async t => {
  const data = init(
    element,
    (() => {
      const a = <main />;
      const c = <span>{don('test')}</span>;
      setTimeout(() => {
        const b = document.createElement('div');
        a.appendChild(b);
        setTimeout(() => {
          b.appendChild(c);
        }, 50);
      }, 50);

      return a;
    })()
  );
  data.set('test', 'Hello!');
  await new Promise(r => {
    setTimeout(async () => {
      t.is(await html(), '<main><div><span>Hello!</span></div></main>');
      r();
    }, 150);
  });
});

test('on with properties', async t => {
  const div = (
    <div>
      {don('users.$id', (user, { $id }) => {
        return (
          <div>
            {$id}: {user.name}
          </div>
        );
      })}
    </div>
  );
  const data = init(element, div);

  data.set('users', {
    a: { name: 'A!' },
    b: { name: 'B!' },
  });
  t.is(await html(), '<div><div>a: A!</div><div>b: B!</div></div>');
});

test('properties without value should not crash', async t => {
  init(element, <div style={undefined} />);
  t.is(await html(), '<div style=""></div>');
});

test('path should not be part of data', async t => {
  t.plan(3);
  const data = init(element, <div>{don('test')}</div>);
  data.on('!+* test', val => {
    t.deepEqual(val, { hello: 'world' });
  });
  data.set('test', {
    hello: 'world',
  });
  data.on('!+* test', val => {
    t.deepEqual(val, { hello: 'world' });
  });
  t.is('<div>{"hello":"world"}</div>', await html());
});

test('dd-model', async t => {
  const input = <input type="text" dd-model="test" />;
  const data = init(element, <div>{input}</div>);
  await html();
  const event = new Event('input');
  input.value = 'Yes!';
  input.dispatchEvent(event);
  t.is(data.get('test'), 'Yes!');
});
