import { serial as test } from 'ava';
// @ts-ignore
import browserEnv from 'browser-env';
import { Domdom } from '../src/domdom';
import { Data } from '@eirikb/data';

browserEnv();

function createElement(): HTMLElement {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  const element = document.createElement('div');
  document.body.appendChild(element);
  return element;
}

async function html(element: HTMLElement) {
  // Force update of Observables
  await Promise.resolve();
  return element.innerHTML;
}

test('ok', async t => {
  const element = createElement();
  const domdom = new Domdom(new Data());
  const { React } = domdom;

  const Test = () => {
    return <div>{domdom.on2('a.$').map(v => Number(v) + 1)}</div>;
  };
  domdom.init(element, <Test />);
  domdom.wat('!+* a.*', console.log);
  domdom.set('a', {
    a: '1',
    b: '2',
  });
  console.log(await html(element));
  domdom.set('a', {
    a: '2',
    b: '3',
  });
  console.log(await html(element));
  t.pass();
  // t.is(await html(), '<div>Hello, world!</div>');
});
