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

      if (props) {
        const eventProps = Object.entries(props).filter(([key]) => key.match(/^on[A-Z]/));
        for (let [key, value] of eventProps) {
          const event = key[2].toLowerCase() + key.slice(3);
          element.addEventListener(event, (...args) => {
            if (element.context) {
              element.context.parentPathHack = element.parentPath;
            }
            return value(...args);
          });
        }

        const nonSpecialProps = Object.entries(props).filter(([key]) => !key.match(/(^dd-|on[A-Z])/));
        for (let [key, value] of nonSpecialProps) {
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

      element.mounted = (parentContext, parentPath) => {
        if (element.isMounted) return;
        element.parentPath = parentPath || element.parentPath;
        element.isMounted = true;
        const context = element.context || parentContext;
        if (context) {
          hodors.push(...ddProps(data, element, props));
          context.mounted(parentPath);
          element.context = context;
        }
        for (let hodor of hodors) {
          hodor.mounted(parentPath);
        }
        element.childNodes.forEach(child => child.mounted && child.mounted(context, parentPath));
      };

      return element;
    }
  };

  function append(parent, view) {
    const element = React.createElement(view);
    parent.appendChild(element);
    element.mounted();
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
