import domdom from '@eirikb/domdom';

// Important part
interface Data {
  hello: string;
}

const { React, init, don, pathOf } = domdom<Data>({
  hello: 'World!',
});

const view = (
  <div>
    <div>Hello, {don(pathOf().hello)}</div>
    <div>
      <input type="text" dd-model="hello" />
    </div>
  </div>
);
// Important part

init(document.body, view);
