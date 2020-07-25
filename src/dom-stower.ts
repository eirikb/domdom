import { Stower } from '@eirikb/data';

export function isProbablyPlainObject(obj: any) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

export class DomStower implements Stower {
  constructor(element: HTMLElement) {
    this.element = element;
  }

  element: HTMLElement;
  slots: HTMLElement[][] = [];
  first: HTMLElement[] = [];
  ors: any[] = [];
  hasOr: any[] = [];

  escapeChild(child: any) {
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

  _add(index: number, child: any, before: HTMLElement) {
    if (typeof this.hasOr[index] !== 'undefined') {
      this.element.removeChild(this.hasOr[index]);
      delete this.hasOr[index];
    }
    if (before) {
      this.element.insertBefore(child, before);
    } else {
      this.element.appendChild(child);
    }
  }

  _remove(index: number, child?: HTMLElement) {
    if (child) {
      this.element.removeChild(child);
    }

    if (
      typeof this.ors[index] !== 'undefined' &&
      (!this.slots[index] || this.slots[index].length === 0)
    ) {
      let or = this.ors[index];
      if (typeof or === 'function') or = or();
      or = this.escapeChild(or);
      this.hasOr[index] = or;
      this.element.appendChild(or);
    }
  }

  addSingle(child: any, index: number) {
    child = this.escapeChild(child);
    if (this.slots[index]) {
      this.removeSingle(this.slots[index], index);
    }
    const before = this.first.slice(index).find(element => element);
    this._add(index, child, before!);
    this.first[index] = child;
    this.slots[index] = child;
  }

  addArray(children: any[], index: number) {
    children = children.map(this.escapeChild);
    if (this.slots[index]) {
      this.removeArray(this.slots[index], index);
    }
    const before = this.first.slice(index).find(element => element);
    children.map(child => this._add(index, child, before!));
    this.first[index] = children[0];
    this.slots[index] = children;
  }

  addWithSubIndex(child: any, index: number, subIndex: number) {
    const isArray = Array.isArray(child);
    child = isArray ? child.map(this.escapeChild) : this.escapeChild(child);
    let before: HTMLElement | undefined;
    if (this.first[index]) {
      before = this.slots[index][subIndex];
    }
    if (before === undefined) {
      before = this.first.slice(index + 1).find(element => element);
    }

    if (isArray) {
      (child as any[]).forEach(child => this._add(index, child, before!));
    } else {
      this._add(index, child, before!);
    }
    this.slots[index] = this.slots[index] || [];
    if (this.slots[index][subIndex]) {
      this.slots[index].splice(subIndex, 0, child);
    } else {
      this.slots[index][subIndex] = child;
    }
    if (subIndex === 0) {
      this.first[index] = isArray ? child[0] : child;
    }
  }

  removeSingle(child: any, index: number) {
    delete this.slots[index];
    delete this.first[index];
    if (child) this._remove(index, child);
  }

  removeArray(children: any[], index: number) {
    delete this.slots[index];
    delete this.first[index];
    for (let child of children) {
      this._remove(index, child);
    }
  }

  removeWithSubIndex(index: number, subIndex: number) {
    const child = (this.slots[index] || {})[subIndex];
    if (!child) return;

    if (Array.isArray(child)) {
      child.forEach(child => this._remove(index, child));
      this.slots[index] = [];
      this._remove(index);
    } else {
      this.slots[index].splice(subIndex, 1);
      this._remove(index, child);
    }
    if (subIndex === 0) {
      this.first[index] = this.slots[index][0];
    }
  }

  add(child: any, index: number, subIndex?: number) {
    if (typeof subIndex !== 'undefined') {
      this.addWithSubIndex(child, index, subIndex);
    } else if (Array.isArray(child)) {
      this.addArray(child, index);
    } else {
      this.addSingle(child, index);
    }
  }

  remove(_: any, index: number, subIndex?: number) {
    if (typeof subIndex !== 'undefined') {
      this.removeWithSubIndex(index, subIndex);
    } else {
      const child = this.slots[index];
      if (Array.isArray(child)) {
        this.removeArray(child, index);
      } else {
        this.removeSingle(child, index);
      }
    }
  }

  or(index: number, or: any) {
    this.ors[index] = or;
    this._remove(index);
  }
}
