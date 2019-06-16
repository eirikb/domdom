import domdom from './src';

const dd = domdom();


// const div = ({on}) => <div>
//   {on('test', (test) => <div>
//       {test}
//       {on('testing', (test) => <span>eh {test}</span>)}
//     </div>
//   )}
// </div>;
// document.body.appendChild(dd.render(div));
//
// dd.data.set('test', 'hello');
// dd.data.set('testing', 'world');
// dd.data.unset('test');
// dd.data.set('test', 'hello');


//******************************************

let i = 0;

function Child({on}) {
  const e = <div></div>;
  on('* test', () => {
    e.innerText = ++i;
  });
  return e;
}

dd.data.set('test', 'a');
dd.data.set('show', true);
const div = ({on}) => <div>
  {on('show', () =>
    <Child></Child>
  )}
</div>;
// console.log(div);
// console.log(Child);
document.body.appendChild(dd.render(div));
dd.data.set('test', 'b');
console.log(i);

dd.data.unset('show');
dd.data.set('test', 'c');
console.log(i);

dd.data.set('show', true);
dd.data.set('test', 'd');
console.log(i);
