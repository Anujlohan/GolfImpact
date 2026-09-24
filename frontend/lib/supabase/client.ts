import { createBrowserClient } from '@supabase/ssr';

export function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return 'https://mock.supabase.co';
  let url = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  return url || 'https://mock.supabase.co';
}

export function getPublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return key.trim().replace(/^['"]|['"]$/g, '') || 'mock-anon-key';
}

export function isSupabaseConfigured(): boolean {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = getPublishableKey();
  return (
    !url.includes('mock.supabase.co') &&
    key !== 'mock-anon-key' &&
    key.length > 10 &&
    !key.includes('your-supabase')
  );
}

/**
 * Frontend Browser Supabase Client
 * Uses exclusively the public Supabase URL and Publishable Key.
 * NEVER exposes the secret key to the browser.
 */
export function createClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = getPublishableKey();

  return createBrowserClient(supabaseUrl, publishableKey);
}
