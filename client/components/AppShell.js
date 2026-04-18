'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { clearTokens } from '@/lib/api'

const ROLE_LINKS = {
  admin: [
    { href: '/dashboard/admin', label: 'Overview' },
    { href: '/orders', label: 'Orders' },
    { href: '/products', label: 'Marketplace' },
    { href: '/notifications', label: 'Notifications' },
  ],
  vendor: [
    { href: '/dashboard/vendor', label: 'Dashboard' },
    { href: '/products', label: 'Products' },
    { href: '/orders', label: 'Tailor Orders' },
    { href: '/notifications', label: 'Notifications' },
  ],
  tailor: [
    { href: '/dashboard/tailor', label: 'Dashboard' },
    { href: '/orders', label: 'Orders' },
    { href: '/products', label: 'Marketplace' },
    { href: '/cart', label: 'Cart' },
    { href: '/notifications', label: 'Notifications' },
  ],
  client: [
    { href: '/dashboard/client', label: 'Dashboard' },
    { href: '/orders', label: 'My Orders' },
    { href: '/products', label: 'Marketplace' },
    { href: '/cart', label: 'Cart' },
    { href: '/notifications', label: 'Notifications' },
  ],
}

export default function AppShell({ role, user, title, children }) {
  const router = useRouter()
  const pathname = usePathname()
  const links = ROLE_LINKS[role] || []

  const handleLogout = () => {
    clearTokens()
    router.push('/auth/login')
  }

  return (
    <div className="ff-page-bg min-h-screen">
      <header className="ff-app-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-white">
            Fashion<span className="ff-text-accent">Flow</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/80">
              {user?.email} <span className="capitalize">({role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/30 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <aside className="ff-card p-3">
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`ff-nav-link text-sm ${
                  pathname === link.href || pathname?.startsWith(`${link.href}/`) ? 'ff-nav-link-active' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="space-y-4">
          <h1 className="text-2xl font-semibold ff-text-primary">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  )
}
