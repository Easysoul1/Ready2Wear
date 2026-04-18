'use client'

import { useEffect, useMemo, useState } from 'react'

import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function TailorDashboardPage() {
  const { user, role, loading } = useSession()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || role !== 'tailor') return
    api
      .get('/api/orders/orders/')
      .then((res) => setOrders(res?.results || res || []))
      .catch((err) => setError(err?.data?.detail || 'Unable to load orders.'))
  }, [role, user])

  const nearDeadline = useMemo(() => {
    return orders.filter((order) => {
      if (!order.deadline) return false
      const deadline = new Date(order.deadline)
      const now = new Date()
      const diffDays = (deadline - now) / (1000 * 60 * 60 * 24)
      return diffDays <= 3 && diffDays >= 0 && order.status !== 'completed'
    })
  }, [orders])

  if (loading) return null
  if (role && role !== 'tailor') return <p className="ff-alert p-6 text-sm">Access denied.</p>

  return (
    <AppShell role={role} user={user} title="Tailor Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Active Orders" value={orders.filter((o) => o.status === 'active').length} />
        <Card label="Ready for Delivery" value={orders.filter((o) => o.current_stage === 'ready').length} />
        <Card label="Due in 3 days" value={nearDeadline.length} />
      </div>

      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}

      <section className="space-y-3">
        {(orders || []).map((order) => (
          <article key={order.id} className="ff-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold ff-text-primary">{order.order_number}</p>
                <p className="text-sm ff-text-secondary">{order.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <StageBadge value={order.current_stage} />
                <StageBadge value={order.status} />
              </div>
            </div>
            <p className="mt-2 text-xs ff-text-secondary">
              Client: {order.client_detail?.email || '-'} · Deadline: {order.deadline || '-'}
            </p>
          </article>
        ))}
        {!orders.length ? (
          <p className="ff-card border-dashed p-6 text-center text-sm ff-text-secondary">
            No orders assigned yet.
          </p>
        ) : null}
      </section>
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
