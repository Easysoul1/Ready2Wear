# Ready2Wear — Production Fashion Workflow & Marketplace Platform

Ready2Wear is a modular full-stack system that connects **fabric vendors**, **tailors**, **clients**, and **admins** across inventory, tailoring workflows, order tracking, and marketplace purchasing.

## System Architecture

### Backend (Django + DRF)
The backend is split into modular Django apps:

- `accounts`: JWT auth, role-aware user model (`admin`, `vendor`, `tailor`, `client`)
- `vendors`: vendor profile, inventory fabrics, price history, inventory events, low-stock alert triggers
- `tailors`: tailor profile management
- `clients`: client profile + reusable measurements
- `orders`: tailor production orders, stage workflow (`pending → cutting → sewing → finishing → ready`), progress timeline logs, measurements
- `products`: marketplace listings, cart, checkout, vendor grouped marketplace orders
- `notifications`: in-app + email notifications, read state, delivery state tracking
- `fashionflow`: global API settings (response envelope, pagination, exception handling, cache config)

### Frontend (Next.js App Router)
Role-aware Next.js UI with production modules:

- Landing page
- Auth (register/login)
- Role dashboards (`vendor`, `tailor`, `client`, `admin`)
- Marketplace listing/detail pages
- Cart and checkout flow
- Orders list and order tracking timeline
- Notification center

## Database Schema (Core Relationships)

- `accounts.User` (role-based identity root)
- `vendors.VendorProfile` 1:1 `User`
- `vendors.FabricItem` N:1 `VendorProfile`
- `vendors.PriceHistory` N:1 `FabricItem`
- `vendors.InventoryEvent` N:1 `FabricItem`
- `tailors.TailorProfile` 1:1 `User`
- `clients.ClientProfile` 1:1 `User`
- `orders.Order` N:1 `client(User)` + N:1 `tailor(User)` + optional `selected_fabric(FabricItem)`
- `orders.OrderItem` N:1 `Order`
- `orders.OrderMeasurement` 1:1 `Order`
- `orders.OrderProgressLog` N:1 `Order`
- `products.Product` 1:1 `FabricItem` (vendor ownership enforced through fabric ownership)
- `products.Cart` N:1 `owner(User)` with one open cart constraint
- `products.CartItem` N:1 `Cart` + N:1 `Product`
- `products.MarketplaceOrder` N:1 `buyer(User)` + N:1 `vendor(VendorProfile)`
- `products.MarketplaceOrderItem` N:1 `MarketplaceOrder`
- `notifications.Notification` N:1 `User`

## API Structure

All routes are prefixed by `/api/`:

- `/api/auth/` → register, login, refresh, me, role directory, admin users
- `/api/vendors/` → vendor profiles + fabrics + stock adjustment + price updates
- `/api/tailors/` → tailor profiles
- `/api/clients/` → client profiles
- `/api/orders/` → order CRUD + workflow stage update + progress logs + measurement upsert
- `/api/products/` → product listing, cart actions, checkout, marketplace orders
- `/api/notifications/` → list/mark read notifications

API responses use a consistent JSON envelope:
- success: `{"success": true, "data": ...}`
- error: `{"success": false, "errors": ...}`

## Security & Role Rules

- JWT auth via `djangorestframework-simplejwt`
- Role-scoped querysets across modules
- Vendor-only product and inventory ownership
- Admin is supervisory (overview/management) and does not own vendor product inventory
- Stock updates run in transactions with row locks (`select_for_update`) to avoid negative inventory under concurrency

## Performance & Scalability

- Default pagination (20 items/page, configurable)
- Query optimization through `select_related` / `prefetch_related`
- In-memory cache for public marketplace listing reads
- Indexed stage/status/order/vendor paths for high-frequency lookups

## Notifications

- Required channels: in-app + email
- Optional channels: SMS/push ready as model-level channel choices
- Automatic notifications for:
  - order updates
  - low-stock alerts
  - marketplace checkout events

## Local Development

### Backend

```bash
cd backend
./venv/bin/python -m pip install -r requirements.txt
./venv/bin/python manage.py migrate
./venv/bin/python manage.py runserver
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Quality checks

```bash
# backend tests
cd backend && ./venv/bin/python manage.py test

# frontend lint
cd client && npm run lint -- --quiet
```

### Build in environments without compatible native SWC binaries

```bash
cd client
NEXT_TEST_WASM=1 npx next build --webpack
```
