function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Object;
}

function get(input, path) {
  path = path.split('.');
  for (let i = 0; i < path.length; i++) {
    input = input[path[i]];
    if (typeof input === 'undefined') return;
  }
  return input;
}

function set(input, path, value) {
  path = path.split('.');
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    if (!isPlainObject(input[current])) {
      input[current] = {};
    }
    input = input[current];
  }
  input[path[path.length - 1]] = value;
}

function unset(input, path) {
  path = path.split('.');
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    if (!isPlainObject(input[current])) {
      input[current] = {};
    }
    input = input[current];
  }
  delete input[path[path.length - 1]];
}

function clone(input) {
  if (!isPlainObject(input)) return input;

  const cloned = {};
  for (let key of Object.keys(input)) {
    const value = input[key];
    if (isPlainObject(value)) {
      cloned[key] = clone(value);
    } else if (Array.isArray(value)) {
      cloned[key] = value.map(clone);
    } else {
      cloned[key] = value;
    }
  }
  return cloned;
}

function isEqual(a, b) {
  if (!isPlainObject(a) || !isPlainObject(b)) {
    return a === b;
  }
  for (let key of Object.keys(a)) {
    if (!isEqual(a[key], b[key])) {
      return false;
    }
  }
  for (let key of Object.keys(b)) {
    if (!a[key]) return false;
  }
  return true;
}

module.exports = {get, set, unset, clone, isPlainObject, isEqual};
