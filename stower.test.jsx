import test from 'ava';
import browserEnv from 'browser-env';
import Stower from './src/stower';

browserEnv();

test.beforeEach(t => {
  t.context.element = document.createElement('div');
  t.context.stower = new Stower(t.context.element);
  t.context.a = document.createElement('a');
  t.context.b = document.createElement('b');
  t.context.c = document.createElement('c');
  t.context.span = document.createElement('span');
  t.context.div = document.createElement('div');
});

test('add', t => {
  const { element, stower, div } = t.context;
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div>');
});

test('add by index', t => {
  const { element, stower, div, span } = t.context;
  stower.add(span, 1);
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
});

test('add by index 2', t => {
  const { element, stower, div, span, b } = t.context;
  stower.add(b, 3);
  stower.add(div, 0);

  t.deepEqual(element.innerHTML, '<div></div><b></b>');

  stower.add(span, 1);
  t.deepEqual(element.innerHTML, '<div></div><span></span><b></b>');
});

test('add by multiple index', t => {
  const { element, stower, div, span, a } = t.context;
  stower.add(a, 2);
  stower.add(span, 1);
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><span></span><a></a>');
});

test('remove by index', t => {
  const { element, stower, div, span, a } = t.context;
  stower.add(a, 2);
  stower.add(span, 1);
  stower.add(div, 0);

  stower.remove(0);
  t.deepEqual(element.innerHTML, '<span></span><a></a>');
});

test('remove and add by index', t => {
  const { element, stower, div, span, a, b } = t.context;
  stower.add(b, 3);
  stower.add(a, 2);
  stower.add(span, 1);
  stower.add(div, 0);

  stower.remove(1);
  stower.remove(2);
  t.deepEqual(element.innerHTML, '<div></div><b></b>');
  stower.add(span, 1);
  t.deepEqual(element.innerHTML, '<div></div><span></span><b></b>');
});

test('Add array', t => {
  const { element, stower, a, b } = t.context;
  stower.add([a, b], 1);
  t.deepEqual(element.innerHTML, '<a></a><b></b>');
});

test('Add array 2', t => {
  const { element, stower, span, div, a, b } = t.context;
  stower.add(span, 2);
  stower.add([a, b], 1);
  t.deepEqual(element.innerHTML, '<a></a><b></b><span></span>');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><a></a><b></b><span></span>');
});

test('Add and remove array', t => {
  const { element, stower, span, div, a, b } = t.context;
  stower.add(div, 0);
  stower.add([a, b], 1);
  stower.add(span, 2);
  t.deepEqual(element.innerHTML, '<div></div><a></a><b></b><span></span>');
  stower.remove(1);
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
});

test('add path, by default no sorting', t => {
  const { element, stower, div, span } = t.context;
  stower.add(div, 0, 'a');
  stower.add(span, 0, 'b');
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
});

test('add by path and normal', t => {
  const { element, stower, div, span, a, b } = t.context;
  stower.add(div, 1, 'a');
  stower.add(span, 1, 'b');
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
  stower.add(a, 0);
  t.deepEqual(element.innerHTML, '<a></a><div></div><span></span>');
  stower.add(b, 2);
  t.deepEqual(element.innerHTML, '<a></a><div></div><span></span><b></b>');
});

test('add and remove by path', t => {
  const { element, stower, div, span, a, b } = t.context;
  stower.add(a, 0);
  stower.add(b, 2);
  stower.add(div, 1, 'a');
  stower.add(span, 1, 'b');
  t.deepEqual(element.innerHTML, '<a></a><div></div><span></span><b></b>');
  stower.remove(1, 'b');
  t.deepEqual(element.innerHTML, '<a></a><div></div><b></b>');
});

test('remove unknown by path', t => {
  const { stower } = t.context;
  stower.remove(0, 'x');
  t.pass();
});

test('first on remove by path', t => {
  const { element, stower, div, a, b } = t.context;
  stower.add(a, 1, 'a');
  stower.add(b, 1, 'b');
  stower.remove(1, 'a');
  t.deepEqual(element.innerHTML, '<b></b>');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><b></b>');
});

test('remove first by path for all', t => {
  const { element, stower, a, b } = t.context;
  stower.add(b, 1, 'a');
  stower.remove(1, 'a');
  stower.add(a, 2);
  t.deepEqual(element.innerHTML, '<a></a>');
});

