import { Domdom } from './domdom';
import { GodMode } from './godmode';
import { Data } from '@eirikb/data';

export * from './types';
export default <T>(
  initialData: T,
  domdom: Domdom = new Domdom(new Data())
): GodMode<T> => new GodMode<T>(initialData, domdom);
