'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { use } from 'react'

import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params)
  const { user, role, loading } = useSession()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (!user || !resolvedParams.id) return
    api
      .get(`/api/products/products/${resolvedParams.id}/`)
      .then((res) => setProduct(res))
      .catch((err) => setError(err?.data?.detail || 'Unable to load product details.'))
  }, [resolvedParams.id, user])

  const addToCart = async () => {
    setError('')
    setInfo('')
    try {
      await api.post('/api/products/cart/items/', { product_id: product.id, quantity: 1 })
      setInfo('Added to cart.')
    } catch (err) {
      setError(err?.data?.detail || 'Unable to add item to cart.')
    }
  }

  if (loading) return null

  return (
    <AppShell role={role} user={user} title="Product Details">
      <Link href="/products" className="ff-link inline-block text-sm">
        ← Back to marketplace
      </Link>
      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}
      {info ? <p className="ff-alert px-3 py-2 text-sm">{info}</p> : null}

      {product ? (
        <article className="ff-card p-5">
          <p className="text-sm ff-text-secondary">{product.vendor_name}</p>
          <h2 className="mt-1 text-2xl font-semibold ff-text-primary">{product.title}</h2>
          <p className="mt-3 text-sm ff-text-secondary">{product.description || 'No description provided.'}</p>
          <p className="mt-4 text-sm font-medium ff-text-primary">
            ₦{product.unit_price} · {product.stock_quantity} {product.fabric_unit}
          </p>
          {role !== 'vendor' && role !== 'admin' ? (
            <button
              onClick={addToCart}
              className="ff-btn-outline mt-4 px-4 py-2 text-sm"
            >
              Add to cart
            </button>
          ) : null}
        </article>
      ) : null}
    </AppShell>
  )
}
