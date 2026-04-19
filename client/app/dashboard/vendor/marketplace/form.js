'use client'

import { useState, useEffect } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'



const DESCRIPTION_MIN = 20
const DESCRIPTION_MAX = 500
const MAX_IMAGES = 5

export default function VendorMarketplaceForm() {
  const { user, role, loading } = useSession()
  const [form, setForm] = useState({
    title: '',
    fabric_type: '',
    price: '',
    quantity: '',
    description: '',
  })
  const [images, setImages] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    setError('')
  }

  const handleImageUpload = (result) => {
    if (result?.info?.public_id) {
      setImages([...images, {
        public_id: result.info.public_id,
        url: result.info.url,
        secure_url: result.info.secure_url,
      }])
    }
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (form.description.length < DESCRIPTION_MIN) {
      setError(`Description must be at least ${DESCRIPTION_MIN} characters.`)
      setSubmitting(false)
      return
    }

    try {
      await api.post('/api/vendors/marketplace/', {
        ...form,
        images: images,
      })
      setSuccess(true)
    } catch (err) {
      setError(err?.data?.detail || 'Failed to list item.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  if (success) {
    return (
      <div className="ff-card p-6 text-center">
        <h2 className="text-xl font-semibold text-green-600 mb-2">Item listed!</h2>
        <p className="text-gray-600 mb-4">Your item is now visible on the marketplace.</p>
        <Link href="/products" className="ff-btn-primary">View Marketplace</Link>
      </div>
    )
  }

  return (
    <div className="ff-card p-6">
      <h2 className="text-xl font-semibold ff-text-primary mb-6">List Fabric for Sale</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium ff-text-primary mb-1">
            What fabric are you selling?
          </label>
          <input
            type="text"
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="e.g., Fresh Ankara Print"
            className="ff-input w-full"
          />
        </div>

        {/* Fabric Type */}
        <div>
          <label className="block text-sm font-medium ff-text-primary mb-1">
            Fabric type
          </label>
          <input
            type="text"
            name="fabric_type"
            required
            value={form.fabric_type}
            onChange={handleChange}
            placeholder="e.g., Ankara, Lace, Cotton, Silk"
            className="ff-input w-full"
          />
        </div>

        {/* Price & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium ff-text-primary mb-1">
              Price (₦)
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              className="ff-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium ff-text-primary mb-1">
              Available quantity
            </label>
            <input
              type="number"
              name="quantity"
              required
              min="0"
              step="0.01"
              value={form.quantity}
              onChange={handleChange}
              placeholder="0"
              className="ff-input w-full"
            />
          </div>
        </div>

        {/* Description with hints */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium ff-text-primary">
              Description
            </label>
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showHint ? 'Hide tips' : 'Show tips'}
            </button>
          </div>

          {showHint && (
            <div className="bg-blue-50 p-3 rounded text-xs mb-2">
              <p className="font-medium text-blue-800 mb-1">Good description examples:</p>
              <ul className="list-disc pl-4 text-blue-700 space-y-1">
                <li>"Soft Ankara, perfect for party wear. No stains or defects."</li>
                <li>"High-quality lace, great for wedding ceremonies."</li>
              </ul>
              <p className="font-medium text-blue-800 mt-2 mb-1">Avoid:</p>
              <ul className="list-disc pl-4 text-blue-700">
                <li>Technical jargon customers won't understand</li>
                <li>Empty or missing descriptions</li>
              </ul>
            </div>
          )}

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            maxLength={DESCRIPTION_MAX}
            placeholder="Describe the fabric – e.g., 'Soft Ankara, perfect for party wear. No stains.' (minimum 20 characters)"
            className="ff-input w-full"
          />
          <div className="flex justify-between text-xs mt-1">
            <span className={form.description.length < DESCRIPTION_MIN ? 'text-red-500' : 'text-gray-500'}>
              {form.description.length < DESCRIPTION_MIN
                ? `${DESCRIPTION_MIN - form.description.length} more characters needed`
                : 'Good length!'}
            </span>
            <span className="text-gray-500">
              {form.description.length}/{DESCRIPTION_MAX}
            </span>
          </div>

          {/* Live Preview */}
          {form.description.length >= DESCRIPTION_MIN && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <p className="text-xs font-medium text-gray-500 mb-1">Preview:</p>
              <p className="text-sm ff-text-primary">{form.description}</p>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium ff-text-primary mb-1">
            Photos ({images.length}/{MAX_IMAGES})
          </label>
          
          <CldUploadWidget
            uploadPreset="marketplace_items"
            onSuccess={handleImageUpload}
            options={{
              maxFiles: MAX_IMAGES - images.length,
              sources: ['local'],
              multiple: true,
            }}
          >
            {({ open }) => {
              if (images.length >= MAX_IMAGES) return null
              return (
                <button
                  type="button"
                  onClick={() => open()}
                  className="ff-btn-outline w-full"
                >
                  + Add Photos
                </button>
              )
            }}
          </CldUploadWidget>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.secure_url}
                    alt={`Upload ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="ff-alert text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting || images.length === 0}
          className="ff-btn-primary w-full"
        >
          {submitting ? 'Listing...' : 'List on Marketplace'}
        </button>
      </form>
    </div>
  )
}