import { Data } from '@eirikb/data/dist/types';
import { Domode, Hodor } from 'types';

function setVal(element, key, value) {
  if (typeof element[key] === 'object') {
    Object.assign(element[key], value);
  } else {
    element[key] = value;
  }
}

export default (data: Data, element: Domode | HTMLInputElement, props: (any | Hodor)[]) => {
  const hodors: Hodor[] = [];
  let _value;
  const inputElement = element as HTMLInputElement;
  const domOde = element as Domode;

  function onChange(cb) {
    element.addEventListener('keyup', () => cb(inputElement.value));
    element.addEventListener('input', () => {
      const value =
        inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value;
      cb(value);
    });
    element.addEventListener('value', () => cb(inputElement.value));
    element.addEventListener('checked', () => cb(inputElement.value));
  }

  function setValue(value) {
    _value = value;
    if (inputElement.type === 'checkbox') {
      inputElement.checked = value;
    } else {
      inputElement.value = value || '';
    }
  }

  if (props) {
    const model = props['dd-model'];
    if (model) {
      onChange(value => data.set(model, value));
      domOde.on(`!+* ${model}`, setValue);
      // Special handling for select elements
      new MutationObserver(() => {
        if (typeof _value !== 'undefined') {
          setValue(_value);
        }
      }).observe(element, { childList: true });
    }

    for (let [key, value] of Object.entries(props)) {
      if (value && value['isHodor']) {
        let _or;
        value['stower'](0, {
          add: s => setVal(element, key, s),
          remove: () => {
            if (_or) {
              setVal(element, key, _or);
            }
          },
          or(or) {
            _or = or;
            setVal(element, key, or);
          },
        });
        hodors.push(value);
      }
    }
  }

  return hodors;
};
