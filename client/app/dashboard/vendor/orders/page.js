'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function VendorFabricOrdersPage() {
  const { user, role, loading } = useSession()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  const loadOrders = async () => {
    try {
      const response = await api.get('/api/products/marketplace-orders/')
      setOrders(response?.results || response || [])
    } catch (err) {
      setError(err?.data?.detail || 'Unable to load fabric orders.')
    }
  }

  useEffect(() => {
    if (!user || role !== 'vendor') return
    const timeoutId = window.setTimeout(() => loadOrders(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [user, role])

  if (loading) return null
  if (role && role !== 'vendor') return <p className="ff-alert p-6 text-sm">Access denied.</p>

  return (
    <AppShell role={role} user={user} title="Fabric Orders">
      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}

      <div className="ff-card p-4 mb-4 bg-[color:var(--ff-bg-card)]/50 border border-[color:var(--ff-border-soft)]">
        <h2 className="text-sm font-semibold ff-text-primary">Marketplace Order Management</h2>
        <p className="text-xs mt-1 text-gray-400">
          This page shows all direct fabric purchases made by tailors or clients from your inventory.
        </p>
      </div>

      <section className="ff-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="ff-table-head">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Buyer ID</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="ff-table-row">
                  <td className="px-4 py-3">
                    <p className="font-semibold ff-text-primary">{order.order_number}</p>
                  </td>
                  <td className="px-4 py-3 ff-text-secondary">Buyer #{order.buyer}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {order.items?.map((item) => (
                        <p key={item.id} className="text-xs text-gray-400">
                          {item.quantity} {item.unit} x <span className="ff-text-secondary">{item.fabric_name}</span>
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 ff-text-secondary">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium ff-text-primary">
                    ₦{order.subtotal}
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge value={order.status} />
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    You don't have any fabric orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  )
}
