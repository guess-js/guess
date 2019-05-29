module.exports = {
  mode: 'production',
  entry: './index.ts',
  target: 'node',
  output: {
    filename: './guess-ga/index.js',
    libraryTarget: 'umd'
  },
  externals: [/^(@|\w{3}(?<!\w:\\)).*$/i],
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
