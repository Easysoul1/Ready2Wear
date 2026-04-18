'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api, setTokens } from '@/lib/api'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
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
      const data = await api.post('/api/auth/login/', form)
      setTokens({ access: data.access, refresh: data.refresh })
      router.push('/dashboard')
    } catch (err) {
      setError(err?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ff-card ff-card-elevated p-8">
      <h2 className="mb-1 text-2xl font-semibold ff-text-primary">Welcome back</h2>
      <p className="mb-7 text-sm ff-text-secondary">Sign in to your FashionFlow account</p>

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

        <div>
          <label className="mb-1.5 block text-sm font-medium ff-text-primary">Password</label>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={form.password}
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm ff-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="ff-link font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  )
}
