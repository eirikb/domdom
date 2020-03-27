export default function (data, from) {
  const refs = [];

  // Cache is used for 'then', since there might not be a 'to'
  const cache = {};

  let _to, _filter, _filterOn, _sort, _sortOn, _asArray, _map, _then;

  // Default sort if none is specified
  _sort = (a, b, aPath, bPath) => aPath.localeCompare(bPath);

  function sortedIndex(path) {
    const d = data.get(_to) || {};
    const paths = Object.keys(d);

    let low = 0;
    let high = paths.length;

    while (low < high) {
      let mid = (low + high) >>> 1;
      if (_sort(d[path], d[paths[mid]], path, paths[mid]) > 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  const self = {
    filter(filter) {
      _filter = filter;
      return self;
    },
    filterOn(path, filter) {
      _filterOn = filter;
      refs.push(
        data.on(`!+* ${path}`, () => {
          update();
        })
      );
      return self;
    },
    map(map) {
      _map = map;
      return self;
    },
    sort(sort) {
      _sort = sort;
      return self;
    },
    sortOn(path, sort) {
      _sortOn = sort;
      refs.push(
        data.on(`!+* ${path}`, () => {
          update();
        })
      );
      return self;
    },
    to(path) {
      _to = path;
      update();
      return self;
    },
    then(then) {
      _then = then;
      update();
      return self;
    },
    asArray(asArrayCallback) {
      _asArray = asArrayCallback;
      return self;
    },
    off() {
      for (let ref of refs) {
        data.off(ref);
      }
    }
  };

  function update() {
    if (!_to && !_asArray && !_then) return;

    const fromData = data.get(from);
    if (!fromData) return;

    const a = new Set(Object.keys(fromData || {}));
    const b = new Set(Object.keys(data.get(_to) || {}));
    let updated = false;
    for (let aa of a) {
      if (set(aa, data.get(keys(from, aa)))) {
        updated = true;
      }
      b.delete(aa);
    }
    for (let bb of b) {
      data.unset(keys(_to, bb));
    }
    if (updated && _then) {
      _then(cache);
    }
  }

  function keys(...args) {
    return args.filter(p => p).join('.');
  }

  function set(key, value) {
    if (!_to && !_asArray && !_then) return false;

    const k = key.split('.')[0];
    if (_filter && !_filter(data.get(keys(from, k)))) {
      return false;
    }

    const exists = cache[k];
    if (_map) {
      value = _map(data.get(keys(from, k)));
      key = k;
    }

    if (_to) data.set(keys(_to, key), value);
    const parts = key.split('.');
    const parent = parts.slice(0, -1).reduce((parent, key) => {
      if (!parent[key]) parent[key] = {};
      return parent[key];
    }, cache);
    parent[parts[parts.length - 1]] = value;
    return true;
  }

  function unset(path) {
    if (!_to && !_asArray && !_then) return false;

    const parts = path.split('.');
    const k = parts[0];
    if (!cache[k]) return;

    const parent = parts.slice(0, -1).reduce((parent, key) => parent[key], cache);
    delete parent[parts[parts.length - 1]];
    if (_to) data.unset(keys(_to, path));
  }

  refs.push(
    data.hook(from, {
      set(path, value) {
        if (!path) {
          update();
        } else {
          const updated = set(path, value);
          if (updated && _then) _then(cache);
        }
      },
      unset(path) {
        const updated = unset(path);
        if (updated && _then) _then(cache);
      }
    })
  );
  return self;
}
