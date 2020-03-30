const path = require('path');

module.exports = {
  mode: "production",
  entry: './src/PGHelper.js',
  target: "web",
  resolve: {
    extensions: [ '.js' ]
  },
  output: {
    filename: 'PGHelper.min.js',
    libraryTarget: "umd",
    path: path.resolve(__dirname, 'dist')
  }
};
