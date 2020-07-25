import anyTest, { TestInterface } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import { DomStower } from '../src/dom-stower';

interface StowerContext {
  element: HTMLElement;
  stower: DomStower;
  a: HTMLElement;
  b: HTMLElement;
  c: HTMLElement;
  d: HTMLElement;
  span: HTMLElement;
  div: HTMLElement;
}

const test = anyTest as TestInterface<StowerContext>;

browserEnv();

test.beforeEach(t => {
  t.context.element = document.createElement('div');
  t.context.stower = new DomStower(t.context.element);
  t.context.a = document.createElement('a');
  t.context.b = document.createElement('b');
  t.context.c = document.createElement('c');
  t.context.d = document.createElement('d');
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

  stower.remove(null, 0);
  t.deepEqual(element.innerHTML, '<span></span><a></a>');
});

test('remove and add by index', t => {
  const { element, stower, div, span, a, b } = t.context;
  stower.add(b, 3);
  stower.add(a, 2);
  stower.add(span, 1);
  stower.add(div, 0);

  stower.remove(null, 1);
  stower.remove(null, 2);
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
  stower.remove(null, 1);
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
});

test('add subIndex', t => {
  const { element, stower, div, span } = t.context;
  stower.add(div, 0, 0);
  stower.add(span, 0, 1);
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
});

test('add by subIndex and normal', t => {
  const { element, stower, div, span, a, b } = t.context;
  stower.add(div, 1, 0);
  stower.add(span, 1, 1);
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
  stower.add(a, 0);
  t.deepEqual(element.innerHTML, '<a></a><div></div><span></span>');
  stower.add(b, 2);
  t.deepEqual(element.innerHTML, '<a></a><div></div><span></span><b></b>');
});

test('add and remove by subIndex', t => {
  const { element, stower, div, span, a, b } = t.context;
  stower.add(a, 0);
  stower.add(b, 2);
  stower.add(div, 1, 0);
  stower.add(span, 1, 1);
  t.deepEqual(element.innerHTML, '<a></a><div></div><span></span><b></b>');
  stower.remove(null, 1, 1);
  t.deepEqual(element.innerHTML, '<a></a><div></div><b></b>');
});

test('remove unknown by subIndex', t => {
  const { stower } = t.context;
  stower.remove(null, 0, 0);
  t.pass();
});

test('first on remove by subIndex', t => {
  const { element, stower, div, a, b } = t.context;
  stower.add(a, 1, 0);
  stower.add(b, 1, 1);
  stower.remove(null, 1, 0);
  t.deepEqual(element.innerHTML, '<b></b>');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><b></b>');
});

test('remove first by subIndex for all', t => {
  const { element, stower, a, b } = t.context;
  stower.add(b, 1, 0);
  stower.remove(null, 1, 0);
  stower.add(a, 2);
  t.deepEqual(element.innerHTML, '<a></a>');
});

test('strings', t => {
  const { element, stower } = t.context;
  stower.add('Hello, world!', 0);
  t.deepEqual(element.innerHTML, 'Hello, world!');
});

test('string remove', t => {
  const { element, stower } = t.context;
  stower.add('Hello, world!', 0);
  stower.remove(null, 0);
  t.deepEqual(element.innerHTML, '');
});

test('strings as array', t => {
  const { element, stower } = t.context;
  stower.add(['Hello', 'world!'], 0);
  t.deepEqual(element.innerHTML, 'Helloworld!');
  stower.remove(null, 0);
  t.deepEqual(element.innerHTML, '');
});

test('strings with subIndex', t => {
  const { element, stower } = t.context;
  stower.add('Hello', 0, 0);
  t.deepEqual(element.innerHTML, 'Hello');
  stower.remove(null, 0, 0);
  t.deepEqual(element.innerHTML, '');
});

test('JSON.stringify', t => {
  const { element, stower } = t.context;
  stower.add({ hello: 'world' }, 0);
  t.deepEqual(element.innerHTML, '{"hello":"world"}');
});

