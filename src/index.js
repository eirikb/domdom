import Data from '@eirikb/data';
import Context from './context';
import ddProps from './dd-props';
import Stower from './stower';
import Hodor from "./hodor";

export function isProbablyPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

export default (parent, view) => {
  const data = Data();
  const React = {
    createElement(tagName, props, ...children) {
      if (typeof tagName === 'function') {
        return new Context(data, tagName, props, children);
      }

      const hodors = [];
      const element = document.createElement(tagName);
      const stower = Stower(element);

      const addHodor = (index, hodor) => {
        hodor.element = element;
        hodors.push(hodor);
        hodor.stower(index, stower);
      };

      const appendChild = (index, child, path) => {
        stower.add(child, index, path);
      };

      const setElementValue = (key, value) => {
        if (value && value.then) {
          value.then(res => setElementValue(key, res));
        } else {
          if (isProbablyPlainObject(value) && element[key]) {
            Object.assign(element[key], value);
          } else {
            element[key] = value;
          }
        }
      };

      let counter = 0;
      for (let child of [].concat(...children)) {
        const index = counter++;
        if (typeof child === 'undefined' || child === null) {
        } else if (child.isHodor) {
          addHodor(index, child);
        } else {
          appendChild(index, child);
        }
      }

      for (let [key, value] of Object.entries(props || {})) {
        if (value.isHodor) {
          value.element = element;
        }

        const isEventProp = key.match(/^on[A-Z]/);
        if (isEventProp) {
          const event = key[2].toLowerCase() + key.slice(3);
          element.addEventListener(event, (...args) => {
            return value(...args);
          });
        }

        const nonSpecialProp = !key.match(/(^dd-|on[A-Z])/);
        if (nonSpecialProp) {
          if (key === 'class') {
            key = 'className';
          }
          if (!(value && value.isHodor)) {
            setElementValue(key, value);
          }
        }
      }

      element.destroy = () => {
        element.isMounted = false;
        element.childNodes.forEach(child => child.destroy && child.destroy());
        for (let hodor of hodors) {
          hodor.destroy();
        }
      };

      element.on = (path, listener) => {
        hodors.push(Hodor(data, path, listener));
      }

      element.mounted = () => {
        if (element.isMounted) return;
        element.isMounted = true;
        hodors.push(...ddProps(data, element, props));
        if (element.context) {
          element.context.mounted();
        }
        for (let hodor of hodors) {
          hodor.mounted();
        }
      };

      return element;
    }
  };

  function mount(element) {
    if (element.mounted && !element.isMounted) {
      element.mounted();
      element.isMounted = true;
    }
  }

  function unmount(element) {
    if (element.destroy) element.destroy();
    element.isMounted = false;
  }

  function squint(parent) {
    new MutationObserver((mutationList) => {
      for (let mutation of mutationList) {
        for (let node of mutation.addedNodes) {
          mount(node);
          if (node.getElementsByTagName) {
            for (let child of node.getElementsByTagName('*')) {
              mount(child);
            }
          }
        }
        for (let node of mutation.removedNodes) {
          unmount(node);
          if (node.getElementsByTagName) {
            for (let child of node.getElementsByTagName('*')) {
              unmount(child);
            }
          }
        }
      }
    }).observe(parent, { childList: true, subtree: true });
  }

  function append(parent, view) {
    squint(parent);
    const element = React.createElement(view);
    parent.appendChild(element);
  }

  if (typeof parent === 'undefined') {
    return { React, data, append };
  }

  window.React = React;
  if (typeof global !== 'undefined') {
    global.React = React;
  }

  append(parent, view);
  return data;
}
