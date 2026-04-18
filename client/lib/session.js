'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { api, clearTokens, getAccessToken } from '@/lib/api'

export function useSession({ redirectToLogin = true } = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const token = getAccessToken()
      if (!token) {
        if (redirectToLogin && pathname !== '/auth/login') router.push('/auth/login')
        if (mounted) setLoading(false)
        return
      }
      try {
        const data = await api.get('/api/auth/me/')
        if (!mounted) return
        setUser(data)
        setError('')
      } catch (err) {
        if (!mounted) return
        clearTokens()
        setError(err?.data?.detail || 'Unable to load your session.')
        if (redirectToLogin && pathname !== '/auth/login') router.push('/auth/login')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadUser()
    return () => {
      mounted = false
    }
  }, [pathname, redirectToLogin, router])

  const role = useMemo(() => user?.role || null, [user])

  return { user, role, loading, error, setUser }
}
