import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockCheckWebsite = vi.fn()

vi.mock('@/lib/api/check', () => ({
  checkWebsite: (...args: unknown[]) => mockCheckWebsite(...args),
}))

// Import component AFTER mock is set up
import { DiagnosisTool } from '../DiagnosisTool'

describe('DiagnosisTool', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders input and button', () => {
    render(<DiagnosisTool />)

    expect(screen.getByPlaceholderText(/youtube.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument()
  })

  it('disables button when input is empty', () => {
    render(<DiagnosisTool />)

    const button = screen.getByRole('button', { name: /check/i })
    expect(button).toBeDisabled()
  })

  it('shows loading state during check', async () => {
    const user = userEvent.setup()

    // Mock checkWebsite to delay response
    let resolvePromise: (value: unknown) => void
    mockCheckWebsite.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve
        })
    )

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'google.com')

    // Use keyboard Enter to submit instead of click
    await user.keyboard('{Enter}')

    // Check component is in loading state - the skeleton has animate-pulse
    await waitFor(() => {
      const skeleton = document.querySelector('.animate-pulse')
      expect(skeleton).toBeInTheDocument()
    })

    // Resolve to clean up
    resolvePromise!({ status: 'accessible', code: 200, latency: 100, target: 'https://google.com' })

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/Checking/i)).not.toBeInTheDocument()
    })
  })

  it('shows accessible result for successful check', async () => {
    const user = userEvent.setup()

    mockCheckWebsite.mockResolvedValue({
      status: 'accessible',
      code: 200,
      latency: 150,
      target: 'https://google.com',
    })

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'google.com')

    // Use keyboard Enter to submit instead of click
    await user.keyboard('{Enter}')

    // Wait for the result to appear
    await waitFor(
      () => {
        expect(screen.getByText(/Website Accessible/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('shows blocked result with VPN recommendation', async () => {
    const user = userEvent.setup()

    mockCheckWebsite.mockResolvedValue({
      status: 'blocked',
      latency: 5000,
      target: 'https://blocked.com',
      error: 'Connection Timeout',
    })

    // Mock fetch for proxy API
    vi.spyOn(global, 'fetch').mockImplementation((input) => {
      const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
      if (url.includes('/api/proxies')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              checkedAt: '2026-01-19T00:00:00.000Z',
              ttl: 120,
              routes: [
                {
                  id: 'croxyproxy',
                  name: 'CroxyProxy',
                  url: 'https://croxyproxy.com',
                  region: 'Global',
                  status: 'online',
                  latency: 180,
                  checked: true,
                },
              ],
            }),
            { status: 200, statusText: 'OK' }
          )
        )
      }
      return Promise.resolve(new Response('{}', { status: 200 }))
    })

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'blocked.com')

    // Use keyboard Enter to submit instead of click
    await user.keyboard('{Enter}')

    // Wait for the result to appear
    await waitFor(
      () => {
        expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(screen.getByText(/NordVPN/i)).toBeInTheDocument()
  })

  it('submits on Enter key', async () => {
    const user = userEvent.setup()

    mockCheckWebsite.mockResolvedValue({
      status: 'accessible',
      code: 200,
      latency: 100,
      target: 'https://test.com',
    })

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'test.com{enter}')

    await waitFor(() => {
      expect(mockCheckWebsite).toHaveBeenCalled()
    })
  })

  it('submits on button click', async () => {
    const user = userEvent.setup()

    mockCheckWebsite.mockResolvedValue({
      status: 'accessible',
      code: 200,
      latency: 100,
      target: 'https://test.com',
    })

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'test.com')

    const button = screen.getByRole('button', { name: /check/i })
    await user.click(button)

    await waitFor(() => {
      expect(mockCheckWebsite).toHaveBeenCalled()
    })
  })
})
