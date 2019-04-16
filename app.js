import hello from './hello';
import {Data, init} from './domdom';

const data = new Data();
console.log(hello);
document.body.appendChild(init(hello, data));
