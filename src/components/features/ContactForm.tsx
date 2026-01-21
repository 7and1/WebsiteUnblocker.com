'use client'

import { useState } from 'react'
import { Button, Input } from '@/components/ui'

type FormState = {
  name: string
  email: string
  subject: string
  message: string
  honeypot: string
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '',
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setStatus(null)

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      setStatus({
        type: 'error',
        message: error?.error?.message || 'Something went wrong. Please try again.',
      })
    } else {
      setStatus({ type: 'success', message: 'Your message has been sent successfully.' })
      setForm({ name: '', email: '', subject: '', message: '', honeypot: '' })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(event) => update('name', event.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
          required
        />
      </div>
      <Input
        type="text"
        placeholder="Subject"
        value={form.subject}
        onChange={(event) => update('subject', event.target.value)}
        required
      />
      <div>
        <textarea
          value={form.message}
          onChange={(event) => update('message', event.target.value)}
          placeholder="Message"
          required
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-transparent focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <input
        type="text"
        value={form.honeypot}
        onChange={(event) => update('honeypot', event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {status && (
        <div
          className={
            status.type === 'success'
              ? 'rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700'
              : 'rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700'
          }
        >
          {status.message}
        </div>
      )}

      <Button type="submit" loading={loading} size="lg">
        Send Message
      </Button>
    </form>
  )
}
