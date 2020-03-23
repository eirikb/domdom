import Data from '@eirikb/data';
import Context from './context';
import ddProps from './dd-props';
import Stower from './stower';

export function isProbablyPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

export default (data = Data()) => {
  const React = {
    createElement(tagName, props, ...children) {
      if (typeof tagName === 'function') {
        return new Context(data, tagName, props, children);
      }

      const hodors = [];
      const element = document.createElement(tagName);
      const stower = Stower(element);

      const addHodor = (index, hodor) => {
        hodors.push(hodor);
        hodor.stower(index, stower);
      };

      const appendChild = (index, child, path) => {
        stower.add(child, index, path);
      };

      const setElementValue = (key, value) => {
        if (value && value.then) {
          value.then(res => setElementValue(key, res));
        } else {
          if (isProbablyPlainObject(value) && element[key]) {
            Object.assign(element[key], value);
          } else {
            element[key] = value;
          }
        }
      };

      let counter = 0;
      for (let child of [].concat(...children)) {
        const index = counter++;
        if (typeof child === 'undefined' || child === null) {
        } else if (child.isHodor) {
          addHodor(index, child);
        } else {
          appendChild(index, child);
        }
      }

      if (props) {
        const eventProps = Object.entries(props).filter(([key]) => key.match(/^on[A-Z]/));
        for (let [key, value] of eventProps) {
          const event = key[2].toLowerCase() + key.slice(3);
          element.addEventListener(event, value);
        }

        const nonSpecialProps = Object.entries(props).filter(([key]) => !key.match(/(^dd-|on[A-Z])/));
        for (let [key, value] of nonSpecialProps) {
          if (key === 'class') {
            key = 'className';
          }
          if (!(value && value.isHodor)) {
            setElementValue(key, value);
          }
        }
      }

      element.destroy = () => {
        element.isMounted = false;
        element.childNodes.forEach(child => child.destroy && child.destroy());
        for (let hodor of hodors) {
          hodor.destroy();
        }
      };

      element.mounted = (parentContext) => {
        if (element.isMounted) return;
        element.isMounted = true;
        const context = element.context || parentContext;
        if (context) {
          context.mounted();
          element.context = context;

          ddProps(data, context, element, props);
        }
        element.childNodes.forEach(child => child.mounted && child.mounted(context));
      };
      element.onPath = (path) => {
        element.childNodes.forEach(child => child.onPath && child.onPath(path));
        const bounced = hodors.filter(hodor => hodor.bounce);
        for (let hodor of bounced) {
          hodor.bounce(path);
        }
      };
      for (let hodor of hodors) {
        hodor.mounted();
      }
      return element;
    }
  };

  window.React = React;
  if (typeof global !== 'undefined') {
    global.React = React;
  }

  return {
    append(parent, template) {
      const element = React.createElement(template);
      parent.appendChild(element);
      element.mounted();
    },
    ...data
  }
}
