/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Mirror the tsconfig path aliases so `@/...` imports resolve in tests.
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
