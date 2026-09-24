# Digital Heroes — Play-to-Impact Fair Lottery Platform

A production-ready, transparent lottery protocol that turns golf high scores (1–45 Stableford scale) into life-changing prize pools while funding verified non-profit partners through mandatory pledges and direct charitable contributions.

---

## 📁 Full-Stack Project Structure

The codebase is organized into a clean, modular full-stack architecture with strict separation between **`frontend/`** (UI, routing, styles, components) and **`backend/`** (server actions, lottery calculation engines, services, Supabase database bindings, validations, and automated test suites).

```
digital-heroes/
├── frontend/                               # All client-side code, UI pages, components & styling
│   ├── app/                                # Next.js App Router (pages, layouts, not-found)
│   │   ├── (marketing)/                    # Public landing, How It Works, Charities, Draw Results
│   │   ├── admin/                          # Admin management portal pages
│   │   ├── auth/                           # Login, Signup, Forgot Password pages
│   │   ├── dashboard/                      # Member dashboard, scores, draws, winnings, charity
│   │   ├── onboarding/                     # Subscription & charity onboarding flows
│   │   ├── globals.css                     # Global styles & Tailwind layers
│   │   ├── layout.tsx                      # Root layout
│   │   └── not-found.tsx                   # 404 page
│   ├── components/                         # All UI & feature components
│   │   ├── admin/                          # Admin charts, tables, modals
│   │   ├── charity/                        # Charity cards, selectors, donation modals
│   │   ├── draws/                          # Draw cards, countdowns, simulation previews
│   │   ├── layout/                         # Navbar, Footer, DashboardNav, AdminNav
│   │   ├── marketing/                      # Hero and How It Works sections
│   │   ├── scores/                         # ScoreForm, ScoreTable, RollingScoreNotice
│   │   ├── ui/                             # Base UI components (Button, Card, Badge, Dialog, etc.)
│   │   └── winners/                        # Proof upload form, Winner review modal
│   ├── lib/
│   │   └── utils/                          # Client-side helpers (cn.ts, currency.ts, dates.ts)
│   ├── package.json                        # Frontend dependencies & Next.js scripts
│   ├── tsconfig.json                       # Path aliases (@/*, @frontend/*, @backend/*)
│   ├── next.config.ts                      # Next.js configuration
│   ├── tailwind.config.ts                  # Tailwind theme and content configuration
│   └── postcss.config.mjs                  # PostCSS plugins
│
├── backend/                                # All server-side logic, database, APIs, auth & services
│   ├── actions/                            # Server Actions (scores, charity, draws, admin, auth, checkout, winners)
│   ├── auth/                               # Auth guards, permissions, session management
│   ├── draw-engine/                        # Algorithmic & Random lottery engines, matching, prize pool
│   ├── services/                           # Domain services (ScoreService, DrawService, WinnerService, etc.)
│   ├── stripe/                             # Stripe checkout, webhooks & server utilities
│   ├── supabase/                           # Supabase server/client/admin bindings, migrations, seeds, SQL
│   ├── types/                              # TypeScript models, database schemas & domain interfaces
│   ├── validations/                        # Zod schemas (scores, charity, draw, auth, winner)
│   ├── utils/                              # Backend error classes & server constants
│   ├── middleware.ts                       # Auth & session middleware
│   ├── tests/                              # Unit & integration test suites (51 tests)
│   ├── package.json                        # Backend package definitions
│   └── tsconfig.json                       # Backend TypeScript config
│
├── docs/                                   # PRD, Architecture & Draw algorithm specs
├── package.json                            # Root workspace scripts (npm run dev, npm run build, npm test)
├── tsconfig.json                           # Root TypeScript configuration
├── vitest.config.ts                        # Vitest configuration for unit & integration tests
├── .gitignore                              # Git ignore rules
└── README.md                               # Project documentation & architecture guide
```

---

## 🔐 Environment Variables & Security Configuration

The platform adheres to a zero-leak security architecture. Environment configuration is separated between **Frontend** (browser-safe, public variables) and **Backend** (server-only confidential secrets):

### File Locations

| File | Scope | Description |
| :--- | :--- | :--- |
| **`frontend/.env`** | Client & UI | Contains ONLY variables prefixed with `NEXT_PUBLIC_` that are bundled to the browser. **NO backend secrets allowed here.** |
| **`backend/.env`** | Server Runtime | Contains backend secrets, database connection URI, Stripe private key, and Supabase service role key. |
| **`.env`** (Root) | Monorepo Root | Optional consolidated configuration for local single-terminal development. |
| **`*.env.example`** | Git Tracked | Template files with safe placeholders and instructions. Safe to commit. Actual `.env` files are ignored by `.gitignore`. |

> [!WARNING]
> **Never commit `.env` files or hardcode credentials in source code.** All `.env` files are excluded by `.gitignore`. Always copy from `.env.example` when onboarding.

---

### Variable Reference & Directory Breakdown

#### 1. Frontend (`frontend/.env`)
Create `frontend/.env` by copying `frontend/.env.example`:
```bash
cp frontend/.env.example frontend/.env
```

| Variable | Scope | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public / Browser | Yes | `http://localhost:3000` | Application root URL for client-side routing, auth callbacks, and redirects. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Browser | Yes | `https://<id>.supabase.co` | Supabase project URL (Supabase Dashboard -> Settings -> API). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Browser | Yes | `eyJhbGci...` | Supabase Anonymous Key for client-side Auth and RLS-protected queries. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public / Browser | Optional (Dev) | `pk_test_...` | Stripe Publishable Key for client-side Stripe checkout redirection. |

#### 2. Backend (`backend/.env`)
Create `backend/.env` by copying `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```

