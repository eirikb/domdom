import { isProbablyPlainObject } from './dom-stower';
import { Domdom } from './domdom';

export const godMode = <T = any>(domdom: Domdom) => {
  const pathSymbol = Symbol('Path');

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
    if (o === undefined) {
      return proxify({}, path);
    }

    if (!(isProbablyPlainObject(o) || Array.isArray(o))) {
      return o;
    }

    const proxied = Symbol('Proxied');
    o[proxied] = true;

    return new Proxy(o, {
      set: function(target, key, value) {
        if (!target[proxied]) {
          value = proxify(value, path.concat(String(key)));
        }
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
        if (key === pathSymbol) {
          return path;
        }
        let value = target[key];
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

  domdom.data.set('', proxify({}));
  const o = {
    on(input: any) {
      const path = o.pathOf(input);
      return domdom.on(path.join('.'));
    },
    onChild(input: any) {
      const path = o.pathOf(input);
      return domdom.on(path.concat('$').join('.'));
    },
    pathOf(t: any): string[] {
      return t[pathSymbol];
    },
    data: proxify({}) as T,
  };
  return o;
};
