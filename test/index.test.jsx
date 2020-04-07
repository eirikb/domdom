import { serial as test } from 'ava';
import browserEnv from 'browser-env';

browserEnv();
import domdom from '../src';

test.beforeEach(() => {
  document.body.innerHTML = '';
});

test('Double on', t => {
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

test('on without callback', t => {
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

test('Multiple paths', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players.$id', player => <p>{player.name}</p>)}
  </div>;
  dd.append(document.body, div);
  t.is(document.body.innerHTML, '<div></div>');

  dd.set('players.aone', { name: 'Mr. one' });
  t.is(document.body.innerHTML, '<div><p>Mr. one</p></div>');

  dd.set('players.btwo', { name: 'Mr. two' });
  t.is(document.body.innerHTML, '<div><p>Mr. one</p><p>Mr. two</p></div>');

  dd.set('players.aone', { name: 'Hello' });
  t.is(document.body.innerHTML, '<div><p>Mr. two</p><p>Hello</p></div>');

  dd.unset('players.aone');
  t.is(document.body.innerHTML, '<div><p>Mr. two</p></div>');
});

test('Multiple paths map', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players').map(player => <p>{player.name}</p>)}
  </div>;
  dd.append(document.body, div);
  t.is(document.body.innerHTML, '<div></div>');

  dd.set('players.aone', { name: 'Mr. one' });
  t.is(document.body.innerHTML, '<div><p>Mr. one</p></div>');

  dd.set('players.btwo', { name: 'Mr. two' });
  t.is(document.body.innerHTML, '<div><p>Mr. one</p><p>Mr. two</p></div>');

  dd.set('players.aone', { name: 'Hello' });
  t.is(document.body.innerHTML, '<div><p>Hello</p><p>Mr. two</p></div>');

  dd.unset('players.aone');
  t.is(document.body.innerHTML, '<div><p>Mr. two</p></div>');
});

test('on Sort - default sort by key', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players').map(player => <p>{player.name}</p>)}
  </div>;
  dd.append(document.body, div);
  dd.set('players.aone', { name: '1' });
  dd.set('players.btwo', { name: '2' });
  dd.set('players.cthree', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('on Sort - sort method', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players').map(player => <p>{player.name}</p>)
      .sort((a, b) => b.name.localeCompare(a.name))}
  </div>;
  dd.append(document.body, div);
  dd.set('players.aone', { name: '1' });
  dd.set('players.btwo', { name: '2' });
  dd.set('players.cthree', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>3</p><p>2</p><p>1</p></div>');
});

test('on Sort - sort method2', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players').map(player =>
      <p>{player.name}</p>, (a, b) => a.name.localeCompare(b.name)
    ).sort((a, b) => a.name.localeCompare(b.name))}
  </div>;
  dd.append(document.body, div);
  dd.set('players.aone', { name: '1' });
  dd.set('players.btwo', { name: '2' });
  dd.set('players.cthree', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('Multiple on-siblings', t => {
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

test('on Sort - keep order', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players').map(player => <p>{player.name}</p>)}
  </div>;
  dd.append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');

  dd.unset('players.1');
  t.is(document.body.innerHTML, '<div><p>2</p><p>3</p></div>');

  dd.set('players.1', { name: '1' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('on Sort - custom order', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players').map(player => <p>{player.name}</p>)
      .sort((a, b) => b.name.localeCompare(a.name))}
  </div>;
  dd.append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>3</p><p>2</p><p>1</p></div>');

  dd.unset('players.1');
  t.is(document.body.innerHTML, '<div><p>3</p><p>2</p></div>');

  dd.set('players.1', { name: '7' });
  t.is(document.body.innerHTML, '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('on Sort - remove $first - with sort', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players').map(player => <p>{player.name}</p>,
      (a, b, aPath, bPath) => aPath.localeCompare(bPath)
    )}
  </div>;
  dd.append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');

  dd.unset('players.1');
  t.is(document.body.innerHTML, '<div><p>2</p><p>3</p></div>');

  dd.set('players.1', { name: '1' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
});

test('Child listener', t => {
  const dd = domdom();
  const div = ({ on }) => <main>
    {on('players.$id', () => <article>
      {on('>.name', name => name)}
    </article>)}
  </main>;
  dd.append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(document.body.innerHTML, '<main><article>1</article><article>2</article><article>3</article></main>');
});

test('Simple when', t => {
  const dd = domdom();

  function Test({ on }) {
    return <div>{on('test', t => t)}</div>
  }

  const div = ({ when }) => <div>
    {when('test', [
      'yes', t => `Yes is ${t}`,
      () => true, () => <div>Yes!</div>,
      () => true, () => <Test/>,
    ])}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>Yes is yes<div>Yes!</div><div>yes</div></div>');
});

test('Many whens', t => {
  const dd = domdom();
  const div = ({ when }) => <div>
    {when('test', [
      'yes', t => t,
      'no', t => t,
      true, () => 'Yes!',
      () => true, () => 'true',
      t => t === 'yes', () => 't === yes',
      'yes', () => <div>hello</div>,
      'yes', () => <div>world</div>
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

test('Quirk on + when', t => {
  const dd = domdom();
  const div = ({ on, when }) => <div>
    {on('test', t => t)}

    {when('test', [
      'yes', () => 'Yes',
      'no', () => 'No'
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

test('Simple or', t => {
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

test('on empty res', t => {
  const dd = domdom();
  const div = ({ on }) => <div>{on('test')}</div>;
  dd.append(document.body, div);
  dd.set('test', 'Hello');
  t.is(document.body.innerHTML, '<div>Hello</div>');
  dd.set('test', '');
  t.is(document.body.innerHTML, '<div></div>');
});

test('Multiple child paths', t => {
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

test('Have some path with flags', t => {
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

test('Listeners are cleared', t => {
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

test('Listeners are not overcleared', t => {
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

test('Listeners are support change of parent', t => {
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

test('Listeners in when', t => {
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

test('Listener in when 2', t => {
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

test('Mounted', t => {
  const dd = domdom();
  t.plan(1);

  function Hello({ mounted }) {
    mounted(() => t.pass());
    return <div/>;
  }

  const div = () => <div><Hello/></div>;
  dd.append(document.body, div);
});

test('Mounted on/off', t => {
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

test('When with initial false value', t => {
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

test('Do not remove listener on same level', t => {
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

test('Whole objects should be populated', t => {
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

test('Update array', t => {
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

test('Update array without element', t => {
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

test('Containment', t => {
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

test('Rendering types', t => {
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

test('Remove or on on', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('test.$id', t => t.name).or('Loading...')}
  </div>;
  dd.append(document.body, view);
  t.is(document.body.innerHTML, '<div>Loading...</div>');
  dd.set('test', { 0: { name: 'hello' } });
  t.is(document.body.innerHTML, '<div>hello</div>');
});

test('on attributes', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    <button disabled={on('disable', res => res)}/>
  </div>;

  dd.append(document.body, view);

  t.is(document.body.innerHTML, '<div><button></button></div>');
  dd.set('disable', true);
  t.is(document.body.innerHTML, '<div><button disabled=""></button></div>');
});

test('on on attributes', t => {
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

test('on on attributes or', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    <button disabled={on('canNotClick').or(true)}/>
  </div>;

  dd.append(document.body, view);

  t.is(document.body.innerHTML, '<div><button disabled=""></button></div>');

  dd.set('canNotClick', false);
  t.is(document.body.innerHTML, '<div><button></button></div>');

  dd.unset('canNotClick');
  t.is(document.body.innerHTML, '<div><button disabled=""></button></div>');
});

test('On on object attributes', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    <p style={on('style')}>Test</p>
  </div>;

  dd.append(document.body, view);
  dd.set('style', { color: 'red' });
  t.is(document.body.innerHTML, '<div><p style="color: red;">Test</p></div>');
});

test('Filter array', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('users').map(user => <span>{user.name}</span>)
      .filter(user => user.name !== 'One!')}
  </div>;
  dd.append(document.body, view);
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(document.body.innerHTML, '<div><span>Two!</span></div>');
});

test('Update filter on update filter', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('users').map(user => <span>{user.name}</span>)
      .filter(user => user.name !== 'One!')}
  </div>;
  dd.append(document.body, view);
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(document.body.innerHTML, '<div><span>Two!</span></div>');
});

test('Update filterOn on update filter', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('users')
      .map(user => <span>{user.name}</span>)
      .filterOn('test', (filter, user) => user.name !== 'One!')}
  </div>;
  dd.append(document.body, view);
  dd.set('test', { search: 'it' });
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(document.body.innerHTML, '<div><span>Two!</span></div>');
});

test('Update filterOn on update filter refresh', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('users')
      .map(user => <span>{user.name}</span>)
      .filterOn('test', (filter, user) => user.name !== 'One!')}
  </div>;
  dd.append(document.body, view);
  dd.set('test', { search: 'it' });
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(document.body.innerHTML, '<div><span>Two!</span></div>');
});

test('Update filterOn on update after data is set', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('users')
      .map(user => <a>{user.name}</a>)
      .filterOn('test', (filter, user) =>
        new RegExp(filter, 'i').test(user.name)
      )}
  </div>;
  dd.append(document.body, view);
  dd.set('test', '');
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(document.body.innerHTML, '<div><a>One!</a><a>Two!</a></div>');
  dd.set('test', 'two');
  t.is(document.body.innerHTML, '<div><a>Two!</a></div>');
});

test('on sortOn - custom order', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players')
      .map(player => <p>{player.name}</p>)
      .sortOn('test', (val, a, b) => b.name.localeCompare(a.name))}
  </div>;
  dd.append(document.body, div);
  dd.set('test', 'yes');
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  t.is(document.body.innerHTML, '<div><p>3</p><p>2</p><p>1</p></div>');

  dd.unset('players.1');
  t.is(document.body.innerHTML, '<div><p>3</p><p>2</p></div>');

  dd.set('players.1', { name: '7' });
  t.is(document.body.innerHTML, '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('on sortOn - custom order update', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players')
      .map(player => <p>{player.name}</p>)
      .sortOn('test', (val, a, b) => b.name.localeCompare(a.name))}
  </div>;
  dd.append(document.body, div);
  dd.set('players.1', { name: '1' });
  dd.set('players.2', { name: '2' });
  dd.set('players.3', { name: '3' });
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div><p>3</p><p>2</p><p>1</p></div>');

  dd.unset('players.1');
  t.is(document.body.innerHTML, '<div><p>3</p><p>2</p></div>');

  dd.set('players.1', { name: '7' });
  t.is(document.body.innerHTML, '<div><p>7</p><p>3</p><p>2</p></div>');
});

test('onFilter and onSort', t => {
  const dd = domdom();
  const div = ({ on }) => <div>
    {on('players')
      .map(player => <p>{player.name}</p>)
      .sortOn('filter.by', (val, a, b) => a[val].localeCompare(b[val])
      )}
  </div>;
  dd.set('filter.by', 'name');
  dd.append(document.body, div);
  dd.set('players.1', { name: '1', age: '3' });
  dd.set('players.2', { name: '2', age: '2' });
  dd.set('players.3', { name: '3', age: '1' });
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
  dd.set('filter.by', 'age');
  t.is(document.body.innerHTML, '<div><p>3</p><p>2</p><p>1</p></div>');
});

test('Function context', t => {
  const dd = domdom();

  function App() {
    return <div>:)</div>;
  }

  const div = () => <div>
    <App/>
  </div>;
  dd.append(document.body, div);
  t.is(document.body.innerHTML, '<div><div>:)</div></div>');
});

test('Function context when when', t => {
  const dd = domdom();

  function App() {
    return <div>:)</div>;
  }

  const div = ({ when }) => <div>
    {when('test', [
      true, () => <App/>,
      true, () => <App/>
    ])}
  </div>;
  dd.append(document.body, div);
  dd.set('test', true);
  t.is(document.body.innerHTML, '<div><div>:)</div><div>:)</div></div>');
});

test('filterOn and back', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('users')
      .map(user => <a>{user.name}</a>)
      .filterOn('test', (filter, user) =>
        new RegExp(filter, 'i').test(user.name)
      )}
    <p>Because</p>
  </div>;
  dd.append(document.body, view);
  dd.set('test', '');
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(document.body.innerHTML, '<div><a>One!</a><a>Two!</a><p>Because</p></div>');
  dd.set('test', 'two');
  t.is(document.body.innerHTML, '<div><a>Two!</a><p>Because</p></div>');
  dd.set('test', '');
  t.is(document.body.innerHTML, '<div><a>One!</a><a>Two!</a><p>Because</p></div>');
});

test('When + change', t => {
  const dd = domdom();
  const view = ({ when, on }) => <div>
    {when('yes', [
      true, () => <p>{on('ok')}</p>
    ])}
  </div>;
  dd.append(document.body, view);
  dd.set('yes', true);
  dd.set('yes', false);
  dd.set('yes', true);
  dd.set('ok', 'OK!');
  t.is(document.body.innerHTML, '<div><p>OK!</p></div>');
});

test('When + change 2', t => {
  const dd = domdom();
  const view = ({ when, on }) => <div>
    {when('yes', [
      true, () => <p>{on('ok')}</p>
    ])}
  </div>;

  dd.append(document.body, view);
  dd.set('yes', true);
  dd.set('yes', false);
  dd.set('ok', 'OK!');
  dd.set('yes', true);
  t.is(document.body.innerHTML, '<div><p>OK!</p></div>');
});

test('When + filterOn', t => {
  const dd = domdom();
  const view = ({ when, on }) => <div>
    {when('yes', [
      true, () => <div>
        {on('users')
          .map(user => <a>{user.name}</a>)
          .filterOn('test', (filter, user) =>
            new RegExp(filter, 'i').test(user.name)
          )}
        <p>Because</p>
      </div>
    ])}
  </div>;
  dd.append(document.body, view);
  dd.set('test', 'two');
  dd.set('yes', true);
  dd.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is(document.body.innerHTML, '<div><div><a>Two!</a><p>Because</p></div></div>');
  dd.set('yes', false);
  t.is(document.body.innerHTML, '<div></div>');
  dd.set('yes', true);
  dd.set('test', '');
  t.is(document.body.innerHTML, '<div><div><a>One!</a><a>Two!</a><p>Because</p></div></div>');
});

test('Re-add', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('yes', t => <p>{t} {on('no')}</p>)}
  </div>;
  dd.append(document.body, view);
  dd.set('yes', 'Yes!');
  dd.set('no', 'No!');
  t.is(document.body.innerHTML, '<div><p>Yes! No!</p></div>');
  dd.unset('yes');
  dd.set('no', 'Well!');
  dd.set('yes', 'OK!');
  t.is(document.body.innerHTML, '<div><p>OK! Well!</p></div>');
});

test('Something something filter and add', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('users')
      .map(u => <p>{u} {on('yes')}</p>)
      .filterOn('filter', f => f)}
  </div>;
  dd.append(document.body, view);
  dd.set('filter', true);
  dd.set('yes', 'y');
  dd.set('users', {
    one: 'o',
    two: 't'
  });
  t.is(document.body.innerHTML, '<div><p>o y</p><p>t y</p></div>');
  dd.set('filter', false);
  t.is(document.body.innerHTML, '<div></div>');
  dd.set('yes', 'n');
  dd.set('filter', true);
  t.is(document.body.innerHTML, '<div><p>o n</p><p>t n</p></div>');
});

test('Simplest', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('yes', () => <p>{on('no')}</p>)}
  </div>;
  dd.append(document.body, view);
  dd.set('yes', true);
  dd.set('no', 'n');
  t.is(document.body.innerHTML, '<div><p>n</p></div>');
  dd.set('no', 'n');
});

test('filterOn mounted destroy mounted', t => {
  const dd = domdom();
  const view = ({ when, on }) => <div>
    {when('yes', [
      true, () => <div>{on('users')
        .map(u => u.name)
        .filterOn('filter', (f, u) => f === u.name)}</div>
    ])}
  </div>;
  dd.set('yes', true);
  dd.set('filter', 'one');
  dd.set('users.1', { name: 'one', test: 'yes' });
  dd.set('users.2', { name: 'two' });

  dd.append(document.body, view);
  t.is(document.body.innerHTML, '<div><div>one</div></div>');

  dd.set('yes', false);
  t.is(document.body.innerHTML, '<div></div>');

  dd.set('yes', true);
  t.is(document.body.innerHTML, '<div><div>one</div></div>');
});

test('When + filterOn const element', t => {
  const dd = domdom();
  const view = ({ when, on }) => <div>
    {when('show', [
      true, () => <div>
        {on('users')
          .map(task => <p>{task.name}</p>)
          .filterOn('filter', (filter, row) => row.name === filter)}
      </div>
    ])}
  </div>;
  dd.append(document.body, view);
  dd.set('users', { 1: { name: 'a' }, 2: { name: 'b' } });
  dd.set('show', true);
  dd.set('filter', 'a');
  dd.set('show', false);
  dd.set('show', true);
  t.deepEqual(document.body.innerHTML, '<div><div><p>a</p></div></div>');
});

test('When + filterOn const text', t => {
  const dd = domdom();
  const view = ({ when, on }) => <div>
    {when('show', [
      true, () => <div>
        {on('users')
          .map(task => task.name)
          .filterOn('filter', (filter, row) => row.name === filter)}
      </div>
    ])}
  </div>;
  dd.append(document.body, view);
  dd.set('users', { 1: { name: 'a' }, 2: { name: 'b' } });
  dd.set('show', true);
  dd.set('filter', 'a');
  dd.set('show', false);
  dd.set('show', true);
  t.deepEqual(document.body.innerHTML, '<div><div>a</div></div>');
});

test('On child attribute listener', t => {
  const dd = domdom();

  function Yes({ on }) {
    return <a href={on('>.link')}>test</a>
  }

  const view = ({ on }) => <div>
    {on('yes', ok =>
      <div>{ok.text} <Yes/></div>
    )}
  </div>;
  dd.append(document.body, view);
  dd.set('yes', {
    link: 'nrk.no',
    text: 'Some link:'
  });
  t.is(document.body.innerHTML, '<div><div>Some link: <a>test</a></div></div>');
});

test('Same listener twice no problem', t => {
  const dd = domdom();
  const view = ({ on }) => <div>
    {on('test', t1 => <div>
        {t1} and {on('test')}
      </div>
    )}
  </div>;
  dd.append(document.body, view);
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div><div>yes and yes</div></div>');
});

test('Same listener twice no problem on when', t => {
  function Yes({ when }) {
    return <div>{when('test', [
      'yes', () => 'OK!'
    ])}
    </div>;
  }

  const dd = domdom();
  const view = ({ on, when }) => <div>
    {when('test', [
      'yes', () => <Yes/>
    ])}
  </div>;
  dd.append(document.body, view);
  dd.set('test', 'yes');
  t.is(document.body.innerHTML, '<div><div>OK!</div></div>');
});
