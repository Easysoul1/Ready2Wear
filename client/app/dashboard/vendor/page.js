'use client'

import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function VendorDashboardPage() {
  const { user, role, loading } = useSession()
  const [fabrics, setFabrics] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || role !== 'vendor') return
    api
      .get('/api/vendors/fabrics/')
      .then((res) => setFabrics(res?.results || res || []))
      .catch((err) => setError(err?.data?.detail || 'Unable to load inventory.'))
  }, [role, user])

  if (loading) return null
  if (role && role !== 'vendor') return <p className="ff-alert p-6 text-sm">Access denied.</p>

  const lowStock = fabrics.filter((item) => Number(item.stock_quantity) <= Number(item.low_stock_threshold))

  return (
    <AppShell role={role} user={user} title="Vendor Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Total Fabrics" value={fabrics.length} />
        <Card label="Low Stock Alerts" value={lowStock.length} />
        <Card
          label="Average Unit Price"
          value={
            fabrics.length
              ? `₦${(
                  fabrics.reduce((sum, item) => sum + Number(item.unit_price || 0), 0) / fabrics.length
                ).toFixed(2)}`
              : '₦0.00'
          }
        />
      </div>

      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}

      <section className="ff-card overflow-hidden">
        <header className="border-b border-[color:var(--ff-border-soft)] px-4 py-3 text-sm font-semibold ff-text-primary">
          Inventory snapshot
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="ff-table-head">
              <tr>
                <th className="px-4 py-2">Fabric</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {fabrics.map((fabric) => (
                <tr key={fabric.id} className="ff-table-row">
                  <td className="px-4 py-2 font-medium ff-text-primary">{fabric.name}</td>
                  <td className="px-4 py-2 ff-text-secondary">{fabric.sku || '-'}</td>
                  <td className="px-4 py-2 ff-text-secondary">
                    {fabric.stock_quantity} {fabric.unit}
                  </td>
                  <td className="px-4 py-2 ff-text-secondary">₦{fabric.unit_price}</td>
                  <td className="px-4 py-2">
                    <StageBadge value={fabric.is_low_stock ? 'cancelled' : 'completed'} />
                  </td>
                </tr>
              ))}
              {!fabrics.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center ff-text-secondary">
                    No fabrics available yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
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