test('path by order', t => {
  const { element, stower, a, b } = t.context;
  stower.add(a, 1, 'a', ['b', 'a']);
  stower.add(b, 1, 'b', ['b', 'a']);
  t.deepEqual(element.innerHTML, '<b></b><a></a>');
});

test('path reorder', t => {
  const { element, stower, a, b, c } = t.context;
  stower.add(a, 1, 'a');
  stower.add(b, 1, 'b');
  stower.add(c, 1, 'c');
  t.deepEqual(element.innerHTML, '<a></a><b></b><c></c>');
  stower.reorder(1, ['c', 'b', 'a']);
  t.deepEqual(element.innerHTML, '<c></c><b></b><a></a>');
});

test('path order updated first', t => {
  const { element, stower, div, a, b } = t.context;
  const order = ['a', 'b'];
  stower.add(b, 1, 'b', order);
  stower.add(a, 1, 'a', order);
  t.deepEqual(element.innerHTML, '<a></a><b></b>');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><a></a><b></b>');
});

test('path order updated first with remove', t => {
  const { element, stower, div, a, b, c, span } = t.context;
  const order = ['a', 'b', 'c'];
  stower.add(c, 1, 'c', order);
  stower.add(b, 1, 'b', order);
  stower.add(a, 1, 'a', order);
  t.deepEqual(element.innerHTML, '<a></a><b></b><c></c>');
  stower.remove(1, 'a');
  t.deepEqual(element.innerHTML, '<b></b><c></c>');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><b></b><c></c>');
  stower.add(span, 2);
  stower.add(a, 1, 'a', ['a', 'b', 'c']);
  t.deepEqual(element.innerHTML, '<div></div><a></a><b></b><c></c><span></span>');
});

test('path re-order on add if order changes', t => {
  const { element, stower, a, b, c } = t.context;
  stower.add(a, 1, 'a', ['a', 'b']);
  stower.add(b, 1, 'b', ['a', 'b']);
  t.deepEqual(element.innerHTML, '<a></a><b></b>');
  stower.add(c, 1, 'c', ['c', 'b', 'a']);
  t.deepEqual(element.innerHTML, '<c></c><b></b><a></a>');
});

test('strings', t => {
  const { element, stower, } = t.context;
  stower.add('Hello, world!');
  t.deepEqual(element.innerHTML, 'Hello, world!');
});

test('string remove', t => {
  const { element, stower, } = t.context;
  stower.add('Hello, world!', 0);
  stower.remove(0);
  t.deepEqual(element.innerHTML, '');
});

test('strings as array', t => {
  const { element, stower, } = t.context;
  stower.add(['Hello', 'world!'], 0);
  t.deepEqual(element.innerHTML, 'Helloworld!');
  stower.remove(0);
  t.deepEqual(element.innerHTML, '');
});

test('strings with path', t => {
  const { element, stower, } = t.context;
  stower.add('Hello', 0, 'world');
  t.deepEqual(element.innerHTML, 'Hello');
  stower.remove(0, 'world');
  t.deepEqual(element.innerHTML, '');
});

test('JSON.stringify', t => {
  const { element, stower, } = t.context;
  stower.add({ hello: 'world' });
  t.deepEqual(element.innerHTML, '{"hello":"world"}');
});

test('JSON.stringify remove', t => {
  const { element, stower, } = t.context;
  stower.add({ hello: 'world' }, 0);
  stower.remove(0);
  t.deepEqual(element.innerHTML, '');
});


test('replace single', t => {
  const { element, stower, a, b } = t.context;
  stower.add(a, 0);
  t.deepEqual(element.innerHTML, '<a></a>');
  stower.add(b, 0);
  t.deepEqual(element.innerHTML, '<b></b>');
});

test('replace array', t => {
  const { element, stower, a, b, div, span } = t.context;
  stower.add([a, b], 0);
  t.deepEqual(element.innerHTML, '<a></a><b></b>');
  stower.add([div, span], 0);
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
});

test('replace path', t => {
  const { element, stower, a, b, c } = t.context;
  stower.add(a, 1, 'a');
  t.deepEqual(element.innerHTML, '<a></a>');
  stower.add(b, 1, 'a');
  t.deepEqual(element.innerHTML, '<b></b>');
});
