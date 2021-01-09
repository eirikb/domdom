import { Domode, Mountable } from './types';
import { Transformer, BaseTransformer, Data } from '@eirikb/data';
import { DomPathifier } from './pathifier';

function setAttribute(element: HTMLElement, key: string, value: any) {
  if (value === null) value = '';

  if (key === 'className') key = 'class';

  if (key.startsWith('data-')) {
    const dataKey = key.split('-')[1];
    element.dataset[dataKey] = value;
  } else if (typeof value === 'object') {
    Object.assign(element[key], value);
  } else {
    if (typeof value === 'boolean' || typeof value === 'undefined') {
      if (value) {
        element.setAttribute(key, '');
      } else {
        element.removeAttribute(key);
      }
    } else {
      element.setAttribute(key, value);
    }
  }
}

class AttributeTransformer extends BaseTransformer {
  element: Domode | HTMLInputElement;
  private readonly key: string;

  constructor(
    parent: Transformer,
    element: Domode | HTMLInputElement,
    key: string
  ) {
    super(parent);
    this.element = element;
    this.key = key;
  }

  setVal(value: any) {
    setAttribute(this.element, this.key, value);
  }

  add(_: number, entry): void {
    this.setVal(entry.value);
  }

  remove(_: number, __): void {
    this.setVal(undefined);
  }

  update(_: number, __: number, entry): void {
    this.setVal(entry.value);
  }
}

export default (
  data: Data,
  mountables: Mountable[],
  element: Domode | HTMLInputElement,
  props?: { [key: string]: any }
) => {
  let _value: any;
  const inputElement = element as HTMLInputElement;

  function onChange(cb: Function) {
    element.addEventListener('keyup', () => cb(inputElement.value));
    element.addEventListener('input', () => {
      const value =
        inputElement.type === 'checkbox'
          ? inputElement.checked
          : inputElement.value;
      cb(value);
    });
    element.addEventListener('value', () => cb(inputElement.value));
    element.addEventListener('checked', () => cb(inputElement.value));
  }

  function setValue(value: any) {
    _value = value;
    if (inputElement.type === 'checkbox') {
      inputElement.checked = value;
    } else {
      inputElement.value = value || '';
    }
  }

  if (props) {
    const propsAsAny = props as any;
    const model = propsAsAny['dd-model'];
    if (model) {
      onChange((value: any) => data.set(model, value));
      let ref: string = '';
      mountables.push({
        mounted() {
          ref = data.on(`!+* ${model}`, setValue);
        },
        unmounted() {
          data.off(ref);
        },
      });

      // Special handling for select elements
      new MutationObserver(() => {
        if (typeof _value !== 'undefined') {
          setValue(_value);
        }
      }).observe(element, { childList: true });
    }

    for (let [key, value] of Object.entries(props)) {
      if (value && value instanceof DomPathifier) {
        if (value.transformer instanceof AttributeTransformer) {
          value.transformer.element = element;
        } else {
          value.transformer = new AttributeTransformer(
            value.lastTransformer(),
            element,
            key
          );
        }
        mountables.push(value);
      } else if (key.startsWith('on')) {
        const name = key[2].toLocaleLowerCase() + key.slice(3);
        element.addEventListener(name, (...args) => value(...args));
      } else {
        setAttribute(element, key, value);
      }
    }
  }
};
