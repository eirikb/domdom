export type OptChildren = any[];
export type OptMounted = (cb: () => void) => void;

export interface Opts {
  children: OptChildren;
  mounted: OptMounted;
}

export interface Domode extends HTMLElement, Mountable {
  isMounted: boolean;
  mountables: Mountable[];
}

export interface Mountable {
  mounted();

  unmounted();
}

export type SubPath = (path: string) => string;

export type HodorCallback<T> = (
  value: T,
  props: { [key: string]: any; path: string; subPath: SubPath }
) => void;

export interface Stower {
  add(value: any, index: number, subIndex?: number, path?: string): void;

  remove(value: any, index: number, subIndex?: number, path?: string): void;
}
