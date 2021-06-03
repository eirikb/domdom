import domdom from '@eirikb/domdom';

const { React, init } = domdom({});

// Important part
const view = (
  <button
    onClick={(event: Event) => {
      event.target.style.color = 'red';
    }}
  >
    Click me!
  </button>
);
// Important part

init(document.body, view);
