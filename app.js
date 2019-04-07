import Data from './data';
import hello from './hello.jsx';

const data = new Data();

data.on('= incCounter', () =>
  data.set('counter', (data.get('counter') || 0) + 1)
);

data.on('+* show', eh => {
  console.log(eh);
});

data.on('= toggleShow', () =>
  data.set('show', !data.get('show'))
);

global.React = {
  createElement(tagName, props, ...children) {
    const element = document.createElement(tagName);

    global.text = (path) => {
      const textNode = document.createTextNode(data.get(path) || '');
      data.on('+* ' + path, val => textNode.nodeValue = val);
      return textNode;
    };

    if (props) {
      console.log(element, props);
      for (let [prop, trigger] of Object.entries(props)) {
        if (prop.startsWith('dd-on-')) {
          const eventType = prop.split('-').slice(2).join('-');
          element.addEventListener(eventType, () => data.trigger(trigger));
        }
      }
      const model = props['dd-model'];
      if (model) {
        data.on('!+* ' + model, val => element.value = val);
        element.addEventListener('keyup', () => data.set(model, element.value));
      }
      if (props['dd-if']) {
        element.if = props['dd-if'];
      }
    }

    for (let child of children) {
      if (typeof child === 'string') {
        child = document.createTextNode(child);
      }
      if (child) {
        if (child.if) {
          console.log('but', child.if);
          data.on('+* ' + child.if, cond => {
            if (cond) {
              element.appendChild(child);
            } else {
              if (child.parentElement) {
                child.parentElement.removeChild(child);
              }
            }
          });
        } else {
          element.appendChild(child);
        }
      }
    }
    return element;
  }
};

const entry = hello();
document.body.appendChild(entry);
