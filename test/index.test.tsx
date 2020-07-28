import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import domdom from '../src/domdom';
import { Domponent, Domdom } from '../src/types';

browserEnv();

let React;
let dd: Domdom;
let append: Function;

async function html() {
  // Force update of Observables
  await Promise.resolve();
  return document.body.innerHTML;
}

test.beforeEach(() => {
  document.body.innerHTML = '';
  const d = domdom();
  React = d.React;
  dd = d.data as Domdom;
  append = d.append;
});

test('Component', async t => {
  const Test: Domponent = ({ on }) => {
    return <div>{on!('test')}</div>;
  };

  append(document.body, () => <Test />);
  dd.set('test', 'Hello, world!');
  t.is(await html(), '<div>Hello, world!</div>');
});

test('Double on', async t => {
  const div = ({ on }) => (
    <div>
      {on('test', test => (
        <div>
          {test}
          {on('testing', test => (
            <span>eh {test}</span>
          ))}
        </div>
      ))}
    </div>
  );
  append(document.body, div);
  t.is(await html(), '<div></div>');

  dd.set('test', 'hello');
  t.is(await html(), '<div><div>hello</div></div>');

  dd.set('testing', 'world');
  t.is(await html(), '<div><div>hello<span>eh world</span></div></div>');

  dd.unset('test');
  t.is(await html(), '<div></div>');
  dd.set('test', 'hello');
  t.is(await html(), '<div><div>hello<span>eh world</span></div></div>');
});

test('on without callback', async t => {
  const div = ({ on }) => <div>{on('test')}</div>;
  append(document.body, div);

  dd.set('test', 'hello');
  t.is(await html(), '<div>hello</div>');

  dd.set('test', 'world');
  t.is(await html(), '<div>world</div>');

  dd.unset('test');
  t.is(await html(), '<div></div>');
});

test('Multiple paths', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.$id', player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  append(document.body, div);
  t.is(await html(), '<div></div>');

  dd.set('players.aone', { name: 'Mr. one' });
  t.is(await html(), '<div><p>Mr. one</p></div>');

  dd.set('players.btwo', { name: 'Mr. two' });
  t.is(await html(), '<div><p>Mr. one</p><p>Mr. two</p></div>');

  dd.set('players.aone', { name: 'Hello' });
  t.is(await html(), '<div><p>Mr. two</p><p>Hello</p></div>');

  dd.unset('players.aone');
  t.is(await html(), '<div><p>Mr. two</p></div>');
});

test('Multiple paths map', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  append(document.body, div);
  t.is(await html(), '<div></div>');

  dd.set('players.aone', { name: 'Mr. one' });
  t.is(await html(), '<div><p>Mr. one</p></div>');

  dd.set('players.btwo', { name: 'Mr. two' });
  t.is(await html(), '<div><p>Mr. one</p><p>Mr. two</p></div>');

  dd.set('players.aone', { name: 'Hello' });
  t.is(await html(), '<div><p>Hello</p><p>Mr. two</p></div>');

  dd.unset('players.aone');
  t.is(await html(), '<div><p>Mr. two</p></div>');
});

test('on Sort - default sort by key', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  append(document.body, div);
  dd.set('players.aone', { name: '1' });
  dd.set('players.btwo', { name: '2' });
  dd.set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('on Sort - sort method', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*')
        .map(player => <p>{player.name}</p>)
        .sort((a, b) => b.name.localeCompare(a.name))}
    </div>
  );
  append(document.body, div);
  dd.set('players.aone', { name: '1' });
  dd.set('players.btwo', { name: '2' });
  dd.set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');
});

