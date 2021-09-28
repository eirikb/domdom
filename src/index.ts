import { Data } from '@eirikb/data';
import { Domdom } from './domdom';

export * from './types';
export default <T>(initialData: T, proxyEnabled: boolean = true): Domdom<T> =>
  new Domdom<T>(new Data(), initialData, proxyEnabled);
