import { isProbablyPlainObject } from './dom-stower';
import { Domdom } from './domdom';
import { Data } from '@eirikb/data';

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

export class GodMode<T> extends Domdom {
  public data: T;

  constructor(data: Data) {
    super(data);

    this.data = this.proxify({}) as T;
  }

  private _set = (path: string[], value: any) => {
    if (isProbablyPlainObject(value)) {
      value = Object.assign({}, value);
    } else if (Array.isArray(value)) {
      value = value.slice();
    }
    this.set(path.join('.'), value);
  };

  private _unset = (path: string[]) => {
    this.unset(path.join('.'));
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
        if (key === pathSymbol) return path;
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

  path = <X = T>(cb: (o: X) => any): string => {
    return cb(p({}))[pathSymbol].join('.');
  };
}
