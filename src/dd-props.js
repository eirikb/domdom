export default (data, element, props) => {

  const hodors = [];
  let _value;

  function onChange(cb) {
    element.addEventListener('keyup', () => cb(element.value));
    element.addEventListener('input', () => {
      const value = element.type === 'checkbox' ? element.checked : element.value;
      cb(value);
    });
    element.addEventListener('value', () => cb(element.value));
    element.addEventListener('checked', () => cb(element.value));
  }

  function setValue(value) {
    _value = value;
    if (element.type === 'checkbox') {
      element.checked = value;
    } else {
      console.log('set to ', value);
      element.value = value || '';
    }
  }

  if (props) {
    const model = props['dd-model'];
    if (model) {
      onChange(value => data.set(model, value));
      element.on(`!+* ${model}`, setValue);
      new MutationObserver(() => {
        console.log('ffs?!', _value);
        if (typeof _value !== 'undefined') {
          setValue(_value);
        }
      }).observe(element, { childList: true });
    }
    for (let [key, value] of Object.entries(props)) {
      if (value && value.isHodor) {
        function setVal(value) {
          if (typeof element[key] === 'object') {
            Object.assign(element[key], value);
          } else {
            element[key] = value;
          }
        }

        let _or;
        value.stower(0, {
          add: (s) => setVal(s),
          remove: () => {
            if (_or) {
              setVal(_or);
            }
          },
          or(or) {
            _or = or;
            setVal(or);
          }
        });
        hodors.push(value);
      }
    }
  }

  return hodors;
}