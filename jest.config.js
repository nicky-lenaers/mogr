module.exports = {
  preset: 'ts-jest',
  testMatch: [
    "<rootDir>/src/**/*.spec.ts"
  ],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  },
  collectCoverageFrom: [
    "<rootDir>/src/**/*.ts"
  ]
};
