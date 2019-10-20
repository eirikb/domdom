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

    let [triggerPath, modelPath, bounceDelay, resetDelay] = (props['dd-bind'] || '').split(' ');
    if (triggerPath && modelPath) {
      bounceDelay = bounceDelay || 2000;
      resetDelay = resetDelay || 2000;

      let value;
      let bounce;
      let resetTimeout;
      onChange(v => {
        if (value === v) return;
        value = v;
        data.trigger(triggerPath, value);
        bounce = Date.now() + bounceDelay;
        clearTimeout(resetTimeout);
        resetTimeout = setTimeout(() => {
          const inData = data.get(modelPath);
          if (value !== inData) {
            setValue(inData);
          }
        }, resetDelay || 0);
      });

      let timeout;
      context.on(modelPath, v => {
        let toSleep = bounce - Date.now();
        clearTimeout(resetTimeout);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = v;
          setValue(value);
        }, toSleep);
      })
    }
  }
}