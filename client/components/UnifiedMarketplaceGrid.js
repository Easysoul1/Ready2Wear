'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function UnifiedMarketplaceGrid() {
  const { user, role, loading } = useSession()
  const [fabrics, setFabrics] = useState([])
  const [tailorProducts, setTailorProducts] = useState([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    
    Promise.all([
      api.get('/api/vendors/marketplace/').catch(() => []),
      api.get('/api/marketplace/ready-made/').catch(() => []),
    ])
      .then(([fabricData, tailorData) => {
        setFabrics(fabricData?.results || fabricData || [])
        setTailorProducts(tailorData?.results || tailorData || [])
      })
      .catch((err) => setError('Failed to load marketplace.'))
  }, [user])

  const allItems = [
    ...fabrics.map(item => ({
      ...item,
      type: 'fabric',
      displayPrice: `₦${item.price}`,
      displayImage: item.images?.[0]?.secure_url,
    })),
    ...tailorProducts.map(item => ({
      ...item,
      type: 'tailor',
      displayPrice: `₦${item.price}`,
      displayImage: item.images?.[0]?.secure_url,
    })),
  ]

  const filteredItems = filter === 'all' 
    ? allItems 
    : filter === 'fabric' 
      ? allItems.filter(i => i.type === 'fabric')
      : allItems.filter(i => i.type === 'tailor')

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'fabric', 'tailor'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'fabric' ? 'Fabrics' : 'Ready-made'}
          </button>
        ))}
      </div>

      {error ? (
        <p className="ff-alert">{error}</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No items available.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredItems.map(item => (
            <Link
              key={item.id}
              href={`/products/${item.id}`}
              className="ff-card overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-square bg-gray-100 relative">
                {item.displayImage ? (
                  <img
                    src={item.displayImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <span className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                  item.type === 'fabric' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {item.type === 'fabric' ? 'Fabric' : 'Ready-made'}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm ff-text-primary truncate">
                  {item.title}
                </h3>
                {item.fabric_type && (
                  <p className="text-xs text-gray-500">{item.fabric_type}</p>
                )}
                {item.fabric_used && (
                  <p className="text-xs text-gray-500">{item.fabric_used}</p>
                )}
                <p className="mt-1 font-semibold ff-text-primary">
                  {item.displayPrice}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}