export default function (data, from) {
  const refs = [];

  // Cache is used for 'then', since there might not be a 'to'.
  // It's called cache so people would immediately think it's for
  // performance gain - although it's a full copy taking up double the memory
  const cache = {};
  const cacheNoMap = {};

  let _to, _filter, _sort, _toArray, _map, _then, _on;
  let temporarilyDisableToArray = false;

  _on = false;

  function sortedIndex(path) {
    const d = cacheNoMap;
    const paths = Object.keys(d);

    let low = 0;
    let high = paths.length - 1;
    let sort = _sort;
    // Default sort if none is specified
    if (!sort) {
      sort = (a, b, aPath, bPath) => aPath.localeCompare(bPath);
    }

    while (low < high) {
      let mid = (low + high) >>> 1;
      if (sort(d[path], d[paths[mid]], path, paths[mid]) > 0) {
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
      if (_sort) throw new Error('Sorry, only one sort');
      _sort = sort;
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
    const parts = key.split('.');
    const k = parts[0];
    if (_filter && !_filter(data.get(keys(from, k)))) {
      return false;
    }

    const exists = cache[k];
    const origValue = value;
    if (_map) {
      value = _map(data.get(keys(from, k)));
      key = k;
    }

    if (_to) data.set(keys(_to, key), value);
    setObject(cache, parts, value);
    setObject(cacheNoMap, parts, origValue);
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

  function setObject(object, parts, value) {
    const parent = parts.slice(0, -1).reduce((parent, key) => {
      if (!parent[key]) parent[key] = {};
      return parent[key];
    }, object);
    parent[parts[parts.length - 1]] = value;
  }

  function unsetObject(object, parts) {
    const parent = parts.slice(0, -1).reduce((parent, key) => parent[key], object);
    delete parent[parts[parts.length - 1]];
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
    unsetObject(cache, parts);
    unsetObject(cacheNoMap, parts);
    if (_to) data.unset(keys(_to, path));
  }


  return self;
}
