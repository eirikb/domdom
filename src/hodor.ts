import {
  SorterOn,
  Sorter,
  FilterOn,
  Filter,
  Stower,
  Data,
  Pathifier,
  Callback,
} from '@eirikb/data';
import { Domode, Hodor } from "types";

export default (data: Data, path: string, listener: Callback) => {
  const listenerSet = !!listener;
  if (!listener) {
    listener = (_: any) => _;
  }
  if (typeof listener !== 'function') {
    throw new Error('Listener must be a function');
  }

  let stower: Stower,
    _or: Function,
    index: Number,
    pathifier: Pathifier,
    listening: boolean;
  let _filter: Filter,
    _filterOn: FilterOn,
    _sort: Sorter,
    _sortOn: SorterOn,
    _map: Function;

  const listeners: { flagsAndPath: string; cb: Function; ref: string }[] = [];

  function on(flagsAndPath: string, cb: Function) {
    const ref = data.on(flagsAndPath, cb);
    listeners.push({ flagsAndPath, cb, ref });
  }

  let isMounted = false;
  const hodor: Hodor = {
    path,
    element: null,
    isHodor: true,
    or(or: Function) {
      _or = or;
      return hodor;
    },
    filter(filter: Filter) {
      _filter = filter;
      return hodor;
    },
    filterOn(path: string, filter: FilterOn) {
      _filterOn = { path, filter };
      return hodor;
    },
    sort(sort: Sorter) {
      _sort = sort;
      return hodor;
    },
    sortOn(path: string, sort: SorterOn) {
      _sortOn = { path, sort };
      return hodor;
    },
    map(map: Function) {
      if (listenerSet) {
        throw new Error(`Sorry, can't combine listener and map`);
      }
      _map = map;
      return hodor;
    },
    stower(i: number, s: Stower) {
      index = i;
      stower = s;
      if (_or) {
        stower.or(_or, index);
      }
      return hodor;
    },
    mounted() {
      if (isMounted) {
        return;
      }
      isMounted = true;
      if (typeof hodor.listen === 'function') {
        hodor.listen(path);
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
    listen: path => {
      if (listening) {
        return;
      }
      listening = true;
      if (!stower) {
        return;
      }

      if (hodor.element) {
        let parentNode = hodor.element;
        while (parentNode && parentNode.parentNode) {
          if (parentNode.path) {
            path = path.replace(/^>/, parentNode.path);
            break;
          }
          parentNode = parentNode.parentNode as Domode;
        }
      }

      if (!_map) {
        on(`!+* ${path}`, (val: any, { path }: { path: string }) => {
          const subIndex = hodor.paths.indexOf(path);
          if (subIndex >= 0) {
            hodor.paths.splice(subIndex, 1);
            stower.remove(index, subIndex);
          }
          const res = listener(val);
          if (typeof res === 'object') {
            res.path = path;
          }
          stower.add(res, index, hodor.paths.length);
          hodor.paths.push(path);
        });
        on(`- ${path}`, (_: any, { path }: { path: string }) => {
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
        add(subIndex: number, p: string, value: any) {
          if (typeof value === 'object') {
            value.path = [pathifier.from, p].join('.');
          }
          stower.add(value, index, subIndex);
        },
        remove(subIndex: number) {
          stower.remove(index, subIndex);
        },
      });
    },
  };

  const hasFlags = path.match(/ /);
  if (hasFlags) {
    on(path, listener);
    return hodor;
  }

  return hodor;
};
