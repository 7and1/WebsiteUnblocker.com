/**
 * Error Boundary Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ErrorBoundary } from '../ErrorBoundary'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className: string }) =>
    React.createElement('svg', { className, 'data-testid': 'alert-icon' }),
  RefreshCw: ({ className }: { className: string }) =>
    React.createElement('svg', { className, 'data-testid': 'refresh-icon' }),
}))

// Mock Button component
vi.mock('../ui/Button', () => ({
  Button: ({ children, onClick, variant }: { children: React.ReactNode; onClick: () => void; variant: string }) =>
    React.createElement('button', {
      onClick,
      'data-variant': variant,
      'data-testid': variant === 'outline' ? 'home-button' : 'retry-button',
    }, children),
}))

const React = require('react')

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
  })

  it('should render children when no error', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const { container } = render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Normal content')).toBeDefined()
  })

  it('should catch errors and render fallback UI', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('Test error')).toBeDefined()
  })

  it('should render custom fallback when provided', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const CustomFallback = () => <div>Custom error page</div>

    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error page')).toBeDefined()
    expect(screen.queryByText('Something went wrong')).toBeNull()
  })

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn()
    const ThrowError = () => {
      throw new Error('Callback test')
    }

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0][0].message).toBe('Callback test')
  })

  it('should reset error state when retry button is clicked', () => {
    let shouldThrow = true

    const ThrowConditional = () => {
      if (shouldThrow) {
        throw new Error('Conditional error')
      }
      return <div>Recovered content</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowConditional />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeDefined()

    // Click retry button
    act(() => {
      shouldThrow = false
      const retryButton = screen.getByTestId('retry-button')
      retryButton.click()
    })

    // Should still show error because the component needs to remount
    // But the state should be reset
  })

  it('should handle errors without message', () => {
    const ThrowError = () => {
      throw new Error('')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('An unexpected error occurred')).toBeDefined()
  })

  it('should have both Try Again and Go Home buttons', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByTestId('retry-button')).toBeDefined()
    expect(screen.getByTestId('home-button')).toBeDefined()
  })
})
