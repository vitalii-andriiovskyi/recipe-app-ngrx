const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: { server: './apps/api/src/server.ts' },
  resolve: { 
    extensions: ['.js', '.ts'],
    plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })]
  },
  target: 'node',
  mode: 'none',
  node: {
    __filename: false,
    __dirname: false
  },
  // this makes sure we include node_modules and other 3rd party libraries
  // externals: [/node_modules/],
  externals: [nodeExternals()],
  output: {
    path: path.join(__dirname, 'dist/apps'),
    filename: '[name].js'
  },
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }]
  },
  plugins: [
    // new webpack.DllPlugin({
    //   path: path.join(__dirname, 'dist', '[name].json'),
    //   name: '[name]',
    // }),
    // Temporary Fix for issue: https://github.com/angular/angular/issues/11580
    // for 'WARNING Critical dependency: the request of a dependency is an expression'
    // new webpack.ContextReplacementPlugin(
    //   /(.+)?angular(\\|\/)core(.+)?/,
    //   path.join(__dirname, 'src'), // location of your src
    //   {} // a map of your routes
    // ),
    new webpack.ContextReplacementPlugin(
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'apps/api/src'),
      {}
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?require_optional(.+)?/,
      path.join(__dirname, 'apps/api/src'),
      {},
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?mongoose(\\|\/)(.+)?/,
      path.join(__dirname, 'apps/api/src'),
      {},
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?nconf(\\|\/)node_modules(\\|\/)yargs(.+)?/,
      path.join(__dirname, 'apps/api/src'),
      {}      
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?mongodb-core(\\|\/)(.+)?/,
      path.join(__dirname, 'apps/api/src'),
      {}
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?mongodb(\\|\/)(.+)?/,
      path.join(__dirname, 'apps/api/src'),
      {}
    )
    
    // node_modules/nconf/node_modules/yargs/lib/parser.js
    
  ]
};

