import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock logger globally
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  generateRequestId: vi.fn(() => 'test-request-id'),
  createLoggerFromRequest: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  })),
  extractRequestContext: vi.fn(() => ({
    requestId: 'test-request-id',
    method: 'GET',
    path: '/test',
  })),
}))
