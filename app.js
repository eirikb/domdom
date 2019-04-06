import Data from './data';


const data = new Data();

data.on('= click', () => {
  console.log('CLICKED');
});


global.React = {
  createElement(tagName, props, ...children) {


    const element = document.createElement(tagName);

    if (props) {
      if (props.trigger) {
        element.addEventListener('click', () => data.trigger(props.trigger));
      }
      if (props.path) {

      }
    }

    for (let child of children) {
      if (typeof child === 'string') {
        child = document.createTextNode(child);
      }
      if (child) {
        element.appendChild(child);
      }
    }
    return element;
  }
};
import hello from './hello.jsx';

const entry = hello();
document.body.appendChild(entry);
