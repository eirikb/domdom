import { BaseTransformer, Entry } from '@eirikb/data';
import { Stower } from './types';
import { DomPathifier } from './pathifier';

export function isProbablyPlainObject(obj: any) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

function escapeChild(child: any): Node {
  if (child instanceof Node) return child;

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
  } else if (child instanceof Error) {
    return document.createTextNode(`${child.name}: ${child.message}`);
  }
  return child;
}

export class StowerTransformer extends BaseTransformer {
  private stower: DomStower;

  constructor(stower: DomStower) {
    super();
    this.stower = stower;
  }

  bloodyRebuild(stower: DomStower) {
    this.stower = stower;
  }

  add(index: number, entry: Entry): void {
    this.stower.add(entry.value, index);
  }

  remove(index: number, entry: Entry): void {
    this.stower.remove(entry.value, index);
  }

  update(oldIndex: number, index: number, entry: Entry): void {
    this.stower.remove(entry.value, oldIndex);
    this.stower.add(entry.value, index);
  }
}

type Child = Node | DomStower;

export class DomStower implements Stower {
  private readonly element: HTMLElement;
  private readonly subIndex?: number;
  private readonly parent?: DomStower;
  private readonly children: (Child | undefined)[] = [];
  private _or: any;
  private _orSet: boolean = false;

  constructor(element: HTMLElement, subIndex?: number, parent?: DomStower) {
    this.element = element;
    this.subIndex = subIndex;
    this.parent = parent;
  }

  firstNode(): Node | undefined {
    return this.findChildAfterIndex(0);
  }

  private findChildAfterIndex(index: number): Node | undefined {
    for (let i = index; i < this.children.length; i++) {
      let child = this.children[i];
      if (child instanceof DomStower) {
        child = child.firstNode();
      }
      if (child) return child;
    }
    return undefined;
  }

  appendChild(escaped: Node, index: number, updateChildren: boolean) {
    const nodeAtIndex = this.findChildAfterIndex(index);
    if (nodeAtIndex) {
      this.element.insertBefore(escaped, nodeAtIndex);
      if (updateChildren) this.children.splice(Math.max(0, index), 0, escaped);
    } else {
      if (this.subIndex !== undefined) {
        this.parent?.appendChild(escaped, this.subIndex + 1, false);
        if (updateChildren) this.children.splice(index, 0, escaped);
      } else {
        this.element.appendChild(escaped);
        if (updateChildren) this.children.splice(index, 0, escaped);
      }
    }
  }

  add(child: any, index: number, checkOr = true) {
    if (checkOr) {
      this.checkOr();
    }

    if (child instanceof DomPathifier) {
      const childStower = new DomStower(this.element, index, this);
      (this.element as any).mountables.push(child);

      if (child.transformer instanceof StowerTransformer) {
        child.transformer.bloodyRebuild(this);
      } else {
        child.transformer = new StowerTransformer(childStower);
      }

      if ((this.element as any).isMounted) {
        child.mounted();
      }

      this.children[index] = childStower;
    } else if (Array.isArray(child)) {
      const childStower = new DomStower(this.element, index, this);
      this.children[index] = childStower;
      for (let i = 0; i < child.length; i++) {
        childStower.add(child[i], i);
      }
    } else {
      const escaped = escapeChild(child);
      this.appendChild(escaped, index, true);
    }
  }

  remove(child: any, index: number, checkOr = true) {
    const c = this.children[index];
    child = c || child;
    const isDomStower = child instanceof DomStower;
    if (child && !isDomStower) {
      this.element.removeChild(child);
    } else if (isDomStower) {
      child.clearOut();
    }
    if (!isDomStower) {
      this.children.splice(index, 1);
    }
    if (checkOr) {
      this.checkOr();
    }
  }

  private checkOr() {
    if (this._or !== undefined && this.children.length === 0 && !this._orSet) {
      this._orSet = true;
      let or = this._or;
      if (typeof or === 'function') or = or();
      this.add(or, 0, false);
    } else if (this.children.length > 0 && this._orSet) {
      this._orSet = false;
      this.remove(null, 0, false);
    }
  }

  or(or: any) {
    this._or = or;
    this.checkOr();
  }

  clearOut() {
    for (const child of this.children) {
      if (child instanceof DomStower) {
        child.clearOut();
      } else {
        this.element.removeChild(child as Node);
      }
      this.children.length = 0;
    }
  }
}
