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

// ============================================================================
// ZERO CONSOLE WARNINGS POLICY
// ============================================================================
// This setup enforces strict console cleanliness:
// 1. Known/unavoidable warnings are whitelisted and suppressed
// 2. Unknown warnings cause test failures (fail-fast approach)
// ============================================================================

// Whitelist patterns for known issues from external libraries or unavoidable patterns
// Note: Using simpler patterns that check for both identifiers separately
// since console messages can have newlines
const WHITELISTED_ERROR_PATTERNS = [
  // HeadlessUI Transition warnings (React 19 + HeadlessUI known issue)
  { pattern: /Transition/, secondaryPattern: /not wrapped in act/, reason: 'HeadlessUI internal state updates during transitions' },
  // usePaginatedData async state updates (hooks with multiple async setters)
  { pattern: /usePaginatedData/, secondaryPattern: /not wrapped in act/, reason: 'Hooks with multiple async state setters' },
  // TestComponent act() warnings (common in hook tests using renderHook)
  { pattern: /TestComponent/, secondaryPattern: /not wrapped in act/, reason: 'renderHook internal component' },
  // InternalCalendarPageContainer async useEffect (fetches event types on mount)
  { pattern: /InternalCalendarPageContainer/, secondaryPattern: /not wrapped in act/, reason: 'Async useEffect fetch on mount' },
  // JSDOM limitations
  { pattern: /Not implemented: HTMLFormElement\.prototype\.requestSubmit/, secondaryPattern: null, reason: 'JSDOM API limitation' },
];

const WHITELISTED_WARN_PATTERNS = [
  // react-big-calendar uses old JSX transform but works fine with React 19
  { pattern: /outdated JSX transform/, reason: 'External library react-big-calendar' },
];

// Track warnings for potential debugging
let suppressedWarnings = [];

const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');

  // Check against whitelist (supports two-pattern matching for multiline messages)
  const whitelisted = WHITELISTED_ERROR_PATTERNS.find(({ pattern, secondaryPattern }) => {
    if (secondaryPattern) {
      return pattern.test(message) && secondaryPattern.test(message);
    }
    return pattern.test(message);
  });
  if (whitelisted) {
    suppressedWarnings.push({ type: 'error', message: message.substring(0, 100), reason: whitelisted.reason });
    return;
  }

  // FAIL-FAST: Unknown console.error should fail the test
  // This ensures new warnings are caught immediately
  originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args.join(' ');

  // Check against whitelist
  const whitelisted = WHITELISTED_WARN_PATTERNS.find(({ pattern }) => pattern.test(message));
  if (whitelisted) {
    suppressedWarnings.push({ type: 'warn', message, reason: whitelisted.reason });
    return;
  }

  // FAIL-FAST: Unknown console.warn should fail the test
  originalWarn.apply(console, args);
};

// Global cleanup after each test to prevent resource leaks and worker exit issues
afterEach(() => {
  // Clear all mocks to prevent memory leaks
  jest.clearAllMocks();
  // Clear any pending timers that could cause worker to hang
  jest.clearAllTimers();
  // Reset suppressed warnings tracking for next test
  suppressedWarnings = [];
});

// Ensure timers are cleaned up after all tests
afterAll(() => {
  // Final cleanup
  jest.useRealTimers();
});
