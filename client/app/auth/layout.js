import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'FashionFlow – Auth',
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'var(--brand)' }}
      >
        <Link href="/" className="text-white text-2xl font-bold tracking-tight">
          Fashion<span style={{ color: 'var(--brand-accent)' }}>Flow</span>
        </Link>

        <div>
          <h1 className="text-white text-4xl font-semibold leading-tight mb-4">
            Nigeria&apos;s Fashion<br />Supply Chain Platform
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Connecting fabric vendors, master tailors, and clients — from bolt to boutique.
          </p>
        </div>

        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} FashionFlow · All rights reserved</p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-2xl font-bold" style={{ color: 'var(--brand)' }}>
              Fashion<span style={{ color: 'var(--brand-accent)' }}>Flow</span>
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
