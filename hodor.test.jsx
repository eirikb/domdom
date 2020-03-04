import test from 'ava';
import Hodor from './src/hodor';
import Data from '@eirikb/data';

test('Hold door', t => {
  const data = Data();
  const hodor = Hodor(data, 'yes');
  t.plan(1);
  hodor.add = _ => t.deepEqual({ path: 'yes', res: 'no' }, _);
  data.set('yes', 'no');
});

