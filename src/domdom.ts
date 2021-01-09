import { Data, ListenerCallbackWithType, Pathifier } from '@eirikb/data';
import { DomStower, StowerTransformer } from './dom-stower';
import { DomSquint } from './dom-squint';
import ddProps from './dd-props';
import { Domode, Opts, React } from './types';
import { DomPathifier } from './pathifier';

export class ReactImpl implements React {
  private readonly data: Data;

  constructor(data: Data) {
    this.data = data;
  }

  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode | Pathifier {
    return this._createElement(input, props, undefined, ...children);
  }

  private _createElement(
    input: string | Function,
    props?: { [key: string]: any },
    namespaceURI?: string,
    ...children: any[]
  ): Domode | Pathifier {
    children = [].concat(...children);

    if (typeof input === 'function') {
      const cbs: (() => void)[] = [];
      const options: Opts = {
        children,
        mounted(cb) {
          cbs.push(cb);
        },
      };
      const res = input({ ...props }, options) as Domode | DomPathifier;
      res.mountables.push({
        mounted() {
          for (const cb of cbs) {
            cb();
          }
        },
        unmounted() {},
      });
      return res;
    }

    let el = document.createElement(input) as Domode;
    if ((input === 'svg' || props?.xmlns) && !namespaceURI) {
      namespaceURI = props?.xmlns || 'http://www.w3.org/2000/svg';
    }
    if (namespaceURI) {
      el = (document.createElementNS(namespaceURI, input) as any) as Domode;

      children = children.map(child =>
        child.bloodyRebuild ? child.bloodyRebuild(namespaceURI) : child
      );
    }

    el.mountables = [];

    el.bloodyRebuild = (namespaceURI?: string) => {
      return this._createElement(
        input,
        props,
        namespaceURI,
        children
      ) as Domode;
    };

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
      if (child instanceof DomPathifier) {
        el.mountables.push(child);
        if (child.transformer instanceof StowerTransformer) {
          child.transformer.bloodyRebuild(stower, index);
        } else {
          child.transformer = new StowerTransformer(
            child.lastTransformer(),
            stower,
            index
          );
        }
      } else {
        stower.add(child, index);
      }
    }

    ddProps(this.data, el.mountables, el, props);

    el.attach = (pathifier: DomPathifier) => {
      el.mountables.push(pathifier);
      pathifier.init();
    };

    return el;
  }
}

export class Domdom {
  private readonly _data: Data;
  React: React;

  constructor(data: Data) {
    this._data = data;
    this.React = new ReactImpl(this._data);
  }

  on = (path: string): Pathifier => {
    return new DomPathifier(this._data, path);
  };

  set = (path: string, value: any, byKey?: string) => {
    this._data.set(path, value, byKey);
  };

  unset = (path: string) => {
    this._data.unset(path);
  };

  off = (refs: string) => this._data.off(refs);

  get = <T = any>(path?: string): T | undefined => {
    if (!path) return this._data.get();
    return this._data.get(path);
  };

  trigger = (path: string, value?: any) => {
    return this._data.trigger(path, value);
  };

  globalOn = <T = any>(
    flagsAndPath: string,
    listener: ListenerCallbackWithType<T>
  ): string => this._data.on(flagsAndPath, listener);

  init = (parent: HTMLElement, child?: HTMLElement) => {
    const domSquint = new DomSquint(parent);
    domSquint.init();
    if (child) {
      parent.appendChild(child);
    }
  };
}
