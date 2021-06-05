import domdom from '@eirikb/domdom';

const { React, init } = domdom({});

// Important part
const element = <span>Hello, world :)</span>;
element.style.color = 'red';
// Important part

init(document.body, element);
