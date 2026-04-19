'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

const STAGE_OPTIONS = ['pending', 'cutting', 'sewing', 'finishing', 'ready']

export default function OrdersPage() {
  const { user, role, loading } = useSession()
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [tailors, setTailors] = useState([])
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [form, setForm] = useState({
    title: '',
    client: '',
    tailor: '',
    deadline: '',
    style_notes: '',
    measurements: '{}',
  })

  const loadOrders = async () => {
    try {
      const data = await api.get('/api/orders/orders/')
      setOrders(data?.results || data || [])
    } catch (err) {
      setError(err?.data?.detail || 'Unable to load orders.')
    }
  }

  useEffect(() => {
    if (!user) return
    const timeoutId = window.setTimeout(() => {
      void loadOrders()
    }, 0)
    const intervalId = window.setInterval(() => {
      void loadOrders()
    }, 30000)
    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [user])

  useEffect(() => {
    if (!user || !['tailor', 'client', 'admin'].includes(role)) return

    async function loadDirectory() {
      try {
        if (role === 'tailor' || role === 'admin') {
          const clientData = await api.get('/api/auth/directory/?role=client')
          setClients(clientData?.results || clientData || [])
        }
        if (role === 'client' || role === 'admin') {
          const tailorData = await api.get('/api/auth/directory/?role=tailor')
          setTailors(tailorData?.results || tailorData || [])
        }
      } catch (err) {
        setError(err?.data?.detail || 'Unable to load user directory.')
      }
    }

    loadDirectory()
  }, [role, user])

  const updateStage = async (orderId, stage) => {
    setError('')
    setInfo('')
    try {
      await api.post(`/api/orders/orders/${orderId}/update-stage/`, {
        stage,
        message: `Updated to ${stage}`,
      })
      await loadOrders()
    } catch (err) {
      setError(err?.data?.detail || 'Unable to update stage.')
    }
  }

  const createOrder = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')

    let parsedMeasurements = {}
    try {
      parsedMeasurements = JSON.parse(form.measurements || '{}')
    } catch {
      setError('Measurements must be a valid JSON object.')
      return
    }

    const payload = {
      title: form.title,
      client: Number(role === 'client' ? user.id : form.client),
      tailor: Number(role === 'tailor' ? user.id : form.tailor),
      deadline: form.deadline,
      style_notes: form.style_notes,
      measurement: {
        measurements: parsedMeasurements,
      },
    }

    try {
      await api.post('/api/orders/orders/', payload)
      setInfo('Order created successfully.')
      setForm({
        title: '',
        client: '',
        tailor: '',
        deadline: '',
        style_notes: '',
        measurements: '{}',
      })
      await loadOrders()
    } catch (err) {
      setError(err?.data?.detail || 'Unable to create order.')
    }
  }

  if (loading) return null

  return (
    <AppShell role={role} user={user} title="Tailoring Orders">
      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}
      {info ? <p className="ff-alert px-3 py-2 text-sm">{info}</p> : null}

      {['tailor', 'client', 'admin'].includes(role) ? (
        <form onSubmit={createOrder} className="ff-card p-4">
          <h2 className="text-lg font-semibold ff-text-primary">Create order</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              required
              type="text"
              placeholder="Order title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="ff-input px-3 py-2 text-sm"
            />
            <input
              required
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
              className="ff-input px-3 py-2 text-sm"
            />
            {role !== 'client' ? (
              <select
                required
                value={form.client}
                onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))}
                className="ff-input px-3 py-2 text-sm"
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.email}
                  </option>
                ))}
              </select>
            ) : null}
            {role !== 'tailor' ? (
              <select
                required
                value={form.tailor}
                onChange={(e) => setForm((prev) => ({ ...prev, tailor: e.target.value }))}
                className="ff-input px-3 py-2 text-sm"
              >
                <option value="">Select tailor</option>
                {tailors.map((tailor) => (
                  <option key={tailor.id} value={tailor.id}>
                    {tailor.email}
                  </option>
                ))}
              </select>
            ) : null}
          </div>
          <div className="mt-3 col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium ff-text-primary">
                Style Notes & Description
              </label>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-[color:var(--ff-accent)] hover:underline"
              >
                {showHint ? 'Hide tips' : 'Show tips'}
              </button>
            </div>
            {showHint && (
              <div className="bg-[rgba(212,163,115,0.1)] p-3 rounded text-xs mb-2 border border-[rgba(212,163,115,0.2)]">
                <p className="font-medium ff-text-primary mb-1">Good examples:</p>
                <ul className="list-disc pl-4 ff-text-secondary space-y-1">
                  <li>"Agbada should be ankle length, slightly loose on the chest. Add inner pockets."</li>
                  <li>"Make the sleeves 3/4 length. Use simple straight cut, no extra embroidery."</li>
                </ul>
                <p className="font-medium ff-text-primary mt-2 mb-1">Avoid:</p>
                <ul className="list-disc pl-4 ff-text-secondary">
                  <li>"Just make it nice"</li>
                  <li>"V-neck" (without specifying depth or width)</li>
                </ul>
              </div>
            )}
            <textarea
              value={form.style_notes}
              onChange={(e) => setForm((prev) => ({ ...prev, style_notes: e.target.value }))}
              placeholder="Detailed description of the style (minimum 20 characters recommended)..."
              className="ff-input min-h-[100px] w-full px-3 py-2 text-sm"
            />
            {form.style_notes.length > 20 && (
              <div className="mt-2 p-3 bg-white/5 rounded-md border border-[color:var(--ff-border-soft)]">
                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Preview:</p>
                <p className="text-sm ff-text-primary italic">"{form.style_notes}"</p>
              </div>
            )}
          </div>
          <textarea
            value={form.measurements}
            onChange={(e) => setForm((prev) => ({ ...prev, measurements: e.target.value }))}
            placeholder='Measurements JSON e.g. {"chest": 40, "waist": 34}'
            className="ff-input mt-3 min-h-20 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="ff-btn-primary mt-3 px-4 py-2 text-sm font-semibold"
          >
            Create order
          </button>
        </form>
      ) : null}

      <section className="ff-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="ff-table-head">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Client</th>
                <th className="px-4 py-2">Deadline</th>
                <th className="px-4 py-2">Stage</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="ff-table-row">
                  <td className="px-4 py-2">
                    <p className="font-semibold ff-text-primary">{order.order_number}</p>
                    <p className="text-xs ff-text-secondary">{order.title}</p>
                  </td>
                  <td className="px-4 py-2 ff-text-secondary">{order.client_detail?.email || '-'}</td>
                  <td className="px-4 py-2 ff-text-secondary">{order.deadline}</td>
                  <td className="px-4 py-2">
                    <StageBadge value={order.current_stage} />
                  </td>
                  <td className="px-4 py-2">
                    <StageBadge value={order.status} />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="ff-btn-outline px-2.5 py-1 text-xs"
                      >
                        View
                      </Link>
                      {role === 'tailor' || role === 'admin' ? (
                        <select
                          value={order.current_stage}
                          onChange={(e) => updateStage(order.id, e.target.value)}
                          className="ff-input w-auto px-2 py-1 text-xs"
                        >
                          {STAGE_OPTIONS.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!orders.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center ff-text-secondary">
                    No orders found.
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
