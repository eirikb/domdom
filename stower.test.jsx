import test from 'ava';
import browserEnv from 'browser-env';
import Stower from './src/stower';

browserEnv();

test.beforeEach(t => {
  t.context.element = document.createElement('div');
  t.context.stower = new Stower(t.context.element);
  t.context.a = document.createElement('a');
  t.context.b = document.createElement('b');
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
  const { element, stower, div, span, a, b } = t.context;
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
