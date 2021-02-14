import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import { Domdom } from '../src/domdom';
import { Data } from '@eirikb/data';
import { Opts } from '../src';

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

let { init, React, get, set, unset, don, trigger, on } = new Domdom(new Data());

test.beforeEach(() => {
  createElement();
  const d = new Domdom(new Data());
  init = d.init;
  React = d.React;
  set = d.set;
  unset = d.unset;
  get = d.get;
  don = d.don;
  trigger = d.trigger;
  on = d.on;
});

test('Component', async t => {
  const Test = () => {
    return <div>{don('test')}</div>;
  };

  init(element, <Test />);
  set('test', 'Hello, world!');
  t.is(await html(), '<div>Hello, world!</div>');
});

test('Component on', async t => {
  init(element, <div>{don('test')}</div>);
  set('test', 'Hello, world!');
  t.is(await html(), '<div>Hello, world!</div>');
});

test('Component on on', async t => {
  const Test = () => {
    return <div>{don('test')}</div>;
  };

  init(
    element,
    <div>
      {don('test').map(() => (
        <Test />
      ))}
    </div>
  );
  set('test', 'Hello, world!');
  t.is(await html(), '<div><div>Hello, world!</div></div>');
});

test('Array of results from on', async t => {
  init(element, <div>{don('test').map(() => ['yes', 'no'])}</div>);
  set('test', 'yes');
  t.is(await html(), '<div>yesno</div>');
});

test('Array of results from on with component', async t => {
  function Yes() {
    return <div>Yes!</div>;
  }

  init(element, <div>{don('test').map(() => ['no', <Yes />])}</div>);
  set('test', 'yes');
  t.is(await html(), '<div>no<div>Yes!</div></div>');
  t.pass();
});

test('Double on', async t => {
  const div = (
    <div>
      {don('test').map(test => (
        <div>
          {test}
          {don('testing').map(test => (
            <span>eh {test}</span>
          ))}
        </div>
      ))}
    </div>
  );
  init(element, div);
  t.is(await html(), '<div></div>');

  set('test', 'hello');
  t.is(await html(), '<div><div>hello</div></div>');

  set('testing', 'world');
  t.is(await html(), '<div><div>hello<span>eh world</span></div></div>');

  unset('test');
  t.is(await html(), '<div></div>');
  set('test', 'hello');
  t.is(await html(), '<div><div>hello<span>eh world</span></div></div>');
});

test('on without callback', async t => {
  const div = <div>{don('test')}</div>;
  init(element, div);

  set('test', 'hello');
  t.is(await html(), '<div>hello</div>');

  set('test', 'world');
  t.is(await html(), '<div>world</div>');

  unset('test');
  t.is(await html(), '<div></div>');
});

