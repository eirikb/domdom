import createData, { Data } from '@eirikb/data';
import Context from './context';
import ddProps from './dd-props';
import Stower from './stower';
import Hodor from "./hodor";

export function isProbablyPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

export default (parent?: any, view?: any): Data => {
  const data = createData();
  const React = {
    createElement(tagName: string | Function, props?, ...children) {
      if (typeof tagName === 'function') {
        return Context(data, tagName, props, children);
      }

      const hodors = [];
      const element = document.createElement(tagName);
      const stower = Stower(element);

      const addHodor = (index, hodor) => {
        hodor.element = element;
        hodors.push(hodor);
        hodor.stower(index, stower);
      };

      const appendChild = (index, child) => {
        stower.add(child, index);
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
        if (value["isHodor"]) {
          value["element"] = element;
        }

        const isEventProp = key.match(/^on[A-Z]/);
        if (isEventProp) {
          const event = key[2].toLowerCase() + key.slice(3);
          element.addEventListener(event, (...args) => {
            const valueFn = value as Function;
            if (valueFn !== null) {
              return valueFn(...args);
            }
          });
        }

        const nonSpecialProp = !key.match(/(^dd-|on[A-Z])/);
        if (nonSpecialProp) {
          if (key === 'class') {
            key = 'className';
          }
          if (!(value && value["isHodor"])) {
            setElementValue(key, value);
          }
        }
      }

      element["destroy"] = () => {
        element["isMounted"] = false;
        element.childNodes.forEach(child => {
          const destroy = child["destroy"] as Function;
          if (destroy !== null) {
            destroy();
          }
        });
        for (let hodor of hodors) {
          hodor.destroy();
        }
      };

      element["on"] = (path, listener) => {
        hodors.push(Hodor(data, path, listener));
      }

      element["mounted"] = () => {
        if (element["isMounted"]) return;
        element["isMounted"] = true;
        hodors.push(...ddProps(data, element, props));
        if (element["context"]) {
          element["context"].mounted();
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
        mutation.addedNodes.forEach(node => {
          mount(node);
          const element = node as HTMLElement;
          if (element !== null) {
            const children: Element[] = Array.from(element.getElementsByTagName('*'));
            for (let child of children) {
              mount(child);
            }
          }
        });
        mutation.removedNodes.forEach(node => {
          unmount(node);
          const element = node as HTMLElement;
          if (element !== null) {
            const children: Element[] = Array.from(element.getElementsByTagName('*'));
            for (let child of children) {
              unmount(child);
            }
          }
        });
      }
    }).observe(parent, { childList: true, subtree: true });
  }

  function append(parent, view) {
    squint(parent);
    const element = React.createElement(view);
    parent.appendChild(element);
  }

  if (typeof parent === 'undefined') {
    // @ts-ignore
    return { React, data, append };
  }

  // @ts-ignore
  window.React = React;
  if (typeof global !== 'undefined') {
    // @ts-ignore
    global.React = React;
  }

  append(parent, view);
  return data;
}
