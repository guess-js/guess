module.exports = {
  name: 'auth',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/auth',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
