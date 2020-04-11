import Hodor from './hodor';

export default function Context(data, tagName, props, ...children) {
  const hodors = [];
  const mounteds = [];

  function on(path, listener, sort) {
    const hodor = Hodor(data, path, listener, sort);
    hodors.push(hodor);
    return hodor;
  }

  const parentPathHackProxy = (fn) => {
    return (path, ...args) => {
      if (path.startsWith('>')) {
        if (typeof this.parentPathHack === 'string') {
          path = path.replace(/^>/, this.parentPathHack);
        } else {
          throw new Error(`Parent path >. used but no parent path set! Most likely a domdombug. Path: ${path}`);
        }
      }
      return fn(path, ...args);
    };
  }

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
              throw new Error('Listener must be a function');
            }
          } else {
            result.push(null);
          }
        }
        return result;
      });
    },
    unset: parentPathHackProxy(data.unset),
    set: parentPathHackProxy(data.set),
    get: parentPathHackProxy(data.get),
    trigger: parentPathHackProxy(data.trigger),
    children,
    mounted(cb) {
      mounteds.push(cb)
    }
  };

  for (let [key, value] of Object.entries(props || {})) {
    options[key] = value;
  }

  this.on = options.on;
  this.mounted = (parentPath) => {
    for (let mounted of mounteds) {
      mounted();
    }
    for (let hodor of hodors) {
      hodor.mounted(parentPath);
    }
  };
  const res = tagName(options);
  res.context = this;
  const destroy = res.destroy;
  res.destroy = () => {
    for (let hodor of hodors) {
      hodor.destroy();
    }
    destroy();
  };
  return res;
}
