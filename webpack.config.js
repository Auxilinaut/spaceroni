var path = require('path');
var pathToPhaser = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(pathToPhaser, 'dist/phaser.js');
//var pathToInfiniship = path.join(__dirname, '/node_modules/phaser/');

module.exports = {
  entry: './src/game.ts',
  externals: {
    infiniship: 'infiniship',
    aud: 'aud'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader', exclude: '/node_modules/' },
      { test: /phaser\.js$/, loader: 'expose-loader?Phaser' }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, './'),
    publicPath: '/build/',
    host: '127.0.0.1',
    port: 3030,
    open: true
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      phaser: phaser
    }
  }
};
