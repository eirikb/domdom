import hello from './hello';
import domdom from './src';

const dd = domdom();
document.body.appendChild(dd.render(hello));
// console.log(hello.toString());

setTimeout(() => dd.data.set('test', 'Hello, world!'));

dd.data.set('ok', true);
