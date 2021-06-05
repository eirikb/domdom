import domdom, { Opts } from '@eirikb/domdom';

const { React, init } = domdom({});

// Important part
const Button = ({ color }: { color: string }, { mounted, children }: Opts) => {
  const button = <button>Hello {children}</button>;
  mounted(() => (button.style.color = color));
  return button;
};

const view = (
  <div>
    <Button color="blue">World!</Button>
  </div>
);
// Important part

init(document.body, view);
