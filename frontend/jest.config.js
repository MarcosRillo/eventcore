const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/app/**', // Exclude Next.js app directory
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  // Worker and timeout configuration to prevent hanging
  maxWorkers: process.env.CI ? 2 : '50%', // Use fewer workers in CI, 50% of cores locally
  testTimeout: 10000, // 10 second timeout per test
  workerIdleMemoryLimit: '512MB', // Restart workers if they exceed this memory
  // Force exit after tests to avoid worker hang from external libs (react-big-calendar, HeadlessUI)
  // Note: This is expected and safe since all tests pass
  forceExit: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
