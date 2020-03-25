import Pathingen from './pathingen';

export default (data, path, listener) => {
  if (!listener) {
    listener = _ => _;
  }
  if (typeof listener !== 'function') {
    throw new Error('Listener must be a function');
  }

  let stower, or, index;
  const pathingen = Pathingen();

  const stowerPlayback = [];
  stower = {
    add: (...args) => stowerPlayback.push({ type: 'add', args }),
    remove: (...args) => stowerPlayback.push({ type: 'remove', args }),
    reorderSubIndexes: () => true
  };

  const listeners = [];

  function on(flagsAndPath, cb) {
    const ref = data.on(flagsAndPath, cb);
    listeners.push({ flagsAndPath, cb, ref });
  }

  const elements = {};
  let isMounted = false;
  const hodor = {
    path,
    isHodor: true,
    or(o) {
      or = o;
      return hodor;
    },
    filter(filter) {
      pathingen.filterer = (a) => filter(data.get(a));
      return hodor;
    },
    filterOn(path, filter) {
      pathingen.filterer = (a) => filter(data.get(path), data.get(a));
      on(`!+* ${path}`, () => {
        const res = pathingen.update();
        res.children = res.paths.map(path => elements[path]);
        stower.reorderSubIndexes(index, res);
      });
      return hodor;
    },
    sort(sort) {
      pathingen.sorter = (a, b) => sort(data.get(a), data.get(b));
      return hodor;
    },
    sortOn(path, sort) {
      pathingen.sorter = (a, b) => sort(data.get(path), data.get(a), data.get(b));
      on(`!+* ${path}`, () => {
        const res = pathingen.update();
        res.children = res.paths.map(path => elements[path]);
        stower.reorderSubIndexes(index, res);
      });
      return hodor;
    },
    stower(i, s) {
      index = i;
      stower = s;
      if (or) {
        stower.add(or, index, 0);
      }
      for (let { type, args } of stowerPlayback) {
        args[1] = index;
        stower[type](...args);
      }
      return hodor;
    },
    mounted() {
      if (isMounted) return;
      isMounted = true;
      listen && listen(path);
      for (let listener of listeners.filter(l => !l.ref)) {
        listener.ref = data.on(listener.flagsAndPath, listener.cb);
      }
    },
    destroy() {
      isMounted = false;
      for (let listener of listeners.filter(l => l.ref)) {
        data.off(listener.ref);
        delete listener.ref;
      }
    }
  };

  const hasFlags = path.match(/ /);
  if (hasFlags) {
    on(path, listener);
    return hodor;
  }

  const listen = (path) => {
    on('!+* ' + path, (...args) => {
      const path = args[1].path;
      const res = typeof listener === 'function' ? listener(...args) : listener;

      const pathingenPathsLength = pathingen.paths.length;
      let subIndex;
      if (elements[path]) {
        subIndex = pathingen.indexOfPath(path);
        if (subIndex >= 0) {
          stower.remove(index, subIndex);
        }
      } else {
        subIndex = pathingen.addPath(path);
      }

      elements[path] = res;
      if (subIndex < 0) return;

      if (typeof res !== 'undefined') {
        if (pathingenPathsLength === 0 && or) {
          stower.remove(index, 0, 0);
        }
        stower.add(res, index, subIndex);
        if (res.onPath) {
          res.onPath(path);
        }
      } else {
        pathingen.removePath(path);
        delete elements[path];
      }
    });
    on('- ' + path, (...args) => {
      const path = args[1].path;
      delete elements[path];
      const subIndex = pathingen.removePath(path);
      stower.remove(index, subIndex);
      if (pathingen.paths.length === 0 && or) {
        stower.add(or, index, 0);
      }
    });
    return hodor;
  };

  if (path.match(/^>\./)) {
    hodor.bounce = (parentPath) => {
      listen(parentPath + path.slice(1));
    };
    return hodor;
  }

  return hodor;
};
