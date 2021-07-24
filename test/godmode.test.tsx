import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import domdom from '../src';
import { isProbablyPlainObject } from '../src/dom-stower';

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

test('godMode', async t => {
  const { init, React, don, data } = domdom<any>({});

  init(element, <div>{don('katt')}</div>);

  data.katt = ':)';
  t.is(await html(), '<div>:)</div>');
  data.katt = ':O';
  t.is(await html(), '<div>:O</div>');
  data.katt = '=D';
  t.is(await html(), '<div>=D</div>');
});

test('godMode 2', async t => {
  const { init, React, don, data } = domdom<any>({});

  init(
    element,
    <div>
      {don('users.$.*').map(user => (
        <b>{user.name}</b>
      ))}
    </div>
  );

  data.users = { a: { name: 'hello' }, b: { name: 'world' } };
  t.is(await html(), '<div><b>hello</b><b>world</b></div>');
  data.users.a.name = 'wut';
  t.is(await html(), '<div><b>wut</b><b>world</b></div>');
  data.users.b = { name: 'wat' };
  t.is(await html(), '<div><b>wut</b><b>wat</b></div>');
  data.users.c = { name: ':)' };
  t.is(await html(), '<div><b>wut</b><b>wat</b><b>:)</b></div>');
});

test('godMode 3', async t => {
  const { init, React, don, data } = domdom<any>({});

  init(
    element,
    <div>
      {don('users.$.*').map(user => (
        <b>{user.name}</b>
      ))}
    </div>
  );

  data.users = [{ name: 'hello' }, { name: 'world' }];
  t.is(await html(), '<div><b>hello</b><b>world</b></div>');
  data.users[0].name = 'wut';
  t.is(await html(), '<div><b>wut</b><b>world</b></div>');
  data.users[1] = { name: 'wat' };
  t.is(await html(), '<div><b>wut</b><b>wat</b></div>');
  data.users.push({ name: ':)' });
  t.is(await html(), '<div><b>wut</b><b>wat</b><b>:)</b></div>');
});

test('godMode 4', async t => {
  const { init, React, don, data } = domdom<any>({});
  init(
    element,
    <div>
      {don('users.$.*').map(user => (
        <b>{user.name}</b>
      ))}
    </div>
  );

  data.users = [{ name: 'hello' }, { name: 'world' }];
  data.users.push({ name: ':)' });
  t.is(await html(), '<div><b>hello</b><b>world</b><b>:)</b></div>');
  data.users.push({ name: ':)' });
  t.is(await html(), '<div><b>hello</b><b>world</b><b>:)</b><b>:)</b></div>');
});

test('godMode 5', t => {
  const { data } = domdom<any>({});
  data.users = [{ name: 'hello' }, { name: 'world' }];
  data.users.push({ name: ':)' });
  t.deepEqual(
    JSON.stringify(data),
    JSON.stringify({
      users: [{ name: 'hello' }, { name: 'world' }, { name: ':)' }],
    })
  );
});

test('path', t => {
  interface User {
    name: string;
  }

  interface Yes {
    a: {
      users: User[];
    };
  }

  const { path } = domdom<Yes>({ a: { users: [] } });

  t.is(path().a.$path, 'a');
  t.is(path().a.users.$path, 'a.users');
  t.is(path().a.users['$id'].$path, 'a.users.$id');
});

test('path 2', t => {
  interface User {
    name: string;
  }

  interface Yes {
    a: {
      users: User[];
    };
  }

  const { path, data } = domdom<Yes>({ a: { users: [] } });
  data.a = {
    users: [{ name: 'Yes!' }],
  };

  t.is(path().a.$path, 'a');
  t.is(path().a.users[0].$path, 'a.users.0');
});

test('godMode don', async t => {
  const { React, init, data, path, don } = domdom<any>({});
  init(element, <div>{don(path().ok).map(ok => `res ${ok}`)}</div>);
  t.is(await html(), '<div></div>');
  data.ok = ':)';
  t.is(await html(), '<div>res :)</div>');
});

test('godMode on 2', async t => {
  interface User {
    name: string;
  }

  interface Yes {
    a: {
      users: User[];
    };
  }

  const { init, React, data, don, path } = domdom<Yes>({ a: { users: [] } });
  init(
    element,
    <div>
      {don(path().a.users.$).map<User>(user => (
        <b>{user.name}</b>
      ))}
    </div>
  );
  t.is(await html(), '<div></div>');
  data.a = {
    users: [
      {
        name: 'A!',
      },
      {
        name: 'B!',
      },
    ],
  };
  t.is(await html(), '<div><b>A!</b><b>B!</b></div>');
});

