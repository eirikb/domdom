import { Data, Pathifier } from '@eirikb/data';
import { DomSquint } from './dom-squint';
import ddProps from './dd-props';
import { Domode, Opts, React } from './types';
import { GodMode } from '../../data';
import { Transformers } from './transformers';

export class ReactImpl implements React {
  private readonly data: Data;

  constructor(data: Data) {
    this.data = data;
  }

  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode {
    return this._createElement(input, props, undefined, ...children);
  }

  private _createElement(
    input: string | Function,
    props?: { [key: string]: any },
    namespaceURI?: string,
    ...children: any[]
  ): Domode {
    children = [].concat(...children);

    if (typeof input === 'function') {
      const cbs: (() => void)[] = [];
      const options: Opts = {
        children,
        mounted(cb) {
          cbs.push(cb);
        },
      };
      const res = input({ ...props }, options) as Domode;
      res.mountables = res.mountables ?? [];
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

    const p = new Pathifier(this.data, new Transformers(el, this.data));
    el.mounted = () => {
      for (const mountable of el.mountables) {
        mountable.mounted();
      }
      p.nodes().forEach(node =>
        node.value?.mountables?.forEach(cb => cb.mounted())
      );
      p.start();
    };
    el.unmounted = () => {
      for (let mountable of el.mountables) {
        mountable.unmounted();
      }
      p.nodes().forEach(node =>
        node.value?.mountables?.forEach(cb => cb.unmounted())
      );
      p.stop();
    };

    for (let index = 0; index < children.length; index++) {
      p.put(index, children[index]);
    }

    ddProps(this.data, el.mountables, el, props);

    return el;
  }
}

export class Domdom<T> extends GodMode<T> {
  React: React;

  constructor(data: Data, initialData: T, proxyEnabled = true) {
    super(data, initialData, proxyEnabled);
    this.React = new ReactImpl(this._data);
  }

  init = (parent: HTMLElement, child?: HTMLElement) => {
    const domSquint = new DomSquint(parent);
    domSquint.init();
    if (child) {
      parent.appendChild(child);
    }
  };
}
