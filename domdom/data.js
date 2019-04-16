const Listeners = require('./listeners');
const {get, set, unset, isPlainObject, isEqual} = require('./common');

/***
 *    *   Value changed
 *    !   Immediate callback if value exists
 *    +   Value added
 *    -   Value removed
 *    =   Trigger only (no value set)
 *
 *    $   Named wildcard
 *
 *    {x,y,z} Ranged listener,
 *            triggers on any of the values when any of the values are set
 *
 */
module.exports = class {

  constructor(...modules) {
    this._data = {};
    this._changeListeners = new Listeners('change');
    this._addListeners = new Listeners('add');
    this._immediateListeners = new Listeners('immediate');
    this._removeListeners = new Listeners('remove');
    this._triggerListeners = new Listeners('trigger');
    this._aliases = {};

    this.modules = modules.map(module => module({
      get: this.get.bind(this),
      set: this.set.bind(this),
      on: this.on.bind(this),
      unset: this.unset.bind(this),
      trigger: this.trigger.bind(this),
      alias: this.alias.bind(this),
      unalias: this.unalias.bind(this),
      update: this.update.bind(this)
    }));
    this.reset();
  }

  set(path, value, ignoreEqualCheck) {
    const data = get(this._data, path);

    const equal = isEqual(data, value);
    if (!ignoreEqualCheck && equal) {
      return false;
    }

    set(this._data, path, value);

    if (!equal && isPlainObject(value)) {
      for (let [key, val] of Object.entries(value)) {
        const subPath = path + '.' + key;
        if (!data || typeof data[key] === 'undefined') {
          this._addListeners.trigger(subPath, val);
        } else {
          this._changeListeners.trigger(subPath, val);
        }
      }
    }

    if (typeof data === 'undefined') {
      this._addListeners.trigger(path, value);
    } else {
      this._changeListeners.trigger(path, value);
    }

    return true;
  }

  update(path, value, ignoreEqualCheck) {
    if (!isPlainObject(value)) {
      return this.set(path, value, ignoreEqualCheck);
    }

    for (let key of Object.keys(value)) {
      this.update(path + '.' + key, value[key], ignoreEqualCheck);
    }
    return true;
  }

  unset(path) {

    const unsetRecursive = (parent, key, path) => {
      const data = get(parent, key);
      if (isPlainObject(data)) {
        for (let key of Object.keys(data)) {
          unsetRecursive(data, key, path + '.' + key);
        }
      }
      this._removeListeners.trigger(path, data);
    };

    unsetRecursive(this._data, path, path);
    unset(this._data, path);
  }

  on(pathAndFlags, listener) {
    const [flags, path] = pathAndFlags.split(' ').filter(p => p);
    if (!flags || !path) {
      throw new Error('Missing flags or path');
    }

    const paths = path.split('.');
    const lastPath = paths.pop();
    if (lastPath.indexOf('{') === 0) {
      const parts = lastPath.replace(/[{}]/g, '').split(',');

      return parts.reduce((res, part) => {
        const fullPath = paths.concat(part).join('.');
        return res + ' ' + this.on(`${flags} ${fullPath}`, (a, b) => {
          const triggeredPath = b.path.split('.').slice(0, -1);

          const ret = parts.reduce((res, part) => {
            res[part] = this.get(triggeredPath.concat(part).join('.'));
            return res;
          }, {});

          listener(ret, b);
        });
      }, '');
    }

    const refs = flags.split('').reduce((refs, flag) =>
      refs + ' ' + this.getListenerByFlag(flag).add(path, listener)
      , '');

    function recursiveImmediateTrigger(parent, pathIndex, b) {
      const path = paths[pathIndex];
      if (!path) {
        b.path = b.path.join('.');
        listener(parent, b);
        return;
      }

      if (path.charAt(0) === '$') {
        for (let key of Object.keys(parent)) {
          b[path] = key;
          b.path.push(key);
          recursiveImmediateTrigger(get(parent, key), pathIndex + 1, b);
        }
      } else {
        const value = get(parent, path);
        b.path.push(path);
        if (value) {
          recursiveImmediateTrigger(value, pathIndex + 1, b);
        }
      }
    }

    if (flags.match(/!/)) {
      // paths was changed (lastPath removed) in the ranged listener setup
      paths.push(lastPath);
      recursiveImmediateTrigger(this._data, 0, {path: []});
    }

    return refs;
  }

  getListenerByFlag(flag) {
    switch (flag) {
      case '*':
        return this._changeListeners;
      case '!':
        return this._immediateListeners;
      case '+':
        return this._addListeners;
      case '-':
        return this._removeListeners;
      case '=':
        return this._triggerListeners;
    }
  }

  off(refs) {
    for (let ref of refs.split(' ').map(ref => ref.trim()).filter(ref => ref)) {
      this._changeListeners.remove(ref);
      this._immediateListeners.remove(ref);
      this._addListeners.remove(ref);
      this._removeListeners.remove(ref);
      this._triggerListeners.remove(ref);
    }
  }

  trigger(path, value) {
    return this._triggerListeners.trigger(path, value);
  }

  reset() {
    this.modules
      .filter(module => typeof module === 'function')
      .forEach(module => Object.assign(this._data, module()));
  }

  get(path) {
    return get(this._data, path);
  }

  alias(to, from) {
    if ((this._aliases[to] || {}).from === from) {
      return;
    }
    this.unalias(to);

    this._aliases[to] = {
      from,
      refs: [
        this.on('!+* ' + from + '.>', (value, {path, pathDiff}) =>
          this.set(to + '.' + pathDiff, value, true)
        ),
        this.on('!+* ' + from, (value) =>
          this.set(to, value, true)
        ),
        this.on('- ' + from, value =>
          this.unset(to, value, true)
        ),
        this.on('= ' + from, (value) =>
          this.trigger(to, value, true)
        )
      ]
    };
  }

  unalias(to) {
    const refs = (this._aliases[to] || {}).refs || [];
    if (refs.length === 0) return;

    this.unset(to);
    for (let ref of refs) {
      this.off(ref);
    }
    delete this._aliases[to];
  }
};