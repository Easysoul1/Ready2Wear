'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, setTokens } from '@/lib/api'

const ROLES = [
  {
    value: 'vendor',
    label: 'Fabric Vendor',
    icon: '🧵',
    desc: 'Sell fabrics & materials to tailors',
  },
  {
    value: 'tailor',
    label: 'Tailor',
    icon: '✂️',
    desc: 'Accept orders & deliver garments',
  },
  {
    value: 'client',
    label: 'Client',
    icon: '👗',
    desc: 'Commission tailors & track orders',
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)          // step 1 = role pick, step 2 = details
  const [form, setForm] = useState({
    role: '',
    full_name: '',
    email: '',
    password: '',
    password2: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const selectRole = (role) => {
    setForm({ ...form, role })
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post('/api/auth/register/', {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        password2: form.password2,
        role: form.role,
      })
      // Auto-login after register
      const tokens = await api.post('/api/auth/login/', {
        email: form.email,
        password: form.password,
      })
      setTokens({ access: tokens.access, refresh: tokens.refresh })
      router.push('/dashboard')
    } catch (err) {
      const d = err?.data || {}
      const msg =
        Object.values(d).flat().join(' ') ||
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ff-card ff-card-elevated p-8">
      {step === 1 ? (
        <>
          <h2 className="mb-1 text-2xl font-semibold ff-text-primary">Create an account</h2>
          <p className="mb-7 text-sm ff-text-secondary">Choose how you&apos;ll use FashionFlow</p>

          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => selectRole(r.value)}
                className="ff-card w-full p-4 text-left transition duration-200 hover:border-[color:var(--ff-primary)]"
              >
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <p className="text-sm font-semibold ff-text-primary">
                    {r.label}
                  </p>
                  <p className="text-xs ff-text-secondary">{r.desc}</p>
                </div>
                <svg
                  className="ml-auto h-4 w-4 ff-text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm ff-text-secondary">
            Already have an account?{' '}
            <Link href="/auth/login" className="ff-link font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <button
            onClick={() => setStep(1)}
            className="mb-6 flex items-center gap-1.5 text-sm ff-text-secondary transition hover:text-[color:var(--ff-primary)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="mb-1 text-2xl font-semibold ff-text-primary">Your details</h2>
          <p className="mb-7 text-sm ff-text-secondary">
            Joining as a{' '}
            <span className="font-medium capitalize ff-text-primary">{form.role}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium ff-text-primary">Full name</label>
              <input
                type="text"
                name="full_name"
                required
                autoComplete="name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Ada Okonkwo"
                className="ff-input px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium ff-text-primary">Email address</label>
              <input
                type="email"
                name="email"
                required
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
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="ff-input px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium ff-text-primary">Confirm password</label>
              <input
                type="password"
                name="password2"
                required
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm ff-text-secondary">
            Already have an account?{' '}
            <Link href="/auth/login" className="ff-link font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
