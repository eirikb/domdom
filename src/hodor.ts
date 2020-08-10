import {
  Data,
  SorterOn,
  Sorter,
  FilterOn,
  Filter,
  Stower,
  Pathifier,
  ListenerCallback,
  LooseObject,
} from '@eirikb/data';
import { Domode, Mountable } from './types';

export class Hodor implements Mountable {
  data: Data;
  path: string;
  element?: Domode;
  isHodor = true;
  _stower?: Stower;
  _or?: ListenerCallback;
  index?: number;
  pathifier?: Pathifier;
  listening?: boolean;
  _filter?: Filter;
  _filterOn?: { path: string; filterOn: FilterOn };
  _sort?: Sorter;
  _sortOn?: { path: string; sorterOn: SorterOn };
  _then?: ListenerCallback;
  _map?: ListenerCallback;
  listenerSet = false;
  paths: string[] = [];
  listener?: ListenerCallback;
  refs: string[] = [];
  hasFlags: boolean = false;

  constructor(data: Data, path: string, listener?: ListenerCallback) {
    this.data = data;
    this.listenerSet = !!listener;
    if (listener === undefined) {
      listener = (_: any) => _;
    }
    this.listener = listener;
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    this.path = path;
    this.hasFlags = !!path.match(/ /);
    if (this.hasFlags) {
      this.listen(this.path);
    }
  }

  on(flagsAndPath: string, cb: ListenerCallback) {
    this.refs.push(this.data.on(flagsAndPath, cb));
  }

  or(or: any) {
    this._or = or;
    return this;
  }

  filter(filter: Filter) {
    this._filter = filter;
    return this;
  }

  then(then: ListenerCallback) {
    this._then = then;
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

  map(map: ListenerCallback) {
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
    if (typeof this.listen === 'function') {
      this.listen(this.path);
    }
  }

  unmounted() {
    this.off();
  }

  off() {
    if (this.pathifier) this.pathifier.off();
    this.data.off(this.refs.join(' '));
    this.refs = [];
  }

  listen(path) {
    if (this.listening) {
      return;
    }
    this.listening = true;

    if (this.hasFlags) {
      this.on(this.path, this.listener!);
      return;
    }

    if (!this._stower && !this._then) {
      return;
    }

    if (this.element) {
      let parentNode = this.element;
      while (parentNode && parentNode.parentNode) {
        if (parentNode.path) {
          path = path.replace(/^>/, parentNode.path);
          break;
        }
        parentNode = parentNode.parentNode as Domode;
      }
    }

    if (!this._map && !this._then) {
      this.on(`!+* ${path}`, (val, props) => {
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
    if (this._then) this.pathifier.then(this._then);
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
        if (value instanceof Element) {
          (value as any).path = path;
        }

        self._stower?.add(value, self.index!, subIndex, path);
      },
      remove(value: any, subIndex: number, _: number, path: string) {
        self._stower?.remove(value, self.index!, subIndex, path);
      },
    });
  }
}
