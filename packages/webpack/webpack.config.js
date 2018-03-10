const nodeExternals = require('webpack-node-externals');

module.exports = {
  devtool: 'inline-source-map',
  entry: './index.ts',
  target: 'node',
  output: {
    filename: './dist/webpack/index.js',
    libraryTarget: 'umd'
  },
  externals: [
    nodeExternals({
      modulesDir: '../node_modules'
    })
  ],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.tpl$/,
        use: 'raw-loader'
      }
    ]
  }
};
