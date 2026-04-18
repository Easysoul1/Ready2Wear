'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

const EMPTY_PRODUCT_FORM = {
  fabric: '',
  title: '',
  description: '',
}

export default function ProductsPage() {
  const { user, role, loading } = useSession()
  const [products, setProducts] = useState([])
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM)
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

  const createProduct = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    try {
      await api.post('/api/products/products/', {
        ...productForm,
        fabric: Number(productForm.fabric),
      })
      setProductForm(EMPTY_PRODUCT_FORM)
      setInfo('Product published successfully.')
      await loadProducts()
    } catch (err) {
      setError(err?.data?.detail || 'Unable to publish product.')
    }
  }

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

      {role === 'vendor' ? (
        <form onSubmit={createProduct} className="ff-card p-4">
          <h2 className="text-lg font-semibold ff-text-primary">Publish product listing</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              required
              type="number"
              placeholder="Fabric inventory ID"
              value={productForm.fabric}
              onChange={(e) => setProductForm((prev) => ({ ...prev, fabric: e.target.value }))}
              className="ff-input px-3 py-2 text-sm"
            />
            <input
              required
              type="text"
              placeholder="Product title"
              value={productForm.title}
              onChange={(e) => setProductForm((prev) => ({ ...prev, title: e.target.value }))}
              className="ff-input px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="ff-btn-primary px-3 py-2 text-sm font-semibold"
            >
              Publish
            </button>
          </div>
          <textarea
            placeholder="Description"
            value={productForm.description}
            onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
            className="ff-input mt-3 min-h-24 px-3 py-2 text-sm"
          />
        </form>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="ff-card p-4">
            <p className="text-sm ff-text-secondary">{product.vendor_name}</p>
            <h3 className="mt-1 text-lg font-semibold ff-text-primary">{product.title}</h3>
            <p className="mt-2 text-sm ff-text-secondary">{product.description || 'No description.'}</p>
            <p className="mt-3 text-sm font-medium ff-text-primary">
              ₦{product.unit_price} · {product.stock_quantity} {product.fabric_unit}
            </p>
            <Link href={`/products/${product.id}`} className="ff-link mt-3 inline-block text-xs hover:underline">
              View details
            </Link>
            {role !== 'vendor' && role !== 'admin' ? (
              <button
                onClick={() => addToCart(product.id)}
                className="ff-btn-outline mt-3 px-3 py-2 text-sm"
              >
                Add to cart
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </AppShell>
  )
}
