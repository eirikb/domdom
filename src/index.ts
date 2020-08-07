import { Domdom } from './domdom';
import { Data } from '@eirikb/data';
export default (data: Data = new Data()): Domdom => new Domdom(data);
