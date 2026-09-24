/**
 * Frontend Environment Configuration
 * Safe for client-side consumption. Only variables prefixed with NEXT_PUBLIC_ are accessible.
 */

export interface FrontendEnv {
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
  isMockSupabase: boolean;
}

export function getFrontendEnv(): FrontendEnv {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
  let supabaseUrl = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  if (!supabaseUrl) supabaseUrl = 'https://mock.supabase.co';

  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  const publishableKey = rawKey.trim().replace(/^['"]|['"]$/g, '') || 'mock-anon-key';

  const isMockSupabase =
    !supabaseUrl ||
    supabaseUrl.includes('mock.supabase.co') ||
    publishableKey === 'mock-anon-key' ||
    publishableKey.includes('your-supabase');

  return {
    NEXT_PUBLIC_APP_URL: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim().replace(/^['"]|['"]$/g, ''),
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: publishableKey,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').trim().replace(/^['"]|['"]$/g, ''),
    isMockSupabase,
  };
}
