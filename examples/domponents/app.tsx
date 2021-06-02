import domdom from '@eirikb/domdom';

const { React, init } = domdom({});

// Important part
const Button = () => <button>I am button!</button>;

const view = (
  <div>
    <Button />
  </div>
);
// Important part

init(document.body, view);
