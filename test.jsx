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

test.serial('on Sort - default by path', t => {
  const dd = domdom();
  const div = ({on}) => <div>
    {on('players.$id', player => <p>{player.name}</p>)}
  </div>;
  document.body.appendChild(dd.render(div));
  dd.data.set('players.one', {name: '1'});
  dd.data.set('players.two', {name: '2'});
  dd.data.set('players.three', {name: '3'});
  t.is(document.body.innerHTML, '<div><p>1</p><p>3</p><p>2</p></div>');
});

test.serial('on Sort - by third argument', t => {
  const dd = domdom();
  const div = ({on}) => <div>
    {on('players.$id', player => <p>{player.name}</p>, (a, b) => a.name.localeCompare(b.name))}
  </div>;
  document.body.appendChild(dd.render(div));
  dd.data.set('players.one', {name: '1'});
  dd.data.set('players.two', {name: '2'});
  dd.data.set('players.three', {name: '3'});
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
});

test.serial('Multiple on-siblings', t => {
  const dd = domdom();
  const div = ({on}) => <div>
    {on('b', test => <div>{test}</div>)}
    {on('a', ing => <div>{ing}</div>)}
  </div>;
  document.body.appendChild(dd.render(div));
  dd.data.set('a', 'World');
  dd.data.set('b', 'Hello');
  t.is(document.body.innerHTML, '<div><div>Hello</div><div>World</div></div>');
});

test.serial('on Sort - remove $first', t => {
  const dd = domdom();
  const div = ({on}) => <div>
    {on('players.$id', player => <p>{player.name}</p>)}
  </div>;
  document.body.appendChild(dd.render(div));
  dd.data.set('players.1', {name: '1'});
  dd.data.set('players.2', {name: '2'});
  dd.data.set('players.3', {name: '3'});
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');

  dd.data.unset('players.1');
  t.is(document.body.innerHTML, '<div><p>2</p><p>3</p></div>');

  console.clear();
  dd.data.set('players.1', {name: '1'});
  t.is(document.body.innerHTML, '<div><p>1</p><p>2</p><p>3</p></div>');
});

test.serial('Child listener', t => {
  const dd = domdom();
  const div = ({on}) => <main>
    {on('players.$id', player => <article>
      {on('>.name', name => name)}
    </article>)}
  </main>;
  document.body.appendChild(dd.render(div));
  dd.data.set('players.1', {name: '1'});
  dd.data.set('players.2', {name: '2'});
  dd.data.set('players.3', {name: '3'});
  t.is(document.body.innerHTML, '<main><article>1</article><article>2</article><article>3</article></main>');
});

test.serial('Simple when', t => {
  const dd = domdom();

  function Test({on}) {
    return <div>{on('test', t => t)}</div>;
  }

  const div = ({when}) => <div>
    {when('test', [
      'yes', t => `Yes is ${t}`,
      () => true, <div>Yes!</div>,
      () => true, () => <Test/>,
    ])}
  </div>;
  document.body.appendChild(dd.render(div));
  dd.data.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>Yes is yes<div>Yes!</div><div>yes</div></div>');
});

test.serial('Many whens', t => {
  const dd = domdom();
  const div = ({when}) => <div>
    {when('test', [
      'yes', t => t,
      'no', t => t,
      true, () => 'Yes!',
      () => true, 'true',
      t => t === 'yes', 't === yes',
      'yes', () => <div>hello</div>,
      'yes', <div>world</div>
    ])}
  </div>;
  document.body.appendChild(dd.render(div));
  dd.data.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>yestruet === yes<div>hello</div><div>world</div></div>');
  dd.data.set('test', 'no');
  t.is(document.body.innerHTML, '<div>notrue</div>');
  dd.data.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>yestruet === yes<div>hello</div><div>world</div></div>');
});

test.serial('Quirk on + when', t => {
  const dd = domdom();
  const div = ({on, when}) => <div>
    {on('test', t => t)}

    {when('test', [
      'yes', 'Yes',
      'no', 'No'
    ])}
  </div>;
  document.body.appendChild(dd.render(div));
  dd.data.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>yesYes</div>');
  dd.data.set('test', 'no');
  t.is(document.body.innerHTML, '<div>noNo</div>');
  dd.data.set('test', 'yes');
  t.is(document.body.innerHTML, '<div>yesYes</div>');
  dd.data.set('test', 'no');
  t.is(document.body.innerHTML, '<div>noNo</div>');
});

test.serial('Simple or', t => {
  const dd = domdom();
  const div = ({on}) => <div>
    {on('test', t => <div>{t}</div>).or(<div>Nope</div>)}
  </div>;
  document.body.appendChild(dd.render(div));
  t.is(document.body.innerHTML, '<div><div>Nope</div></div>');
  dd.data.set('test', 'ing');
  t.is(document.body.innerHTML, '<div><div>ing</div></div>');
  dd.data.set('test', '');
  t.is(document.body.innerHTML, '<div><div></div></div>');
  dd.data.unset('test');
  t.is(document.body.innerHTML, '<div><div>Nope</div></div>');
});

test.serial('on empty res', t => {
  const dd = domdom();
  const div = ({text}) => <div>{text('test')}</div>;
  document.body.appendChild(dd.render(div));
  dd.data.set('test', 'Hello');
  t.is(document.body.innerHTML, '<div>Hello</div>');
  dd.data.set('test', '');
  t.is(document.body.innerHTML, '<div></div>');

});
