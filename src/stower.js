export default function Stower(element) {
  const self = {};
  const slots = [];
  const first = [];
  const pathifiers = [];

  function add(child, before) {
    if (before) {
      element.insertBefore(child, before);
    } else {
      element.appendChild(child);
    }
  }

  function addSingle(child, index) {
    const before = first.slice(index).find(element => element);
    add(child, before);
    first[index] = child;
    slots[index] = child;
  }

  function addArray(children, index) {
    const before = first.slice(index).find(element => element);
    for (let child of children) {
      add(child, before);
    }
    first[index] = children[0];
    slots[index] = children;
  }

  function addWithPath(child, index, path) {
    const before = first.slice(index + 1).find(element => element);
    add(child, before);
    if (!first[index]) {
      first[index] = child;
    }
    slots[index] = slots[index] || {};
    slots[index][path] = child;
  }

  self.add = (child, index, path) => {
    if (path) {
      addWithPath(child, index, path);
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
    if (first[index] === child) {
      first[index] = Object.values(slots[index])[0];
    }
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

  return self;
};
