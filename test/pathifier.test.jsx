import test from 'ava';
import Pathifier from '../src/pathifier';
import Data from '@eirikb/data';

test.beforeEach(t => {
  const data = Data();
  const oldOn = data.on;
  data.on = (flagsAndPath, listener) => {
    if (!flagsAndPath.includes(' ') && !listener) {
      return Pathifier(data, flagsAndPath);
    }
    return oldOn(flagsAndPath, listener);
  };
  t.context.data = data;
});

test('no output no fail', t => {
  const { data } = t.context;
  data.on('users');
  data.set('users.a.name', 'no fail');
  t.pass();
});

test('then before', t => {
  t.plan(1);

  const { data } = t.context;
  data.on('users').then(users => {
    t.deepEqual({ a: { name: 'a' }, b: { name: 'b' } }, users);
  });
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
});

test('then after', t => {
  t.plan(1);

  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').then(users => {
    t.deepEqual({ a: { name: 'a' }, b: { name: 'b' } }, users);
  });
});

test('then unset', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  let users;
  data.on('users').then(u => {
    users = u;
  });
  t.deepEqual({ a: { name: 'a' }, b: { name: 'b' } }, users);
  data.unset('users.b');
  t.deepEqual({ a: { name: 'a' } }, users);
});

test('then unset sub-path', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a', age: 12 },
    b: { name: 'b', age: 42 },
  });
  let users;
  data.on('users').then(u => users = u);
  t.deepEqual({ a: { name: 'a', age: 12 }, b: { name: 'b', age: 42 } }, users);
  data.unset('users.b.age');
  t.deepEqual({ a: { name: 'a', age: 12 }, b: { name: 'b' } }, users);
});

test('to unset', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').to('yes');
  data.unset('users.b');
  t.deepEqual({ a: { name: 'a' } }, data.get('yes'));
});

test('to unset sub-path', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a', age: 12 },
    b: { name: 'b', age: 42 },
  });
  data.on('users').to('yes');
  t.deepEqual({ a: { name: 'a', age: 12 }, b: { name: 'b', age: 42 } }, data.get('yes'));
  data.unset('users.b.age');
  t.deepEqual({ a: { name: 'a', age: 12 }, b: { name: 'b' } }, data.get('yes'));
});

test('then not called for outfiltered data', t => {
  t.plan(1);

  const { data } = t.context;
  data.on('users').filter(user => user.name === 'a').then(users => {
    t.deepEqual({ a: { name: 'a' } }, users);
  });
  data.set('users.a.name', 'a');
  data.set('users.b.name', 'b');
});

test('to before ', t => {
  const { data } = t.context;
  data.on('users').to('yes');
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  t.deepEqual({ a: { name: 'a' }, b: { name: 'b' } }, data.get('yes'));
});

test('to after', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').to('yes');
  t.deepEqual({ a: { name: 'a' }, b: { name: 'b' } }, data.get('yes'));
});

test('to sub-path', t => {
  const { data } = t.context;
  data.on('users').to('yes');
  data.set('users.a.name', 'b');
  t.deepEqual({ a: { name: 'b' } }, data.get('yes'));
});

test('to filter', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').filter(u => u.name !== 'b').to('yes');
  data.set('users.c.name', 'c');
  t.deepEqual({ a: { name: 'a' }, c: { name: 'c' } }, data.get('yes'));
});

test('to map', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').map(user => ({ wat: user.name })).to('yes');
  data.set('users.c.name', 'c');
  t.deepEqual({ a: { wat: 'a' }, b: { wat: 'b' }, c: { wat: 'c' } }, data.get('yes'));
});

test('to map called on parent of eh thingy', t => {
  const { data } = t.context;
  data.on('users').map(user => ({ wat: user.name })).to('yes');
  data.set('users.c.name', 'c');
  t.deepEqual({ c: { wat: 'c' } }, data.get('yes'));
});

test('to map and filter', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').map(u => ({ wat: u.name })).filter(u => u.name !== 'b').to('yes');
  data.set('users.c.name', 'c');
  t.deepEqual({ a: { wat: 'a' }, c: { wat: 'c' } }, data.get('yes'));
});
