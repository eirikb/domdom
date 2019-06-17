import domdom from './src';

const dd = domdom();

let i = 0;

// function Child({on}) {
//   const e = <article></article>;
//   on('* test', () => {
//     console.log('on test');
//     e.innerText = ++i;
//   });
//   return e;
// }
//
// dd.data.set('test', 'a');
// dd.data.set('show', true);
// const div = ({on}) => <main>
//   {on('show', () =>
//     <Child></Child>
//   )}
// </main>;
// console.log(Child.toString());
// console.log(div.toString());
// document.body.appendChild(dd.render(div));
// dd.data.set('test', 'b');
// console.log(i);
//
// dd.data.unset('show');
// dd.data.set('test', 'c');
// console.log(i);
//
// dd.data.set('show', true);
// dd.data.set('test', 'd');
// console.log(i);

function Child({on}) {
  on('* test', () => {
    console.log('* test');
    i++
  });
  return <p></p>;
}

console.log('set test', 'a');
dd.data.set('test', 'a');
dd.data.set('show', 'yes');
const div = ({on}) => <main>
  {on('show', () =>
    <Child></Child>
  )}
</main>;
document.body.appendChild(dd.render(div));
console.log('set test', 'b');
dd.data.set('test', 'b');
console.log(1, i);

dd.data.set('show', 'still yes');
console.log('set test', 'c');
dd.data.set('test', 'c');
console.log(1, i);

// dd.data.set('show', true);
console.log('set test', 'd');
dd.data.set('test', 'd');
console.log(2, i);
