import test from 'ava';
import Pathifier from '../src/pathifier';
import Data from '@eirikb/data';
import domdom from "../src";

function stower() {
  const add = [];
  const remove = [];
  return {
    add,
    remove,
    reset() {
      add.splice(0, add.length);
      remove.splice(0, remove.length);
    },
    toArray(includeValue = false) {
      function push(array) {
        return (index, path, value, oldIndex) => {
          array.push([index, path, includeValue ? value : undefined, oldIndex].filter(p => p !== undefined));
        }
      }

      return {
        add: push(add),
        remove: push(remove)
      };
    }
  };
}

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

test('filterOn after', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').filterOn('filter', (f, u) => u.name === f).to('yes');
  data.set('users.c.name', 'c');
  data.set('filter', 'b');
  t.deepEqual({ b: { name: 'b' } }, data.get('yes'));
});

test('filterOn before', t => {
  const { data } = t.context;
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.set('filter', 'b');
  data.on('users').filterOn('filter', (f, u) => u.name === f).to('yes');
  data.set('users.c.name', 'c');
  t.deepEqual({ b: { name: 'b' } }, data.get('yes'));
  data.set('filter', 'a');
  t.deepEqual({ a: { name: 'a' } }, data.get('yes'));
});

test('only one filter, unfortunately', t => {
  const { data } = t.context;
  t.throws(() => data.on('users').filter(1).filterOn(1));
  t.throws(() => data.on('users').filter(1).filter(1));
});

test('only one sort, unfortunately', t => {
  const { data } = t.context;
  t.throws(() => data.on('users').sort(1).sortOn(1));
  t.throws(() => data.on('users').sort(1).sort(1));
});

test('only one map, unfortunately', t => {
  const { data } = t.context;
  t.throws(() => data.on('users').map(1).map(1));
});

test('only one to, unfortunately', t => {
  const { data } = t.context;
  t.throws(() => data.on('users').to(1).to(1));
});

test('only one array, unfortunately', t => {
  const { data } = t.context;
  t.throws(() => data.on('users').toArray(1).toArray(1));
});

test('toArray initial before', t => {
  const { data } = t.context;
  const { add, toArray } = stower();
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').toArray(toArray());
  t.deepEqual([[0, 'a'], [1, 'b']], add);
});

test('toArray initial after', t => {
  const { data } = t.context;
  const { add, toArray } = stower();
  data.on('users').toArray(toArray());
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  t.deepEqual([[0, 'a'], [1, 'b']], add);
});

test('toArray add', t => {
  const { data } = t.context;
  const { add, toArray, reset } = stower();
  data.on('users').toArray(toArray());
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  t.deepEqual([[0, 'a'], [1, 'b']], add);
  reset();
  data.set('users.c.name', 'c');
  t.deepEqual([[2, 'c']], add);
});

test('toArray remove', t => {
  const { data } = t.context;
  const { add, remove, reset, toArray } = stower();
  data.on('users').toArray(toArray());
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
    c: { name: 'c' }
  });
  t.deepEqual([[0, 'a'], [1, 'b'], [2, 'c']], add);
  t.deepEqual([], remove);
  reset();
  data.unset('users.b');
  t.deepEqual([], add);
  t.deepEqual([[1, 'b']], remove);
});

test('sort', t => {
  const { data } = t.context;
  const { add, toArray } = stower();
  data.set('users', {
    a: { name: 'a' },
    b: { name: 'b' },
  });
  data.on('users').sort((a, b) => b.name.localeCompare(a.name)).toArray(toArray());
  t.deepEqual([[0, 'a'], [0, 'b']], add);
});

test('Update filterOn on update after data is set', t => {
  const { data } = t.context;
  const { add, remove, reset, toArray } = stower();
  data.on('users')
    .map(user => user)
    .filterOn('test', (filter, user) =>
      new RegExp(filter, 'i').test(user)
    ).toArray(toArray());
  data.set('test', '');
  data.set('users', { a: 'a', b: 'b' });
  t.deepEqual([[0, 'a'], [1, 'b']], add);
  reset();
  data.set('test', 'b');
  t.deepEqual([[1, 'b']], add);
  t.deepEqual([[1, 'b'], [0, 'a']], remove);
});

test('filterOn and back', t => {
  const { data } = t.context;
  const { add, remove, reset, toArray } = stower();
  data.on('users')
    .map(user => user.name)
    .filterOn('test', (filter, user) =>
      new RegExp(filter, 'i').test(user.name)
    ).toArray(toArray());

  data.set('test', '');
  data.set('users', { one: { name: 'One!' }, two: { name: 'Two!' } });
  t.deepEqual([[0, 'one'], [1, 'two']], add);
  reset();

  data.set('test', 'two');
  t.deepEqual([[1, 'two'], [0, 'one']], remove);
  t.deepEqual([[1, 'two']], add);
  reset();

  data.set('test', '');
  t.deepEqual([[1, 'two']], remove);
  t.deepEqual([[0, 'one'], [1, 'two']], add);
});

test('on sortOn - custom order update', t => {
  const { data } = t.context;
  const { add, remove, reset, toArray } = stower();

  data.on('players')
    .map(player => player.name)
    .sortOn('test', (val, a, b) => b.name.localeCompare(a.name))
    .toArray(toArray(true));

  data.set('players.1', { name: '1' });
  data.set('players.2', { name: '2' });
  data.set('players.3', { name: '3' });
  t.deepEqual([[0, '1', '1'], [0, '2', '2'], [0, '3', '3']], add);
  reset();
  data.set('test', 'yes');
  reset();

  data.unset('players.1');
  t.deepEqual([[2, '1', '1']], remove);
  reset();

  data.set('players.1', { name: '7' });
  t.deepEqual([[0, '1', '7']], add);
});

