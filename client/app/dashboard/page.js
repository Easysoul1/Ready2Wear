'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useSession } from '@/lib/session'

const ROLE_DASHBOARD = {
  vendor: '/dashboard/vendor',
  tailor: '/dashboard/tailor',
  client: '/dashboard/client',
  admin: '/dashboard/admin',
}

export default function DashboardEntry() {
  const router = useRouter()
  const { role, loading } = useSession()

  useEffect(() => {
    if (!loading && role && ROLE_DASHBOARD[role]) {
      router.replace(ROLE_DASHBOARD[role])
    }
  }, [loading, role, router])

  return (
    <div className="ff-page-bg flex min-h-screen items-center justify-center">
      <p className="text-sm ff-text-secondary">Loading your dashboard…</p>
    </div>
  )
}
