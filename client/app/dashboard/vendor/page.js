'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function VendorDashboardPage() {
  const { user, role, loading } = useSession()
  const [fabrics, setFabrics] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || role !== 'vendor') return
    Promise.all([
      api.get('/api/vendors/fabrics/').catch(() => []),
      api.get('/api/products/marketplace-orders/').catch(() => [])
    ])
    .then(([fabRes, ordRes]) => {
      setFabrics(fabRes?.results || fabRes || [])
      setOrders(ordRes?.results || ordRes || [])
    })
    .catch((err) => setError('Unable to load dashboard data.'))
  }, [role, user])

  if (loading) return null
  if (role && role !== 'vendor') return <p className="ff-alert p-6 text-sm">Access denied.</p>

  const lowStock = fabrics.filter((item) => Number(item.stock_quantity) <= Number(item.low_stock_threshold))
  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0)

  return (
    <AppShell role={role} user={user} title="Vendor Overview">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card label="Total Inventory Items" value={fabrics.length} />
        <Card label="Low Stock Alerts" value={lowStock.length} alert={lowStock.length > 0} />
        <Card label="Pending Orders" value={pendingOrders.length} />
        <Card label="Total Revenue" value={`₦${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
      </div>

      {error && <p className="ff-alert mt-4 px-3 py-2 text-sm">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Orders Overview */}
        <section className="ff-card flex flex-col overflow-hidden max-h-[500px]">
          <header className="flex items-center justify-between border-b border-[color:var(--ff-border-soft)] px-4 py-3">
            <h2 className="text-sm font-semibold ff-text-primary">Recent Fabric Orders</h2>
            <Link href="/dashboard/vendor/orders" className="text-xs ff-text-accent hover:underline">
              View All
            </Link>
          </header>
          <div className="overflow-y-auto w-full p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="ff-table-head sticky top-0">
                <tr>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="ff-table-row border-b border-white/5">
                    <td className="px-4 py-3">
                      <p className="font-semibold ff-text-primary">{order.order_number}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3 font-medium ff-text-primary">₦{order.subtotal}</td>
                    <td className="px-4 py-3">
                      <StageBadge value={order.status} />
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center ff-text-secondary">
                      No recent orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Inventory Snapshot */}
        <section className="ff-card flex flex-col overflow-hidden max-h-[500px]">
          <header className="flex items-center justify-between border-b border-[color:var(--ff-border-soft)] px-4 py-3">
            <h2 className="text-sm font-semibold ff-text-primary">Inventory Snapshot</h2>
            <Link href="/dashboard/vendor/products" className="text-xs ff-text-accent hover:underline">
              Manage Inventory
            </Link>
          </header>
          <div className="overflow-y-auto w-full p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="ff-table-head sticky top-0">
                <tr>
                  <th className="px-4 py-2">Fabric</th>
                  <th className="px-4 py-2">Stock</th>
                  <th className="px-4 py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {fabrics.slice(0, 5).map((fabric) => (
                  <tr key={fabric.id} className="ff-table-row border-b border-white/5">
                    <td className="px-4 py-3 font-medium ff-text-primary">
                      {fabric.name}
                      {fabric.is_low_stock && (
                        <span className="block text-xs text-red-500 mt-1">Low stock</span>
                      )}
                    </td>
                    <td className="px-4 py-3 ff-text-secondary w-24">
                      {fabric.stock_quantity} {fabric.unit}
                    </td>
                    <td className="px-4 py-3 ff-text-secondary">₦{fabric.unit_price}</td>
                  </tr>
                ))}
                {!fabrics.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center ff-text-secondary">
                      No inventory items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function Card({ label, value, alert }) {
  return (
    <div className={`ff-card p-4 transition ${alert ? 'border-red-500/50 bg-red-500/5' : ''}`}>
      <p className="text-xs uppercase tracking-wide ff-text-secondary">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${alert ? 'text-red-400' : 'ff-text-primary'}`}>
        {value}
      </p>
    </div>
  )
}
