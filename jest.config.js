module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: '(/test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  testPathIgnorePatterns: [
    '<rootDir>/packages/detector/test/fixtures',
    '<rootDir>/packages/parser/test/fixtures',
    '<rootDir>/infra/test.ts',
    '<rootDir>/experiments/guess-static-sites/test',
    '<rootDir>/packages/webpack/test/fixtures'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  preset: '<rootDir>/node_modules/jest-puppeteer',
  globals: {
    window: {}
  }
};
