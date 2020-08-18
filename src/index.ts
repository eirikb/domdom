import { Domdom } from './domdom';
import { Data } from '@eirikb/data';

export * from './types';
export default (data: Data = new Data()): Domdom => new Domdom(data);
