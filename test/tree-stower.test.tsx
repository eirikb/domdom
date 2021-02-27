import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import domdom from '../src/index';

browserEnv();

let element: HTMLElement;

function createElement() {
  try {
    document.body.removeChild(element);
  } catch (e) {}
  element = document.createElement('div');
  document.body.appendChild(element);
  return element;
}

async function html() {
  // Force update of Observables
  await Promise.resolve();
  return element.innerHTML;
}

test('array initial', async t => {
  const { React } = domdom();
  t.is((<div>{[1, [2, [3, 4], 5, 6]]}</div>).outerHTML, '<div>123456</div>');
});

test('on', async t => {
  const { React, init, don, set } = domdom();
  init(
    createElement(),
    <div>
      {don('a')}
      {don('b')}
    </div>
  );
  set('b', 'b');
  t.is(await html(), '<div>b</div>');
  set('a', 'a');
  t.is(await html(), '<div>ab</div>');
});
