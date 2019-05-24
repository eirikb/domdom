import test from 'ava';
import browserEnv from 'browser-env';

browserEnv();
import domdom from './src';

test.beforeEach(() => {
  document.body.innerHTML = '';
});

test.serial('Double on', t => {
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

test.serial('text', t => {
  const dd = domdom();
  const div = ({text}) => <div>{text('test')}</div>;
  document.body.appendChild(dd.render(div));

  dd.data.set('test', 'hello');
  t.is(document.body.innerHTML, '<div>hello</div>');

  dd.data.set('test', 'world');
  t.is(document.body.innerHTML, '<div>world</div>');

  dd.data.unset('test');
  t.is(document.body.innerHTML, '<div></div>');
});
