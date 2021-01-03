import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import { godMode } from '../src';

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

test('hello godMode', async t => {
  const { get, data } = godMode<any>();
  data.katt = ':)';
  t.is(get('katt'), ':)');
});

test('godMode', async t => {
  const { init, React, on, data } = godMode<any>();

  init(element, <div>{on('katt')}</div>);

  data.katt = ':)';
  t.is(await html(), '<div>:)</div>');
  data.katt = ':O';
  t.is(await html(), '<div>:O</div>');
  data.katt = '=D';
  t.is(await html(), '<div>=D</div>');
});

test('godMode 2', async t => {
  const { init, React, on, data } = godMode<any>();

  init(
    element,
    <div>
      {on('users.$.*').map(user => (
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
  const { init, React, on, data } = godMode<any>();

  init(
    element,
    <div>
      {on('users.$.*').map(user => (
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
  const { init, React, on, data } = godMode<any>();
  init(
    element,
    <div>
      {on('users.$.*').map(user => (
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
  const { data } = godMode<any>();
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

  const { path } = godMode<Yes>();

  t.is(
    path(y => y.a),
    'a'
  );
  t.is(
    path(y => y.a.users),
    'a.users'
  );
  t.is(
    path(y => y.a.users['$id']),
    'a.users.$id'
  );
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

  const { path, data } = godMode<Yes>();
  data.a = {
    users: [{ name: 'Yes!' }],
  };

  t.is(
    path(y => y.a),
    'a'
  );
  t.is(
    path<User>(u => u[0]),
    '0'
  );
});

test('pathProxy', t => {
  interface User {
    name: string;
  }

  interface Yes {
    a: {
      users: User[];
    };
  }

  const { path, get, data } = godMode<Yes>();
  data.a = {
    users: [{ name: 'Yes!' }],
  };

  t.deepEqual(get(path(y => y.a)), { users: [{ name: 'Yes!' }] });
  t.deepEqual(get(path(y => y.a.users)), [{ name: 'Yes!' }]);
  t.deepEqual(get(path(y => y.a.users[0])), { name: 'Yes!' });
  t.deepEqual(get(path(y => y.a.users[0].name)), 'Yes!');
});

test('godMode on', async t => {
  const { React, init, data, path, on } = godMode<any>();
  init(element, <div>{on(path(y => y.ok)).map(ok => `res ${ok}`)}</div>);
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

  const { init, React, data, on, path } = godMode<Yes>();
  init(
    element,
    <div>
      {on(path(y => y.a.users['$'])).map<User>(user => (
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

  const { React, init, on, data, path } = godMode<Yes>();
  init(
    element,
    <div>
      {on(path(y => y.a.users['$'])).map((_, { child }) => (
        <span>{on(child(path<User>(u => u.name)))}</span>
      ))}
    </div>
  );
  data.a = { users: [{ name: 'yes' }, { name: 'no' }] };
  t.is(await html(), '<div><span>yes</span><span>no</span></div>');
  data.a.users[0].name = 'OK!';
  t.is(await html(), '<div><span>OK!</span><span>no</span></div>');
});
