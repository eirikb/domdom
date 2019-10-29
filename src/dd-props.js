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
        element[key] = value.or();
        value.remove = () => 0;
        value.add = ({ res }) => {
          element[key] = res;
        };
        const first = value.toAdd[0];
        if (first) {
          element[key] = first.res;
        }
      }
    }
  }
}