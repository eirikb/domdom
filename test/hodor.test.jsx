import test from 'ava';
import Hodor from '../src/hodor';
import Data from '@eirikb/data';

test('Hold door', t => {
  const data = Data();
  const hodor = Hodor(data, 'yes');
  hodor.mounted();
  t.plan(1);
  hodor.stower(0, { add: child => t.is(child, 'no') });
  data.set('yes', 'no');
});

test('Hodor or', t => {
  const data = Data();
  const hodor = Hodor(data, 'yes').or(2);
  hodor.mounted();
  t.plan(2);
  hodor.stower(0, { add: child => t.is(2, child) });
  hodor.or(null);
  hodor.stower(0, { add: child => t.is(3, child) });
  data.set('yes', 3);
});

test('Hodor should pass a position index', t => {
  const data = Data();
  const hodor = Hodor(data, 'users.$id');
  hodor.mounted();
  t.plan(3);
  hodor.stower(0, { add: (o, index, subIndex) => t.deepEqual([index, subIndex], [0, 0]) });
  data.set('users.1', { name: 'one' });
  hodor.stower(0, { add: (o, index, subIndex) => t.deepEqual([index, subIndex], [0, 1]) });
  data.set('users.2', { name: 'two' });
  hodor.stower(0, { add: (o, index, subIndex) => t.deepEqual([index, subIndex], [0, 2]) });
  data.set('users.3', { name: 'three' });
});

