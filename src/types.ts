import { Data } from '@eirikb/data';

export type Domponent = (contextOptions: ContextOptions) => Domode;

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

export interface Context {
  on?(path: string, listener?: Function): void;

  mounted?: Function;
}
