import Data from './data';
import hello from './hello.jsx';

global.React = {
  createElement(tagName, props, ...children) {
    const listeners = [];
    return {
      create(data) {
        const element = document.createElement(tagName);

        for (let child of children) {
          console.log('child', child);
          if (!child) {
          } else if (child.create) {
            element.appendChild(child.create(data));
          } else if (child.on) {
            console.log(child.on.listener().create(data));
            let prev;
            listeners.push(
              data.on('+*! ' + child.on.path, res => {
                const next = child.on.listener(res).create(data);
                if (prev) {
                  element.removeChild(prev)
                }
                element.appendChild(next);
                prev = next;
              })
            );
          } else if (child.text) {
            const text = document.createTextNode('');
            data.on('+*! ' + child.text.path, (value) =>
              text.nodeValue = value
            );
            element.appendChild(text);
          } else {
            element.appendChild(document.createTextNode(child));
          }
        }

        if (props && props.onClick) {
          element.addEventListener('click', props.onClick);
        }

        return element;
      }
    };
  }
};

global.on = (path, listener) => ({on: {path, listener}});
global.text = (path) => ({text: {path}});

const data = new Data();
global.set = (path, value) => data.set(path, value);
global.get = (path) => data.get(path);
console.log(hello);
const entry = hello().create(data);
document.body.appendChild(entry);
