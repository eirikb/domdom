import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import { Domdom } from '../src/domdom';
import { Data } from '@eirikb/data';

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

let { init, React, get, on, godMode } = new Domdom(new Data());

test.beforeEach(() => {
  createElement();
  const d = new Domdom(new Data());
  init = d.init;
  React = d.React;
  get = d.get;
  on = d.on;
  godMode = d.godMode;
});

test('hello godMode', async t => {
  const { data } = godMode<any>();
  data.katt = ':)';
  t.is(get('katt'), ':)');
});

test('godMode', async t => {
  init(element, <div>{on('katt')}</div>);

  const { data } = godMode<any>();
  data.katt = ':)';
  t.is(await html(), '<div>:)</div>');
  data.katt = ':O';
  t.is(await html(), '<div>:O</div>');
  data.katt = '=D';
  t.is(await html(), '<div>=D</div>');
});

test('godMode 2', async t => {
  init(
    element,
    <div>
      {on('users.$.*').map(user => (
        <b>{user.name}</b>
      ))}
    </div>
  );

  const { data } = godMode<any>();
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
  init(
    element,
    <div>
      {on('users.$.*').map(user => (
        <b>{user.name}</b>
      ))}
    </div>
  );

  const { data } = godMode<any>();
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
  init(
    element,
    <div>
      {on('users.$.*').map(user => (
        <b>{user.name}</b>
      ))}
    </div>
  );

  const { data } = godMode<any>();
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

test('pathOf', t => {
  interface User {
    name: string;
  }

  interface Yes {
    a: {
      users: User[];
    };
  }

  const { pathOf } = godMode<Yes>();
  t.is(
    pathOf(y => y.a),
    'a'
  );
  t.is(
    pathOf(y => y.a.users),
    'a.users'
  );
  t.is(
    pathOf(y => y.a.users['$id']),
    'a.users.$id'
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

  const { data, pathOf } = godMode<Yes>();
  data.a = {
    users: [{ name: 'Yes!' }],
  };

  t.deepEqual(get(pathOf(y => y.a)), { users: [{ name: 'Yes!' }] });
  t.deepEqual(get(pathOf(y => y.a.users)), [{ name: 'Yes!' }]);
  t.deepEqual(get(pathOf(y => y.a.users[0])), { name: 'Yes!' });
  t.deepEqual(get(pathOf(y => y.a.users[0].name)), 'Yes!');
});

test('godMode on', async t => {
  const { data, pathOf } = godMode<any>();
  init(element, <div>{on(pathOf(y => y.ok)).map(ok => `res ${ok}`)}</div>);
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

  const { data, pathOf } = godMode<Yes>();
  init(
    element,
    <div>
      {on(pathOf(y => y.a.users['$'])).map<User>(user => (
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

  const { data, pathOf } = godMode<Yes>();
  init(
    element,
    <div>
      {on(pathOf(y => y.a.users['$'])).map((_, { child }) => (
        <span>{on(child(pathOf<User>(u => u.name)))}</span>
      ))}
    </div>
  );
  data.a = { users: [{ name: 'yes' }, { name: 'no' }] };
  t.is(await html(), '<div><span>yes</span><span>no</span></div>');
  data.a.users[0].name = 'OK!';
  t.is(await html(), '<div><span>OK!</span><span>no</span></div>');
});
