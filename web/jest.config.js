const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup/setupTests.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/tests/**/*.{test,spec}.{ts,tsx}'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/'
  ],
  transformIgnorePatterns: ['/node_modules/(?!react-markdown)/'],
  moduleNameMapper: {
    '^react-markdown$': '<rootDir>/tests/mocks/react-markdown.js',
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
}

module.exports = createJestConfig(customJestConfig);
