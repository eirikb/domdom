export type OptChildren = any[];
export type OptMounted = (cb: () => void) => void;

export type Domponent = (options: {
  children?: OptChildren;
  mounted?: OptMounted;
}) => void;

export interface Domode extends HTMLElement, Mountable {
  isMounted: boolean;
  path: string;
  mountables: Mountable[];
}

export interface Mountable {
  mounted();
  unmounted();
}
