import { Data, ListenerCallback } from '@eirikb/data';
import { DomStower } from './dom-stower';
import { DomSquint } from './dom-squint';
import ddProps from './dom-props';
import { Hodor } from './hodor';
import { Domode, DomOptions } from './types';

export const React = {
  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode {
    function flat(res: any[], input: any) {
      if (Array.isArray(input)) {
        input.forEach(item => flat(res, item));
      } else {
        res.push(input);
      }
      return res;
    }
    children = flat([], children);

    if (typeof input === 'function') {
      let mounteds: ((data: Data) => void)[] = [];
      const domOptions: DomOptions = {
        mounted: cb => mounteds.push(cb),
        children,
      };
      const res = input(domOptions);
      res.onMounted(data => mounteds.forEach(m => m(data)));
      return res;
    }

    let listeners: { path: string; listener: ListenerCallback }[] = [];
    let refs: string[] = [];
    let mounteds: ((data: Data) => void)[] = [];

    const el = document.createElement(input) as Domode;
    let d: Data;
    el.hodors = [];
    el.onMounted = cb => {
      mounteds.push(cb);
    };
    el.mounted = (data: Data) => {
      d = data;
      for (const hodor of el.hodors) {
        hodor.mounted(data);
      }
      for (let { path, listener } of listeners) {
        refs.push(data.on(path, listener));
      }
      listeners = [];
      for (let m of mounteds) {
        m(data);
      }
      mounteds = [];
    };
    el.unmounted = () => {
      for (let hodor of el.hodors) {
        hodor.unmounted();
      }
      for (let ref of refs) {
        d?.off(ref);
      }
      refs = [];
    };
    el.on = (path, listener) => {
      listeners.push({ path, listener });
    };

    const stower = new DomStower(el);

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child instanceof Hodor) {
        const hodor = child as Hodor;
        hodor.stower(index, stower);
        hodor.element = el;
        el.hodors.push(hodor);
      } else {
        stower.add(child, index);
      }
    }

    ddProps(el, props);

    return el;
  },
};

export const on = (path: string, cb?: ListenerCallback): Hodor =>
  new Hodor(path, cb);

export function init(parent: HTMLElement, child?: HTMLElement): Data {
  const data = new Data();
  const domSquint = new DomSquint(data, parent);
  domSquint.init();
  if (child) {
    parent.appendChild(child);
  }
  return data;
}
