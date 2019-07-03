import hello from './hello';
import domdom from './src';

const dd = domdom();
document.body.appendChild(dd.render(hello));
// console.log(hello.toString());

setTimeout(() => dd.set('test', 'Hello, world!'));

dd.set('ok', true);
