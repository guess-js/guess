module.exports = {
  mode: 'development',
  entry: './index.ts',
  target: 'node',
  output: {
    filename: './ga/index.js',
    libraryTarget: 'umd'
  },
  externals: [/^(@|\w).*$/i],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};
