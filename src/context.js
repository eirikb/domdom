export default function Context(data, tagName, props) {
  this.listeners = [];
  this.mounteds = [];

  const options = {
    input: (props || {})['dd-input'],
    on: (path, listener, sort) => on(path, listener, sort),
    mounted: (cb) => {
      this.mounteds.push(cb);
    },
    text: path => on(path, res => res),
    when: (path, options) => {
      if (!Array.isArray(options)) {
        throw new Error('Second arguments must be an array');
      }
      return on(path, (...args) => {
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

  const on = (path, listener, sort) => {
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
          hodor.toAdd.push({ res: or, path });
        }
        return hodor;
      }
    };

    const listen = (path) => {
      listeners.push(data.on('!+* ' + path, (...args) => {
        const path = args[1].path;
        const res = listener(...args);
        hodor.toAdd.push({ res, path });
        if (typeof res !== 'undefined' && hodor.add) {
          hodor.add({ res, path, sort });
        }
      }));
      listeners.push(data.on('- ' + path, (...args) => {
        const path = args[1].path;
        if (hodor.remove) {
          hodor.remove(path);
        }
        if (hodor.orValue && hodor.add) {
          hodor.add({ res: hodor.orValue, path, sort });
        }
      }));
      return hodor;
    };

    if (path.match(/^>\./)) {
      hodor.bounce = (parentPath) => {
        listen(parentPath + path.slice(1));
      };
      return hodor;
    }

    listen(path);
    return hodor;
  };

  const res = tagName(options);
  res.context = this;
  return res;
}
