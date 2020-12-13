import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import { Domdom } from '../src/domdom';
import { Data, Pathifier2, StowerTransformer } from '@eirikb/data';
import { DomStower } from '../src/dom-stower';

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

let { init, React, on, set } = new Domdom(new Data());

test.beforeEach(() => {
  createElement();
  const d = new Domdom(new Data());
  init = d.init;
  React = d.React;
  on = d.on;
  set = d.set;
});

test('Component', async t => {
  const Test = () => {
    return <div>{on('test')}</div>;
  };

  init(element, <Test />);
  set('test', 'Hello, world!');
  t.is(await html(), '<div>Hello, world!</div>');
});

test('pathifier2', async t => {
  const data = new Data();
  const transformer = new StowerTransformer();
  const pathifier = new Pathifier2(data, 'a.$', transformer);
  pathifier.init();
  transformer.stower(0, new DomStower(element));

  pathifier.map(value => <div>{value}</div>);

  data.set('a', {
    b: 1,
    c: 2,
    d: 3,
  });
  console.log('html', await html());
  t.pass();
});
