'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/api/auth/forgot-password/', { email: form.email })
      if (response.success) {
        setSuccess(true)
      }
    } catch (err) {
      setError(err?.data?.errors?.email || err?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="ff-card ff-card-elevated p-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-semibold ff-text-primary">Check your email</h2>
          <p className="mb-6 text-sm ff-text-secondary">
            If an account with that email exists, we have sent a password reset link.
          </p>
          <Link href="/auth/login" className="ff-link font-medium hover:underline">
            Back to Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ff-card ff-card-elevated p-8">
      <h2 className="mb-1 text-2xl font-semibold ff-text-primary">Forgot password?</h2>
      <p className="mb-7 text-sm ff-text-secondary">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium ff-text-primary">Email address</label>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="ff-input px-3.5 py-2.5 text-sm"
          />
        </div>

        {error && (
          <div className="ff-alert px-3.5 py-2.5 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="ff-btn-primary w-full py-2.5 text-sm font-semibold"
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm ff-text-secondary">
        Remember your password?{' '}
        <Link href="/auth/login" className="ff-link font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}