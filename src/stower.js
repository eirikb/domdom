export default function Stower(element) {
  const self = {};
  const slots = [];
  const first = [];

  self.add = (child, index) => {
    const before = first.slice(index).find(element => element);
    if (before) {
      element.insertBefore(child, before);
    } else {
      element.appendChild(child);
    }
    first[index] = child;
    slots[index] = child;
  };

  self.remove = (index) => {
    element.removeChild(slots[index]);
    delete slots[index];
    delete first[index];
  };

  return self;
};
