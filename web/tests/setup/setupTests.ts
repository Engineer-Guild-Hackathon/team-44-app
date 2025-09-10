import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// Setup test timeout
jest.setTimeout(10000);