test('Multiple paths', async t => {
  const div = (
    <div>
      {don('players.$id.*').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  init(element, div);
  t.is(await html(), '<div></div>');

  set('players.aone', { name: 'Mr. one' });
  t.is(await html(), '<div><p>Mr. one</p></div>');

  set('players.btwo', { name: 'Mr. two' });
  t.is(await html(), '<div><p>Mr. one</p><p>Mr. two</p></div>');

  set('players.aone', { name: 'Hello' });
  t.is(await html(), '<div><p>Hello</p><p>Mr. two</p></div>');

  unset('players.aone');
  t.is(await html(), '<div><p>Mr. two</p></div>');
});

test('Multiple paths map', async t => {
  const div = (
    <div>
      {don('players.$.*').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  init(element, div);
  t.is(await html(), '<div></div>');

  set('players.aone', { name: 'Mr. one' });
  t.is(await html(), '<div><p>Mr. one</p></div>');

  set('players.btwo', { name: 'Mr. two' });
  t.is(await html(), '<div><p>Mr. one</p><p>Mr. two</p></div>');

  set('players.aone', { name: 'Hello' });
  t.is(await html(), '<div><p>Hello</p><p>Mr. two</p></div>');

  unset('players.aone');
  t.is(await html(), '<div><p>Mr. two</p></div>');
});

test('on Sort - default sort by key', async t => {
  const div = (
    <div>
      {don('players.$').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  init(element, div);
  set('players.aone', { name: '1' });
  set('players.btwo', { name: '2' });
  set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('on Sort - sort method', async t => {
  const div = (
    <div>
      {don('players.$')
        .sort((a, b) => b.name.localeCompare(a.name))
        .map(player => (
          <p>{player.name}</p>
        ))}
    </div>
  );
  init(element, div);
  set('players.aone', { name: '1' });
  set('players.btwo', { name: '2' });
  set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');
});

test('on Sort - sort method2', async t => {
  const div = (
    <div>
      {don('players.$')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(player => (
          <p>{player.name}</p>
        ))}
    </div>
  );
  init(element, div);
  set('players.aone', { name: '1' });
  set('players.btwo', { name: '2' });
  set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('Multiple on-siblings', async t => {
  const div = (
    <div>
      {don('b').map(test => (
        <div>{test}</div>
      ))}
      {don('a').map(ing => (
        <div>{ing}</div>
      ))}
    </div>
  );
  init(element, div);
  set('a', 'World');
  set('b', 'Hello');
  t.is(await html(), '<div><div>Hello</div><div>World</div></div>');
});

test('on Sort - keep order', async t => {
  const div = (
    <div>
      {don('players.$')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(player => (
          <p>{player.name}</p>
        ))}
    </div>
  );
  init(element, div);
  set('players.1', { name: '1' });
  set('players.2', { name: '2' });
  set('players.3', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');

  unset('players.1');
  t.is(await html(), '<div><p>2</p><p>3</p></div>');

  set('players.1', { name: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('on Sort - custom order', async t => {
  const div = (
    <div>
      {don('players.$.*')
        .sort((a, b) => b.name.localeCompare(a.name))
        .map(player => (
          <p>{player.name}</p>
        ))}
    </div>
  );
  init(element, div);
  set('players.1', { name: '1' });
  set('players.2', { name: '2' });
  set('players.3', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('on Sort - remove $first - with sort', async t => {
  const div = (
    <div>
      {don('players.$.*')
        .map(player => <p>{player.name}</p>)
        .sort((_, __, opts) => opts.aOpts.path.localeCompare(opts.bOpts.path))}
    </div>
  );
  init(element, div);
  set('players.1', { name: '1' });
  set('players.2', { name: '2' });
  set('players.3', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');

  unset('players.1');
  t.is(await html(), '<div><p>2</p><p>3</p></div>');

  set('players.1', { name: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('Child listener', async t => {
  const div = (
    <main>
      {don('players.$id').map((_, { child }) => (
        <article>{don(child('name'))}</article>
      ))}
    </main>
  );
  init(element, div);
  set('players.1', { name: '1' });
  set('players.2', { name: '2' });
  set('players.3', { name: '3' });
  t.is(
    await html(),
    '<main><article>1</article><article>2</article><article>3</article></main>'
  );
});

test('Simple when', async t => {
  const Test = () => <div>It is {don('test')}</div>;

  const div = (
    <div>
      {don('test').map(t => {
        switch (t) {
          case 'yes':
            return <Test />;
          default:
            return `t is ${t}`;
        }
      })}
    </div>
  );
  init(element, div);
  set('test', 'no');
  t.is(await html(), '<div>t is no</div>');
  set('test', 'yes');
  t.is(await html(), '<div><div>It is yes</div></div>');
});

test('Quirk on + when', async t => {
  const div = (
    <div>
      {don('test')}

      {don('test').map(t => {
        switch (t) {
          case 'yes':
            return 'Yes';
          default:
            return 'No';
        }
      })}
    </div>
  );
  init(element, div);
  set('test', 'yes');
  t.is(await html(), '<div>yesYes</div>');
  set('test', 'no');
  t.is(await html(), '<div>noNo</div>');
  set('test', 'yes');
  t.is(await html(), '<div>yesYes</div>');
  set('test', 'no');
  t.is(await html(), '<div>noNo</div>');
});

test('unset', async t => {
  const div = (
    <div>
      {don('test').map(t => (
        <div>{t}</div>
      ))}
    </div>
  );
  init(element, div);
  t.is(await html(), '<div></div>');
  set('test', 'ing');
  t.is(await html(), '<div><div>ing</div></div>');
  set('test', '');
  t.is(await html(), '<div><div></div></div>');
  unset('test');
  t.is(await html(), '<div></div>');
});

test('Simple or', async t => {
  const div = (
    <div>
      {don('test')
        .map(t => <div>{t}</div>)
        .or(<div>Nope</div>)}
    </div>
  );
  init(element, div);
  t.is(await html(), '<div><div>Nope</div></div>');
  set('test', 'ing');
  t.is(await html(), '<div><div>ing</div></div>');
  set('test', '');
  t.is(await html(), '<div><div></div></div>');
  unset('test');
  t.is(await html(), '<div><div>Nope</div></div>');
});

test('on empty res', async t => {
  const div = <div>{don('test')}</div>;
  init(element, div);
  set('test', 'Hello');
  t.is(await html(), '<div>Hello</div>');
  set('test', '');
  t.is(await html(), '<div></div>');
});

test('Multiple child paths', async t => {
  const div = (
    <div>
      {don('a').map((_, { child }) => (
        <div>
          {don(child('text'))}
          test
          {don(child('text'))}
        </div>
      ))}
    </div>
  );
  init(element, div);
  set('a', { text: 'ok' });
  t.is(await html(), '<div><div>oktestok</div></div>');
});

test('Have some path with flags', async t => {
  const Ok = () => {
    return (
      <div>
        {don('a')}
        {don('b').map(b => {
          const e = <div></div>;
          e.innerHTML = b;
          return e;
        })}
      </div>
    );
  };
  init(element, <Ok />);
  set('a', 'A');
  set('b', 'B');
  t.is(await html(), '<div>A<div>B</div></div>');
});

test('Have some path with flags without component', async t => {
  init(
    element,
    (() => {
      return (
        <div>
          {don('a')}
          {don('b').map(b => {
            const e = <div></div>;
            e.innerHTML = b;
            return e;
          })}
        </div>
      );
    })()
  );
  set('a', 'A');
  set('b', 'B');
  t.is(await html(), '<div>A<div>B</div></div>');
});

test.skip('Listeners are cleared', async t => {
  init(element);

  let i = 0;

  function Child() {
    const e = <div />;
    // e.attach(don('* test').map(() => i++));
    return e;
  }

  set('test', 'a');
  set('show', true);
  const div = (
    <div>
      {don('show').map(() => (
        <Child />
      ))}
    </div>
  );
  element.appendChild(div);
  await html();
  set('test', 'b');
  t.is(i, 1);

  unset('show');
  await html();
  set('test', 'c');
  t.is(i, 1);
});

test.skip('Listeners are not overcleared', async t => {
  init(element);
  let i = 0;

  function Child() {
    const e = <div />;
    // e.attach(don('* test').map(() => i++));
    return e;
  }

  set('test', 'a');
  set('show', 'yes');
  const div = (
    <div>
      {don('show').map(() => (
        <Child />
      ))}
    </div>
  );
  element.appendChild(div);
  await html();
  set('test', 'b');
  t.is(1, i);

  set('show', 'yesyes');
  await html();
  set('test', 'c');
  t.is(2, i);

  set('show', 'yesyesyes');
  await html();
  set('test', 'd');
  t.is(3, i);
});

test.skip('Listeners are support change of parent', async t => {
  init(element);

  let i = 0;

  function Child() {
    const e = <p />;
    // e.attach(don('* test').map(() => i++));
    return e;
  }

  set('test', 'a');
  set('show', 'yes');
  const div = (
    <div>
      {don('show').map(() => (
        <Child />
      ))}
    </div>
  );
  element.appendChild(div);

  set('show', 'yesyes');
  await html();
  set('test', 'c');
  t.is(1, i);

  unset('show');
  await html();
  set('test', 'd');
  t.is(1, i);
});

test.skip('Listeners in when', async t => {
  init(element);
  let i = 0;

  function Child() {
    const e = <div />;
    // e.attach(don('test').map(() => i++));
    return e;
  }

  set('test', 'a');
  set('show', true);
  const div = <div>{don('show').map(show => (show ? <Child /> : null))}</div>;
  element.appendChild(div);
  await html();
  set('test', 'b');
  t.is(1, i);

  set('show', false);
  await html();
  set('test', 'c');
  t.is(1, i);
});

test.skip('Listener in when 2', async t => {
  init(element);
  let i = 0;

  function Child() {
    const e = <div />;
    // e.attach(don('test').map(() => i++));
    return e;
  }

  set('test', 'a');
  set('show', true);
  const div = <div>{don('show').map(show => (show ? <Child /> : null))}</div>;
  element.appendChild(div);
  await html();
  set('test', 'b');
  t.is(1, i);

  set('show', false);
  await html();
  set('test', 'c');
  t.is(1, i);

  set('show', true);
  await html();
  set('test', 'd');
  t.is(2, i);
});

test('Mounted', async t => {
  t.plan(1);

  const Hello = ({}, { mounted }: Opts) => {
    mounted(() => t.pass());
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

  const Hello = ({}, { mounted }: Opts) => {
    mounted(() => t.pass());
    return <div />;
  };

  const div = (
    <div>
      {don('test').map(() => (
        <Hello />
      ))}
    </div>
  );
  init(element, div);

  set('test', true);
  await html();
  unset('test');
  await html();
  set('test', true);
});

test('When with initial false value', async t => {
  const div = (
    <div>
      {don('test').map(t => {
        switch (t) {
          case false:
            return <div>Hello</div>;
          default:
            return <div>No!</div>;
        }
      })}
    </div>
  );
  init(element, div);
  set('test', false);
  t.is(await html(), '<div><div>Hello</div></div>');
});

test('Do not remove listener on same level', async t => {
  function Test() {
    return <p>test</p>;
  }

  const div = (
    <div>
      {don('test').map(() => (
        <Test />
      ))}
      {don('hello')}
    </div>
  );
  init(element, div);
  set('test', true);
  set('hello', 'world');
  t.is(await html(), '<div><p>test</p>world</div>');
  set('test', false);
  unset('test');
  set('hello', 'there');
  t.is(await html(), '<div>there</div>');
});

test('Whole objects should be populated', async t => {
  const div = (
    <div>
      {don('hello.world').map(world => (
        <div>{world.test}</div>
      ))}
    </div>
  );
  init(element, div);

  set('hello', {
    world: {
      test: ':)',
    },
  });

  t.is(await html(), '<div><div>:)</div></div>');
});

test('Update array', async t => {
  const div = (
    <div>
      {don('path.$').map(path => (
        <div>{path}</div>
      ))}
    </div>
  );
  init(element, div);

  set('path', ['hello', 'world']);
  t.is(await html(), '<div><div>hello</div><div>world</div></div>');

  set('path', ['hello']);
  t.is(await html(), '<div><div>hello</div></div>');
});

test('Update array without element', async t => {
  const view = <div>{don('x.$')}</div>;
  init(element, view);

  set('x', ['hello', 'world']);
  t.is(await html(), '<div>helloworld</div>');

  set('x', ['hello']);
  t.is(await html(), '<div>hello</div>');
});

test('Containment', async t => {
  const Button = ({}, { children }: Opts) => <button>{children}</button>;

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
  const view = (
    <div>
      {don('test.$id')
        .map(t => t.name)
        .or('Loading...')}
    </div>
  );
  init(element, view);
  t.is(await html(), '<div>Loading...</div>');
  set('test', { 0: { name: 'hello' } });
  t.is(await html(), '<div>hello</div>');
});

test('on attributes', async t => {
  const view = (
    <div>
      <button disabled={don('disable').map(res => res)} />
    </div>
  );
  init(element, view);

  t.is(await html(), '<div><button></button></div>');
  set('disable', true);
  t.is(await html(), '<div><button disabled=""></button></div>');
});

test('on on attributes', async t => {
  const view = (
    <div>
      <button
        disabled={don('canClick')
          .map(res => !res)
          .or(true)}
      />
      <button disabled={don('canNotClick').or(true)} />
    </div>
  );
  init(element, view);

  t.is(
    await html(),
    '<div><button disabled=""></button><button disabled=""></button></div>'
  );

  set('canClick', true);
  set('canNotClick', false);
  t.is(await html(), '<div><button></button><button></button></div>');

  set('canClick', false);
  set('canNotClick', true);
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
  init(element, view);

  t.is(await html(), '<div><button disabled=""></button></div>');

  set('canNotClick', false);
  t.is(await html(), '<div><button></button></div>');

  unset('canNotClick');
  t.is(await html(), '<div><button disabled=""></button></div>');
});

test('On on object attributes', async t => {
  const view = (
    <div>
      <p style={don('style')}>Test</p>
    </div>
  );
  init(element, view);

  set('style', { color: 'red' });
  t.is(await html(), '<div><p style="color: red;">Test</p></div>');
});

test('Filter array', async t => {
  const view = (
    <div>
      {don('users.$')
        .filter(user => user.name !== 'One!')
        .map(user => (
          <span>{user.name}</span>
        ))}
    </div>
  );
  init(element, view);

  set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filter on update filter', async t => {
  const view = (
    <div>
      {don('users.$')
        .filter(user => user.name !== 'One!')
        .map(user => (
          <span>{user.name}</span>
        ))}
    </div>
  );
  init(element, view);

  set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update filter', async t => {
  const view = (
    <div>
      {don('users.$')
        .filterOn('test', user => user.name !== 'One!')
        .map(user => (
          <span>{user.name}</span>
        ))}
    </div>
  );
  init(element, view);

  set('test', { search: 'it' });
  set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update filter refresh', async t => {
  const view = (
    <div>
      {don('users.$')
        .filterOn('test', user => user.name !== 'One!')
        .map(user => (
          <span>{user.name}</span>
        ))}
    </div>
  );
  init(element, view);

  set('test', { search: 'it' });
  set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update after data is set', async t => {
  const view = (
    <div>
      {don('users.$')
        .filterOn('test', (user, { onValue }) =>
          new RegExp(onValue, 'i').test(user.name)
        )
        .map(user => (
          <b>{user.name}</b>
        ))}
    </div>
  );
  init(element, view);

  set('test', '');
  set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><b>One!</b><b>Two!</b></div>');
  set('test', 'two');
  t.is(await html(), '<div><b>Two!</b></div>');
});

test('on sortOn - custom order', async t => {
  const div = (
    <div>
      {don('players.$')
        .sortOn('test', (a, b) => b.name.localeCompare(a.name))
        .map(player => (
          <p>{player.name}</p>
        ))}
    </div>
  );
  init(element, div);
  set('test', 'yes');
  set('players.1', { name: '1' });
  set('players.2', { name: '2' });
  set('players.3', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('on sortOn - custom order update', async t => {
  const div = (
    <div>
      {don('players.$')
        .sortOn('test', (a, b) => b.name.localeCompare(a.name))
        .map(player => (
          <p>{player.name}</p>
        ))}
    </div>
  );
  init(element, div);
  set('players.1', { name: '1' });
  set('players.2', { name: '2' });
  set('players.3', { name: '3' });
  set('test', 'yes');
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('onFilter and onSort 2', async t => {
  const div = (
    <div>
      {don('players.$').sortOn('desc', (a, b, { onValue }) =>
        onValue ? a - b : b - a
      )}
    </div>
  );
  init(element, div);
  set('players', [1, 2, 3]);
  set('desc', true);
  t.deepEqual(await html(), '<div>123</div>');
  set('desc', false);
  t.deepEqual(await html(), '<div>321</div>');
});

test('onFilter and onSort', async t => {
  const div = (
    <div>
      {don('players.$')
        .sortOn('filter.by', (a, b, { onValue }) =>
          a[onValue].localeCompare(b[onValue])
        )
        .map(player => (
          <p>{player.name}</p>
        ))}
    </div>
  );
  init(element, div);
  set('filter.by', 'name');
  set('players.1', { name: '1', age: '3' });
  set('players.2', { name: '2', age: '2' });
  set('players.3', { name: '3', age: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
  set('filter.by', 'age');
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
      {don('users.$')
        .filterOn('test', (user, { onValue }) =>
          new RegExp(onValue, 'i').test(user.name)
        )
        .map(user => (
          <b>{user.name}</b>
        ))}
      <p>Because</p>
    </div>
  );
  init(element, view);
  set('test', '');
  set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><b>One!</b><b>Two!</b><p>Because</p></div>');
  set('test', 'two');
  t.is(await html(), '<div><b>Two!</b><p>Because</p></div>');
  set('test', '');
  t.is(await html(), '<div><b>One!</b><b>Two!</b><p>Because</p></div>');
});

test('When + change', async t => {
  const view = (
    <div>
      {don('yes').map(t => {
        switch (t) {
          case true:
            return <p>{don('ok')}</p>;
        }
      })}
    </div>
  );
  init(element, view);
  set('yes', true);
  set('yes', false);
  set('yes', true);
  set('ok', 'OK!');
  t.is(await html(), '<div><p>OK!</p></div>');
});

test('When + change 2', async t => {
  const view = (
    <div>
      {don('yes').map(t => {
        switch (t) {
          case true:
            return <p>{don('ok')}</p>;
        }
      })}
    </div>
  );
  init(element, view);
  set('yes', true);
  set('yes', false);
  set('ok', 'OK!');
  set('yes', true);
  t.is(await html(), '<div><p>OK!</p></div>');
});

test('When + filterOn 2', async t => {
  const view = (
    <div>
      {don('yes').map(t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users.$')
                  .filterOn('test', (user, { onValue }) =>
                    new RegExp(onValue, 'i').test(user.name)
                  )
                  .map(user => (
                    <b>{user.name}</b>
                  ))}
              </div>
            );
        }
      })}
    </div>
  );
  init(element, view);
  set('yes', true);
  set('test', 'two');
  set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><div><b>Two!</b></div></div>');
  set('yes', false);
  t.is(await html(), '<div></div>');
  set('yes', true);
  set('test', '');
  t.is(await html(), '<div><div><b>One!</b><b>Two!</b></div></div>');
});

test('When + filterOn', async t => {
  const view = (
    <div>
      {don('yes').map(t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users.$')
                  .filterOn('test', (user, { onValue }) =>
                    new RegExp(onValue, 'i').test(user.name)
                  )
                  .map(user => (
                    <b>{user.name}</b>
                  ))}
                <p>Because</p>
              </div>
            );
        }
      })}
    </div>
  );
  init(element, view);
  set('test', 'two');
  set('yes', true);
  set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><div><b>Two!</b><p>Because</p></div></div>');
  set('yes', false);
  t.is(await html(), '<div></div>');
  set('yes', true);
  set('test', '');
  t.is(
    await html(),
    '<div><div><b>One!</b><b>Two!</b><p>Because</p></div></div>'
  );
});

test('Re-add', async t => {
  const view = (
    <div>
      {don('yes').map(t => (
        <p>
          {t} {don('no')}
        </p>
      ))}
    </div>
  );
  init(element, view);
  set('yes', 'Yes!');
  set('no', 'No!');
  t.is(await html(), '<div><p>Yes! No!</p></div>');
  unset('yes');
  set('no', 'Well!');
  set('yes', 'OK!');
  t.is(await html(), '<div><p>OK! Well!</p></div>');
});

test('Something something filter and add', async t => {
  const view = (
    <div>
      {don('users.$')
        .filterOn('filter', (_, { onValue }) => onValue)
        .map(u => (
          <p>
            {u} {don('yes')}
          </p>
        ))}
    </div>
  );
  init(element, view);
  set('filter', true);
  set('yes', 'y');
  set('users', {
    one: 'o',
    two: 't',
  });
  t.is(await html(), '<div><p>o y</p><p>t y</p></div>');
  set('filter', false);
  t.is(await html(), '<div></div>');
  set('yes', 'n');
  set('filter', true);
  t.is(await html(), '<div><p>o n</p><p>t n</p></div>');
});

test('Simplest', async t => {
  const view = (
    <div>
      {don('yes').map(() => (
        <p>{don('no')}</p>
      ))}
    </div>
  );
  init(element, view);

  set('yes', true);
  set('no', 'n');
  t.is(await html(), '<div><p>n</p></div>');
  set('no', 'n');
});

test('filterOn mounted destroy mounted', async t => {
  const view = (
    <div>
      {don('yes').map(t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users.$')
                  .filterOn('filter', (u, { onValue }) => onValue === u.name)
                  .map(u => u.name)}
              </div>
            );
        }
      })}
    </div>
  );
  init(element, view);

  set('yes', true);
  set('filter', 'one');
  set('users.1', { name: 'one', test: 'yes' });
  set('users.2', { name: 'two' });

  t.is(await html(), '<div><div>one</div></div>');

  set('yes', false);
  t.is(await html(), '<div></div>');

  set('yes', true);
  t.is(await html(), '<div><div>one</div></div>');
});

test('When + filterOn const element', async t => {
  const view = (
    <div>
      {don('show').map(t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users.$')
                  .filterOn(
                    'filter',
                    (row, { onValue }) => row.name === onValue
                  )
                  .map(task => (
                    <p>{task.name}</p>
                  ))}
              </div>
            );
        }
      })}
    </div>
  );

  init(element, view);

  set('users', { 1: { name: 'a' }, 2: { name: 'b' } });
  set('show', true);
  set('filter', 'a');
  set('show', false);
  set('show', true);
  t.deepEqual(await html(), '<div><div><p>a</p></div></div>');
});

test('When + filterOn const text', async t => {
  const view = (
    <div>
      {don('show').map(t => {
        switch (t) {
          case true:
            return (
              <div>
                {don('users.$')
                  .filterOn(
                    'filter',
                    (row, { onValue }) => row.name === onValue
                  )
                  .map(task => task.name)}
              </div>
            );
        }
      })}
    </div>
  );
  init(element, view);
  set('users', { 1: { name: 'a' }, 2: { name: 'b' } });
  set('show', true);
  set('filter', 'a');
  set('show', false);
  set('show', true);
  t.deepEqual(await html(), '<div><div>a</div></div>');
});

test('On child attribute listener', async t => {
  const Yes = ({ subPath }) => {
    return <a href={don(subPath('link'))}>test</a>;
  };

  const view = (
    <div>
      {don('yes').map((ok, { child }) => (
        <div>
          {ok.text} <Yes subPath={child} />
        </div>
      ))}
    </div>
  );
  init(element, view);
  set('yes', {
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
      {don('test').map(t1 => (
        <div>
          {t1} and {don('test')}
        </div>
      ))}
    </div>
  );
  init(element, view);
  set('test', 'yes');
  t.is(await html(), '<div><div>yes and yes</div></div>');
});

test('Same listener twice no problem on when', async t => {
  const Yes = () => {
    return <div>{don('test')}</div>;
  };

  const view = (
    <div>
      {don('test').map(() => (
        <Yes />
      ))}
    </div>
  );
  init(element, view);
  set('test', 'OK!');
  t.is(await html(), '<div><div>OK!</div></div>');
});

test('Function in on', async t => {
  const Yes = () => {
    return (
      <div>
        {don('yes').map(() => (
          <p>A</p>
        ))}
        {don('yes').map(() => (
          <p>B</p>
        ))}
        {don('yes').map(() => (
          <p>C</p>
        ))}
      </div>
    );
  };

  init(element);
  set('yes', 'ok');
  const view = (
    <div>
      {don('yes').map(() => (
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
        {don('myse.type').map(() => (
          <p>A</p>
        ))}
        {don('myse.type').map(() => (
          <p>B</p>
        ))}
        {don('myse.type').map(() => (
          <p>C</p>
        ))}
      </div>
    );
  };

  const view = (
    <div>
      {don('route').map(route => {
        switch (route) {
          case 'ready':
            return <Yes />;
        }
      })}
    </div>
  );
  init(element, view);
  set('route', 'login1');
  set('myse', {
    type: 'proppgave',
  });
  set('route', 'ready');
  t.is(await html(), '<div><div><p>A</p><p>B</p><p>C</p></div></div>');
});

test('when + or', async t => {
  const view = (
    <div>
      {don('test')
        .map(t => {
          switch (t) {
            case false:
              return '+';
            default:
              return '-';
          }
        })
        .or('+')}
    </div>
  );
  init(element, view);
  t.is(await html(), '<div>+</div>');
  set('test', true);
  t.is(await html(), '<div>-</div>');
  set('test', false);
  t.is(await html(), '<div>+</div>');
});

test('When + pathifier', async t => {
  const view = (
    <div>
      {don('test').map(t => {
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
  init(element, view);
  set('test', true);
  set('players', ['a']);
  set('test', false);
  set('test', true);
  t.pass();
});

test('on + pathifier', async t => {
  const view = (
    <div>
      {don('test').map(test =>
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
  init(element, view);
  set('test', true);
  set('players', ['a']);
  set('test', false);
  set('test', true);
  t.pass();
});

test('on + on', async t => {
  const view = (
    <div>
      {don('test').map(test =>
        test ? (
          <div>
            {don('players.$id').map(p => (
              <p>{p}</p>
            ))}
          </div>
        ) : (
          'no!'
        )
      )}
    </div>
  );
  init(element, view);
  set('test', true);
  set('players', ['a']);
  set('test', false);
  set('test', true);
  t.pass();
});

test('dd-model select before options are set', async t => {
  const view = (
    <div>
      <select dd-model="yes">
        {don('test.$').map(t => (
          <option value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
  init(element, view);
  set('yes', 'hello');
  set('test', ['', 'hello', 'world']);
  await html();
  const select = document.querySelector('select');
  return Promise.resolve().then(() => {
    t.is(select!.value, 'hello');
  });
});

test('Convenience', async t => {
  init(element, <div>Hello {don('test')}</div>);
  set('test', 'world!');
  t.pass();
});

test('Convenience view before domdom', async t => {
  const view = <div>Hello {don('test')}</div>;
  init(element, view);
  set('test', 'world!');
  t.pass();
});

test.skip('Flags in components are work and cleared', async t => {
  let counter = 0;

  const Hello = () => {
    const e = <div>Hello!</div>;
    // e.attach(
    //   don('tast').map(test => {
    //     counter++;
    //     e.textContent = test;
    //   })
    // );
    return e;
  };

  const view = (
    <div>
      {don('test').map(test => (
        <div>
          Test is {test}. <Hello />
        </div>
      ))}
    </div>
  );
  init(element, view);

  t.is(await html(), '<div></div>');
  set('test', 'world!');
  t.is(await html(), '<div><div>Test is world!. <div>Hello!</div></div></div>');
  t.is(counter, 0);

  set('tast', 'ing');
  t.is(await html(), '<div><div>Test is world!. <div>ing</div></div></div>');
  t.is(counter, 1);

  unset('test');
  t.is(await html(), '<div></div>');
  t.is(counter, 1);

  set('tast', 'uhm');
  t.is(await html(), '<div></div>');
  t.is(counter, 1);

  set('test', 'yo');
  t.is(await html(), '<div><div>Test is yo. <div>uhm</div></div></div>');
  t.is(counter, 2);
});

test('Element with event but not added via domdom', async t => {
  const el = <button onClick={t.pass}>Click me!</button>;
  element.appendChild(el);
  el.click();
});

test('Pathifier as a child', async t => {
  const Parent = ({ ok }: { ok: string }, { children }: Opts) => {
    return (
      <div>
        {children} - {ok}
      </div>
    );
  };

  init(
    element,
    <div>
      <Parent ok="OK!">{don('test')}</Parent>
    </div>
  );
  set('test', 'OK!');
  t.is(await html(), '<div><div>OK! - OK!</div></div>');
  t.pass();
});

test('Re-usable domdom', async t => {
  init(element);

  const Hello = () => {
    return <div>Hello {don('test')}</div>;
  };

  set('test', 'World!');
  element.appendChild(
    <main>
      <Hello />
    </main>
  );
  t.is(await html(), '<main><div>Hello World!</div></main>');
});

test('Element with Pathifier but not added via domdom', async t => {
  init(
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
  set('test', 'Hello!');
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
      {don('users.$id').map((user, { $id }) => {
        return (
          <div>
            {$id}: {user.name}
          </div>
        );
      })}
    </div>
  );
  init(element, div);

  set('users', {
    a: { name: 'A!' },
    b: { name: 'B!' },
  });
  t.is(await html(), '<div><div>a: A!</div><div>b: B!</div></div>');
});

test('properties without value should not crash', async t => {
  init(element, <div style={undefined} />);
  t.is(await html(), '<div></div>');
});

test('attributes', async t => {
  t.is((<div a="yes" />).outerHTML, '<div a="yes"></div>');
  t.is((<div a="false" />).outerHTML, '<div a="false"></div>');
  t.is((<div a={true} />).outerHTML, '<div a=""></div>');
  t.is((<div a={false} />).outerHTML, '<div></div>');
  t.is((<div a={''} />).outerHTML, '<div a=""></div>');
  t.is((<div a={null} />).outerHTML, '<div a=""></div>');
  t.is((<div a={undefined} />).outerHTML, '<div></div>');
});

test('path should not be part of data', async t => {
  t.plan(3);
  init(element, <div>{don('test')}</div>);
  on('!+* test', val => {
    t.deepEqual(val, { hello: 'world' });
  });
  set('test', {
    hello: 'world',
  });
  on('!+* test', val => {
    t.deepEqual(val, { hello: 'world' });
  });
  t.is('<div>{"hello":"world"}</div>', await html());
});

test('dd-model', async t => {
  const input = <input type="text" dd-model="test" />;
  init(element, <div>{input}</div>);
  await html();
  const event = new Event('input');
  input.value = 'Yes!';
  input.dispatchEvent(event);
  t.is(get('test'), 'Yes!');
});

test('sub-path set', async t => {
  init(
    element,
    <div>
      {don('test').map((_, { child }) => (
        <button onClick={() => set(child('click'), true)} />
      ))}
    </div>
  );
  set('test', { show: true });
  await html();
  document.querySelector('button')!.dispatchEvent(new Event('click'));
  t.deepEqual(get('test'), {
    show: true,
    click: true,
  });
});

test('sub-path get', async t => {
  init(
    element,
    <div>
      {don('test').map((_, { child }) => (
        <button onClick={() => set(child('click'), !get(child('click')))} />
      ))}
    </div>
  );
  set('test', { show: true });
  await html();
  document.querySelector('button')!.dispatchEvent(new Event('click'));
  t.deepEqual(get('test'), {
    show: true,
    click: true,
  });
  document.querySelector('button')!.dispatchEvent(new Event('click'));
  t.deepEqual(get('test'), {
    show: true,
    click: false,
  });
});

test('sub-path trigger', async t => {
  init(
    element,
    <div>
      {don('test').map((_, { child }) => (
        <button onClick={() => trigger(child('click'))} />
      ))}
    </div>
  );
  on('= test.click', t.pass);
  set('test', { show: true });
  await html();
  document.querySelector('button')!.dispatchEvent(new Event('click'));
});

test('Domponent-listeners should not affect global listeners', async t => {
  on('+!* test', t.pass);

  function T() {
    return (
      <div>
        {don('test').map(v => {
          const e = <div></div>;
          e.innerHTML = v;
          return e;
        })}
      </div>
    );
  }

  init(element, <div>{don('show').map(show => (show ? <T /> : null))}</div>);
  await html();
  set('show', true);
  await html();
  set('show', false);
  await html();
  set('test', 'YES!');
});

test('global listener start by itself', async t => {
  on('+!* test', t.pass);
  set('test', 'YES!');
});

test('TS and types', async t => {
  interface Ok {
    name: string;
  }

  const ok: Ok = {
    name: 'Hello',
  };

  init(
    element,
    <div>
      {don('ok').map<Ok>(ok => {
        t.is(ok.name, 'Hello');
      })}
    </div>
  );
  set('ok', ok);
});

test('attribute class is mapped to className', async t => {
  init(element, <div class="yes" />);
  t.is(await html(), '<div class="yes"></div>');
});

test('sub-path', async t => {
  set('players.a', { name: 'A', level: 1 });
  set('players.b', { name: 'B', level: 2 });

  init(
    element,
    <div>
      {don('players.$id').map((player, { child }) => (
        <div>
          {player.name}/{don(child('level'))}
        </div>
      ))}
    </div>
  );
  t.is(await html(), '<div><div>A/1</div><div>B/2</div></div>');
  set('players.a.level', 42);
  t.is(await html(), '<div><div>A/42</div><div>B/2</div></div>');
});

test('sub-path pathifier', async t => {
  set('players.a', { name: 'A', level: 1 });
  set('players.b', { name: 'B', level: 2 });

  init(
    element,
    <div>
      {don('players.$').map((player, { child }) => (
        <div>
          {player.name}/{don(child('level'))}
        </div>
      ))}
    </div>
  );
  t.is(await html(), '<div><div>A/1</div><div>B/2</div></div>');
  set('players.a.level', 42);
  t.is(await html(), '<div><div>A/42</div><div>B/2</div></div>');
});

test('standalone on', async t => {
  set('test', 'ing');

  init(
    element,
    <div>
      {(() => {
        return don('test').map(res => {
          const e = <b />;
          e.textContent = res;
          return e;
        });
      })()}
    </div>
  );

  t.is(await html(), '<div><b>ing</b></div>');
});

test('sub-path pathifier standalone on', async t => {
  set('players.a', { name: 'A', level: 1 });

  init(
    element,
    <main>
      {don('players.$').map((player, { child }) => (
        <div>
          {player.name}
          {(() => {
            return don(child('level')).map(level => {
              const e = <b />;
              e.textContent = level;
              return e;
            });
          })()}
        </div>
      ))}
    </main>
  );
  t.is(await html(), '<main><div>A<b>1</b></div></main>');
  set('players.a.level', 42);
  t.is(await html(), '<main><div>A<b>42</b></div></main>');
});

test('data attribute', async t => {
  const a = <li data-value="yes"></li>;
  t.is(a.dataset.value, 'yes');
});

test('lists', async t => {
  init(
    element,
    <div>
      users:
      <ul>
        {don('users.$.*').map(_ => (
          <li>{_.name}</li>
        ))}
      </ul>
    </div>
  );

  set('users', [{ name: 'eirik' }, { name: 'steffen' }]);
  t.is(
    await html(),
    '<div>users:<ul><li>eirik</li><li>steffen</li></ul></div>'
  );
  set('users.0.name', 'wut');
  t.is(await html(), '<div>users:<ul><li>wut</li><li>steffen</li></ul></div>');
});

test('Pathifier instead of Domponent', async t => {
  function Ok() {
    return don('test');
  }

  init(
    element,
    <div>
      <Ok></Ok>
    </div>
  );
  t.is(await html(), '<div></div>');
  set('test', 'ing');
  t.is(await html(), '<div>ing</div>');
});

test('Pathifier instead of Domponent with mounted', async t => {
  function Ok({}, { mounted }) {
    mounted(() => {
      t.pass();
    });
    return don('test');
  }

  init(
    element,
    <div>
      <Ok></Ok>
    </div>
  );
});

test('Pathifier instead of Domponent with element', async t => {
  function Ok() {
    return don('test')
      .map(test => (test ? <h1>h1</h1> : <h2>h2</h2>))
      .or('nope');
  }

  init(
    element,
    <div>
      <Ok></Ok>
    </div>
  );
  t.is(await html(), '<div>nope</div>');
  set('test', false);
  t.is(await html(), '<div><h2>h2</h2></div>');
  set('test', true);
  t.is(await html(), '<div><h1>h1</h1></div>');
});

test('svg', async t => {
  init(
    element,
    <div>
      <svg>
        <circle r="42" />
      </svg>
    </div>
  );
  t.is(await html(), '<div><svg><circle r="42"></circle></svg></div>');
  t.is(
    document.querySelector('svg')?.namespaceURI,
    'http://www.w3.org/2000/svg'
  );
  t.is(
    document.querySelector('circle')?.namespaceURI,
    'http://www.w3.org/2000/svg'
  );
});

test('xmlns', async t => {
  init(
    element,
    <div>
      <a xmlns="http://eh/eh">
        <b>eh</b>
      </a>
    </div>
  );
  t.is(await html(), '<div><a xmlns="http://eh/eh"><b>eh</b></a></div>');
  t.is(document.querySelector('a')?.namespaceURI, 'http://eh/eh');
  t.is(document.querySelector('b')?.namespaceURI, 'http://eh/eh');
});

test('on attribute svg', async t => {
  init(
    element,
    <div>
      <svg>
        <circle r={don('r')}>
          <rect x={don('x')} />
        </circle>
      </svg>
    </div>
  );
  t.is(await html(), '<div><svg><circle><rect></rect></circle></svg></div>');
  set('r', 42);
  t.is(
    await html(),
    '<div><svg><circle r="42"><rect></rect></circle></svg></div>'
  );
  set('x', 137);
  t.is(
    await html(),
    '<div><svg><circle r="42"><rect x="137"></rect></circle></svg></div>'
  );
});

test('on svg', async t => {
  init(
    element,
    <div>
      <svg>{don('show').map(show => (show ? <rect /> : null))}</svg>
    </div>
  );
  t.is(await html(), '<div><svg></svg></div>');
  set('show', true);
  t.is(await html(), '<div><svg><rect></rect></svg></div>');
});

test('on svg 2', async t => {
  init(
    element,
    <div>
      <svg>
        <circle>{don('show').map(show => (show ? <rect /> : null))}</circle>
      </svg>
    </div>
  );
  t.is(await html(), '<div><svg><circle></circle></svg></div>');
  set('show', true);
  t.is(await html(), '<div><svg><circle><rect></rect></circle></svg></div>');
});

test('object attributes', t => {
  const e = <div yes={{ hello: 'world' }} />;
  t.deepEqual(e.yes, { hello: 'world' });
});

test('error in dom', t => {
  const e = <div>{new Error('Oh my')}</div>;
  t.is(e.outerHTML, '<div>Error: Oh my</div>');
});

// test('on in on', async t => {
//   console.log(1);
//   init(
//     element,
//     <div>{on('test').map(() => on('ing').map(() => 'Yeah!'))}</div>
//   );
//   set('ing', true);
//   console.log(1, await html());
//   set('test', true);
//   console.log(2, await html());
//   t.pass();
// });
