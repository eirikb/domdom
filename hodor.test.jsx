import test from 'ava';
import Hodor from './src/hodor';
import Data from '@eirikb/data';

test('Hold door', t => {
  const data = Data();
  const hodor = Hodor(data, 'yes');
  t.plan(1);
  hodor.stower(0, { add: child => t.is(child, 'no') });
  data.set('yes', 'no');
});

test('Hodor or', t => {
  const data = Data();
  const hodor = Hodor(data, 'yes').or(2);
  t.plan(2);
  hodor.stower(0, { add: child => t.is(2, child) });
  hodor.or(null);
  hodor.stower(0, { add: child => t.is(3, child) });
  data.set('yes', 3);
});

// test('Hodor should pass an position index', t => {
//   const data = Data();
//   const hodor = Hodor(data, 'users.$id');
//   hodor.add = res => console.log('res', res);
//   data.set('users', {
//     1: { name: 'one' },
//     2: { name: 'two' },
//     3: { name: 'three' }
//   });
//   t.pass();
// });
//
