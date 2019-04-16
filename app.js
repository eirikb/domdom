import hello from './hello';
import {Data, init} from './domdom';

const data = new Data();
document.body.appendChild(init(hello, data));
