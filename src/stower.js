import { isProbablyPlainObject } from './index';

export default function Stower(element) {
  const self = {};
  const slots = [];
  const first = [];
  const pathOrders = [];

  function add(child, before) {
    const origChild = child;
    if (typeof child === 'string') {
      child = document.createTextNode(child);
    } else if (isProbablyPlainObject(child)) {
      child = document.createTextNode(JSON.stringify(child));
    }

    if (before) {
      element.insertBefore(child, before);
    } else {
      element.appendChild(child);
    }

    if (origChild.mounted) {
      origChild.mounted();
    }

    return child;
  }

  function addSingle(child, index) {
    if (slots[index]) {
      removeSingle(slots[index], index);
    }
    const before = first.slice(index).find(element => element);
    child = add(child, before);
    first[index] = child;
    slots[index] = child;
  }

  function addArray(children, index) {
    if (slots[index]) {
      removeArray(slots[index], index);
    }
    const before = first.slice(index).find(element => element);
    children = children.map(child => add(child, before));
    first[index] = children[0];
    slots[index] = children;
  }

  function addWithPath(child, index, path, pathOrder) {
    if (slots[index] && slots[index][path]) {
      removeWithPath(index, path);
    }
    const oPathOrder = pathOrders[index];
    if (pathOrder && oPathOrder) {
      const isSame = pathOrder.length === oPathOrder && pathOrder.every((val, i) => oPathOrder[i] === val);
      if (!isSame) {
        self.reorder(index, pathOrder);
      }
    }
    let before = first.slice(index + 1).find(element => element);

    if (!pathOrder && oPathOrder) {
      pathOrder = oPathOrder;
    }
    if (!pathOrder) {
      pathOrder = [path];
    }
    pathOrders[index] = pathOrder;

    let pathIndex = pathOrder.indexOf(path);
    if (pathIndex < 0) {
      pathOrder.push(path);
      pathIndex = pathOrder.length - 1;
    }
    if (pathIndex === 0) {
      first[index] = child;
    }
    if (slots[index]) {
      const nextPathWithElement = pathOrder.slice(pathIndex + 1).find(p => slots[index][p]);
      if (nextPathWithElement) {
        before = slots[index][nextPathWithElement];
      }
    }

    child = add(child, before);
    slots[index] = slots[index] || {};
    slots[index][path] = child;
  }

  self.add = (child, index, path, pathOrder) => {
    if (path) {
      addWithPath(child, index, path, pathOrder);
    } else if (Array.isArray(child)) {
      addArray(child, index);
    } else {
      addSingle(child, index);
    }
  };

  function removeSingle(child, index) {
    element.removeChild(child);
    delete slots[index];
    delete first[index];
  }

  function removeArray(children, index) {
    for (let child of children) {
      element.removeChild(child);
    }
    delete slots[index];
    delete first[index];
  }

  function removeWithPath(index, path) {
    const child = (slots[index] || {})[path];
    if (!child) return;

    element.removeChild(child);
    delete slots[index][path];
    const pathOrderIndex = pathOrders[index].indexOf(path);
    pathOrders[index].splice(pathOrderIndex, 1);
    first[index] = slots[index][pathOrders[index][0]];
  }

  self.remove = (index, path) => {
    if (path) {
      removeWithPath(index, path);
    } else {
      const child = slots[index];
      if (Array.isArray(child)) {
        removeArray(child, index);
      } else {
        removeSingle(child, index);
      }
    }
  };

  self.reorder = (index, pathOrder) => {
    const slot = slots[index];
    if (!slot) return;

    pathOrders[index] = pathOrder;
    const before = first.slice(index + 1).find(element => element);
    let firstChild;
    for (let path of pathOrder) {
      const child = slot[path];
      if (child) {
        if (!firstChild) {
          firstChild = child;
        }
        add(child, before);
      }
    }
    first[index] = firstChild;
  };

  return self;
};
