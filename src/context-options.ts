import { Data, ListenerCallback } from '@eirikb/data';
import { Domode } from 'types';
import { Hodor } from './hodor';

type Cond = (res: any, args: any[]) => boolean;

export type Child = Domode | Hodor;

type L = (listener: ListenerCallback) => Domode;

export class ContextOptions {
  data?: Data;
  mounteds?: (() => void)[] = [];
  children?: Child[] = [];

  constructor(data: Data, children: Child[]) {
    this.data = data;
    this.children = children;
    // TODO: props?!
    const props = {};
    for (let [key, value] of Object.entries(props || {})) {
      this[key] = value;
    }
  }

  on = (path: string, listener?: ListenerCallback): Hodor => {
    const hasFlags = path.match(/ /);
    const hodor = new Hodor(this.data!, path, listener);
    if (hasFlags) {
      // TODO:
      // this.headlessHodors.push(hodor);
    }
    return hodor;
  };

  when = (path, options: (string | Cond | L)[]) => {
    if (!Array.isArray(options)) {
      throw new Error('Second arguments must be an array');
    }
    return this.on!(path, (...args: any[]) => {
      const res = args[0];
      const result: (Domode | Hodor)[] = [];
      for (let i = 0; i < options.length; i += 2) {
        const cond = options[i];
        const listener = options[i + 1];
        let pass = false;
        if (typeof cond === 'function') {
          pass = (cond as Cond)(res, args);
        } else {
          pass = cond === res;
        }
        if (pass) {
          if (typeof listener === 'function') {
            result.push((listener as L)(args[0]));
          } else {
            throw new Error('Listener must be a function');
          }
        }
      }
      return result;
    });
  };
  unset? = (path: string) => {
    return this.data!.unset(path);
  };
  // set: (path: string, value: any, byKey?: string) =>
  //     data.set(path, value, byKey),
  // get: data.get,
  // trigger: data.trigger,
  mounted? = (cb: () => void) => {
    this.mounteds!.push(cb);
  };
}
