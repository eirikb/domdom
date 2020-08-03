import { Data, ListenerCallback } from '@eirikb/data';
import { ContextOptions } from './context-options';
import { Hodor } from 'hodor';

export type Domponent = (contextOptions: ContextOptions) => Domode;

export interface Domdom extends Data {
  React: Element;
  data: Data;
  append: (
    parent: Element,
    contextOptions: (ContextOptions) => Domode
  ) => Domode;
}

export interface Domode extends HTMLElement {
  mounted(data: Data);
  unmounted();
  hodors: Hodor[];
  isMounted: boolean;
  // destroy: () => void;
  // path: string;
  // isHodor: boolean;
  // isMounted: boolean;
  // mounted: () => void;
  //
  on(path: string, listener: ListenerCallback): void;
}
