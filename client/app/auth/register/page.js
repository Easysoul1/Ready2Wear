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
    username: '',
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
        username: form.email,
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {step === 1 ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Create an account</h2>
          <p className="text-sm text-gray-500 mb-7">Choose how you&apos;ll use FashionFlow</p>

          <div className="space-y-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => selectRole(r.value)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-[#1a1a2e] transition text-left group"
              >
                <span className="text-2xl">{r.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1a1a2e]">
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-400">{r.desc}</p>
                </div>
                <svg
                  className="ml-auto w-4 h-4 text-gray-300 group-hover:text-[#1a1a2e] transition"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Your details</h2>
          <p className="text-sm text-gray-500 mb-7">
            Joining as a{' '}
            <span className="font-medium capitalize text-gray-800">{form.role}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Ada Okonkwo"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input
                type="password"
                name="password2"
                required
                value={form.password2}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ background: 'var(--brand)' }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
