export type OptChildren = any[];
export type OptMounted = (cb: () => void) => void;

export interface Opts {
  children: OptChildren;
  mounted: OptMounted;
}

export interface Domode extends HTMLElement, Mountable {
  isMounted: boolean;
  path: string;
  mountables: Mountable[];
}

export interface Mountable {
  mounted();
  unmounted();
}