test('godMode on 3', async t => {
  interface User {
    name: string;
  }

  interface Yes {
    a: {
      users: User[];
    };
  }

  const { React, init, don, data, path } = domdom<Yes>({
    a: { users: [] },
  });
  init(
    element,
    <div>
      {don(path().a.users.$).map(u => (
        <span>{don(path(u).name)}</span>
      ))}
    </div>
  );
  data.a = { users: [{ name: 'yes' }, { name: 'no' }] };
  t.is(await html(), '<div><span>yes</span><span>no</span></div>');
  data.a.users[0].name = 'OK!';
  t.is(await html(), '<div><span>OK!</span><span>no</span></div>');
});

test('godMode on 4', async t => {
  interface User {
    name: string;
  }

  interface Yes {
    a: {
      users: User[];
    };
  }

  const { React, init, don, data, path } = domdom<Yes>({
    a: { users: [] },
  });
  init(
    element,
    <div>
      {don(path().a.users.$).map(user => (
        <span>{don(path(user).name)}</span>
      ))}
    </div>
  );
  data.a = { users: [{ name: 'yes' }, { name: 'no' }] };
  t.is(await html(), '<div><span>yes</span><span>no</span></div>');
  data.a.users[0].name = 'OK!';
  t.is(await html(), '<div><span>OK!</span><span>no</span></div>');
});

test('array is hacked for now', async t => {
  interface User {
    name: string;
  }

  interface Data {
    users: User[];
  }

  const { React, init, don, data, path } = domdom<Data>({
    users: [],
  });
  init(
    element,
    <ul>
      {don(path().users['$id']).map<User>(user => (
        <li>{user.name}</li>
      ))}
    </ul>
  );
  data.users = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
  t.is(await html(), '<ul><li>A</li><li>B</li><li>C</li></ul>');
  data.users = [{ name: 'A' }, { name: 'C' }];
  t.is(await html(), '<ul><li>A</li><li>C</li></ul>');
  data.users = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
  t.is(await html(), '<ul><li>A</li><li>B</li><li>C</li></ul>');
  data.users.splice(1, 1);
  t.is(await html(), '<ul><li>A</li><li>C</li></ul>');
});

test('trigger', t => {
  const { on, path, trigger } = domdom<any>({});
  on('=', path().a.b.c, val => {
    t.is(val, 'Yes!');
  });
  trigger(path().a.b.c, 'Yes!');
});

test('on noGod', t => {
  const { on, set } = domdom({});
  on('!+*', 'users.$', (_, { child }) => {
    set(child('child'), { name: 'Child!' });
  });
  on('!+*', 'users.$.child', user => {
    t.is(user.name, 'Child!');
  });

  set('users', [{ name: 'Yes!' }]);
});

test('on change', t => {
  interface User {
    name: string;
    child?: User;
  }

  interface Data {
    users: User[];
  }

  const { data, path, on } = domdom<Data>({
    users: [],
  });

  on<User>('!+*', path().users.$, u => {
    u.child = { name: 'Child!' };
  });
  on<User>('!+*', path().users.$.child!, user => {
    t.is(user.name, 'Child!');
  });

  data.users = [{ name: 'Yes!' }];
});

test('proxified objects are probably objects', t => {
  const { data } = domdom<any>({});
  const eh = { hello: 'world' };
  data.eh = eh;
  t.true(isProbablyPlainObject(eh));
  t.true(isProbablyPlainObject(data.eh));
});

test('on object', async t => {
  const { init, React, data, don } = domdom<any>({});

  init(element, <div>{don('eh')}</div>);
  data.eh = 'eh';
  t.is(await html(), '<div>eh</div>');
  data.eh = { hello: 'world' };
  t.is(await html(), '<div>{"hello":"world"}</div>');
});

test('pathus', async t => {
  interface Role {
    level: number;
  }

  interface User {
    name: string;
    child?: User;
    role: Role;
  }

  interface Data {
    users: User[];
  }

  const { path } = domdom<Data>({
    users: [],
  });

  t.is(path().users.$path, 'users');
  t.is(path().users[0].$path, 'users.0');
  t.is(path().users.$$.ok.$path, 'users.$ok');
  t.is(path().users[0].$.$path, 'users.0.$');
  t.is(path().users.$.name.$path, 'users.$.name');
  t.is(path().users.$$.ok.name.$path, 'users.$ok.name');
  t.is(path().users.$x.$path, 'users.*');
  t.is(path().users.$xx.$path, 'users.**');
});

test('setting initial data', async t => {
  interface Data {
    hello: string;
  }

  const { React, init, don, path } = domdom<Data>({
    hello: ':)',
  });

  init(element, <div>{don(path().hello)}</div>);
  t.is(await html(), '<div>:)</div>');
});
