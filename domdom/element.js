export default (template, data) => {
  window.React = {
    createElement(tagName, props, ...children) {
      if (props && props['dd-if']) {
        const path = props['dd-if'];
        delete props['dd-if'];
        return {when: {path, listener: () => window.React.createElement(tagName, props, children)}};
      }
      const listeners = [];

      function destroy() {
        data.off(listeners.join(' '));
      }

      function create(data) {
        const element = typeof tagName === 'function' ? tagName().create(data) : document.createElement(tagName);

        const slots = {};

        function appendChild(index, child) {
          removeChild(index);
          if (!child) return;

          const position = Object.keys(slots).indexOf('' + index);
          const before = element.children[position];
          if (typeof child === 'function') child = child();
          let toAdd;
          if (child.create) toAdd = child.create(data);
          else toAdd = document.createTextNode(child);
          if (before) {
            element.insertBefore(toAdd, before.element);
          } else {
            element.appendChild(toAdd);
          }
          const slot = {element: toAdd};
          if (child.destroy) {
            slot.destroy = child.destroy;
          }
          slot.index = index;
          slots[index] = slot;
        }

        function removeChild(index) {
          const slot = slots[index];
          if (slot) {
            element.removeChild(slot.element);
            if (slot.destroy) {
              slot.destroy();
            }
            delete slots[index];
          }
        }

        function on(path, listener) {
          listeners.push(data.on('!+* ' + path, listener));
        }

        let counter = 0;
        for (let child of [].concat(...children)) {
          const index = counter++;
          if (typeof child === 'undefined') {
          } else if (child.create) {
            appendChild(index, child);
          } else if (child.when) {
            const l = child.when.listener;
            const whens = Array.isArray(l) ? l : [val => val, l];

            for (let i = 0; i < whens.length; i += 2) {
              on(child.when.path, res => {
                const conditional = whens[i];
                const listener = whens[i + 1];
                let add = false;
                if (typeof conditional === 'function') {
                  add = conditional(res);
                } else {
                  add = res === conditional;
                }
                if (add) {
                  appendChild(index + i, listener(res))
                } else {
                  removeChild(index + i);
                }
              });
            }
          } else if (child.on) {
            if (child.oror) {
              appendChild(index, child.oror);
            }
            on(child.on.path, res =>
              appendChild(index, child.on.listener(res))
            );
          } else if (child.text) {
            const text = document.createTextNode('');
            on(child.text.path, (value) => text.nodeValue = value);
            appendChild(index, text);
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
            on(model, (value) => element.value = value);
          }

          const nonSpecialProps = Object.entries(props).filter(([key]) => !key.match(/(^dd-|on[A-Z])/));
          for (let [key, value] of nonSpecialProps) {
            if (key === 'class') {
              key = 'className';
            }
            element[key] = value;
          }
        }

        return element;
      }

      return {destroy, create};
    }
  };

  function orWrapper(tag) {
    return (path, listener) => {
      const res = {[tag]: {path, listener}};
      res.or = (val) => {
        res.oror = val;
        return res;
      };
      return res;
    };
  }

  window.on = orWrapper('on');
  window.when = orWrapper('when');

  window.text = (path) => ({text: {path}});

  window.set = (path, value) => data.set(path, value);
  window.get = (path) => data.get(path);

  window.trigger = (path, value) => data.trigger(path, value);

  return template().create(data);
};

