import { Data, ListenerCallback } from '@eirikb/data';
import { DomStower } from './dom-stower';
import { DomSquint } from './dom-squint';
import ddProps from './dd-props';
import { Hodor } from './hodor';
import { Domode } from './types';

export default (data: Data = new Data()) => {
  const hodors: Set<Hodor> = new Set<Hodor>();

  return {
    React: {
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
          const res = input({ ...props, ...options }) as Domode;
          res.mountables.push({
            mounted() {
              for (const cb of cbs) {
                cb();
              }
            },
            unmounted() {},
          });
          for (let hodor of hodors) {
            res.mountables.push(hodor);
            hodors.delete(hodor);
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
            hodors.delete(hodor);
            hodor.stower(index, stower);
            hodor.element = el;
            el.mountables.push(hodor);
          } else {
            stower.add(child, index);
          }
        }

        ddProps(data, el.mountables, el, props);

        return el;
      },
    },

    on: (path: string, cb?: ListenerCallback): Hodor => {
      const hodor = new Hodor(data, path, cb);
      hodors.add(hodor);
      return hodor;
    },

    set: (path: string, value: any, byKey?: string) =>
      data.set(path, value, byKey),

    unset: (path: string) => data.unset(path),

    get: (path: string) => data.get(path),

    init: (parent: HTMLElement, child?: HTMLElement) => {
      const domSquint = new DomSquint(parent);
      domSquint.init();
      if (child) {
        parent.appendChild(child);
      }
    },
  };
};
