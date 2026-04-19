'use client'

import { useEffect, useState } from 'react'
import { CldUploadWidget } from 'next-cloudinary'

import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

import 'next-cloudinary/dist/cld-upload-widget.css'

const EMPTY_FORM = {
  name: '',
  fabric_type: '',
  colour: '',
  unit: 'yard',
  stock_quantity: '',
  unit_price: '',
  description: '',
}

export default function VendorProductsPage() {
  const { user, role, loading } = useSession()
  const [fabrics, setFabrics] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploadedImages, setUploadedImages] = useState([])
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const DESCRIPTION_MIN = 20
  const DESCRIPTION_MAX = 500

  const loadData = async () => {
    try {
      const [fabRes, prodRes] = await Promise.all([
        api.get('/api/vendors/fabrics/').catch(() => []),
        api.get('/api/products/products/').catch(() => []),
      ])
      setFabrics(fabRes?.results || fabRes || [])
      setProducts(prodRes?.results || prodRes || [])
    } catch (err) {
      setError('Unable to load data.')
    }
  }

  useEffect(() => {
    if (!user || role !== 'vendor') return
    const timeoutId = window.setTimeout(() => loadData(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [user, role])

  const handleCreateMergedProduct = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    
    if (form.description.length < DESCRIPTION_MIN) {
      setError(`Description must be at least ${DESCRIPTION_MIN} characters to properly engage buyers.`)
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Create Fabric Base
      const fabricPayload = {
        name: form.name,
        fabric_type: form.fabric_type,
        colour: form.colour,
        unit: form.unit,
        stock_quantity: Number(form.stock_quantity),
        unit_price: Number(form.unit_price),
      }
      const newFabric = await api.post('/api/vendors/fabrics/', fabricPayload)

      // 2. Publish as Marketplace Product Automatically
      const productPayload = {
        fabric: newFabric.id,
        title: form.name,
        description: form.description,
        images: uploadedImages,
      }
      await api.post('/api/products/products/', productPayload)

      setInfo('Product successfully added and published to the marketplace!')
      setForm(EMPTY_FORM)
      setUploadedImages([])
      await loadData()
    } catch (err) {
      setError(err?.data?.detail || 'Failed to create product.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteFabric = async (id) => {
    if (!confirm('Delete this fabric? This will also unpublish the product.')) return
    setError('')
    setInfo('')
    try {
      await api.delete(`/api/vendors/fabrics/${id}/`)
      setInfo('Product and inventory tracking deleted.')
      await loadData()
    } catch (err) {
      setError(err?.data?.detail || 'Failed to delete fabric.')
    }
  }

  const toggleMarketplaceVisibility = async (fabricId) => {
    setError('')
    setInfo('')
    const existingProd = products.find((p) => p.fabric === fabricId)
    if (existingProd) {
      try {
        await api.delete(`/api/products/products/${existingProd.id}/`)
        setInfo('Product unpublished from marketplace.')
        await loadData()
      } catch (err) {
        setError('Failed to unpublish.')
      }
    } else {
      const fabricObj = fabrics.find((f) => f.id === fabricId)
      try {
        await api.post('/api/products/products/', {
          fabric: fabricId,
          title: fabricObj.name,
          images: [],
          description: '',
        })
        setInfo('Product published to marketplace.')
        await loadData()
      } catch (err) {
        setError('Failed to publish.')
      }
    }
  }

  if (loading) return null
  if (role && role !== 'vendor') return <p className="ff-alert p-6 text-sm">Access denied.</p>

  return (
    <AppShell role={role} user={user} title="My Products">
      {error && <p className="ff-alert px-3 py-2 text-sm">{error}</p>}
      {info && <p className="ff-alert px-3 py-2 text-sm">{info}</p>}

      <div className="mt-6 space-y-6">
        <form onSubmit={handleCreateMergedProduct} className="ff-card p-6">
          <header className="mb-4">
            <h2 className="text-xl font-bold ff-text-primary">Add New Product</h2>
            <p className="text-sm text-gray-400 mt-1">
              Add a new fabric and instantly publish it to the marketplace for tailors and clients.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <input
              required
              type="text"
              placeholder="Product Name (e.g., Silk Red Rose)"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="ff-input px-3 py-2"
            />
            <input
              required
              type="text"
              placeholder="Fabric Type (e.g., Ankara, Silk)"
              value={form.fabric_type}
              onChange={(e) => setForm((prev) => ({ ...prev, fabric_type: e.target.value }))}
              className="ff-input px-3 py-2"
            />
            <input
              required
              type="text"
              placeholder="Colour"
              value={form.colour}
              onChange={(e) => setForm((prev) => ({ ...prev, colour: e.target.value }))}
              className="ff-input px-3 py-2"
            />
            <div className="flex gap-2">
              <input
                required
                type="number"
                placeholder="Stock Qty"
                value={form.stock_quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                className="ff-input w-full px-3 py-2"
              />
              <select
                required
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                className="ff-input w-28 px-3 py-2"
              >
                <option value="yard">Yard</option>
                <option value="meter">Meter</option>
                <option value="piece">Piece</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <input
                required
                type="number"
                placeholder="Price per unit (₦)"
                value={form.unit_price}
                onChange={(e) => setForm((prev) => ({ ...prev, unit_price: e.target.value }))}
                className="ff-input w-full px-3 py-2"
              />
            </div>
          </div>
          
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium ff-text-primary">
                  Marketplace Description
                </label>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  {showHint ? 'Hide tips' : 'Show tips'}
                </button>
              </div>

              {showHint && (
                <div className="bg-blue-500/10 p-3 rounded-md text-xs mb-3 border border-blue-500/20">
                  <p className="font-medium text-blue-400 mb-1">Good description examples:</p>
                  <ul className="list-disc pl-4 text-blue-300 space-y-1">
                    <li>"Soft Ankara fabric, perfect for party wear. High quality, non-fade."</li>
                    <li>"Premium bridal lace, great for wedding ceremonies and aso-ebi."</li>
                  </ul>
                  <p className="font-medium text-blue-400 mt-2 mb-1">Avoid:</p>
                  <ul className="list-disc pl-4 text-blue-300">
                    <li>Using technical acronyms customers won't understand</li>
                    <li>Not mentioning what the fabric feels like or what it's best used for</li>
                  </ul>
                </div>
              )}

              <textarea
                placeholder="Start typing your description here..."
                maxLength={DESCRIPTION_MAX}
                className="ff-input w-full px-3 py-2 min-h-[140px]"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              
              <div className="flex justify-between text-xs mt-2 px-1">
                <span className={form.description.length < DESCRIPTION_MIN ? 'text-red-400' : 'text-gray-500'}>
                  {form.description.length < DESCRIPTION_MIN
                    ? `${DESCRIPTION_MIN - form.description.length} more characters needed`
                    : 'Good length!'}
                </span>
                <span className="text-gray-500">
                  {form.description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              
              {form.description.length >= DESCRIPTION_MIN && (
                <div className="mt-3 p-3 bg-white/5 rounded-md border border-[color:var(--ff-border-soft)]">
                  <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Live Preview:</p>
                  <p className="text-sm ff-text-primary italic">"{form.description}"</p>
                </div>
              )}
            </div>

            <div className="ff-input flex flex-col p-3 rounded-md min-h-[140px]">
               <label className="block text-sm font-medium ff-text-primary mb-2">
                 Product Photos ({uploadedImages.length}/5)
               </label>
               
               <CldUploadWidget
                 uploadPreset="marketplace_items"
                 onSuccess={(result) => {
                   if (result?.info?.secure_url) {
                      setUploadedImages((prev) => [...prev, {
                        url: result.info.secure_url,
                        public_id: result.info.public_id
                      }])
                   }
                 }}
                 options={{
                   maxFiles: 5 - uploadedImages.length,
                   sources: ['local', 'url'],
                   multiple: true,
                 }}
               >
                 {({ open }) => {
                   if (uploadedImages.length >= 5) return null
                   return (
                     <button
                       type="button"
                       onClick={(e) => {
                         e.preventDefault()
                         open()
                       }}
                       className="ff-btn-outline w-full border-dashed border-2 bg-[color:var(--ff-bg-alt)]/50 py-4"
                     >
                       <span className="text-gray-400">Drag & Drop or Click to Upload</span>
                     </button>
                   )
                 }}
               </CldUploadWidget>

               {uploadedImages.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-3">
                   {uploadedImages.map((img, index) => (
                     <div key={index} className="relative group">
                       <img
                         src={img.url}
                         alt={`Upload ${index + 1}`}
                         className="w-14 h-14 object-cover rounded-md border border-[color:var(--ff-border-soft)]"
                       />
                       <button
                         type="button"
                         onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         ×
                       </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="ff-btn-primary mt-4 px-6 py-2"
          >
            {isSubmitting ? 'Publishing...' : 'Add Product'}
          </button>
        </form>

        <section className="ff-card overflow-hidden">
          <header className="border-b border-[color:var(--ff-border-soft)] px-4 py-4">
            <h2 className="text-lg font-bold ff-text-primary">All Products</h2>
          </header>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="ff-table-head">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Stock / Price</th>
                  <th className="px-4 py-3">Marketplace Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fabrics.map((fabric) => {
                  const isPublished = products.some((p) => p.fabric === fabric.id)
                  return (
                    <tr key={fabric.id} className="ff-table-row hover:bg-white/5 transition">
                      <td className="px-4 py-4 font-medium ff-text-primary">
                        {fabric.name}
                      </td>
                      <td className="px-4 py-4">
                        <span className="block ff-text-secondary">{fabric.fabric_type}</span>
                        <span className="block text-xs text-gray-500">{fabric.colour}</span>
                      </td>
                      <td className="px-4 py-4 ff-text-secondary">
                        <span className="block">{fabric.stock_quantity} {fabric.unit}</span>
                        <span className="block text-accent">₦{fabric.unit_price}</span>
                      </td>
                      <td className="px-4 py-4">
                        <button 
                           onClick={() => toggleMarketplaceVisibility(fabric.id)}
                           className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                             isPublished 
                              ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' 
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/30 hover:bg-gray-500/20'
                           }`}
                        >
                          {isPublished ? 'Live' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => deleteFabric(fabric.id)}
                          className="text-red-400 text-xs font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {!fabrics.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      You haven't listed any products yet.
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
