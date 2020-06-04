const extensions = require('./extensions.js');
// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
     config.plugins.push(extensions({
       extensions: [ '.jsx', '.tsx', '.js', '.ts' ]
     }))
    return config; // always return a config.
  },
};