test('JSON.stringify remove', t => {
  const { element, stower } = t.context;
  stower.add({ hello: 'world' }, 0);
  stower.remove(null, 0);
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

test('types', t => {
  const { element, stower } = t.context;
  stower.add('a', 0);
  stower.add(1, 1);
  stower.add(3.6, 2);
  stower.add({ hello: 'world' }, 4);
  stower.add(undefined, 5);
  stower.add(null, 6);
  stower.add(true, 7);
  stower.add(false, 8);
  t.is(element.outerHTML, '<div>a13.6{"hello":"world"}truefalse</div>');
});

test('add before string', t => {
  const { element, stower, a } = t.context;
  stower.add('b', 1);
  stower.add(a, 0);
  t.deepEqual(element.innerHTML, '<a></a>b');
});

test('add before subIndex of string', t => {
  const { element, stower, a } = t.context;
  stower.add('b', 1, 0);
  stower.add(a, 0);
  t.deepEqual(element.innerHTML, '<a></a>b');
});

test('subIndex with array', t => {
  const { element, stower, a, b } = t.context;
  stower.add([a, b], 0, 0);
  t.deepEqual(element.innerHTML, '<a></a><b></b>');
});

test('subIndex with array remove', t => {
  const { element, stower, a, b, div, span } = t.context;
  stower.add(div, 0);
  stower.add([a, b], 1, 0);
  stower.add(span, 2);
  t.deepEqual(element.innerHTML, '<div></div><a></a><b></b><span></span>');
  stower.remove(null, 1, 0);
  t.deepEqual(element.innerHTML, '<div></div><span></span>');
  stower.add([a, b], 1, 0);
  t.deepEqual(element.innerHTML, '<div></div><a></a><b></b><span></span>');
});

test('first is updated when removing by subIndex', t => {
  const { element, stower, div, a, b } = t.context;
  stower.add(a, 1, 0);
  stower.add(b, 1, 1);
  t.deepEqual(element.innerHTML, '<a></a><b></b>');
  stower.remove(null, 1, 0);
  t.deepEqual(element.innerHTML, '<b></b>');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><b></b>');
});

test('inserting over another index should push the rest', t => {
  const { element, stower, div, a, b, c } = t.context;
  stower.add(a, 1, 0);
  stower.add(b, 1, 0);
  stower.add(c, 1, 0);
  t.deepEqual(element.innerHTML, '<c></c><b></b><a></a>');
  stower.remove(null, 1, 0);
  t.deepEqual(element.innerHTML, '<b></b><a></a>');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div><b></b><a></a>');
  stower.remove(null, 1, 0);
  t.deepEqual(element.innerHTML, '<div></div><a></a>');
});

test('subIndex with array and before', t => {
  const { element, stower, a, b, c } = t.context;
  stower.add([a, b], 1, 0);
  t.deepEqual(element.innerHTML, '<a></a><b></b>');
  stower.add(c, 0);
});

test('or', t => {
  const { element, stower, div, a } = t.context;
  stower.or(0, a);
  t.deepEqual(element.innerHTML, '<a></a>');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div>');
  stower.remove(null, 0);
  t.deepEqual(element.innerHTML, '<a></a>');
});

test('or can be false(y)', t => {
  const { element, stower, div } = t.context;
  stower.or(0, false);
  t.deepEqual(element.innerHTML, 'false');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div>');
  stower.remove(null, 0);
  t.deepEqual(element.innerHTML, 'false');
});

test('or as function', t => {
  const { element, stower, div } = t.context;
  let hello = 0;
  const or = () => ++hello;
  stower.or(0, or);
  t.deepEqual(element.innerHTML, '1');
  stower.add(div, 0);
  t.deepEqual(element.innerHTML, '<div></div>');
  stower.remove(null, 0);
  t.deepEqual(element.innerHTML, '2');
});

test('replace array with subindex', t => {
  const { element, stower } = t.context;
  stower.or(0, '+');
  stower.add(['-', null], 0, 0);
  t.deepEqual(element.innerHTML, '-');
  stower.remove(null, 0, 0);
  t.deepEqual(element.innerHTML, '+');
  stower.add([null, '+'], 0, 0);
  t.deepEqual(element.innerHTML, '+');
});
