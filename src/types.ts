import { Data } from "@eirikb/data";

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

