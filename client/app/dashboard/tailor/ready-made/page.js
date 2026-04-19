'use client'

import { useEffect, useState } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import AppShell from '@/components/AppShell'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'



const CATEGORIES = [
  { value: 'womens', label: "Women's" },
  { value: 'mens', label: "Men's" },
  { value: 'unisex', label: 'Unisex' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom']
const DESCRIPTION_MIN = 20
const DESCRIPTION_MAX = 500

const EMPTY_FORM = {
  title: '',
  category: '',
  size_options: [],
  price: '',
  fabric_used: '',
  description: '',
}

export default function TailorReadyMadePage() {
  const { user, role, loading } = useSession()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploadedImages, setUploadedImages] = useState([])
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const loadData = async () => {
    try {
      const res = await api.get('/api/tailor/ready-made/')
      setProducts(res?.results || res || [])
    } catch (err) {
      setError('Unable to load ready-made products.')
    }
  }

  useEffect(() => {
    if (!user || role !== 'tailor') return
    const timeoutId = window.setTimeout(() => loadData(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [user, role])

  const handleSizeToggle = (size) => {
    const sizes = form.size_options.includes(size)
      ? form.size_options.filter((s) => s !== size)
      : [...form.size_options, size]
    setForm({ ...form, size_options: sizes })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    
    if (form.description.length < DESCRIPTION_MIN) {
      setError(`Description must be at least ${DESCRIPTION_MIN} characters to properly engage buyers.`)
      return
    }

    if (form.size_options.length === 0) {
      setError('Please select at least one available size.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/api/tailor/ready-made/', {
        ...form,
        images: uploadedImages,
      })
      setInfo('Ready-Made product successfully published!')
      setForm(EMPTY_FORM)
      setUploadedImages([])
      await loadData()
    } catch (err) {
      setError(err?.data?.detail || 'Failed to publish ready-made item.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    setError('')
    setInfo('')
    try {
      await api.delete(`/api/tailor/ready-made/${id}/`)
      setInfo('Listing deleted successfully.')
      await loadData()
    } catch (err) {
      setError('Failed to delete listing.')
    }
  }

  const toggleAvailability = async (product) => {
    setError('')
    setInfo('')
    try {
      await api.patch(`/api/tailor/ready-made/${product.id}/`, {
        is_available: !product.is_available
      })
      setInfo(`Product is now ${!product.is_available ? 'live' : 'hidden'}.`)
      await loadData()
    } catch (err) {
      setError('Failed to update product visibility.')
    }
  }

  if (loading) return null
  if (role && role !== 'tailor') return <p className="ff-alert p-6 text-sm">Access denied.</p>

  return (
    <AppShell role={role} user={user} title="My Ready-Made Products">
      {error && <p className="ff-alert px-3 py-2 text-sm">{error}</p>}
      {info && <p className="ff-alert px-3 py-2 text-sm text-green-500 bg-green-500/10 border-green-500/20">{info}</p>}

      <div className="mt-6 space-y-6">
        <form onSubmit={handleSubmit} className="ff-card p-6">
          <header className="mb-4">
            <h2 className="text-xl font-bold ff-text-primary">Post New Readymade Outfit</h2>
            <p className="text-sm text-gray-400 mt-1">
              List generic sizing or custom-made ready-to-wear clothing to the global marketplace.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
            <div className="flex flex-col">
              <input
                required
                type="text"
                placeholder="Title (e.g., Silk Flowery Gown)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="ff-input px-3 py-2 w-full"
              />
            </div>
            
            <div className="flex flex-col">
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="ff-input px-3 py-2 w-full"
              >
                <option value="">Select Target Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <input
                required
                type="text"
                placeholder="Fabric Used (e.g. Adire, Silk)"
                value={form.fabric_used}
                onChange={(e) => setForm({ ...form, fabric_used: e.target.value })}
                className="ff-input px-3 py-2 w-full"
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
             <div className="flex flex-col">
               <label className="block text-sm font-medium ff-text-primary mb-2">Available Sizes</label>
               <div className="flex flex-wrap gap-2">
                 {SIZES.map((size) => (
                   <button
                     key={size}
                     type="button"
                     onClick={() => handleSizeToggle(size)}
                     className={`px-3 py-1.5 rounded-md text-xs font-semibold transition border ${
                       form.size_options.includes(size)
                         ? 'bg-[color:var(--ff-accent)] text-white border-[color:var(--ff-accent)] shadow-[0_0_10px_rgba(var(--ff-accent-rgb),0.3)]'
                         : 'bg-transparent text-gray-400 border-[color:var(--ff-border-soft)] hover:border-gray-500'
                     }`}
                   >
                     {size}
                   </button>
                 ))}
               </div>
             </div>
             <div className="flex flex-col justify-end">
               <input
                 required
                 type="number"
                 placeholder="List Price (₦)"
                 value={form.price}
                 onChange={(e) => setForm({ ...form, price: e.target.value })}
                 className="ff-input px-3 py-2 w-full"
               />
             </div>
          </div>
          
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium ff-text-primary">
                  Descriptive Teaser
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
                  <p className="font-medium text-blue-400 mb-1">Good examples:</p>
                  <ul className="list-disc pl-4 text-blue-300 space-y-1">
                    <li>"Handcrafted full-length sequin gown. Lined inside for maximum comfort."</li>
                    <li>"Premium agbada set including trousers. Perfect for ceremonies."</li>
                  </ul>
                  <p className="font-medium text-blue-400 mt-2 mb-1">Avoid:</p>
                  <ul className="list-disc pl-4 text-blue-300">
                    <li>Copy/Pasting bare measurements exclusively</li>
                    <li>One-word descriptions</li>
                  </ul>
                </div>
              )}

              <textarea
                placeholder="Describe your ready-to-wear piece..."
                maxLength={DESCRIPTION_MAX}
                className="ff-input w-full px-3 py-2 min-h-[140px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                 Outfit Photos ({uploadedImages.length}/5)
               </label>
               
               <CldUploadWidget
                 uploadPreset="tailor_products"
                 onSuccess={(result) => {
                   if (result?.info?.secure_url) {
                      setUploadedImages((prev) => [...prev, {
                        url: result.info.secure_url,
                        public_id: result.info.public_id,
                        secure_url: result.info.secure_url
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
                       <span className="text-gray-400">Drag & Drop Output Render</span>
                     </button>
                   )
                 }}
               </CldUploadWidget>

               {uploadedImages.length > 0 && (
                 <div className="flex flex-wrap gap-2 mt-3">
                   {uploadedImages.map((img, index) => (
                     <div key={index} className="relative group">
                       <img
                         src={img.secure_url}
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
            {isSubmitting ? 'Publishing...' : 'Publish Ready-Made Item'}
          </button>
        </form>

        <section className="ff-card overflow-hidden">
          <header className="border-b border-[color:var(--ff-border-soft)] px-4 py-4">
            <h2 className="text-lg font-bold ff-text-primary">Your Ready-Made Wardrobe</h2>
          </header>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="ff-table-head">
                <tr>
                  <th className="px-4 py-3">Item Details</th>
                  <th className="px-4 py-3">Sizes Available</th>
                  <th className="px-4 py-3">List Price</th>
                  <th className="px-4 py-3">Visibility</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id} className="ff-table-row hover:bg-white/5 transition">
                    <td className="px-4 py-4">
                      <p className="font-semibold ff-text-primary">{product.title}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{product.category} · {product.fabric_used}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.size_options.map(sz => (
                          <span key={sz} className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                            {sz}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-[color:var(--ff-accent)]">
                      ₦{product.price}
                    </td>
                    <td className="px-4 py-4">
                      <button 
                         onClick={() => toggleAvailability(product)}
                         className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                           product.is_available 
                            ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20' 
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/30 hover:bg-gray-500/20'
                         }`}
                      >
                        {product.is_available ? 'Live' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 text-xs font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      You haven't listed any ready-to-wear outfits yet.
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