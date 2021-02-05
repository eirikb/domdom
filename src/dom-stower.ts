import { BaseTransformer, Entry } from '@eirikb/data';
import { Stower } from './types';
import { DomPathifier } from './pathifier';

export function isProbablyPlainObject(obj: any) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

function escapeChild(child: any): Node {
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

interface First {
  child: Child;
  index: number;
}

export class DomStower implements Stower {
  private readonly element: HTMLElement;
  private readonly subIndex?: number;
  private readonly parent?: DomStower;
  private readonly children: (Child | undefined)[] = [];
  private first?: First;
  // ors: any[] = [];
  // hasOr: any[] = [];

  constructor(element: HTMLElement, subIndex?: number, parent?: DomStower) {
    this.element = element;
    this.subIndex = subIndex;
    this.parent = parent;
  }

  firstNode(): Node | undefined {
    if (!this.first) return;
    const { child } = this.first;
    if (child instanceof DomStower) {
      return child.firstNode();
    }
    return child;
  }

  private setChild(child: Child, index: number) {
    if (this.children[index]) return;

    if (!this.first || (this.first && index < this.first.index)) {
      this.first = { child, index };
    }
    this.children[index] = child;
  }

  private findChildAfterIndex(index: number): Node | undefined {
    for (let i = index + 1; i < this.children.length; i++) {
      let child = this.children[i];
      if (child instanceof DomStower) {
        child = child.firstNode();
      }
      if (child) return child;
    }
    return undefined;
  }

  add(child: any, index: number) {
    console.log(`${this.subIndex ?? 'x'} add`, index, child);
    if (child instanceof DomPathifier) {
      const childStower = new DomStower(this.element, index, this);
      child.transformer = new StowerTransformer(childStower);
      (this.element as any).mountables.push(child);
      this.setChild(childStower, index);
    } else if (Array.isArray(child)) {
      const childStower = new DomStower(this.element, index, this);
      this.setChild(childStower, index);
      for (let i = 0; i < child.length; i++) {
        childStower.add(child[i], i);
      }
    } else {
      console.log(
        `${this.subIndex ?? 'x'} nodes before`,
        this.children.map(c => {
          if (c instanceof DomStower) return 'dd' + (c.subIndex ?? 'x');
          return c;
        })
      );
      console.log(
        `${this.subIndex ?? 'x'} nodes BEFORE`,
        this.children.map(c => {
          if (c instanceof DomStower) return c.firstNode();
          return c;
        })
      );
      const escaped = escapeChild(child);
      const nodeAtIndex = this.findChildAfterIndex(index);
      console.log('nodeAtIndex', nodeAtIndex);

      if (nodeAtIndex) {
        console.log('escaped', escaped, 'nodeatindex', nodeAtIndex);
        this.element.insertBefore(escaped, nodeAtIndex);
        console.log(`${this.subIndex ?? 'x'} insertBefore`, nodeAtIndex);
      } else {
        if (this.subIndex !== undefined) {
          this.parent?.add(child, this.subIndex);
        } else {
          console.log(`${this.subIndex ?? 'x'} appendChild`);
          this.element.appendChild(escaped);
        }
      }
      this.setChild(escaped, index);
      console.log(
        `${this.subIndex ?? 'x'} nodes after`,
        this.children.map(c => {
          if (c instanceof DomStower) return 'dd' + (c.subIndex ?? 'x');
          return c;
        })
      );
      console.log('html', this.element.innerHTML);
    }
    // if (child instanceof DomPathifier) {
    //   const childStower = new ChildStower(this, index, child);
    //   console.log(3, child);
    //   (this.element as any).mountables.push(childStower);
    //   if (child.transformer instanceof StowerTransformer) {
    //     console.log(4);
    //     child.transformer.bloodyRebuild(this, index);
    //   } else {
    //     console.log(5);
    //     child.transformer = new StowerTransformer(this, index);
    //   }
    // } else {
    //   if (Array.isArray(child)) {
    //     console.log('it is the array', child);
    //     // this.addArray(child, index);
    //     new ChildStower(this, index, child);
    //     // this.add(childStower, index);
    //   } else {
    //     this.addSingle(child, index);
    //   }
    // }
  }

  remove(child: any, index: number) {
    console.log('remove', index, child);
    child = this.children[index] || child;
    if (child) {
      this.element.removeChild(child);
    }
    delete this.children[index];
  }

  // or(index: number, or: any) {
  //   this.ors[index] = or;
  //   this._remove(index);
  // }
}
