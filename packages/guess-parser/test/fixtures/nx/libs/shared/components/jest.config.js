module.exports = {
  name: 'shared-components',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/shared/components',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
