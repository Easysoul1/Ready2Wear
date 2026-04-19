'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', password2: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenError(true)
    }
  }, [token])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.password2) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false)
      return
    }

    try {
      console.log('[PASSWORD_RESET] Token being sent:', token)
      console.log('[PASSWORD_RESET] Token length:', token?.length)
      console.log('[PASSWORD_RESET] Token raw:', token)
      
      const response = await api.post('/api/auth/reset-password/', {
        token: token,
        password: form.password,
        password2: form.password2,
      })

      if (response.success) {
        setSuccess(true)
        console.log('[PASSWORD_RESET] Password successfully reset')
      }
    } catch (err) {
      const errorMessage = err?.data?.errors?.token || err?.data?.errors?.password || err?.data?.message || 'Failed to reset password. The link may be invalid or expired.'
      setError(errorMessage)
      console.log('[PASSWORD_RESET] Failed:', JSON.stringify(err, null, 2))
      console.log('[PASSWORD_RESET] Error data:', err?.data)
    } finally {
      setLoading(false)
    }
  }

  if (tokenError) {
    return (
      <div className="ff-card ff-card-elevated p-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-semibold ff-text-primary">Invalid or expired link</h2>
          <p className="mb-6 text-sm ff-text-secondary">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/auth/forgot-password" className="ff-btn-primary inline-block px-6 py-2.5 text-sm font-semibold">
            Request new link
          </Link>
        </div>
      </div>
    )
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
          <h2 className="mb-2 text-2xl font-semibold ff-text-primary">Password reset successful</h2>
          <p className="mb-6 text-sm ff-text-secondary">
            Your password has been reset. You can now sign in with your new password.
          </p>
          <Link href="/auth/login" className="ff-btn-primary inline-block px-6 py-2.5 text-sm font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ff-card ff-card-elevated p-8">
      <h2 className="mb-1 text-2xl font-semibold ff-text-primary">Reset password</h2>
      <p className="mb-7 text-sm ff-text-secondary">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium ff-text-primary">New password</label>
          <input
            type="password"
            name="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="ff-input px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium ff-text-primary">Confirm new password</label>
          <input
            type="password"
            name="password2"
            required
            autoComplete="new-password"
            value={form.password2}
            onChange={handleChange}
            placeholder="••••••••"
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
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  )
}