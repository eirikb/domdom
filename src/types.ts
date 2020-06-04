import { Data, Filter, FilterOn, Sorter, SorterOn, Stower } from "./deps.ts";

export declare type Domponent = (contextOptions: ContextOptions) => Domode;

export interface ContextOptions {
  on?(path: string, listener?: Function): void;

  when?(path: string, options: any): void;

  unset?(path: string): void;

  set?(path: string, value: any): void;

  get?(path: string): void;

  trigger?(path: string, value: any): void;

  children?: Array<any>;

  mounted?(cb: Function): void;

  [key: string]: any;
}

export interface Domdom extends Data {
  React: Element;
  data: Data;
  append: Function;
}

export interface Domode extends HTMLElement {
  destroy: Function;
  path: string;
  isHodor: boolean;
  context?: Context;
  isMounted: boolean;
  mounted: Function;

  on(path: string, listener?: Function): void;
}

export interface Hodor {
  path: string;

  paths: string[];

  element: Domode | null;

  isHodor: boolean;

  filter(filter: Filter): Hodor;

  filterOn(path: string, filter: FilterOn): Hodor;

  sort(sort: Sorter): Hodor;

  sortOn(path: string, sort: SorterOn): Hodor;

  map(map: Function): Hodor;

  listen(path: string): void;

  stower(i: number, stower: Stower): void;

  mounted(): void;

  destroy(): void;

  off(): void;

  or(or: Function): void;
}

export interface Context {
  on?(path: string, listener?: Function): void;

  mounted?: Function;
}
