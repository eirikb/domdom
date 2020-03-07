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
  pathingen.resort();
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
  pathingen.resort();
  t.deepEqual(pathingen.paths, ['c', 'b', 'a']);
});
