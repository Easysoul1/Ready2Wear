'use client'

import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function AdminDashboardPage() {
  const { user, role, loading } = useSession()
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || role !== 'admin') return
    Promise.all([
      api.get('/api/auth/users/'),
      api.get('/api/orders/orders/'),
      api.get('/api/products/products/'),
    ])
      .then(([users, orders, products]) => {
        setStats({
          users: users?.count || users?.results?.length || users?.length || 0,
          orders: orders?.count || orders?.results?.length || orders?.length || 0,
          products: products?.count || products?.results?.length || products?.length || 0,
        })
      })
      .catch((err) => setError(err?.data?.detail || 'Unable to load admin analytics.'))
  }, [role, user])

  if (loading) return null
  if (role && role !== 'admin') return <p className="ff-alert p-6 text-sm">Access denied.</p>

  return (
    <AppShell role={role} user={user} title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Users" value={stats.users} />
        <Card label="Tailoring Orders" value={stats.orders} />
        <Card label="Marketplace Products" value={stats.products} />
      </div>
      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}
      <div className="ff-card p-4 text-sm ff-text-secondary">
        Admin users have supervisory visibility across all modules but cannot own vendor products.
      </div>
    </AppShell>
  )
}

function Card({ label, value }) {
  return (
    <div className="ff-card p-4">
      <p className="text-xs uppercase tracking-wide ff-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-semibold ff-text-primary">{value}</p>
    </div>
  )
}
