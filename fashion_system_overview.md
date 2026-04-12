# FashionFlow — Order & Production Workflow Management System
> A web-based platform connecting fabric vendors, tailors, and clients in Nigeria's fashion ecosystem.

---

## 1. Project Summary

**FashionFlow** is an integrated web application designed to digitise and streamline operations across Nigeria's ready-to-wear fashion supply chain. It serves three distinct user types — fabric vendors, tailors, and clients — through a single unified platform, replacing manual tracking via paper and WhatsApp with a structured, transparent digital workflow.

---

## 2. The Problem

Nigeria's fashion markets (Balogun, Gbagi, Dugbe, Aba, Wuse) are thriving but largely undigitised:

- **Fabric Vendors** struggle with inaccurate stock counts and inconsistent pricing, especially during festive periods.
- **Tailors** find it hard to manage multiple client orders, track deadlines, and communicate progress effectively.
- **Clients** have no visibility into the status of their outfits and frequently experience missed deadlines and miscommunication.

There is no unified digital solution that connects all three parties in one place.

---

## 3. The Solution

FashionFlow provides each user type with a tailored dashboard and toolset:

| User | Core Value |
|------|-----------|
| Fabric Vendor | Real-time inventory and price management |
| Tailor | End-to-end order and workflow management |
| Client | Transparent, real-time outfit tracking |

---

## 4. User Roles & Key Features

### 4.1 Fabric Vendor
- **Inventory Management** — Add, edit, and track fabric stock (type, quantity, colour, price per yard).
- **Price Fluctuation Tracking** — Log price changes over time; view historical pricing trends.
- **Low Stock Alerts** — Automated notifications when stock falls below a set threshold.
- **Fabric Catalogue** — A browsable storefront for tailors and clients to view available fabrics and prices.
- **Order Requests** — Receive and manage fabric orders from tailors.

### 4.2 Tailor
- **Client Order Management** — Create and manage orders per client: capture measurements, fabric choices, style references, and agreed delivery dates.
- **Production Milestones** — Break each order into stages (e.g. Cutting → Sewing → Fitting → Finishing → Ready) and update progress.
- **Deadline Tracker** — Visual overview of all active orders sorted by due date with urgency indicators.
- **Fabric Sourcing** — Browse vendor catalogues and place fabric orders directly within the platform.
- **Client Communication Log** — Record notes and updates tied to each order.
- **Automated Reminders** — Receive deadline reminders; send automated updates to clients at key milestones.

### 4.3 Client
- **Order Tracking Dashboard** — View the real-time production status of all outfits in progress.
- **Milestone Notifications** — Receive push/email notifications when their outfit moves to the next stage.
- **Measurement Profile** — Store personal measurements for reuse across orders.
- **Order History** — View past orders, payment records, and delivery confirmations.
- **Fabric Browsing** — Browse vendor catalogues to select fabrics before placing an order.

---

## 5. System Architecture (High Level)

```
┌─────────────────────────────────────────────┐
│                  Web Browser                │
│   (Vendor Dashboard | Tailor Dashboard |    │
│          Client Dashboard)                  │
└────────────────────┬────────────────────────┘
                     │ HTTPS / REST API
┌────────────────────▼────────────────────────┐
│              Backend (Django/Flask)         │
│  - Auth & Role Management                  │
│  - Inventory Service                        │
│  - Order & Workflow Service                 │
│  - Notification Service                     │
│  - Fabric Catalogue Service                 │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│          Database (PostgreSQL/MySQL)        │
│  Users | Vendors | Inventory | Orders |     │
│  Measurements | Milestones | Notifications  │
└─────────────────────────────────────────────┘
```

---

## 6. Core Modules

### Module 1 — Authentication & Role Management
- User registration and login (email/password).
- Role selection at sign-up: Vendor, Tailor, or Client.
- Role-based access control — each role sees only its relevant dashboard and features.
- Password reset and basic profile management.

### Module 2 — Vendor Inventory & Catalogue
- CRUD operations for fabric stock items.
- Price history logging per item.
- Catalogue visibility settings (public to all / tailors only).
- Low-stock threshold configuration and alert triggers.

### Module 3 — Tailor Order & Workflow Management
- Order creation form: client details, measurements, fabric, style notes, deadline.
- Milestone pipeline per order with status updates.
- Multi-order dashboard with filters (by status, deadline, client).
- Internal notes per order.

