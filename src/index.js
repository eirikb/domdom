import Data from '@eirikb/data';
import Context from './context';
import ddProps from './dd-props';

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
        if (Array.isArray(child)) {
          removeAllInSlot(index);
          child.forEach((child, i) => {
            appendChild(index, child, (path || '') + i, sort);
          });
          return;
        }
        if (!removeChild(index, path, child)) {
          if (child.destroy) {
            child.destroy();
          }
          return;
        }
        if (typeof child !== 'boolean' && !child) return;

        let before = slots.slice(index + 1).find(slot => slot);
        if (typeof child === 'function') {
          child = child();
        }

        if (child.isHodor) {
          addHodor(index, child);
          return;
        }

        let toAdd = child;
        if (!(child instanceof HTMLElement)) {
          if (isProbablyPlainObject(child)) {
            toAdd = document.createTextNode(JSON.stringify(child));
          } else {
            toAdd = document.createTextNode(child);
          }
        }

        let beforeElement;
        if (before) {
          beforeElement = before;
        }

        const selfSlot = slots[index];
        if (path && sort === true) {
          sort = (a, b, aPath, bPath) => aPath.localeCompare(bPath)
        }

        let isFirst = true;
        let checkFirst = false;
        if (selfSlot && sort) {
          const keys = Object.keys(slots[index]).filter(key => key !== '$first');
          keys.push(path);
          keys.sort((a, b) => sort(data.get(a), data.get(b), a, b));
          const pos = keys.indexOf(path) + 1;
          isFirst = pos === 1;
          const beforeKey = keys[pos];
          if (beforeKey) {
            beforeElement = selfSlot[beforeKey];
          } else {
            checkFirst = true;
          }
        } else {
          checkFirst = true;
        }
        if (beforeElement) {
          if (checkFirst && beforeElement.$first) {
            beforeElement = beforeElement.$first;
          }
          element.insertBefore(toAdd, beforeElement);
        } else {
          element.appendChild(toAdd);
        }
        if (element.isMounted && toAdd.mounted) {
          toAdd.mounted(element.context);
        }
        const slot = (path && slots[index]) || {};
        if (path) {
          slot[path] = toAdd;
          slots[index] = slot;
          if (isFirst) {
            slot.$first = toAdd;
          }
        } else {
          slots[index] = toAdd;
        }
      };

      const removeChild = (index, path, child) => {
        let slot = slots[index];
        if (slot && path) {
          const pathSlot = slot[path];
          if (pathSlot) {
            const aHTML = (pathSlot || {}).outerHTML;
            const bHTML = (child || {}).outerHTML;
            if (aHTML && bHTML && aHTML === bHTML) {
              return false;
            }

            if (pathSlot === slot.$first) {
              slot.$first = pathSlot.nextSibling;
            }
            element.removeChild(pathSlot);
            if (pathSlot.destroy) {
              pathSlot.destroy();
            }
            delete slot[path];
            if (Object.keys(slot).filter(k => k !== '$first').length === 0) {
              delete slots[index];
            }
          }
          return true;
        }
        if (slot === child) return false;
        if (slot) {
          element.removeChild(slot);
          slot.destroy();
          delete slots[index];
        }
        return true;
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
