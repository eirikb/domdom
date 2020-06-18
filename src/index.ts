import createData, { Data, Callback } from '@eirikb/data';
import Context from './context';
import ddProps from './dd-props';
import createStower from './stower';
import createHodor from './hodor';
import { Domdom, ContextOptions, Hodor, Domode, Domponent } from './types';

export * from './types';
export * from '@eirikb/data';

export function isProbablyPlainObject(obj: any) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

export function domdom(): Domdom;

export function domdom(
  parent: HTMLElement,
  view: (contextOptions: ContextOptions) => Domode
): Data;

export function domdom(parent?: HTMLElement, view?: Domponent): Domdom | Data {
  const data = createData();
  const React = {
    createElement(
      tagName: (contextOptions: ContextOptions) => Domode,
      props?: any,
      ...children: (Domode | Hodor)[]
    ): Domode {
      if (typeof tagName === 'function') {
        return Context(data, tagName, props, ...children);
      }

      const hodors: Hodor[] = [];
      const element = document.createElement(tagName) as Domode;
      const stower = createStower(element);

      const addHodor = (index: number, hodor: Hodor) => {
        hodor.element = element;
        hodors.push(hodor);
        hodor.stower(index, stower);
      };

      const appendChild = (index: number, child: any) => {
        stower.add(child, index);
      };

      const setElementValue = (key: string, value: any) => {
        if (value && value.then) {
          value.then((res: any) => setElementValue(key, res));
        } else {
          if (isProbablyPlainObject(value) && (element as any)[key]) {
            Object.assign((element as any)[key], value);
          } else {
            (element as any)[key] = value;
          }
        }
      };

      let counter = 0;
      for (let child of children) {
        const index = counter++;
        if (typeof child === 'undefined' || child === null) {
        } else if (child.isHodor) {
          addHodor(index, child as Hodor);
        } else {
          appendChild(index, child);
        }
      }

      for (let [key, value] of Object.entries(props || {}).filter(
        ([key]) => !key.startsWith('__')
      )) {
        const valueAsHodor = value as Hodor;
        if (valueAsHodor.isHodor) {
          valueAsHodor.element = element;
        }

        const isEventProp = key.match(/^on[A-Z]/);
        if (isEventProp) {
          const event = key[2].toLowerCase() + key.slice(3);
          element.addEventListener(event, (...args) => {
            const valueFn = value as Function;
            if (valueFn !== null) {
              return valueFn(...args);
            }
          });
        }

        const nonSpecialProp = !key.match(/(^dd-|on[A-Z])/);
        if (nonSpecialProp) {
          if (key === 'class') {
            key = 'className';
          }
          if (!(value && valueAsHodor.isHodor)) {
            setElementValue(key, value);
          }
        }
      }

      element.destroy = () => {
        element.isMounted = false;
        element.childNodes.forEach(child => {
          const asDomode = child as Domode;
          if (typeof asDomode.destroy === 'function') {
            const destroy = asDomode.destroy as Function;
            destroy();
          }
        });
        for (let hodor of hodors) {
          hodor.destroy();
        }
      };

      element['on'] = (path, listener: Callback) => {
        hodors.push(createHodor(data, path, listener));
      };

      element.mounted = () => {
        if (element.isMounted) return;
        element.isMounted = true;
        hodors.push(...ddProps(data, element, props));
        if (element.context) {
          element.context.mounted!();
        }
        for (let hodor of hodors) {
          hodor.mounted();
        }
      };

      return element;
    },
  };

  function mount(element: Node) {
    const domode = element as Domode;
    if (domode.mounted && !domode.isMounted) {
      domode.mounted();
      domode.isMounted = true;
    }
  }

  function unmount(element: Node) {
    const domode = element as Domode;
    if (domode.destroy) domode.destroy();
    domode.isMounted = false;
  }

  function squint(parent: HTMLElement) {
    new MutationObserver(mutationList => {
      for (let mutation of mutationList) {
        mutation.addedNodes.forEach(node => {
          mount(node);
          const element = node as HTMLElement;
          if (element !== null && element.getElementsByTagName) {
            const children: Element[] = Array.from(
              element.getElementsByTagName('*')
            );
            for (let child of children) {
              mount(child);
            }
          }
        });
        mutation.removedNodes.forEach(node => {
          unmount(node);
          const element = node as HTMLElement;
          if (element !== null && element.getElementsByTagName) {
            const children: Element[] = Array.from(
              element.getElementsByTagName('*')
            );
            for (let child of children) {
              unmount(child);
            }
          }
        });
      }
    }).observe(parent, { childList: true, subtree: true });
  }

  function append(
    parent: HTMLElement,
    view: (contextOptions: ContextOptions) => Domode
  ) {
    squint(parent);
    const element = React.createElement(view);
    parent.appendChild(element);
  }

  if (typeof parent === 'undefined') {
    // @ts-ignore
    return { React, data, append } as DD;
  }

  // @ts-ignore
  window.React = React;
  if (typeof global !== 'undefined') {
    // @ts-ignore
    global.React = React;
  }

  append(parent, view!);
  return data;
}

export default domdom;
