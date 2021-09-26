import { Domode, Mountable } from './types';
import { BaseTransformer, Data } from '@eirikb/data';
import { AttributeTransformer, setAttribute } from './transformers';

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
      if (value instanceof BaseTransformer) {
        value.addTransformer(new AttributeTransformer(data, element, key));
      } else if (key.startsWith('on')) {
        const name = key[2].toLocaleLowerCase() + key.slice(3);
        element.addEventListener(name, (...args) => value(...args));
      } else {
        setAttribute(element, key, value);
      }
    }
  }
};
