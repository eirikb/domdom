import { BaseTransformer, Data } from '@eirikb/data';
import { Entry } from '../../data';
import { isProbablyPlainObject } from './halp';
import { Domode } from 'types';

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

export class Transformers extends BaseTransformer<any, HTMLElement> {
  private element: HTMLElement;

  constructor(element: HTMLElement, data: Data) {
    super(data);
    this.element = element;
  }

  add(index: number, entry: Entry<any>): void {
    const child = escapeChild(entry.value);
    if (this.element.childNodes.length >= index) {
      this.element.insertBefore(child, this.element.childNodes[index]);
    } else {
      this.element.appendChild(child);
    }
  }

  remove(index: number, _: Entry<any>): void {
    this.element.removeChild(this.element.childNodes[index]);
  }

  update(oldIndex: number, index: number, entry: Entry<any>): void {
    this.remove(oldIndex, entry);
    this.add(index, entry);
  }
}

export function setAttribute(element: HTMLElement, key: string, value: any) {
  if (value === null) value = '';

  if (key === 'className') key = 'class';

  if (key.startsWith('data-')) {
    const dataKey = key.split('-')[1];
    element.dataset[dataKey] = value;
  } else if (isProbablyPlainObject(value)) {
    if (!element[key]) {
      element[key] = value;
    } else {
      Object.assign(element[key], value);
    }
  } else {
    if (typeof value === 'boolean' || typeof value === 'undefined') {
      if (value) {
        element.setAttribute(key, '');
      } else {
        element.removeAttribute(key);
      }
    } else {
      element.setAttribute(key, value);
    }
  }
}

export class AttributeTransformer extends BaseTransformer<any, any> {
  private readonly element: Domode | HTMLInputElement;
  private readonly key: string;

  constructor(data: Data, element: Domode | HTMLInputElement, key: string) {
    super(data);
    this.element = element;
    this.key = key;
  }

  setVal(value: any) {
    setAttribute(this.element, this.key, value);
  }

  add(_: number, entry): void {
    this.setVal(entry.value);
  }

  remove(_: number, __): void {
    this.setVal(undefined);
  }

  update(_: number, __: number, entry): void {
    this.setVal(entry.value);
  }
}
