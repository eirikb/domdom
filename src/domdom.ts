import { Data, ListenerCallback } from '@eirikb/data';
import { DomStower } from './dom-stower';
import { DomSquint } from './dom-squint';
import ddProps from './dd-props';
import { Hodor } from './hodor';
import { Domode } from './types';

export type OnInteract = (node: Domode) => void;

export class React {
  private hodors: Set<Hodor>;
  private data: Data;
  private onInteract: OnInteract;

  constructor(data: Data, hodors: Set<Hodor>, onInteract: OnInteract) {
    this.data = data;
    this.hodors = hodors;
    this.onInteract = onInteract;
  }

  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode {
    children = [].concat(...children);

    if (typeof input === 'function') {
      const cbs: (() => void)[] = [];
      const options = {
        children,
        mounted(cb) {
          cbs.push(cb);
        },
      };
      this.hodors.clear();
      const res = input({ ...props, ...options }) as Domode;
      res.mountables.push({
        mounted() {
          for (const cb of cbs) {
            cb();
          }
        },
        unmounted() {},
      });
      for (let hodor of this.hodors) {
        res.mountables.push(hodor);
      }
      return res;
    }

    const el = document.createElement(input) as Domode;
    el.mountables = [];

    el.mounted = () => {
      for (const mountable of el.mountables) {
        mountable.mounted();
      }
    };
    el.unmounted = () => {
      for (let mountable of el.mountables) {
        mountable.unmounted();
      }
    };

    const stower = new DomStower(el);

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child instanceof Hodor) {
        const hodor = child as Hodor;
        this.hodors.delete(hodor);
        hodor.stower(index, stower);
        hodor.element = el;
        el.mountables.push(hodor);
      } else {
        stower.add(child, index);
      }
    }

    ddProps(this.data, el.mountables, el, this.onInteract, props);

    return el;
  }
}

export class Domdom {
  private hodors: Set<Hodor> = new Set<Hodor>();
  private data: Data;
  React: React;
  private hopefullyLastInteractedElement?: Domode;

  constructor(data: Data) {
    this.data = data;
    this.React = new React(
      this.data,
      this.hodors,
      el => (this.hopefullyLastInteractedElement = el)
    );
  }

  hackThePath(path: string) {
    if (path.startsWith('>')) {
      if (this.hopefullyLastInteractedElement) {
        if (this.hopefullyLastInteractedElement.path) {
          return path.replace(/^>/, this.hopefullyLastInteractedElement.path);
        } else {
          throw new Error('Last interacted element does not have a path');
        }
      } else {
        throw new Error('No last interacted element');
      }
    }
    return path;
  }

  on = (path: string, cb?: ListenerCallback) => {
    const hodor = new Hodor(this.data, path, cb);
    this.hodors.add(hodor);
    return hodor;
  };

  set = (path: string, value: any, byKey?: string) => {
    this.data.set(this.hackThePath(path), value, byKey);
  };

  unset = (path: string) => {
    this.data.unset(this.hackThePath(path));
  };

  get = (path?: string) => {
    if (!path) return this.data.get();
    return this.data.get(this.hackThePath(path));
  };

  trigger = (path: string, value?: any) => {
    return this.data.trigger(this.hackThePath(path), value);
  };

  init = (parent: HTMLElement, child?: HTMLElement) => {
    const domSquint = new DomSquint(parent);
    domSquint.init();
    if (child) {
      parent.appendChild(child);
    }
  };
}
