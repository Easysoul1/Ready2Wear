import Link from 'next/link'

export const metadata = {
  title: 'FashionFlow – Auth',
}

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen ff-page-bg">
      {/* Left panel – branding */}
      <div className="hidden flex-col justify-between bg-[color:var(--ff-primary)] p-12 lg:flex lg:w-1/2">
        <Link href="/" className="text-white text-2xl font-bold tracking-tight">
          Fashion<span className="ff-text-accent">Flow</span>
        </Link>

        <div>
          <h1 className="text-white text-4xl font-semibold leading-tight mb-4">
            Nigeria&apos;s Fashion<br />Supply Chain Platform
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-white/80">
            Connecting fabric vendors, master tailors, and clients — from bolt to boutique.
          </p>
        </div>

        <p className="text-sm text-white/70">© {new Date().getFullYear()} FashionFlow · All rights reserved</p>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <span className="text-2xl font-bold text-[color:var(--ff-primary)]">
                Fashion<span className="ff-text-accent">Flow</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
