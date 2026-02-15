// Global test setup
import { execSync } from 'child_process';

beforeAll(() => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
});

afterAll(() => {
  // Cleanup after all tests
});
