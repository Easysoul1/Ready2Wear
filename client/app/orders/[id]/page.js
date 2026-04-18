'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import Timeline from '@/components/Timeline'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function OrderDetailPage({ params }) {
  const { user, role, loading } = useSession()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    api
      .get(`/api/orders/orders/${params.id}/`)
      .then((res) => setOrder(res))
      .catch((err) => setError(err?.data?.detail || 'Unable to load order details.'))
  }, [params.id, user])

  if (loading) return null

  return (
    <AppShell role={role} user={user} title="Order Tracking">
      <Link href="/orders" className="ff-link inline-block text-sm">
        ← Back to orders
      </Link>

      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}

      {order ? (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <section className="ff-card space-y-3 p-4">
            <h2 className="text-lg font-semibold ff-text-primary">{order.order_number}</h2>
            <p className="text-sm ff-text-secondary">{order.title}</p>
            <div className="flex items-center gap-2">
              <StageBadge value={order.current_stage} />
              <StageBadge value={order.status} />
            </div>
            <p className="text-sm ff-text-secondary">Deadline: {order.deadline || '-'}</p>
            <p className="text-sm ff-text-secondary">Expected delivery: {order.expected_delivery || '-'}</p>
            <p className="text-sm ff-text-secondary">Tailor: {order.tailor_detail?.email || '-'}</p>
            <p className="text-sm ff-text-secondary">Client: {order.client_detail?.email || '-'}</p>
            <p className="text-sm ff-text-secondary">Notes: {order.style_notes || '-'}</p>
          </section>

          <section className="ff-card p-4">
            <h3 className="text-lg font-semibold ff-text-primary">Timeline</h3>
            <div className="mt-4">
              <Timeline logs={order.progress_logs || []} />
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  )
}
