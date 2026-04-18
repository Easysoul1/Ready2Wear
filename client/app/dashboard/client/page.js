'use client'

import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import Timeline from '@/components/Timeline'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function ClientDashboardPage() {
  const { user, role, loading } = useSession()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || role !== 'client') return
    const loadOrders = () =>
      api
        .get('/api/orders/orders/')
        .then((res) => {
          const orderList = res?.results || res || []
          setOrders(orderList)
          setSelectedOrder((prev) => orderList.find((item) => item.id === prev?.id) || orderList[0] || null)
        })
        .catch((err) => setError(err?.data?.detail || 'Unable to load your orders.'))

    loadOrders()
    const intervalId = window.setInterval(loadOrders, 30000)
    return () => window.clearInterval(intervalId)
  }, [role, user])

  if (loading) return null
  if (role && role !== 'client') return <p className="ff-alert p-6 text-sm">Access denied.</p>

  return (
    <AppShell role={role} user={user} title="Client Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Total Orders" value={orders.length} />
        <Card label="In Progress" value={orders.filter((o) => o.status === 'active').length} />
        <Card label="Ready" value={orders.filter((o) => o.current_stage === 'ready').length} />
      </div>

      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`ff-card w-full p-4 text-left transition duration-200 ${
                selectedOrder?.id === order.id ? 'border-[color:var(--ff-accent)] bg-[rgba(212,163,115,0.12)]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold ff-text-primary">{order.order_number}</p>
                <StageBadge value={order.current_stage} />
              </div>
              <p className="mt-1 text-sm ff-text-secondary">{order.title}</p>
              <p className="mt-2 text-xs ff-text-secondary">Expected delivery: {order.expected_delivery || '-'}</p>
            </button>
          ))}
          {!orders.length ? (
            <p className="ff-card border-dashed p-6 text-center text-sm ff-text-secondary">
              No orders found yet.
            </p>
          ) : null}
        </div>
        <section className="ff-card p-4">
          <h2 className="text-lg font-semibold ff-text-primary">Order timeline</h2>
          {selectedOrder ? (
            <div className="mt-4">
              <Timeline logs={selectedOrder.progress_logs || []} />
            </div>
          ) : (
            <p className="mt-4 text-sm ff-text-secondary">Select an order to view progress history.</p>
          )}
        </section>
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
