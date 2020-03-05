import test from 'ava';
import browserEnv from 'browser-env';

browserEnv();
import domdom from './src';

test.beforeEach(() => {
  document.body.innerHTML = '';
});

test.serial('Double on', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('test', (test) => <div>
        {test}
        {on('testing', (test) => <span>eh {test}</span>)}
      </div>
    )}
  </div>;
  dd.append(document.body, div);
  t.is(document.body.innerHTML, '<div></div>');

  dd.set('test', 'hello');
  t.is(document.body.innerHTML, '<div><div>hello</div></div>');

  dd.set('testing', 'world');
  t.is(document.body.innerHTML, '<div><div>hello<span>eh world</span></div></div>');

  dd.unset('test');
  t.is(document.body.innerHTML, '<div></div>');
  dd.set('test', 'hello');
  t.is(document.body.innerHTML, '<div><div>hello<span>eh world</span></div></div>');
});

test.serial('on without callback', t => {
  const dd = domdom();
  const div = ({ on }) => <div>{on('test')}</div>;
  dd.append(document.body, div);

  dd.set('test', 'hello');
  t.is(document.body.innerHTML, '<div>hello</div>');

  dd.set('test', 'world');
  t.is(document.body.innerHTML, '<div>world</div>');

  dd.unset('test');
  t.is(document.body.innerHTML, '<div></div>');
});

test.serial('Multiple paths', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players.$id', player => <p>{player.name}</p>)}
  </div>;
  dd.append(document.body, div);
  t.is(document.body.innerHTML, '<div></div>');

  dd.set('players.one', { name: 'Mr. one' });
  t.is(document.body.innerHTML, '<div><p>Mr. one</p></div>');

  dd.set('players.two', { name: 'Mr. two' });
  t.is(document.body.innerHTML, '<div><p>Mr. one</p><p>Mr. two</p></div>');

  dd.set('players.one', { name: 'Hello' });
  t.is(document.body.innerHTML, '<div><p>Mr. two</p><p>Hello</p></div>');

  dd.unset('players.one');
  t.is(document.body.innerHTML, '<div><p>Mr. two</p></div>');
});

test.serial('on Sort - no default', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players.$id', player => <p>{player.name}</p>)}
  </div>;
  dd.append(document.body, div);
  dd.set('players.one', { name: '1' });
  dd.set('players.two', { name: '2' });
  dd.set('players.three', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
});

// test.serial('on Sort - if third arg is true then use the old default', t => {
//   const dd = domdom();
//   const div = ({ on }) => <div>
//     {on('players.$id', player => <p>{player.name}</p>, true)}
//   </div>;
//   dd.append(document.body, div);
//   dd.set('players.one', { name: '1' });
//   dd.set('players.two', { name: '2' });
//   dd.set('players.three', { name: '3' });
//   t.is(document.body.innerHTML, '<div><p>1</p><p>3</p><p>2</p></div>');
// });

test.serial('on Sort - by third argument', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players.$id', player => <p>{player.name}</p>, (a, b) => a.name.localeCompare(b.name))}
  </div>;
  dd.append(document.body, div);
  dd.set('players.one', { name: '1' });
  dd.set('players.two', { name: '2' });
  dd.set('players.three', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
});

test.serial('Multiple on-siblings', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('b', test => <div>{test}</div>)}
    {on('a', ing => <div>{ing}</div>)}
  </div>;
  dd.append(document.body, div);
  dd.set('a', 'World');
  dd.set('b', 'Hello');
  t.is(document.body.innerHTML, '<div><div>Hello</div><div>World</div></div>');
});

test.serial('on Sort - remove $first', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players.$id', player => <p>{player.name}</p>)}
  </div>;
  dd.append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');

  dd.unset('players.1');
  t.is(document.body.innerHTML, '<div><p>2</p><p>3</p></div>');

  dd.set('players.1', { name: '1' });
  t.is(document.body.innerHTML, '<div><p>2</p><p>3</p><p>1</p></div>');
});

// test.serial('on Sort - remove $first - with sort', t => {
//   const dd = domdom();
//   const div = ({ on }) => <div>
//     {on('players.$id', player => <p>{player.name}</p>,
//       (a, b, aPath, bPath) => aPath.localeCompare(bPath)
//     )}
//   </div>;
//   dd.append(document.body, div);
//   dd.set('players.1', { name: '1' });
//   dd.set('players.2', { name: '2' });
//   dd.set('players.3', { name: '3' });
//   t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
//
//   dd.unset('players.1');
//   t.is(document.body.innerHTML, '<div><p>2</p><p>3</p></div>');
//
//   dd.set('players.1', { name: '1' });
//   t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
// });

