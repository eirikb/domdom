export default function Context(data, tagName, props, ...children) {
  const listeners = [];
  const mounteds = [];

  const options = {
    on: (path, listener, sort) => on(path, listener, sort),
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
    trigger: data.trigger,
    children,
    mounted(cb) {
      mounteds.push(cb)
    }
  };

  for (let [key, value] of Object.entries(props || {})) {
    options[key] = value;
  }

  const on = (path, listener, sort) => {
    if (!listener) {
      listener = _ => _;
    }
    const hasFlags = path.match(/ /);
    if (hasFlags) {
      listeners.push(data.on(path, listener));
      return;
    }

    const hodor = {
      listeners: [],
      path,
      toAdd: [],
      isHodor: true,
      or: (or) => {
        hodor.orValue = or;
        const hasValue = data.get(path);
        if (!hasValue) {
          hodor.toAdd.push({ res: or, path, isOr: true });
        }
        return hodor;
      },
      filter: (filter) => {
        hodor._filter = filter;
        return hodor;
      }
    };

    const listen = (path) => {
      hodor.listeners.push(data.on('!+* ' + path, (...args) => {
        const path = args[1].path;
        const res = listener(...args);

        if (hodor._filter && !hodor._filter(args[0])) {
          return;
        }

        // Remove all 'ors'
        hodor.toAdd
          .filter(res => res.isOr)
          .forEach(({ path }) => hodor.remove(path));

        hodor.toAdd = [{ res, path }];
        if (typeof res !== 'undefined' && hodor.add) {
          hodor.add({ res, path, sort });
        }
      }));
      hodor.listeners.push(data.on('- ' + path, (...args) => {
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

  this.on = options.on;
  this.mounted = () => {
    for (let mounted of mounteds) {
      mounted();
    }
  };
  const res = tagName(options);
  res.context = this;
  const destroy = res.destroy;
  res.destroy = () => {
    data.off(listeners.join(' '));
    destroy();
  };
  return res;
}
