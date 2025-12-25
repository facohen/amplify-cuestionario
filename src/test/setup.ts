import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Amplify
vi.mock('aws-amplify/data', () => ({
  generateClient: vi.fn(() => ({
    models: {
      Token: {
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        list: vi.fn(),
      },
      CuestionarioDefinition: {
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        list: vi.fn(),
        delete: vi.fn(),
      },
      CuestionarioResponse: {
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        list: vi.fn(),
      },
    },
  })),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
