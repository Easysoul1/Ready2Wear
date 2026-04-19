import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              {/* <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--brand)' }}></div> */}
              <Link href="/">
                <span className="text-xl font-bold text-gray-900">FashionFlow</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Sign in
              </Link>
              <Link 
                href="/auth/register" 
                className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition"
                style={{ background: 'var(--brand)' }}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
            Nigeria's Fashion Supply Chain,<br />
            <span style={{ color: 'var(--brand-accent)' }}>Digitally Connected</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            The unified platform connecting fabric vendors, tailors, and clients. 
            Streamline orders, track production, and grow your fashion business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth/register" 
              className="w-full sm:w-auto text-base font-semibold text-white px-8 py-3.5 rounded-xl transition hover:opacity-90"
              style={{ background: 'var(--brand)' }}
            >
              Start for free
            </Link>
            <Link 
              href="/auth/login" 
              className="w-full sm:w-auto text-base font-semibold text-gray-700 px-8 py-3.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
            >
              Sign in to dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Everyone in Fashion</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you sell fabrics, tailor outfits, or order custom clothing, FashionFlow has you covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Vendors */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center" style={{ background: '#fef3c7' }}>
                <svg className="w-6 h-6" style={{ color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Fabric Vendors</h3>
              <ul className="space-y-2.5 text-gray-600">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Real-time inventory management
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Track price fluctuations
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Low stock alerts
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Digital fabric catalogue
                </li>
              </ul>
            </div>

            {/* Tailors */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center" style={{ background: '#dbeafe' }}>
                <svg className="w-6 h-6" style={{ color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Tailors</h3>
              <ul className="space-y-2.5 text-gray-600">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Manage client orders & measurements
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Track production milestones
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Deadline tracker with urgency indicators
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Browse & order fabrics from vendors
                </li>
              </ul>
            </div>

            {/* Clients */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center" style={{ background: '#fce7f3' }}>
                <svg className="w-6 h-6" style={{ color: '#db2777' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Clients</h3>
              <ul className="space-y-2.5 text-gray-600">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Track outfit production in real-time
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Get milestone notifications
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Store measurement profiles
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" style={{ color: 'var(--brand-accent)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  View order history & browse fabrics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Fashion Business?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join vendors, tailors, and clients across Nigeria who are already using FashionFlow 
            to streamline their operations and deliver better experiences.
          </p>
          <Link 
            href="/auth/register" 
            className="inline-block text-base font-semibold text-white px-8 py-3.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'var(--brand)' }}
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ background: 'var(--brand)' }}></div>
              <span className="text-sm font-semibold text-gray-900">FashionFlow</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FashionFlow. Built for Nigeria's fashion ecosystem.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
