module.exports = {
  name: 'feat-customers',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/customers/ui',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
