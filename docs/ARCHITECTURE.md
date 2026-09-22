# Digital Heroes: Architecture & Technical Design

## 1. Five-Layer Architecture

Digital Heroes enforces a strict 5-layer separation of concerns:

```
┌────────────────────────────────────────────────────────┐
│                   Presentation Layer                   │
│  React Components, Tailwind CSS, shadcn/ui, Pages      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Application Layer                   │
│  Next.js Server Actions, Route Handlers, Zod Validation│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Domain / Business Layer               │
│  Score Service, Draw Engine, Prize Pool, Payout Service│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                   Data Access Layer                    │
│  Supabase Client/Server SDK, Typed DB Queries, RLS     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  Infrastructure Layer                  │
│  Supabase PostgreSQL, Supabase Storage, Stripe API     │
└────────────────────────────────────────────────────────┘
```

### Flow Example: Adding a Score
1. **User Action**: Enters a score in `<ScoreForm />`.
2. **Presentation**: Client validates input shape and submits to `addScoreAction()`.
3. **Application**: `addScoreAction()` validates payload with `scoreInputSchema` (Zod: $1 \le \text{score} \le 45$, valid date).
4. **Auth Guard**: Checks active subscriber session via `requireSubscriber()`.
5. **Domain Service**: Calls `ScoreService.addScore(userId, score, date)`.
6. **Data Access / DB**: Inserts into PostgreSQL `scores` table.
7. **Database Trigger**: `enforce_five_scores_trigger()` checks if user now has $> 5$ scores. If so, automatically prunes the oldest score in the same transaction.
8. **Response**: Returns refreshed 5 scores to client; UI updates optimistically with toast confirmation.

---

## 2. Security & RBAC Model

The system defines 3 distinct privilege levels:

1. **Public / Unauthenticated**:
   - Access to landing page, charity directory, and published past draw results.
2. **Authenticated Member (Non-Subscriber)**:
   - Access to profile management and subscription onboarding flow.
3. **Active Subscriber**:
   - Access to Score Management (5 rolling scores), Charity Allocation ($\ge 10\%$), Draw participation status, Winnings dashboard, and Proof Screenshot upload.
4. **System Administrator**:
   - Access to `/admin`: User directory, Subscription overrides, Charity & Event CRUD, Draw Configuration/Simulation/Publishing, Winner Proof Verification & Payout approval, and Financial/Charity Reports.

All administrative mutations verify `profile.role === 'ADMIN'` on the server side before executing any database mutation. Client-side role claims are never trusted.

---

## 3. Storage Architecture

- **`winner-proofs`**: Private bucket storing winning ticket/game screenshot uploads. Accessible only by the submitting user and administrators.
- **`avatars`**: Public bucket for profile photos.
- **`charity-media`**: Public bucket for charity logos and event photography.

---

## 4. Payment & Webhook Lifecycle

1. User selects a subscription plan (Monthly or Yearly) at `/onboarding/subscription`.
2. `createCheckoutSessionAction()` creates a Stripe Checkout Session with `user_id` in metadata.
3. Upon payment completion, Stripe sends `checkout.session.completed` and `customer.subscription.created` to `/api/stripe/webhook`.
4. The webhook verifies the signature (`STRIPE_WEBHOOK_SECRET`) and upserts the `subscriptions` record in PostgreSQL.
5. User is transitioned to `ACTIVE` subscriber status and redirected to `/onboarding/charity` to pick their charity ($\ge 10\%$ contribution).
