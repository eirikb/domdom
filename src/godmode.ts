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

const p = (o, path: string[] = [], hack = false) => {
  const oldPath = (o || {})[pathSymbol];
  if (oldPath) path = oldPath;
  if (!o || !isProbablyPlainObject(o)) o = {};
  return new Proxy(o, {
    get: (target, key) => {
      if (hack) {
        path.pop();
        key = '$' + String(key);
        hack = false;
      }

      if (key === pathSymbol) return path;
      else if (key === '$path') return path.join('.');
      else if (key === '$x') key = '*';
      else if (key === '$xx') key = '**';
      else if (key === '$$') hack = true;

      return p(target[key], path.concat(String(key)), hack);
    },
  });
};

function pathus(path: string | PathOf): string {
  if (typeof path === 'string') return path;
  return path.$path;
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
        else if (key === '$path') return path.concat(key).join('.');

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

  don = (path: string | PathOf): Pathifier => {
    const pathAsString = pathus(path);

    const self = this;
    const pathifier = this.domdom.don(pathAsString);
    pathifier.addTransformer(
      new (class extends BaseTransformer {
        entries: Entries = new Entries();

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

  trigger = (path: string | PathOf, value?: any) => {
    return this.domdom.trigger(pathus(path), value);
  };

  get = <T = any>(path?: string | PathOf): T | undefined => {
    if (!path) return this.domdom.get();
    return this.domdom.get(pathus(path));
  };

  set = (path: string | PathOf, value: any, byKey?: string) => {
    this.domdom.set(pathus(path), value, byKey);
  };

  unset = (path: string | PathOf) => {
    this.domdom.unset(pathus(path));
  };

  on = <T = any>(
    flags: string,
    path: string | PathOf,
    listener: ListenerCallbackWithType<T>
  ): string => {
    return this.domdom.on([flags, pathus(path)].join(' '), (value, opts) =>
      listener(this.proxify(deregulate(value), opts.path.split('.')), opts)
    );
  };

  init = (parent: HTMLElement, child?: HTMLElement) =>
    this.domdom.init(parent, child);

  pathOf<X = T>(o?: X): PathOf<X> {
    return p(o) as PathOf<X>;
  }
}

export type PathOf<T = unknown> = {
  [P in keyof T]: PathOf<T[P]>;
} &
  (T extends Array<infer A>
    ? {
        $path: string;
        $: PathOf<A>;
        $x: PathOf<A>;
        $xx: PathOf<A>;
        $$: {
          [key: string]: PathOf<A>;
        };
        [index: number]: PathOf<A>;
      }
    : {
        $path: string;
        $: PathOf<T>;
        $x: PathOf<T>;
        $xx: PathOf<T>;
        $$: {
          [key: string]: PathOf<T>;
        };
      });
