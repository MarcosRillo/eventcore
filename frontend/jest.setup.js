import '@testing-library/jest-dom';
import { mockAnimationsApi } from 'jsdom-testing-mocks';

// Mock Web Animations API for HeadlessUI transitions
mockAnimationsApi();

// Suppress HeadlessUI TransitionRootFn act() warnings
// These are caused by internal HeadlessUI state updates during transitions
// and are a known issue with HeadlessUI + React 19
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('TransitionRootFn') && message.includes('not wrapped in act')) {
    return;
  }
  originalError.apply(console, args);
};

// Global cleanup after each test to prevent resource leaks
// This is a gentle approach that clears mocks without affecting test behavior
afterEach(() => {
  // Clear all mocks to prevent memory leaks
  jest.clearAllMocks();
});
