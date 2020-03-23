import { isProbablyPlainObject } from './index';

export default function Stower(element) {
  const self = {};
  const slots = [];
  const first = [];

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

  function add(child, before) {
    if (before) {
      element.insertBefore(child, before);
    } else {
      element.appendChild(child);
    }

    if (child.mounted && element.isMounted) {
      child.mounted(element.context);
    }
  }

  function remove(child) {
    child.isMounted = false;
    element.removeChild(child);
    if (child.destroy) child.destroy();
  }

  function addSingle(child, index) {
    child = escapeChild(child);
    if (slots[index]) {
      removeSingle(slots[index], index);
    }
    const before = first.slice(index).find(element => element);
    add(child, before);
    first[index] = child;
    slots[index] = child;
  }

  function addArray(children, index) {
    children = children.map(escapeChild);
    if (slots[index]) {
      removeArray(slots[index], index);
    }
    const before = first.slice(index).find(element => element);
    children.map(child => add(child, before));
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
      child.forEach(child => add(child, before));
    } else {
      add(child, before);
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
    remove(child);
    delete slots[index];
    delete first[index];
  }

  function removeArray(children, index) {
    for (let child of children) {
      remove(child);
    }
    delete slots[index];
    delete first[index];
  }

  function removeWithSubIndex(index, subIndex) {
    const child = (slots[index] || {})[subIndex];
    if (!child) return;

    if (Array.isArray(child)) {
      child.forEach(remove);
    } else {
      remove(child);
    }
    slots[index].splice(subIndex, 1);
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

  self.reorderSubIndexes = (index, res) => {
    for (let removeIndex of res.removeIndexes) {
      self.remove(index, removeIndex);
    }
    const before = first.slice(index + 1).find(element => element);
    slots[index] = [];
    for (let child of res.children) {
      add(child, before);
      slots[index].push(child);
    }
    first[index] = slots[index][0];
  };

  return self;
};
