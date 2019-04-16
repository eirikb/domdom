import Data from './data';
import hello from './hello.jsx';

global.React = {
  createElement(tagName, props, ...children) {
    const listeners = [];
    return {
      destroy() {
        data.off(listeners.join(' '));
      },

      create(data) {
        const element = document.createElement(tagName);

        for (let child of children) {
          if (typeof child === 'undefined') {
          } else if (child.create) {
            element.appendChild(child.create(data));
          } else if (child.when) {
            let prev;
            let holder;
            listeners.push(
              data.on('+*! ' + child.when.path, res => {
                holder = child.when.listener(res);
                if (prev) {
                  element.removeChild(prev)
                }
                if (holder) {
                  holder.destroy();
                }
                if (res) {
                  const next = holder.create(data);
                  element.appendChild(next);
                  prev = next;
                } else {
                  prev = null;
                }
              })
            );
          } else if (child.on) {
            let prev;
            let holder;
            listeners.push(
              data.on('+*! ' + child.on.path, res => {
                holder = child.on.listener(res);
                if (prev) {
                  element.removeChild(prev)
                }
                if (holder) {
                  holder.destroy();
                }
                const next = holder.create(data);
                element.appendChild(next);
                prev = next;
              })
            );
          } else if (child.text) {
            const text = document.createTextNode('');
            listeners.push(
              data.on('+*! ' + child.text.path, (value) => text.nodeValue = value)
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
global.when = (path, listener) => ({when: {path, listener}});
global.text = (path) => ({text: {path}});

const data = new Data();
global.set = (path, value) => data.set(path, value);
global.get = (path) => data.get(path);
const entry = hello().create(data);
document.body.appendChild(entry);
