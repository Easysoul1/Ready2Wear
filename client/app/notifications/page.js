'use client'

import { useEffect, useState } from 'react'

import AppShell from '@/components/AppShell'
import StageBadge from '@/components/StageBadge'
import { api } from '@/lib/api'
import { useSession } from '@/lib/session'

export default function NotificationsPage() {
  const { user, role, loading } = useSession()
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    try {
      const data = await api.get('/api/notifications/notifications/')
      setNotifications(data?.results || data || [])
    } catch (err) {
      setError(err?.data?.detail || 'Unable to load notifications.')
    }
  }

  useEffect(() => {
    if (!user) return
    const timeoutId = window.setTimeout(() => {
      void loadNotifications()
    }, 0)
    const intervalId = window.setInterval(() => {
      void loadNotifications()
    }, 30000)
    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [user])

  const markRead = async (id) => {
    setError('')
    try {
      await api.post(`/api/notifications/notifications/${id}/mark-read/`, { is_read: true })
      await loadNotifications()
    } catch (err) {
      setError(err?.data?.detail || 'Unable to mark notification as read.')
    }
  }

  const markAllRead = async () => {
    setError('')
    try {
      await api.post('/api/notifications/notifications/mark-all-read/', {})
      await loadNotifications()
    } catch (err) {
      setError(err?.data?.detail || 'Unable to mark all notifications as read.')
    }
  }

  if (loading) return null

  return (
    <AppShell role={role} user={user} title="Notifications">
      <div className="flex justify-end">
        <button
          onClick={markAllRead}
          className="ff-btn-outline px-3 py-1.5 text-sm"
        >
          Mark all read
        </button>
      </div>
      {error ? <p className="ff-alert px-3 py-2 text-sm">{error}</p> : null}

      <section className="space-y-3">
        {notifications.map((notification) => (
          <article key={notification.id} className="ff-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StageBadge value={notification.delivery_status} />
                <StageBadge value={notification.notif_type} />
                {!notification.is_read ? (
                  <span className="ff-badge-base ff-badge-accent">Unread</span>
                ) : null}
              </div>
              <span className="text-xs ff-text-secondary">{new Date(notification.created_at).toLocaleString()}</span>
            </div>
            <h2 className="mt-2 text-sm font-semibold ff-text-primary">{notification.title}</h2>
            <p className="mt-1 text-sm ff-text-secondary">{notification.message}</p>
            {!notification.is_read ? (
              <button
                onClick={() => markRead(notification.id)}
                className="ff-btn-outline mt-3 px-3 py-1.5 text-xs"
              >
                Mark read
              </button>
            ) : null}
          </article>
        ))}
        {!notifications.length ? (
          <p className="ff-card border-dashed p-6 text-center text-sm ff-text-secondary">
            No notifications yet.
          </p>
        ) : null}
      </section>
    </AppShell>
  )
}
