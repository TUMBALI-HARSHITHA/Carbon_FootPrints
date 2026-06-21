import '@testing-library/jest-dom';

// Mock matchMedia for testing window viewport sizes
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock crypto.randomUUID for ID generation in tests
if (!window.crypto.randomUUID) {
  Object.defineProperty(window.crypto, 'randomUUID', {
    value: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
    writable: true,
    configurable: true
  });
}
