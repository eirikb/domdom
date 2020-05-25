import { Stower } from "@eirikb/data";

export function isProbablyPlainObject(obj: any) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

export default function (element: HTMLElement): Stower {
  const self = {} as Stower;
  const slots: HTMLElement[][] = [];
  const first: HTMLElement[] = [];
  const ors: any[] = [];
  const hasOr: any[] = [];

  function escapeChild(child: any) {
    if (child === null || typeof child === 'undefined') {
      return document.createTextNode('');
    } else if (
      typeof child === 'string' ||
      typeof child === 'number' ||
      typeof child === 'boolean'
    ) {
      return document.createTextNode(`${child}`);
    } else if (isProbablyPlainObject(child)) {
      return document.createTextNode(JSON.stringify(child));
    }
    return child;
  }

  function add(index: number, child: any, before: HTMLElement) {
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

    if (
      typeof ors[index] !== 'undefined' &&
      (!slots[index] || slots[index].length === 0)
    ) {
      let or = ors[index];
      if (typeof or === 'function') or = or();
      or = escapeChild(or);
      hasOr[index] = or;
      element.appendChild(or);
    }
  }

  function addSingle(child: any, index: number) {
    child = escapeChild(child);
    if (slots[index]) {
      removeSingle(slots[index], index);
    }
    const before = first.slice(index).find(element => element);
    add(index, child, before!);
    first[index] = child;
    slots[index] = child;
  }

  function addArray(children: any[], index: number) {
    children = children.map(escapeChild);
    if (slots[index]) {
      removeArray(slots[index], index);
    }
    const before = first.slice(index).find(element => element);
    children.map(child => add(index, child, before!));
    first[index] = children[0];
    slots[index] = children;
  }

  function addWithSubIndex(child: any, index: number, subIndex: number) {
    const isArray = Array.isArray(child);
    child = isArray ? child.map(escapeChild) : escapeChild(child);
    let before: HTMLElement | undefined;
    if (first[index]) {
      before = slots[index][subIndex];
    }
    if (before === undefined) {
      before = first.slice(index + 1).find(element => element);
    }

    if (isArray) {
      (child as any[]).forEach(child => add(index, child, before!));
    } else {
      add(index, child, before!);
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

  self.add = (child: any, index: number, subIndex: number) => {
    if (typeof subIndex !== 'undefined') {
      addWithSubIndex(child, index, subIndex);
    } else if (Array.isArray(child)) {
      addArray(child, index);
    } else {
      addSingle(child, index);
    }
  };

  function removeSingle(child: any, index: number) {
    delete slots[index];
    delete first[index];
    if (child) remove(index, child);
  }

  function removeArray(children: any[], index: number) {
    delete slots[index];
    delete first[index];
    for (let child of children) {
      remove(index, child);
    }
  }

  function removeWithSubIndex(index: number, subIndex: number) {
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

  self.remove = (index: number, subIndex: number) => {
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

  self.or = (or: any, index: number) => {
    ors[index] = or;
    remove(index);
  };

  return self;
}
