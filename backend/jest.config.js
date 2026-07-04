'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',           // entry point — not unit-testable
    '!src/config/prisma.js',    // DB client — integration only
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
