import { Data, ListenerCallback } from '@eirikb/data';
import { Hodor } from 'hodor';

export interface DomOptions {
  mounted?: (cb: () => void) => void;
  children?: any[];
}

export type Domponent = (options: DomOptions) => Domode;

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
  onMounted(cb: () => void);
  unmounted();
  hodors: Hodor[];
  isMounted: boolean;
  on(path: string, listener: ListenerCallback): void;
}
