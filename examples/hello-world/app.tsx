import domdom from '@eirikb/domdom';

interface Data {
  hello: string;
}

const { React, init, don, pathOf } = domdom<Data>({ hello: 'world' });

const view = <div>Hello, {don(pathOf().hello)}</div>;

init(document.body, view);
