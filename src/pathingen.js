export default () => {
  const self = {};
  const allPaths = new Set();

  function sortedIndex(path) {
    const { paths } = self;

    let low = 0;
    let high = paths.length;

    while (low < high) {
      let mid = (low + high) >>> 1;
      if (self.sorter(path, paths[mid]) > 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }

  self.paths = [];

  self.sorter = (a, b) => a.localeCompare(b);

  self.filterer = () => true;

  self.addPath = (path) => {
    allPaths.add(path);
    if (!self.filterer(path)) return -1;

    const { paths } = self;
    const index = sortedIndex(path);
    paths.splice(index, 0, path);
    return index;
  };

  self.removePath = (path) => {
    allPaths.delete(path);
    const { paths } = self;
    const index = sortedIndex(path);
    paths.splice(index, 1);
    return index;
  };

  self.indexOfPath = (path) => sortedIndex(path);

  self.update = () => {
    const paths = self.paths.slice();
    self.paths = Array.from(allPaths).filter(self.filterer).sort(self.sorter);
    const indexByPath = self.paths.reduce((res, path, index) => {
      res[path] = index;
      return res;
    }, {});
    return paths.map(path => {
      const res = indexByPath[path];
      return typeof res !== 'undefined' ? res : -1
    });
  };

  return self;
};