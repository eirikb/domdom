import { serial as test } from 'ava';
import { Hodor } from '../src/hodor';
import { DomStower } from '../src/dom-stower';
import { Domdom } from '../src/domdom';
import { Data } from '@eirikb/data';

// @ts-ignore
import browserEnv from 'browser-env';

browserEnv();

let data = new Data();
let element = document.createElement('div');
let stower = new DomStower(element);
let { React, init } = new Domdom(new Data());

function html() {
  return element.outerHTML;
}

test.beforeEach(() => {
  data = new Data();
  element = document.createElement('div');
  stower = new DomStower(element);
  const dd = new Domdom(new Data());
  React = dd.React;
  init = dd.init;
  init(element);
});

function setup(hodor: Hodor) {
  hodor.stower(0, stower);
  hodor.mounted();
}

test('Hold door', t => {
  setup(new Hodor(data, 'yes'));
  data.set('yes', 'sir');
  t.deepEqual('<div>sir</div>', html());
});

test('Hold door2', t => {
  setup(new Hodor(data, 'yes', (v: any) => v));
  data.set('yes', 'no');
  t.deepEqual('<div>no</div>', html());
});

test('No listener default to showing value', t => {
  setup(new Hodor(data, 'yes'));
  data.set('yes', 'yes');
  t.deepEqual('<div>yes</div>', html());
});

test('No listener default to showing value as json', t => {
  setup(new Hodor(data, 'yes'));
  data.set('yes', { hello: 'world' });
  t.deepEqual('<div>{"hello":"world"}</div>', html());
});

test('Listener with JSX', t => {
  setup(new Hodor(data, 'yes', (yes: any) => <h1>{yes}</h1>));
  data.set('yes', { hello: 'world' });
  t.deepEqual('<div><h1>{"hello":"world"}</h1></div>', html());
});

test('With named card', t => {
  setup(new Hodor(data, 'users.$id'));
  data.set('users', {
    a: 'mr a',
    b: 'mr b',
  });
  t.deepEqual('<div>mr amr b</div>', html());
});

test('With named card add remove', t => {
  setup(new Hodor(data, 'users.$id', (u: any) => <p>{u}</p>));
  data.set('users', {
    a: 'mr a',
    b: 'mr b',
    c: 'mr c',
  });
  t.deepEqual('<div><p>mr a</p><p>mr b</p><p>mr c</p></div>', html());
  data.unset('users.b');
  t.deepEqual('<div><p>mr a</p><p>mr c</p></div>', html());
  data.set('users.b', 'mr B!');
  t.deepEqual('<div><p>mr a</p><p>mr c</p><p>mr B!</p></div>', html());
  data.unset('users.a');
  t.deepEqual('<div><p>mr c</p><p>mr B!</p></div>', html());
  data.set('users.d', 'mr d');
  t.deepEqual('<div><p>mr c</p><p>mr B!</p><p>mr d</p></div>', html());
});

test('Map', t => {
  setup(new Hodor(data, 'users').map(u => u));
  data.set('users', {
    a: 'mr a',
    b: 'mr b',
  });
  t.deepEqual('<div>mr amr b</div>', html());
});

test('Map jsx', t => {
  setup(new Hodor(data, 'users').map(u => <p>{u}</p>));
  data.set('users', {
    a: 'mr a',
    b: 'mr b',
  });
  t.deepEqual('<div><p>mr a</p><p>mr b</p></div>', html());
});

test('Map add', t => {
  setup(new Hodor(data, 'users.*').map(u => u));
  data.set('users', {
    a: 'mr a',
    b: 'mr b',
  });
  t.deepEqual('<div>mr amr b</div>', html());
  data.set('users.c', 'mr c');
  t.deepEqual('<div>mr amr bmr c</div>', html());
});