// test.serial('Child listener', t => {
//   const dd = domdom();
//   const div = ({ on }) => <main>
//     {on('players.$id', () => <article>
//       {on('>.name', name => name)}
//     </article>)}
//   </main>;
//   dd.append(document.body, div);
//   dd.set('players.1', { name: '1' });
//   dd.set('players.2', { name: '2' });
//   dd.set('players.3', { name: '3' });
//   t.is(document.body.innerHTML, '<main><article>1</article><article>2</article><article>3</article></main>');
// });

test.serial('Simple when', t => {
  const dd = domdom();

  function Test({ on }) {
    return <div>{on('test', t => t)}</div>;
  }

  const div = ({ when }) => <div>
    {when('test', [
      'yes', t => `Yes is ${t}`,
      () => true, <div>Yes!</div>,
      () => true, () => <Test/>,
    ])}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>Yes is yes<div>Yes!</div><div>yes</div></div>');
});

test.serial('Many whens', t => {
  const dd = domdom();
  const div = ({ when }) => <div>
    {when('test', [
      'yes', t => t,
      'no', t => t,
      true, () => 'Yes!',
      () => true, 'true',
      t => t === 'yes', 't === yes',
      'yes', () => <div>hello</div>,
      'yes', <div>world</div>
    ])}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>yestruet === yes<div>hello</div><div>world</div></div>');
  dd.set('test', 'no');
  t.is(document.body.innerHTML, '<div>notrue</div>');
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>yestruet === yes<div>hello</div><div>world</div></div>');
});

test.serial('Quirk on + when', t => {
  const dd = domdom();
  const div = ({ on, when }) => <div>
    {on('test', t => t)}

    {when('test', [
      'yes', 'Yes',
      'no', 'No'
    ])}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>yesYes</div>');
  dd.set('test', 'no');
  t.is(document.body.innerHTML, '<div>noNo</div>');
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>yesYes</div>');
  dd.set('test', 'no');
  t.is(document.body.innerHTML, '<div>noNo</div>');
});

test.serial('Simple or', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('test', t => <div>{t}</div>).or(<div>Nope</div>)}
  </div>;
  dd.append(document.body, div);
  t.is(document.body.innerHTML, '<div><div>Nope</div></div>');
  dd.set('test', 'ing');
  t.is(document.body.innerHTML, '<div><div>ing</div></div>');
  dd.set('test', '');
  t.is(document.body.innerHTML, '<div><div></div></div>');
  dd.unset('test');
  t.is(document.body.innerHTML, '<div><div>Nope</div></div>');
});

test.serial('on empty res', t => {
  const dd = domdom();
  const div = ({ on }) => <div>{on('test')}</div>;
  dd.append(document.body, div);
  dd.set('test', 'Hello');
  t.is(document.body.innerHTML, '<div>Hello</div>');
  dd.set('test', '');
  t.is(document.body.innerHTML, '<div></div>');
});

test.serial('Multiple child paths', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('a', () => <div>
      {on('>.text')}
      test
      {on('>.text')}
    </div>)}
  </div>;
  dd.append(document.body, div);
  dd.set('a', { text: 'ok' });
  t.is(document.body.innerHTML, '<div><div>oktestok</div></div>');
});

test.serial('Have some path with flags', t => {
  const dd = domdom();
  const div = ({ on }) => {
    const e = <div/>;
    on('!+* wat', wat => e.innerHTML = wat);
    return e;
  };
  dd.append(document.body, div);
  dd.set('wat', 'ok');
  t.is(document.body.innerHTML, '<div>ok</div>');
});

test.serial('Listeners are cleared', t => {
  const dd = domdom();
  let i = 0;

  function Child({ on }) {
    on('* test', () => i++);
    return <div/>;
  }

  dd.set('test', 'a');
  dd.set('show', true);
  const div = ({ on }) => <div>
    {on('show', () =>
      <Child/>
    )}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'b');
  t.is(1, i);

  dd.unset('show');
  dd.set('test', 'c');
  t.is(1, i);
});

