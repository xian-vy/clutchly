import '@testing-library/jest-dom'

// Polyfills for Node.js environment using Web API compatible versions
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Polyfill for Web APIs that Next.js uses
Object.defineProperty(global, 'Request', {
  value: class Request {
    constructor(input: any, init?: any) {
      // Mock implementation
    }
  },
  writable: true,
})

Object.defineProperty(global, 'Response', {
  value: class Response {
    constructor(body?: any, init?: any) {
      // Mock implementation
    }
  },
  writable: true,
})

Object.defineProperty(global, 'Headers', {
  value: class Headers {
    constructor(init?: any) {
      // Mock implementation
    }
  },
  writable: true,
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))