test('on Sort - sort method2', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*')
        .map(
          player => <p>{player.name}</p>,
          (a, b) => a.name.localeCompare(b.name)
        )
        .sort((a, b) => a.name.localeCompare(b.name))}
    </div>
  );
  append(document.body, div);
  dd.set('players.aone', { name: '1' });
  dd.set('players.btwo', { name: '2' });
  dd.set('players.cthree', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('Multiple on-siblings', async t => {
  const div = ({ on }) => (
    <div>
      {on('b', test => (
        <div>{test}</div>
      ))}
      {on('a', ing => (
        <div>{ing}</div>
      ))}
    </div>
  );
  append(document.body, div);
  dd.set('a', 'World');
  dd.set('b', 'Hello');
  t.is(await html(), '<div><div>Hello</div><div>World</div></div>');
});

test('on Sort - keep order', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*').map(player => (
        <p>{player.name}</p>
      ))}
    </div>
  );
  append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');

  dd.unset('players.1');
  t.is(await html(), '<div><p>2</p><p>3</p></div>');

  dd.set('players.1', { name: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('on Sort - custom order', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*')
        .map(player => <p>{player.name}</p>)
        .sort((a, b) => b.name.localeCompare(a.name))}
    </div>
  );
  append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  dd.unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  dd.set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('on Sort - remove $first - with sort', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*').map(
        player => (
          <p>{player.name}</p>
        ),
        (_, __, aPath, bPath) => aPath.localeCompare(bPath)
      )}
    </div>
  );
  append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');

  dd.unset('players.1');
  t.is(await html(), '<div><p>2</p><p>3</p></div>');

  dd.set('players.1', { name: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('Child listener', async t => {
  const div = ({ on }) => (
    <main>
      {on('players.$id', () => (
        <article>{on('>.name', name => name)}</article>
      ))}
    </main>
  );
  append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(
    await html(),
    '<main><article>1</article><article>2</article><article>3</article></main>'
  );
});

test('Simple when', async t => {
  const Test: Domponent = ({ on }) => {
    return <div>{on!('test', t => t)}</div>;
  };

  const div = ({ when }) => (
    <div>
      {when('test', [
        'yes',
        t => `Yes is ${t}`,
        () => true,
        () => <div>Yes!</div>,
        () => true,
        () => <Test />,
      ])}
    </div>
  );
  append(document.body, div);
  dd.set('test', 'yes');
  t.is(await html(), '<div>Yes is yes<div>Yes!</div><div>yes</div></div>');
});

test('Many whens', async t => {
  const div = ({ when }) => (
    <div>
      {when('test', [
        'yes',
        t => t,
        'no',
        t => t,
        true,
        () => 'Yes!',
        () => true,
        () => 'true',
        t => t === 'yes',
        () => 't === yes',
        'yes',
        () => <div>hello</div>,
        'yes',
        () => <div>world</div>,
      ])}
    </div>
  );
  append(document.body, div);
  dd.set('test', 'yes');
  t.is(
    await html(),
    '<div>yestruet === yes<div>hello</div><div>world</div></div>'
  );
  dd.set('test', 'no');
  t.is(await html(), '<div>notrue</div>');
  dd.set('test', 'yes');
  t.is(
    await html(),
    '<div>yestruet === yes<div>hello</div><div>world</div></div>'
  );
});

test('Quirk on + when', async t => {
  const div = ({ on, when }) => (
    <div>
      {on('test', t => t)}

      {when('test', ['yes', () => 'Yes', 'no', () => 'No'])}
    </div>
  );
  append(document.body, div);
  dd.set('test', 'yes');
  t.is(await html(), '<div>yesYes</div>');
  dd.set('test', 'no');
  t.is(await html(), '<div>noNo</div>');
  dd.set('test', 'yes');
  t.is(await html(), '<div>yesYes</div>');
  dd.set('test', 'no');
  t.is(await html(), '<div>noNo</div>');
});

test('Simple or', async t => {
  const div = ({ on }) => (
    <div>{on('test', t => <div>{t}</div>).or(<div>Nope</div>)}</div>
  );
  append(document.body, div);
  t.is(await html(), '<div><div>Nope</div></div>');
  dd.set('test', 'ing');
  t.is(await html(), '<div><div>ing</div></div>');
  dd.set('test', '');
  t.is(await html(), '<div><div></div></div>');
  dd.unset('test');
  t.is(await html(), '<div><div>Nope</div></div>');
});

test('on empty res', async t => {
  const div = ({ on }) => <div>{on('test')}</div>;
  append(document.body, div);
  dd.set('test', 'Hello');
  t.is(await html(), '<div>Hello</div>');
  dd.set('test', '');
  t.is(await html(), '<div></div>');
});

test('Multiple child paths', async t => {
  const div = ({ on }) => (
    <div>
      {on('a', () => (
        <div>
          {on('>.text')}
          test
          {on('>.text')}
        </div>
      ))}
    </div>
  );
  append(document.body, div);
  dd.set('a', { text: 'ok' });
  t.is(await html(), '<div><div>oktestok</div></div>');
});

test('Have some path with flags', async t => {
  const div = () => {
    const e = <div />;
    e.on('!+* wat', wat => (e.innerHTML = wat));
    return e;
  };
  append(document.body, div);
  dd.set('wat', 'ok');
  t.is(await html(), '<div>ok</div>');
});

test('Listeners are cleared', async t => {
  const { React, data, append } = domdom();

  let i = 0;

  function Child() {
    const e = <div />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', true);
  const div = ({ on }) => (
    <div>
      {on('show', () => (
        <Child />
      ))}
    </div>
  );
  append(document.body, div);
  await html();
  data.set('test', 'b');
  t.is(i, 1);

  data.unset('show');
  await html();
  data.set('test', 'c');
  t.is(i, 1);
});

test('Listeners are not overcleared', async t => {
  const { React, data, append } = domdom();
  let i = 0;

  function Child() {
    const e = <div />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', 'yes');
  const div = ({ on }) => (
    <div>
      {on('show', () => (
        <Child />
      ))}
    </div>
  );
  append(document.body, div);
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
  const { React, data, append } = domdom();
  let i = 0;

  function Child() {
    const e = <p />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', 'yes');
  const div = ({ on }) => (
    <div>
      {on('show', () => (
        <Child />
      ))}
    </div>
  );
  append(document.body, div);

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
  const { React, data, append } = domdom();
  let i = 0;

  function Child() {
    const e = <div />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', true);
  const div = ({ when }) => <div>{when('show', [true, () => <Child />])}</div>;
  append(document.body, div);
  await html();
  data.set('test', 'b');
  t.is(1, i);

  data.set('show', false);
  await html();
  data.set('test', 'c');
  t.is(1, i);
});

test('Listener in when 2', async t => {
  const { React, data, append } = domdom();
  let i = 0;

  function Child() {
    const e = <div />;
    e.on('* test', () => i++);
    return e;
  }

  data.set('test', 'a');
  data.set('show', true);
  const div = ({ when }) => <div>{when('show', [true, () => <Child />])}</div>;
  append(document.body, div);
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

// TODO: Why 2?
test('Mounted', async t => {
  t.plan(1);

  const Hello: Domponent = ({ mounted }) => {
    mounted!(() => t.pass());
    return <div />;
  };

  const div = () => (
    <div>
      <div>
        <Hello />
      </div>
    </div>
  );
  domdom(document.body, div);
});

test('Mounted on/off', async t => {
  t.plan(2);

  const Hello: Domponent = ({ mounted }) => {
    mounted!(() => t.pass());
    return <div />;
  };

  const div = ({ on }) => (
    <div>
      {on('test', () => (
        <Hello />
      ))}
    </div>
  );
  append(document.body, div);

  dd.set('test', true);
  await html();
  dd.unset('test');
  await html();
  dd.set('test', true);
});

test('When with initial false value', async t => {
  const div = ({ when }) => (
    <div>
      {when('test', [
        false,
        () => <div>Hello</div>,
        true,
        () => <div>No!</div>,
      ])}
    </div>
  );
  append(document.body, div);
  dd.set('test', false);
  t.is(await html(), '<div><div>Hello</div></div>');
});

test('Do not remove listener on same level', async t => {
  function Test() {
    return <p>test</p>;
  }

  const div = ({ on }) => (
    <div>
      {on('test', () => (
        <Test />
      ))}
      {on('hello')}
    </div>
  );
  append(document.body, div);
  dd.set('test', true);
  dd.set('hello', 'world');
  t.is(await html(), '<div><p>test</p>world</div>');
  dd.set('test', false);
  dd.unset('test');
  dd.set('hello', 'there');
  t.is(await html(), '<div>there</div>');
});

test('Whole objects should be populated', async t => {
  const div = ({ on }) => (
    <div>
      {on('hello.world', world => (
        <div>{world.test}</div>
      ))}
    </div>
  );
  append(document.body, div);

  dd.set('hello', {
    world: {
      test: ':)',
    },
  });

  t.is(await html(), '<div><div>:)</div></div>');
});

test('Update array', async t => {
  const div = ({ on }) => (
    <div>
      {on('path', path => (
        <div>{JSON.stringify(path)}</div>
      ))}
    </div>
  );
  append(document.body, div);

  dd.set('path', ['hello', 'world']);
  t.is(await html(), '<div><div>{"0":"hello","1":"world"}</div></div>');

  dd.set('path', ['hello']);
  t.is(await html(), '<div><div>{"0":"hello"}</div></div>');
});

test('Update array without element', async t => {
  const view = ({ on }) => <div>{on('x')}</div>;
  append(document.body, view);

  dd.set('x', ['hello', 'world']);
  t.is(await html(), '<div>{"0":"hello","1":"world"}</div>');

  dd.set('x', ['hello']);
  t.is(await html(), '<div>{"0":"hello"}</div>');
});

test('Containment', async t => {
  const Button: Domponent = ({ children }) => <button>{children}</button>;

  domdom(document.body, () => <Button>Test</Button>);
  t.is(await html(), '<button>Test</button>');

  document.body.innerHTML = '';
  domdom(document.body, () => (
    <Button>
      <span>Test</span>
    </Button>
  ));
  t.is(await html(), '<button><span>Test</span></button>');

  document.body.innerHTML = '';
  domdom(document.body, () => (
    <Button>
      <span>Test</span>
      <i>in</i>g
    </Button>
  ));
  t.is(await html(), '<button><span>Test</span><i>in</i>g</button>');
});

test('Rendering types', async t => {
  domdom(document.body, () => (
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
  ));
  t.is(await html(), '<div>a13.6{"hello":"world"}truefalse</div>');
});

test('Remove or on on', async t => {
  const view = ({ on }) => (
    <div>{on('test.$id', t => t.name).or('Loading...')}</div>
  );
  append(document.body, view);
  t.is(await html(), '<div>Loading...</div>');
  dd.set('test', { 0: { name: 'hello' } });
  t.is(await html(), '<div>hello</div>');
});

test('on attributes', async t => {
  const view = ({ on }) => (
    <div>
      <button disabled={on('disable', res => res)} />
    </div>
  );
  append(document.body, view);

  t.is(await html(), '<div><button></button></div>');
  dd.set('disable', true);
  t.is(await html(), '<div><button disabled=""></button></div>');
});

test('on on attributes', async t => {
  const view = ({ on }) => (
    <div>
      <button disabled={on('canClick', res => !res).or(true)} />
      <button disabled={on('canNotClick').or(true)} />
    </div>
  );
  append(document.body, view);

  t.is(
    await html(),
    '<div><button disabled=""></button><button disabled=""></button></div>'
  );

  dd.set('canClick', true);
  dd.set('canNotClick', false);
  t.is(await html(), '<div><button></button><button></button></div>');

  dd.set('canClick', false);
  dd.set('canNotClick', true);
  t.is(
    await html(),
    '<div><button disabled=""></button><button disabled=""></button></div>'
  );
});

test('on on attributes or', async t => {
  const view = ({ on }) => (
    <div>
      <button disabled={on('canNotClick').or(true)} />
    </div>
  );
  append(document.body, view);

  t.is(await html(), '<div><button disabled=""></button></div>');

  dd.set('canNotClick', false);
  t.is(await html(), '<div><button></button></div>');

  dd.unset('canNotClick');
  t.is(await html(), '<div><button disabled=""></button></div>');
});

test('On on object attributes', async t => {
  const view = ({ on }) => (
    <div>
      <p style={on('style')}>Test</p>
    </div>
  );
  append(document.body, view);

  dd.set('style', { color: 'red' });
  t.is(await html(), '<div><p style="color: red;">Test</p></div>');
});

test('Filter array', async t => {
  const view = ({ on }) => (
    <div>
      {on('users')
        .map(user => <span>{user.name}</span>)
        .filter(user => user.name !== 'One!')}
    </div>
  );
  append(document.body, view);

  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filter on update filter', async t => {
  const view = ({ on }) => (
    <div>
      {on('users')
        .map(user => <span>{user.name}</span>)
        .filter(user => user.name !== 'One!')}
    </div>
  );
  append(document.body, view);

  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update filter', async t => {
  const view = ({ on }) => (
    <div>
      {on('users')
        .map(user => <span>{user.name}</span>)
        .filterOn('test', (_, user) => user.name !== 'One!')}
    </div>
  );
  append(document.body, view);

  dd.set('test', { search: 'it' });
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update filter refresh', async t => {
  const view = ({ on }) => (
    <div>
      {on('users')
        .map(user => <span>{user.name}</span>)
        .filterOn('test', (_, user) => user.name !== 'One!')}
    </div>
  );
  append(document.body, view);

  dd.set('test', { search: 'it' });
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><span>Two!</span></div>');
});

test('Update filterOn on update after data is set', async t => {
  const view = ({ on }) => (
    <div>
      {on('users')
        .map(user => <b>{user.name}</b>)
        .filterOn('test', (filter, user) =>
          new RegExp(filter, 'i').test(user.name)
        )}
    </div>
  );
  append(document.body, view);

  dd.set('test', '');
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><b>One!</b><b>Two!</b></div>');
  dd.set('test', 'two');
  t.is(await html(), '<div><b>Two!</b></div>');
});

test('on sortOn - custom order', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*')
        .map(player => <p>{player.name}</p>)
        .sortOn('test', (_, a, b) => b.name.localeCompare(a.name))}
    </div>
  );
  append(document.body, div);
  dd.set('test', 'yes');
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  dd.unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  dd.set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('on sortOn - custom order update', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*')
        .map(player => <p>{player.name}</p>)
        .sortOn('test', (_, a, b) => b.name.localeCompare(a.name))}
    </div>
  );
  append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  dd.set('test', 'yes');
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');

  dd.unset('players.1');
  t.is(await html(), '<div><p>3</p><p>2</p></div>');

  dd.set('players.1', { name: '7' });
  t.is(await html(), '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('onFilter and onSort', async t => {
  const div = ({ on }) => (
    <div>
      {on('players.*')
        .map(player => <p>{player.name}</p>)
        .sortOn('filter.by', (val, a, b) => a[val].localeCompare(b[val]))}
    </div>
  );
  append(document.body, div);
  dd.set('filter.by', 'name');
  dd.set('players.1', { name: '1', age: '3' });
  dd.set('players.2', { name: '2', age: '2' });
  dd.set('players.3', { name: '3', age: '1' });
  t.is(await html(), '<div><p>1</p><p>2</p><p>3</p></div>');
  dd.set('filter.by', 'age');
  t.is(await html(), '<div><p>3</p><p>2</p><p>1</p></div>');
});

test('Function context', async t => {
  function App() {
    return <div>:)</div>;
  }

  const div = () => (
    <div>
      <App />
    </div>
  );
  domdom(document.body, div);
  t.is(await html(), '<div><div>:)</div></div>');
});

test('Function context when when', async t => {
  function App() {
    return <div>:)</div>;
  }

  const div = ({ when }) => (
    <div>{when('test', [true, () => <App />, true, () => <App />])}</div>
  );
  append(document.body, div);
  dd.set('test', true);
  t.is(await html(), '<div><div>:)</div><div>:)</div></div>');
});

test('filterOn and back', async t => {
  const view = ({ on }) => (
    <div>
      {on('users')
        .map(user => <b>{user.name}</b>)
        .filterOn('test', (filter, user) =>
          new RegExp(filter, 'i').test(user.name)
        )}
      <p>Because</p>
    </div>
  );
  append(document.body, view);
  dd.set('test', '');
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><b>One!</b><b>Two!</b><p>Because</p></div>');
  dd.set('test', 'two');
  t.is(await html(), '<div><b>Two!</b><p>Because</p></div>');
  dd.set('test', '');
  t.is(await html(), '<div><b>One!</b><b>Two!</b><p>Because</p></div>');
});

test('When + change', async t => {
  const view = ({ when, on }) => (
    <div>{when('yes', [true, () => <p>{on('ok')}</p>])}</div>
  );
  append(document.body, view);
  dd.set('yes', true);
  dd.set('yes', false);
  dd.set('yes', true);
  dd.set('ok', 'OK!');
  t.is(await html(), '<div><p>OK!</p></div>');
});

test('When + change 2', async t => {
  const view = ({ when, on }) => (
    <div>{when('yes', [true, () => <p>{on('ok')}</p>])}</div>
  );
  append(document.body, view);
  dd.set('yes', true);
  dd.set('yes', false);
  dd.set('ok', 'OK!');
  dd.set('yes', true);
  t.is(await html(), '<div><p>OK!</p></div>');
});

test('When + filterOn', async t => {
  const view = ({ when, on }) => (
    <div>
      {when('yes', [
        true,
        () => (
          <div>
            {on('users')
              .map(user => <b>{user.name}</b>)
              .filterOn('test', (filter, user) =>
                new RegExp(filter, 'i').test(user.name)
              )}
            <p>Because</p>
          </div>
        ),
      ])}
    </div>
  );
  append(document.body, view);
  dd.set('test', 'two');
  dd.set('yes', true);
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(await html(), '<div><div><b>Two!</b><p>Because</p></div></div>');
  dd.set('yes', false);
  t.is(await html(), '<div></div>');
  dd.set('yes', true);
  dd.set('test', '');
  t.is(
    await html(),
    '<div><div><b>One!</b><b>Two!</b><p>Because</p></div></div>'
  );
});

test('Re-add', async t => {
  const view = ({ on }) => (
    <div>
      {on('yes', t => (
        <p>
          {t} {on('no')}
        </p>
      ))}
    </div>
  );
  append(document.body, view);
  dd.set('yes', 'Yes!');
  dd.set('no', 'No!');
  t.is(await html(), '<div><p>Yes! No!</p></div>');
  dd.unset('yes');
  dd.set('no', 'Well!');
  dd.set('yes', 'OK!');
  t.is(await html(), '<div><p>OK! Well!</p></div>');
});

test('Something something filter and add', async t => {
  const view = ({ on }) => (
    <div>
      {on('users')
        .map(u => (
          <p>
            {u} {on('yes')}
          </p>
        ))
        .filterOn('filter', f => f)}
    </div>
  );
  append(document.body, view);
  dd.set('filter', true);
  dd.set('yes', 'y');
  dd.set('users', {
    one: 'o',
    two: 't',
  });
  t.is(await html(), '<div><p>o y</p><p>t y</p></div>');
  dd.set('filter', false);
  t.is(await html(), '<div></div>');
  dd.set('yes', 'n');
  dd.set('filter', true);
  t.is(await html(), '<div><p>o n</p><p>t n</p></div>');
});

test('Simplest', async t => {
  const view = ({ on }) => (
    <div>
      {on('yes', () => (
        <p>{on('no')}</p>
      ))}
    </div>
  );
  append(document.body, view);

  dd.set('yes', true);
  dd.set('no', 'n');
  t.is(await html(), '<div><p>n</p></div>');
  dd.set('no', 'n');
});

test('filterOn mounted destroy mounted', async t => {
  const view = ({ when, on }) => (
    <div>
      {when('yes', [
        true,
        () => (
          <div>
            {on('users')
              .map(u => u.name)
              .filterOn('filter', (f, u) => f === u.name)}
          </div>
        ),
      ])}
    </div>
  );
  append(document.body, view);

  dd.set('yes', true);
  dd.set('filter', 'one');
  dd.set('users.1', { name: 'one', test: 'yes' });
  dd.set('users.2', { name: 'two' });

  t.is(await html(), '<div><div>one</div></div>');

  dd.set('yes', false);
  t.is(await html(), '<div></div>');

  dd.set('yes', true);
  t.is(await html(), '<div><div>one</div></div>');
});

test('When + filterOn const element', async t => {
  const view = ({ when, on }) => (
    <div>
      {when('show', [
        true,
        () => (
          <div>
            {on('users')
              .map(task => <p>{task.name}</p>)
              .filterOn('filter', (filter, row) => row.name === filter)}
          </div>
        ),
      ])}
    </div>
  );

  append(document.body, view);

  dd.set('users', { 1: { name: 'a' }, 2: { name: 'b' } });
  dd.set('show', true);
  dd.set('filter', 'a');
  dd.set('show', false);
  dd.set('show', true);
  t.deepEqual(await html(), '<div><div><p>a</p></div></div>');
});

test('When + filterOn const text', async t => {
  const view = ({ when, on }) => (
    <div>
      {when('show', [
        true,
        () => (
          <div>
            {on('users')
              .map(task => task.name)
              .filterOn('filter', (filter, row) => row.name === filter)}
          </div>
        ),
      ])}
    </div>
  );
  append(document.body, view);
  dd.set('users', { 1: { name: 'a' }, 2: { name: 'b' } });
  dd.set('show', true);
  dd.set('filter', 'a');
  dd.set('show', false);
  dd.set('show', true);
  t.deepEqual(await html(), '<div><div>a</div></div>');
});

test('On child attribute listener', async t => {
  const Yes: Domponent = ({ on }) => {
    return <a href={on!('>.link')}>test</a>;
  };

  const view = ({ on }) => (
    <div>
      {on('yes', ok => (
        <div>
          {ok.text} <Yes />
        </div>
      ))}
    </div>
  );
  append(document.body, view);
  dd.set('yes', {
    link: 'https://nrk.no',
    text: 'Some link:',
  });
  t.is(
    await html(),
    '<div><div>Some link: <a href="https://nrk.no">test</a></div></div>'
  );
});

test('Same listener twice no problem', async t => {
  const view = ({ on }) => (
    <div>
      {on('test', t1 => (
        <div>
          {t1} and {on('test')}
        </div>
      ))}
    </div>
  );
  append(document.body, view);
  dd.set('test', 'yes');
  t.is(await html(), '<div><div>yes and yes</div></div>');
});

test('Same listener twice no problem on when', async t => {
  const Yes: Domponent = ({ when }) => {
    return <div>{when!('test', ['yes', () => 'OK!'])}</div>;
  };

  const view = ({ when }) => <div>{when('test', ['yes', () => <Yes />])}</div>;
  append(document.body, view);
  dd.set('test', 'yes');
  t.is(await html(), '<div><div>OK!</div></div>');
});

test('Function in on', async t => {
  const { React, data, append } = domdom();

  const Yes: Domponent = ({ on }) => {
    return (
      <div>
        {on!('yes', () => (
          <p>A</p>
        ))}
        {on!('yes', () => (
          <p>B</p>
        ))}
        {on!('yes', () => (
          <p>C</p>
        ))}
      </div>
    );
  };

  data.set('yes', 'ok');
  const view = ({ on }) => (
    <div>
      {on('yes', () => (
        <Yes />
      ))}
    </div>
  );
  append(document.body, view);
  t.is(await html(), '<div><div><p>A</p><p>B</p><p>C</p></div></div>');
  t.pass();
});

test('When and on no duplicated', async t => {
  const Yes: Domponent = ({ on }) => {
    return (
      <div>
        {on!('myse.type', () => (
          <p>A</p>
        ))}
        {on!('myse.type', () => (
          <p>B</p>
        ))}
        {on!('myse.type', () => (
          <p>C</p>
        ))}
      </div>
    );
  };

  const view = ({ when }) => (
    <div>{when('route', ['ready', () => <Yes />])}</div>
  );
  append(document.body, view);
  dd.set('route', 'login1');
  dd.set('myse', {
    type: 'proppgave',
  });
  dd.set('route', 'ready');
  t.is(await html(), '<div><div><p>A</p><p>B</p><p>C</p></div></div>');
});

test('when + or', async t => {
  const view = ({ when }) => (
    <div>{when('test', [true, () => '-', false, () => '+']).or('+')}</div>
  );
  append(document.body, view);
  t.is(await html(), '<div>+</div>');
  dd.set('test', true);
  t.is(await html(), '<div>-</div>');
  dd.set('test', false);
  t.is(await html(), '<div>+</div>');
});

test('When + pathifier', async t => {
  const view = ({ when, on }) => (
    <div>
      {when('test', [
        true,
        () => (
          <div>
            {on('players').map(p => (
              <p>{p}</p>
            ))}
          </div>
        ),
      ])}
    </div>
  );
  append(document.body, view);
  dd.set('test', true);
  dd.set('players', ['a']);
  dd.set('test', false);
  dd.set('test', true);
  t.pass();
});

test('on + pathifier', async t => {
  const view = ({ on }) => (
    <div>
      {on('test', test =>
        test ? (
          <div>
            {on('players').map(p => (
              <p>{p}</p>
            ))}
          </div>
        ) : (
          'no!'
        )
      )}
    </div>
  );
  append(document.body, view);
  dd.set('test', true);
  dd.set('players', ['a']);
  dd.set('test', false);
  dd.set('test', true);
  t.pass();
});

test('on + on', async t => {
  const view = ({ on }) => (
    <div>
      {on('test', test =>
        test ? (
          <div>
            {on('players.$id', p => (
              <p>{p}</p>
            ))}
          </div>
        ) : (
          'no!'
        )
      )}
    </div>
  );
  append(document.body, view);
  dd.set('test', true);
  dd.set('players', ['a']);
  dd.set('test', false);
  dd.set('test', true);
  t.pass();
});

test('dd-model select before options are set', async t => {
  const view = ({ on }) => (
    <div>
      <select dd-model="yes">
        {on('test').map(t => (
          <option value={t}>{t}</option>
        ))}
      </select>
    </div>
  );
  append(document.body, view);
  dd.set('yes', 'hello');
  dd.set('test', ['', 'hello', 'world']);
  await html();
  const select = document.querySelector('select');
  return Promise.resolve().then(() => {
    t.is(select!.value, 'hello');
  });
});

test('Convenience', async t => {
  append(document.body, ({ on }) => <div>Hello {on('test')}</div>);
  dd.set('test', 'world!');
  t.pass();
});

test('Convenience view before domdom', async t => {
  const view = ({ on }) => <div>Hello {on('test')}</div>;
  append(document.body, view);
  dd.set('test', 'world!');
  t.pass();
});

test('Flags in components are work and cleared', async t => {
  let counter = 0;

  const Hello: Domponent = ({ on }) => {
    const e = <div>Hello!</div>;
    on!('!+* tast', test => {
      counter++;
      e.textContent = test;
    });
    return e;
  };

  const view = ({ on }) => (
    <div>
      {on('test', test => (
        <div>
          Test is {test}. <Hello />
        </div>
      ))}
    </div>
  );
  append(document.body, view);

  t.is(await html(), '<div></div>');
  dd.set('test', 'world!');
  t.is(await html(), '<div><div>Test is world!. <div>Hello!</div></div></div>');
  t.is(counter, 0);

  dd.set('tast', 'ing');
  t.is(await html(), '<div><div>Test is world!. <div>ing</div></div></div>');
  t.is(counter, 1);

  dd.unset('test');
  t.is(await html(), '<div></div>');
  t.is(counter, 1);

  dd.set('tast', 'uhm');
  t.is(await html(), '<div></div>');
  t.is(counter, 1);

  dd.set('test', 'yo');
  t.is(await html(), '<div><div>Test is yo. <div>uhm</div></div></div>');
  t.is(counter, 2);
});

test('Element with event but not added via domdom', async t => {
  domdom();
  const element = <button onClick={t.pass}>Click me!</button>;
  element.click();
});

test.skip('Hodor as a child', async t => {
  const Parent: Domponent = ({ children }) => {
    return <div>{children}</div>;
  };

  append(document.body, ({ on }) => (
    <div>
      <Parent>{on('test')}</Parent>
    </div>
  ));
  dd.set('test', 'OK!');
  t.is(await html(), '<div><div>OK!</div></div>');
  t.pass();
});

test('Re-usable domdom', async t => {
  const { React, data, append } = domdom();

  const Hello: Domponent = ({ on }) => {
    return <div>Hello {on!('test')}</div>;
  };

  data.set('test', 'World!');
  append(document.body, () => (
    <main>
      <Hello />
    </main>
  ));
  t.is(await html(), '<main><div>Hello World!</div></main>');
});

test('Element with hodor but not added via domdom', async t => {
  append(document.body, ({ on }) => {
    const a = <main />;
    const c = <span>{on('test')}</span>;
    setTimeout(() => {
      const b = document.createElement('div');
      a.appendChild(b);
      setTimeout(() => {
        b.appendChild(c);
      }, 50);
    }, 50);

    return a;
  });
  dd.set('test', 'Hello!');
  await new Promise(r => {
    setTimeout(async () => {
      t.is(await html(), '<main><div><span>Hello!</span></div></main>');
      r();
    }, 150);
  });
});

test('on with properties', async t => {
  const div = ({ on }) => (
    <div>
      {on('users.$id', (user, { $id }) => {
        return (
          <div>
            {$id}: {user.name}
          </div>
        );
      })}
    </div>
  );
  append(document.body, div);

  dd.set('users', {
    a: { name: 'A!' },
    b: { name: 'B!' },
  });
  t.is(await html(), '<div><div>a: A!</div><div>b: B!</div></div>');
});

test('properties without value should not crash', async t => {
  append(document.body, () => <div style={undefined}></div>);
  t.is(await html(), '<div style=""></div>');
});

test('path should not be part of data', async t => {
  t.plan(3);
  append(document.body, ({ on }) => <div>{on('test')}</div>);
  dd.on('!+* test', val => {
    t.deepEqual(val, { hello: 'world' });
  });
  dd.set('test', {
    hello: 'world',
  });
  dd.on('!+* test', val => {
    t.deepEqual(val, { hello: 'world' });
  });
  t.is('<div>{"hello":"world"}</div>', await html());
});

test('ContextOptions destructuring', async t => {
  append(document.body, ({ on, set }) => (
    <div>
      {on('yes', () => set('no', 'ok'))}
      {on('no')}
    </div>
  ));

  dd.set('yes', ':)');
  t.is(await html(), '<div>ok</div>');
});
