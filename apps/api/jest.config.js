module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/api',
  testEnvironment: 'node',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
  displayName: 'api',
};
