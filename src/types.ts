import { Data, Filter, FilterOn, Sorter, SorterOn, Stower } from '@eirikb/data';

export interface ContextOptions {
  on?(path: string, listener?: Function): void;

  when?(path: string, options: any): void;

  unset?(path: string): void;

  set?(path: string, value: any): void;

  get?(path: string): void;

  trigger?(path: string, value: any): void;

  children?: Array<any>;

  mounted?(cb: Function): void;
}

export interface Domdom {
  React: Element;
  data: Data;
  append: Function;
}

export function domdom(): Domdom;

export function domdom(parent: HTMLElement, view: Function): Data;

export interface Domode extends HTMLElement {
  path: string;
  isHodor: boolean;

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