test.serial('Listeners are not overcleared', t => {
  const dd = domdom();
  let i = 0;

  function Child({ on }) {
    on('* test', () => i++);
    return <div/>;
  }

  dd.set('test', 'a');
  dd.set('show', 'yes');
  const div = ({ on }) => <div>
    {on('show', () =>
      <Child/>
    )}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'b');
  t.is(1, i);

  dd.set('show', 'yesyes');
  dd.set('test', 'c');
  t.is(2, i);

  dd.set('show', 'yesyesyes');
  dd.set('test', 'd');
  t.is(3, i);
});

test.serial('Listeners are support change of parent', t => {
  const dd = domdom();
  let i = 0;

  function Child({ on }) {
    on('* test', () => i++);
    return <p/>;
  }

  dd.set('test', 'a');
  dd.set('show', 'yes');
  const div = ({ on }) => <div>
    {on('show', () =>
      <Child/>
    )}
  </div>;
  dd.append(document.body, div);

  dd.set('show', 'yesyes');
  dd.set('test', 'c');
  t.is(1, i);

  dd.unset('show');
  dd.set('test', 'd');
  t.is(1, i);
});

test.serial('Listeners in when', t => {
  const dd = domdom();
  let i = 0;

  function Child({ on }) {
    on('* test', () => i++);
    return <div/>;
  }

  dd.set('test', 'a');
  dd.set('show', true);
  const div = ({ when }) => <div>
    {when('show', [
      true, () => <Child/>
    ])}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'b');
  t.is(1, i);

  dd.set('show', false);
  dd.set('test', 'c');
  t.is(1, i);
});

test.serial('Listener in when 2', t => {
  const dd = domdom();
  let i = 0;

  function Child({ on }) {
    on('* test', () => i++);
    return <div/>;
  }

  dd.set('test', 'a');
  dd.set('show', true);
  const div = ({ when }) => <div>
    {when('show', [
      true, () => <Child/>
    ])}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'b');
  t.is(1, i);

  dd.set('show', false);
  dd.set('test', 'c');
  t.is(1, i);

  dd.set('show', true);
  dd.set('test', 'd');
  t.is(2, i);
});

test.serial('Mounted', t => {
  const dd = domdom();
  t.plan(1);

  function Hello({ mounted }) {
    mounted(() => t.pass());
    return <div/>;
  }

  const div = () => <div><Hello/></div>;
  dd.append(document.body, div);
});

test.serial('Mounted on/off', t => {
  const dd = domdom();
  t.plan(2);

  function Hello({ mounted }) {
    mounted(() => t.pass());
    return <div/>;
  }

  const div = ({ on }) => <div>{on('test', () => <Hello/>)}</div>;
  dd.append(document.body, div);

  dd.set('test', true);
  dd.unset('test');
  dd.set('test', true);
});

test.serial('When with initial false value', t => {
  const dd = domdom();

  const div = ({ when }) => <div>
    {when('test', [
      false, () => <div>Hello</div>,
      true, () => <div>No!</div>
    ])}
  </div>;
  dd.set('test', false);
  dd.append(document.body, div);
  t.is(document.body.innerHTML, '<div><div>Hello</div></div>');
});

test.serial('Do not remove listener on same level', t => {
  const dd = domdom();

  function Test() {
    return <p>test</p>;
  }

  const div = ({ on }) => <div>
    {on('test', () => <Test/>)}
    {on('hello')}
  </div>;
  dd.set('test', true);
  dd.set('hello', 'world');
  dd.append(document.body, div);
  t.is(document.body.innerHTML, '<div><p>test</p>world</div>');
  dd.set('test', false);
  dd.unset('test');
  dd.set('hello', 'there');
  t.is(document.body.innerHTML, '<div>there</div>');
});

test.serial('Whole objects should be populated', t => {
  const dd = domdom();

  const div = ({ on }) => <div>
    {on('hello.world', world => <div>{world.test}</div>)}
  </div>;
  dd.append(document.body, div);

  dd.set('hello', {
    world: {
      test: ':)'
    }
  });

  t.is(document.body.innerHTML, '<div><div>:)</div></div>');
});

test.serial('Update array', t => {
  const dd = domdom();

  const div = ({ on }) => <div>
    {on('path', path => <div>{JSON.stringify(path)}</div>)}
  </div>;
  dd.append(document.body, div);

  dd.set('path', ['hello', 'world']);
  t.is(document.body.innerHTML, '<div><div>{"0":"hello","1":"world"}</div></div>');

  dd.set('path', ['hello']);
  t.is(document.body.innerHTML, '<div><div>{"0":"hello"}</div></div>');
});

