'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function ProductsPage() {
  const { user, role, loading } = useSession()
  const [products, setProducts] = useState([])
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const loadProducts = async () => {
    try {
      const response = await api.get('/api/products/products/')
      setProducts(response?.results || response || [])
    } catch (err) {
      setError(err?.data?.detail || 'Unable to load marketplace products.')
    }
  }

  useEffect(() => {
    if (!user) return
    const timeoutId = window.setTimeout(() => {
      void loadProducts()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [user])

  const addToCart = async (productId) => {
    setError('')
    setInfo('')
    try {
      await api.post('/api/products/cart/items/', { product_id: productId, quantity: 1 })
      setInfo('Added to cart.')
    } catch (err) {
      setError(err?.data?.detail || 'Unable to add item to cart.')
    }
  }

  if (loading) return null

  return (
    <AppShell role={role} user={user} title="Fabric Marketplace">
      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}
      {info ? <p className="ff-alert px-3 py-2 text-sm">{info}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="ff-card overflow-hidden border border-[color:var(--ff-border-soft)] hover:border-[color:var(--ff-accent)] transition">
            {product.images?.length > 0 && product.images[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.title}
                className="w-full h-48 object-cover border-b border-[color:var(--ff-border-soft)]"
              />
            ) : (
              <div className="w-full h-48 bg-[color:var(--ff-bg-alt)] flex items-center justify-center border-b border-[color:var(--ff-border-soft)]">
                <span className="text-gray-500 text-xs text-center uppercase tracking-widest">No Image provided</span>
              </div>
            )}
            <div className="p-4">
              <p className="text-xs tracking-wide uppercase ff-text-accent font-semibold">{product.vendor_name}</p>
              <h3 className="mt-1 text-lg font-bold ff-text-primary leading-tight">{product.title}</h3>
              <p className="mt-2 text-sm text-gray-400 line-clamp-2">{product.description || 'No description provided.'}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-medium ff-text-primary">
                  <span className="text-lg">₦{product.unit_price}</span> <span className="text-gray-500 text-xs ml-1">/ {product.fabric_unit}</span>
                </p>
                <p className="text-xs bg-[color:var(--ff-bg-card)] px-2 py-1 rounded-md text-gray-400">
                  {product.stock_quantity} left
                </p>
              </div>
              
              <div className="mt-5 flex gap-2 w-full">
                <Link href={`/products/${product.id}`} className="ff-btn-outline flex-1 text-center py-2 text-sm">
                  View details
                </Link>
                {role !== 'vendor' && role !== 'admin' ? (
                  <button
                    onClick={() => addToCart(product.id)}
                    className="ff-btn-primary flex-1 py-2 text-sm"
                  >
                    Add to cart
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  )
}