test('Map add default sort', t => {
  setup(new Hodor(data, 'users.*').map(u => u));
  data.set('users', {
    a: 'mr a',
    c: 'mr c',
  });
  t.deepEqual('<div>mr amr c</div>', html());
  data.set('users.b', 'mr b');
  t.deepEqual('<div>mr amr bmr c</div>', html());
});

test('Map filter', t => {
  setup(new Hodor(data, 'users').map(u => u).filter(u => u !== 'mr b'));
  data.set('users', {
    a: 'mr a',
    b: 'mr b',
    c: 'mr c',
  });
  t.deepEqual('<div>mr amr c</div>', html());
});

test('Update filterOn on update after data is set', t => {
  setup(
    new Hodor(data, 'users')
      .map(user => user)
      .filterOn('test', (filter, user) => new RegExp(filter, 'i').test(user))
  );
  data.set('test', '');
  data.set('users', { a: 'a', b: 'b' });
  t.is('<div>ab</div>', html());
  data.set('test', 'b');
  t.is('<div>b</div>', html());
});

test('on sortOn - custom order', t => {
  setup(
    new Hodor(data, 'players.*')
      .map(player => <p>{player.name}</p>)
      .sortOn('test', (_, a, b) => b.name.localeCompare(a.name))
  );
  data.set('test', 'yes');
  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  t.is('<div><p>3</p><p>2</p><p>1</p></div>', html());
  data.unset('players.1');
  t.is('<div><p>3</p><p>2</p></div>', html());
  data.set('players.1', { name: '7' });
  t.is('<div><p>7</p><p>3</p><p>2</p></div>', html());
});

test('filterOn and back', t => {
  setup(
    new Hodor(data, 'users')
      .map(user => <b>{user.name}</b>)
      .filterOn('test', (filter, user) =>
        new RegExp(filter, 'i').test(user.name)
      )
  );

  data.set('test', '');
  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.is('<div><b>One!</b><b>Two!</b></div>', html());

  data.set('test', 'two');
  t.is('<div><b>Two!</b></div>', html());

  data.set('test', '');
  t.is('<div><b>One!</b><b>Two!</b></div>', html());
  t.pass();
});

test('on sortOn - custom order update', t => {
  setup(
    new Hodor(data, 'players.*')
      .map(player => <p>{player.name}</p>)
      .sortOn('test', (_, a, b) => b.name.localeCompare(a.name))
  );

  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  data.set('test', 'yes');
  t.is('<div><p>3</p><p>2</p><p>1</p></div>', html());

  data.unset('players.1');
  t.is('<div><p>3</p><p>2</p></div>', html());

  data.set('players.1', { name: '7' });
  t.is('<div><p>7</p><p>3</p><p>2</p></div>', html());
});

test('onFilter and onSort', t => {
  setup(
    new Hodor(data, 'players.*')
      .map(player => <p>{player.name}</p>)
      .sortOn('filter.by', (val, a, b) => a[val].localeCompare(b[val]))
  );
  data.set('filter.by', 'name');
  data.set('players.1', { name: '1', age: '3' });
  data.set('players.2', { name: '2', age: '2' });
  data.set('players.3', { name: '3', age: '1' });
  t.is('<div><p>1</p><p>2</p><p>3</p></div>', html());
  data.set('filter.by', 'age');
  t.is('<div><p>3</p><p>2</p><p>1</p></div>', html());
  t.pass();
});

test('Pathifier sub-array', t => {
  setup(new Hodor(data, 'players').map(player => player.name));
  data.set('players', [{ name: 'a' }, { name: 'b' }]);
  t.is(html(), '<div>ab</div>');
  data.set('players', [{ name: 'a', x: [1] }]);
  t.is(html(), '<div>a</div>');
});

test('Pathifier then', t => {
  setup(
    new Hodor(data, 'players').then(players =>
      t.deepEqual(players, { a: { name: 'A' }, b: { name: 'B' } })
    )
  );
  data.set('players', { a: { name: 'A' }, b: { name: 'B' } });
});
