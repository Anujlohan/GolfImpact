/**
 * Backend Environment Configuration & Validation
 * Centralized access to server-side environment variables and secrets.
 */

export interface BackendEnv {
  NODE_ENV: string;
  PORT: number;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  DATABASE_URL?: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID_MONTHLY?: string;
  STRIPE_PRICE_ID_YEARLY?: string;
  isMockSupabase: boolean;
  isMockStripe: boolean;
  isProduction: boolean;
}

export function getBackendEnv(): BackendEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
  const stripeKey = process.env.STRIPE_SECRET_KEY || '';

  const isMockSupabase = !supabaseUrl || supabaseUrl.includes('mock.supabase.co');
  const isMockStripe =
    !stripeKey ||
    stripeKey.includes('placeholder') ||
    stripeKey.includes('your_') ||
    stripeKey.includes('your-key') ||
    stripeKey.includes('mock');
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: stripeKey,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    STRIPE_PRICE_ID_MONTHLY: process.env.STRIPE_PRICE_ID_MONTHLY,
    STRIPE_PRICE_ID_YEARLY: process.env.STRIPE_PRICE_ID_YEARLY,
    isMockSupabase,
    isMockStripe,
    isProduction,
  };
}

/**
 * Validates environment configuration for live/production deployment.
 * Returns a list of missing or placeholder variables.
 */
export function validateProductionEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  const required = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', val: process.env.NEXT_PUBLIC_SUPABASE_URL, mockCheck: 'mock.supabase.co' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', val: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, mockCheck: 'anon-key' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', val: process.env.SUPABASE_SERVICE_ROLE_KEY, mockCheck: 'service-role-key' },
    { key: 'STRIPE_SECRET_KEY', val: process.env.STRIPE_SECRET_KEY, mockCheck: 'placeholder' },
    { key: 'STRIPE_WEBHOOK_SECRET', val: process.env.STRIPE_WEBHOOK_SECRET, mockCheck: 'whsec_your' },
  ];

  for (const { key, val, mockCheck } of required) {
    if (!val || val.trim() === '') {
      missing.push(key);
    } else if (val.includes(mockCheck) || val.includes('your_key')) {
      warnings.push(`${key} is currently using a default/placeholder value`);
    }
  }

  if (!process.env.DATABASE_URL) {
    warnings.push('DATABASE_URL is not set; direct PostgreSQL migration scripts will require manual connection');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
