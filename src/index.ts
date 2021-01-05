import { Domdom } from './domdom';
import { GodMode } from './godmode';
import { Data } from '@eirikb/data';

export * from './types';
export const godMode = <T>(data: Data = new Data()): GodMode<T> =>
  new GodMode<T>(data);
export default (data: Data = new Data()): Domdom => new Domdom(data);
