import Data from '@eirikb/data';
import {isPlainObject} from '@eirikb/data/src/common';

export default (data = Data()) => {
  const React = {
    createElement(tagName, props, ...children) {
      if (typeof tagName === 'function') {
        this.listeners = [];
        this.mounteds = [];
        const onA = on.bind(this);
        const mountedA = mounted.bind(this);

        const options = {
          input: (props || {})['dd-input'],
          on: onA,
          mounted: mountedA,
          text: path => onA(path, res => res),
          when: (path, options) => {
            if (!Array.isArray(options)) {
              throw new Error('Second arguments must be an array');
            }
            return onA(path, (...args) => {
              const res = args[0];
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
                    result.push(listener(...args));
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
          get: data.get,
          trigger: data.trigger
        };

        Object.entries(props || {})
          .filter(([key]) => key.match(/^dd-input-/))
          .forEach(([key, value]) =>
            options[key.split('-').slice(2).join('')] = value
          );

        const res = tagName(options);
        res.listeners = this.listeners;
        return res;
      }

      const slots = [];
      const hodors = [];
      const element = document.createElement(tagName);
      element.listeners = [];

      function mounted(cb) {
        this.mounteds.push(cb);
      }

      function on(path, listener, sort) {
        const listeners = this.listeners;

        const hasFlags = path.match(/ /);
        if (hasFlags) {
          listeners.push(data.on(path, listener));
          return;
        }

        const hodor = {
          listeners,
          path,
          toAdd: [],
          isHodor: true,
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
            if (typeof res !== 'undefined' && hodor.add) {
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
      }

      function destroy() {
        eachChild(child => {
          child.destroy();
        });
        if (element && element.listeners) {
          data.off(element.listeners.join(' '));
        }
      }

      function appendChild(index, child, path, sort) {
        if (Array.isArray(child)) {
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
          toAdd.mounted();
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

      function removeChild(index, path, child) {
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
          element.addEventListener('input', () => {
            const value = element.type === 'checkbox' ? element.checked : element.value;
            data.set(model, value)
          });
          element.addEventListener('value', () => data.set(model, element.value));
          element.addEventListener('checked', () => data.set(model, element.value));
          on.bind(this)(model, (value) => element.value = value);
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
      element.mounted = () => {
        if (element.isMounted) return;
        element.isMounted = true;
        for (let mounted of this.mounteds) {
          mounted();
        }
        this.mounteds = [];
        eachChild(child => child.mounted());
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
