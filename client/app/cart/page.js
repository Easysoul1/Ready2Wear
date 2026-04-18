'use client'

import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function CartPage() {
  const { user, role, loading } = useSession()
  const [cart, setCart] = useState(null)
  const [checkoutOrders, setCheckoutOrders] = useState([])
  const [error, setError] = useState('')

  const loadCart = async () => {
    try {
      const data = await api.get('/api/products/cart/')
      setCart(data?.results?.[0] || data?.[0] || data || null)
    } catch (err) {
      setError(err?.data?.detail || 'Unable to load cart.')
    }
  }

  useEffect(() => {
    if (!user || !['client', 'tailor'].includes(role)) return
    const timeoutId = window.setTimeout(() => {
      void loadCart()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [role, user])

  const removeItem = async (productId) => {
    setError('')
    try {
      const data = await api.delete('/api/products/cart/items/', { product_id: productId })
      setCart(data)
    } catch (err) {
      setError(err?.data?.detail || 'Unable to remove item from cart.')
    }
  }

  const checkout = async () => {
    setError('')
    setCheckoutOrders([])
    try {
      const orders = await api.post('/api/products/cart/checkout/', {})
      setCheckoutOrders(orders || [])
      await loadCart()
    } catch (err) {
      setError(err?.data?.detail || 'Checkout failed.')
    }
  }

  if (loading) return null
  if (role && !['client', 'tailor'].includes(role)) {
    return <p className="ff-alert p-6 text-sm">Only tailors and clients can access cart.</p>
  }

  return (
    <AppShell role={role} user={user} title="Cart & Checkout">
      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}

      <section className="ff-card p-4">
        <h2 className="text-lg font-semibold ff-text-primary">Current cart</h2>
        <div className="mt-4 space-y-3">
          {(cart?.items || []).map((item) => (
            <article key={item.id} className="ff-card flex flex-wrap items-center justify-between p-3">
              <div>
                <p className="text-sm font-semibold ff-text-primary">{item.product_detail?.title}</p>
                <p className="text-xs ff-text-secondary">
                  Qty: {item.quantity} · Unit price: ₦{item.unit_price_snapshot}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.product)}
                className="ff-btn-outline px-3 py-1.5 text-xs"
              >
                Remove
              </button>
            </article>
          ))}
          {!cart?.items?.length ? <p className="text-sm ff-text-secondary">Your cart is empty.</p> : null}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm ff-text-primary">Total: ₦{cart?.total || '0.00'}</p>
          <button
            onClick={checkout}
            disabled={!cart?.items?.length}
            className="ff-btn-primary px-4 py-2 text-sm font-semibold"
          >
            Checkout
          </button>
        </div>
      </section>

      {checkoutOrders.length ? (
        <section className="ff-alert p-4">
          <h2 className="text-lg font-semibold ff-text-primary">Checkout complete</h2>
          <ul className="mt-2 space-y-1 text-sm ff-text-secondary">
            {checkoutOrders.map((order) => (
              <li key={order.id}>
                {order.order_number} · {order.vendor_name} · ₦{order.subtotal}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </AppShell>
  )
}