test.serial('Update array without element', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('path', p => p)}
  </div>;

  dd.append(document.body, view);
  dd.set('path', ['hello', 'world']);
  t.is(document.body.innerHTML, '<div>{"0":"hello","1":"world"}</div>');

  dd.set('path', ['hello']);
  t.is(document.body.innerHTML, '<div>{"0":"hello"}</div>');
});

test.serial('Containment', t => {
  const dd = domdom();
  const Button = ({ children }) => <button>{children}</button>;

  dd.append(document.body, () => <Button>Test</Button>);
  t.is(document.body.innerHTML, '<button>Test</button>');

  document.body.innerHTML = '';
  dd.append(document.body, () => <Button><span>Test</span></Button>);
  t.is(document.body.innerHTML, '<button><span>Test</span></button>');

  document.body.innerHTML = '';
  dd.append(document.body, () => <Button><span>Test</span><i>in</i>g</Button>);
  t.is(document.body.innerHTML, '<button><span>Test</span><i>in</i>g</button>');
});

test.serial('Rendering types', t => {
  const dd = domdom();
  dd.append(document.body, () => <div>
    {'a'}
    {1}
    {3.6}
    {({ hello: 'world' })}
    {undefined}
    {null}
    {true}
    {false}
  </div>);
  t.is(document.body.innerHTML, '<div>a13.6{"hello":"world"}truefalse</div>');
});

test.serial('Remove or on on', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('test.$id', t => t.name).or('Loading...')}
  </div>;
  dd.append(document.body, view);
  t.is(document.body.innerHTML, '<div>Loading...</div>');
  dd.set('test', { 0: { name: 'hello' } });
  t.is(document.body.innerHTML, '<div>hello</div>');
});

test.serial('on attributes', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    <button disabled={on('disable', res => res)}/>
  </div>;

  dd.append(document.body, view);

  t.is(document.body.innerHTML, '<div><button></button></div>');
  dd.set('disable', true);
  t.is(document.body.innerHTML, '<div><button disabled=""></button></div>');
});

test.serial('on on attributes', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    <button disabled={on('canClick', res => !res).or(true)}/>
    <button disabled={on('canNotClick').or(true)}/>
  </div>;

  dd.append(document.body, view);

  t.is(document.body.innerHTML, '<div><button disabled=""></button><button disabled=""></button></div>');

  dd.set('canClick', true);
  dd.set('canNotClick', false);
  t.is(document.body.innerHTML, '<div><button></button><button></button></div>');

  dd.set('canClick', false);
  dd.set('canNotClick', true);
  t.is(document.body.innerHTML, '<div><button disabled=""></button><button disabled=""></button></div>');
});

test.serial('On on object attributes', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    <p style={on('style')}>Test</p>
  </div>;

  dd.append(document.body, view);
  dd.set('style', { color: 'red' });
  t.is(document.body.innerHTML, '<div><p style="color: red;">Test</p></div>');
});

test.serial('Recursive wildcard change', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('test.**', (_, { values }) => values.map(val => <div>{val}</div>))}
  </div>;
  dd.append(document.body, view);
  dd.set('test', { one: '1', two: '2' });
  t.is(document.body.innerHTML, '<div><div>1</div><div>2</div></div>');
  dd.set('test.one', '3');
  t.is(document.body.innerHTML, '<div><div>3</div><div>2</div></div>');
});

test.serial('Recursive non-wild change', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('test.*', (_, { values }) => values.map(val => <div>{val}</div>))}
  </div>;
  dd.append(document.body, view);
  dd.set('test', { one: { a: 1 }, two: { a: 2 } });
  t.is(document.body.innerHTML, '<div><div>{"a":1}</div><div>{"a":2}</div></div>');
  dd.set('test.one', { a: 3 });
  t.is(document.body.innerHTML, '<div><div>{"a":3}</div><div>{"a":2}</div></div>');
  dd.set('test.one.a', 4);
  t.is(document.body.innerHTML, '<div><div>{"a":3}</div><div>{"a":2}</div></div>');
});

test.serial('Filter array', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('users.$id', user => <span>{user.name}</span>)
      .filter(user => user.name !== 'One!')}
  </div>;
  dd.append(document.body, view);
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(document.body.innerHTML, '<div><span>Two!</span></div>');
});
