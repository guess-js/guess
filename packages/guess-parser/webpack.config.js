module.exports = {
  mode: 'production',
  entry: './index.ts',
  target: 'node',
  output: {
    filename: './guess-parser/index.js',
    libraryTarget: 'umd'
  },
  externals: [/^(@|\w{3}(?<!\w:\\)).*$/i],
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
