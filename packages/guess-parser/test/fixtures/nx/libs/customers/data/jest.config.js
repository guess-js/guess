module.exports = {
  name: 'customers-data',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/customers/data',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
