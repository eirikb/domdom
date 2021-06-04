import domdom from '@eirikb/domdom';

// Important part
interface Data {
  hello: string;
}

const { React, init, don, pathOf } = domdom<Data>({
  hello: 'World!',
});

const view = <span>{don(pathOf().hello)}</span>;
// Important part

init(document.body, view);
