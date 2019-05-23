import test from 'ava';
import browserEnv from 'browser-env';

browserEnv();
import domdom from './src';

test('Insert to DOM', t => {
  const dd = domdom();
  const div = () => <div><span>wat</span></div>;
  document.body.appendChild(dd.render(div));
  t.is(document.querySelector('span').innerHTML, 'wat');
});

test('foo', t => {
  t.pass();
});

test('bar', async t => {
  const bar = Promise.resolve('bar');
  t.is(await bar, 'bar');
});