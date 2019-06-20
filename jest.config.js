module.exports = {
  testEnvironment: 'node',
  verbose: true,
  roots: ['src'],
  testMatch: [
    '**/tests/**/*.js',
    '**/?(*.)+(test).js',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
