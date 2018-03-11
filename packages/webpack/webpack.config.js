module.exports = {
  devtool: 'inline-source-map',
  entry: './index.ts',
  target: 'node',
  output: {
    filename: './dist/index.js',
    libraryTarget: 'umd'
  },
  externals: [/^(@|\w).*$/i],
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
