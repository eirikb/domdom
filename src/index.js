import Data from '@eirikb/data';
import {isPlainObject} from '../node_modules/@eirikb/data/src/common';

export default (data = Data()) => {
  const React = {
    createElement(tagName, props, ...children) {
      if (typeof tagName === 'function') {
        const options = {
          input: (props || {})['dd-input'],
          on,
          text: path => on(path, res => res),
          when: (path, options) => {
            if (!Array.isArray(options)) {
              throw new Error('Second arguments must be an array');
            }
            return on(path, (res, args) => {
              const result = [];
              for (let i = 0; i < options.length; i += 2) {
                const cond = options[i];
                const listener = options[i + 1];
                let pass = false;
                if (typeof cond === 'function') {
                  pass = cond(res, args);
                } else {
                  pass = cond === res;
                }
                if (pass) {
                  if (typeof listener === 'function') {
                    result.push(React.createElement((options) => listener(res, options)));
                  } else {
                    result.push(listener);
                  }
                } else {
                  result.push(null);
                }
              }
              return result;
            });
          },
          unset: data.unset,
          set: data.set,
          trigger: data.trigger
        };

        Object.entries(props || {})
          .filter(([key]) => key.match(/^dd-input-/))
          .forEach(([key, value]) =>
            options[key.split('-').slice(2).join('')] = value
          );

        return tagName(options);
      }

      const slots = [];
      const hodors = [];
      const element = document.createElement(tagName);

      function on(path, listener, sort) {
        const listeners = [];

        const hasFlags = path.match(/ /);
        if (!hasFlags) {
        }

        const hodor = {
          path,
          toAdd: [],
          isHodor: true,
          unlisten() {
            data.off(listeners.join(' '));
          },
          or: (or) => {
            hodor.orValue = or;
            const hasValue = data.get(path);
            if (!hasValue) {
              hodor.toAdd.push({res: or, path});
            }
            return hodor;
          }
        };

        function listen(path) {
          listeners.push(data.on('!+* ' + path, (...args) => {
            const path = args[1].path;
            const res = listener(...args);
            hodor.toAdd.push({res, path});
            if (res && hodor.add) {
              hodor.add({res, path, sort});
            }
          }));
          listeners.push(data.on('- ' + path, (...args) => {
            const path = args[1].path;
            if (hodor.remove) {
              hodor.remove(path);
            }
            if (hodor.orValue && hodor.add) {
              hodor.add({res: hodor.orValue, path, sort});
            }
          }));
          return hodor;
        }

        if (path.match(/^>\./)) {
          hodor.bounce = (parentPath) => {
            listen(parentPath + path.slice(1));
          };
          return hodor;
        }

        listen(path);
        return hodor;
      }

      function eachChild(cb) {
        for (let slot of slots) {
          if (slot.destroy) {
            cb(slot);
          }
          for (let subSlot of Object.values(slot)) {
            if (subSlot.destroy) {
              cb(subSlot);
            }
          }
        }
      }

      function destroy() {
        eachChild(child => {
          child.destroy();
        });
        for (let hodor of hodors) {
          hodor.unlisten();
        }
      }


      function appendChild(index, child, path, sort) {
        if (Array.isArray(child)) {
          child.forEach((child, i) => {
            appendChild(index, child, (path || '') + i, sort);
          });
          return;
        }
        removeChild(index, path);
        if (!child) return;

        let before = slots.slice(index + 1).find(slot => slot);
        if (typeof child === 'function') {
          child = child();
        }

        let toAdd = child;
        if (typeof child === 'string') {
          toAdd = document.createTextNode(child);
        }

        let beforeElement;
        if (before) {
          beforeElement = before;
        }

        const selfSlot = slots[index];
        if (path && !sort) {
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
      }

      function removeChild(index, path) {
        let slot = slots[index];
        if (slot && path) {
          const pathSlot = slot[path];
          if (pathSlot) {
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
          return;
        }
        if (slot) {
          element.removeChild(slot);
          slot.destroy();
          delete slots[index];
        }
      }

      function setElementValue(key, value) {
        if (value && value.then) {
          value.then(res => setElementValue(key, res));
        } else {
          if (isPlainObject(value) && element[key]) {
            Object.assign(element[key], value);
          } else {
            element[key] = value;
          }
        }
      }

      let counter = 0;
      for (let child of [].concat(...children)) {
        const index = counter++;
        if (typeof child === 'undefined') {
        } else if (child.isHodor) {
          hodors.push(child);
          child.add = ({res, path, sort}) => {
            appendChild(index, res, path, sort);
            if (res.onPath) {
              res.onPath(path);
            }
          };
          child.remove = (path) => {
            removeChild(index, path);
          };
          for (let {res, path} of child.toAdd) {
            appendChild(index, res, path);
          }
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

        const model = props['dd-model'];
        if (model) {
          element.addEventListener('keyup', () => data.set(model, element.value));
          element.addEventListener('input', () => data.set(model, element.value));
          element.addEventListener('value', () => data.set(model, element.value));
          on(model, (value) => element.value = value);
        }

        const nonSpecialProps = Object.entries(props).filter(([key]) => !key.match(/(^dd-|on[A-Z])/));
        for (let [key, value] of nonSpecialProps) {
          if (key === 'class') {
            key = 'className';
          }
          setElementValue(key, value);
        }
      }

      element.destroy = destroy;
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
    data,
    render(template) {
      return React.createElement(template);
    }
  }
}
