import { Transformer } from '@eirikb/data';
import { isProbablyPlainObject } from './dom-stower';
import {
  BaseTransformer,
  Entries,
  Entry,
  ListenerCallbackWithType,
  Pathifier,
} from '@eirikb/data';
import { Domdom } from 'domdom';
import { React } from './types';

const pathSymbol = Symbol('Path');
const proxiedSymbol = Symbol('Proxied');

const p = (o, path: string[] = []) => {
  const oldPath = (o || {})[pathSymbol];
  if (oldPath) path = oldPath;
  if (!o || !isProbablyPlainObject(o)) o = {};
  return new Proxy(o, {
    get: (target, key) => {
      if (key === pathSymbol) return path;
      return p(target[key], path.concat(String(key)));
    },
  });
};

function pathus(path: any): string {
  if (typeof path === 'string') return path;
  if (Array.isArray(path[pathSymbol])) {
    return path[pathSymbol].join('.');
  }
  throw new Error(`Path ${path} is not a proper path`);
}

function deregulate(value: any): any {
  if (isProbablyPlainObject(value)) {
    return Object.assign({}, value);
  } else if (Array.isArray(value)) {
    return value.slice();
  } else {
    return value;
  }
}

export class GodMode<T> {
  public data: T;
  public React: React;
  private readonly domdom: Domdom;

  constructor(domdom: Domdom) {
    this.domdom = domdom;
    this.data = this.proxify({}) as T;
    this.React = domdom.React;
  }

  private _set = (path: string[], value: any) => {
    value = deregulate(value);
    const p = path.join('.');
    if (Array.isArray(this.domdom.get(p))) {
      this.domdom.set(p, []);
    }
    this.domdom.set(p, value);
  };

  private _unset = (path: string[]) => {
    this.domdom.unset(path.join('.'));
  };

  private proxify(o: any, path: string[] = []) {
    if (!(isProbablyPlainObject(o) || Array.isArray(o))) {
      return o;
    }

    if (o[proxiedSymbol]) return o;

    return new Proxy(o, {
      set: (target, key, value) => {
        const p = path.concat(String(key));
        this._set(p, value);
        target[key] = value;
        return true;
      },
      deleteProperty: (target, key) => {
        this._unset(path.concat(String(key)));
        return delete target[key];
      },
      get: (target, key) => {
        if (key === 'constructor') return target[key];
        else if (key === pathSymbol) return path;
        else if (key === proxiedSymbol) return true;

        const value = target[key];
        if (typeof value === 'function') {
          return (...args) => {
            const res = value.call(target, ...args);
            this._set(path, target);
            return res;
          };
        }
        return this.proxify(value, path.concat(String(key)));
      },
    });
  }

  on = (path: any): Pathifier => {
    const pathAsString = pathus(path);

    const self = this;
    const pathifier = this.domdom.on(pathAsString);
    pathifier.addTransformer(
      new (class extends BaseTransformer {
        entries: Entries = new Entries();

        constructor() {
          super({} as Transformer);
        }

        private proxify(entry: Entry): Entry {
          entry.value = self.proxify(
            deregulate(entry.value),
            entry.opts.path.split('.')
          );
          return entry;
        }

        add(index: number, entry: Entry): void {
          this.next?.add(index, this.proxify(entry));
        }

        remove(index: number, entry: Entry): void {
          this.next?.remove(index, entry);
        }

        update(oldIndex: number, index: number, entry: Entry): void {
          this.next?.update(oldIndex, index, this.proxify(entry));
        }
      })()
    );
    return pathifier;
  };

  trigger = (path: any, value?: any) => {
    return this.domdom.trigger(pathus(path), value);
  };

  get = <T = any>(path?: any): T | undefined => {
    if (!path) return this.domdom.get();
    return this.domdom.get(pathus(path));
  };

  set = (path: any, value: any, byKey?: string) => {
    this.domdom.set(pathus(path), value, byKey);
  };

  unset = (path: any) => {
    this.domdom.unset(pathus(path));
  };

  globalOn = <T = any>(
    flags: string,
    path: any,
    listener: ListenerCallbackWithType<T>
  ): string => {
    return this.domdom.globalOn(
      [flags, pathus(path)].join(' '),
      (value, opts) =>
        listener(this.proxify(deregulate(value), opts.path.split('.')), opts)
    );
  };

  init = (parent: HTMLElement, child?: HTMLElement) =>
    this.domdom.init(parent, child);

  path = <X = T>(o?: X): X => {
    return p(o);
  };

  pathOf = <X = T>(o: X, cb: (o: X) => any): string => {
    return cb(p(o))[pathSymbol].join('.');
  };
}
