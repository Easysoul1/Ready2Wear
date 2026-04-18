import Link from 'next/link'

const CORE_MODULES = [
  {
    title: 'Vendor inventory + pricing',
    description:
      'Fabric vendors manage stock, unit pricing, SKU updates, and low-stock alerts with full inventory history.',
  },
  {
    title: 'Tailor production workflow',
    description:
      'Tailors run orders through stages (pending, cutting, sewing, finishing, ready) with progress logs and deadlines.',
  },
  {
    title: 'Client order tracking',
    description:
      'Clients view order status, expected delivery, and timeline updates in a single clear tracking experience.',
  },
  {
    title: 'Fabric marketplace',
    description:
      'Products can be listed by vendors only, while tailors and clients browse fabrics, use cart, and checkout securely.',
  },
  {
    title: 'Notification engine',
    description:
      'In-app and email notifications cover order updates, low-stock alerts, and marketplace events.',
  },
  {
    title: 'Admin oversight',
    description:
      'Admins oversee users, orders, and platform health without owning marketplace inventory or products.',
  },
]

const ROLE_EXPERIENCES = [
  {
    role: 'Vendor',
    points: ['Manage fabrics and stock', 'Update pricing safely', 'Publish marketplace listings'],
  },
  {
    role: 'Tailor',
    points: ['Create and manage jobs', 'Capture measurements', 'Update production stage and delivery'],
  },
  {
    role: 'Client',
    points: ['Place and track orders', 'View timeline and delivery status', 'Buy fabrics in marketplace'],
  },
  {
    role: 'Admin',
    points: ['Monitor all modules', 'Manage users and platform activity', 'Maintain governance and visibility'],
  },
]

const WORKFLOW_STEPS = [
  'Vendor publishes fabric inventory and pricing.',
  'Tailor or client selects fabrics from the marketplace.',
  'Tailor creates order with measurements and deadline.',
  'Order moves through production stages with timeline logs.',
  'Client receives status updates and delivery expectations.',
  'Order is completed and retained in history for future reference.',
]

const PLATFORM_STANDARDS = [
  'Role-based access with JWT authentication',
  'Transactional stock handling for inventory consistency',
  'Pagination, optimized queries, and scalable module boundaries',
  'Consistent API contract for reliable frontend integration',
]

export default function Home() {
  return (
    <div className="ff-page-bg min-h-screen">
      <header className="border-b border-[color:var(--ff-border-soft)] bg-[color:var(--ff-surface)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="text-xl font-bold ff-text-primary">
            Fashion<span className="ff-text-accent">Flow</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <a href="#modules" className="ff-link">
              Modules
            </a>
            <a href="#roles" className="ff-link">
              Roles
            </a>
            <a href="#workflow" className="ff-link">
              Workflow
            </a>
            <Link href="/auth/login" className="ff-btn-outline px-3 py-1.5 font-medium">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <span className="ff-badge-base ff-badge-accent">Production-ready fashion operations platform</span>
            <h1 className="text-4xl font-bold leading-tight ff-text-primary md:text-5xl">
              Complete homepage for your integrated fashion workflow + marketplace.
            </h1>
            <p className="max-w-3xl text-base ff-text-secondary">
              FashionFlow connects vendors, tailors, clients, and admins in one operational system: inventory,
              marketplace ordering, production workflow tracking, notifications, and role-based dashboards.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/auth/register" className="ff-btn-primary px-5 py-3 text-sm font-semibold">
                Create account
              </Link>
              <Link href="/auth/login" className="ff-btn-outline px-5 py-3 text-sm font-semibold">
                Access dashboard
              </Link>
              <Link href="/products" className="ff-btn-outline px-5 py-3 text-sm font-semibold">
                Explore marketplace
              </Link>
            </div>
          </div>

          <div className="ff-card ff-card-elevated p-6">
            <h2 className="text-lg font-semibold ff-text-primary">What this homepage covers</h2>
            <ul className="mt-4 space-y-3 text-sm ff-text-secondary">
              <li>All platform modules and capabilities</li>
              <li>Role-specific responsibilities and user journeys</li>
              <li>End-to-end workflow from inventory to delivery</li>
              <li>Security, consistency, and production standards</li>
            </ul>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MetricCard label="Core modules" value="6" />
              <MetricCard label="User roles" value="4" />
              <MetricCard label="Workflow stages" value="5" />
              <MetricCard label="Notification channels" value="2+" />
            </div>
          </div>
        </section>

        <section id="modules" className="space-y-4">
          <h2 className="text-2xl font-semibold ff-text-primary">Core modules</h2>
          <p className="text-sm ff-text-secondary">
            Every module is connected so data stays consistent across inventory, production, and client tracking.
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CORE_MODULES.map((item) => (
              <article key={item.title} className="ff-card p-5">
                <h3 className="text-base font-semibold ff-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm ff-text-secondary">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="roles" className="space-y-4">
          <h2 className="text-2xl font-semibold ff-text-primary">Role-based homepage overview</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {ROLE_EXPERIENCES.map((item) => (
              <article key={item.role} className="ff-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold ff-text-primary">{item.role}</h3>
                  <span className="ff-badge-base ff-badge-primary">{item.role} dashboard</span>
                </div>
                <ul className="mt-3 space-y-2 text-sm ff-text-secondary">
                  {item.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <article className="ff-card p-5">
            <h2 className="text-2xl font-semibold ff-text-primary">Operational workflow</h2>
            <ol className="mt-4 space-y-3 text-sm ff-text-secondary">
              {WORKFLOW_STEPS.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="ff-badge-base ff-badge-accent mt-0.5">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </article>

          <article className="ff-card p-5">
            <h2 className="text-2xl font-semibold ff-text-primary">Platform standards</h2>
            <ul className="mt-4 space-y-3 text-sm ff-text-secondary">
              {PLATFORM_STANDARDS.map((item) => (
                <li key={item} className="rounded-lg border border-[color:var(--ff-border-soft)] p-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="ff-card ff-card-elevated flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold ff-text-primary">Start using the full platform</h2>
            <p className="mt-1 text-sm ff-text-secondary">
              Register your role, access your dashboard, and begin running inventory, workflow, and marketplace
              operations in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/register" className="ff-btn-primary px-5 py-3 text-sm font-semibold">
              Get started
            </Link>
            <Link href="/auth/login" className="ff-btn-outline px-5 py-3 text-sm font-semibold">
              Sign in
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[color:var(--ff-border-soft)] py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 text-sm ff-text-secondary">
          <p>FashionFlow — integrated fashion workflow and marketplace system.</p>
          <p>Vendor · Tailor · Client · Admin</p>
        </div>
      </footer>
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-lg border border-[color:var(--ff-border-soft)] px-3 py-2">
      <p className="text-xs uppercase tracking-wide ff-text-secondary">{label}</p>
      <p className="mt-1 text-lg font-semibold ff-text-primary">{value}</p>
    </div>
  )
}
