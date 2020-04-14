export default (data, path, listener) => {
  const listenerSet = !!listener;
  if (!listener) {
    listener = _ => _;
  }
  if (typeof listener !== 'function') {
    throw new Error('Listener must be a function');
  }

  let stower, _or, index, pathifier, reListen, listening;
  let _filter, _filterOn, _sort, _sortOn, _map;

  const listeners = [];

  function on(flagsAndPath, cb) {
    const ref = data.on(flagsAndPath, cb);
    listeners.push({ flagsAndPath, cb, ref });
  }

  let isMounted = false;
  const hodor = {
    path,
    isHodor: true,
    or(or) {
      _or = or;
      return hodor;
    },
    filter(filter) {
      _filter = filter;
      return hodor;
    },
    filterOn(path, filter) {
      _filterOn = { path, filter };
      return hodor;
    },
    sort(sort) {
      _sort = sort;
      return hodor;
    },
    sortOn(path, sort) {
      _sortOn = { path, sort };
      return hodor;
    },
    map(map) {
      if (listenerSet) {
        throw new Error(`Sorry, can't combine listener and map`);
      }
      _map = map;
      return hodor;
    },
    stower(i, s) {
      index = i;
      stower = s;
      if (_or) {
        stower.or(_or, index);
      }
      return hodor;
    },
    mounted(parentPath) {
      if (isMounted) {
        return;
      }
      isMounted = true;
      if (typeof hodor.listen === 'function') {
        hodor.listen(path, parentPath);
      }
    },
    destroy() {
      isMounted = false;
      hodor.off();
    },
    off() {
      if (pathifier) pathifier.off();
      for (let listener of listeners.filter(l => l.ref)) {
        data.off(listener.ref);
        delete listener.ref;
      }
      listening = false;
    },
    paths: [],
    listen: (path, parentPath) => {
      if (listening) {
        return;
      }
      // hodor.off();
      listening = true;
      if (!stower) {
        reListen = { parentPath };
        return;
      }
      path = path.replace(/^>/, parentPath);
      if (!_map) {
        on(`!+* ${path}`, (val, { path }) => {
          const subIndex = hodor.paths.indexOf(path);
          if (subIndex >= 0) {
            hodor.paths.splice(subIndex, 1);
            stower.remove(index, subIndex);
          }
          stower.add(listener(val), index, hodor.paths.length, path);
          hodor.paths.push(path);
        });
        on(`- ${path}`, (_, { path }) => {
          const subIndex = hodor.paths.indexOf(path);
          hodor.paths.splice(subIndex, 1);
          stower.remove(index, subIndex);
        });
        return;
      }
      pathifier = data.on(path);
      if (_map) pathifier.map(_map);
      if (_filter) pathifier.filter(_filter);
      if (_filterOn) pathifier.filterOn(_filterOn.path, _filterOn.filter);
      if (_sort) pathifier.sort(_sort);
      if (_sortOn) pathifier.sortOn(_sortOn.path, _sortOn.sort);
      pathifier.toArray({
        add(subIndex, p, value) {
          const parentPath = [path, p].join('.');
          stower.add(value, index, subIndex, parentPath);
        },
        remove(subIndex) {
          stower.remove(index, subIndex);
        }
      });
    }
  };

  const hasFlags = path.match(/ /);
  if (hasFlags) {
    on(path, listener);
    return hodor;
  }

  return hodor;
};
