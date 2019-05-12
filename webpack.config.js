const path = require('path');

module.exports = {
  target: 'web',
  mode: 'production',
  output: {
    path: path.join(__dirname, 'dist'),
    library: 'domdom',
    filename: 'domdom.js',
    libraryTarget: 'umd',
    libraryExport: 'default'
  }
};