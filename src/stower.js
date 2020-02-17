export default function Stower(element) {
  const self = {};
  const slots = [];
  const first = [];

  function add(child, before) {
    if (before) {
      element.insertBefore(child, before);
    } else {
      element.appendChild(child);
    }
  }

  self.add = (child, index) => {
    const before = first.slice(index).find(element => element);

    if (Array.isArray(child)) {
      for (let child of child) {
        add(child, before);
      }
      first[index] = child[0];
    } else {
      add(child, before);
      first[index] = child;
    }
    slots[index] = child;
  };

  self.remove = (index) => {
    const child = slots[index];
    if (Array.isArray(child)) {
      for (let child of child) {
        element.removeChild(child);
      }
    } else {
      element.removeChild(slots[index]);
    }
    delete slots[index];
    delete first[index];
  };

  return self;
};
