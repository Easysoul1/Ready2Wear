'use client'

import AppShell from '@/components/AppShell'
import VendorMarketplaceForm from './form'
import { useSession } from '@/lib/session'

export default function VendorMarketplacePage() {
  const { user, role, loading } = useSession()

  if (loading) return null
  if (role !== 'vendor') {
    return (
      <AppShell role={role} user={user} title="Marketplace">
        <p className="ff-alert">Access denied. Vendor only.</p>
      </AppShell>
    )
  }

  return (
    <AppShell role={role} user={user} title="List on Marketplace">
      <div className="max-w-2xl mx-auto">
        <VendorMarketplaceForm />
      </div>
    </AppShell>
  )
}