# AdSense Approval Implementation Plan

> **For agentic workers:** Execute tasks in order. User requested inline implementation.

**Goal:** Fix AdSense rejection (thin-page ads + low value content) with CMS articles, trust pages, and route-scoped ads.

**Architecture:** Nest articles module (Products pattern); React trust + blog pages; AdSense only on allowlisted routes.

**Tech Stack:** NestJS, TypeORM/MySQL, React/Vite, existing admin JWT + Cloudinary optional for covers.

## Global Constraints

- Match existing Throttle LK dark brand (`#0A0A0A`, `#C0392B`, Bebas Neue / DM Sans).
- Do not load AdSense on checkout/admin.
- Seed articles only when `articles` table is empty.
- Public API returns published articles only.

---

### Task 1: Backend articles module

- Create entity, service, public controller, seed, module
- Wire Admin CRUD + DTOs
- Register in AppModule + AdminModule

### Task 2: AdSense allowlist + cookie banner

- Remove script from `index.html`
- Add `AdSenseLoader` + `CookieNotice`
- Mount in app shell

### Task 3: Trust pages

- `/about`, `/contact`, `/privacy`, `/terms`
- Footer + navbar links

### Task 4: Public blog + Admin articles UI

- `/blog`, `/blog/:slug`
- Admin Articles page + nav
- Routes in `main.tsx`

### Task 5: Motor Garage + sitemap + verify

- Expand Motor Garage copy
- Update `sitemap.xml`
- Build frontend + backend
