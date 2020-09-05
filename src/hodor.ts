import {
  Data,
  SorterOn,
  Sorter,
  FilterOn,
  Filter,
  Stower,
  Pathifier,
  LooseObject,
  ListenerCallbackProps,
} from '@eirikb/data';
import { Domode, HodorCallback, Mountable } from './types';

function mapCallback<T>(
  value: T,
  props: ListenerCallbackProps,
  output: HodorCallback<T>
) {
  return output(value, {
    ...props,
    ...{
      path: props.fullPath,
      subPath: (path: string) => [props.fullPath, path].join('.'),
    },
  });
}

export class Hodor<T = any> implements Mountable {
  data: Data;
  path: string;
  element?: Domode;
  isHodor = true;
  _stower?: Stower;
  _or?: HodorCallback<T>;
  index?: number;
  pathifier?: Pathifier<T>;
  listening?: boolean;
  _filter?: Filter;
  _filterOn?: { path: string; filterOn: FilterOn };
  _sort?: Sorter;
  _sortOn?: { path: string; sorterOn: SorterOn };
  _then?: HodorCallback<T>;
  _map?: HodorCallback<T>;
  listenerSet = false;
  paths: string[] = [];
  listener?: HodorCallback<T>;
  refs: string[] = [];
  hasFlags: boolean = false;
  headless = false;

  constructor(data: Data, path: string, listener?: HodorCallback<T>) {
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
    // if (this.hasFlags) {
    // this._listen(this.path);
    // }
  }

  on(flagsAndPath: string, cb: HodorCallback<T>) {
    this.refs.push(
      this.data.on<T>(flagsAndPath, (value, props) =>
        mapCallback(value, props, cb)
      )
    );
  }

  or(or: any) {
    this._or = or;
    return this;
  }

  filter(filter: Filter) {
    this._filter = filter;
    return this;
  }

  then(then: HodorCallback<T>) {
    this._then = then;
    this.mounted();
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

  map(map: HodorCallback<T>) {
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
    this._listen(this.path);
  }

  unmounted() {
    this.off();
  }

  off() {
    if (this.pathifier) this.pathifier.off();
    this.data.off(this.refs.join(' '));
    this.refs = [];
  }

  attach(node: Domode) {
    node.mountables.push(this);
    this.listen();
  }

  listen() {
    this.headless = true;
    this._listen(this.path);
  }

  private _listen(path) {
    if (this.listening) {
      return;
    }
    this.listening = true;

    if (this.hasFlags || this.headless) {
      this.on(this.path, this.listener!);
      return;
    }

    if (!this._stower && !this._then) {
      return;
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
    this.pathifier = this.data.on<T>(path);
    if (this._then)
      this.pathifier.then((value, props) =>
        mapCallback(value, props, this._then!)
      );
    if (this._map)
      this.pathifier.map((value, props) =>
        mapCallback(value, props, this._map!)
      );
    if (this._filter) this.pathifier.filter(this._filter);
    if (this._filterOn)
      this.pathifier.filterOn(this._filterOn.path, this._filterOn.filterOn);
    if (this._sort) this.pathifier.sort(this._sort);
    if (this._sortOn)
      this.pathifier.sortOn(this._sortOn.path, this._sortOn.sorterOn);
    this.pathifier.toArray({
      or(_: number, __: any): void {},

      add: (value: any, subIndex: number, _?: number, path?: string) => {
        this._stower?.add(value, this.index!, subIndex, path);
      },
      remove: (value: any, subIndex: number, _: number, path: string) => {
        this._stower?.remove(value, this.index!, subIndex, path);
      },
    });
  }
}
