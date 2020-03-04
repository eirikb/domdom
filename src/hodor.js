export default (data, path, listener, sort) => {
  if (!listener) {
    listener = _ => _;
  }
  const hodor = {
    listeners: [],
    path,
    toAdd: [],
    isHodor: true,
    or: (or) => {
      hodor.orValue = or;
      const hasValue = data.get(path);
      if (!hasValue) {
        hodor.toAdd.push({ res: or, path, isOr: true });
      }
      return hodor;
    },
    filter: (filter) => {
      hodor._filter = filter;
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
    hodor.listeners.push(data.on('!+* ' + path, (...args) => {
      const path = args[1].path;
      const res = listener(...args);

      if (hodor._filter && !hodor._filter(args[0])) {
        return;
      }

      // Remove all 'ors'
      hodor.toAdd
        .filter(res => res.isOr)
        .forEach(({ path }) => hodor.remove(path));

      hodor.toAdd = [{ res, path }];
      if (typeof res !== 'undefined' && hodor.add) {
        hodor.add({ res, path, sort });
      }
    }));
    hodor.listeners.push(data.on('- ' + path, (...args) => {
      const path = args[1].path;
      if (hodor.remove) {
        hodor.remove(path);
      }
      if (hodor.orValue && hodor.add) {
        hodor.add({ res: hodor.orValue, path, sort });
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