| Variable | Scope | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Server | Yes | `development` | Node environment (`development`, `production`, `test`). |
| `PORT` | Server | No | `3000` | Server listening port. |
| `NEXT_PUBLIC_APP_URL` | Server | Yes | `http://localhost:3000` | Base URL used by server actions to build absolute redirect & callback URLs. |
| `NEXT_PUBLIC_SUPABASE_URL` | Server | Yes | `https://<id>.supabase.co` | Supabase endpoint for backend database queries and admin client. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Server | Yes | `eyJhbGci...` | Public client token used for session verification and cookies. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret (Server Only)** | Yes (Live DB) | `eyJhbGci...` | **High Privilege**: Bypasses Supabase Row-Level Security for admin operations and webhooks. |
| `DATABASE_URL` | **Secret (Server Only)** | Optional | `postgresql://postgres:...` | Direct PostgreSQL connection string for database schema migrations and seed scripts. |
| `STRIPE_SECRET_KEY` | **Secret (Server Only)** | Yes (Live Stripe) | `sk_test_...` | Stripe Secret API key for creating Checkout Sessions and managing subscriptions. |
| `STRIPE_WEBHOOK_SECRET` | **Secret (Server Only)** | Yes (Webhooks) | `whsec_...` | Stripe Webhook Signing Secret to verify incoming payloads at `/api/stripe/webhook`. |
| `STRIPE_PRICE_ID_MONTHLY` | Server | Optional | `price_...` | Recurring Stripe Price ID for Monthly Hero Membership plan. |
| `STRIPE_PRICE_ID_YEARLY` | Server | Optional | `price_...` | Recurring Stripe Price ID for Annual Hero Patron plan. |

---

### Example Configuration

#### `frontend/.env`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### `backend/.env`:
```env
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres:your-db-password@db.your-project.supabase.co:5432/postgres

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_monthly_id_placeholder
STRIPE_PRICE_ID_YEARLY=price_yearly_id_placeholder
```

---

## 🚀 Quick Start & Scripts

### 1. Installation
Install all monorepo dependencies across `frontend` and `backend`:
```bash
npm install
```

### 2. Environment Setup
Copy the template files into active `.env` files:
```bash
# Frontend environment
cp frontend/.env.example frontend/.env

# Backend environment
cp backend/.env.example backend/.env

# (Optional) Root unified environment
cp .env.example .env
```

### 3. How to Start the Frontend
Runs the Next.js development server at `http://localhost:3000`:
```bash
# From workspace root:
npm run dev

# Or directly target the frontend workspace:
npm run dev:frontend

# Or from the frontend directory:
cd frontend && npm run dev
```

### 4. How to Start / Test the Backend
The backend runs as Next.js Server Actions, Route Handlers, and domain services within the application server runtime, with dedicated unit and integration testing suites:
```bash
# Run all backend unit & integration test suites (56 tests):
npm test

# Run backend test suites specifically:
npm run test:backend

# Run tests in interactive watch mode:
npm run test:watch
```

### 5. Production Build & Verification
Compiles all static and dynamic routes with zero TypeScript or lint errors:
```bash
npm run build
```

---

## 🛠️ Additional Setup & Services

### Offline / Mock Development Mode
If Supabase or Stripe credentials are not provided or remain set to placeholder values, the application automatically enters **Mock Development Mode**:
- In-memory mock database for authentication, scores, draws, and charities.
- Synthetic Stripe checkout redirect to simulate onboarding without billing.
- Full test suite runs offline with zero external network dependencies.

### Database Setup (Live Supabase)
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in the Supabase Dashboard.
3. Run the initial schema migration from `backend/supabase/migrations/20260101000000_initial_schema.sql`.
4. Run the seed data script from `backend/supabase/seed.sql` for initial plans and verified charities.
5. Create storage buckets from `backend/supabase/storage.sql` (`winner-proofs`, `avatars`, `charity-media`).

### Stripe Webhook Forwarding (Local Development)
To test live Stripe checkout completions and subscriptions locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
Copy the webhook signing secret displayed by the Stripe CLI (`whsec_...`) into `backend/.env` under `STRIPE_WEBHOOK_SECRET`.

---

## 🏆 Core Feature Modules

1. **User Authentication & Role-Based Access Control (`backend/auth/`)**:
   - Secure session handling via `dh_session` cookies and Supabase Auth.
   - Distinct roles: `USER`, `ADMIN`, and active subscriber gating.

2. **Golf Score Submission & Rolling Queue (`backend/services/score.service.ts`)**:
   - Strict 1–45 score range (Stableford).
   - Rolling 5-score queue (adding a 6th score automatically prunes the oldest).
   - Date uniqueness constraint (same date updates existing entry).

3. **Lottery Draw & Simulation Engine (`backend/draw-engine/`)**:
   - Supports both `RANDOM` (cryptographic) and `ALGORITHMIC` (frequency-weighted) number generation.
   - Dynamic active participant score snapshot evaluation.
   - Strict prize pool distribution: 40% (5 matches), 35% (4 matches), 25% (3 matches) with rollovers.

4. **Charity Beneficiaries & Direct Donations (`backend/services/charity.service.ts`)**:
   - Mandatory minimum 10% pledge on lottery winnings.
   - Standalone direct donation modal with positive dollar validation, dynamic receipt calculation, and live goal tracking.

5. **Winner Claims & Proof Verification (`backend/services/winner.service.ts`)**:
   - Automatic `Winner` record generation upon draw publication.
   - Subscriber screenshot proof upload and admin approval/payout workflow.

6. **Admin Operations & Real-time Analytics (`backend/services/analytics.service.ts`)**:
   - Real-time MRR, charity raised, active subscribers, and reserve pool metrics.
