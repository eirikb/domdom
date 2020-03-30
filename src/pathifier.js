export default function (data, from) {
  const refs = [];

  // Cache is used for 'then', since there might not be a 'to'.
  // It's called cache so people would immediately think it's for
  // performance gain - although it's a full copy taking up double the memory
  const cache = {};

  let _to, _filter, _sort, _sortOn, _toArray, _map, _then, _on;
  let temporarilyDisableToArray = false;

  // Default sort if none is specified
  _sort = (a, b, aPath, bPath) => aPath.localeCompare(bPath);
  _on = false;

  function sortedIndex(path) {
    const d = cache;
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

  function setFilter(filter) {
    if (_filter) throw new Error('Sorry, only one filter');
    _filter = filter;
  }

  const self = {
    filter(filter) {
      setFilter(filter);
      _filter = filter;
      return self;
    },
    filterOn(path, filter) {
      setFilter((value) => filter(data.get(path), value));
      refs.push(
        data.on(`!+* ${path}`, () => {
          update();
        })
      );
      return self;
    },
    map(map) {
      if (_map) throw new Error('Sorry, only one map');
      _map = map;
      return self;
    },
    sort(sort) {
      if (_sort) throw new Error('Sorry, only one sort');
      _sort = sort;
      return self;
    },
    sortOn(path, sort) {
      if (_sortOn) throw new Error('Sorry, only one sort');
      _sortOn = sort;
      refs.push(
        data.on(`!+* ${path}`, () => {
          update();
        })
      );
      return self;
    },
    to(path) {
      if (_to) throw new Error('Sorry, only one to');
      _to = path;
      if (!_on) self.on();
      update();
      return self;
    },
    then(then) {
      _then = then;
      if (!_on) self.on();
      update();
      return self;
    },
    toArray(toArray) {
      if (_toArray) throw new Error('Sorry, only one toArray');
      _toArray = toArray;
      if (!_on) self.on();
      update();
      return self;
    },
    on() {
      if (_on) return;
      _on = true;
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
    },
    off() {
      for (let ref of refs) {
        data.off(ref);
      }
      _on = false;
    }
  };

  function update() {
    if (!_to && !_toArray && !_then) return;

    const fromData = data.get(from);
    if (!fromData) return;

    const a = new Set(Object.keys(fromData || {}));
    const b = new Set(Object.keys(cache || {}));
    let updated = false;
    temporarilyDisableToArray = true;
    for (let aa of a) {
      if (set(aa, data.get(keys(from, aa)))) {
        updated = true;
        b.delete(aa);
      }
    }
    if (_toArray) {
      const removeIndexes = [...b].map(bb => sortedIndex(bb));
      _toArray.update(Object.entries(cache), removeIndexes);
    }
    for (let bb of b) {
      unset(bb);
    }
    if (updated && _then) {
      _then(cache);
    }
    temporarilyDisableToArray = false;
  }

  function keys(...args) {
    return args.filter(p => p).join('.');
  }

  function set(key, value) {
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
    if (_toArray && !temporarilyDisableToArray) {
      const index = sortedIndex(k);
      if (exists) {
        _toArray.change(index, k, cache[k]);
      } else {
        _toArray.add(index, k, cache[k]);
      }
    }
    return true;
  }

  function unset(path) {
    if (!_to && !_toArray && !_then) return false;

    const parts = path.split('.');
    const k = parts[0];
    if (!cache[k]) return;

    if (_toArray && !temporarilyDisableToArray) {
      const index = sortedIndex(k);
      _toArray.remove(index, k, cache[k]);
    }
    const parent = parts.slice(0, -1).reduce((parent, key) => parent[key], cache);
    delete parent[parts[parts.length - 1]];
    if (_to) data.unset(keys(_to, path));
  }

  return self;
}
