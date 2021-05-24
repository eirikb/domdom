import { Domdom } from './domdom';
import { GodMode } from './godmode';
import { Data } from '@eirikb/data';

export * from './types';
export const godMode = <T>(
  initialData: T,
  domdom: Domdom = new Domdom(new Data())
): GodMode<T> => new GodMode<T>(initialData, domdom);
export default (data: Data = new Data()): Domdom => new Domdom(data);
