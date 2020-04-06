import Pathifier from "./pathifier";

export default (data, path, listener) => {
  // TODO: Move to data
  if (!data._hacked) {
    const oldOn = data.on;
    data.on = (flagsAndPath, listener) => {
      if (!flagsAndPath.includes(' ') && !listener) {
        return Pathifier(data, flagsAndPath);
      }
      return oldOn(flagsAndPath, listener);
    };
    data._hacked = true;
  }

  const listenerSet = !!listener;
  if (!listener) {
    listener = _ => _;
  }
  if (typeof listener !== 'function') {
    throw new Error('Listener must be a function');
  }

  let stower, _or, index, pathifier;
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
    mounted() {
      if (isMounted) return;
      isMounted = true;
      listen(path);
    },
    destroy() {
      isMounted = false;
      if (pathifier) pathifier.off();
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

  const paths = [];
  const listen = (path) => {
    if (!_map) {
      on(`!+* ${path}`, (val, { path }) => {
        const subIndex = paths.indexOf(path);
        if (subIndex >= 0) {
          paths.splice(subIndex, 1);
          stower.remove(index, subIndex);
        }
        stower.add(listener(val), index, paths.length);
        paths.push(path);
      });
      on(`- ${path}`, (_, { path }) => {
        const subIndex = paths.indexOf(path);
        paths.splice(subIndex, 1);
        stower.remove(index, subIndex);
      });
      return;
    }
    pathifier = data.on(path)
      .toArray({
        add(subIndex, path, value) {
          stower.add(value, index, subIndex);
          // console.log('add', subIndex, value.textContent);
          // console.log(stower.element.innerHTML);
        },
        remove(subIndex) {
          stower.remove(index, subIndex);
          // console.log('remove', subIndex);
          // console.log(stower.element.innerHTML);
        }
      });
    if (_map) pathifier.map(_map);
    if (_filter) pathifier.filter(_filter);
    if (_filterOn) pathifier.filterOn(_filterOn.path, _filterOn.filter);
    if (_sort) pathifier.sort(_sort);
    if (_sortOn) pathifier.sortOn(_sortOn.path, _sortOn.sort);
  };

  return hodor;
};
