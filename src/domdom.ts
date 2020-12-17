import { Data, Pathifier } from '@eirikb/data';
import {
  DomStower,
  isProbablyPlainObject,
  StowerTransformer,
} from './dom-stower';
import { DomSquint } from './dom-squint';
import ddProps from './dd-props';
import { Domode, Opts } from './types';
import { DomPathifier } from './pathifier';

export class React {
  private readonly data: Data;

  constructor(data: Data) {
    this.data = data;
  }

  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode {
    children = [].concat(...children);

    if (typeof input === 'function') {
      const cbs: (() => void)[] = [];
      const options: Opts = {
        children,
        mounted(cb) {
          cbs.push(cb);
        },
      };
      const res = input({ ...props }, options) as Domode;
      res.mountables.push({
        mounted() {
          for (const cb of cbs) {
            cb();
          }
        },
        unmounted() {},
      });
      return res;
    }

    const el = document.createElement(input) as Domode;
    el.mountables = [];

    el.mounted = () => {
      for (const mountable of el.mountables) {
        mountable.mounted();
      }
    };
    el.unmounted = () => {
      for (let mountable of el.mountables) {
        mountable.unmounted();
      }
    };

    const stower = new DomStower(el);

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child instanceof DomPathifier) {
        el.mountables.push(child);
        child.transformer = new StowerTransformer(stower, index);
      } else {
        stower.add(child, index);
      }
    }

    ddProps(this.data, el.mountables, el, props);

    return el;
  }
}

export class Domdom {
  public readonly data: Data;
  React: React;

  constructor(data: Data) {
    this.data = data;
    this.React = new React(this.data);
  }

  on = (path: string): Pathifier => {
    return new DomPathifier(this.data, path);
  };

  set = (path: string, value: any, byKey?: string) => {
    this.data.set(path, value, byKey);
  };

  unset = (path: string) => {
    this.data.unset(path);
  };

  get = <T = any>(path?: string): T | undefined => {
    if (!path) return this.data.get();
    return this.data.get(path);
  };

  trigger = (path: string, value?: any) => {
    return this.data.trigger(path, value);
  };

  init = (parent: HTMLElement, child?: HTMLElement) => {
    const domSquint = new DomSquint(parent);
    domSquint.init();
    if (child) {
      parent.appendChild(child);
    }
  };

  behold = <T = any>(): T => {
    const set = (path: string[], value: any) => {
      this.set(path.join('.'), value);
    };

    const unset = (path: string[]) => {
      this.unset(path.join('.'));
    };

    function proxify(o: any, path: string[] = []) {
      return new Proxy(o, {
        set: function(target, key, value) {
          const p = path.concat(String(key));
          set(p, value);
          target[key] = value;
          return true;
        },
        deleteProperty: function(target, key) {
          unset(path.concat(String(key)));
          return delete target[key];
        },
        get: function(target, key) {
          if (typeof target[key] === 'function') {
            return (...args) => {
              target[key](...args);
              set(path, target);
            };
          }
          let value = target[key];
          if (isProbablyPlainObject(value)) {
            value = Object.assign({}, value);
          } else if (Array.isArray(value)) {
            value = value.slice();
          }
          target[key] = value;
          return proxify(value, path.concat(String(key)));
        },
      });
    }

    return proxify({});
  };
}
