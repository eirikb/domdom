import Hodor from './hodor';

export default function Context(data, tagName, props, ...children) {
  const mounteds = [];
  const headlessHodors = [];

  function on(path, listener) {
    const hasFlags = path.match(/ /);
    const hodor = Hodor(data, path, listener);
    if (hasFlags) {
      headlessHodors.push(hodor);
    }
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
  };

  const options = {
    on: (path, listener) => on(path, listener),
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
  this.mounted = () => {
    for (let mounted of mounteds) {
      mounted();
    }
  };
  const res = tagName(options);
  res.context = this;
  const destroy = res.destroy;
  res.destroy = () => {
    destroy();
    for (let hodor of headlessHodors) {
      hodor.destroy();
      headlessHodors.splice(0, headlessHodors.length);
    }
  };
  return res;
}
