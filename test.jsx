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

test.serial('Multiple paths', t => {
  const dd = domdom();
  const div = ({on}) => <div>
    {on('players.$id', player => <p>{player.name}</p>)}
  </div>;
  document.body.appendChild(dd.render(div));
  t.is(document.body.innerHTML, '<div></div>');

  dd.data.set('players.one', {name: 'Mr. one'});
  t.is(document.body.innerHTML, '<div><p>Mr. one</p></div>');

  dd.data.set('players.two', {name: 'Mr. two'});
  t.is(document.body.innerHTML, '<div><p>Mr. one</p><p>Mr. two</p></div>');

  dd.data.set('players.one', {name: 'Hello'});
  t.is(document.body.innerHTML, '<div><p>Hello</p><p>Mr. two</p></div>');

  dd.data.unset('players.one');
  t.is(document.body.innerHTML, '<div><p>Mr. two</p></div>');
});
