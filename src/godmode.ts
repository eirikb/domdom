import { isProbablyPlainObject } from './dom-stower';
import { Domdom } from './domdom';

export const godMode = <T>(domdom: Domdom) => {
  const pathSymbol = Symbol('Path');
  const proxiedSymbol = Symbol('Proxied');

  const set = (path: string[], value: any) => {
    if (isProbablyPlainObject(value)) {
      value = Object.assign({}, value);
    } else if (Array.isArray(value)) {
      value = value.slice();
    }
    domdom.set(path.join('.'), value);
  };

  const unset = (path: string[]) => {
    domdom.unset(path.join('.'));
  };

  function proxify(o: any, path: string[] = []) {
    if (!(isProbablyPlainObject(o) || Array.isArray(o))) {
      return o;
    }

    if (o[proxiedSymbol]) return o;

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
        if (key === pathSymbol) return path;
        else if (key === proxiedSymbol) return true;

        const value = target[key];
        if (typeof value === 'function') {
          return (...args) => {
            const res = value.call(target, ...args);
            set(path, target);
            return res;
          };
        }
        return proxify(value, path.concat(String(key)));
      },
    });
  }

  const p = (o, path: string[] = []) => {
    const oldPath = (o || {})[pathSymbol];
    if (oldPath) path = oldPath;
    if (!o || !isProbablyPlainObject(o)) o = {};
    return new Proxy(o, {
      get(target, key) {
        if (key === pathSymbol) return path;
        return p(target[key], path.concat(String(key)));
      },
    });
  };

  return {
    pathOf<X = T>(cb: (o: X) => any): string {
      return cb(p({}))[pathSymbol].join('.');
    },
    data: proxify({}) as T,
  };
};
