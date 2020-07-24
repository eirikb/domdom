import {
  Data,
  SorterOn,
  Sorter,
  FilterOn,
  Filter,
  Stower,
  Pathifier,
  Callback,
  LooseObject,
} from '@eirikb/data';
import { Domode } from './types';

export class Hodor {
  data: Data;
  listeners: { flagsAndPath: string; cb: Function; ref: string }[] = [];
  isMounted = false;
  path: string;
  element?: Domode;
  isHodor = true;
  _stower?: Stower;
  _or?: Function;
  index?: number;
  pathifier?: Pathifier;
  listening?: boolean;
  _filter?: Filter;
  _filterOn?: { path: string; filterOn: FilterOn };
  _sort?: Sorter;
  _sortOn?: { path: string; sorterOn: SorterOn };
  _map?: Callback;
  listenerSet = false;
  paths: string[] = [];
  listener?: Callback;

  constructor(data: Data, path: string, listener?: Callback) {
    this.data = data;
    this.listenerSet = !!listener;
    if (listener === undefined) {
      listener = (_: any) => _;
    }
    this.listener = listener;
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    const hasFlags = path.match(/ /);
    if (hasFlags) {
      this.on(path, listener);
    }
    this.path = path;
  }

  on(flagsAndPath: string, cb: Callback) {
    const ref = this.data.on(flagsAndPath, cb);
    this.listeners.push({ flagsAndPath, cb, ref });
  }

  or(or: Function) {
    this._or = or;
    return this;
  }
  filter(filter: Filter) {
    this._filter = filter;
    return this;
  }
  filterOn(path: string, filterOn: FilterOn) {
    this._filterOn = { path, filterOn };
    return this;
  }
  sort(sort: Sorter) {
    this._sort = sort;
    return this;
  }
  sortOn(path: string, sorterOn: SorterOn) {
    this._sortOn = { path, sorterOn };
    return this;
  }
  map(map: Callback) {
    if (this.listenerSet) {
      throw new Error(`Sorry, can't combine listener and map`);
    }
    this._map = map;
    return this;
  }
  stower(i: number, s: Stower) {
    this.index = i;
    this._stower = s;
    if (this._or) {
      this._stower.or(i, this._or);
    }
    return this;
  }
  mounted() {
    if (this.isMounted) {
      return;
    }
    this.isMounted = true;
    if (typeof this.listen === 'function') {
      this.listen(this.path);
    }
  }
  destroy() {
    this.isMounted = false;
    this.off();
  }
  off() {
    if (this.pathifier) this.pathifier.off();
    for (let listener of this.listeners.filter(l => l.ref)) {
      this.data.off(listener.ref);
      delete listener.ref;
    }
    this.listening = false;
  }
  listen(path) {
    if (this.listening) {
      return;
    }
    this.listening = true;
    if (!this._stower) {
      return;
    }

    if (this.element) {
      let parentNode = this.element;
      // TODO: Remove indexing
      while (parentNode && parentNode['parentNode']) {
        if (parentNode['path']) {
          path = path.replace(/^>/, parentNode['path']);
          break;
        }
        parentNode = parentNode['parentNode'] as Domode;
      }
    }

    if (!this._map) {
      this.on(`!+* ${path}`, (val: any, props: LooseObject) => {
        const path = props.path;
        const subIndex = this.paths.indexOf(path);
        if (subIndex >= 0) {
          this.paths.splice(subIndex, 1);
          this._stower?.remove(null, this.index!, subIndex);
        }
        const res = this.listener!(val, props) as any;
        if (res instanceof Element) {
          (res as any).path = path;
        }
        this._stower?.add(res, this.index!, this.paths.length, path);
        this.paths.push(path);
      });
      this.on(`- ${path}`, (_: any, props: LooseObject) => {
        const path = props.path;
        const subIndex = this.paths.indexOf(path);
        this.paths.splice(subIndex, 1);
        this._stower?.remove(null, this.index!, subIndex);
      });
      return;
    }
    this.pathifier = this.data.on(path);
    if (this._map) this.pathifier.map(this._map);
    if (this._filter) this.pathifier.filter(this._filter);
    if (this._filterOn)
      this.pathifier.filterOn(this._filterOn.path, this._filterOn.filterOn);
    if (this._sort) this.pathifier.sort(this._sort);
    if (this._sortOn)
      this.pathifier.sortOn(this._sortOn.path, this._sortOn.sorterOn);
    const self = this;
    this.pathifier.toArray({
      or(_: number, __: any): void {},

      add(value: any, subIndex: number, _?: number, path?: string) {
        if (typeof value === 'object') {
          value.path = [(self.pathifier as any).from, path].join('.');
        }

        self._stower?.add(value, self.index!, subIndex, path);
      },
      remove(value: any, subIndex: number, _: number, path: string) {
        self._stower?.remove(value, self.index!, subIndex, path);
      },
    });
  }
}
