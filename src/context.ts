import { Data } from '@eirikb/data';
import Hodor from './hodor';

export interface ContextOptions {
  on?(path: string, listener?: Function);

  when?(path: string, options: any);

  unset?(path: string);

  set?(path: string, value: any);

  get?(path: string);

  trigger?(path: string, value: any);

  children?: Array<any>;

  mounted?(cb: Function);
}

export default function Context(
  data: Data,
  tagName: (contextOptions: ContextOptions) => HTMLElement,
  props,
  ...children
) {
  children = children.flatMap(child => child);
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

  const options: ContextOptions = {
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
    unset: data.unset,
    set: data.set,
    get: data.get,
    trigger: data.trigger,
    children,
    mounted(cb) {
      mounteds.push(cb);
    },
  } as ContextOptions;

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
  res['context'] = this;
  const destroy = res['destroy'];
  res['destroy'] = () => {
    destroy();
    for (let hodor of headlessHodors) {
      hodor.destroy();
      headlessHodors.splice(0, headlessHodors.length);
    }
  };
  return res;
}
