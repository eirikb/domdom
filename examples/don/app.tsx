import domdom from '@eirikb/domdom';

// Important part
interface Data {
  hello: string;
}

const { React, init, don, path } = domdom<Data>({
  hello: 'World!',
});

const view = <span>{don(path().hello)}</span>;
// Important part

init(document.body, view);
