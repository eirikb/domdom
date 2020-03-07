export default () => {
  const self = {};

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
  self.addPath = (path) => {
    const { paths } = self;
    const index = sortedIndex(path);
    paths.splice(index, 0, path);
    return index;
  };
  self.resort = () => {
    self.paths.sort(self.sorter);
  };

  return self;
};