import { Data } from '@eirikb/data';
import createHodor from './hodor';
import { ContextOptions, Domode, Hodor } from 'types';

export default function Context(
  data: Data,
  tagName: (contextOptions: ContextOptions) => HTMLElement,
  props,
  ...children: (Domode | Hodor)[]
) {
  children = children.flatMap(child => child);
  const mounteds: Function[] = [];
  const headlessHodors: Hodor[] = [];

  function on(path, listener) {
    const hasFlags = path.match(/ /);
    const hodor = createHodor(data, path, listener);
    if (hasFlags) {
      headlessHodors.push(hodor);
    }
    return hodor;
  }

  const self = {};

  const options: ContextOptions = {
    on: (path, listener) => on(path, listener),
    when: (path, options: (string | Function)[]) => {
      if (!Array.isArray(options)) {
        throw new Error('Second arguments must be an array');
      }
      return on(path, (...args: any[]) => {
        const res = args[0];
        const result: (Domode | Hodor)[] = [];
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
    mounted(cb: Function) {
      mounteds.push(cb);
    },
  } as ContextOptions;

  for (let [key, value] of Object.entries(props || {})) {
    options[key] = value;
  }

  self['on'] = options.on;
  self['mounted'] = () => {
    for (let mounted of mounteds) {
      mounted();
    }
  };
  const res = tagName(options);
  res['context'] = self;
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
