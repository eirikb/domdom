export default (data, path, listener) => {
  if (!listener) {
    listener = _ => _;
  }
  let filter, sort, stower, or, index;

  const hodor = {
    listeners: [],
    path,
    isHodor: true,
    or(o) {
      or = o;
      return hodor;
    },
    filter(f) {
      filter = f;
      return hodor;
    },
    sort(s) {
      sort = s;
      return hodor;
    },
    stower(i, s) {
      index = i;
      stower = s;
      if (or) {
        stower.add(or, index);
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

  const listen = (path) => {
    let first = true;
    hodor.listeners.push(data.on('!+* ' + path, (...args) => {
      const path = args[1].path;
      const res = listener(...args);

      if (filter && !filter(args[0])) {
        return;
      }

      if (typeof res !== 'undefined' && stower) {
        if (first && or) {
          stower.remove(index);
          first = false;
        }
        stower.add(res, index, path);
      }
    }));
    hodor.listeners.push(data.on('- ' + path, (...args) => {
      if (stower) {
        const path = args[1].path;
        stower.remove(index, path);
        if (or) {
          hodor.add(or, index);
        }
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
