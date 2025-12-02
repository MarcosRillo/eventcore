import '@testing-library/jest-dom';
import { mockAnimationsApi } from 'jsdom-testing-mocks';

// Mock Web Animations API for HeadlessUI transitions
mockAnimationsApi();

// Mock HTMLFormElement.prototype.requestSubmit for JSDOM
// JSDOM doesn't implement this HTML5 API, causing warnings in form tests
if (typeof HTMLFormElement.prototype.requestSubmit === 'undefined') {
  HTMLFormElement.prototype.requestSubmit = function (submitter) {
    const event = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    // Add submitter to event if provided
    Object.defineProperty(event, 'submitter', {
      value: submitter || null,
      writable: false,
    });
    this.dispatchEvent(event);
  };
}

// Suppress known act() warnings that are false positives
// These are caused by:
// 1. HeadlessUI internal state updates during transitions (React 19 issue)
// 2. usePaginatedData async state updates in hook tests
// 3. Async state updates in components during tests
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');

  // Suppress all HeadlessUI Transition warnings (React 19 + HeadlessUI known issue)
  // This includes TransitionRootFn, TransitionChildFn, and related components
  if (message.includes('Transition') && message.includes('not wrapped in act')) {
    return;
  }

  // Suppress all act() warnings from usePaginatedData and async state updates
  // These occur because hooks have multiple async state setters that fire after the test's act() boundary
  if (message.includes('not wrapped in act') && message.includes('usePaginatedData')) {
    return;
  }

  // Suppress generic act() warnings for TestComponent (common in hook tests)
  if (message.includes('not wrapped in act') && message.includes('TestComponent')) {
    return;
  }

  // Suppress requestSubmit JSDOM limitation warnings
  if (message.includes('Not implemented: HTMLFormElement.prototype.requestSubmit')) {
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
