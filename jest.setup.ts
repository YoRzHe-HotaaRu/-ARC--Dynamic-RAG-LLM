import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder and TextDecoder for jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Mock crypto.randomUUID for tests
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
    },
});

// Mock scrollIntoView for jsdom
Element.prototype.scrollIntoView = jest.fn();

// Mock ResizeObserver for tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock fetch for API tests
global.fetch = jest.fn();

// Reset mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
});
