import { DomStower } from './dom-stower';
import { Data, ListenerCallback } from '@eirikb/data';
import { DomSquint } from './dom-squint';
import { Hodor } from './hodor';
import { Domode, DomOptions } from './types';

export const React = {
  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode {
    if (typeof input === 'function') {
      let mounteds: (() => void)[] = [];
      const domOptions: DomOptions = {
        mounted: cb => mounteds.push(cb),
      };
      const res = input(domOptions);
      res.onMounted(() => mounteds.forEach(m => m()));
      return res;
    }

    let listeners: { path: string; listener: ListenerCallback }[] = [];
    let refs: string[] = [];
    const el = document.createElement(input) as Domode;
    const mounteds: (() => void)[] = [];
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
        m();
      }
      mounteds;
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

    if (props) {
      for (let [key, value] of Object.entries(props)) {
        console.log(key, '=', value);
      }
    }

    return el;
  },
};

export const don = (path: string, cb?: ListenerCallback): Hodor =>
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
