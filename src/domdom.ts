import { DomStower } from './dom-stower';
import { Data, ListenerCallback } from '@eirikb/data';
import { DomSquint } from './dom-squint';
import { Hodor } from './hodor';
import { Domode } from './types';

export const React = {
  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode {
    if (typeof input === 'function') {
      return input();
    }

    const el = document.createElement(input) as Domode;
    el.hodors = [];
    el.mounted = (data: Data) => {
      for (const hodor of el.hodors) {
        hodor.mounted(data);
      }
    };
    el.unmounted = () => {
      for (let hodor of el.hodors) {
        hodor.unmounted();
      }
    };

    const stower = new DomStower(el);

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child instanceof Hodor) {
        const hodor = child as Hodor;
        hodor.stower(index, stower);
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
