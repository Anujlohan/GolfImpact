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

## 🚀 Quick Start & Scripts

### 1. Installation
```bash
npm install
```

### 2. Development Server
Starts the Next.js dev server at `http://localhost:3000`:
```bash
npm run dev
```

### 3. Production Build
Compiles all static and dynamic routes with zero TypeScript or lint errors:
```bash
npm run build
```

### 4. Run Automated Test Suite
Executes all 11 test suites (51 unit & integration tests) covering scoring, draw engine, rolling queues, direct contributions, and admin KPIs:
```bash
npm test
```

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
