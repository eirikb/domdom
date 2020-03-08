import test from 'ava';
import Pathingen from '../src/pathingen'

test('Hello, world', t => {
  const pathingen = Pathingen();
  t.is(pathingen.addPath('a'), 0);
  t.deepEqual(pathingen.paths, ['a']);
  t.is(pathingen.addPath('b'), 1);
  t.is(pathingen.addPath('c'), 2);
  t.deepEqual(pathingen.paths, ['a', 'b', 'c']);
});

test('Hello, world ordered', t => {
  const pathingen = Pathingen();
  t.is(pathingen.addPath('c'), 0);
  t.deepEqual(pathingen.paths, ['c']);
  t.is(pathingen.addPath('b'), 0);
  t.deepEqual(pathingen.paths, ['b', 'c']);
  t.is(pathingen.addPath('a'), 0);
  t.deepEqual(pathingen.paths, ['a', 'b', 'c']);
});

test('Custom sort', t => {
  const pathingen = Pathingen();
  pathingen.sorter = (a, b) => b.localeCompare(a);
  t.is(pathingen.addPath('a'), 0);
  t.deepEqual(pathingen.paths, ['a']);
  t.is(pathingen.addPath('b'), 0);
  t.deepEqual(pathingen.paths, ['b', 'a']);
  t.is(pathingen.addPath('c'), 0);
  t.deepEqual(pathingen.paths, ['c', 'b', 'a']);
});

test('Custom resort', t => {
  const pathingen = Pathingen();
  t.is(pathingen.addPath('a'), 0);
  t.is(pathingen.addPath('b'), 1);
  t.is(pathingen.addPath('c'), 2);
  t.deepEqual(pathingen.paths, ['a', 'b', 'c']);
  pathingen.sorter = (a, b) => b.localeCompare(a);
  pathingen.update();
  t.deepEqual(pathingen.paths, ['c', 'b', 'a']);
});

test('Custom objects', t => {
  const pathingen = Pathingen();
  const data = {
    a: { name: 'a', level: 1 },
    b: { name: 'b', level: 2 },
    c: { name: 'c', level: 3 }
  };
  pathingen.sorter = (a, b) => data[a].level - data[b].level;

  t.is(pathingen.addPath('a'), 0);
  t.deepEqual(pathingen.paths, ['a']);
  t.is(pathingen.addPath('b'), 1);
  t.deepEqual(pathingen.paths, ['a', 'b']);
  t.is(pathingen.addPath('c'), 2);
  t.deepEqual(pathingen.paths, ['a', 'b', 'c']);

  pathingen.sorter = (a, b) => data[b].level - data[a].level;
  pathingen.update();
  t.deepEqual(pathingen.paths, ['c', 'b', 'a']);
});

test('Remove path', t => {
  const pathingen = Pathingen();
  t.is(pathingen.addPath('c'), 0);
  t.is(pathingen.addPath('b'), 0);
  t.is(pathingen.addPath('a'), 0);
  t.deepEqual(pathingen.paths, ['a', 'b', 'c']);
  pathingen.removePath('b');
  t.deepEqual(pathingen.paths, ['a', 'c']);
  t.is(pathingen.addPath('d'), 2);
  t.deepEqual(pathingen.paths, ['a', 'c', 'd']);
});

test('Filterer', t => {
  const pathingen = Pathingen();
  pathingen.filterer = path => path !== 'b';
  t.is(pathingen.addPath('c'), 0);
  t.is(pathingen.addPath('b'), -1);
  t.is(pathingen.addPath('a'), 0);
  t.deepEqual(pathingen.paths, ['a', 'c']);
});

test('Filterer change', t => {
  const pathingen = Pathingen();
  pathingen.filterer = path => path !== 'b';
  pathingen.addPath('c');
  pathingen.addPath('b');
  pathingen.addPath('a');
  pathingen.filterer = path => path !== 'a';
  pathingen.update();
  t.deepEqual(pathingen.paths, ['b', 'c']);
});

test('Filterer and sorter change', t => {
  const pathingen = Pathingen();
  pathingen.filterer = path => path !== 'b';
  pathingen.sorter = (a, b) => b.localeCompare(a);
  pathingen.addPath('c');
  pathingen.addPath('b');
  pathingen.addPath('a');
  t.deepEqual(pathingen.paths, ['c', 'a']);
  pathingen.filterer = path => path !== 'a';
  pathingen.sorter = (a, b) => a.localeCompare(b);
  pathingen.update();
  t.deepEqual(pathingen.paths, ['b', 'c']);
});

test('Update gives data stower can use to reorder without needing to reorder all - filter', t => {
  const pathingen = Pathingen();
  pathingen.addPath('a');
  pathingen.addPath('b');
  pathingen.addPath('c');
  pathingen.addPath('d');
  pathingen.addPath('e');
  t.deepEqual(pathingen.paths, ['a', 'b', 'c', 'd', 'e']);
  pathingen.filterer = path => path !== 'b' && path !== 'd';
  t.deepEqual(pathingen.update(), [0, -1, 1, -1, 2]);
  t.deepEqual(pathingen.paths, ['a', 'c', 'e']);
});

test('Update gives data stower can use to reorder without needing to reorder all - sort', t => {
  const pathingen = Pathingen();
  pathingen.addPath('a');
  pathingen.addPath('b');
  pathingen.addPath('c');
  pathingen.addPath('d');
  t.deepEqual(pathingen.paths, ['a', 'b', 'c', 'd']);
  pathingen.sorter = (a, b) => b.localeCompare(a);
  t.deepEqual(pathingen.update(), [3, 2, 1, 0]);
  t.deepEqual(pathingen.paths, ['d', 'c', 'b', 'a']);
});

test('Update gives data stower can use to reorder without needing to reorder all - filter and sort', t => {
  const pathingen = Pathingen();
  pathingen.addPath('a');
  pathingen.addPath('b');
  pathingen.addPath('c');
  pathingen.addPath('d');
  pathingen.addPath('e');
  t.deepEqual(pathingen.paths, ['a', 'b', 'c', 'd', 'e']);
  pathingen.filterer = path => path !== 'b' && path !== 'd';
  pathingen.sorter = (a, b) => b.localeCompare(a);
  t.deepEqual(pathingen.update(), [2, -1, 1, -1, 0]);
  t.deepEqual(pathingen.paths, ['e', 'c', 'a']);
});
