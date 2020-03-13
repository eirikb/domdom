import Pathingen from './pathingen';

export default (data, path, listener) => {
  if (!listener) {
    listener = _ => _;
  }
  let stower, or, index;
  const pathingen = Pathingen();

  const stowerPlayback = [];
  stower = {
    add: (...args) => stowerPlayback.push({ type: 'add', args }),
    remove: (...args) => stowerPlayback.push({ type: 'remove', args })
  };

  const hodor = {
    listeners: [],
    path,
    isHodor: true,
    or(o) {
      or = o;
      return hodor;
    },
    filter(filter) {
      pathingen.filterer = (a, b) => filter(data.get(a), data.get(b));
      return hodor;
    },
    sort(sort) {
      pathingen.sorter = (a, b) => sort(data.get(a), data.get(b));
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
    destroy() {
      data.off(hodor.listeners.join(' '));
    }
  };

  const hasFlags = path.match(/ /);
  if (hasFlags) {
    hodor.listeners.push(data.on(path, listener));
    return hodor;
  }

  const elements = {};
  const listen = (path) => {
    hodor.listeners.push(data.on('!+* ' + path, (...args) => {
      const path = args[1].path;
      const res = listener(...args);

      let subIndex;
      if (elements[path]) {
        subIndex = pathingen.indexOfPath(path);
        stower.remove(index, subIndex);
      } else {
        subIndex = pathingen.addPath(path);
      }

      if (subIndex < 0) return;

      if (typeof res !== 'undefined') {
        if (Object.keys(elements).length === 0 && or) {
          stower.remove(index, 0, 0);
        }
        stower.add(res, index, subIndex);
        if (res.onPath) {
          res.onPath(path);
        }
        elements[path] = res;
      } else {
        pathingen.removePath(path);
        delete elements[path];
      }
    }));
    hodor.listeners.push(data.on('- ' + path, (...args) => {
      const path = args[1].path;
      delete elements[path];
      const subIndex = pathingen.removePath(path);
      stower.remove(index, subIndex);
      if (Object.keys(elements).length === 0 && or) {
        stower.add(or, index, 0);
      }
    }));
    return hodor;
  };

  if (path.match(/^>\./)) {
    hodor.bounce = (parentPath) => {
      listen(parentPath + path.slice(1));
    };
    return hodor;
  }

  listen(path);
  return hodor;
};
