import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiagnosisTool } from '../DiagnosisTool'

const mockFetch = (payload: Record<string, unknown>, ok = true, status = 200) => {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(payload), { status, statusText: ok ? 'OK' : 'Error' })
  )
}

describe('DiagnosisTool', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
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
    mockFetch({ status: 'accessible', code: 200, latency: 100, target: 'https://google.com' })

    render(<DiagnosisTool />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'google.com')

    const button = screen.getByRole('button', { name: /check/i })
    fireEvent.click(button)

    expect(await screen.findByText(/checking/i)).toBeInTheDocument()
  })

  it('shows accessible result for successful check', async () => {
    mockFetch({ status: 'accessible', code: 200, latency: 150, target: 'https://google.com' })

    render(<DiagnosisTool />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'google.com')

    const button = screen.getByRole('button', { name: /check/i })
    fireEvent.click(button)

    expect(await screen.findByText(/website accessible/i, {}, { timeout: 2000 })).toBeInTheDocument()
  })

  it('shows blocked result with VPN recommendation', async () => {
    mockFetch({
      status: 'blocked',
      latency: 5000,
      target: 'https://blocked.com',
      error: 'Connection Timeout',
    })

    render(<DiagnosisTool />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'blocked.com')

    const button = screen.getByRole('button', { name: /check/i })
    fireEvent.click(button)

    expect(await screen.findByText(/access restricted/i, {}, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByText(/nordvpn/i)).toBeInTheDocument()
  })

  it('submits on Enter key', async () => {
    const fetchSpy = mockFetch({
      status: 'accessible',
      code: 200,
      latency: 100,
      target: 'https://test.com',
    })

    render(<DiagnosisTool />)

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/youtube.com/i)
    await user.type(input, 'test.com{enter}')

    expect(fetchSpy).toHaveBeenCalled()
  })
})
