import domdom from '@eirikb/domdom';

// Important part
interface Data {
  hello: string;
}

const { React, init, don, path, data } = domdom<Data>({
  hello: 'World!',
});

const view = (
  <div>
    <div>A: Hello, {data.hello}</div>
    <div>B: Hello, {don(path().hello)}</div>
    <div>
      <button onClick={() => (data.hello = 'there!')}>Click me!</button>
    </div>
  </div>
);
// Important part

init(document.body, view);
