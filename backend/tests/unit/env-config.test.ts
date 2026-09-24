import { describe, it, expect } from 'vitest';
import { getBackendEnv, validateProductionEnv } from '@backend/utils/env';
import { getFrontendEnv } from '@frontend/lib/utils/env';
import { SubscriptionService } from '@/lib/services/subscription.service';
import fs from 'fs';
import path from 'path';

describe('Environment Variable Support & Security Audit', () => {
  it('loads backend environment variables into process.env', () => {
    const env = getBackendEnv();
    expect(env.NEXT_PUBLIC_APP_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBeDefined();
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(env.SUPABASE_SECRET_KEY).toBeDefined();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    expect(typeof env.isMockSupabase).toBe('boolean');
    expect(typeof env.isMockStripe).toBe('boolean');
  });

  it('guarantees frontend env does not expose backend-only secrets', () => {
    const frontendEnv = getFrontendEnv();
    expect(frontendEnv.NEXT_PUBLIC_APP_URL).toBeDefined();
    expect(frontendEnv.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(frontendEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBeDefined();
    expect(frontendEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
    expect(frontendEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).toBeDefined();

    // Verify backend secrets are NOT part of frontendEnv schema
    expect((frontendEnv as any).SUPABASE_SECRET_KEY).toBeUndefined();
    expect((frontendEnv as any).SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
    expect((frontendEnv as any).STRIPE_SECRET_KEY).toBeUndefined();
    expect((frontendEnv as any).STRIPE_WEBHOOK_SECRET).toBeUndefined();
    expect((frontendEnv as any).DATABASE_URL).toBeUndefined();
  });

  it('connects STRIPE_PRICE_ID_MONTHLY and STRIPE_PRICE_ID_YEARLY to subscription plans', async () => {
    const plans = await SubscriptionService.getPlans();
    expect(plans.length).toBeGreaterThanOrEqual(2);

    const monthly = plans.find((p) => p.interval === 'MONTHLY');
    const yearly = plans.find((p) => p.interval === 'YEARLY');

    expect(monthly).toBeDefined();
    expect(yearly).toBeDefined();
    // Verify stripe_price_id is wired to process.env.STRIPE_PRICE_ID_*
    expect(monthly?.stripe_price_id).toBe(process.env.STRIPE_PRICE_ID_MONTHLY || null);
    expect(yearly?.stripe_price_id).toBe(process.env.STRIPE_PRICE_ID_YEARLY || null);
  });

  it('validates production environment detection and placeholder warnings', () => {
    const report = validateProductionEnv();
    expect(typeof report.valid).toBe('boolean');
    expect(Array.isArray(report.missing)).toBe(true);
    expect(Array.isArray(report.warnings)).toBe(true);
  });

  it('verifies that .env.example files exist and do not contain real secrets', () => {
    const rootExample = fs.readFileSync(path.resolve(__dirname, '../../../.env.example'), 'utf-8');
    const backendExample = fs.readFileSync(path.resolve(__dirname, '../../../backend/.env.example'), 'utf-8');
    const frontendExample = fs.readFileSync(path.resolve(__dirname, '../../../frontend/.env.example'), 'utf-8');

    // Root template
    expect(rootExample).toContain('NEXT_PUBLIC_SUPABASE_URL');
    expect(rootExample).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(rootExample).toContain('STRIPE_SECRET_KEY');
    expect(rootExample).toContain('STRIPE_WEBHOOK_SECRET');

    // Frontend template must NOT contain secrets
    expect(frontendExample).toContain('NEXT_PUBLIC_SUPABASE_URL');
    expect(frontendExample).toContain('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
    expect(frontendExample).not.toContain('STRIPE_SECRET_KEY=');
    expect(frontendExample).not.toContain('SUPABASE_SERVICE_ROLE_KEY=');
    expect(frontendExample).not.toContain('STRIPE_WEBHOOK_SECRET=');

    // Backend template must contain secrets
    expect(backendExample).toContain('SUPABASE_SERVICE_ROLE_KEY=');
    expect(backendExample).toContain('STRIPE_SECRET_KEY=');
    expect(backendExample).toContain('DATABASE_URL=');

    // Neither example should contain real API keys or tokens
    const examples = [rootExample, backendExample, frontendExample];
    for (const content of examples) {
      expect(content).not.toMatch(/sk_live_[a-zA-Z0-9]{20,}/);
      expect(content).not.toMatch(/pk_live_[a-zA-Z0-9]{20,}/);
      expect(content).not.toMatch(/eyJh[a-zA-Z0-9_-]{20,}/); // JWT token pattern
    }
  });
});
