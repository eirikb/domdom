export default (data, context, element, props) => {

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
    if (element.type === 'checkbox') {
      element.checked = value;
    } else {
      element.value = value || '';
    }
  }

  if (props) {
    const model = props['dd-model'];
    if (model) {
      onChange(value => data.set(model, value));
      context.on(model, setValue);
    }
    for (let [key, value] of Object.entries(props)) {
      if (value && value.isHodor) {
        function setValue(value) {
          if (typeof element[key] === 'object') {
            Object.assign(element[key], value);
          } else {
            element[key] = value;
          }
        }

        let _or;
        value.stower(0, {
          add: (s) => setValue(s),
          remove: () => {
            if (_or) {
              setValue(_or);
            }
          },
          or(or) {
            _or = or;
            setValue(or);
          }
        });
      }
    }
  }
}