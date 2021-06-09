import domdom from '@eirikb/domdom';

const { React, init } = domdom({});

const view = <div>Hello, world!</div>;

init(document.body, view);
