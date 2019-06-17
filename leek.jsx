import domdom from './src';

const dd = domdom();

// t.is(document.body.innerHTML, '<div></div>');

dd.data.set('test', 'hello');
// t.is(document.body.innerHTML, '<div><div>hello</div></div>');

dd.data.set('testing', 'world');
// t.is(document.body.innerHTML, '<div><div>hello<span>eh world</span></div></div>');

const div = ({on}) => <div>
  {on('test', (test) => <div>
      {test}
      {on('testing', (test) => <span>eh {test}</span>)}
    </div>
  )}
</div>;
document.body.appendChild(dd.render(div));
dd.data.unset('test');
dd.data.set('test', 'hello');
// t.is(document.body.innerHTML, '<div><div>hello<span>eh world</span></div></div>');
