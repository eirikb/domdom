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

        const slots = [];

        function appendChild(child, index) {
          slots.push(index);
          slots.sort();
          const position = slots.indexOf(index);
          if (position > 0) {
            element.insertBefore(child, element.children[position]);
          } else {
            element.appendChild(child)
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
            appendChild(child.create(data), index);
          } else if (child.when) {
            let prev;
            let holder;
            on(child.when.path, res => {
              holder = child.when.listener(res);
              if (prev) {
                element.removeChild(prev)
              }
              if (holder) {
                holder.destroy();
              }
              if (res) {
                const next = holder.create(data);
                appendChild(next, index);
                prev = next;
              } else {
                prev = null;
              }
            });
          } else if (child.on) {
            let prev;
            let holder;
            on(child.on.path, res => {
              holder = child.on.listener(res);
              if (prev) {
                element.removeChild(prev)
              }
              if (holder) {
                holder.destroy();
              }
              const next = holder.create(data);
              appendChild(next, index);
              prev = next;
            });
          } else if (child.text) {
            const text = document.createTextNode('');
            on(child.text.path, (value) => text.nodeValue = value);
            appendChild(text, index);
          } else {
            appendChild(document.createTextNode(child), index);
          }
        }

        if (props) {
          if (props.onClick) {
            element.addEventListener('click', props.onClick);
          }

          const model = props['dd-model'];
          if (model) {
            element.addEventListener('keyup', () => data.set(model, element.value));
            on(model, (value) => element.value = value);
          }
        }

        return element;
      }

      return {destroy, create};
    }
  };

  window.on = (path, listener) => ({on: {path, listener}});
  window.when = (path, listener) => ({when: {path, listener}});
  window.text = (path) => ({text: {path}});

  window.set = (path, value) => data.set(path, value);
  window.get = (path) => data.get(path);
  return template().create(data);
};

