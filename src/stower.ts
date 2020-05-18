export function isProbablyPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

export interface Stower {
  add(child: any, index?: number, subIndex?: number);

  remove(index: number, subIndex?: number);

  or(or: any, index: number);
}

export default function (element): Stower {
  const self = {} as Stower;
  const slots = [];
  const first = [];
  const ors = [];
  const hasOr = [];

  function escapeChild(child) {
    if (child === null || typeof child === 'undefined') {
      return document.createTextNode('');
    } else if (typeof child === 'string'
      || typeof child === 'number'
      || typeof child === 'boolean') {
      return document.createTextNode(`${child}`);
    } else if (isProbablyPlainObject(child)) {
      return document.createTextNode(JSON.stringify(child));
    }
    return child;
  }

  function add(index, child, before) {
    if (typeof hasOr[index] !== 'undefined') {
      element.removeChild(hasOr[index]);
      delete hasOr[index];
    }
    if (before) {
      element.insertBefore(child, before);
    } else {
      element.appendChild(child);
    }
  }

  function remove(index: number, child?: HTMLElement) {
    if (child) {
      element.removeChild(child);
    }

    if (typeof ors[index] !== 'undefined' && (!slots[index] || slots[index].length === 0)) {
      let or = ors[index];
      if (typeof or === 'function') or = or();
      or = escapeChild(or);
      hasOr[index] = or;
      element.appendChild(or);
    }
  }

  function addSingle(child, index) {
    child = escapeChild(child);
    if (slots[index]) {
      removeSingle(slots[index], index);
    }
    const before = first.slice(index).find(element => element);
    add(index, child, before);
    first[index] = child;
    slots[index] = child;
  }

  function addArray(children, index) {
    children = children.map(escapeChild);
    if (slots[index]) {
      removeArray(slots[index], index);
    }
    const before = first.slice(index).find(element => element);
    children.map(child => add(index, child, before));
    first[index] = children[0];
    slots[index] = children;
  }

  function addWithSubIndex(child, index, subIndex) {
    const isArray = Array.isArray(child);
    child = isArray ? child.map(escapeChild) : escapeChild(child);
    let before;
    if (first[index]) {
      before = slots[index][subIndex];
    }
    if (!before) {
      before = first.slice(index + 1).find(element => element);
    }

    if (isArray) {
      child.forEach(child => add(index, child, before));
    } else {
      add(index, child, before);
    }
    slots[index] = slots[index] || [];
    if (slots[index][subIndex]) {
      slots[index].splice(subIndex, 0, child);
    } else {
      slots[index][subIndex] = child;
    }
    if (subIndex === 0) {
      first[index] = isArray ? child[0] : child;
    }
  }

  self.add = (child, index, subIndex) => {
    if (typeof subIndex !== 'undefined') {
      addWithSubIndex(child, index, subIndex);
    } else if (Array.isArray(child)) {
      addArray(child, index);
    } else {
      addSingle(child, index);
    }
  };

  function removeSingle(child, index) {
    delete slots[index];
    delete first[index];
    if (child) remove(index, child);
  }

  function removeArray(children, index) {
    delete slots[index];
    delete first[index];
    for (let child of children) {
      remove(index, child);
    }
  }

  function removeWithSubIndex(index, subIndex) {
    const child = (slots[index] || {})[subIndex];
    if (!child) return;

    if (Array.isArray(child)) {
      child.forEach(child => remove(index, child));
      slots[index] = [];
      remove(index);
    } else {
      slots[index].splice(subIndex, 1);
      remove(index, child);
    }
    if (subIndex === 0) {
      first[index] = slots[index][0];
    }
  }

  self.remove = (index, subIndex) => {
    if (typeof subIndex !== 'undefined') {
      removeWithSubIndex(index, subIndex);
    } else {
      const child = slots[index];
      if (Array.isArray(child)) {
        removeArray(child, index);
      } else {
        removeSingle(child, index);
      }
    }
  };

  self.or = (or, index) => {
    ors[index] = or;
    remove(index);
  };

  return self;
};
