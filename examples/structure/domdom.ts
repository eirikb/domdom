import domdom from '@eirikb/domdom';

export interface Data {
  hello: string;
}

const dd = domdom<Data>({ hello: 'world' });
export const React = dd.React;
export const init = dd.init;
export const data = dd.data;
export const don = dd.don;
export const path = dd.path;
