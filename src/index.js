import Data from '@eirikb/data';
import Context from './context';
import ddProps from './dd-props';
import Stower from './stower';

export function isProbablyPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

export default (data = Data()) => {
  const React = {
    createElement(tagName, props, ...children) {
      if (typeof tagName === 'function') {
        return new Context(data, tagName, props, children);
      }

      let slots = [];
      let hodors = [];
      const element = document.createElement(tagName);
      const stower = Stower(element);

      const eachChild = (cb) => {
        for (let slot of slots) {
          if (slot) {
            if (slot.destroy) {
              cb(slot);
            }
            for (let subSlot of Object.values(slot)) {
              if (subSlot && subSlot.destroy) {
                cb(subSlot);
              }
            }
          }
        }
      };

      const destroy = () => {
        eachChild(child => {
          child.destroy();
        });
        for (let hodor of hodors) {
          if (hodor.listeners.length > 0) {
            data.off(hodor.listeners.join(' '));
          }
        }
        slots = [];
        hodors = [];
      };

      const removeAllInSlot = (index) => {
        if (!slots[index]) return;
        const keys = Object.keys(slots[index]).filter(key => !key.startsWith('$')).reverse();
        for (let key of keys) {
          removeChild(index, key);
        }
        delete slots[index];
      };

      const addHodor = (index, child) => {
        hodors.push(child);
        child.add = ({ res, path, sort }) => {
          appendChild(index, res, path, sort);
          if (res.onPath) {
            res.onPath(path);
          }
        };
        child.remove = (path) => {
          removeChild(index, path);
        };
        for (let { res, path } of child.toAdd) {
          appendChild(index, res, path);
        }
      };

      const appendChild = (index, child, path, sort) => {
        stower.add(child, index, path);
      };

      const removeChild = (index, path, child) => {
        stower.remove(index, path);
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
          element.addEventListener(event, value);
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

      element.destroy = destroy;
      element.mounted = (parentContext) => {
        if (element.isMounted) return;
        element.isMounted = true;
        const context = element.context || parentContext;
        if (context) {
          context.mounted();
          element.context = context;

          ddProps(data, context, element, props);
        }
        eachChild(child => child.mounted(context));
      };
      element.onPath = (path) => {
        eachChild(child => {
          child.onPath(path);
        });
        const bounced = hodors.filter(hodor => hodor.bounce);
        for (let hodor of bounced) {
          hodor.bounce(path);
        }
      };
      return element;
    }
  };

  window.React = React;
  if (typeof global !== 'undefined') {
    global.React = React;
  }

  return {
    append(parent, template) {
      const element = React.createElement(template);
      parent.appendChild(element);
      element.mounted();
    },
    ...data
  }
}
