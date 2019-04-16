const {get, set, clone} = require('./common');

module.exports = class {
  constructor(prefix) {
    this.prefix = prefix;
    this.next = 1;
    this.clear();
    this._listeners = {};
    this._listenersLookupTable = {};
    this._paths = {};
  }

  setPath(path) {
    path = path.replace(/\$/g, '$.');
    const orig = get(this._paths, path);
    if (!orig) {
      set(this._paths, path, true);
    }
  }

  getPaths(path) {
    const parts = path.split('.');
    const paths = [];

    function children(res, parent, i) {
      if (i >= parts.length) return;

      const key = parts[i];

      if (res.wildKey) {
        res.key.push(key);
        children(res, {}, i + 1);
        return;
      }

      if (parent.$) {
        for (let wild of Object.keys(parent.$)) {
          const wildKey = '$' + wild;
          const branch = clone(res);
          branch.key.push(wildKey);
          paths.push(branch);
          branch.keys[wildKey] = key;
          children(branch, parent.$[wild], i + 1);
        }
      }

      if (parent['>']) {
        const branch = clone(res);
        branch.wildKey = branch.key.concat('>');
        paths.push(branch);
        children(branch, {}, i + 1);
      }

      res.key.push(key);

      const next = parent[key];
      if (next) {
        children(res, parent[key], i + 1);
      } else {
        res.dead = true;
      }
    }

    const first = {key: [], keys: {}};
    paths.push(first);
    children(first, this._paths, 0);
    return paths.filter(res => {
      if (res.dead) return false;
      res.key = (res.wildKey || res.key).join('.');
      if (res.wildKey) {
        res.pathDiff = parts.slice(res.wildKey.length - 1).join('.');
      }
      res.path = path;
      return true;
    });
  }

  add(path, listener) {
    this.setPath(path);

    const listeners = this._listeners[path] = this._listeners[path] || [];
    const ref = [this.prefix, this.next].join('-');
    this.next++;
    const wrapper = {
      listener, ref
    };
    listeners.push(wrapper);
    this._listenersLookupTable[ref] = path;
    return ref;
  }

  remove(ref) {
    const key = this._listenersLookupTable[ref];
    delete this._listenersLookupTable[ref];
    const listeners = this._listeners[key];
    if (!listeners) return;

    if (listeners.length === 1) {
      delete this._listeners[key];
      return;
    }
    const wrapperIndex = listeners.findIndex(wrapper => wrapper.ref === ref);
    if (wrapperIndex >= 0) {
      listeners.splice(wrapperIndex, 2);
    }
  }

  trigger(path, value) {
    const paths = this.getPaths(path);

    let result = [];

    for (let {key, keys, path, pathDiff} of paths) {
      for (let {listener} of (this._listeners[key] || [])) {
        result.push(
          listener(value, Object.assign({path, pathDiff}, keys))
        );
      }
    }
    return result.length === 1 ? result[0] : result;
  }

  clear() {
    this._listeners = {};
  }
};