### Module 4 — Client Tracking Interface
- Read-only progress view per order linked to the tailor's milestone updates.
- Notification centre (in-app + email).
- Measurement profile storage.
- Order history view.

### Module 5 — Fabric Ordering
- Tailors and clients can browse vendor catalogues.
- Tailors can submit fabric order requests to vendors.
- Vendors can accept/reject/fulfil requests and update stock accordingly.

### Module 6 — Notifications & Reminders
- Automated email or SMS notifications using Firebase or Twilio.
- Triggered by: low stock, approaching deadline, milestone update, order status change.
- In-app notification bell for all user types.

---

## 7. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, HTML5, CSS3 |
| Backend | Python (Django or Flask) |
| Database | PostgreSQL or MySQL |
| UI/UX Design | Figma |
| Notifications | Firebase Cloud Messaging / Twilio |
| API Style | RESTful APIs |
| Auth | JWT (JSON Web Tokens) |
| Hosting (suggested) | Render, Railway, or Heroku (backend) + Vercel (frontend) |

---

## 8. Database Entities (Overview)

- **User** — id, name, email, password_hash, role, created_at
- **VendorProfile** — user_id, business_name, location, contact
- **FabricItem** — id, vendor_id, name, type, colour, quantity, unit_price, updated_at
- **PriceHistory** — fabric_id, old_price, new_price, changed_at
- **TailorProfile** — user_id, business_name, specialisation, location
- **ClientProfile** — user_id, phone, measurements (JSON)
- **Order** — id, tailor_id, client_id, fabric_id, style_notes, deadline, status, created_at
- **OrderMilestone** — id, order_id, stage_name, is_complete, completed_at
- **FabricRequest** — id, requester_id, vendor_id, fabric_id, quantity, status
- **Notification** — id, user_id, message, type, is_read, created_at

---

## 9. User Flows

### Vendor Flow
`Register → Set up inventory → Set prices → Receive fabric orders → Update stock`

### Tailor Flow
`Register → Browse fabrics → Create client order → Log measurements → Update milestones → Mark as delivered`

### Client Flow
`Register → View tailor's available services → Submit order request → Track progress → Receive completion notification`

---

## 10. Project Scope

### In Scope
- Web application (desktop-first, responsive for mobile browsers).
- Three user dashboards (Vendor, Tailor, Client).
- Inventory management with price history.
- Order workflow management with milestones.
- Client-facing progress tracking.
- Basic fabric ordering between users.
- Automated notifications (email/SMS).
- Secure user authentication.

### Out of Scope
- Native mobile apps (iOS/Android).
- Nationwide logistics or delivery tracking.
- AI-based demand forecasting.
- Payment gateway integration.
- Large-scale ERP functionality.

---

## 11. Development Timeline

| Phase | Weeks | Activities |
|-------|-------|-----------|
| 1. Research & Requirements | 1–2 | Proposal, literature review, user interviews |
| 2. System Design | 3–4 | UML diagrams, ER diagrams, Figma wireframes, API design |
| 3. Backend Development | 5–7 | Database setup, models, REST APIs, auth |
| 4. Frontend Development | 7–9 | React dashboards for all three user types |
| 5. Integration & Notifications | 9–10 | Connect frontend to backend, wire up notifications |
| 6. Testing | 10–11 | Unit tests, integration tests, UAT with real tailors/vendors |
| 7. Documentation & Submission | 11–12 | Final chapters, project report, demo prep |

---

## 12. Success Metrics

- Vendors can update and track fabric stock in under 2 minutes.
- Tailors can manage 10+ simultaneous orders without missing deadlines.
- Clients receive status updates within 1 hour of a milestone change.
- System achieves >90% uptime during demo and evaluation.
- Positive usability ratings from at least 5 real tailor/vendor test users.

---

## 13. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Low adoption by non-tech-savvy vendors/tailors | Simple UI, onboarding tutorial, WhatsApp-style familiarity |
| Unreliable internet connectivity | Lightweight pages, offline-friendly design where possible |
| Scope creep | Strict in-scope/out-of-scope definition; Agile sprints |
| Data loss | Regular database backups; cloud-hosted DB |

---

*Document version 1.0 — Kaosara Obelawo, University of Ibadan, Department of Computer Science*
