import { Pathifier } from '@eirikb/data';

export type OptChildren = any[];
export type OptMounted = (cb: () => void) => void;

export interface Opts {
  children: OptChildren;
  mounted: OptMounted;
}

export interface Domode extends HTMLElement, Mountable {
  isMounted: boolean;
  mountables: Mountable[];
  bloodyRebuild: (namespaceURI?: string) => Domode;
}

export interface Mountable {
  mounted();

  unmounted();
}

export interface Stower {
  add(value: any, index: number, subIndex?: number, path?: string): void;

  remove(value: any, index: number, subIndex?: number, path?: string): void;
}

export interface React {
  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode | Pathifier;
}
