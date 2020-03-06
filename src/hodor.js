export default (data, path, listener) => {
  if (!listener) {
    listener = _ => _;
  }
  let filter, sort, stower, or, index;

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
        stower.add(or, index, '_');
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

  const listen = (path) => {
    let first = true;
    let subIndex = 0;
    hodor.listeners.push(data.on('!+* ' + path, (...args) => {
      const path = args[1].path;
      const res = listener(...args);

      if (filter && !filter(args[0])) {
        return;
      }

      if (typeof res !== 'undefined') {
        if (first && or) {
          stower.remove(index, 0);
          first = false;
        }
        stower.add(res, index, subIndex);
        subIndex++;
      }
    }));
    hodor.listeners.push(data.on('- ' + path, (...args) => {
      const path = args[1].path;
      // TODO: deprecating is bad
      subIndex--;
      stower.remove(index, subIndex);
      if (or) {
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
