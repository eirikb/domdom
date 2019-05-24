import test from 'ava';
import browserEnv from 'browser-env';

browserEnv();
import domdom from './src';

test('Double on', t => {
  const dd = domdom();
  const div = ({on}) => <div>
    {on('test', (test) => <div>
        {test}
        {on('testing', (test) => <span>eh {test}</span>)}
      </div>
    )}
  </div>;
  document.body.appendChild(dd.render(div));
  t.is(document.body.innerHTML, '<div></div>');

  dd.data.set('test', 'hello');
  t.is(document.body.innerHTML, '<div><div>hello</div></div>');

  dd.data.set('testing', 'world');
  t.is(document.body.innerHTML, '<div><div>hello<span>eh world</span></div></div>');

  dd.data.unset('test');
  t.is(document.body.innerHTML, '<div></div>');
  dd.data.set('test', 'hello');
  t.is(document.body.innerHTML, '<div><div>hello<span>eh world</span></div></div>');
});

test('foo', t => {
  t.pass();
});

test('bar', async t => {
  const bar = Promise.resolve('bar');
  t.is(await bar, 'bar');
});