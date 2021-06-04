import domdom from '@eirikb/domdom';

// Important part
interface Data {
  toggle: boolean;
}

const { React, init, don, pathOf, data } = domdom<Data>({
  toggle: false,
});

const view = (
  <div>
    <button onClick={() => (data.toggle = !data.toggle)}>Toggle</button>
    <button disabled={don(pathOf().toggle)}>A</button>
    <button disabled={don(pathOf().toggle).map(res => !res)}>B</button>
  </div>
);
// Important part

init(document.body, view);
