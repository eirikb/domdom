import test from 'ava';
import Hodor from '../src/hodor';
import Data from '@eirikb/data';
import Stower from '../src/stower';
import domdom from '../src';

import browserEnv from 'browser-env';

browserEnv();
// Globalify domdom
domdom();

function setup(path, listener) {
  const data = Data();
  const element = document.createElement('div');
  const stower = Stower(element);
  const hodor = Hodor(data, path, listener);
  hodor.stower(0, stower);
  const html = () => element.outerHTML;
  hodor.mount = () => {
    hodor.mounted();
    return { data, element, stower, html };
  };
  return hodor;
}

test('Hold door', t => {
  const { data, html } = setup('yes', v => v).mount();
  data.set('yes', 'sir');
  t.deepEqual('<div>sir</div>', html());
});

test('Hold door2', t => {
  const { data, html } = setup('yes', v => v).mount();
  data.set('yes', 'no');
  t.deepEqual('<div>no</div>', html());
});

test('No listener default to showing value', t => {
  const { data, html } = setup('yes').mount();
  data.set('yes', 'yes');
  t.deepEqual('<div>yes</div>', html());
});

test('No listener default to showing value as json', t => {
  const { data, html } = setup('yes').mount();
  data.set('yes', { hello: 'world' });
  t.deepEqual('<div>{"hello":"world"}</div>', html());
});

test('Listener with JSX', t => {
  const { data, html } = setup('yes', yes => <h1>{yes}</h1>).mount();
  data.set('yes', { hello: 'world' });
  t.deepEqual('<div><h1>{"hello":"world"}</h1></div>', html());
});

test('With named card', t => {
  const { data, html } = setup('users.$id').mount();
  data.set('users', {
    a: 'mr a',
    b: 'mr b'
  });
  t.deepEqual('<div>mr amr b</div>', html());
});

test('With named card add remove', t => {
  const { data, html } = setup('users.$id', u => <p>{u}</p>).mount();
  data.set('users', {
    a: 'mr a',
    b: 'mr b',
    c: 'mr c'
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
  const { data, html } = setup('users').map(u => u).mount();
  data.set('users', {
    a: 'mr a',
    b: 'mr b'
  });
  t.deepEqual('<div>mr amr b</div>', html());
});

test('Map jsx', t => {
  const { data, html } = setup('users').map(u => <p>{u}</p>).mount();
  data.set('users', {
    a: 'mr a',
    b: 'mr b'
  });
  t.deepEqual('<div><p>mr a</p><p>mr b</p></div>', html());
});

test('Map add', t => {
  const { data, html } = setup('users').map(u => u).mount();
  data.set('users', {
    a: 'mr a',
    b: 'mr b'
  });
  t.deepEqual('<div>mr amr b</div>', html());
  data.set('users.c', 'mr c');
  t.deepEqual('<div>mr amr bmr c</div>', html());
});

test('Map add default sort', t => {
  const { data, html } = setup('users').map(u => u).mount();
  data.set('users', {
    a: 'mr a',
    c: 'mr c'
  });
  t.deepEqual('<div>mr amr c</div>', html());
  data.set('users.b', 'mr b');
  t.deepEqual('<div>mr amr bmr c</div>', html());
});

test('Map filter', t => {
  const { data, html } = setup('users').map(u => u).filter(u => u !== 'mr b').mount();
  data.set('users', {
    a: 'mr a',
    b: 'mr b',
    c: 'mr c'
  });
  t.deepEqual('<div>mr amr c</div>', html());
});
